/**
 * Goal data model and management
 */

/**
 * Represents a financial goal
 * @typedef {Object} Goal
 * @property {number} id - Unique identifier for the goal
 * @property {string} name - Name of the goal
 * @property {number} currentPrice - Current market price of the goal
 * @property {number} inflationRate - Expected annual inflation rate percentage
 * @property {number} years - Time period in years
 * @property {number} expectedReturn - Expected annual return percentage
 * @property {number} [stepUpRate] - Optional annual SIP increase rate percentage
 */

/**
 * GoalManager class handles goal operations
 */
export class GoalManager {
    /**
     * Creates a new GoalManager instance
     * @param {Object} storageService - Optional storage service for persistence
     */
    constructor(storageService = null) {
        this.goals = [];
        this.storageService = storageService;
    }

    /**
     * Loads goals from storage service if available
     * @returns {boolean} True if goals were loaded successfully
     */
    loadFromStorage() {
        if (!this.storageService) {
            return false;
        }

        const loadedGoals = this.storageService.loadGoals();
        this.goals = loadedGoals;
        return true;
    }

    /**
     * Saves goals to storage service if available
     * @private
     * @returns {boolean} True if goals were saved successfully
     */
    saveToStorage() {
        if (!this.storageService) {
            return false;
        }

        return this.storageService.saveGoals(this.goals);
    }

    /**
     * Adds a new goal to the collection
     * @param {string} name - Goal name
     * @param {number} currentPrice - Current market price
     * @param {number} inflationRate - Expected annual inflation rate percentage
     * @param {number} years - Time period in years
     * @param {number} expectedReturn - Expected annual return percentage
     * @param {number} [stepUpRate] - Optional annual SIP increase rate percentage
     * @returns {Goal} The newly created goal
     */
    addGoal(name, currentPrice, inflationRate, years, expectedReturn, stepUpRate = 0) {
        const goal = {
            id: Date.now(),
            name,
            currentPrice,
            inflationRate,
            years,
            expectedReturn,
            stepUpRate: stepUpRate || 0
        };
        this.goals.push(goal);
        this.saveToStorage();
        return goal;
    }

    /**
     * Removes a goal by ID
     * @param {number} goalId - The ID of the goal to remove
     * @returns {boolean} True if goal was removed, false otherwise
     */
    removeGoal(goalId) {
        const initialLength = this.goals.length;
        this.goals = this.goals.filter(goal => goal.id !== goalId);
        const wasRemoved = this.goals.length < initialLength;
        
        if (wasRemoved) {
            this.saveToStorage();
        }
        
        return wasRemoved;
    }

    /**
     * Gets all goals
     * @returns {Goal[]} Array of all goals
     */
    getAllGoals() {
        return [...this.goals];
    }

    /**
     * Gets the total number of goals
     * @returns {number} Total count of goals
     */
    getGoalCount() {
        return this.goals.length;
    }

    /**
     * Clears all goals from the collection and storage
     * @returns {boolean} True if goals were cleared successfully
     */
    clearAllGoals() {
        this.goals = [];
        return this.saveToStorage();
    }
}

