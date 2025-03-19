document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const addProductBtn = document.getElementById('add-product');
    const runAlgorithmsBtn = document.getElementById('run-algorithms');
    const productInputs = document.querySelector('.product-inputs');
    
    // Add sample products initially
    addSampleProducts();
    
    // Event listeners
    addProductBtn.addEventListener('click', addProductRow);
    runAlgorithmsBtn.addEventListener('click', runOptimization);
    productInputs.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-product')) {
            removeProductRow(e.target);
        }
    });
    
    // Add a new product row
    function addProductRow() {
        const row = document.createElement('div');
        row.className = 'product-row';
        row.innerHTML = `
            <input type="text" placeholder="Product Name" class="product-name">
            <input type="number" placeholder="Cost ($)" class="product-cost" min="1">
            <input type="number" placeholder="Profit ($)" class="product-profit" min="0">
            <input type="number" placeholder="Priority (1-10)" class="product-priority" min="1" max="10" value="5">
            <button class="remove-product">✕</button>
        `;
        productInputs.appendChild(row);
    }
    
    // Remove a product row
    function removeProductRow(button) {
        const row = button.closest('.product-row');
        if (productInputs.children.length > 1) {
            row.remove();
        } else {
            alert('You need at least one product!');
        }
    }
    
    // Add sample products for demonstration
    function addSampleProducts() {
        const sampleProducts = [
            { name: 'Milk', cost: 50, profit: 20, priority: 8 },
            { name: 'Bread', cost: 30, profit: 15, priority: 7 },
            { name: 'Eggs', cost: 40, profit: 25, priority: 6 },
            { name: 'Cheese', cost: 70, profit: 40, priority: 5 },
            { name: 'Vegetables', cost: 60, profit: 35, priority: 9 }
        ];
        
        // Clear existing rows
        productInputs.innerHTML = '';
        
        // Add sample products
        sampleProducts.forEach(product => {
            const row = document.createElement('div');
            row.className = 'product-row';
            row.innerHTML = `
                <input type="text" placeholder="Product Name" class="product-name" value="${product.name}">
                <input type="number" placeholder="Cost ($)" class="product-cost" min="1" value="${product.cost}">
                <input type="number" placeholder="Profit ($)" class="product-profit" min="0" value="${product.profit}">
                <input type="number" placeholder="Priority (1-10)" class="product-priority" min="1" max="10" value="${product.priority}">
                <button class="remove-product">✕</button>
            `;
            productInputs.appendChild(row);
        });
    }
    
    // Run optimization algorithms
    // Update the runOptimization function to include all greedy variants
    function runOptimization() {
        // Get budget
        const budget = parseInt(document.getElementById('budget').value);
        if (isNaN(budget) || budget <= 0) {
            alert('Please enter a valid budget!');
            return;
        }
        
        // Get products
        const products = [];
        const productRows = document.querySelectorAll('.product-row');
        
        for (const row of productRows) {
            const name = row.querySelector('.product-name').value.trim();
            const cost = parseInt(row.querySelector('.product-cost').value);
            const profit = parseInt(row.querySelector('.product-profit').value);
            const priority = parseInt(row.querySelector('.product-priority').value);
            
            if (!name || isNaN(cost) || isNaN(profit) || isNaN(priority)) {
                alert('Please fill in all product details correctly!');
                return;
            }
            
            products.push({ name, cost, profit, priority });
        }
        
        // Apply ML prediction if enabled
        const useML = document.getElementById('use-ml-prediction')?.checked || false;
        let adjustedProducts = products;
        if (useML) {
            adjustedProducts = adjustPriorityWithPrediction(products);
        }
        
        // Run algorithms
        const knapsackResult = knapsackAlgorithm(adjustedProducts, budget);
        
        // Run all greedy variants
        const greedyByProfitResult = greedyByProfit(adjustedProducts, budget);
        const greedyByExpiryResult = greedyByExpiry(adjustedProducts, budget);
        const greedyByDemandResult = greedyByDemand(adjustedProducts, budget);
        
        // Find the best greedy strategy
        const greedyResults = [greedyByProfitResult, greedyByExpiryResult, greedyByDemandResult];
        const bestGreedyResult = greedyResults.reduce((best, current) => 
            current.totalProfit > best.totalProfit ? current : best, greedyResults[0]);
        
        // Display results
        displayResults('knapsack-result', knapsackResult, useML);
        displayGreedyResults('greedy-result', bestGreedyResult, greedyResults, useML);
        
        // Update comparison table
        updateComparisonTable(knapsackResult, bestGreedyResult);
    }
    
    // New function to display greedy algorithm variants
    function displayGreedyResults(elementId, bestResult, allResults, mlUsed) {
        const element = document.getElementById(elementId);
        const resultContent = element.querySelector('.result-content');
        const executionTimeElement = element.querySelector('.execution-time');
        
        // Get the current budget value for display
        const currentBudget = document.getElementById('budget').value;
        
        // Format the main result content
        let html = `<h3>Best Greedy Strategy: ${getStrategyName(bestResult.strategy)}</h3>`;
        html += `<h3>Total Profit: $${bestResult.totalProfit.toFixed(2)}</h3>`;
        html += `<h3>Budget Used: $${bestResult.budgetUsed.toFixed(2)} of $${currentBudget}</h3>`;
        
        // Add greedy variants comparison
        html += `<div class="greedy-variants">`;
        
        // Add each greedy variant
        for (const result of allResults) {
            const isBest = result.strategy === bestResult.strategy;
            const variantClass = `greedy-variant greedy-by-${result.strategy} ${isBest ? 'best-strategy' : ''}`;
            
            html += `<div class="${variantClass}">
                <h4>${getStrategyName(result.strategy)}</h4>
                <div class="greedy-variant-stats">
                    <div>Profit: <span>$${result.totalProfit.toFixed(2)}</span></div>
                    <div>Budget: <span>$${result.budgetUsed.toFixed(2)}</span></div>
                </div>
                <div class="greedy-variant-products">
                    <ul>`;
            
            for (const product of result.selectedProducts) {
                let productInfo = `${product.name} - $${product.cost}`;
                
                if (result.strategy === 'expiry') {
                    productInfo += `, Expires: ${product.expiryDays} days`;
                } else if (result.strategy === 'demand') {
                    productInfo += `, Demand: ${product.demand}`;
                }
                
                html += `<li>${productInfo}</li>`;
            }
            
            html += `</ul>
                </div>
            </div>`;
        }
        
        html += `</div>`;
        
        // Add chart comparison
        html += `<div class="greedy-comparison-chart">`;
        for (const result of allResults) {
            const percentage = (result.totalProfit / bestResult.totalProfit) * 100;
            const height = Math.max(20, percentage); // Minimum height for visibility
            
            html += `<div class="chart-bar ${result.strategy}" style="height: ${height}%">
                <div class="chart-bar-label">${getStrategyShortName(result.strategy)}</div>
                <div class="chart-bar-value">$${result.totalProfit.toFixed(0)}</div>
            </div>`;
        }
        html += `</div>`;
        
        // Add ML prediction info if used
        if (mlUsed) {
            html += `<div class="ml-prediction-info">
                <h3>Machine Learning Insights</h3>
                <p>Priorities were adjusted based on predicted future demand from historical sales data.</p>
                <p>The algorithm selected products that balance immediate profit with future demand trends.</p>
            </div>`;
        }
        
        // Add efficiency comparison
        html += `<div class="efficiency-comparison">
            <h3>Efficiency Comparison</h3>
            <p>Using this algorithm saved approximately ${calculateTimeSavings(bestResult.selectedProducts.length)} hours compared to manual decision-making.</p>
            <p>Algorithmic optimization increases profit by an estimated ${calculateProfitImprovement(bestResult.totalProfit)}% over traditional restocking methods.</p>
            <p>Labor cost savings: $${calculateLaborSavings(bestResult.selectedProducts.length).toFixed(2)}</p>
        </div>`;
        
        resultContent.innerHTML = html;
        
        // Display execution time
        executionTimeElement.textContent = `Execution Time: ${bestResult.executionTime.toFixed(4)} ms`;
    }
    
    // Helper function to get strategy name
    function getStrategyName(strategy) {
        switch(strategy) {
            case 'profit': return 'Greedy by Profit';
            case 'expiry': return 'Greedy by Expiry Date';
            case 'demand': return 'Greedy by Demand';
            default: return 'Greedy Algorithm';
        }
    }
    
    // Helper function to get short strategy name for chart
    function getStrategyShortName(strategy) {
        switch(strategy) {
            case 'profit': return 'Profit';
            case 'expiry': return 'Expiry';
            case 'demand': return 'Demand';
            default: return 'Greedy';
        }
    }
    
    // Display algorithm results
    function displayResults(elementId, result) {
        const element = document.getElementById(elementId);
        const resultContent = element.querySelector('.result-content');
        const executionTimeElement = element.querySelector('.execution-time');
        
        // Get the current budget value for display
        const currentBudget = document.getElementById('budget').value;
        
        // Format the result content
        let html = `<h3>Total Profit: $${result.totalProfit.toFixed(2)}</h3>`;
        html += `<h3>Budget Used: $${result.budgetUsed.toFixed(2)} of $${currentBudget}</h3>`;
        html += '<h3>Selected Products:</h3>';
        html += '<ul>';
        
        for (const product of result.selectedProducts) {
            html += `<li>${product.name} - Cost: $${product.cost}, Profit: $${product.profit}, Priority: ${product.priority}</li>`;
        }
        
        html += '</ul>';
        
        // Add efficiency comparison with physical restocking
        html += `<div class="efficiency-comparison">
            <h3>Efficiency Comparison</h3>
            <p>Using this algorithm saved approximately ${calculateTimeSavings(result.selectedProducts.length)} hours compared to manual decision-making.</p>
            <p>Algorithmic optimization increases profit by an estimated ${calculateProfitImprovement(result.totalProfit)}% over traditional restocking methods.</p>
            <p>Labor cost savings: $${calculateLaborSavings(result.selectedProducts.length).toFixed(2)}</p>
        </div>`;
        
        resultContent.innerHTML = html;
        
        // Display execution time
        executionTimeElement.textContent = `Execution Time: ${result.executionTime.toFixed(4)} ms`;
    }
    
    // Calculate estimated time savings compared to physical restocking
    function calculateTimeSavings(productCount) {
        // Assume manual decision-making takes ~10 minutes per product
        const manualTimeMinutes = productCount * 10;
        // Algorithm takes milliseconds, effectively 0 hours
        return (manualTimeMinutes / 60).toFixed(1);
    }
    
    // Calculate estimated profit improvement
    function calculateProfitImprovement(algorithmProfit) {
        // Assume manual methods achieve ~70% of optimal profit
        const estimatedManualProfit = algorithmProfit * 0.7;
        const improvement = ((algorithmProfit - estimatedManualProfit) / estimatedManualProfit) * 100;
        return improvement.toFixed(1);
    }
    
    // Calculate labor cost savings
    function calculateLaborSavings(productCount) {
        // Assume $20/hour labor cost
        const hourlyRate = 20;
        const hoursSaved = (productCount * 10) / 60; // 10 minutes per product
        return hoursSaved * hourlyRate;
    }
    
    // Update comparison table
    function updateComparisonTable(knapsackResult, greedyResult) {
        const tableBody = document.querySelector('#comparison-table tbody');
        tableBody.innerHTML = '';
        
        // Determine which algorithm performed better
        const knapsackBetter = knapsackResult.totalProfit >= greedyResult.totalProfit;
        const greedyBetter = greedyResult.totalProfit >= knapsackResult.totalProfit;
        
        // Knapsack row
        const knapsackRow = document.createElement('tr');
        knapsackRow.innerHTML = `
            <td>Knapsack Algorithm</td>
            <td class="${knapsackBetter ? 'better-result' : ''}">$${knapsackResult.totalProfit.toFixed(2)}</td>
            <td>$${knapsackResult.budgetUsed.toFixed(2)}</td>
            <td>${knapsackResult.executionTime.toFixed(4)} ms</td>
            <td>${knapsackResult.selectedProducts.map(p => p.name).join(', ')}</td>
        `;
        
        // Greedy row
        const greedyRow = document.createElement('tr');
        greedyRow.innerHTML = `
            <td>Greedy Algorithm</td>
            <td class="${greedyBetter ? 'better-result' : ''}">$${greedyResult.totalProfit.toFixed(2)}</td>
            <td>$${greedyResult.budgetUsed.toFixed(2)}</td>
            <td>${greedyResult.executionTime.toFixed(4)} ms</td>
            <td>${greedyResult.selectedProducts.map(p => p.name).join(', ')}</td>
        `;
        
        tableBody.appendChild(knapsackRow);
        tableBody.appendChild(greedyRow);
    }
    
    // Simple predictive ML model for demand forecasting
    function predictDemand(productName, historicalData) {
        // Simple moving average prediction
        if (!historicalData || !historicalData[productName] || historicalData[productName].length === 0) {
            return 5; // Default prediction if no data
        }
        
        const data = historicalData[productName];
        // Calculate moving average of last 3 data points
        const sum = data.slice(-3).reduce((acc, val) => acc + val, 0);
        return sum / Math.min(data.length, 3);
    }
    
    // Generate mock historical data for demonstration
    function generateHistoricalData() {
        const products = ['Milk', 'Bread', 'Eggs', 'Cheese', 'Vegetables', 'Fruit', 'Meat', 'Fish', 'Cereal', 'Juice'];
        const data = {};
        
        products.forEach(product => {
            // Generate 10 data points with some randomness but following a trend
            data[product] = Array.from({length: 10}, (_, i) => {
                // Base demand varies by product
                let baseDemand;
                switch(product) {
                    case 'Milk': baseDemand = 80; break;
                    case 'Bread': baseDemand = 90; break;
                    case 'Eggs': baseDemand = 70; break;
                    case 'Cheese': baseDemand = 50; break;
                    case 'Vegetables': baseDemand = 85; break;
                    default: baseDemand = 60;
                }
                
                // Add some randomness and a slight upward trend
                return Math.max(0, baseDemand + (i * 2) + Math.floor(Math.random() * 20) - 10);
            });
        });
        
        return data;
    }
    
    // Adjust product priority based on predicted demand
    function adjustPriorityWithPrediction(products) {
        const historicalData = generateHistoricalData();
        
        return products.map(product => {
            const predictedDemand = predictDemand(product.name, historicalData);
            
            // Normalize predicted demand to a 1-10 scale for priority adjustment
            const demandFactor = Math.min(10, Math.max(1, Math.round(predictedDemand / 10)));
            
            // Blend original priority with predicted demand (70% original, 30% prediction)
            const adjustedPriority = Math.round((product.priority * 0.7) + (demandFactor * 0.3));
            
            return {
                ...product,
                originalPriority: product.priority,
                predictedDemand: predictedDemand,
                priority: adjustedPriority
            };
        });
    }
    
    // Add ML prediction toggle to UI
    function addMLToggle() {
        const inputSection = document.querySelector('.input-section');
        const runButton = document.getElementById('run-algorithms');
        
        const mlToggle = document.createElement('div');
        mlToggle.className = 'ml-toggle';
        mlToggle.innerHTML = `
            <label class="toggle-container">
                <input type="checkbox" id="use-ml-prediction" checked>
                <span class="toggle-label">Use ML Demand Prediction</span>
            </label>
            <div class="ml-info">
                <p>When enabled, product priorities are adjusted based on predicted future demand using historical sales data.</p>
            </div>
        `;
        
        inputSection.insertBefore(mlToggle, runButton);
    }
    
    // Update the runOptimization function to use ML predictions
    const originalRunOptimization = runOptimization;
    runOptimization = function() {
        // Get budget and products as before
        const budget = parseInt(document.getElementById('budget').value);
        if (isNaN(budget) || budget <= 0) {
            alert('Please enter a valid budget!');
            return;
        }
        
        // Get products
        let products = [];
        const productRows = document.querySelectorAll('.product-row');
        
        for (const row of productRows) {
            const name = row.querySelector('.product-name').value.trim();
            const cost = parseInt(row.querySelector('.product-cost').value);
            const profit = parseInt(row.querySelector('.product-profit').value);
            const priority = parseInt(row.querySelector('.product-priority').value);
            
            if (!name || isNaN(cost) || isNaN(profit) || isNaN(priority)) {
                alert('Please fill in all product details correctly!');
                return;
            }
            
            products.push({ name, cost, profit, priority });
        }
        
        // Apply ML prediction if enabled
        const useML = document.getElementById('use-ml-prediction').checked;
        if (useML) {
            products = adjustPriorityWithPrediction(products);
        }
        
        // Run algorithms with potentially adjusted products
        const knapsackResult = knapsackAlgorithm(products, budget);
        const greedyResult = greedyAlgorithm(products, budget);
        
        // Display results
        displayResults('knapsack-result', knapsackResult, useML);
        displayResults('greedy-result', greedyResult, useML);
        
        // Update comparison table
        updateComparisonTable(knapsackResult, greedyResult);
    };
    
    // Update displayResults to show prediction information
    const originalDisplayResults = displayResults;
    displayResults = function(elementId, result, mlUsed) {
        const element = document.getElementById(elementId);
        const resultContent = element.querySelector('.result-content');
        const executionTimeElement = element.querySelector('.execution-time');
        
        // Get the current budget value for display
        const currentBudget = document.getElementById('budget').value;
        
        // Format the result content
        let html = `<h3>Total Profit: $${result.totalProfit.toFixed(2)}</h3>`;
        html += `<h3>Budget Used: $${result.budgetUsed.toFixed(2)} of $${currentBudget}</h3>`;
        html += '<h3>Selected Products:</h3>';
        html += '<ul>';
        
        for (const product of result.selectedProducts) {
            let productInfo = `${product.name} - Cost: $${product.cost}, Profit: $${product.profit}`;
            
            if (mlUsed && product.predictedDemand) {
                productInfo += `, Original Priority: ${product.originalPriority}, `;
                productInfo += `ML-Adjusted Priority: ${product.priority} `;
                productInfo += `(Predicted Demand: ${product.predictedDemand.toFixed(1)})`;
            } else {
                productInfo += `, Priority: ${product.priority}`;
            }
            
            html += `<li>${productInfo}</li>`;
        }
        
        html += '</ul>';
        
        if (mlUsed) {
            html += `<div class="ml-prediction-info">
                <h3>Machine Learning Insights</h3>
                <p>Priorities were adjusted based on predicted future demand from historical sales data.</p>
                <p>The algorithm selected products that balance immediate profit with future demand trends.</p>
            </div>`;
        }
        
        // Add efficiency comparison with physical restocking
        html += `<div class="efficiency-comparison">
            <h3>Efficiency Comparison</h3>
            <p>Using this algorithm saved approximately ${calculateTimeSavings(result.selectedProducts.length)} hours compared to manual decision-making.</p>
            <p>Algorithmic optimization increases profit by an estimated ${calculateProfitImprovement(result.totalProfit)}% over traditional restocking methods.</p>
            <p>Labor cost savings: $${calculateLaborSavings(result.selectedProducts.length).toFixed(2)}</p>
        </div>`;
        
        resultContent.innerHTML = html;
        
        // Display execution time
        executionTimeElement.textContent = `Execution Time: ${result.executionTime.toFixed(4)} ms`;
    };
    
    // Initialize ML toggle
    addMLToggle();
});