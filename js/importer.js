/**
 * Data import functionality
 * Handles importing goals data from various formats
 */

/**
 * Importer class handles data import operations
 */
export class Importer {
    /**
     * Creates a new Importer instance
     */
    constructor() {
        // No dependencies needed
    }

    /**
     * Parses CSV content and returns goals array
     * @param {string} csvContent - CSV file content
     * @returns {Array<Object>} Array of goal objects
     * @throws {Error} If CSV parsing fails
     */
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV file is empty or invalid');
        }

        // Skip header line
        const dataLines = lines.slice(1);
        const goals = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i].trim();
            if (!line) continue;

            const values = this.parseCSVLine(line);
            
            if (values.length < 5) {
                throw new Error(`Invalid CSV format on line ${i + 2}`);
            }

            const goal = {
                id: Date.now() + i, // Generate unique ID
                name: values[0],
                currentPrice: parseFloat(values[1]),
                inflationRate: parseFloat(values[2]),
                years: parseFloat(values[3]),
                expectedReturn: parseFloat(values[4])
            };

            // Validate goal data
            this.validateGoal(goal, i + 2);
            goals.push(goal);
        }

        return goals;
    }

    /**
     * Parses a single CSV line handling quoted values
     * @private
     * @param {string} line - CSV line to parse
     * @returns {Array<string>} Array of values
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    }

    /**
     * Parses JSON content and returns goals array
     * @param {string} jsonContent - JSON file content
     * @returns {Array<Object>} Array of goal objects
     * @throws {Error} If JSON parsing fails
     */
    parseJSON(jsonContent) {
        let data;
        
        try {
            data = JSON.parse(jsonContent);
        } catch (error) {
            throw new Error('Invalid JSON format: ' + error.message);
        }

        if (!Array.isArray(data)) {
            throw new Error('JSON must contain an array of goals');
        }

        const goals = data.map((goal, index) => {
            // Ensure all required fields exist
            const validatedGoal = {
                id: goal.id || Date.now() + index,
                name: goal.name,
                currentPrice: parseFloat(goal.currentPrice),
                inflationRate: parseFloat(goal.inflationRate),
                years: parseFloat(goal.years),
                expectedReturn: parseFloat(goal.expectedReturn)
            };

            this.validateGoal(validatedGoal, index + 1);
            return validatedGoal;
        });

        return goals;
    }

    /**
     * Validates a goal object
     * @private
     * @param {Object} goal - Goal object to validate
     * @param {number} lineNumber - Line number for error reporting
     * @throws {Error} If validation fails
     */
    validateGoal(goal, lineNumber) {
        if (!goal.name || goal.name.trim() === '') {
            throw new Error(`Line ${lineNumber}: Goal name is required`);
        }

        if (isNaN(goal.currentPrice) || goal.currentPrice <= 0) {
            throw new Error(`Line ${lineNumber}: Invalid current price`);
        }

        if (isNaN(goal.inflationRate) || goal.inflationRate < 0) {
            throw new Error(`Line ${lineNumber}: Invalid inflation rate`);
        }

        if (isNaN(goal.years) || goal.years <= 0) {
            throw new Error(`Line ${lineNumber}: Invalid years`);
        }

        if (isNaN(goal.expectedReturn) || goal.expectedReturn <= 0) {
            throw new Error(`Line ${lineNumber}: Invalid expected return`);
        }
    }

    /**
     * Reads a file and returns its content
     * @param {File} file - File object to read
     * @returns {Promise<string>} Promise that resolves with file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Imports goals from a CSV file
     * @param {File} file - CSV file to import
     * @returns {Promise<Array<Object>>} Promise that resolves with goals array
     */
    async importCSV(file) {
        const content = await this.readFile(file);
        return this.parseCSV(content);
    }

    /**
     * Imports goals from a JSON file
     * @param {File} file - JSON file to import
     * @returns {Promise<Array<Object>>} Promise that resolves with goals array
     */
    async importJSON(file) {
        const content = await this.readFile(file);
        return this.parseJSON(content);
    }
}

