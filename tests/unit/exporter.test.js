/**
 * Unit tests for Exporter
 */

import { Exporter } from '../../js/exporter.js';
import { SIPCalculator } from '../../js/calculator.js';
import { 
    assertEqual, 
    assertNotNull,
    assertTrue,
    assertContains,
    assertGreaterThan
} from '../test-runner.js';

export function runExporterTests(runner) {
    runner.describe('Exporter', () => {
        let exporter;
        let calculator;
        let sampleGoals;

        const beforeEach = () => {
            calculator = new SIPCalculator();
            exporter = new Exporter(calculator);
            
            sampleGoals = [
                {
                    id: '1',
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                },
                {
                    id: '2',
                    name: 'Education',
                    currentPrice: 2000000,
                    inflationRate: 6,
                    years: 15,
                    expectedReturn: 12,
                    stepUpRate: 10
                }
            ];
        };

        runner.it('should create exporter instance', () => {
            beforeEach();
            assertEqual(exporter instanceof Exporter, true);
        });

        runner.describe('exportToCSV', () => {
            runner.it('should export goals to CSV format', () => {
                beforeEach();
                const csv = exporter.exportToCSV(sampleGoals);
                assertNotNull(csv);
                assertTrue(typeof csv === 'string');
            });

            runner.it('should include CSV headers', () => {
                beforeEach();
                const csv = exporter.exportToCSV(sampleGoals);
                
                assertContains(csv, 'Goal Name');
                assertContains(csv, 'Current Price');
                assertContains(csv, 'Inflation Rate');
                assertContains(csv, 'Years');
                assertContains(csv, 'Expected Return');
                assertContains(csv, 'Step-up Rate');
                assertContains(csv, 'Future Target');
                assertContains(csv, 'Monthly SIP');
                assertContains(csv, 'Total Investment');
                assertContains(csv, 'Wealth Gain');
            });

            runner.it('should include goal data in CSV', () => {
                beforeEach();
                const csv = exporter.exportToCSV(sampleGoals);
                
                assertContains(csv, 'House');
                assertContains(csv, '5000000');
                assertContains(csv, 'Education');
                assertContains(csv, '2000000');
            });

            runner.it('should include calculated values in CSV', () => {
                beforeEach();
                const csv = exporter.exportToCSV(sampleGoals);
                
                // CSV should include future target, SIP amount, etc.
                const lines = csv.split('\n');
                assertGreaterThan(lines.length, 1);
            });

            runner.it('should handle empty goals array', () => {
                beforeEach();
                const csv = exporter.exportToCSV([]);
                
                // Should still have headers
                assertContains(csv, 'Goal Name');
            });

            runner.it('should escape CSV special characters', () => {
                beforeEach();
                const goalsWithComma = [{
                    id: '1',
                    name: 'House, Villa',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                }];
                
                const csv = exporter.exportToCSV(goalsWithComma);
                // Should wrap in quotes if contains comma
                assertTrue(csv.includes('"House, Villa"'));
            });

            runner.it('should format numbers in CSV', () => {
                beforeEach();
                const csv = exporter.exportToCSV(sampleGoals);
                
                // Should contain numeric values
                assertTrue(csv.length > 0);
                assertContains(csv, '7'); // inflation rate
                assertContains(csv, '10'); // years
            });
        });

        runner.describe('exportToJSON', () => {
            runner.it('should export goals to JSON format', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                assertNotNull(json);
                assertTrue(typeof json === 'string');
            });

            runner.it('should create valid JSON', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                
                // Should be parseable
                const parsed = JSON.parse(json);
                assertTrue(Array.isArray(parsed));
            });

            runner.it('should include all goal properties in JSON', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                const parsed = JSON.parse(json);
                
                assertEqual(parsed.length, 2);
                assertEqual(parsed[0].name, 'House');
                assertEqual(parsed[0].currentPrice, 5000000);
                assertEqual(parsed[0].inflationRate, 7);
                assertEqual(parsed[0].years, 10);
                assertEqual(parsed[0].expectedReturn, 12);
                assertEqual(parsed[0].stepUpRate, 0);
            });

            runner.it('should include calculated values in JSON', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                const parsed = JSON.parse(json);
                
                assertNotNull(parsed[0].futureTarget);
                assertNotNull(parsed[0].monthlySIP);
                assertNotNull(parsed[0].totalInvestment);
                assertNotNull(parsed[0].wealthGain);
            });

            runner.it('should handle empty goals array', () => {
                beforeEach();
                const json = exporter.exportToJSON([]);
                const parsed = JSON.parse(json);
                
                assertTrue(Array.isArray(parsed));
                assertEqual(parsed.length, 0);
            });

            runner.it('should preserve step-up rate in JSON', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                const parsed = JSON.parse(json);
                
                assertEqual(parsed[1].stepUpRate, 10);
            });

            runner.it('should format JSON with indentation', () => {
                beforeEach();
                const json = exporter.exportToJSON(sampleGoals);
                
                // Should have indentation (pretty print)
                assertTrue(json.includes('\n'));
                assertTrue(json.includes('  '));
            });
        });

        runner.describe('exportCSV (with download)', () => {
            runner.it('should call downloadFile for CSV export', () => {
                beforeEach();
                
                // Mock the download functionality
                let downloadCalled = false;
                exporter.downloadFile = () => { downloadCalled = true; };
                
                exporter.exportCSV(sampleGoals);
                assertTrue(downloadCalled);
            });
        });

        runner.describe('exportJSON (with download)', () => {
            runner.it('should call downloadFile for JSON export', () => {
                beforeEach();
                
                // Mock the download functionality
                let downloadCalled = false;
                exporter.downloadFile = () => { downloadCalled = true; };
                
                exporter.exportJSON(sampleGoals);
                assertTrue(downloadCalled);
            });
        });

        runner.describe('Calculated Values', () => {
            runner.it('should calculate future target correctly', () => {
                beforeEach();
                const json = exporter.exportToJSON([sampleGoals[0]]);
                const parsed = JSON.parse(json);
                
                const expectedFutureTarget = calculator.calculateInflationAdjustedAmount(
                    5000000, 7, 10
                );
                
                assertEqual(parsed[0].futureTarget, expectedFutureTarget);
            });

            runner.it('should calculate monthly SIP correctly', () => {
                beforeEach();
                const json = exporter.exportToJSON([sampleGoals[0]]);
                const parsed = JSON.parse(json);
                
                const futureTarget = calculator.calculateInflationAdjustedAmount(
                    5000000, 7, 10
                );
                const expectedSIP = calculator.calculateMonthlySIP(
                    futureTarget, 10, 12, 0
                );
                
                assertEqual(Math.round(parsed[0].monthlySIP), Math.round(expectedSIP));
            });

            runner.it('should handle step-up SIP in calculations', () => {
                beforeEach();
                const json = exporter.exportToJSON([sampleGoals[1]]);
                const parsed = JSON.parse(json);
                
                // Goal with 10% step-up should have calculated values
                assertGreaterThan(parsed[0].monthlySIP, 0);
                assertGreaterThan(parsed[0].totalInvestment, 0);
                assertGreaterThan(parsed[0].wealthGain, 0);
            });
        });

        runner.describe('Edge Cases', () => {
            runner.it('should handle goals with special characters in names', () => {
                beforeEach();
                const specialGoals = [{
                    id: '1',
                    name: 'House & Car "Dream"',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                }];
                
                const csv = exporter.exportToCSV(specialGoals);
                assertContains(csv, 'House & Car');
            });

            runner.it('should handle very large amounts', () => {
                beforeEach();
                const largeGoals = [{
                    id: '1',
                    name: 'Large Goal',
                    currentPrice: 100000000,
                    inflationRate: 7,
                    years: 20,
                    expectedReturn: 12,
                    stepUpRate: 0
                }];
                
                const json = exporter.exportToJSON(largeGoals);
                const parsed = JSON.parse(json);
                assertGreaterThan(parsed[0].futureTarget, 100000000);
            });

            runner.it('should handle goals with 0 step-up rate', () => {
                beforeEach();
                const json = exporter.exportToJSON([sampleGoals[0]]);
                const parsed = JSON.parse(json);
                
                assertEqual(parsed[0].stepUpRate, 0);
            });
        });
    });
}

