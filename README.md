# Expression Visualizer

A web-based tool to visualize the step-by-step conversion between infix and postfix expressions, helping students and developers understand stack-based parsing algorithms.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Algorithms](#algorithms)

## Overview

Expression Visualizer is an educational tool designed to demonstrate how mathematical expressions are converted between different notations (infix and postfix) using stack-based algorithms. It provides a visual, step-by-step walkthrough of each conversion process.

## Features

- Convert expressions from infix to postfix notation
- Convert expressions from postfix to infix notation  
- Interactive step-by-step visualization
- Real-time display of stack operations
- Animation of each conversion step
- Responsive design for desktop and mobile devices

## How It Works

The application consists of two main components:

### Backend
- A Flask server processes the expression conversion
- Implements two algorithms:
  - `infix_to_postfix`: Converts expressions like `A+B*C` to `ABC*+`
  - `postfix_to_infix`: Converts expressions like `AB+C*` to `(A+B)*C`
- Each algorithm tracks every step of the process, providing data for visualization

### Frontend
- User inputs an expression and selects conversion type
- The frontend sends a request to the backend API
- The visualization shows:
  - The original expression with highlighting to indicate current symbols
  - The stack state at each step of the conversion
  - The output being built incrementally
  - Navigation controls to move through the steps

## Installation

### Prerequisites
- Python 3.6 or higher
- Flask
- flask-cors

### Setup

1. Clone the repository:
git clone <repository-url> cd INFIXTOPOST

2. Install Python dependencies:
pip install flask flask-cors

3. Run the server:
cd backend python app.py


4. The application will automatically open in your default web browser. If not navigate to:
http://127.0.0.1:5000/

## Screenshots

![image](https://github.com/user-attachments/assets/41507193-2df3-4c74-a816-0c2017f3bee9)

![image](https://github.com/user-attachments/assets/03826356-4be3-4637-909b-02f93ee754d1)

![image](https://github.com/user-attachments/assets/32b404c3-fa5a-4b57-8ed3-78d1d6a60b6f)


## Usage

1. Enter an expression in the input field
- For infix to postfix: Enter expressions like `A+B*C` or `(A+B)*C`
- For postfix to infix: Enter expressions like `AB+C*` or `AB+C+`

2. Select the conversion type from the dropdown menu:
- Infix to Postfix
- Postfix to Infix

3. Click the "Go" button to start the conversion

4. View the result and use the navigation buttons to step through the conversion process:
- The highlighted symbol shows the current token being processed
- The stack display shows the current state of the stack
- The output area shows the conversion result as it's built

## Algorithms

### Infix to Postfix
The conversion uses the Shunting Yard algorithm:
1. Scan the infix expression from left to right
2. If the scanned character is an operand, add it to the output
3. If the scanned character is an operator, push it to the stack based on precedence
4. If the scanned character is '(', push it to the stack
5. If the scanned character is ')', pop and add all operators from the stack to the output until '(' is encountered

### Postfix to Infix
The conversion algorithm works as follows:
1. Scan the postfix expression from left to right
2. If the scanned character is an operand, push it to the stack
3. If the scanned character is an operator, pop two operands, create a new expression with the operator between them, and push it back to the stack
