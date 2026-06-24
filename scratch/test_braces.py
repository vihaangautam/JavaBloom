import re
import ast

# Mock Node Classes
class ASTNode:
    pass

class StatementNode(ASTNode):
    def __init__(self, line_num, code_str):
        self.line_num = line_num
        self.code_str = code_str.strip()

class ForLoopNode(ASTNode):
    def __init__(self, line_num, init_str, cond_str, step_str, body):
        self.line_num = line_num
        self.init_str = init_str.strip()
        self.cond_str = cond_str.strip()
        self.step_str = step_str.strip()
        self.body = body

class WhileLoopNode(ASTNode):
    def __init__(self, line_num, cond_str, body):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.body = body

class DoWhileLoopNode(ASTNode):
    def __init__(self, line_num, cond_str, body):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.body = body

class IfNode(ASTNode):
    def __init__(self, line_num, cond_str, true_body, false_body=None):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.true_body = true_body
        self.false_body = false_body

def extract_block(lines, start_idx):
    brace_count = 0
    found_open = False
    start_search_idx = -1
    open_brace_char_idx = -1
    
    for idx in range(start_idx, len(lines)):
        line = lines[idx]
        for char_idx, char in enumerate(line):
            if char == '{':
                found_open = True
                start_search_idx = idx
                open_brace_char_idx = char_idx
                break
        if found_open:
            break
            
    if not found_open:
        raise Exception(f"Block opening brace '{{' not found starting at line {start_idx + 1}")
        
    brace_count = 1
    end_idx = start_search_idx
    matching_brace_char_idx = -1
    
    first_line = lines[start_search_idx]
    for char_idx in range(open_brace_char_idx + 1, len(first_line)):
        char = first_line[char_idx]
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                matching_brace_char_idx = char_idx
                break
                
    if brace_count > 0:
        for idx in range(start_search_idx + 1, len(lines)):
            line = lines[idx]
            for char_idx, char in enumerate(line):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        matching_brace_char_idx = char_idx
                        break
            if brace_count == 0:
                end_idx = idx
                break
                
    if brace_count > 0:
        raise Exception(f"Matching closing brace '}}' not found for block starting at line {start_search_idx + 1}")
        
    block = lines[start_search_idx : end_idx + 1]
    block = list(block)
    
    if len(block) == 1:
        block[0] = first_line[open_brace_char_idx + 1 : matching_brace_char_idx]
    else:
        block[0] = first_line[open_brace_char_idx + 1:]
        last_line = block[-1]
        block[-1] = last_line[:matching_brace_char_idx]
        
    return block, end_idx, matching_brace_char_idx

def get_next_text(lines, start_idx, after_char_idx):
    if start_idx < len(lines):
        rem = lines[start_idx][after_char_idx:].strip()
        if rem:
            if not (rem.startswith('//') or rem.startswith('/*')):
                real_char_idx = lines[start_idx].find(rem, after_char_idx)
                return start_idx, rem, real_char_idx
                
    for idx in range(start_idx + 1, len(lines)):
        line_stripped = lines[idx].strip()
        if not line_stripped:
            continue
        if line_stripped.startswith('//') or line_stripped.startswith('/*') or line_stripped.startswith('*') or line_stripped.endswith('*/'):
            continue
        return idx, line_stripped, lines[idx].find(line_stripped)
        
    return None

def extract_parentheses_content(text, start_word="while"):
    start_pos = text.find(start_word)
    if start_pos == -1:
        return ""
    open_pos = text.find('(', start_pos + len(start_word))
    if open_pos == -1:
        return ""
    paren_count = 1
    for idx in range(open_pos + 1, len(text)):
        char = text[idx]
        if char == '(':
            paren_count += 1
        elif char == ')':
            paren_count -= 1
            if paren_count == 0:
                return text[open_pos + 1 : idx]
    return ""

