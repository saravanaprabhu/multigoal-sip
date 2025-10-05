/**
 * Lightweight test runner for Multi-Goal SIP Planner
 * No external dependencies - vanilla JavaScript testing framework
 */

export class TestRunner {
    constructor() {
        this.tests = [];
        this.suites = new Map();
        this.currentSuite = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };
    }

    /**
     * Define a test suite
     * @param {string} name - Suite name
     * @param {Function} fn - Suite definition function
     */
    describe(name, fn) {
        const previousSuite = this.currentSuite;
        this.currentSuite = name;
        
        if (!this.suites.has(name)) {
            this.suites.set(name, []);
        }
        
        fn();
        this.currentSuite = previousSuite;
    }

    /**
     * Define a test case
     * @param {string} description - Test description
     * @param {Function} fn - Test function
     */
    it(description, fn) {
        const test = {
            suite: this.currentSuite,
            description,
            fn,
            status: 'pending'
        };
        
        this.tests.push(test);
        
        if (this.currentSuite) {
            this.suites.get(this.currentSuite).push(test);
        }
    }

    /**
     * Skip a test
     * @param {string} description - Test description
     * @param {Function} fn - Test function
     */
    xit(description, fn) {
        const test = {
            suite: this.currentSuite,
            description,
            fn,
            status: 'skipped'
        };
        
        this.tests.push(test);
        
        if (this.currentSuite) {
            this.suites.get(this.currentSuite).push(test);
        }
    }

    /**
     * Run all tests
     */
    async run() {
        console.log('🧪 Running tests...\n');
        
        for (const test of this.tests) {
            if (test.status === 'skipped') {
                this.results.skipped++;
                this.logTest(test, 'skipped');
                continue;
            }

            this.results.total++;
            
            try {
                await test.fn();
                test.status = 'passed';
                this.results.passed++;
                this.logTest(test, 'passed');
            } catch (error) {
                test.status = 'failed';
                test.error = error;
                this.results.failed++;
                this.logTest(test, 'failed', error);
            }
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Log test result
     * @private
     */
    logTest(test, status, error = null) {
        const icons = {
            passed: '✅',
            failed: '❌',
            skipped: '⏭️'
        };

        const colors = {
            passed: 'color: green',
            failed: 'color: red',
            skipped: 'color: gray'
        };

        const suite = test.suite ? `${test.suite} > ` : '';
        console.log(`%c${icons[status]} ${suite}${test.description}`, colors[status]);
        
        if (error) {
            console.error('   Error:', error.message);
            if (error.stack) {
                console.error('   Stack:', error.stack);
            }
        }
    }

    /**
     * Print test summary
     * @private
     */
    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`%c✅ Passed: ${this.results.passed}`, 'color: green; font-weight: bold');
        console.log(`%c❌ Failed: ${this.results.failed}`, 'color: red; font-weight: bold');
        console.log(`%c⏭️  Skipped: ${this.results.skipped}`, 'color: gray');
        
        const successRate = this.results.total > 0 
            ? ((this.results.passed / this.results.total) * 100).toFixed(2)
            : 0;
        console.log(`\nSuccess Rate: ${successRate}%`);
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            suites: []
        };

        for (const [suiteName, tests] of this.suites) {
            const suiteResults = {
                name: suiteName,
                tests: tests.map(test => ({
                    description: test.description,
                    status: test.status,
                    error: test.error ? test.error.message : null
                }))
            };
            report.suites.push(suiteResults);
        }

        return report;
    }
}

/**
 * Assertion utilities
 */
