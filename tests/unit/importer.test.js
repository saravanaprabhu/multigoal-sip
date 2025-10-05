/**
 * Unit tests for Importer
 */

import { Importer } from '../../js/importer.js';
import { 
    assertEqual, 
    assertLength,
    assertNotNull,
    assertTrue,
    assertThrows,
    assertGreaterThan
} from '../test-runner.js';

export function runImporterTests(runner) {
    runner.describe('Importer', () => {
        let importer;

        const beforeEach = () => {
            importer = new Importer();
        };

        runner.it('should create importer instance', () => {
            beforeEach();
            assertEqual(importer instanceof Importer, true);
        });

        runner.describe('parseCSV', () => {
            runner.it('should parse valid CSV data', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
House,5000000,7,10,12,0,9835757,43095,5171400,4664357`;
                
                const goals = importer.parseCSV(csvContent);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House');
                assertEqual(goals[0].currentPrice, 5000000);
            });

            runner.it('should parse multiple goals from CSV', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
House,5000000,7,10,12,0,9835757,43095,5171400,4664357
Education,2000000,6,15,12,10,4793133,10123,2722500,2070633`;
                
                const goals = importer.parseCSV(csvContent);
                assertLength(goals, 2);
                assertEqual(goals[1].name, 'Education');
                assertEqual(goals[1].stepUpRate, 10);
            });

            runner.it('should handle CSV with quoted fields', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
"House, Villa",5000000,7,10,12,0,9835757,43095,5171400,4664357`;
                
                const goals = importer.parseCSV(csvContent);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House, Villa');
            });

            runner.it('should skip empty lines in CSV', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
House,5000000,7,10,12,0,9835757,43095,5171400,4664357

Education,2000000,6,15,12,0,4793133,10123,2722500,2070633`;
                
                const goals = importer.parseCSV(csvContent);
                assertLength(goals, 2);
            });

            runner.it('should convert string numbers to numbers', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
House,5000000,7,10,12,0,9835757,43095,5171400,4664357`;
                
                const goals = importer.parseCSV(csvContent);
                assertTrue(typeof goals[0].currentPrice === 'number');
                assertTrue(typeof goals[0].inflationRate === 'number');
                assertTrue(typeof goals[0].years === 'number');
            });

            runner.it('should throw error for invalid CSV format', () => {
                beforeEach();
                const csvContent = 'invalid,csv,data';
                
                assertThrows(() => {
                    importer.parseCSV(csvContent);
                });
            });

            runner.it('should throw error for missing required fields', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹)
House,5000000`;
                
                assertThrows(() => {
                    importer.parseCSV(csvContent);
                });
            });
        });

        runner.describe('parseJSON', () => {
            runner.it('should parse valid JSON data', () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    id: '1',
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                }]);
                
                const goals = importer.parseJSON(jsonContent);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House');
            });

            runner.it('should parse multiple goals from JSON', () => {
                beforeEach();
                const jsonContent = JSON.stringify([
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
                ]);
                
                const goals = importer.parseJSON(jsonContent);
                assertLength(goals, 2);
            });

            runner.it('should remove calculated fields from JSON', () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    id: '1',
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0,
                    futureTarget: 9835757,
                    monthlySIP: 43095,
                    totalInvestment: 5171400,
                    wealthGain: 4664357
                }]);
                
                const goals = importer.parseJSON(jsonContent);
                assertEqual(goals[0].futureTarget, undefined);
                assertEqual(goals[0].monthlySIP, undefined);
                assertEqual(goals[0].totalInvestment, undefined);
                assertEqual(goals[0].wealthGain, undefined);
            });

            runner.it('should throw error for invalid JSON', () => {
                beforeEach();
                const jsonContent = 'invalid json';
                
                assertThrows(() => {
                    importer.parseJSON(jsonContent);
                });
            });

            runner.it('should throw error if JSON is not an array', () => {
                beforeEach();
                const jsonContent = JSON.stringify({
                    name: 'House',
                    currentPrice: 5000000
                });
                
                assertThrows(() => {
                    importer.parseJSON(jsonContent);
                });
            });

            runner.it('should validate required fields in JSON', () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    name: 'House'
                    // Missing required fields
                }]);
                
                assertThrows(() => {
                    importer.parseJSON(jsonContent);
                });
            });
        });

        runner.describe('validateGoal', () => {
            runner.it('should validate goal with all required fields', () => {
                beforeEach();
                const validGoal = {
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                };
                
                const result = importer.validateGoal(validGoal, 1);
                assertTrue(result.isValid);
            });

            runner.it('should reject goal missing name', () => {
                beforeEach();
                const invalidGoal = {
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12
                };
                
                const result = importer.validateGoal(invalidGoal, 1);
                assertTrue(!result.isValid);
                assertNotNull(result.error);
            });

            runner.it('should reject goal with negative values', () => {
                beforeEach();
                const invalidGoal = {
                    name: 'House',
                    currentPrice: -5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12
                };
                
                const result = importer.validateGoal(invalidGoal, 1);
                assertTrue(!result.isValid);
            });

            runner.it('should reject goal with zero years', () => {
                beforeEach();
                const invalidGoal = {
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 0,
                    expectedReturn: 12
                };
                
                const result = importer.validateGoal(invalidGoal, 1);
                assertTrue(!result.isValid);
            });

            runner.it('should accept goal without stepUpRate (defaults to 0)', () => {
                beforeEach();
                const validGoal = {
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12
                };
                
                const result = importer.validateGoal(validGoal, 1);
                assertTrue(result.isValid);
            });

            runner.it('should reject goal with empty name', () => {
                beforeEach();
                const invalidGoal = {
                    name: '',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12
                };
                
                const result = importer.validateGoal(invalidGoal, 1);
                assertTrue(!result.isValid);
            });
        });

        runner.describe('importCSV (async)', () => {
            runner.it('should import goals from CSV file', async () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
House,5000000,7,10,12,0,9835757,43095,5171400,4664357`;
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const file = new File([blob], 'goals.csv', { type: 'text/csv' });
                
                const goals = await importer.importCSV(file);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House');
            });
        });

        runner.describe('importJSON (async)', () => {
            runner.it('should import goals from JSON file', async () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    name: 'House',
                    currentPrice: 5000000,
                    inflationRate: 7,
                    years: 10,
                    expectedReturn: 12,
                    stepUpRate: 0
                }]);
                
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const file = new File([blob], 'goals.json', { type: 'application/json' });
                
                const goals = await importer.importJSON(file);
                assertLength(goals, 1);
                assertEqual(goals[0].name, 'House');
            });
        });

        runner.describe('Edge Cases', () => {
            runner.it('should handle CSV with extra whitespace', () => {
                beforeEach();
                const csvContent = `Goal Name,Current Price (₹),Inflation Rate (%),Time (Years),Expected Return (%),Step-up Rate (%),Future Target (₹),Monthly SIP (₹),Total Investment (₹),Wealth Gain (₹)
  House  ,  5000000  ,  7  ,  10  ,  12  ,  0  ,9835757,43095,5171400,4664357`;
                
                const goals = importer.parseCSV(csvContent);
                assertEqual(goals[0].name.trim(), 'House');
            });

            runner.it('should handle very large numbers', () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    name: 'Large Goal',
                    currentPrice: 999999999,
                    inflationRate: 7,
                    years: 30,
                    expectedReturn: 12,
                    stepUpRate: 0
                }]);
                
                const goals = importer.parseJSON(jsonContent);
                assertEqual(goals[0].currentPrice, 999999999);
            });

            runner.it('should handle fractional years', () => {
                beforeEach();
                const jsonContent = JSON.stringify([{
                    name: 'Goal',
                    currentPrice: 1000000,
                    inflationRate: 6,
                    years: 5.5,
                    expectedReturn: 12,
                    stepUpRate: 0
                }]);
                
                const goals = importer.parseJSON(jsonContent);
                assertEqual(goals[0].years, 5.5);
            });
        });
    });
}

