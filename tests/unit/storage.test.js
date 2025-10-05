/**
 * Unit tests for StorageService
 */

import { StorageService } from '../../js/storage.js';
import { 
    assertEqual, 
    assertDeepEqual,
    assertNull,
    assertTrue,
    assertFalse,
    assertLength
} from '../test-runner.js';
import { MockHelper } from '../test-runner.js';

export function runStorageTests(runner) {
    runner.describe('StorageService', () => {
        let storageService;
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
            
            storageService = new StorageService();
        };

        const afterEach = () => {
            // Restore original localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true,
                configurable: true
            });
        };

        runner.it('should create storage service instance', () => {
            beforeEach();
            assertEqual(storageService instanceof StorageService, true);
            afterEach();
        });

        runner.describe('isAvailable', () => {
            runner.it('should return true when localStorage is available', () => {
                beforeEach();
                assertTrue(storageService.isAvailable());
                afterEach();
            });

            runner.it('should return false when localStorage throws', () => {
                // Create a localStorage that throws
                const throwingStorage = {
                    getItem: () => { throw new Error('Storage disabled'); },
                    setItem: () => { throw new Error('Storage disabled'); }
                };
                
                Object.defineProperty(window, 'localStorage', {
                    value: throwingStorage,
                    writable: true,
                    configurable: true
                });
                
                const service = new StorageService();
                assertFalse(service.isAvailable());
                
                // Restore
                Object.defineProperty(window, 'localStorage', {
                    value: originalLocalStorage,
                    writable: true,
                    configurable: true
                });
            });
        });

        runner.describe('saveGoals', () => {
            runner.it('should save goals to localStorage', () => {
                beforeEach();
                const goals = [
                    { id: '1', name: 'Goal 1', currentPrice: 100000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                
                storageService.saveGoals(goals);
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                assertTrue(stored !== null);
                afterEach();
            });

            runner.it('should save goals as JSON', () => {
                beforeEach();
                const goals = [
                    { id: '1', name: 'Goal 1', currentPrice: 100000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                
                storageService.saveGoals(goals);
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                const parsed = JSON.parse(stored);
                assertDeepEqual(parsed, goals);
                afterEach();
            });

            runner.it('should handle empty goals array', () => {
                beforeEach();
                storageService.saveGoals([]);
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                assertEqual(stored, '[]');
                afterEach();
            });

            runner.it('should overwrite existing goals', () => {
                beforeEach();
                const goals1 = [{ id: '1', name: 'Goal 1' }];
                const goals2 = [{ id: '2', name: 'Goal 2' }];
                
                storageService.saveGoals(goals1);
                storageService.saveGoals(goals2);
                
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                const parsed = JSON.parse(stored);
                assertLength(parsed, 1);
                assertEqual(parsed[0].id, '2');
                afterEach();
            });
        });

        runner.describe('loadGoals', () => {
            runner.it('should load goals from localStorage', () => {
                beforeEach();
                const goals = [
                    { id: '1', name: 'Goal 1', currentPrice: 100000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                
                mockLocalStorage.setItem('multigoal-sip-goals', JSON.stringify(goals));
                const loaded = storageService.loadGoals();
                assertDeepEqual(loaded, goals);
                afterEach();
            });

            runner.it('should return empty array when no data', () => {
                beforeEach();
                const loaded = storageService.loadGoals();
                assertDeepEqual(loaded, []);
                afterEach();
            });

            runner.it('should return empty array on parse error', () => {
                beforeEach();
                mockLocalStorage.setItem('multigoal-sip-goals', 'invalid json');
                const loaded = storageService.loadGoals();
                assertDeepEqual(loaded, []);
                afterEach();
            });

            runner.it('should return empty array if data is not an array', () => {
                beforeEach();
                mockLocalStorage.setItem('multigoal-sip-goals', JSON.stringify({ not: 'array' }));
                const loaded = storageService.loadGoals();
                assertDeepEqual(loaded, []);
                afterEach();
            });
        });

        runner.describe('clearGoals', () => {
            runner.it('should remove goals from localStorage', () => {
                beforeEach();
                const goals = [{ id: '1', name: 'Goal 1' }];
                mockLocalStorage.setItem('multigoal-sip-goals', JSON.stringify(goals));
                
                storageService.clearGoals();
                const stored = mockLocalStorage.getItem('multigoal-sip-goals');
                assertNull(stored);
                afterEach();
            });

            runner.it('should not throw if no goals exist', () => {
                beforeEach();
                storageService.clearGoals(); // Should not throw
                afterEach();
            });
        });

        runner.describe('getStorageSize', () => {
            runner.it('should return size of stored data', () => {
                beforeEach();
                const goals = [
                    { id: '1', name: 'Goal 1', currentPrice: 100000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                
                storageService.saveGoals(goals);
                const size = storageService.getStorageSize();
                assertTrue(size > 0);
                afterEach();
            });

            runner.it('should return 0 when no data stored', () => {
                beforeEach();
                const size = storageService.getStorageSize();
                assertEqual(size, 0);
                afterEach();
            });
        });
    });
}

