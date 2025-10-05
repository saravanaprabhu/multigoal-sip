# Testing Guide - Multi-Goal SIP Planner

## Overview

This testing framework provides comprehensive unit and functional tests for the Multi-Goal SIP Planner application. The framework is built with vanilla JavaScript (no external dependencies) and follows modern testing best practices.

## Test Structure

```
tests/
├── index.html              # Test runner HTML page
├── test-runner.js          # Custom test framework
├── test-suite.js           # Main test suite entry point
├── TESTING_GUIDE.md        # This file
├── unit/                   # Unit tests
│   ├── calculator.test.js  # SIPCalculator tests (75+ tests)
│   ├── formatter.test.js   # Formatter tests
│   ├── goal.test.js        # GoalManager tests
│   ├── storage.test.js     # StorageService tests
│   └── templates.test.js   # TemplateManager tests
└── functional/             # Integration/functional tests
    └── app.test.js         # End-to-end application tests
```

## Running Tests

### Method 1: Browser Test Runner (Recommended)

1. Start a local server:
   ```bash
   # Python
   python3 -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   ```

2. Open `http://localhost:8000/tests/` in your browser

3. View results in:
   - **Browser UI**: Visual test report with pass/fail indicators
   - **Console**: Detailed test output with error stack traces

### Method 2: Console Only

1. Start a local server (same as above)
2. Open browser console (F12)
3. Navigate to `http://localhost:8000/tests/`
4. View detailed output in console

## Test Framework Features

### Custom Test Runner

Our lightweight test framework provides:

- **describe()**: Group related tests into suites
- **it()**: Define individual test cases
- **xit()**: Skip tests (for temporary disabling)
- **Comprehensive assertions**: 15+ assertion methods
- **Mock utilities**: Function mocks, object mocks, spies
- **HTML reporting**: Visual test reports with statistics

### Assertion Methods

```javascript
// Boolean assertions
assertTrue(value, message?)
assertFalse(value, message?)

// Equality assertions
assertEqual(actual, expected, message?)
assertNotEqual(actual, expected, message?)
assertDeepEqual(actual, expected, message?)

// Null/undefined checks
assertNull(value, message?)
assertNotNull(value, message?)
assertUndefined(value, message?)
assertDefined(value, message?)

// Numeric assertions
assertApproximately(actual, expected, delta, message?)
assertGreaterThan(actual, expected, message?)
assertLessThan(actual, expected, message?)

// Array/Collection assertions
assertContains(array, value, message?)
assertLength(array, length, message?)

// Error assertions
assertThrows(fn, expectedError?, message?)
assertDoesNotThrow(fn, message?)

// Type assertions
assertInstanceOf(value, constructor, message?)
```

### Mock Utilities

```javascript
// Mock functions
const mockFn = MockHelper.mockFunction();
mockFn.returnValue = 42;
mockFn('arg1', 'arg2');
mockFn.callCount();              // 1
mockFn.calledWith('arg1', 'arg2'); // true
mockFn.reset();

// Mock objects
const mockObj = MockHelper.mockObject(['method1', 'method2']);
mockObj.method1.returnValue = 'result';

// Spies (wrap existing functions)
const spy = MockHelper.spy(originalFunction);

// Mock localStorage
const mockStorage = MockHelper.mockLocalStorage();
```

## Test Coverage

### Total: 280+ Tests Across All Modules

### Unit Tests

#### 1. Calculator Tests (`calculator.test.js`)
**75+ test cases covering:**

- Inflation adjustment calculations
- Standard SIP calculations
- Step-up SIP calculations
- Step-up future value calculations
- Total investment calculations
- Wealth gain calculations
- Summary calculations
- Edge cases (large amounts, long periods, extreme rates)

**Example:**
```javascript
runner.it('should calculate inflation-adjusted amount correctly', () => {
    const result = calculator.calculateInflationAdjustedAmount(100000, 6, 10);
    assertApproximately(result, 179085, 1);
});
```

#### 2. Formatter Tests (`formatter.test.js`)
**20+ test cases covering:**

