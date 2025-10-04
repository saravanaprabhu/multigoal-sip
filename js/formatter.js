/**
 * Formatting utilities
 * Handles data presentation formatting
 */

/**
 * Formatter class for consistent data formatting
 */
export class Formatter {
    /**
     * Creates a new Formatter instance
     */
    constructor() {
        this.currencyFormatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    /**
     * Formats a number as Indian currency
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return this.currencyFormatter.format(amount);
    }

    /**
     * Formats a percentage value
     * @param {number} percentage - The percentage to format
     * @returns {string} Formatted percentage string
     */
    formatPercentage(percentage) {
        return `${percentage}%`;
    }

    /**
     * Formats a year count
     * @param {number} years - Number of years
     * @returns {string} Formatted year string
     */
    formatYears(years) {
        return years === 1 ? '1 year' : `${years} years`;
    }
}