export class Assertions {
    /**
     * Assert that a value is truthy
     */
    static assertTrue(value, message = 'Expected value to be true') {
        if (!value) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is falsy
     */
    static assertFalse(value, message = 'Expected value to be false') {
        if (value) {
            throw new Error(message);
        }
    }

    /**
     * Assert that two values are equal
     */
    static assertEqual(actual, expected, message = null) {
        if (actual !== expected) {
            const msg = message || `Expected ${expected} but got ${actual}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that two values are not equal
     */
    static assertNotEqual(actual, expected, message = null) {
        if (actual === expected) {
            const msg = message || `Expected values to be different but both were ${actual}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert deep equality for objects and arrays
     */
    static assertDeepEqual(actual, expected, message = null) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        
        if (actualStr !== expectedStr) {
            const msg = message || `Expected ${expectedStr} but got ${actualStr}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that a value is null
     */
    static assertNull(value, message = 'Expected value to be null') {
        if (value !== null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is not null
     */
    static assertNotNull(value, message = 'Expected value to not be null') {
        if (value === null) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is undefined
     */
    static assertUndefined(value, message = 'Expected value to be undefined') {
        if (value !== undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that a value is defined
     */
    static assertDefined(value, message = 'Expected value to be defined') {
        if (value === undefined) {
            throw new Error(message);
        }
    }

    /**
     * Assert that an array contains a value
     */
    static assertContains(array, value, message = null) {
        if (!Array.isArray(array)) {
            throw new Error('First argument must be an array');
        }
        
        if (!array.includes(value)) {
            const msg = message || `Expected array to contain ${value}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that a function throws an error
     */
    static assertThrows(fn, expectedError = null, message = null) {
        let thrown = false;
        let caughtError = null;

        try {
            fn();
        } catch (error) {
            thrown = true;
            caughtError = error;
        }

        if (!thrown) {
            const msg = message || 'Expected function to throw an error';
            throw new Error(msg);
        }

        if (expectedError && !(caughtError instanceof expectedError)) {
            throw new Error(`Expected error of type ${expectedError.name} but got ${caughtError.constructor.name}`);
        }
    }

    /**
     * Assert that a function does not throw
     */
    static assertDoesNotThrow(fn, message = 'Expected function not to throw') {
        try {
            fn();
        } catch (error) {
            throw new Error(`${message}: ${error.message}`);
        }
    }

    /**
     * Assert that a number is approximately equal (for floating point comparisons)
     */
    static assertApproximately(actual, expected, delta = 0.01, message = null) {
        const diff = Math.abs(actual - expected);
        
        if (diff > delta) {
            const msg = message || `Expected ${actual} to be approximately ${expected} (±${delta})`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that a value is greater than another
     */
    static assertGreaterThan(actual, expected, message = null) {
        if (actual <= expected) {
            const msg = message || `Expected ${actual} to be greater than ${expected}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that a value is less than another
     */
    static assertLessThan(actual, expected, message = null) {
        if (actual >= expected) {
            const msg = message || `Expected ${actual} to be less than ${expected}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that a value is an instance of a class
     */
    static assertInstanceOf(value, constructor, message = null) {
        if (!(value instanceof constructor)) {
            const msg = message || `Expected value to be instance of ${constructor.name}`;
            throw new Error(msg);
        }
    }

    /**
     * Assert that an array has a specific length
     */
    static assertLength(array, expectedLength, message = null) {
        if (!Array.isArray(array)) {
            throw new Error('First argument must be an array');
        }
        
        if (array.length !== expectedLength) {
            const msg = message || `Expected array length to be ${expectedLength} but got ${array.length}`;
            throw new Error(msg);
        }
    }
}

/**
 * Mock utilities for testing
 */
export class MockHelper {
    /**
     * Create a mock function
     */
    static mockFunction() {
        const calls = [];
        const mock = function(...args) {
            calls.push(args);
            return mock.returnValue;
        };
        
        mock.calls = calls;
        mock.returnValue = undefined;
        mock.callCount = () => calls.length;
        mock.calledWith = (...expectedArgs) => {
            return calls.some(args => 
                JSON.stringify(args) === JSON.stringify(expectedArgs)
            );
        };
        mock.reset = () => {
            calls.length = 0;
            mock.returnValue = undefined;
        };
        
        return mock;
    }

    /**
     * Create a mock object with specified methods
     */
    static mockObject(methods = []) {
        const mock = {};
        
        for (const method of methods) {
            mock[method] = this.mockFunction();
        }
        
        return mock;
    }

    /**
     * Create a spy that wraps an existing function
     */
    static spy(originalFn) {
        const calls = [];
        const spyFn = function(...args) {
            calls.push(args);
            return originalFn.apply(this, args);
        };
        
        spyFn.calls = calls;
        spyFn.callCount = () => calls.length;
        spyFn.calledWith = (...expectedArgs) => {
            return calls.some(args => 
                JSON.stringify(args) === JSON.stringify(expectedArgs)
            );
        };
        
        return spyFn;
    }

    /**
     * Create a stub for localStorage
     */
    static mockLocalStorage() {
        const storage = {};
        
        return {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = value; },
            removeItem: (key) => { delete storage[key]; },
            clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
            get length() { return Object.keys(storage).length; },
            key: (index) => Object.keys(storage)[index] || null,
            _storage: storage
        };
    }
}

// Export global test helpers
export const { 
    assertTrue, 
    assertFalse, 
    assertEqual, 
    assertNotEqual,
    assertDeepEqual,
    assertNull,
    assertNotNull,
    assertUndefined,
    assertDefined,
    assertContains,
    assertThrows,
    assertDoesNotThrow,
    assertApproximately,
    assertGreaterThan,
    assertLessThan,
    assertInstanceOf,
    assertLength
} = Assertions;

