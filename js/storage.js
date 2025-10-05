/**
 * Local storage persistence service
 * Handles data persistence using browser's localStorage API
 */

/**
 * StorageService class handles localStorage operations
 */
export class StorageService {
    /**
     * Creates a new StorageService instance
     * @param {string} storageKey - Key used to store data in localStorage
     */
    constructor(storageKey = 'multigoal-sip-goals') {
        this.storageKey = storageKey;
    }

    /**
     * Saves goals to localStorage
     * @param {Array<Object>} goals - Array of goal objects to save
     * @returns {boolean} True if save was successful, false otherwise
     */
    saveGoals(goals) {
        try {
            const goalsJSON = JSON.stringify(goals);
            localStorage.setItem(this.storageKey, goalsJSON);
            return true;
        } catch (error) {
            console.error('Error saving goals to localStorage:', error);
            return false;
        }
    }

    /**
     * Loads goals from localStorage
     * @returns {Array<Object>} Array of goal objects, or empty array if none found
     */
    loadGoals() {
        try {
            const goalsJSON = localStorage.getItem(this.storageKey);
            
            if (!goalsJSON) {
                return [];
            }

            const goals = JSON.parse(goalsJSON);
            
            // Validate that the loaded data is an array
            if (!Array.isArray(goals)) {
                console.warn('Invalid goals data in localStorage, returning empty array');
                return [];
            }

            return goals;
        } catch (error) {
            console.error('Error loading goals from localStorage:', error);
            return [];
        }
    }

    /**
     * Clears all goals from localStorage
     * @returns {boolean} True if clear was successful, false otherwise
     */
    clearGoals() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing goals from localStorage:', error);
            return false;
        }
    }

    /**
     * Checks if localStorage is available and working
     * @returns {boolean} True if localStorage is available, false otherwise
     */
    isAvailable() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Gets the total size of stored goals data in bytes
     * @returns {number} Size in bytes, or 0 if no data
     */
    getStorageSize() {
        try {
            const goalsJSON = localStorage.getItem(this.storageKey);
            return goalsJSON ? new Blob([goalsJSON]).size : 0;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }
}

