/**
 * Main application orchestration
 * Coordinates all modules and handles application lifecycle
 */

import { GoalManager } from './goal.js';
import { SIPCalculator } from './calculator.js';
import { Formatter } from './formatter.js';
import { UIRenderer } from './ui.js';
import { StorageService } from './storage.js';
import { Exporter } from './exporter.js';
import { Importer } from './importer.js';
import { TemplateManager } from './templates.js';
import { ThemeManager } from './theme.js';
import { ChartManager } from './charts.js';

/**
 * Application class that orchestrates all components
 */
class MultiGoalSIPApp {
    /**
     * Creates a new MultiGoalSIPApp instance
     */
    constructor() {
        this.storageService = new StorageService();
        this.themeManager = new ThemeManager(this.storageService);
        this.goalManager = new GoalManager(this.storageService);
        this.calculator = new SIPCalculator();
        this.formatter = new Formatter();
        this.exporter = new Exporter(this.calculator);
        this.importer = new Importer();
        this.templateManager = new TemplateManager();
        this.chartManager = new ChartManager(this.calculator, this.formatter);
        this.ui = new UIRenderer(this.calculator, this.formatter);
        
        this.themeManager.initialize();
        this.checkStorageAvailability();
        this.loadSavedGoals();
        this.initializeEventListeners();
        this.render();
    }

    /**
     * Checks if localStorage is available and shows warning if not
     * @private
     */
    checkStorageAvailability() {
        if (!this.storageService.isAvailable()) {
            console.warn('localStorage is not available. Goals will not be persisted.');
            this.showStorageWarning();
        }
    }

    /**
     * Loads previously saved goals from storage
     * @private
     */
    loadSavedGoals() {
        const loaded = this.goalManager.loadFromStorage();
        if (loaded && this.goalManager.getGoalCount() > 0) {
            console.log(`Loaded ${this.goalManager.getGoalCount()} goal(s) from storage`);
        }
    }

    /**
     * Shows a warning message if storage is not available
     * @private
     */
    showStorageWarning() {
        // This could be enhanced with a UI notification
        // For now, it just logs to console
        console.warn('Data persistence is disabled. Your goals will be lost on page refresh.');
    }

    /**
     * Initializes event listeners for user interactions
     * @private
     */
    initializeEventListeners() {
        this.setupFormSubmission();
        this.setupGoalRemoval();
        this.setupClearAll();
        this.setupExport();
        this.setupImport();
        this.setupTemplates();
        this.setupThemeToggle();
    }

