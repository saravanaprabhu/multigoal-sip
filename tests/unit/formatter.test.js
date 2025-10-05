/**
 * Unit tests for Formatter
 */

import { Formatter } from '../../js/formatter.js';
import { assertEqual, assertContains, assertTrue } from '../test-runner.js';

export function runFormatterTests(runner) {
    runner.describe('Formatter', () => {
        let formatter;

        const beforeEach = () => {
            formatter = new Formatter();
        };

        runner.it('should create formatter instance', () => {
            beforeEach();
            assertEqual(formatter instanceof Formatter, true);
        });

        runner.describe('formatCurrency', () => {
            runner.it('should format small amounts correctly', () => {
                beforeEach();
                const result = formatter.formatCurrency(1000);
                assertEqual(result, '₹1,000');
            });

            runner.it('should format lakhs correctly', () => {
                beforeEach();
                const result = formatter.formatCurrency(100000);
                assertEqual(result, '₹1,00,000');
            });

            runner.it('should format amounts over 1 lakh with lakhs suffix', () => {
                beforeEach();
                const result = formatter.formatCurrency(500000);
                assertContains(result, 'L');
            });

            runner.it('should format crores correctly', () => {
                beforeEach();
                const result = formatter.formatCurrency(10000000);
                assertContains(result, 'Cr');
            });

            runner.it('should handle zero amount', () => {
                beforeEach();
                const result = formatter.formatCurrency(0);
                assertEqual(result, '₹0');
            });

            runner.it('should handle negative amounts', () => {
                beforeEach();
                const result = formatter.formatCurrency(-50000);
                assertTrue(result.includes('-'));
            });

            runner.it('should round to 2 decimal places for lakhs', () => {
                beforeEach();
                const result = formatter.formatCurrency(567890);
                assertTrue(result.includes('5.68'));
            });

            runner.it('should round to 2 decimal places for crores', () => {
                beforeEach();
                const result = formatter.formatCurrency(12345678);
                assertTrue(result.includes('1.23'));
            });
        });

        runner.describe('formatPercentage', () => {
            runner.it('should format percentage with % symbol', () => {
                beforeEach();
                const result = formatter.formatPercentage(12);
                assertEqual(result, '12%');
            });

            runner.it('should format decimal percentages', () => {
                beforeEach();
                const result = formatter.formatPercentage(12.5);
                assertEqual(result, '12.5%');
            });

            runner.it('should handle zero percentage', () => {
                beforeEach();
                const result = formatter.formatPercentage(0);
                assertEqual(result, '0%');
            });

            runner.it('should handle negative percentages', () => {
                beforeEach();
                const result = formatter.formatPercentage(-5);
                assertEqual(result, '-5%');
            });

            runner.it('should handle very small percentages', () => {
                beforeEach();
                const result = formatter.formatPercentage(0.5);
                assertEqual(result, '0.5%');
            });
        });

        runner.describe('formatYears', () => {
            runner.it('should format singular year', () => {
                beforeEach();
                const result = formatter.formatYears(1);
                assertEqual(result, '1 year');
            });

            runner.it('should format plural years', () => {
                beforeEach();
                const result = formatter.formatYears(10);
                assertEqual(result, '10 years');
            });

            runner.it('should handle zero years', () => {
                beforeEach();
                const result = formatter.formatYears(0);
                assertEqual(result, '0 years');
            });

            runner.it('should handle fractional years', () => {
                beforeEach();
                const result = formatter.formatYears(5.5);
                assertEqual(result, '5.5 years');
            });
        });

        runner.describe('Edge Cases', () => {
            runner.it('should handle very large currency amounts', () => {
                beforeEach();
                const result = formatter.formatCurrency(999999999);
                assertTrue(result.includes('Cr'));
            });

            runner.it('should handle very small currency amounts', () => {
                beforeEach();
                const result = formatter.formatCurrency(1);
                assertEqual(result, '₹1');
            });

            runner.it('should handle floating point currency amounts', () => {
                beforeEach();
                const result = formatter.formatCurrency(123456.789);
                assertTrue(result.includes('1.23'));
            });
        });
    });
}

