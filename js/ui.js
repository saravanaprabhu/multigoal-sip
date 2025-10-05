/**
 * UI rendering and DOM manipulation
 * Handles all user interface updates following the Single Responsibility Principle
 */

/**
 * UIRenderer class manages all DOM operations
 */
export class UIRenderer {
    /**
     * Creates a new UIRenderer instance
     * @param {Object} calculator - SIPCalculator instance
     * @param {Object} formatter - Formatter instance
     */
    constructor(calculator, formatter) {
        this.calculator = calculator;
        this.formatter = formatter;
        this.initializeDOMElements();
    }

    /**
     * Initializes DOM element references
     * @private
     */
    initializeDOMElements() {
        this.goalsListEl = document.getElementById('goals-list');
        this.totalSipEl = document.getElementById('total-sip');
        this.totalFutureValueEl = document.getElementById('total-future-value');
        this.totalInvestedEl = document.getElementById('total-invested');
        this.totalWealthGainedEl = document.getElementById('total-wealth-gained');
        this.initialPlaceholder = this.goalsListEl.innerHTML;
    }

    /**
     * Renders all goals and updates the summary
     * @param {Array<Object>} goals - Array of goal objects to render
     */
    render(goals) {
        this.renderGoalsList(goals);
        this.updateSummary(goals);
    }

    /**
     * Renders the list of goal cards
     * @private
     * @param {Array<Object>} goals - Array of goal objects
     */
    renderGoalsList(goals) {
        this.goalsListEl.innerHTML = '';

        if (goals.length === 0) {
            this.goalsListEl.innerHTML = this.initialPlaceholder;
            return;
        }

        goals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            this.goalsListEl.appendChild(goalCard);
        });
    }

    /**
     * Creates a single goal card element
     * @private
     * @param {Object} goal - Goal object
     * @returns {HTMLElement} Goal card element
     */
    createGoalCard(goal) {
        const inflationAdjustedAmount = this.calculator.calculateInflationAdjustedAmount(
            goal.currentPrice,
            goal.inflationRate,
            goal.years
        );
        
        const stepUpRate = goal.stepUpRate || 0;
        const monthlySip = this.calculator.calculateMonthlySIP(
            inflationAdjustedAmount, 
            goal.years, 
            goal.expectedReturn,
            stepUpRate
        );

        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg flex items-start space-x-4';
        goalCard.innerHTML = `
            <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <div class="flex-grow">
                <div class="flex justify-between items-center">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${goal.name}</h4>
                    <button data-id="${goal.id}" class="remove-btn text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="text-gray-500 dark:text-gray-400 text-sm space-y-1 mt-1">
                    <p>Current Price: ${this.formatter.formatCurrency(goal.currentPrice)} | Inflation: ${goal.inflationRate}% p.a.</p>
                    <p>Future Target: ${this.formatter.formatCurrency(inflationAdjustedAmount)} in ${goal.years} years @ ${goal.expectedReturn}% return</p>
                    ${stepUpRate > 0 ? `<p class="text-indigo-600 dark:text-indigo-400 font-medium">🔼 Step-up: ${stepUpRate}% annually</p>` : ''}
                </div>
                <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">${stepUpRate > 0 ? 'Initial' : 'Required'} Monthly SIP</span>
                    <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">${this.formatter.formatCurrency(monthlySip)}</span>
                </div>
            </div>
        `;

        return goalCard;
    }

    /**
     * Updates the summary card with aggregated data
     * @private
     * @param {Array<Object>} goals - Array of goal objects
     */
    updateSummary(goals) {
        const summary = this.calculator.calculateSummary(goals);

        this.totalSipEl.textContent = this.formatter.formatCurrency(summary.totalSIP);
        this.totalFutureValueEl.textContent = this.formatter.formatCurrency(summary.totalFutureValue);
        this.totalInvestedEl.textContent = this.formatter.formatCurrency(summary.totalInvested);
        this.totalWealthGainedEl.textContent = this.formatter.formatCurrency(summary.totalWealthGained);
    }

    /**
     * Gets form input values
     * @returns {Object|null} Form values or null if invalid
     */
    getFormValues() {
        const goalName = document.getElementById('goalName').value.trim();
        const currentPrice = parseFloat(document.getElementById('currentPrice').value);
        const inflationRate = parseFloat(document.getElementById('inflationRate').value);
        const timePeriod = parseFloat(document.getElementById('timePeriod').value);
        const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
        const stepUpRate = parseFloat(document.getElementById('stepUpRate').value) || 0;

        if (!goalName || currentPrice <= 0 || inflationRate < 0 || timePeriod <= 0 || expectedReturn <= 0) {
            return null;
        }

        if (stepUpRate < 0) {
            return null;
        }

        return {
            name: goalName,
            currentPrice,
            inflationRate,
            years: timePeriod,
            expectedReturn,
            stepUpRate
        };
    }

    /**
     * Resets the form
     */
    resetForm() {
        document.getElementById('add-goal-form').reset();
    }
}

