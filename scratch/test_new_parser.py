import re
import ast

# 1. New Node class
class DoWhileLoopNode:
    def __init__(self, line_num, cond_str, body):
        self.line_num = line_num
        self.cond_str = cond_str.strip()
        self.body = body

# Let's test the String regex replacement
def replace_string_methods(expr, variables):
    # Find any String variable length() calls
    for name, info in variables.items():
        if info['type'] == 'String':
            expr = re.sub(rf'\b{name}\.length\(\)', f'len({name})', expr)
            # Find charAt(idx)
            # We can use regex to replace name.charAt(x) with name[x]
            expr = re.sub(rf'\b{name}\.charAt\((.*?)\)', rf'{name}[\1]', expr)
    return expr

# Let's test Array regex replacement
def replace_array_methods(expr, variables):
    for name, info in variables.items():
        if info['type'].endswith('[]'):
            # replace arr.length with len(arr)
            expr = re.sub(rf'\b{name}\.length\b', f'len({name})', expr)
    return expr

# Test cases
variables = {
    'str': {'type': 'String', 'value': 'Java'},
    'arr': {'type': 'int[]', 'value': [10, 20, 30]}
}

expr1 = 'str.length()'
expr2 = 'str.charAt(0)'
expr3 = 'arr.length'

print("expr1:", replace_string_methods(expr1, variables))
print("expr2:", replace_string_methods(expr2, variables))
print("expr3:", replace_array_methods(expr3, variables))
