# Multi-Goal SIP Planner

A modern, modular web application for planning multiple financial goals using Systematic Investment Plans (SIPs). Calculate the monthly investment required to achieve your life goals.

## Features

- **Multi-Goal Planning**: Add and manage multiple financial goals simultaneously
- **Real-Time Calculations**: Instantly see required monthly SIP amounts
- **Inflation Adjustment**: Calculate future costs based on expected inflation rates
- **Step-up SIP Support**: Optional annual SIP increment (5-15% typical)
- **Visual Growth Charts**: Interactive charts showing investment growth over time
- **Data Export/Import**: Download and upload goals in CSV or JSON format
- **Goal Templates**: 8 pre-configured templates for common financial goals
- **Dark Mode**: Beautiful dark theme with automatic persistence
- **Persistent Storage**: Goals automatically saved to localStorage
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

2. **Use Templates** (Optional): Select from 8 pre-configured templates:
   - 🎓 Child's Higher Education
   - 🏠 Buy a House
   - 🌴 Retirement Fund
   - 🚗 Buy a Car
   - 💒 Wedding Expenses
   - ✈️ Dream Vacation
   - 💼 Start a Business
   - 🏥 Emergency Fund

3. **Enable Step-up SIP** (Optional): Set annual increment rate (e.g., 10% increase yearly)

4. **How It Works**: The app:
   - Calculates the future value of your goal adjusted for inflation
   - Determines the required monthly SIP (or step-up SIP) to reach that target
   - Shows both current and future costs for transparency
   - Generates interactive charts showing investment growth over time

5. **View Results**: The app displays:
   - **Goal Cards**: Individual goal details with SIP amounts
   - **Interactive Chart**: Visual representation of investment growth
   - **Summary Panel**: 
     - Total monthly SIP needed across all goals
     - Total future value of all investments
     - Total amount you'll invest
     - Total wealth gain (returns earned)

6. **Manage Goals**:
   - **Remove**: Click the × button on any goal card
   - **Clear All**: Remove all goals at once (with confirmation)
   - **Export**: Download goals as CSV or JSON
   - **Import**: Upload previously saved goals

7. **Theme Toggle**: Switch between light and dark modes

8. **Automatic Persistence**: Goals and theme preference automatically saved and restored

## Architecture

The application follows SOLID principles with a modular architecture:

### File Structure

```
multigoal-sip/
├── index.html           # Main HTML structure
├── styles.css          # Application styles
├── README.md           # Documentation
├── .cursorrules        # Cursor AI context rules
└── js/
    ├── app.js          # Application orchestration
    ├── goal.js         # Goal data management
    ├── calculator.js   # SIP calculation logic (includes step-up SIP)
    ├── formatter.js    # Data formatting utilities
    ├── storage.js      # localStorage persistence service
    ├── ui.js          # UI rendering and DOM manipulation
    ├── exporter.js     # Data export functionality (CSV/JSON)
    ├── importer.js     # Data import functionality (CSV/JSON)
    ├── templates.js    # Goal templates management
    ├── theme.js        # Dark/light theme management
    └── charts.js       # Chart visualization (Chart.js integration)
```

### Module Responsibilities

#### `goal.js` - Data Management
**Purpose**: Manages goal data and operations

**Class**: `GoalManager`
- `addGoal(name, currentPrice, inflationRate, years, expectedReturn, stepUpRate)` - Adds a new goal
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
- `id` - Unique identifier
- `name` - Goal name
- `currentPrice` - Today's cost of the goal
- `inflationRate` - Expected annual inflation rate (%)
- `years` - Time horizon for the goal
- `expectedReturn` - Expected annual return from investments (%)
- `stepUpRate` - Optional annual SIP increase rate (%, default: 0)

**Design Principles**:
- Single Responsibility: Only handles goal data operations
- Dependency Injection: Storage service is optional and injected
- No direct localStorage access - delegates to storage service

#### `calculator.js` - Business Logic
**Purpose**: Performs all financial calculations

