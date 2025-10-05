/**
 * Goal templates functionality
 * Provides common financial goal templates for quick setup
 */

/**
 * TemplateManager class handles goal templates
 */
export class TemplateManager {
    /**
     * Creates a new TemplateManager instance
     */
    constructor() {
        this.templates = this.initializeTemplates();
    }

    /**
     * Initializes default goal templates
     * @private
     * @returns {Array<Object>} Array of template objects
     */
    initializeTemplates() {
        return [
            {
                id: 'child-education',
                name: "Child's Higher Education",
                icon: '🎓',
                description: 'University education in India',
                currentPrice: 2000000,
                inflationRate: 8,
                years: 15,
                expectedReturn: 12
            },
            {
                id: 'house-purchase',
                name: 'Buy a House',
                icon: '🏠',
                description: 'Down payment for home',
                currentPrice: 3000000,
                inflationRate: 6,
                years: 10,
                expectedReturn: 12
            },
            {
                id: 'retirement',
                name: 'Retirement Fund',
                icon: '🌴',
                description: 'Build retirement corpus',
                currentPrice: 10000000,
                inflationRate: 7,
                years: 25,
                expectedReturn: 13
            },
            {
                id: 'car-purchase',
                name: 'Buy a Car',
                icon: '🚗',
                description: 'Mid-range car purchase',
                currentPrice: 1500000,
                inflationRate: 5,
                years: 5,
                expectedReturn: 10
            },
            {
                id: 'wedding',
                name: 'Wedding Expenses',
                icon: '💒',
                description: 'Wedding celebration',
                currentPrice: 2500000,
                inflationRate: 7,
                years: 8,
                expectedReturn: 11
            },
            {
                id: 'vacation',
                name: 'Dream Vacation',
                icon: '✈️',
                description: 'International trip',
                currentPrice: 500000,
                inflationRate: 6,
                years: 3,
                expectedReturn: 9
            },
            {
                id: 'business',
                name: 'Start a Business',
                icon: '💼',
                description: 'Business capital',
                currentPrice: 5000000,
                inflationRate: 7,
                years: 10,
                expectedReturn: 14
            },
            {
                id: 'emergency-fund',
                name: 'Emergency Fund',
                icon: '🏥',
                description: '6 months expenses',
                currentPrice: 500000,
                inflationRate: 6,
                years: 2,
                expectedReturn: 8
            }
        ];
    }

    /**
     * Gets all available templates
     * @returns {Array<Object>} Array of template objects
     */
    getAllTemplates() {
        return [...this.templates];
    }

    /**
     * Gets a template by ID
     * @param {string} templateId - Template ID
     * @returns {Object|null} Template object or null if not found
     */
    getTemplate(templateId) {
        return this.templates.find(t => t.id === templateId) || null;
    }

    /**
     * Creates a goal from a template
     * @param {string} templateId - Template ID
     * @returns {Object|null} Goal object or null if template not found
     */
    createGoalFromTemplate(templateId) {
        const template = this.getTemplate(templateId);
        
        if (!template) {
            return null;
        }

        return {
            name: template.name,
            currentPrice: template.currentPrice,
            inflationRate: template.inflationRate,
            years: template.years,
            expectedReturn: template.expectedReturn
        };
    }

    /**
     * Adds a custom template
     * @param {Object} template - Template object
     * @returns {boolean} True if template was added successfully
     */
    addCustomTemplate(template) {
        if (!template.id || !template.name) {
            return false;
        }

        // Check if template ID already exists
        if (this.getTemplate(template.id)) {
            return false;
        }

        this.templates.push(template);
        return true;
    }
}