    /**
     * Sets up the goal addition form submission handler
     * @private
     */
    setupFormSubmission() {
        const form = document.getElementById('add-goal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddGoal();
        });
    }

    /**
     * Sets up goal removal click handler
     * @private
     */
    setupGoalRemoval() {
        const goalsListEl = document.getElementById('goals-list');
        goalsListEl.addEventListener('click', (e) => {
            this.handleRemoveGoal(e);
        });
    }

    /**
     * Sets up clear all goals button handler
     * @private
     */
    setupClearAll() {
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.handleClearAll();
            });
        }
    }

    /**
     * Sets up export buttons handlers
     * @private
     */
    setupExport() {
        const exportCSVBtn = document.getElementById('export-csv-btn');
        const exportJSONBtn = document.getElementById('export-json-btn');

        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => {
                this.handleExportCSV();
            });
        }

        if (exportJSONBtn) {
            exportJSONBtn.addEventListener('click', () => {
                this.handleExportJSON();
            });
        }
    }

    /**
     * Sets up import file input handler
     * @private
     */
    setupImport() {
        const importInput = document.getElementById('import-file-input');
        
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                this.handleImport(e);
            });
        }
    }

    /**
     * Sets up template selection handler
     * @private
     */
    setupTemplates() {
        const templateSelect = document.getElementById('template-select');
        const useTemplateBtn = document.getElementById('use-template-btn');
        
        if (templateSelect && useTemplateBtn) {
            // Populate template dropdown
            const templates = this.templateManager.getAllTemplates();
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = `${template.icon} ${template.name}`;
                templateSelect.appendChild(option);
            });

            useTemplateBtn.addEventListener('click', () => {
                this.handleUseTemplate();
            });
        }
    }

    /**
     * Sets up theme toggle button handler
     * @private
     */
    setupThemeToggle() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        
        if (themeToggleBtn) {
            // Update button icon based on current theme
            this.updateThemeToggleIcon();

            themeToggleBtn.addEventListener('click', () => {
                this.handleThemeToggle();
            });
        }
    }

    /**
     * Updates theme toggle button icon
     * @private
     */
    updateThemeToggleIcon() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const currentTheme = this.themeManager.getCurrentTheme();
        
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = currentTheme === 'dark' 
                ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>`;
        }
    }

    /**
     * Handles adding a new goal
     * @private
     */
    handleAddGoal() {
        const formValues = this.ui.getFormValues();
        
        if (!formValues) {
            return;
        }

        this.goalManager.addGoal(
            formValues.name,
            formValues.currentPrice,
            formValues.inflationRate,
            formValues.years,
            formValues.expectedReturn,
            formValues.stepUpRate
        );

        this.ui.resetForm();
        this.render();
    }

    /**
     * Handles removing a goal
     * @private
     * @param {Event} event - Click event
     */
    handleRemoveGoal(event) {
        const removeBtn = event.target.closest('.remove-btn');
        
        if (!removeBtn) {
            return;
        }

        const goalId = parseInt(removeBtn.dataset.id);
        this.goalManager.removeGoal(goalId);
        this.render();
    }

    /**
     * Handles clearing all goals with confirmation
     * @private
     */
    handleClearAll() {
        if (this.goalManager.getGoalCount() === 0) {
            return;
        }

        const confirmed = confirm('Are you sure you want to clear all goals? This action cannot be undone.');
        
        if (confirmed) {
            this.goalManager.clearAllGoals();
            this.render();
        }
    }

    /**
     * Handles exporting goals to CSV
     * @private
     */
    handleExportCSV() {
        const goals = this.goalManager.getAllGoals();
        
        if (goals.length === 0) {
            alert('No goals to export. Add some goals first.');
            return;
        }

        this.exporter.exportCSV(goals);
    }

    /**
     * Handles exporting goals to JSON
     * @private
     */
    handleExportJSON() {
        const goals = this.goalManager.getAllGoals();
        
        if (goals.length === 0) {
            alert('No goals to export. Add some goals first.');
            return;
        }

        this.exporter.exportJSON(goals);
    }

    /**
     * Handles using a goal template
     * @private
     */
    handleUseTemplate() {
        const templateSelect = document.getElementById('template-select');
        const templateId = templateSelect.value;
        
        if (!templateId) {
            return;
        }

        const goalData = this.templateManager.createGoalFromTemplate(templateId);
        
        if (!goalData) {
            alert('Template not found');
            return;
        }

        // Populate form with template values
        document.getElementById('goalName').value = goalData.name;
        document.getElementById('currentPrice').value = goalData.currentPrice;
        document.getElementById('inflationRate').value = goalData.inflationRate;
        document.getElementById('timePeriod').value = goalData.years;
        document.getElementById('expectedReturn').value = goalData.expectedReturn;
        document.getElementById('stepUpRate').value = 0; // Reset step-up rate

        // Reset template selection
        templateSelect.selectedIndex = 0;
    }

    /**
     * Handles theme toggle
     * @private
     */
    handleThemeToggle() {
        this.themeManager.toggleTheme();
        this.updateThemeToggleIcon();
        
        // Update chart theme if goals exist
        const goals = this.goalManager.getAllGoals();
        if (goals.length > 0) {
            const currentTheme = this.themeManager.getCurrentTheme();
            this.chartManager.updateTheme(currentTheme, goals, 'investment-chart');
        }
    }

    /**
     * Handles importing goals from file
     * @private
     * @param {Event} event - Change event from file input
     */
    async handleImport(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }

        try {
            let importedGoals;
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                importedGoals = await this.importer.importCSV(file);
            } else if (fileExtension === 'json') {
                importedGoals = await this.importer.importJSON(file);
            } else {
                throw new Error('Unsupported file format. Please use CSV or JSON files.');
            }

            if (importedGoals.length === 0) {
                alert('No valid goals found in the file.');
                return;
            }

            // Ask user if they want to replace or merge
            const existingCount = this.goalManager.getGoalCount();
            let shouldProceed = true;

            if (existingCount > 0) {
                const action = confirm(
                    `Found ${importedGoals.length} goal(s) in the file.\n\n` +
                    `You have ${existingCount} existing goal(s).\n\n` +
                    `Click OK to ADD imported goals to existing ones.\n` +
                    `Click Cancel to REPLACE existing goals with imported ones.`
                );

                if (!action) {
                    // User wants to replace
                    this.goalManager.clearAllGoals();
                }
            }

            // Add imported goals
            importedGoals.forEach(goal => {
                this.goalManager.addGoal(
                    goal.name,
                    goal.currentPrice,
                    goal.inflationRate,
                    goal.years,
                    goal.expectedReturn,
                    goal.stepUpRate || 0
                );
            });

            this.render();
            alert(`Successfully imported ${importedGoals.length} goal(s)!`);

        } catch (error) {
            alert(`Import failed: ${error.message}`);
            console.error('Import error:', error);
        } finally {
            // Reset file input
            event.target.value = '';
        }
    }

    /**
     * Renders the entire application UI
     * @private
     */
    render() {
        const goals = this.goalManager.getAllGoals();
        this.ui.render(goals);
        this.renderChart(goals);
    }

    /**
     * Renders the investment growth chart
     * @private
     * @param {Array<Object>} goals - Array of goal objects
     */
    renderChart(goals) {
        const chartContainer = document.getElementById('chart-container');
        
        if (!chartContainer) {
            return;
        }

        if (goals.length === 0) {
            chartContainer.classList.add('hidden');
            this.chartManager.destroy();
        } else {
            chartContainer.classList.remove('hidden');
            const currentTheme = this.themeManager.getCurrentTheme();
            this.chartManager.createChart(goals, 'investment-chart', currentTheme);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MultiGoalSIPApp();
});