def parse_if_chain(lines, idx, start_line_num):
    line = lines[idx]
    line_stripped = line.strip()
    line_num = start_line_num + idx
    
    if_match = re.match(r'^\s*if\s*\((.*?)\)\s*\{?', line_stripped)
    else_if_match = re.search(r'\belse\s+if\s*\((.*?)\)\s*\{?', line_stripped)
    
    if if_match:
        cond_str = if_match.group(1)
    elif else_if_match:
        cond_str = else_if_match.group(1)
    else:
        cond_match = re.search(r'if\s*\((.*?)\)', line_stripped)
        if cond_match:
            cond_str = cond_match.group(1)
        else:
            raise Exception(f"Expected 'if' or 'else if' condition at line {line_num + 1}")
        
    body_lines, end_idx, matching_brace_char_idx = extract_block(lines, idx)
    true_body = parse_block(body_lines, line_num)
    
    false_body = None
    next_idx = end_idx
    after_char = matching_brace_char_idx + 1
    
    next_info = get_next_text(lines, next_idx, after_char)
    if next_info:
        next_line_idx, remaining_text, char_idx = next_info
        if remaining_text.startswith('else'):
            if re.match(r'^else\s+if\b', remaining_text):
                nested_if, else_end_idx = parse_if_chain(lines, next_line_idx, start_line_num)
                false_body = [nested_if]
                end_idx = else_end_idx
            else:
                else_body_lines, else_end_idx, _ = extract_block(lines, next_line_idx)
                else_body = parse_block(else_body_lines, start_line_num + next_line_idx)
                false_body = else_body
                end_idx = else_end_idx
                
    return IfNode(line_num, cond_str, true_body, false_body), end_idx

def parse_block(lines, start_line_num):
    nodes = []
    idx = 0
    
    while idx < len(lines):
        line = lines[idx]
        line_stripped = line.strip()
        line_num = start_line_num + idx
        
        if not line_stripped or line_stripped.startswith('//') or line_stripped.startswith('/*') or line_stripped.startswith('*') or line_stripped.endswith('*/'):
            idx += 1
            continue
            
        if any(hdr in line_stripped for hdr in ["class ", "package ", "import ", "public static void main", "void main"]):
            if '{' in line_stripped and not line_stripped.endswith(';'):
                idx += 1
                continue
            idx += 1
            continue
            
        if line_stripped == '}':
            idx += 1
            continue

        # 1. FOR loop detection
        for_match = re.match(r'^\s*for\s*\((.*?)\)\s*\{?', line_stripped)
        if for_match:
            header_parts = for_match.group(1).split(';')
            if len(header_parts) == 3:
                init_str, cond_str, step_str = header_parts
                body_lines, end_idx, _ = extract_block(lines, idx)
                body_nodes = parse_block(body_lines, line_num)
                nodes.append(ForLoopNode(line_num, init_str, cond_str, step_str, body_nodes))
                idx = end_idx + 1
                continue

        # 2. WHILE loop detection
        while_match = re.match(r'^\s*while\s*\((.*?)\)\s*\{?', line_stripped)
        if while_match:
            cond_str = extract_parentheses_content(line_stripped, "while")
            body_lines, end_idx, _ = extract_block(lines, idx)
            body_nodes = parse_block(body_lines, line_num)
            nodes.append(WhileLoopNode(line_num, cond_str, body_nodes))
            idx = end_idx + 1
            continue

        # 3. DO-WHILE loop detection
        do_match = re.match(r'^\s*do\s*\{?', line_stripped)
        if do_match:
            body_lines, end_idx, matching_brace_char_idx = extract_block(lines, idx)
            body_nodes = parse_block(body_lines, line_num)
            
            rem_text = lines[end_idx][matching_brace_char_idx + 1:].strip()
            if not rem_text.startswith('while'):
                next_info = get_next_text(lines, end_idx, matching_brace_char_idx + 1)
                if next_info:
                    _, rem_text, _ = next_info
                    
            cond_str = extract_parentheses_content(rem_text, "while")
            nodes.append(DoWhileLoopNode(line_num, cond_str, body_nodes))
            idx = end_idx + 1
            continue

        # 4. IF statement detection
        if_match = re.match(r'^\s*if\s*\((.*?)\)\s*\{?', line_stripped)
        if if_match:
            if_node, end_idx = parse_if_chain(lines, idx, start_line_num)
            nodes.append(if_node)
            idx = end_idx + 1
            continue

        nodes.append(StatementNode(line_num, line_stripped))
        idx += 1
        
    return nodes