**Class**: `SIPCalculator`
- `calculateInflationAdjustedAmount(currentPrice, inflationRate, years)` - Calculates future value with inflation
- `calculateMonthlySIP(targetAmount, years, annualRate, stepUpRate)` - Calculates required monthly SIP
- `calculateStepUpSIP(targetAmount, years, annualRate, stepUpRate)` - Calculates step-up SIP using binary search
- `calculateStepUpFutureValue(initialSIP, years, annualRate, stepUpRate)` - Calculates FV for step-up SIP
- `calculateTotalInvestment(monthlySIP, years, stepUpRate)` - Calculates total investment with step-up support
- `calculateWealthGain(futureValue, totalInvested)` - Calculates wealth gained
- `calculateSummary(goals)` - Calculates aggregate summary for all goals with inflation and step-up support

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

**Storage Keys**: 
- `multigoal-sip-goals` - Goals data
- `multigoal-sip-theme` - Theme preference

**Design Principles**:
- Single Responsibility: Only handles localStorage operations
- Error handling: Gracefully handles storage errors
- Validation: Validates loaded data before returning
- No business logic: Pure storage operations only

#### `exporter.js` - Data Export
**Purpose**: Exports goals to various file formats

**Class**: `Exporter`
- `exportToCSV(goals)` - Converts goals to CSV format
- `exportToJSON(goals)` - Converts goals to JSON format
- `exportCSV(goals)` - Exports and downloads as CSV file
- `exportJSON(goals)` - Exports and downloads as JSON file
- `downloadFile(content, filename, mimeType)` - Handles file download

**Export Format**: Includes all goal properties plus calculated values (future target, SIP amount, total investment, wealth gain)

#### `importer.js` - Data Import
**Purpose**: Imports and validates goals from file uploads

**Class**: `Importer`
- `parseCSV(csvContent)` - Parses CSV file content
- `parseJSON(jsonContent)` - Parses JSON file content
- `importCSV(file)` - Imports goals from CSV file
- `importJSON(file)` - Imports goals from JSON file
- `validateGoal(goal, lineNumber)` - Validates goal data

**Features**: Comprehensive validation, error handling, supports merge or replace on import

#### `templates.js` - Goal Templates
**Purpose**: Provides pre-configured goal templates

**Class**: `TemplateManager`
- `getAllTemplates()` - Returns all available templates
- `getTemplate(templateId)` - Gets specific template by ID
- `createGoalFromTemplate(templateId)` - Creates goal from template
- `addCustomTemplate(template)` - Adds custom template

**Built-in Templates**: 8 common financial goals with realistic default values

#### `theme.js` - Theme Management
**Purpose**: Handles dark/light theme switching

**Class**: `ThemeManager`
- `loadTheme()` - Loads saved theme or detects system preference
- `toggleTheme()` - Switches between light and dark
- `setTheme(theme)` - Sets specific theme
- `getCurrentTheme()` - Returns current theme
- `initialize()` - Applies theme on page load

**Features**: Respects system preference, persists choice, smooth transitions

#### `charts.js` - Visualization
**Purpose**: Creates interactive investment growth charts using Chart.js

**Class**: `ChartManager`
- `generateGoalData(goal)` - Generates year-by-year investment data
- `createChart(goals, canvasId, theme)` - Creates/updates chart
- `createSingleGoalChart(goal, ctx, theme)` - Chart for one goal
- `createAggregatedChart(goals, ctx, theme)` - Combined chart for multiple goals
- `updateTheme(theme, goals, canvasId)` - Updates chart colors for theme
- `destroy()` - Cleans up chart instance

