/**
 * Main test suite entry point
 * Imports and runs all test suites
 */

import { TestRunner } from './test-runner.js';
import { runCalculatorTests } from './unit/calculator.test.js';
import { runFormatterTests } from './unit/formatter.test.js';
import { runGoalTests } from './unit/goal.test.js';
import { runStorageTests } from './unit/storage.test.js';
import { runTemplatesTests } from './unit/templates.test.js';
import { runExporterTests } from './unit/exporter.test.js';
import { runImporterTests } from './unit/importer.test.js';
import { runThemeTests } from './unit/theme.test.js';
import { runChartsTests } from './unit/charts.test.js';
import { runAppFunctionalTests } from './functional/app.test.js';

/**
 * Run all tests
 */
async function runAllTests() {
    const runner = new TestRunner();

    console.log('🚀 Multi-Goal SIP Planner - Test Suite');
    console.log('========================================\n');

    // Unit Tests
    console.log('📦 Running Unit Tests...\n');
    runCalculatorTests(runner);
    runFormatterTests(runner);
    runGoalTests(runner);
    runStorageTests(runner);
    runTemplatesTests(runner);
    runExporterTests(runner);
    runImporterTests(runner);
    runThemeTests(runner);
    runChartsTests(runner);

    // Functional Tests
    console.log('\n🔄 Running Functional Tests...\n');
    runAppFunctionalTests(runner);

    // Run all tests
    const results = await runner.run();

    // Generate HTML report
    const htmlReport = runner.generateHTMLReport();
    displayHTMLReport(htmlReport);

    return results;
}

/**
 * Display HTML report in the page
 */
function displayHTMLReport(report) {
    const container = document.getElementById('test-results');
    if (!container) return;

    const timestamp = new Date(report.timestamp).toLocaleString();
    
    let html = `
        <div class="test-report">
            <div class="report-header">
                <h2>Test Report</h2>
                <p class="timestamp">Generated: ${timestamp}</p>
            </div>
            
            <div class="summary-stats">
                <div class="stat total">
                    <span class="label">Total</span>
                    <span class="value">${report.results.total}</span>
                </div>
                <div class="stat passed">
                    <span class="label">Passed</span>
                    <span class="value">${report.results.passed}</span>
                </div>
                <div class="stat failed">
                    <span class="label">Failed</span>
                    <span class="value">${report.results.failed}</span>
                </div>
                <div class="stat skipped">
                    <span class="label">Skipped</span>
                    <span class="value">${report.results.skipped}</span>
                </div>
            </div>
    `;

    // Add suite details
    for (const suite of report.suites) {
        const passedTests = suite.tests.filter(t => t.status === 'passed').length;
        const failedTests = suite.tests.filter(t => t.status === 'failed').length;
        
        html += `
            <div class="suite">
                <h3 class="suite-name">${suite.name}</h3>
                <p class="suite-stats">${passedTests} passed, ${failedTests} failed</p>
                <div class="test-list">
        `;

        for (const test of suite.tests) {
            const statusClass = test.status;
            const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
            
            html += `
                <div class="test-item ${statusClass}">
                    <span class="test-icon">${icon}</span>
                    <span class="test-description">${test.description}</span>
                    ${test.error ? `<pre class="test-error">${test.error}</pre>` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

export { runAllTests };