def safe_eval_ast(node):
    if isinstance(node, ast.Expression):
        return safe_eval_ast(node.body)
    elif isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.UnaryOp):
        operand = safe_eval_ast(node.operand)
        if isinstance(node.op, ast.USub):
            return -operand
        elif isinstance(node.op, ast.UAdd):
            return +operand
        elif isinstance(node.op, ast.Not):
            return not operand
        raise TypeError(f"Unsupported unary operator: {node.op}")
    elif isinstance(node, ast.BinOp):
        left = safe_eval_ast(node.left)
        right = safe_eval_ast(node.right)
        if isinstance(node.op, ast.Add):
            if isinstance(left, str) or isinstance(right, str):
                return str(left) + str(right)
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            return left / right
        elif isinstance(node.op, ast.FloorDiv):
            return left // right
        elif isinstance(node.op, ast.Mod):
            return left % right
        elif isinstance(node.op, ast.Pow):
            return left ** right
        raise TypeError(f"Unsupported binary operator: {node.op}")
    elif isinstance(node, ast.Compare):
        left = safe_eval_ast(node.left)
        for op, comp in zip(node.ops, node.comparators):
            right = safe_eval_ast(comp)
            if isinstance(op, ast.Eq):
                if left != right: return False
            elif isinstance(op, ast.NotEq):
                if left == right: return False
            elif isinstance(op, ast.Lt):
                if not (left < right): return False
            elif isinstance(op, ast.LtE):
                if not (left <= right): return False
            elif isinstance(op, ast.Gt):
                if not (left > right): return False
            elif isinstance(op, ast.GtE):
                if not (left >= right): return False
            else:
                raise TypeError(f"Unsupported comparison operator: {op}")
            left = right
        return True
    elif isinstance(node, ast.BoolOp):
        values = [safe_eval_ast(val) for val in node.values]
        if isinstance(node.op, ast.And):
            res = values[0]
            for v in values[1:]:
                res = res and v
            return res
        elif isinstance(node.op, ast.Or):
            res = values[0]
            for v in values[1:]:
                res = res or v
            return res
        raise TypeError(f"Unsupported boolean operator: {node.op}")
    elif isinstance(node, ast.Name):
        if node.id == 'True':
            return True
        elif node.id == 'False':
            return False
        elif node.id in ['int', 'float', 'str', 'len']:
            return node.id
        raise NameError(f"Name '{node.id}' is not defined.")
    elif isinstance(node, ast.Call):
        func_name = safe_eval_ast(node.func)
        args = [safe_eval_ast(arg) for arg in node.args]
        if func_name == 'int':
            return int(args[0])
        elif func_name == 'float':
            return float(args[0])
        elif func_name == 'str':
            return str(args[0])
        elif func_name == 'len':
            return len(args[0])
        raise TypeError(f"Unsupported function call: {func_name}")
    elif isinstance(node, ast.Subscript):
        value = safe_eval_ast(node.value)
        slice_val = safe_eval_ast(node.slice)
        return value[slice_val]
    elif isinstance(node, ast.List):
        return [safe_eval_ast(el) for el in node.elts]
    elif isinstance(node, ast.Tuple):
        return tuple(safe_eval_ast(el) for el in node.elts)
    raise TypeError(f"Unsupported AST node type: {type(node)}")

