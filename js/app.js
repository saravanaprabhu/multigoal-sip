/**
 * Main application orchestration
 * Coordinates all modules and handles application lifecycle
 */

import { GoalManager } from './goal.js';
import { SIPCalculator } from './calculator.js';
import { Formatter } from './formatter.js';
import { UIRenderer } from './ui.js';
import { StorageService } from './storage.js';

/**
 * Application class that orchestrates all components
 */
class MultiGoalSIPApp {
    /**
     * Creates a new MultiGoalSIPApp instance
     */
    constructor() {
        this.storageService = new StorageService();
        this.goalManager = new GoalManager(this.storageService);
        this.calculator = new SIPCalculator();
        this.formatter = new Formatter();
        this.ui = new UIRenderer(this.calculator, this.formatter);
        
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
            formValues.expectedReturn
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
     * Renders the entire application UI
     * @private
     */
    render() {
        const goals = this.goalManager.getAllGoals();
        this.ui.render(goals);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MultiGoalSIPApp();
});

