import sys
import re
import ast

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
        self.body = body  # list of ASTNode

class WhileLoopNode(ASTNode):
    def __init__(self, line_num, cond_str, body):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.body = body  # list of ASTNode

class IfNode(ASTNode):
    def __init__(self, line_num, cond_str, true_body, false_body=None):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.true_body = true_body  # list of ASTNode
        self.false_body = false_body  # list of ASTNode or None

def extract_block(lines, start_idx):
    brace_count = 0
    found_open = False
    start_search_idx = start_idx
    
    for idx in range(start_idx, len(lines)):
        line = lines[idx]
        if '{' in line:
            brace_count += line.count('{')
            brace_count -= line.count('}')
            found_open = True
            start_search_idx = idx
            break
            
    if not found_open:
        raise Exception(f"Block opening brace '{{' not found starting at line {start_idx + 1}")
        
    end_idx = start_search_idx
    for idx in range(start_search_idx + 1, len(lines)):
        line = lines[idx]
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if brace_count <= 0:
            end_idx = idx
            break
            
    block = lines[start_search_idx : end_idx + 1]
    
    if block:
        first_line = block[0]
        brace_pos = first_line.find('{')
        block[0] = first_line[brace_pos + 1:]
        
        last_line = block[-1]
        r_brace_pos = last_line.rfind('}')
        block[-1] = last_line[:r_brace_pos]
        
    return block, end_idx

def parse_if_chain(lines, idx, start_line_num):
    line = lines[idx]
    line_stripped = line.strip()
    line_num = start_line_num + idx
    
    if_match = re.match(r'^\s*if\s*\((.*?)\)\s*\{?', line_stripped)
    else_if_match = re.match(r'^\s*else\s+if\s*\((.*?)\)\s*\{?', line_stripped)
    
    if if_match:
        cond_str = if_match.group(1)
    elif else_if_match:
        cond_str = else_if_match.group(1)
    else:
        raise Exception(f"Expected 'if' or 'else if' at line {line_num + 1}")
        
    body_lines, end_idx = extract_block(lines, idx)
    true_body = parse_block(body_lines, line_num)
    
    false_body = None
    next_idx = end_idx + 1
    
    while next_idx < len(lines):
        next_line = lines[next_idx].strip()
        if not next_line:
            next_idx += 1
            continue
            
        if next_line.startswith('else'):
            if re.match(r'^\s*else\s+if\s*\(', next_line):
                nested_if, else_end_idx = parse_if_chain(lines, next_idx, start_line_num)
                false_body = [nested_if]
                end_idx = else_end_idx
                break
            else:
                else_body_lines, else_end_idx = extract_block(lines, next_idx)
                else_body = parse_block(else_body_lines, start_line_num + next_idx)
                false_body = else_body
                end_idx = else_end_idx
                break
        else:
            break
            
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
                body_lines, end_idx = extract_block(lines, idx)
                body_nodes = parse_block(body_lines, line_num)
                nodes.append(ForLoopNode(line_num, init_str, cond_str, step_str, body_nodes))
                idx = end_idx + 1
                continue

        # 2. WHILE loop detection
        while_match = re.match(r'^\s*while\s*\((.*?)\)\s*\{?', line_stripped)
        if while_match:
            cond_str = while_match.group(1)
            body_lines, end_idx = extract_block(lines, idx)
            body_nodes = parse_block(body_lines, line_num)
            nodes.append(WhileLoopNode(line_num, cond_str, body_nodes))
            idx = end_idx + 1
            continue

        # 3. IF statement detection
        if_match = re.match(r'^\s*if\s*\((.*?)\)\s*\{?', line_stripped)
        if if_match:
            if_node, end_idx = parse_if_chain(lines, idx, start_line_num)
            nodes.append(if_node)
            idx = end_idx + 1
            continue

        # 4. Standard Statement
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
        elif node.id in ['int', 'float', 'str']:
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
        raise TypeError(f"Unsupported function call: {func_name}")
    raise TypeError(f"Unsupported AST node type: {type(node)}")


class JavaTracer:
    def __init__(self, code):
        # Pre-process code to separate } else and } else if onto separate lines
        code = re.sub(r'\}\s*else\b', '}\nelse', code)
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
        
        # Format function-like calls if needed
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
            vars_copy[k] = {
                'value': str(v['value']),
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
            
        # 1. Variable declaration
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

        # 2. Assignment updates
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

        # 3. Post/Pre Increment/Decrement
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

        # 4. Print statements
        print_match = re.match(r'^System\.out\.print(ln)?\s*\((.*)\)$', stmt)
        if print_match:
            is_ln = print_match.group(1) == 'ln'
            p_expr = print_match.group(2)
            val = self.eval_expr(p_expr, node.line_num)
            p_str = str(val)
            self.console_output += p_str + ('\n' if is_ln else '')
            # If the printed output is empty, describe it as printed newline or printed empty line
            narration_str = "Printed empty line to the console." if p_str == "" else f"Printed output: '{p_str}' to the console."
            self.log_step(node.line_num, narration_str)
            return

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

codes = {
    "nested": """public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}""",
    "branching": """public class Main {
    public static void main(String[] args) {
        int evens = 0;
        int odds = 0;
        for (int i = 1; i <= 6; i++) {
            if (i % 2 == 0) {
                evens++;
            } else {
                odds++;
            }
        }
        System.out.println("Evens: " + evens);
    }
}""",
    "else_if": """public class Main {
    public static void main(String[] args) {
        int x = 3;
        if (x == 1) {
            System.out.println("one");
        } else if (x == 2) {
            System.out.println("two");
        } else {
            System.out.println("other");
        }
    }
}"""
}

for name, code in codes.items():
    print(f"=== TESTING {name} ===")
    tracer = JavaTracer(code)
    res = tracer.trace()
    if 'error' in res:
        print("Error:", res['error'])
    else:
        for idx, s in enumerate(res['steps']):
            print(f"L{s['lineNumber']}: {s['narration']} | vars: {s['variables']} | output: {repr(s['output'])}")
    print()
