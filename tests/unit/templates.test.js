/**
 * Unit tests for TemplateManager
 */

import { TemplateManager } from '../../js/templates.js';
import { 
    assertEqual, 
    assertLength,
    assertNotNull,
    assertTrue,
    assertGreaterThan
} from '../test-runner.js';

export function runTemplatesTests(runner) {
    runner.describe('TemplateManager', () => {
        let templateManager;

        const beforeEach = () => {
            templateManager = new TemplateManager();
        };

        runner.it('should create template manager instance', () => {
            beforeEach();
            assertEqual(templateManager instanceof TemplateManager, true);
        });

        runner.describe('getAllTemplates', () => {
            runner.it('should return array of templates', () => {
                beforeEach();
                const templates = templateManager.getAllTemplates();
                assertTrue(Array.isArray(templates));
            });

            runner.it('should return 8 default templates', () => {
                beforeEach();
                const templates = templateManager.getAllTemplates();
                assertLength(templates, 8);
            });

            runner.it('should have required properties in each template', () => {
                beforeEach();
                const templates = templateManager.getAllTemplates();
                
                templates.forEach(template => {
                    assertNotNull(template.id);
                    assertNotNull(template.name);
                    assertNotNull(template.icon);
                    assertGreaterThan(template.currentPrice, 0);
                    assertGreaterThan(template.inflationRate, 0);
                    assertGreaterThan(template.years, 0);
                    assertGreaterThan(template.expectedReturn, 0);
                });
            });
        });

        runner.describe('getTemplate', () => {
            runner.it('should return template by id', () => {
                beforeEach();
                const template = templateManager.getTemplate('education');
                assertNotNull(template);
                assertEqual(template.id, 'education');
            });

            runner.it('should return null for invalid id', () => {
                beforeEach();
                const template = templateManager.getTemplate('invalid-id');
                assertEqual(template, null);
            });
        });

        runner.describe('createGoalFromTemplate', () => {
            runner.it('should create goal from template', () => {
                beforeEach();
                const goal = templateManager.createGoalFromTemplate('education');
                
                assertNotNull(goal);
                assertEqual(goal.name, "Child's Higher Education");
                assertGreaterThan(goal.currentPrice, 0);
                assertGreaterThan(goal.inflationRate, 0);
                assertGreaterThan(goal.years, 0);
                assertGreaterThan(goal.expectedReturn, 0);
            });

            runner.it('should return null for invalid template id', () => {
                beforeEach();
                const goal = templateManager.createGoalFromTemplate('invalid-id');
                assertEqual(goal, null);
            });

            runner.it('should not include id and icon in goal', () => {
                beforeEach();
                const goal = templateManager.createGoalFromTemplate('education');
                assertEqual(goal.id, undefined);
                assertEqual(goal.icon, undefined);
            });
        });

        runner.describe('specific templates', () => {
            runner.it('should have education template', () => {
                beforeEach();
                const template = templateManager.getTemplate('education');
                assertEqual(template.name, "Child's Higher Education");
                assertEqual(template.currentPrice, 5000000);
            });

            runner.it('should have house template', () => {
                beforeEach();
                const template = templateManager.getTemplate('house');
                assertEqual(template.name, "Buy a House");
                assertEqual(template.currentPrice, 8000000);
            });

            runner.it('should have retirement template', () => {
                beforeEach();
                const template = templateManager.getTemplate('retirement');
                assertEqual(template.name, "Retirement Fund");
                assertEqual(template.currentPrice, 20000000);
            });

            runner.it('should have car template', () => {
                beforeEach();
                const template = templateManager.getTemplate('car');
                assertEqual(template.name, "Buy a Car");
                assertEqual(template.currentPrice, 1500000);
            });

            runner.it('should have wedding template', () => {
                beforeEach();
                const template = templateManager.getTemplate('wedding');
                assertEqual(template.name, "Wedding Expenses");
                assertEqual(template.currentPrice, 2500000);
            });

            runner.it('should have vacation template', () => {
                beforeEach();
                const template = templateManager.getTemplate('vacation');
                assertEqual(template.name, "Dream Vacation");
                assertEqual(template.currentPrice, 500000);
            });

            runner.it('should have business template', () => {
                beforeEach();
                const template = templateManager.getTemplate('business');
                assertEqual(template.name, "Start a Business");
                assertEqual(template.currentPrice, 5000000);
            });

            runner.it('should have emergency template', () => {
                beforeEach();
                const template = templateManager.getTemplate('emergency');
                assertEqual(template.name, "Emergency Fund");
                assertEqual(template.currentPrice, 1000000);
            });
        });
    });
}

