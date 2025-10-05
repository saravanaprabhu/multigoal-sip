/**
 * Theme management functionality
 * Handles dark/light mode toggle with persistence
 */

/**
 * ThemeManager class handles theme switching
 */
export class ThemeManager {
    /**
     * Creates a new ThemeManager instance
     * @param {Object} storageService - Storage service for persistence
     */
    constructor(storageService) {
        this.storageService = storageService;
        this.storageKey = 'multigoal-sip-theme';
        this.currentTheme = this.loadTheme();
    }

    /**
     * Loads theme from storage or system preference
     * @private
     * @returns {string} Theme name ('light' or 'dark')
     */
    loadTheme() {
        // Try to load from storage
        if (this.storageService && this.storageService.isAvailable()) {
            try {
                const savedTheme = localStorage.getItem(this.storageKey);
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    return savedTheme;
                }
            } catch (error) {
                console.warn('Error loading theme:', error);
            }
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Saves theme to storage
     * @private
     */
    saveTheme() {
        if (this.storageService && this.storageService.isAvailable()) {
            try {
                localStorage.setItem(this.storageKey, this.currentTheme);
            } catch (error) {
                console.warn('Error saving theme:', error);
            }
        }
    }

    /**
     * Applies theme to document
     * @private
     */
    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    /**
     * Initializes theme on page load
     */
    initialize() {
        this.applyTheme();
    }

    /**
     * Toggles between light and dark themes
     * @returns {string} New theme name
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        return this.currentTheme;
    }

    /**
     * Gets current theme
     * @returns {string} Current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Sets theme explicitly
     * @param {string} theme - Theme name ('light' or 'dark')
     * @returns {boolean} True if theme was set successfully
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            return false;
        }

        this.currentTheme = theme;
        this.applyTheme();
        this.saveTheme();
        return true;
    }
}

