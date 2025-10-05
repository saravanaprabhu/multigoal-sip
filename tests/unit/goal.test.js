/**
 * Unit tests for GoalManager
 */

import { GoalManager } from '../../js/goal.js';
import { 
    assertEqual, 
    assertLength, 
    assertNotNull,
    assertTrue,
    assertFalse
} from '../test-runner.js';
import { MockHelper } from '../test-runner.js';

export function runGoalTests(runner) {
    runner.describe('GoalManager', () => {
        let goalManager;
        let mockStorage;

        const beforeEach = () => {
            mockStorage = {
                saveGoals: MockHelper.mockFunction(),
                loadGoals: MockHelper.mockFunction(),
                clearGoals: MockHelper.mockFunction(),
                isAvailable: MockHelper.mockFunction()
            };
            mockStorage.isAvailable.returnValue = true;
            
            goalManager = new GoalManager(mockStorage);
        };

        runner.it('should create goal manager instance', () => {
            beforeEach();
            assertEqual(goalManager instanceof GoalManager, true);
        });

        runner.describe('addGoal', () => {
            runner.it('should add a goal successfully', () => {
                beforeEach();
                const goalId = goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                assertNotNull(goalId);
                assertEqual(goalManager.getGoalCount(), 1);
            });

            runner.it('should generate unique IDs for goals', () => {
                beforeEach();
                const id1 = goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                const id2 = goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                assertTrue(id1 !== id2);
            });

            runner.it('should add goal with all properties', () => {
                beforeEach();
                const goalId = goalManager.addGoal('House', 5000000, 7, 10, 12, 10);
                const goals = goalManager.getAllGoals();
                const goal = goals.find(g => g.id === goalId);
                
                assertEqual(goal.name, 'House');
                assertEqual(goal.currentPrice, 5000000);
                assertEqual(goal.inflationRate, 7);
                assertEqual(goal.years, 10);
                assertEqual(goal.expectedReturn, 12);
                assertEqual(goal.stepUpRate, 10);
            });

            runner.it('should default stepUpRate to 0 if not provided', () => {
                beforeEach();
                const goalId = goalManager.addGoal('Car', 1500000, 5, 5, 12);
                const goals = goalManager.getAllGoals();
                const goal = goals.find(g => g.id === goalId);
                
                assertEqual(goal.stepUpRate, 0);
            });

            runner.it('should call saveToStorage after adding goal', () => {
                beforeEach();
                goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                assertTrue(mockStorage.saveGoals.callCount() > 0);
            });
        });

        runner.describe('removeGoal', () => {
            runner.it('should remove a goal successfully', () => {
                beforeEach();
                const goalId = goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                assertEqual(goalManager.getGoalCount(), 1);
                
                goalManager.removeGoal(goalId);
                assertEqual(goalManager.getGoalCount(), 0);
            });

            runner.it('should not affect other goals when removing one', () => {
                beforeEach();
                const id1 = goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                const id2 = goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                const id3 = goalManager.addGoal('Goal 3', 300000, 6, 10, 12, 0);
                
                goalManager.removeGoal(id2);
                assertEqual(goalManager.getGoalCount(), 2);
                
                const goals = goalManager.getAllGoals();
                assertTrue(goals.some(g => g.id === id1));
                assertFalse(goals.some(g => g.id === id2));
                assertTrue(goals.some(g => g.id === id3));
            });

            runner.it('should call saveToStorage after removing goal', () => {
                beforeEach();
                const goalId = goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
                mockStorage.saveGoals.reset();
                
                goalManager.removeGoal(goalId);
                assertTrue(mockStorage.saveGoals.callCount() > 0);
            });
        });

        runner.describe('getAllGoals', () => {
            runner.it('should return empty array initially', () => {
                beforeEach();
                const goals = goalManager.getAllGoals();
                assertLength(goals, 0);
            });

            runner.it('should return all added goals', () => {
                beforeEach();
                goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                goalManager.addGoal('Goal 3', 300000, 6, 10, 12, 0);
                
                const goals = goalManager.getAllGoals();
                assertLength(goals, 3);
            });

            runner.it('should return a copy of goals array', () => {
                beforeEach();
                goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                
                const goals1 = goalManager.getAllGoals();
                const goals2 = goalManager.getAllGoals();
                
                assertTrue(goals1 !== goals2); // Different array instances
            });
        });

        runner.describe('getGoalCount', () => {
            runner.it('should return 0 initially', () => {
                beforeEach();
                assertEqual(goalManager.getGoalCount(), 0);
            });

            runner.it('should return correct count after adding goals', () => {
                beforeEach();
                goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                assertEqual(goalManager.getGoalCount(), 1);
                
                goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                assertEqual(goalManager.getGoalCount(), 2);
            });

            runner.it('should return correct count after removing goals', () => {
                beforeEach();
                const id1 = goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                const id2 = goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                
                goalManager.removeGoal(id1);
                assertEqual(goalManager.getGoalCount(), 1);
                
                goalManager.removeGoal(id2);
                assertEqual(goalManager.getGoalCount(), 0);
            });
        });

        runner.describe('clearAllGoals', () => {
            runner.it('should remove all goals', () => {
                beforeEach();
                goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                goalManager.addGoal('Goal 2', 200000, 6, 10, 12, 0);
                goalManager.addGoal('Goal 3', 300000, 6, 10, 12, 0);
                
                goalManager.clearAllGoals();
                assertEqual(goalManager.getGoalCount(), 0);
            });

            runner.it('should call storage clearGoals method', () => {
                beforeEach();
                goalManager.addGoal('Goal 1', 100000, 6, 10, 12, 0);
                
                goalManager.clearAllGoals();
                assertTrue(mockStorage.clearGoals.callCount() > 0);
            });
        });

        runner.describe('loadFromStorage', () => {
            runner.it('should load goals from storage', () => {
                beforeEach();
                const storedGoals = [
                    { id: '1', name: 'Goal 1', currentPrice: 100000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 },
                    { id: '2', name: 'Goal 2', currentPrice: 200000, inflationRate: 6, years: 10, expectedReturn: 12, stepUpRate: 0 }
                ];
                mockStorage.loadGoals.returnValue = storedGoals;
                
                goalManager.loadFromStorage();
                assertEqual(goalManager.getGoalCount(), 2);
            });

            runner.it('should handle empty storage', () => {
                beforeEach();
                mockStorage.loadGoals.returnValue = [];
                
                goalManager.loadFromStorage();
                assertEqual(goalManager.getGoalCount(), 0);
            });

            runner.it('should handle null from storage', () => {
                beforeEach();
                mockStorage.loadGoals.returnValue = null;
                
                goalManager.loadFromStorage();
                assertEqual(goalManager.getGoalCount(), 0);
            });
        });

        runner.describe('without storage service', () => {
            runner.it('should work without storage service', () => {
                const manager = new GoalManager();
                const goalId = manager.addGoal('House', 5000000, 7, 10, 12, 0);
                
                assertNotNull(goalId);
                assertEqual(manager.getGoalCount(), 1);
            });

            runner.it('should not throw when saving without storage', () => {
                const manager = new GoalManager();
                manager.addGoal('House', 5000000, 7, 10, 12, 0);
                // Should not throw
            });
        });
    });
}

