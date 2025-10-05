/**
 * Unit tests for ChartManager
 */

import { ChartManager } from '../../js/charts.js';
import { SIPCalculator } from '../../js/calculator.js';
import { Formatter } from '../../js/formatter.js';
import { 
    assertEqual, 
    assertNotNull,
    assertTrue,
    assertLength,
    assertGreaterThan
} from '../test-runner.js';

export function runChartsTests(runner) {
    runner.describe('ChartManager', () => {
        let chartManager;
        let calculator;
        let formatter;
        let sampleGoals;
        let canvas;

        const beforeEach = () => {
            calculator = new SIPCalculator();
            formatter = new Formatter();
            chartManager = new ChartManager(calculator, formatter);
            
            sampleGoals = [
                {
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                },
                {
                    name: 'Education',
                    currentPrice: 2000000,
                    inflationRate: 6,
                    years: 15,
                    expectedReturn: 12,
                    stepUpRate: 10
                }
            ];

            // Create canvas element
            canvas = document.createElement('canvas');
            canvas.id = 'test-chart';
            document.body.appendChild(canvas);
        };

        const afterEach = () => {
            chartManager.destroy();
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };

        runner.it('should create chart manager instance', () => {
            beforeEach();
            assertEqual(chartManager instanceof ChartManager, true);
            afterEach();
        });

        runner.describe('generateGoalData', () => {
            runner.it('should generate year-by-year data for a goal', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                assertNotNull(data);
                assertNotNull(data.years);
                assertNotNull(data.invested);
                assertNotNull(data.futureValues);
                assertNotNull(data.goalName);
                afterEach();
            });

            runner.it('should include goal name in data', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                assertEqual(data.goalName, 'House');
                afterEach();
            });

            runner.it('should generate correct number of data points', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                // Should have years + 1 data points (including year 0)
                assertLength(data.years, 11);
                assertLength(data.invested, 11);
                assertLength(data.futureValues, 11);
                afterEach();
            });

            runner.it('should start with zero values at year 0', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                assertEqual(data.years[0], 0);
                assertEqual(data.invested[0], 0);
                assertEqual(data.futureValues[0], 0);
                afterEach();
            });

            runner.it('should show increasing invested amounts', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                // Each year should have more invested
                for (let i = 1; i < data.invested.length; i++) {
                    assertGreaterThan(data.invested[i], data.invested[i - 1]);
                }
                afterEach();
            });

            runner.it('should show increasing future values', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                // Future value should grow with compounding
                for (let i = 1; i < data.futureValues.length; i++) {
                    assertGreaterThan(data.futureValues[i], data.futureValues[i - 1]);
                }
                afterEach();
            });

            runner.it('should handle goals with step-up SIP', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[1]);
                
                assertNotNull(data);
                assertLength(data.years, 16); // 15 years + year 0
                assertGreaterThan(data.futureValues[15], 0);
                afterEach();
            });
        });

        runner.describe('createChart', () => {
            runner.it('should create chart for single goal', () => {
                beforeEach();
                if (typeof Chart !== 'undefined') {
                    chartManager.createChart([sampleGoals[0]], 'test-chart', 'light');
                    assertNotNull(chartManager.chart);
                }
                afterEach();
            });

            runner.it('should create chart for multiple goals', () => {
                beforeEach();
                if (typeof Chart !== 'undefined') {
                    chartManager.createChart(sampleGoals, 'test-chart', 'light');
                    assertNotNull(chartManager.chart);
                }
                afterEach();
            });

            runner.it('should not create chart for empty goals', () => {
                beforeEach();
                chartManager.createChart([], 'test-chart', 'light');
                assertEqual(chartManager.chart, null);
                afterEach();
            });

            runner.it('should handle missing canvas gracefully', () => {
                beforeEach();
                chartManager.createChart(sampleGoals, 'non-existent-canvas', 'light');
                // Should not throw
                afterEach();
            });
        });

        runner.describe('destroy', () => {
            runner.it('should destroy existing chart', () => {
                beforeEach();
                if (typeof Chart !== 'undefined') {
                    chartManager.createChart([sampleGoals[0]], 'test-chart', 'light');
                    chartManager.destroy();
                    assertEqual(chartManager.chart, null);
                }
                afterEach();
            });

            runner.it('should not throw if no chart exists', () => {
                beforeEach();
                chartManager.destroy();
                // Should not throw
                afterEach();
            });
        });

        runner.describe('updateTheme', () => {
            runner.it('should recreate chart with new theme', () => {
                beforeEach();
                if (typeof Chart !== 'undefined') {
                    chartManager.createChart([sampleGoals[0]], 'test-chart', 'light');
                    const oldChart = chartManager.chart;
                    
                    chartManager.updateTheme('dark', [sampleGoals[0]], 'test-chart');
                    
                    // Should create new chart instance
                    assertTrue(chartManager.chart !== oldChart);
                }
                afterEach();
            });
        });

        runner.describe('Data Accuracy', () => {
            runner.it('should calculate invested amount correctly', () => {
                beforeEach();
                const goal = sampleGoals[0];
                const data = chartManager.generateGoalData(goal);
                
                // Calculate expected investment for 10 years
                const inflationAdjustedAmount = calculator.calculateInflationAdjustedAmount(
                    goal.currentPrice,
                    goal.inflationRate,
                    goal.years
                );
                const monthlySIP = calculator.calculateMonthlySIP(
                    inflationAdjustedAmount,
                    goal.years,
                    goal.expectedReturn,
                    goal.stepUpRate
                );
                
                // After 10 years
                const expectedInvested = monthlySIP * 12 * goal.years;
                
                // Should be approximately equal
                const actualInvested = data.invested[10];
                const diff = Math.abs(actualInvested - expectedInvested);
                const tolerance = expectedInvested * 0.01; // 1% tolerance
                
                assertTrue(diff < tolerance);
                afterEach();
            });

            runner.it('should show future value greater than invested', () => {
                beforeEach();
                const data = chartManager.generateGoalData(sampleGoals[0]);
                
                // Future value should be greater than invested (due to returns)
                const finalYear = data.years.length - 1;
                assertGreaterThan(data.futureValues[finalYear], data.invested[finalYear]);
                afterEach();
            });
        });

        runner.describe('Edge Cases', () => {
            runner.it('should handle very short time periods', () => {
                beforeEach();
                const shortGoal = {
                    name: 'Short Term',
                    currentPrice: 100000,
                    inflationRate: 5,
                    years: 1,
                    expectedReturn: 10,
                    stepUpRate: 0
                };
                
                const data = chartManager.generateGoalData(shortGoal);
                assertLength(data.years, 2); // Years 0 and 1
                afterEach();
            });

            runner.it('should handle very long time periods', () => {
                beforeEach();
                const longGoal = {
                    name: 'Long Term',
                    currentPrice: 10000000,
                    inflationRate: 7,
                    years: 30,
                    expectedReturn: 12,
                    stepUpRate: 0
                };
                
                const data = chartManager.generateGoalData(longGoal);
                assertLength(data.years, 31);
                afterEach();
            });

            runner.it('should handle high step-up rates', () => {
                beforeEach();
                const highStepUpGoal = {
                    name: 'High Step-up',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 15
                };
                
                const data = chartManager.generateGoalData(highStepUpGoal);
                assertGreaterThan(data.futureValues[10], 0);
                afterEach();
            });
        });

        runner.describe('Aggregated Chart Logic', () => {
            runner.it('should aggregate data from multiple goals', () => {
                beforeEach();
                const maxYears = Math.max(...sampleGoals.map(g => g.years));
                
                // Generate individual goal data
                const goal1Data = chartManager.generateGoalData(sampleGoals[0]);
                const goal2Data = chartManager.generateGoalData(sampleGoals[1]);
                
                // At year 10, aggregated should be sum of both
                const expectedInvested = goal1Data.invested[10] + goal2Data.invested[10];
                assertGreaterThan(expectedInvested, 0);
                afterEach();
            });

            runner.it('should handle goals with different time periods', () => {
                beforeEach();
                const goals = [
                    { ...sampleGoals[0], years: 5 },
                    { ...sampleGoals[1], years: 15 }
                ];
                
                // Should not throw
                const data1 = chartManager.generateGoalData(goals[0]);
                const data2 = chartManager.generateGoalData(goals[1]);
                
                assertLength(data1.years, 6);
                assertLength(data2.years, 16);
                afterEach();
            });
        });
    });
}

