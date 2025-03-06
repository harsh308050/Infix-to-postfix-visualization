// This file contains the JavaScript code for the frontend application. It handles user interactions, sends requests to the backend API, processes the response, and updates the DOM dynamically to visualize the conversion steps.

document.addEventListener("DOMContentLoaded", function () {
    const expressionInput = document.getElementById("expression");
    const conversionType = document.getElementById("conversionType");
    const convertButton = document.getElementById("convertButton");
    const resultDisplay = document.getElementById("finalResult");
    const stepsContainer = document.getElementById("stepsContainer");

    let currentSteps = [];
    let currentStep = -1;
    let animationInProgress = false;

    // Use button click event instead of form submission
    convertButton.addEventListener("click", async function () {
        const expression = expressionInput.value.replace(/\s+/g, "");
        const type = conversionType.value;

        if (!expression) {
            alert("Please enter an expression.");
            return;
        }

        resultDisplay.innerHTML = "Processing...";
        stepsContainer.innerHTML = "";

        // Reset animation state
        currentStep = -1;

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/convert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    expression: expression,
                    conversionType: type
                })
            });

            if (!response.ok) {
                throw new Error("Enter Correct Expression");
            }

            const data = await response.json();
            // Fix the data format mismatch for postfixToInfix
            const normalizedSteps = data.steps.map(step => {
                // Check if this is from postfix_to_infix.py (has current_symbol instead of symbol)
                if (step.current_symbol !== undefined) {
                    return {
                        symbol: step.current_symbol,
                        stack: step.stack_state,
                        output: step.output
                    };
                }
                return step;
            });

            displayResult(data.result);
            setupVisualization(expression, normalizedSteps, type);
            currentSteps = normalizedSteps;
        } catch (error) {
            resultDisplay.innerHTML = "Error: " + error.message;
        }
    });

    function displayResult(result) {
        resultDisplay.innerHTML = `${result}`;
    }

    function setupVisualization(expression, steps, conversionType) {
        // Track already processed symbols
        const processedPositions = new Set();

        // Store this data for use in controls
        const visualizationData = {
            expression: expression,
            processedPositions: processedPositions,
            conversionType: conversionType // Store conversion type
        };

        // Clear existing content
        stepsContainer.innerHTML = "";

        // Create visualization container
        const visualizationContainer = document.createElement("div");
        visualizationContainer.className = `visualization-container fade-in-up ${conversionType}`; // Add conversion type as class

        // Create the expression display
        const expressionDisplay = createExpressionDisplay(expression);
        visualizationContainer.appendChild(expressionDisplay);

        // Create the main visualization area with stack and output
        const visualizationArea = document.createElement("div");
        visualizationArea.className = "visualization-area";
        visualizationArea.style.display = "flex";
        visualizationArea.style.justifyContent = "space-around";

        // Create the stack visualization
        const stackVisualization = createStackVisualization();
        visualizationArea.appendChild(stackVisualization);

        // Create the output visualization
        const outputVisualization = createOutputVisualization();
        visualizationArea.appendChild(outputVisualization);

        visualizationContainer.appendChild(visualizationArea);

        // Create navigation controls (only prev/next buttons)
        const controlsContainer = createNavigationControls();
        visualizationContainer.appendChild(controlsContainer);

        stepsContainer.appendChild(visualizationContainer);

        // Pass the visualization data to setupControlListeners
        setupControlListeners(steps, expressionDisplay, visualizationData);
    }

    function createExpressionDisplay(expression) {
        const container = document.createElement("div");
        container.className = "expression-display fade-in-up";
        container.innerHTML = "<div class='expression-title'>Expression:</div>";

        const expressionContainer = document.createElement("div");
        expressionContainer.className = "expression-symbols";
        expressionContainer.style.display = "flex";
        expressionContainer.style.gap = "5px";

        for (let i = 0; i < expression.length; i++) {
            const symbolElement = document.createElement("div");
            symbolElement.className = "symbol";
            symbolElement.textContent = expression[i];
            symbolElement.dataset.index = i;
            expressionContainer.appendChild(symbolElement);
        }

        container.appendChild(expressionContainer);
        return container;
    }

    function createStackVisualization() {
        const container = document.createElement("div");
        container.className = "stack-visualization fade-in-up";

        const title = document.createElement("div");
        title.className = "stack-title";
        title.textContent = "Stack";
        container.appendChild(title);

        const stackContainer = document.createElement("div");
        stackContainer.className = "stack-container";
        stackContainer.id = "stackContainer";
        container.appendChild(stackContainer);

        return container;
    }

    function createOutputVisualization() {
        const container = document.createElement("div");
        container.className = "output-visualization fade-in-up";

        const title = document.createElement("div");
        title.className = "output-title";
        title.textContent = "Output";
        container.appendChild(title);

        const outputContainer = document.createElement("div");
        outputContainer.className = "output-container";
        outputContainer.id = "outputContainer";
        container.appendChild(outputContainer);

        return container;
    }

    function createNavigationControls() {
        const container = document.createElement("div");
        container.className = "navigation-controls fade-in-up";

        const prevButton = document.createElement("button");
        prevButton.className = "control-button";
        prevButton.id = "prevButton";
        prevButton.textContent = "← Previous";
        prevButton.disabled = true;
        container.appendChild(prevButton);

        const nextButton = document.createElement("button");
        nextButton.className = "control-button";
        nextButton.id = "nextButton";
        nextButton.textContent = "Next →";
        container.appendChild(nextButton);

        return container;
    }

    function setupControlListeners(steps, expressionDisplay, visualizationData) {
        const prevButton = document.getElementById("prevButton");
        const nextButton = document.getElementById("nextButton");

        // Track which character positions we've already processed
        let processedPositions = new Set();

        function resetVisualization() {
            // Clear all processed positions when resetting
            processedPositions.clear();
            document.querySelectorAll(".expression-symbols .symbol").forEach(symbol => {
                symbol.classList.remove("active");
                symbol.classList.remove("processed");
            });
            // Also clear the stack and output
            document.getElementById("stackContainer").innerHTML = "";
            document.getElementById("outputContainer").innerHTML = "";
        }

        function updateControls() {
            prevButton.disabled = currentStep <= 0;
            nextButton.disabled = currentStep >= steps.length - 1;
        }

        function animateStep() {
            if (currentStep < 0 || currentStep >= steps.length) {
                return;
            }

            animationInProgress = true;

            // Get the current step data
            const step = steps[currentStep];

            // Update the expression display
            updateExpressionDisplay(step.symbol, visualizationData.conversionType);

            // Update the stack
            updateStackVisualization(step.stack, visualizationData.conversionType);

            // Update the output
            updateOutputVisualization(step.output, visualizationData.conversionType);

            setTimeout(() => {
                animationInProgress = false;
            }, 400);
        }

        function updateExpressionDisplay(currentSymbol, conversionType) {
            // Reset active state first
            const symbols = document.querySelectorAll(".expression-symbols .symbol");
            symbols.forEach(symbol => {
                symbol.classList.remove("active");
            });

            // If empty symbol (like at the end), don't try to highlight
            if (!currentSymbol) return;

            // For postfix to infix conversion, process linearly
            if (conversionType === 'postfixToInfix') {
                // Find the next unprocessed symbol in sequence
                let nextIndex = 0;
                while (nextIndex < symbols.length && processedPositions.has(nextIndex)) {
                    nextIndex++;
                }

                if (nextIndex < symbols.length) {
                    // Mark this position as processed
                    processedPositions.add(nextIndex);
                    symbols[nextIndex].classList.add("active");

                    // Mark all previous symbols as processed
                    for (let i = 0; i < nextIndex; i++) {
                        symbols[i].classList.add("processed");
                    }
                }
            } else {
                // Original logic for infix to postfix
                // Find symbol matching the current one that isn't processed yet
                let positionToHighlight = -1;
                for (let i = 0; i < symbols.length; i++) {
                    if (symbols[i].textContent === currentSymbol && !processedPositions.has(i)) {
                        positionToHighlight = i;
                        break;
                    }
                }

                if (positionToHighlight >= 0) {
                    processedPositions.add(positionToHighlight);
                    symbols[positionToHighlight].classList.add("active");

                    // Mark all symbols before as processed
                    for (let j = 0; j < positionToHighlight; j++) {
                        if (!symbols[j].classList.contains("processed")) {
                            symbols[j].classList.add("processed");
                        }
                    }
                }
            }
        }

        function updateStackVisualization(stack, conversionType) {
            const stackContainer = document.getElementById("stackContainer");

            // For postfix to infix, always use the complex handling method
            const isComplexStack = conversionType === 'postfixToInfix' || (stack && stack.some(item => item.length > 1));

            if (isComplexStack) {
                // Complex handling remains the same
                stackContainer.innerHTML = "";
                if (!stack || stack.length === 0) {
                    return;
                }
                stack.forEach((item, index) => {
                    const stackItem = document.createElement("div");
                    stackItem.className = "stack-item complex-expression";
                    if (item.includes('(') || item.includes(')')) {
                        stackItem.innerHTML = item.replace(/\(/g, '<span class="paren">(</span>')
                            .replace(/\)/g, '<span class="paren">)</span>');
                    } else {
                        stackItem.textContent = item;
                    }
                    stackContainer.appendChild(stackItem);
                    setTimeout(() => {
                        stackItem.classList.add("push");
                    }, 50 * index);
                });
            } else {
                // Simple stack visualization logic
                if (!stack) stack = [];

                // Step 1: Create a map of current stack items
                const existingItems = {};
                Array.from(stackContainer.children).forEach((item, idx) => {
                    existingItems[item.textContent] = {
                        element: item,
                        position: idx
                    };
                });

                // Step 2: Mark items for removal if they're not in the new stack or in wrong position
                const toRemove = [];
                const keepItems = {};

                Array.from(stackContainer.children).forEach((item) => {
                    const content = item.textContent;
                    const newIndex = stack.indexOf(content);

                    if (newIndex === -1) {
                        // Item no longer in stack, mark for removal
                        item.classList.add("pop");
                        toRemove.push(item);
                    } else {
                        // Check if this is the first occurrence and in correct position
                        if (!keepItems[content] && newIndex === Array.from(stackContainer.children).indexOf(item)) {
                            keepItems[content] = true;
                        } else if (!keepItems[content]) {
                            // Keep first occurrence only if we encounter duplicates
                            keepItems[content] = true;
                        } else {
                            // Remove duplicate occurrences
                            item.classList.add("pop");
                            toRemove.push(item);
                        }
                    }
                });

                // Step 3: Remove marked items after animation
                setTimeout(() => {
                    toRemove.forEach(item => {
                        if (stackContainer.contains(item)) {
                            stackContainer.removeChild(item);
                        }
                    });

                    // Step 4: Add any new items or reposition existing ones
                    addNewStackItems();
                }, toRemove.length > 0 ? 300 : 0);

                function addNewStackItems() {
                    const currentItems = Array.from(stackContainer.children).map(item => item.textContent);

                    // Add new items
                    for (let i = 0; i < stack.length; i++) {
                        const val = stack[i];
                        // Check if this item already exists in the correct position
                        if (i >= currentItems.length || currentItems[i] !== val) {
                            // Item doesn't exist or is in wrong position, add it
                            const newItem = document.createElement("div");
                            newItem.className = "stack-item";
                            newItem.textContent = val;

                            // Insert at the correct position
                            if (i < stackContainer.children.length) {
                                stackContainer.insertBefore(newItem, stackContainer.children[i]);
                            } else {
                                stackContainer.appendChild(newItem);
                            }

                            // Apply animation
                            setTimeout(() => {
                                newItem.classList.add("push");
                            }, 50);
                        }
                    }
                }
            }
        }

        function updateOutputVisualization(output, conversionType) {
            const outputContainer = document.getElementById("outputContainer");

            // Clear the container first to ensure clean state
            outputContainer.innerHTML = "";

            // Check if this is a conversion type that needs special handling
            if (conversionType === 'postfixToInfix' || conversionType === 'prefixToInfix') {
                // Create a single output item for the complex expression
                const outputItem = document.createElement("div");
                outputItem.className = "output-item complex-output";
                outputItem.textContent = output || "";
                outputContainer.appendChild(outputItem);

                setTimeout(() => {
                    outputItem.classList.add("appear");
                }, 50);
            }
            // For infix to prefix, we show the reversed output
            else if (conversionType === 'infixToPrefix') {
                // For infix to prefix, show the entire output as it builds
                if (!output) output = "";

                // Create a single output item that updates with each step
                const outputItem = document.createElement("div");
                outputItem.className = "output-item";
                outputItem.textContent = output;
                outputContainer.appendChild(outputItem);

                setTimeout(() => {
                    outputItem.classList.add("appear");
                }, 50);
            }
            // Standard character-by-character output for other conversion types
            else {
                if (!output) output = "";

                // Add each character with animation
                for (let i = 0; i < output.length; i++) {
                    const newOutputItem = document.createElement("div");
                    newOutputItem.className = "output-item";
                    newOutputItem.textContent = output[i];
                    outputContainer.appendChild(newOutputItem);

                    setTimeout(() => {
                        newOutputItem.classList.add("appear");
                    }, 50 * i);
                }
            }
        }

        function nextStep() {
            if (animationInProgress || currentStep >= steps.length - 1) return;

            currentStep++;
            animateStep();
            updateControls();
        }

        function prevStep() {
            if (animationInProgress || currentStep <= 0) return;

            // We need to recompute which symbols have been processed
            currentStep--;
            resetVisualization();

            // Reprocess all steps up to the current step
            processedPositions.clear();
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                // Process this step for highlighting but don't animate
                if (step.symbol) {
                    for (let j = 0; j < expressionDisplay.querySelectorAll('.symbol').length; j++) {
                        if (expressionDisplay.querySelectorAll('.symbol')[j].textContent === step.symbol &&
                            !processedPositions.has(j)) {
                            processedPositions.add(j);
                            break;
                        }
                    }
                }
            }

            animateStep();
            updateControls();
        }

        // Set up event listeners
        prevButton.addEventListener("click", prevStep);
        nextButton.addEventListener("click", nextStep);

        // Initialize controls
        updateControls();
    }
});