- Currency formatting (₹, Lakhs, Crores)
- Percentage formatting
- Year formatting (singular/plural)
- Edge cases (negative numbers, decimals, very large/small values)

#### 3. Goal Tests (`goal.test.js`)
**25+ test cases covering:**

- Adding goals with all properties
- Removing goals
- Getting all goals
- Goal count tracking
- Storage integration
- Working without storage
- Unique ID generation

#### 4. Storage Tests (`storage.test.js`)
**20+ test cases covering:**

- Saving goals to localStorage
- Loading goals from localStorage
- Clearing goals
- Storage availability checks
- Error handling (invalid JSON, quota exceeded)
- Storage size calculation

#### 5. Templates Tests (`templates.test.js`)
**15+ test cases covering:**

- Getting all templates
- Getting template by ID
- Creating goals from templates
- Validating all 8 built-in templates
- Template property validation

#### 6. Exporter Tests (`exporter.test.js`)
**30+ test cases covering:**

- CSV export with headers and data
- JSON export with formatting
- Calculated values in exports
- Special character handling
- Empty goals arrays
- Number formatting
- Download functionality

#### 7. Importer Tests (`importer.test.js`)
**30+ test cases covering:**

- CSV parsing and validation
- JSON parsing and validation
- Multiple goals import
- Quoted fields in CSV
- Empty lines handling
- Required field validation
- Error handling for invalid data
- Async file reading

#### 8. Theme Tests (`theme.test.js`)
**25+ test cases covering:**

- Theme initialization
- Setting dark/light themes
- Theme toggling
- localStorage persistence
- System preference detection
- Working without storage
- Theme state management

#### 9. Charts Tests (`charts.test.js`)
**30+ test cases covering:**

- Year-by-year data generation
- Chart creation for single/multiple goals
- Chart destruction
- Theme updates
- Data accuracy validation
- Step-up SIP visualization
- Edge cases (short/long periods)
- Aggregated chart logic

### Functional Tests

#### Application Integration Tests (`app.test.js`)
**25+ test cases covering:**

- Application initialization
- Complete goal management flow
- Template integration
- Export/Import functionality
- Theme management
- Clear all functionality
- End-to-end scenarios
- Multiple goals with step-up SIP

**Example:**
```javascript
runner.it('should handle complete user workflow', () => {
    const app = new MultiGoalSIPApp();
    
    // 1. Add a goal
    const goalId = app.goalManager.addGoal('House', 5000000, 7, 10, 12, 0);
    
    // 2. Check calculations
    const summary = app.calculator.calculateSummary(app.goalManager.getAllGoals());
    
    // 3. Export
    const exported = app.exporter.exportToJSON(app.goalManager.getAllGoals());
    
    // 4. Clear
    app.goalManager.removeGoal(goalId);
});
```

## Writing New Tests

### Unit Test Template

```javascript
// tests/unit/mymodule.test.js
import { MyModule } from '../../js/mymodule.js';
import { assertEqual, assertTrue } from '../test-runner.js';

export function runMyModuleTests(runner) {
    runner.describe('MyModule', () => {
        let instance;

        // Setup before each test
        const beforeEach = () => {
            instance = new MyModule();
        };

        runner.it('should do something', () => {
            beforeEach();
            const result = instance.doSomething();
            assertEqual(result, expectedValue);
        });

        runner.describe('specific feature', () => {
            runner.it('should handle edge case', () => {
                beforeEach();
                // Test edge case
            });
        });
    });
}
```

### Adding Tests to Suite

1. Create your test file in `tests/unit/` or `tests/functional/`
2. Export a test runner function
3. Import and call it in `test-suite.js`:

```javascript
import { runMyModuleTests } from './unit/mymodule.test.js';

// In runAllTests()
runMyModuleTests(runner);
```

## Best Practices

### 1. Test Organization
- **Group related tests** using nested `describe()` blocks
- **Use descriptive names** that explain what is being tested
- **One assertion per test** when possible
- **Keep tests independent** - no shared state between tests

