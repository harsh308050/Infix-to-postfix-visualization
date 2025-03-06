def postfix_to_infix(postfix_expression):
    
    postfix_expression = postfix_expression.replace(" ", "")
    stack = []
    steps = []

    for symbol in postfix_expression:
        if symbol.isalnum():  # If the symbol is an operand
            stack.append(symbol)
        else:  # The symbol is an operator
            operand2 = stack.pop()
            operand1 = stack.pop()
            new_expr = f"({operand1} {symbol} {operand2})"
            stack.append(new_expr)

        # Log the current state after processing each symbol
        steps.append({
            'current_symbol': symbol,
            'stack_state': stack.copy(),
            'output': stack[-1] if stack else ''
        })

    return stack[-1] if stack else '', steps

# Example usage
if __name__ == "__main__":
    postfix = "AB+C*"
    result, conversion_steps = postfix_to_infix(postfix)
    print("Infix Expression:", result)
    print("Conversion Steps:", conversion_steps)