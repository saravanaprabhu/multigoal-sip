/**
 * Data export functionality
 * Handles exporting goals data to various formats
 */

/**
 * Exporter class handles data export operations
 */
export class Exporter {
    /**
     * Creates a new Exporter instance
     * @param {Object} calculator - SIPCalculator instance for calculations
     */
    constructor(calculator) {
        this.calculator = calculator;
    }

    /**
     * Exports goals to CSV format
     * @param {Array<Object>} goals - Array of goal objects
     * @returns {string} CSV formatted string
     */
    exportToCSV(goals) {
        if (!goals || goals.length === 0) {
            return '';
        }

        // CSV headers
        const headers = [
            'Goal Name',
            'Current Price (₹)',
            'Inflation Rate (%)',
            'Years',
            'Expected Return (%)',
            'Step-up Rate (%)',
            'Future Target (₹)',
            'Monthly SIP Required (₹)',
            'Total Investment (₹)',
            'Wealth Gain (₹)'
        ];

        // Create CSV rows
        const rows = goals.map(goal => {
            const stepUpRate = goal.stepUpRate || 0;
            const futureValue = this.calculator.calculateInflationAdjustedAmount(
                goal.currentPrice,
                goal.inflationRate,
                goal.years
            );
            const monthlySIP = this.calculator.calculateMonthlySIP(
                futureValue,
                goal.years,
                goal.expectedReturn,
                stepUpRate
            );
            const totalInvestment = this.calculator.calculateTotalInvestment(monthlySIP, goal.years, stepUpRate);
            const wealthGain = this.calculator.calculateWealthGain(futureValue, totalInvestment);

            return [
                this.escapeCSV(goal.name),
                goal.currentPrice,
                goal.inflationRate,
                goal.years,
                goal.expectedReturn,
                stepUpRate,
                futureValue,
                monthlySIP,
                totalInvestment,
                wealthGain
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Exports goals to JSON format
     * @param {Array<Object>} goals - Array of goal objects
     * @returns {string} JSON formatted string
     */
    exportToJSON(goals) {
        return JSON.stringify(goals, null, 2);
    }

    /**
     * Downloads data as a file
     * @param {string} content - File content
     * @param {string} filename - Name of the file
     * @param {string} mimeType - MIME type of the file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Exports and downloads goals as CSV
     * @param {Array<Object>} goals - Array of goal objects
     */
    exportCSV(goals) {
        const csv = this.exportToCSV(goals);
        if (csv) {
            const timestamp = new Date().toISOString().split('T')[0];
            this.downloadFile(csv, `sip-goals-${timestamp}.csv`, 'text/csv');
        }
    }

    /**
     * Exports and downloads goals as JSON
     * @param {Array<Object>} goals - Array of goal objects
     */
    exportJSON(goals) {
        const json = this.exportToJSON(goals);
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(json, `sip-goals-${timestamp}.json`, 'application/json');
    }

    /**
     * Escapes special characters in CSV values
     * @private
     * @param {string} value - Value to escape
     * @returns {string} Escaped value
     */
    escapeCSV(value) {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}

