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
 */

/**
 * GoalManager class handles goal operations
 */
export class GoalManager {
    /**
     * Creates a new GoalManager instance
     */
    constructor() {
        this.goals = [];
    }

    /**
     * Adds a new goal to the collection
     * @param {string} name - Goal name
     * @param {number} currentPrice - Current market price
     * @param {number} inflationRate - Expected annual inflation rate percentage
     * @param {number} years - Time period in years
     * @param {number} expectedReturn - Expected annual return percentage
     * @returns {Goal} The newly created goal
     */
    addGoal(name, currentPrice, inflationRate, years, expectedReturn) {
        const goal = {
            id: Date.now(),
            name,
            currentPrice,
            inflationRate,
            years,
            expectedReturn
        };
        this.goals.push(goal);
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
        return this.goals.length < initialLength;
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
}

