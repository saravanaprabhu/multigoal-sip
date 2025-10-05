# Multi-Goal SIP Planner

A modern, modular web application for planning multiple financial goals using Systematic Investment Plans (SIPs). Calculate the monthly investment required to achieve your life goals.

## Features

- **Multi-Goal Planning**: Add and manage multiple financial goals simultaneously
- **Real-Time Calculations**: Instantly see required monthly SIP amounts
- **Inflation Adjustment**: Calculate future costs based on expected inflation rates
- **Persistent Storage**: Goals are automatically saved to localStorage
- **Comprehensive Summary**: View total investment, future value, and wealth gains
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **Modular Architecture**: Built following SOLID principles for maintainability

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for ES6 modules)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd multigoal-sip
   ```

2. Start a local web server:

   **Option 1: Using Python**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option 2: Using Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 3: Using PHP**
   ```bash
   php -S localhost:8000
   ```

   **Option 4: Using VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Why Do I Need a Local Server?

This application uses ES6 modules (`import`/`export`), which require a server due to CORS restrictions. Opening the HTML file directly (`file://`) will not work.

## Usage

1. **Add a Goal**: Fill in the goal details in the form:
   - Goal name (e.g., "Child's Education")
   - Current price in rupees (today's cost)
   - Inflation rate percentage (expected annual inflation)
   - Timeframe in years (when you need the money)
   - Expected annual return percentage (from your investments)

2. **How It Works**: The app:
   - Calculates the future value of your goal adjusted for inflation
   - Determines the required monthly SIP to reach that inflated target
   - Shows both current and future costs for transparency

3. **View Results**: The app displays:
   - Inflation-adjusted future target amount for each goal
   - Required monthly SIP for each goal
   - Total monthly SIP needed across all goals
   - Total future value of all investments
   - Total amount you'll invest
   - Total wealth gain (returns earned)

4. **Remove Goals**: Click the × button on any goal card to remove it

5. **Clear All Goals**: Use the "Clear All" button to remove all goals at once (with confirmation)

6. **Automatic Persistence**: Your goals are automatically saved to your browser's localStorage and will be restored when you return

## Architecture

The application follows SOLID principles with a modular architecture:

### File Structure

```
multigoal-sip/
├── index.html           # Main HTML structure
├── styles.css          # Application styles
├── README.md           # Documentation
└── js/
    ├── app.js          # Application orchestration
    ├── goal.js         # Goal data management
    ├── calculator.js   # SIP calculation logic
    ├── formatter.js    # Data formatting utilities
    ├── storage.js      # localStorage persistence service
    └── ui.js          # UI rendering and DOM manipulation
```

### Module Responsibilities

#### `goal.js` - Data Management
**Purpose**: Manages goal data and operations

**Class**: `GoalManager`
- `addGoal(name, currentPrice, inflationRate, years, expectedReturn)` - Adds a new goal
- `removeGoal(goalId)` - Removes a goal by ID
- `getAllGoals()` - Returns all goals
- `getGoalCount()` - Returns total number of goals
- `clearAllGoals()` - Clears all goals
- `loadFromStorage()` - Loads goals from storage service
- `saveToStorage()` - Saves goals to storage service (private)

**Dependencies**:
- Optionally receives `StorageService` via dependency injection
- Automatically persists changes when storage service is available

**Goal Properties**:
- `currentPrice` - Today's cost of the goal
- `inflationRate` - Expected annual inflation rate
- `years` - Time horizon for the goal
- `expectedReturn` - Expected annual return from investments

**Design Principles**:
- Single Responsibility: Only handles goal data operations
- Dependency Injection: Storage service is optional and injected
- No direct localStorage access - delegates to storage service

#### `calculator.js` - Business Logic
**Purpose**: Performs all financial calculations

**Class**: `SIPCalculator`
- `calculateInflationAdjustedAmount(currentPrice, inflationRate, years)` - Calculates future value with inflation
- `calculateMonthlySIP(targetAmount, years, annualRate)` - Calculates required monthly SIP
- `calculateTotalInvestment(monthlySIP, years)` - Calculates total investment amount
- `calculateWealthGain(futureValue, totalInvested)` - Calculates wealth gained
- `calculateSummary(goals)` - Calculates aggregate summary for all goals with inflation adjustment

**Financial Formulas**:

1. **Inflation Adjustment Formula**:
```
FV = PV * (1 + r)^n

Where:
- FV = Future Value (inflation-adjusted amount)
- PV = Present Value (current price)
- r = Inflation rate (annual, as decimal)
- n = Number of years
```

2. **SIP Calculation Formula**:
```
P = FV / [((1 + i)^n - 1) / i) * (1 + i)]

Where:
- P = Monthly SIP amount
- FV = Future Value (inflation-adjusted target)
- i = Monthly rate of return (annualRate / 12 / 100)
- n = Number of months (years * 12)
```

**Design Principles**:
- Single Responsibility: Only handles calculations
- No side effects or state mutations
- Pure functions for predictable testing
- Inflation adjustment calculated before SIP computation

#### `formatter.js` - Presentation Layer
**Purpose**: Formats data for display

**Class**: `Formatter`
- `formatCurrency(amount)` - Formats numbers as Indian currency (₹)
- `formatPercentage(percentage)` - Formats percentage values
- `formatYears(years)` - Formats year counts

**Design Principles**:
- Single Responsibility: Only handles formatting
- Uses `Intl.NumberFormat` for locale-specific formatting
- Extensible for additional formatting needs

#### `storage.js` - Persistence Layer
**Purpose**: Handles data persistence using browser's localStorage API

**Class**: `StorageService`
- `saveGoals(goals)` - Saves goals array to localStorage
- `loadGoals()` - Loads goals array from localStorage
- `clearGoals()` - Clears all stored goals
- `isAvailable()` - Checks if localStorage is available
- `getStorageSize()` - Gets size of stored data in bytes

**Storage Key**: `multigoal-sip-goals` (configurable)

**Design Principles**:
- Single Responsibility: Only handles localStorage operations
- Error handling: Gracefully handles storage errors
- Validation: Validates loaded data before returning
- No business logic: Pure storage operations only

#### `ui.js` - View Layer
**Purpose**: Handles all DOM manipulation and rendering

**Class**: `UIRenderer`
- `render(goals)` - Renders the entire UI
- `renderGoalsList(goals)` - Renders goal cards
- `createGoalCard(goal)` - Creates a single goal card element
- `updateSummary(goals)` - Updates summary statistics
- `getFormValues()` - Retrieves and validates form input
- `resetForm()` - Clears the form

**Dependencies**:
- Receives `SIPCalculator` and `Formatter` via dependency injection
- Uses injected dependencies for calculations and formatting

**Design Principles**:
- Single Responsibility: Only handles UI updates
- Dependency Inversion: Depends on abstractions (calculator, formatter)
- No business logic - delegates to calculator

#### `app.js` - Application Controller
**Purpose**: Orchestrates all components and handles application lifecycle

**Class**: `MultiGoalSIPApp`
- `constructor()` - Initializes all components
- `checkStorageAvailability()` - Validates localStorage availability
- `loadSavedGoals()` - Restores goals from storage on startup
- `initializeEventListeners()` - Sets up event handlers
- `handleAddGoal()` - Handles goal addition
- `handleRemoveGoal(event)` - Handles goal removal
- `handleClearAll()` - Handles clearing all goals
- `render()` - Triggers UI render

**Lifecycle**:
1. Creates storage service
2. Initializes goal manager with storage service
3. Checks storage availability
4. Loads saved goals from localStorage
5. Sets up event listeners
6. Renders initial state

**Design Principles**:
- Dependency Injection: Creates and injects dependencies
- Event coordination: Manages user interactions
- Minimal logic: Delegates to specialized modules
- Graceful degradation: Works without localStorage

### SOLID Principles Applied

#### Single Responsibility Principle (SRP)
Each module has one clear responsibility:
- `goal.js` - Data management only
- `calculator.js` - Calculations only
- `formatter.js` - Formatting only
- `ui.js` - UI rendering only
- `app.js` - Coordination only

#### Open/Closed Principle (OCP)
- Classes are open for extension but closed for modification
- New goal types can be added by extending `GoalManager`
- New calculation methods can be added to `SIPCalculator`
- New formatters can be added to `Formatter`

#### Liskov Substitution Principle (LSP)
- Components accept interfaces that can be substituted
- `UIRenderer` can work with any object implementing calculator/formatter interface

#### Interface Segregation Principle (ISP)
- Each class has focused, minimal interfaces
- No class depends on methods it doesn't use
- Small, cohesive public APIs

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions
- `app.js` creates and injects dependencies
- `ui.js` receives calculator and formatter via constructor
- Easy to swap implementations for testing

## Development

### Adding New Features

#### Adding a New Calculation
1. Add method to `SIPCalculator` class in `calculator.js`
2. Update UI rendering in `ui.js` if needed
3. No changes needed to other modules

#### Adding a New Display Format
1. Add method to `Formatter` class in `formatter.js`
2. Use new formatter method in `ui.js`
3. No changes needed to calculation logic

#### Adding New Goal Properties
1. Update `GoalManager.addGoal()` signature in `goal.js`
2. Update form in `index.html` to include new input field
3. Update `UIRenderer.getFormValues()` in `ui.js` to capture new field
4. Update card template in `UIRenderer.createGoalCard()` in `ui.js` to display new property
5. Update `app.js` to pass new property when calling `addGoal()`
6. No changes needed to storage - JSON serialization handles new properties automatically

**Example**: The inflation feature was added following these exact steps:
- Added `inflationRate` parameter to `GoalManager.addGoal()`
- Added inflation rate input field to form
- Updated `getFormValues()` to capture inflation rate
- Added `calculateInflationAdjustedAmount()` to calculator
- Updated card display to show both current and future values

#### Adding Persistence to New Features
The storage layer automatically persists any properties added to goals:
- Add new properties to the goal object in `GoalManager.addGoal()`
- Storage service handles serialization/deserialization automatically
- No changes needed to `storage.js` for new goal properties

### Testing Strategy

Each module can be tested independently:

- **`goal.js`**: Test data operations (add, remove, retrieve)
- **`calculator.js`**: Test calculation accuracy with known inputs
- **`formatter.js`**: Test formatting output for various inputs
- **`ui.js`**: Test DOM manipulation (requires jsdom or similar)
- **`app.js`**: Integration tests for complete workflows

### Code Style

The codebase follows these conventions:
- **JSDoc comments** for all classes and methods (Google style)
- **ES6 modules** with explicit imports/exports
- **Descriptive naming** using camelCase for variables/functions, PascalCase for classes
- **Pure functions** where possible for predictable behavior
- **Dependency injection** for testability

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom styles with CSS variables
- **JavaScript (ES6+)**: Modules, classes, arrow functions
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Google Fonts**: Inter font family

### Browser Compatibility

- Chrome 61+ (ES6 modules support)
- Firefox 60+
- Safari 11+
- Edge 16+

### Browser Storage

- Uses localStorage API for data persistence
- Storage limit: Typically 5-10MB per domain
- Data persists across browser sessions
- Graceful degradation: App works without localStorage (no persistence)
- Clear browser data will remove saved goals

### Performance Considerations

- Lightweight: No build process or heavy dependencies
- Fast rendering: Efficient DOM manipulation
- Minimal recalculations: Only updates when data changes
- Automatic persistence: Goals saved immediately on add/remove
- No network requests: All data stored locally

## Future Enhancements

Potential features to add:
- [x] Inflation adjustment for target amounts (✅ Implemented)
- [x] Local storage persistence for goals (✅ Implemented)
- [ ] Export goals to CSV/PDF
- [ ] Import goals from CSV/JSON
- [ ] Visual charts showing investment growth over time
- [ ] Step-up SIP calculations (increasing SIP annually)
- [ ] Variable inflation rates (different rates for different years)
- [ ] Multiple currency support
- [ ] Dark mode theme
- [ ] Goal templates for common financial goals
- [ ] Tax-adjusted returns calculations
- [ ] Emergency fund calculator
- [ ] Debt payoff planner integration

## Contributing

When making changes:
1. Follow the existing code style
2. Maintain SOLID principles
3. Add JSDoc comments for new functions
4. Test changes across modules
5. Update this README if adding new features

## License

[Your License Here]

## Support

For issues or questions, please open an issue on the repository.