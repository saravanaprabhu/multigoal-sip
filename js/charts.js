/**
 * Chart visualization functionality
 * Handles creating and updating investment growth charts
 */

/**
 * ChartManager class handles chart creation and updates
 */
export class ChartManager {
    /**
     * Creates a new ChartManager instance
     * @param {Object} calculator - SIPCalculator instance
     * @param {Object} formatter - Formatter instance
     */
    constructor(calculator, formatter) {
        this.calculator = calculator;
        this.formatter = formatter;
        this.chart = null;
    }

    /**
     * Generates year-by-year data for a goal
     * @param {Object} goal - Goal object
     * @returns {Object} Data with years, invested amounts, and future values
     */
    generateGoalData(goal) {
        const inflationAdjustedAmount = this.calculator.calculateInflationAdjustedAmount(
            goal.currentPrice,
            goal.inflationRate,
            goal.years
        );
        
        const stepUpRate = goal.stepUpRate || 0;
        const monthlySIP = this.calculator.calculateMonthlySIP(
            inflationAdjustedAmount,
            goal.years,
            goal.expectedReturn,
            stepUpRate
        );

        const years = [];
        const invested = [];
        const futureValues = [];
        
        const monthlyRate = goal.expectedReturn / 12 / 100;
        const annualStepUp = stepUpRate / 100;
        
        let totalInvested = 0;
        let futureValue = 0;
        let currentSIP = monthlySIP;

        for (let year = 0; year <= goal.years; year++) {
            years.push(year);
            
            if (year === 0) {
                invested.push(0);
                futureValues.push(0);
                continue;
            }

            // Calculate investment for this year
            totalInvested += currentSIP * 12;
            invested.push(Math.round(totalInvested));

            // Calculate future value at this point
            futureValue = 0;
            let tempSIP = monthlySIP;
            
            for (let y = 0; y < year; y++) {
                const monthsRemaining = (year - y) * 12;
                for (let m = 0; m < 12; m++) {
                    const totalMonths = monthsRemaining - m;
                    futureValue += tempSIP * Math.pow(1 + monthlyRate, totalMonths);
                }
                tempSIP *= (1 + annualStepUp);
            }
            
            futureValues.push(Math.round(futureValue));

            // Increase SIP for next year
            currentSIP *= (1 + annualStepUp);
        }

        return { years, invested, futureValues, goalName: goal.name };
    }

    /**
     * Creates or updates the investment growth chart
     * @param {Array<Object>} goals - Array of goal objects
     * @param {string} canvasId - Canvas element ID
     * @param {string} currentTheme - Current theme ('light' or 'dark')
     */
    createChart(goals, canvasId, currentTheme = 'light') {
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        if (!goals || goals.length === 0) {
            return;
        }

        // If multiple goals, show aggregated view
        if (goals.length > 1) {
            this.createAggregatedChart(goals, ctx, currentTheme);
        } else {
            this.createSingleGoalChart(goals[0], ctx, currentTheme);
        }
    }

    /**
     * Creates a chart for a single goal
     * @private
     */
    createSingleGoalChart(goal, ctx, currentTheme) {
        const data = this.generateGoalData(goal);
        const isDark = currentTheme === 'dark';
        
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.years.map(y => `Year ${y}`),
                datasets: [
                    {
                        label: 'Total Invested',
                        data: data.invested,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Future Value',
                        data: data.futureValues,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: `Investment Growth: ${goal.name}`,
                        color: textColor,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += this.formatter.formatCurrency(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: {
                            color: textColor,
                            callback: (value) => {
                                return this.formatter.formatCurrency(value);
                            }
                        },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    /**
     * Creates an aggregated chart for multiple goals
     * @private
     */
    createAggregatedChart(goals, ctx, currentTheme) {
        // Find the maximum years
        const maxYears = Math.max(...goals.map(g => g.years));
        
        const years = Array.from({ length: maxYears + 1 }, (_, i) => i);
        const aggregatedInvested = Array(maxYears + 1).fill(0);
        const aggregatedFutureValues = Array(maxYears + 1).fill(0);

        // Aggregate data from all goals
        goals.forEach(goal => {
            const data = this.generateGoalData(goal);
            
            for (let i = 0; i < data.years.length; i++) {
                const year = data.years[i];
                if (year <= maxYears) {
                    aggregatedInvested[year] += data.invested[i];
                    aggregatedFutureValues[year] += data.futureValues[i];
                }
            }
        });

        const isDark = currentTheme === 'dark';
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => `Year ${y}`),
                datasets: [
                    {
                        label: 'Total Invested',
                        data: aggregatedInvested,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Total Future Value',
                        data: aggregatedFutureValues,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: `Combined Investment Growth - All Goals (${goals.length})`,
                        color: textColor,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += this.formatter.formatCurrency(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: {
                            color: textColor,
                            callback: (value) => {
                                return this.formatter.formatCurrency(value);
                            }
                        },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    /**
     * Destroys the current chart
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    /**
     * Updates chart theme
     * @param {string} theme - New theme ('light' or 'dark')
     * @param {Array<Object>} goals - Array of goal objects
     * @param {string} canvasId - Canvas element ID
     */
    updateTheme(theme, goals, canvasId) {
        this.createChart(goals, canvasId, theme);
    }
}

