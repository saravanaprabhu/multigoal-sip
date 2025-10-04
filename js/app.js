/**
 * Main application orchestration
 * Coordinates all modules and handles application lifecycle
 */

import { GoalManager } from './goal.js';
import { SIPCalculator } from './calculator.js';
import { Formatter } from './formatter.js';
import { UIRenderer } from './ui.js';

/**
 * Application class that orchestrates all components
 */
class MultiGoalSIPApp {
    /**
     * Creates a new MultiGoalSIPApp instance
     */
    constructor() {
        this.goalManager = new GoalManager();
        this.calculator = new SIPCalculator();
        this.formatter = new Formatter();
        this.ui = new UIRenderer(this.calculator, this.formatter);
        
        this.initializeEventListeners();
        this.render();
    }

    /**
     * Initializes event listeners for user interactions
     * @private
     */
    initializeEventListeners() {
        this.setupFormSubmission();
        this.setupGoalRemoval();
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