### 2. Naming Conventions
```javascript
// Good test names
'should calculate SIP correctly for 10 years'
'should return empty array when no goals exist'
'should throw error for invalid input'

// Bad test names
'test1'
'works'
'edge case'
```

### 3. Setup and Teardown
```javascript
const beforeEach = () => {
    // Setup code
};

const afterEach = () => {
    // Cleanup code
};

runner.it('test name', () => {
    beforeEach();
    // Test code
    afterEach();
});
```

### 4. Mocking
- **Mock external dependencies** (localStorage, DOM, etc.)
- **Use spies** to verify function calls
- **Reset mocks** between tests

### 5. Assertions
- **Use specific assertions** (assertApproximately for floats)
- **Provide helpful messages** for assertion failures
- **Test both success and failure cases**

## Test Categories

### Unit Tests
- **Pure functions** - Calculator, Formatter
- **Business logic** - GoalManager, StorageService
- **Utility classes** - TemplateManager
- **Isolated components** - Each module tested independently

### Functional Tests
- **Integration scenarios** - Multiple modules working together
- **User workflows** - Complete feature flows
- **End-to-end** - From user action to result
- **Cross-module** - Module interactions

## Debugging Failed Tests

### Console Output
```javascript
// Failed test example in console:
❌ Calculator > calculateMonthlySIP > should handle different time periods
   Error: Expected 4347 but got 4348
   Stack: ...
```

### HTML Report
- Red border indicates failed test
- Error message displayed below test name
- Suite statistics show pass/fail count

### Tips
1. **Check the error message** - Usually indicates what went wrong
2. **Review the test code** - Ensure test logic is correct
3. **Verify actual behavior** - Test might be wrong, not the code
4. **Use console.log** - Add debug output to tests
5. **Run single test** - Comment out other tests to focus

## Performance

### Test Execution Speed
- **~200 tests** run in under 2 seconds
- **Async support** for future async tests
- **Parallel suite execution** possible (not currently implemented)

### Memory Usage
- **Minimal footprint** - No external dependencies
- **Proper cleanup** - Mocks and DOM reset after tests
- **No leaks** - All resources properly released

## Continuous Integration

### Local CI Script
```bash
#!/bin/bash
# ci-test.sh

# Start server
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait for server
sleep 2

# Run tests (requires headless browser or Puppeteer)
# TODO: Add headless browser testing

# Kill server
kill $SERVER_PID
```

### Future Enhancements
- [ ] Headless browser testing (Puppeteer)
- [ ] Code coverage reporting
- [ ] CI/CD integration (GitHub Actions)
- [ ] Automated screenshot testing
- [ ] Performance benchmarking

## Troubleshooting

### Tests Not Running
1. **Check browser console** for errors
2. **Verify server is running** on correct port
3. **Check file paths** in imports
4. **Ensure ES6 modules supported** by browser

### localStorage Tests Failing
- **Incognito mode** may have restricted localStorage
- **Browser settings** may block storage
- **Quota exceeded** - Clear browser storage

### Assertion Failures
- **Floating point precision** - Use `assertApproximately()`
- **Array/Object comparison** - Use `assertDeepEqual()`
- **Async timing** - Ensure async operations complete

## Additional Resources

### Related Documentation
- **README.md** - Application overview and architecture
- **.cursorrules** - Detailed module documentation
- **PROJECT_SUMMARY.md** - Project summary and features

### External References
- **Jest Documentation** - Similar testing patterns
- **Mocha/Chai** - Assertion library inspiration
- **Testing Best Practices** - General testing principles

## Contributing

### Adding New Test Coverage
1. Identify untested code paths
2. Write test cases following templates
3. Ensure tests are independent
4. Add to appropriate test file
5. Update this guide if needed

### Improving Test Framework
1. Add new assertion methods
2. Enhance mock utilities
3. Improve error messages
4. Add test helpers

---

**Test Coverage Target**: 80%+ code coverage  
**Current Status**: ~75% estimated coverage  
**Last Updated**: October 5, 2025

