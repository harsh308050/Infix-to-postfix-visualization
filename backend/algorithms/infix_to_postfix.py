def infix_to_postfix(expression):
    expression = expression.replace(" ", "")
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}
    output = []
    stack = []
    steps = []
    for symbol in expression:
        if symbol.isalnum():  # If the symbol is an operand
            output.append(symbol)
            steps.append({
                "symbol": symbol,
                "stack": list(stack),
                "output": ''.join(output)
            })
        elif symbol == '(':  # If the symbol is '(', push it to the stack
            stack.append(symbol)
            steps.append({
                "symbol": symbol,
                "stack": list(stack),
                "output": ''.join(output)
            })
        elif symbol == ')':  # If the symbol is ')', pop until '('
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            if stack:
                stack.pop()  # Pop the '(' from the stack
            steps.append({
                "symbol": symbol,
                "stack": list(stack),
                "output": ''.join(output)
            })
        else:  # The symbol is an operator
            while (stack and stack[-1] != '(' and
                   symbol in precedence and stack[-1] in precedence and
                   precedence[symbol] <= precedence[stack[-1]]):
                output.append(stack.pop())
            stack.append(symbol)
            steps.append({
                "symbol": symbol,
                "stack": list(stack),
                "output": ''.join(output)
            })

    while stack:  # Pop all the operators from the stack
        output.append(stack.pop())
        steps.append({
            "symbol": "",
            "stack": list(stack),
            "output": ''.join(output)
        })

    return ''.join(output), steps

# Example usage:
# result, conversion_steps = infix_to_postfix("A+B*(C^D-E)")
# print("Postfix:", result)
# print("Steps:", conversion_steps)