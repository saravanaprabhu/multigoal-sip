/**
 * Functional/Integration tests for the complete application
 */

import { MultiGoalSIPApp } from '../../js/app.js';
import { 
    assertEqual,
    assertGreaterThan,
    assertNotNull,
    assertTrue,
    assertLength
} from '../test-runner.js';
import { MockHelper } from '../test-runner.js';

export function runAppFunctionalTests(runner) {
    runner.describe('Application Integration Tests', () => {
        let mockLocalStorage;
        let originalLocalStorage;

        const beforeEach = () => {
            // Save original localStorage
            originalLocalStorage = window.localStorage;
            
            // Create mock localStorage
            mockLocalStorage = MockHelper.mockLocalStorage();
            Object.defineProperty(window, 'localStorage', {
                value: mockLocalStorage,
                writable: true,
                configurable: true
            });

            // Clear DOM
            document.body.innerHTML = `
                <form id="goal-form">
                    <input id="goalName" value="Test Goal">
                    <input id="currentPrice" value="1000000" type="number">
                    <input id="inflationRate" value="6" type="number">
                    <input id="years" value="10" type="number">
                    <input id="expectedReturn" value="12" type="number">
                    <input id="stepUpRate" value="0" type="number">
                </form>
                <div id="goals-list"></div>
                <div id="summary-total-sip"></div>
                <div id="summary-future-value"></div>
                <div id="summary-total-invested"></div>
                <div id="summary-wealth-gain"></div>
                <button id="clear-all-btn"></button>
                <button id="export-csv-btn"></button>
                <button id="export-json-btn"></button>
                <input id="import-file-input" type="file">
                <select id="template-select"></select>
                <button id="use-template-btn"></button>
                <button id="theme-toggle-btn"></button>
                <div id="chart-container" class="hidden"></div>
                <canvas id="investment-chart"></canvas>
            `;
        };

        const afterEach = () => {
            // Restore original localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true,
                configurable: true
            });
            
            // Clear DOM
            document.body.innerHTML = '';
        };

        runner.describe('Application Initialization', () => {
            runner.it('should initialize all components', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                assertNotNull(app.goalManager);
                assertNotNull(app.calculator);
                assertNotNull(app.formatter);
                assertNotNull(app.ui);
                assertNotNull(app.storageService);
                assertNotNull(app.exporter);
                assertNotNull(app.importer);
                assertNotNull(app.templateManager);
                assertNotNull(app.themeManager);
                assertNotNull(app.chartManager);
                afterEach();
            });

            runner.it('should load saved goals on initialization', () => {
                beforeEach();
                const savedGoals = [
                    { id: '1', name: 'Test Goal', currentPrice: 1000000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                mockLocalStorage.setItem('multigoal-sip-goals', JSON.stringify(savedGoals));
                
                const app = new MultiGoalSIPApp();
                assertEqual(app.goalManager.getGoalCount(), 1);
                afterEach();
            });
        });

        runner.describe('Goal Management Flow', () => {
            runner.it('should add goal and update UI', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Simulate form submission
                const form = document.getElementById('goal-form');
                form.dispatchEvent(new Event('submit'));
                
                assertEqual(app.goalManager.getGoalCount(), 1);
                afterEach();
            });

            runner.it('should persist goals to storage', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add a goal
                app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                
                // Check storage
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                assertNotNull(stored);
                
                const goals = JSON.parse(stored);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House');
                afterEach();
            });

            runner.it('should calculate summary correctly', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add goals
                app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                app.goalManager.addGoal('Education', 2000000, 6, 15, 12, 0);
                
                // Get summary
                const goals = app.goalManager.getAllGoals();
                const summary = app.calculator.calculateSummary(goals);
                
                assertGreaterThan(summary.totalMonthlySIP, 0);
                assertGreaterThan(summary.totalFutureValue, 7000000);
                assertGreaterThan(summary.totalInvested, 0);
                assertGreaterThan(summary.totalWealthGain, 0);
                afterEach();
            });
        });

        runner.describe('Template Integration', () => {
            runner.it('should populate templates in dropdown', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                const select = document.getElementById('template-select');
                const options = select.querySelectorAll('option');
                
                // Should have default option + 8 templates
                assertGreaterThan(options.length, 8);
                afterEach();
            });

            runner.it('should create goal from template', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Select a template
                const select = document.getElementById('template-select');
                select.value = 'education';
                
                // Trigger use template
                const btn = document.getElementById('use-template-btn');
                btn.click();
                
                // Check form is populated
                const nameInput = document.getElementById('goalName');
                assertEqual(nameInput.value, "Child's Higher Education");
                afterEach();
            });
        });

        runner.describe('Export/Import Flow', () => {
            runner.it('should export goals to JSON', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add goals
                app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                
                // Export should not throw
                const goals = app.goalManager.getAllGoals();
                const exported = app.exporter.exportToJSON(goals);
                
                assertNotNull(exported);
                assertTrue(exported.includes('House'));
                afterEach();
            });

            runner.it('should export goals to CSV', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add goals
                app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                
                // Export
                const goals = app.goalManager.getAllGoals();
                const exported = app.exporter.exportToCSV(goals);
                
                assertNotNull(exported);
                assertTrue(exported.includes('House'));
                assertTrue(exported.includes('5000000'));
                afterEach();
            });
        });

        runner.describe('Theme Management', () => {
            runner.it('should toggle theme', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                const initialTheme = app.themeManager.getCurrentTheme();
                app.themeManager.toggleTheme();
                const newTheme = app.themeManager.getCurrentTheme();
                
                assertTrue(initialTheme !== newTheme);
                afterEach();
            });

            runner.it('should persist theme preference', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                app.themeManager.setTheme('dark');
                
                const stored = mockLocalStorage.getItem('multigoal-sip-theme');
                assertEqual(stored, 'dark');
                afterEach();
            });
        });

        runner.describe('Clear All Functionality', () => {
            runner.it('should clear all goals', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add goals
                app.goalManager.addGoal('Goal 1', 1000000, 6, 10, 12, 0);
                app.goalManager.addGoal('Goal 2', 2000000, 6, 10, 12, 0);
                
                assertEqual(app.goalManager.getGoalCount(), 2);
                
                // Clear all
                app.goalManager.clearAllGoals();
                
                assertEqual(app.goalManager.getGoalCount(), 0);
                afterEach();
            });
        });

        runner.describe('End-to-End Scenarios', () => {
            runner.it('should handle complete user workflow', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // 1. Add a goal
                const goalId = app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                assertEqual(app.goalManager.getGoalCount(), 1);
                
                // 2. Check calculations
                const goals = app.goalManager.getAllGoals();
                const summary = app.calculator.calculateSummary(goals);
                assertGreaterThan(summary.totalMonthlySIP, 0);
                
                // 3. Export
                const exported = app.exporter.exportToJSON(goals);
                assertNotNull(exported);
                
                // 4. Clear goal
                app.goalManager.removeGoal(goalId);
                assertEqual(app.goalManager.getGoalCount(), 0);
                
                afterEach();
            });

            runner.it('should handle multiple goals with step-up SIP', () => {
                beforeEach();
                const app = new MultiGoalSIPApp();
                
                // Add goals with step-up
                app.goalManager.addGoal('Goal 1', 5000000, 7, 10, 12, 10);
                app.goalManager.addGoal('Goal 2', 2000000, 6, 15, 12, 0);
                
                const goals = app.goalManager.getAllGoals();
                const summary = app.calculator.calculateSummary(goals);
                
                assertGreaterThan(summary.totalMonthlySIP, 0);
                assertGreaterThan(summary.totalFutureValue, 0);
                assertGreaterThan(summary.totalInvested, 0);
                assertGreaterThan(summary.totalWealthGain, 0);
                
                afterEach();
            });
        });
    });
}

