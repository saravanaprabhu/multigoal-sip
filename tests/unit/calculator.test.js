/**
 * Unit tests for SIPCalculator
 */

import { SIPCalculator } from '../../js/calculator.js';
import { 
    assertEqual, 
    assertApproximately,
    assertGreaterThan,
    assertLessThan,
    assertThrows
} from '../test-runner.js';

export function runCalculatorTests(runner) {
    runner.describe('SIPCalculator', () => {
        let calculator;

        // Helper to run before each test
        const beforeEach = () => {
            calculator = new SIPCalculator();
        };

        runner.it('should create calculator instance', () => {
            beforeEach();
            assertEqual(calculator instanceof SIPCalculator, true);
        });

        // Inflation Adjustment Tests
        runner.describe('calculateInflationAdjustedAmount', () => {
            runner.it('should calculate inflation-adjusted amount correctly', () => {
                beforeEach();
                const result = calculator.calculateInflationAdjustedAmount(100000, 6, 10);
                assertApproximately(result, 179085, 1);
            });

            runner.it('should return same amount for 0% inflation', () => {
                beforeEach();
                const result = calculator.calculateInflationAdjustedAmount(100000, 0, 10);
                assertEqual(result, 100000);
            });

            runner.it('should return same amount for 0 years', () => {
                beforeEach();
                const result = calculator.calculateInflationAdjustedAmount(100000, 6, 0);
                assertEqual(result, 100000);
            });

            runner.it('should handle high inflation rates', () => {
                beforeEach();
                const result = calculator.calculateInflationAdjustedAmount(100000, 15, 20);
                assertGreaterThan(result, 1000000);
            });

            runner.it('should handle fractional years', () => {
                beforeEach();
                const result = calculator.calculateInflationAdjustedAmount(100000, 6, 5.5);
                assertApproximately(result, 137640, 10);
            });
        });

        // Standard SIP Tests
        runner.describe('calculateMonthlySIP', () => {
            runner.it('should calculate standard monthly SIP correctly', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(1000000, 10, 12, 0);
                assertApproximately(result, 4347, 1);
            });

            runner.it('should handle different time periods', () => {
                beforeEach();
                const result5yr = calculator.calculateMonthlySIP(500000, 5, 12, 0);
                const result15yr = calculator.calculateMonthlySIP(500000, 15, 12, 0);
                assertLessThan(result15yr, result5yr);
            });

            runner.it('should handle different return rates', () => {
                beforeEach();
                const result8pct = calculator.calculateMonthlySIP(1000000, 10, 8, 0);
                const result15pct = calculator.calculateMonthlySIP(1000000, 10, 15, 0);
                assertGreaterThan(result8pct, result15pct);
            });

            runner.it('should handle zero target amount', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(0, 10, 12, 0);
                assertEqual(result, 0);
            });
        });

        // Step-up SIP Tests
        runner.describe('calculateStepUpSIP', () => {
            runner.it('should calculate step-up SIP for 10% increment', () => {
                beforeEach();
                const result = calculator.calculateStepUpSIP(1000000, 10, 12, 10);
                assertApproximately(result, 3400, 100);
            });

            runner.it('should be less than standard SIP for same target', () => {
                beforeEach();
                const standardSIP = calculator.calculateMonthlySIP(1000000, 10, 12, 0);
                const stepUpSIP = calculator.calculateStepUpSIP(1000000, 10, 12, 10);
                assertLessThan(stepUpSIP, standardSIP);
            });

            runner.it('should converge to correct future value', () => {
                beforeEach();
                const targetAmount = 1000000;
                const years = 10;
                const annualRate = 12;
                const stepUpRate = 10;
                
                const initialSIP = calculator.calculateStepUpSIP(targetAmount, years, annualRate, stepUpRate);
                const achievedFV = calculator.calculateStepUpFutureValue(initialSIP, years, annualRate, stepUpRate);
                
                assertApproximately(achievedFV, targetAmount, 100);
            });

            runner.it('should handle high step-up rates', () => {
                beforeEach();
                const result = calculator.calculateStepUpSIP(1000000, 10, 12, 15);
                assertGreaterThan(result, 0);
                assertLessThan(result, 5000);
            });
        });

        // Step-up Future Value Tests
        runner.describe('calculateStepUpFutureValue', () => {
            runner.it('should calculate future value with step-up correctly', () => {
                beforeEach();
                const result = calculator.calculateStepUpFutureValue(3000, 10, 12, 10);
                assertGreaterThan(result, 0);
            });

            runner.it('should match standard FV when step-up is 0%', () => {
                beforeEach();
                const initialSIP = 5000;
                const years = 10;
                const annualRate = 12;
                
                const stepUpFV = calculator.calculateStepUpFutureValue(initialSIP, years, annualRate, 0);
                const monthlyRate = annualRate / 12 / 100;
                const months = years * 12;
                const standardFV = initialSIP * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
                
                assertApproximately(stepUpFV, standardFV, 1);
            });

            runner.it('should increase with higher step-up rates', () => {
                beforeEach();
                const fv0 = calculator.calculateStepUpFutureValue(3000, 10, 12, 0);
                const fv10 = calculator.calculateStepUpFutureValue(3000, 10, 12, 10);
                assertGreaterThan(fv10, fv0);
            });
        });

        // Total Investment Tests
        runner.describe('calculateTotalInvestment', () => {
            runner.it('should calculate standard total investment', () => {
                beforeEach();
                const result = calculator.calculateTotalInvestment(5000, 10, 0);
                assertEqual(result, 5000 * 12 * 10);
            });

            runner.it('should calculate step-up total investment', () => {
                beforeEach();
                const result = calculator.calculateTotalInvestment(5000, 10, 10);
                assertGreaterThan(result, 5000 * 12 * 10);
            });

            runner.it('should handle zero SIP amount', () => {
                beforeEach();
                const result = calculator.calculateTotalInvestment(0, 10, 0);
                assertEqual(result, 0);
            });
        });

        // Wealth Gain Tests
        runner.describe('calculateWealthGain', () => {
            runner.it('should calculate wealth gain correctly', () => {
                beforeEach();
                const result = calculator.calculateWealthGain(1000000, 600000);
                assertEqual(result, 400000);
            });

            runner.it('should return 0 when no gain', () => {
                beforeEach();
                const result = calculator.calculateWealthGain(500000, 500000);
                assertEqual(result, 0);
            });

            runner.it('should handle negative gains', () => {
                beforeEach();
                const result = calculator.calculateWealthGain(400000, 500000);
                assertEqual(result, -100000);
            });
        });

        // Summary Tests
        runner.describe('calculateSummary', () => {
            runner.it('should calculate summary for single goal', () => {
                beforeEach();
                const goals = [
                    { 
                        name: 'House', 
                        currentPrice: 5000000, 
                        inflationRate: 7, 
                        years: 10, 
                        expectedReturn: 12,
                        stepUpRate: 0
                    }
                ];
                
                const summary = calculator.calculateSummary(goals);
                assertGreaterThan(summary.totalMonthlySIP, 0);
                assertGreaterThan(summary.totalFutureValue, 5000000);
                assertGreaterThan(summary.totalInvested, 0);
                assertGreaterThan(summary.totalWealthGain, 0);
            });

            runner.it('should calculate summary for multiple goals', () => {
                beforeEach();
                const goals = [
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
                        stepUpRate: 0
                    }
                ];
                
                const summary = calculator.calculateSummary(goals);
                assertGreaterThan(summary.totalMonthlySIP, 0);
                assertGreaterThan(summary.totalFutureValue, 7000000);
                assertGreaterThan(summary.totalInvested, 0);
                assertGreaterThan(summary.totalWealthGain, 0);
            });

            runner.it('should handle empty goals array', () => {
                beforeEach();
                const summary = calculator.calculateSummary([]);
                assertEqual(summary.totalMonthlySIP, 0);
                assertEqual(summary.totalFutureValue, 0);
                assertEqual(summary.totalInvested, 0);
                assertEqual(summary.totalWealthGain, 0);
            });

            runner.it('should handle goals with step-up SIP', () => {
                beforeEach();
                const goals = [
                    { 
                        name: 'Retirement', 
                        currentPrice: 10000000, 
                        inflationRate: 7, 
                        years: 20, 
                        expectedReturn: 12,
                        stepUpRate: 10
                    }
                ];
                
                const summary = calculator.calculateSummary(goals);
                assertGreaterThan(summary.totalMonthlySIP, 0);
                assertGreaterThan(summary.totalFutureValue, 10000000);
            });
        });

        // Edge Cases
        runner.describe('Edge Cases', () => {
            runner.it('should handle very large amounts', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(100000000, 30, 12, 0);
                assertGreaterThan(result, 0);
            });

            runner.it('should handle very short time periods', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(100000, 1, 12, 0);
                assertGreaterThan(result, 0);
            });

            runner.it('should handle very long time periods', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(10000000, 40, 12, 0);
                assertGreaterThan(result, 0);
            });

            runner.it('should handle low return rates', () => {
                beforeEach();
                const result = calculator.calculateMonthlySIP(1000000, 10, 4, 0);
                assertGreaterThan(result, 0);
            });
        });
    });
}

