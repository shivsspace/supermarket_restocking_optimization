/**
 * Knapsack Algorithm for Supermarket Restock Optimization
 * Time Complexity: O(n × W) where n is the number of products and W is the budget
 */
function knapsackAlgorithm(products, budget) {
    const n = products.length;
    const startTime = performance.now();
    
    // Create a 2D array for dynamic programming
    const dp = Array(n + 1).fill().map(() => Array(budget + 1).fill(0));
    
    // Fill the dp table
    for (let i = 1; i <= n; i++) {
        const product = products[i - 1];
        for (let w = 0; w <= budget; w++) {
            if (product.cost <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - product.cost] + product.profit
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    // Backtrack to find selected products
    const selectedProducts = [];
    let w = budget;
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedProducts.push(products[i - 1]);
            w -= products[i - 1].cost;
        }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        selectedProducts,
        totalProfit: dp[n][budget],
        budgetUsed: selectedProducts.reduce((sum, p) => sum + p.cost, 0),
        executionTime
    };
}

/**
 * Greedy Algorithm for Supermarket Restock Optimization
 * Time Complexity: O(n log n) where n is the number of products
 */
function greedyAlgorithm(products, budget) {
    const startTime = performance.now();
    
    // Sort products by profit-to-cost ratio (descending) and priority (descending)
    const sortedProducts = [...products].sort((a, b) => {
        const ratioA = a.profit / a.cost;
        const ratioB = b.profit / b.cost;
        
        // If ratios are equal, sort by priority
        if (Math.abs(ratioA - ratioB) < 0.001) {
            return b.priority - a.priority;
        }
        
        return ratioB - ratioA;
    });
    
    const selectedProducts = [];
    let remainingBudget = budget;
    
    // Select products greedily
    for (const product of sortedProducts) {
        if (product.cost <= remainingBudget) {
            selectedProducts.push(product);
            remainingBudget -= product.cost;
        }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        selectedProducts,
        totalProfit: selectedProducts.reduce((sum, p) => sum + p.profit, 0),
        budgetUsed: budget - remainingBudget,
        executionTime
    };
}

/**
 * Greedy Algorithm by Profit for Supermarket Restock Optimization
 * Time Complexity: O(n log n) where n is the number of products
 */
function greedyByProfit(products, budget) {
    const startTime = performance.now();
    
    // Sort products by profit (descending)
    const sortedProducts = [...products].sort((a, b) => b.profit - a.profit);
    
    const selectedProducts = [];
    let remainingBudget = budget;
    
    // Select products greedily
    for (const product of sortedProducts) {
        if (product.cost <= remainingBudget) {
            selectedProducts.push(product);
            remainingBudget -= product.cost;
        }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        selectedProducts,
        totalProfit: selectedProducts.reduce((sum, p) => sum + p.profit, 0),
        budgetUsed: budget - remainingBudget,
        executionTime,
        strategy: 'profit'
    };
}

/**
 * Greedy Algorithm by Expiry Date for Supermarket Restock Optimization
 * Time Complexity: O(n log n) where n is the number of products
 */
function greedyByExpiry(products, budget) {
    const startTime = performance.now();
    
    // Generate mock expiry dates if not provided
    const productsWithExpiry = products.map(p => {
        if (!p.expiryDays) {
            // Assign mock expiry days (1-30) inversely related to priority
            // Higher priority items have shorter expiry times
            p.expiryDays = Math.max(1, Math.round(30 - (p.priority * 2.5)));
        }
        return p;
    });
    
    // Sort products by expiry date (ascending)
    const sortedProducts = [...productsWithExpiry].sort((a, b) => a.expiryDays - b.expiryDays);
    
    const selectedProducts = [];
    let remainingBudget = budget;
    
    // Select products greedily
    for (const product of sortedProducts) {
        if (product.cost <= remainingBudget) {
            selectedProducts.push(product);
            remainingBudget -= product.cost;
        }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        selectedProducts,
        totalProfit: selectedProducts.reduce((sum, p) => sum + p.profit, 0),
        budgetUsed: budget - remainingBudget,
        executionTime,
        strategy: 'expiry'
    };
}

/**
 * Greedy Algorithm by Demand for Supermarket Restock Optimization
 * Time Complexity: O(n log n) where n is the number of products
 */
function greedyByDemand(products, budget) {
    const startTime = performance.now();
    
    // Generate mock demand if not provided
    const productsWithDemand = products.map(p => {
        if (!p.demand) {
            // Assign mock demand (1-100) related to priority
            p.demand = p.priority * 10 + Math.floor(Math.random() * 20);
        }
        return p;
    });
    
    // Sort products by demand (descending)
    const sortedProducts = [...productsWithDemand].sort((a, b) => b.demand - a.demand);
    
    const selectedProducts = [];
    let remainingBudget = budget;
    
    // Select products greedily
    for (const product of sortedProducts) {
        if (product.cost <= remainingBudget) {
            selectedProducts.push(product);
            remainingBudget -= product.cost;
        }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        selectedProducts,
        totalProfit: selectedProducts.reduce((sum, p) => sum + p.profit, 0),
        budgetUsed: budget - remainingBudget,
        executionTime,
        strategy: 'demand'
    };
}