class JavaTracer:
    def __init__(self, code):
        self.raw_code = code
        self.variables = {}
        self.console_output = ""
        self.steps = []
        self.nodes = []

    def eval_expr(self, expr, line_num):
        expr = expr.strip()
        if not expr:
            return ""
        if expr.endswith(';'):
            expr = expr[:-1]

        # Apply String and Array method translations
        for name, info in self.variables.items():
            if info['type'] == 'String':
                expr = re.sub(rf'\b{name}\.length\(\)', f'len({name})', expr)
                expr = re.sub(rf'\b{name}\.charAt\((.*?)\)', rf'{name}[\1]', expr)
            elif info['type'].endswith('[]'):
                expr = re.sub(rf'\b{name}\.length\b', f'len({name})', expr)

        # Resolve variables replacements
        for name in sorted(self.variables.keys(), key=len, reverse=True):
            var_type = self.variables[name]['type']
            var_val = self.variables[name]['value']
            
            if var_type == 'String':
                repr_val = f'"{var_val}"'
            elif var_type == 'char':
                repr_val = f"'{var_val}'"
            elif var_type == 'boolean':
                repr_val = 'True' if str(var_val).lower() == 'true' else 'False'
            else:
                repr_val = str(var_val)
                
            expr = re.sub(rf'\b{name}\b', repr_val, expr)

        # Replace logical operations
        expr = expr.replace('&&', ' and ').replace('||', ' or ')
        expr = re.sub(r'\btrue\b', 'True', expr, flags=re.I)
        expr = re.sub(r'\bfalse\b', 'False', expr, flags=re.I)
        
        # Replace casts
        expr = re.sub(r'\(double\)\s*', ' float ', expr)
        expr = re.sub(r'\(int\)\s*', ' int ', expr)
        
        expr = re.sub(r'\bfloat\s+([a-zA-Z0-9_\.]+)', r'float(\1)', expr)
        expr = re.sub(r'\bint\s+([a-zA-Z0-9_\.]+)', r'int(\1)', expr)

        try:
            tree = ast.parse(expr, mode='eval')
            return safe_eval_ast(tree)
        except Exception as e:
            raise Exception(f"Line {line_num + 1}: Failed to evaluate Java expression '{expr}': {e}")

    def log_step(self, line_num, narration, changed_var=None):
        vars_copy = {}
        for k, v in self.variables.items():
            val_repr = str(list(v['value'])) if isinstance(v['value'], list) else str(v['value'])
            vars_copy[k] = {
                'value': val_repr,
                'type': v['type'],
                'changed': k == changed_var
            }
        
        self.steps.append({
            'lineNumber': line_num + 1,
            'variables': vars_copy,
            'output': self.console_output,
            'narration': narration
        })

    def run_statement(self, node: StatementNode):
        stmt = node.code_str
        if stmt.endswith(';'):
            stmt = stmt[:-1].strip()
            
        # 1. Array declaration with size: e.g. "int[] arr = new int[3]"
        arr_decl_match = re.match(r'^(int|double|char|boolean|String)\[\]\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1\[(.*?)\]$', stmt)
        if arr_decl_match:
            v_elem_type = arr_decl_match.group(1)
            v_name = arr_decl_match.group(2)
            size_expr = arr_decl_match.group(3)
            size = int(self.eval_expr(size_expr, node.line_num))
            
            default_vals = {'int': 0, 'double': 0.0, 'boolean': False, 'char': '', 'String': ''}
            val = [default_vals.get(v_elem_type, 0)] * size
            
            self.variables[v_name] = { 'type': v_elem_type + "[]", 'value': val }
            self.log_step(node.line_num, f"Declared array {v_name} of size {size}.", changed_var=v_name)
            return

        # 2. Array declaration with values: e.g. "int[] arr = {1, 2, 3}" or "int[] arr = new int[]{1, 2, 3}"
        arr_decl_init_match = re.match(r'^(int|double|char|boolean|String)\[\]\s+([a-zA-Z0-9_]+)\s*=\s*(?:new\s+\1\[\])?\s*\{(.*)\}$', stmt)
        if arr_decl_init_match:
            v_elem_type = arr_decl_init_match.group(1)
            v_name = arr_decl_init_match.group(2)
            expr_list_str = arr_decl_init_match.group(3)
            items = [self.eval_expr(item.strip(), node.line_num) for item in expr_list_str.split(',') if item.strip()]
            
            if v_elem_type == 'int':
                val = [int(x) for x in items]
            elif v_elem_type == 'double':
                val = [float(x) for x in items]
            else:
                val = [str(x) for x in items]
                
            self.variables[v_name] = { 'type': v_elem_type + "[]", 'value': val }
            self.log_step(node.line_num, f"Initialized array {v_name} with values {val}.", changed_var=v_name)
            return

        # 3. Array element assignment: e.g. "arr[0] = 5"
        arr_assign_match = re.match(r'^([a-zA-Z0-9_]+)\[(.*?)\]\s*(\+=|-=|\*=|\/=|%=|=)\s*(.*)$', stmt)
        if arr_assign_match:
            arr_name = arr_assign_match.group(1)
            idx_expr = arr_assign_match.group(2)
            op = arr_assign_match.group(3)
            val_expr = arr_assign_match.group(4)
            
            if arr_name not in self.variables:
                raise Exception(f"Line {node.line_num + 1}: Variable '{arr_name}' is not declared.")
                
            idx = int(self.eval_expr(idx_expr, node.line_num))
            val = self.eval_expr(val_expr, node.line_num)
            
            curr_list = self.variables[arr_name]['value']
            if idx < 0 or idx >= len(curr_list):
                raise Exception(f"Line {node.line_num + 1}: ArrayIndexOutOfBoundsException: Index {idx} out of bounds for length {len(curr_list)}.")
                
            curr_val = curr_list[idx]
            
            if op == '=':
                new_val = val
            elif op == '+=':
                new_val = curr_val + val
            elif op == '-=':
                new_val = curr_val - val
            elif op == '*=':
                new_val = curr_val * val
            elif op == '/=':
                new_val = curr_val / val
            elif op == '%=':
                new_val = curr_val % val
                
            elem_type = self.variables[arr_name]['type'].replace('[]', '')
            if elem_type == 'int':
                new_val = int(new_val)
            elif elem_type == 'double':
                new_val = float(new_val)
                
            curr_list[idx] = new_val
            self.log_step(node.line_num, f"Updated {arr_name}[{idx}] to {new_val}.", changed_var=arr_name)
            return

        # 4. Standard Variable declaration
        decl_match = re.match(r'^(int|double|char|boolean|String)\s+([a-zA-Z0-9_]+)\s*=\s*(.*)$', stmt)
        if decl_match:
            v_type = decl_match.group(1)
            v_name = decl_match.group(2)
            v_expr = decl_match.group(3)
            val = self.eval_expr(v_expr, node.line_num)
            
            if v_type == 'int':
                val = int(val)
            elif v_type == 'double':
                val = float(val)
            elif v_type == 'char':
                val = str(val)[0] if val else ''
            elif v_type == 'boolean':
                val = bool(val)
            else:
                val = str(val)
                
            self.variables[v_name] = { 'type': v_type, 'value': val }
            self.log_step(node.line_num, f"Initialized variable {v_name} to {val} ({v_type}).", changed_var=v_name)
            return

        # 5. Standard Assignment updates
        assign_match = re.match(r'^([a-zA-Z0-9_]+)\s*(\+=|-=|\*=|\/=|%=|=)\s*(.*)$', stmt)
        if assign_match:
            v_name = assign_match.group(1)
            v_op = assign_match.group(2)
            v_expr = assign_match.group(3)
            
            if v_name not in self.variables:
                raise Exception(f"Line {node.line_num + 1}: Variable '{v_name}' is not declared.")
                
            val = self.eval_expr(v_expr, node.line_num)
            curr = self.variables[v_name]['value']
            
            if v_op == '=':
                new_val = val
            elif v_op == '+=':
                new_val = curr + val
            elif v_op == '-=':
                new_val = curr - val
            elif v_op == '*=':
                new_val = curr * val
            elif v_op == '/=':
                new_val = curr / val
            elif v_op == '%=':
                new_val = curr % val
                
            if self.variables[v_name]['type'] == 'int':
                new_val = int(new_val)
            elif self.variables[v_name]['type'] == 'double':
                new_val = float(new_val)

            self.variables[v_name]['value'] = new_val
            op_meanings = {
                '=': f"Assigned {new_val} to {v_name}.",
                '+=': f"Added {val} to {v_name}. {v_name} is now {new_val}.",
                '-=': f"Subtracted {val} from {v_name}. {v_name} is now {new_val}.",
                '*=': f"Multiplied {v_name} by {val}. {v_name} is now {new_val}.",
                '/=': f"Divided {v_name} by {val}. {v_name} is now {new_val}.",
                '%=': f"Modulo result is {new_val}. {v_name} is now {new_val}."
            }
            self.log_step(node.line_num, op_meanings.get(v_op, f"Updated variable {v_name} to {new_val}."), changed_var=v_name)
            return

        # 6. Post/Pre Increment/Decrement
        inc_match = re.match(r'^(\+\+|--)?\s*([a-zA-Z0-9_]+)\s*(\+\+|--)?$', stmt)
        if inc_match:
            op1 = inc_match.group(1)
            v_name = inc_match.group(2)
            op2 = inc_match.group(3)
            
            if v_name not in self.variables:
                raise Exception(f"Line {node.line_num + 1}: Variable '{v_name}' is not declared.")
                
            op = op1 or op2
            curr = self.variables[v_name]['value']
            
            if op == '++':
                new_val = int(curr) + 1
                narration = f"Incremented {v_name} from {curr} to {new_val}."
            elif op == '--':
                new_val = int(curr) - 1
                narration = f"Decremented {v_name} from {curr} to {new_val}."
                
            self.variables[v_name]['value'] = new_val
            self.log_step(node.line_num, narration, changed_var=v_name)
            return

        # 7. Print statements
        print_match = re.match(r'^System\.out\.print(ln)?\s*\((.*)\)$', stmt)
        if print_match:
            is_ln = print_match.group(1) == 'ln'
            p_expr = print_match.group(2)
            val = self.eval_expr(p_expr, node.line_num)
            p_str = str(val)
            self.console_output += p_str + ('\n' if is_ln else '')
            narration_str = "Printed empty line to the console." if p_str == "" else f"Printed output: '{p_str}' to the console."
            self.log_step(node.line_num, narration_str)
            return

        raise Exception(f"Line {node.line_num + 1}: Syntax error or unsupported statement: '{node.code_str}'")

    def run_nodes(self, nodes):
        for node in nodes:
            if isinstance(node, StatementNode):
                self.run_statement(node)
                
            elif isinstance(node, ForLoopNode):
                init_node = StatementNode(node.line_num, node.init_str)
                self.run_statement(init_node)
                
                loop_counter = 0
                while True:
                    loop_counter += 1
                    if loop_counter > 500:
                        raise Exception(f"Line {node.line_num + 1}: Execution limit exceeded. Infinite loop detected!")
                        
                    cond_val = self.eval_expr(node.cond_str, node.line_num)
                    self.log_step(node.line_num, f"Checking loop condition ({node.cond_str}): {cond_val}")
                    
                    if not cond_val:
                        break
                        
                    self.run_nodes(node.body)
                    
                    step_node = StatementNode(node.line_num, node.step_str)
                    self.run_statement(step_node)
                    
            elif isinstance(node, WhileLoopNode):
                loop_counter = 0
                while True:
                    loop_counter += 1
                    if loop_counter > 500:
                        raise Exception(f"Line {node.line_num + 1}: Execution limit exceeded. Infinite loop detected!")
                        
                    cond_val = self.eval_expr(node.cond_str, node.line_num)
                    self.log_step(node.line_num, f"Checking loop condition ({node.cond_str}): {cond_val}")
                    
                    if not cond_val:
                        break
                        
                    self.run_nodes(node.body)

            elif isinstance(node, DoWhileLoopNode):
                loop_counter = 0
                while True:
                    loop_counter += 1
                    if loop_counter > 500:
                        raise Exception(f"Line {node.line_num + 1}: Execution limit exceeded. Infinite loop detected!")
                        
                    self.run_nodes(node.body)
                    
                    cond_val = self.eval_expr(node.cond_str, node.line_num)
                    self.log_step(node.line_num, f"Checking do-while loop condition ({node.cond_str}): {cond_val}")
                    
                    if not cond_val:
                        break
                    
            elif isinstance(node, IfNode):
                cond_val = self.eval_expr(node.cond_str, node.line_num)
                self.log_step(node.line_num, f"Evaluating if-condition ({node.cond_str}): {cond_val}")
                
                if cond_val:
                    self.run_nodes(node.true_body)
                elif node.false_body:
                    self.run_nodes(node.false_body)

    def trace(self):
        lines = self.raw_code.split('\n')
        try:
            self.nodes = parse_block(lines, 0)
            self.run_nodes(self.nodes)
            return {
                'code': self.raw_code,
                'steps': self.steps,
                'finalOutput': self.console_output
            }
        except Exception as e:
            return {
                'error': str(e)
            }

# Let's run a test program that uses do-while, arrays, and strings!
code = """public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30};
        String name = "JVM";
        int i = 0;
        do {
            System.out.println(name.charAt(i));
            arr[i] = arr[i] + 5;
            i++;
        } while (i < name.length());
        
        System.out.println(arr[0]);
        System.out.println(arr.length);
    }
}"""

tracer = JavaTracer(code)
res = tracer.trace()
if 'error' in res:
    print("Error:", res['error'])
else:
    for idx, s in enumerate(res['steps']):
        print(f"L{s['lineNumber']}: {s['narration']} | vars: {s['variables']} | output: {repr(s['output'])}")
