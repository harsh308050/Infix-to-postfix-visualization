from flask import Flask, request, jsonify, render_template
from algorithms.infix_to_postfix import infix_to_postfix
from algorithms.postfix_to_infix import postfix_to_infix
import os
import webbrowser
from threading import Timer
from flask_cors import CORS

app = Flask(__name__, 
            static_folder='../frontend',
            static_url_path='',
            template_folder='../frontend')

# Enable CORS to allow frontend to communicate with backend
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

# Add the /api prefix to match your frontend fetch call
@app.route('/api/convert', methods=['POST'])
def convert_expression():
    data = request.json
    expression = data.get('expression')
    conversion_type = data.get('conversionType')

    if conversion_type == 'infixToPostfix':
        result, steps = infix_to_postfix(expression)
    elif conversion_type == 'postfixToInfix':
        result, steps = postfix_to_infix(expression)
    else:
        return jsonify({'error': 'Invalid conversion type'}), 400

    return jsonify({'steps': steps, 'result': result})

# Keep the original route for backwards compatibility
@app.route('/convert', methods=['POST'])
def convert_expression_legacy():
    return convert_expression()

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == '__main__':
    # Open browser after a short delay to ensure Flask is running
    Timer(1.0, open_browser).start()
    app.run(debug=True)