**Features**: 
- Interactive tooltips with formatted currency
- Dual-line display (invested vs future value)
- Auto-aggregation for multiple goals
- Theme-aware colors
- Responsive design

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
- `initializeEventListeners()` - Sets up all event handlers
- `handleAddGoal()` - Handles goal addition
- `handleRemoveGoal(event)` - Handles goal removal
- `handleClearAll()` - Handles clearing all goals
- `handleExportCSV()` - Handles CSV export
- `handleExportJSON()` - Handles JSON export
- `handleImport(event)` - Handles file import
- `handleUseTemplate()` - Handles template selection
- `handleThemeToggle()` - Handles theme switching
- `render()` - Triggers UI and chart render
- `renderChart(goals)` - Updates investment growth chart

**Lifecycle**:
1. Creates all service instances (storage, theme, calculator, etc.)
2. Initializes theme from saved preference or system
3. Checks storage availability
4. Loads saved goals from localStorage
5. Sets up all event listeners (form, buttons, file input, templates, theme toggle)
6. Renders initial state (UI and charts)

**Design Principles**:
- Dependency Injection: Creates and injects all dependencies
- Event coordination: Manages all user interactions
- Minimal logic: Delegates to specialized modules
- Graceful degradation: Works without localStorage
- Single orchestration point: All components initialized here

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
- **CSS3**: Custom styles with smooth transitions
- **JavaScript (ES6+)**: Modules, classes, arrow functions, async/await
- **Tailwind CSS 3.x**: Utility-first CSS framework (CDN) with dark mode support
- **Chart.js 4.4.0**: Interactive chart library (CDN)
- **Google Fonts**: Inter font family
- **No Build Tools**: Zero dependencies, runs directly in browser

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

- **Lightweight**: No build process, only 2 CDN dependencies (Tailwind + Chart.js)
- **Fast rendering**: Efficient DOM manipulation with minimal reflows
- **Smart recalculations**: Only updates when data changes
- **Automatic persistence**: Goals saved immediately on add/remove
- **No network requests**: All data stored locally
- **Chart optimization**: Binary search algorithm for step-up SIP calculations
- **Memory management**: Proper chart cleanup prevents memory leaks
- **Code splitting**: ES6 modules loaded on-demand by browser

## Implemented Features ✅

All core features have been successfully implemented:
- [x] **Inflation adjustment** for target amounts
- [x] **Local storage persistence** for goals and theme
- [x] **Export goals** to CSV and JSON
- [x] **Import goals** from CSV/JSON with validation
- [x] **Visual charts** showing investment growth over time (Chart.js)
- [x] **Step-up SIP calculations** with annual increments
- [x] **Dark mode theme** with system preference detection
- [x] **Goal templates** (8 pre-configured templates)

## Future Enhancement Ideas

Additional features that could be added:
- [ ] Variable inflation rates (different rates for different years)
- [ ] Multiple currency support (USD, EUR, GBP, etc.)
- [ ] Tax-adjusted returns calculations
- [ ] Emergency fund calculator
- [ ] Debt payoff planner integration
- [ ] Goal milestones and progress tracking
- [ ] Email/calendar reminders
- [ ] Mobile app version (React Native/PWA)
- [ ] Multi-user support with cloud sync
- [ ] PDF report generation
- [ ] Historical performance tracking
- [ ] What-if scenario analysis

## Contributing

When making changes:
1. Follow the existing code style
2. Maintain SOLID principles
3. Add JSDoc comments for new functions
4. Test changes across modules
5. Update this README if adding new features

## Project Status

**Version**: 1.0.0  
**Status**: ✅ Complete and Production Ready

All planned features have been implemented following SOLID principles. The application is fully functional, well-tested, and ready for use.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! When making changes:
1. Follow the existing code style and SOLID principles
2. Maintain modular architecture
3. Add JSDoc comments for new functions
4. Test changes across all affected modules
5. Update documentation if adding new features

## Support

For issues, questions, or feature requests:
- Open an issue on the repository
- Check existing documentation in README.md and .cursorrules
- Review the modular architecture section for development guidance

## Acknowledgments

- **Chart.js** for beautiful interactive charts
- **Tailwind CSS** for rapid UI development
- **Google Fonts** for the Inter typeface
- Built with ❤️ following SOLID principles and clean code practices