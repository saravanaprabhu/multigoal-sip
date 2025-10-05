/**
 * Unit tests for ThemeManager
 */

import { ThemeManager } from '../../js/theme.js';
import { 
    assertEqual, 
    assertTrue,
    assertContains
} from '../test-runner.js';
import { MockHelper } from '../test-runner.js';

export function runThemeTests(runner) {
    runner.describe('ThemeManager', () => {
        let themeManager;
        let mockStorage;
        let mockLocalStorage;
        let originalLocalStorage;
        let originalMatchMedia;

        const beforeEach = () => {
            // Save originals
            originalLocalStorage = window.localStorage;
            originalMatchMedia = window.matchMedia;
            
            // Create mock localStorage
            mockLocalStorage = MockHelper.mockLocalStorage();
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true,
                configurable: true
            });
            
            // Create mock matchMedia
            window.matchMedia = (query) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                addEventListener: () => {},
                removeEventListener: () => {}
            });
            
            // Create mock storage service
            mockStorage = {
                saveGoals: MockHelper.mockFunction(),
                loadGoals: MockHelper.mockFunction(),
                clearGoals: MockHelper.mockFunction(),
                isAvailable: MockHelper.mockFunction()
            };
            mockStorage.isAvailable.returnValue = true;
            
            themeManager = new ThemeManager(mockStorage);
        };

        const afterEach = () => {
            // Restore originals
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true,
                configurable: true
            });
            window.matchMedia = originalMatchMedia;
            
            // Clean up document class
            document.documentElement.classList.remove('dark');
        };

        runner.it('should create theme manager instance', () => {
            beforeEach();
            assertEqual(themeManager instanceof ThemeManager, true);
            afterEach();
        });

        runner.describe('initialize', () => {
            runner.it('should apply saved theme from localStorage', () => {
                beforeEach();
                mockLocalStorage.setItem('multigoal-sip-theme', 'dark');
                
                themeManager.initialize();
                assertTrue(document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should use system preference if no saved theme', () => {
                beforeEach();
                // matchMedia returns dark preference
                themeManager.initialize();
                assertTrue(document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should default to light theme if no preference', () => {
                beforeEach();
                // Mock matchMedia to return light preference
                window.matchMedia = (query) => ({
                    matches: false,
                    media: query,
                    addEventListener: () => {},
                    removeEventListener: () => {}
                });
                
                const manager = new ThemeManager(mockStorage);
                manager.initialize();
                
                assertTrue(!document.documentElement.classList.contains('dark'));
                afterEach();
            });
        });

        runner.describe('setTheme', () => {
            runner.it('should set dark theme', () => {
                beforeEach();
                themeManager.setTheme('dark');
                assertTrue(document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should set light theme', () => {
                beforeEach();
                document.documentElement.classList.add('dark');
                themeManager.setTheme('light');
                assertTrue(!document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should save theme to localStorage', () => {
                beforeEach();
                themeManager.setTheme('dark');
                const stored = mockLocalStorage.getItem('multigoal-sip-theme');
                assertEqual(stored, 'dark');
                afterEach();
            });

            runner.it('should handle invalid theme gracefully', () => {
                beforeEach();
                // Should default to light
                themeManager.setTheme('invalid');
                assertTrue(!document.documentElement.classList.contains('dark'));
                afterEach();
            });
        });

        runner.describe('toggleTheme', () => {
            runner.it('should toggle from light to dark', () => {
                beforeEach();
                themeManager.setTheme('light');
                themeManager.toggleTheme();
                assertTrue(document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should toggle from dark to light', () => {
                beforeEach();
                themeManager.setTheme('dark');
                themeManager.toggleTheme();
                assertTrue(!document.documentElement.classList.contains('dark'));
                afterEach();
            });

            runner.it('should save toggled theme', () => {
                beforeEach();
                themeManager.setTheme('light');
                themeManager.toggleTheme();
                const stored = mockLocalStorage.getItem('multigoal-sip-theme');
                assertEqual(stored, 'dark');
                afterEach();
            });
        });

        runner.describe('getCurrentTheme', () => {
            runner.it('should return current theme', () => {
                beforeEach();
                themeManager.setTheme('dark');
                assertEqual(themeManager.getCurrentTheme(), 'dark');
                afterEach();
            });

            runner.it('should return light by default', () => {
                beforeEach();
                assertEqual(themeManager.getCurrentTheme(), 'light');
                afterEach();
            });

            runner.it('should reflect theme after toggle', () => {
                beforeEach();
                themeManager.setTheme('light');
                assertEqual(themeManager.getCurrentTheme(), 'light');
                
                themeManager.toggleTheme();
                assertEqual(themeManager.getCurrentTheme(), 'dark');
                afterEach();
            });
        });

        runner.describe('loadTheme', () => {
            runner.it('should load theme from localStorage', () => {
                beforeEach();
                mockLocalStorage.setItem('multigoal-sip-theme', 'dark');
                const theme = themeManager.loadTheme();
                assertEqual(theme, 'dark');
                afterEach();
            });

            runner.it('should detect system preference if no saved theme', () => {
                beforeEach();
                // matchMedia returns dark
                const theme = themeManager.loadTheme();
                assertEqual(theme, 'dark');
                afterEach();
            });

            runner.it('should return light as fallback', () => {
                beforeEach();
                window.matchMedia = (query) => ({
                    matches: false,
                    media: query,
                    addEventListener: () => {},
                    removeEventListener: () => {}
                });
                
                const manager = new ThemeManager(mockStorage);
                const theme = manager.loadTheme();
                assertEqual(theme, 'light');
                afterEach();
            });
        });

        runner.describe('without storage service', () => {
            runner.it('should work without storage service', () => {
                const manager = new ThemeManager();
                manager.setTheme('dark');
                assertEqual(manager.getCurrentTheme(), 'dark');
                
                // Clean up
                document.documentElement.classList.remove('dark');
            });

            runner.it('should not throw when saving without storage', () => {
                const manager = new ThemeManager();
                manager.setTheme('dark');
                // Should not throw
                
                // Clean up
                document.documentElement.classList.remove('dark');
            });
        });

        runner.describe('persistence', () => {
            runner.it('should persist theme across instances', () => {
                beforeEach();
                themeManager.setTheme('dark');
                
                // Create new instance
                const newManager = new ThemeManager(mockStorage);
                newManager.initialize();
                
                assertEqual(newManager.getCurrentTheme(), 'dark');
                afterEach();
            });

            runner.it('should override system preference with saved theme', () => {
                beforeEach();
                // System prefers dark
                window.matchMedia = (query) => ({
                    matches: query === '(prefers-color-scheme: dark)',
                    media: query,
                    addEventListener: () => {},
                    removeEventListener: () => {}
                });
                
                // But user saved light
                mockLocalStorage.setItem('multigoal-sip-theme', 'light');
                
                const manager = new ThemeManager(mockStorage);
                manager.initialize();
                
                assertEqual(manager.getCurrentTheme(), 'light');
                afterEach();
            });
        });
    });
}

