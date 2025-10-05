/**
 * SIP calculation logic
 * Handles all financial calculations following the Single Responsibility Principle
 */

/**
 * Calculator class for SIP-related computations
 */
export class SIPCalculator {
    /**
     * Calculates the future value of a current amount adjusted for inflation
     * 
     * Formula: FV = PV * (1 + r)^n
     * Where:
     * - FV = Future Value
     * - PV = Present Value (current price)
     * - r = Inflation rate (annual)
     * - n = Number of years
     * 
     * @param {number} currentPrice - Current market price
     * @param {number} inflationRate - Annual inflation rate percentage
     * @param {number} years - Investment period in years
     * @returns {number} Future value adjusted for inflation
     */
    calculateInflationAdjustedAmount(currentPrice, inflationRate, years) {
        if (currentPrice === 0 || years === 0) {
            return currentPrice;
        }
        
        const r = inflationRate / 100; // Convert percentage to decimal
        const futureValue = currentPrice * Math.pow(1 + r, years);
        
        return Math.round(futureValue);
    }

    /**
     * Calculates the monthly SIP amount required to reach a target
     * 
     * Formula: P = FV / [((1 + i)^n - 1) / i) * (1 + i)]
     * Where:
     * - P = Monthly SIP amount
     * - FV = Future Value (target amount)
     * - i = Monthly rate of return
     * - n = Number of months
     * 
     * @param {number} targetAmount - The future value to achieve
     * @param {number} years - Investment period in years
     * @param {number} annualRate - Expected annual return percentage
     * @param {number} [stepUpRate] - Optional annual SIP increase rate percentage
     * @returns {number} Required monthly SIP amount
     */
    calculateMonthlySIP(targetAmount, years, annualRate, stepUpRate = 0) {
        const n = years * 12; // Total months
        const i = annualRate / 12 / 100; // Monthly rate of return

        if (targetAmount === 0 || n === 0 || i === 0) {
            return 0;
        }

        // If no step-up, use standard SIP formula
        if (!stepUpRate || stepUpRate === 0) {
            const futureValueFactor = ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const monthlySIP = targetAmount / futureValueFactor;
            return Math.round(monthlySIP);
        }

        // Step-up SIP calculation
        return this.calculateStepUpSIP(targetAmount, years, annualRate, stepUpRate);
    }

    /**
     * Calculates step-up SIP amount (SIP that increases annually)
     * 
     * @param {number} targetAmount - The future value to achieve
     * @param {number} years - Investment period in years
     * @param {number} annualRate - Expected annual return percentage
     * @param {number} stepUpRate - Annual SIP increase rate percentage
     * @returns {number} Initial monthly SIP amount
     */
    calculateStepUpSIP(targetAmount, years, annualRate, stepUpRate) {
        const monthlyRate = annualRate / 12 / 100;
        const annualStepUp = stepUpRate / 100;
        
        // Use iterative approach to find initial SIP
        let low = 0;
        let high = targetAmount / 12;
        let initialSIP = 0;
        const tolerance = 1;

        while (high - low > tolerance) {
            initialSIP = (low + high) / 2;
            const fv = this.calculateStepUpFutureValue(initialSIP, years, annualRate, stepUpRate);
            
            if (fv < targetAmount) {
                low = initialSIP;
            } else {
                high = initialSIP;
            }
        }

        return Math.round(initialSIP);
    }

    /**
     * Calculates future value for step-up SIP
     * 
     * @param {number} initialSIP - Initial monthly SIP amount
     * @param {number} years - Investment period in years
     * @param {number} annualRate - Expected annual return percentage
     * @param {number} stepUpRate - Annual SIP increase rate percentage
     * @returns {number} Future value
     */
    calculateStepUpFutureValue(initialSIP, years, annualRate, stepUpRate) {
        const monthlyRate = annualRate / 12 / 100;
        const annualStepUp = stepUpRate / 100;
        let futureValue = 0;
        let currentSIP = initialSIP;

        for (let year = 0; year < years; year++) {
            // Calculate FV for this year's SIP contributions
            const monthsRemaining = (years - year) * 12;
            
            for (let month = 0; month < 12; month++) {
                const totalMonths = monthsRemaining - month;
                futureValue += currentSIP * Math.pow(1 + monthlyRate, totalMonths);
            }

            // Increase SIP for next year
            currentSIP *= (1 + annualStepUp);
        }

        return futureValue;
    }

    /**
     * Calculates total investment over the period
     * @param {number} monthlySIP - Monthly SIP amount
     * @param {number} years - Investment period in years
     * @param {number} [stepUpRate] - Optional annual SIP increase rate percentage
     * @returns {number} Total amount invested
     */
    calculateTotalInvestment(monthlySIP, years, stepUpRate = 0) {
        if (!stepUpRate || stepUpRate === 0) {
            return monthlySIP * years * 12;
        }

        // Step-up investment calculation
        const annualStepUp = stepUpRate / 100;
        let totalInvestment = 0;
        let currentSIP = monthlySIP;

        for (let year = 0; year < years; year++) {
            totalInvestment += currentSIP * 12;
            currentSIP *= (1 + annualStepUp);
        }

        return totalInvestment;
    }

    /**
     * Calculates wealth gained (returns earned)
     * @param {number} futureValue - Total future value
     * @param {number} totalInvested - Total amount invested
     * @returns {number} Wealth gained
     */
    calculateWealthGain(futureValue, totalInvested) {
        return futureValue - totalInvested;
    }

    /**
     * Calculates aggregate summary for multiple goals with inflation adjustment
     * @param {Array<Object>} goals - Array of goal objects
     * @returns {Object} Summary with totalSIP, totalFutureValue, totalInvested, totalWealthGained
     */
    calculateSummary(goals) {
        let totalSIP = 0;
        let totalFutureValue = 0;
        let totalInvested = 0;

        goals.forEach(goal => {
            const inflationAdjustedAmount = this.calculateInflationAdjustedAmount(
                goal.currentPrice,
                goal.inflationRate,
                goal.years
            );
            const stepUpRate = goal.stepUpRate || 0;
            const sip = this.calculateMonthlySIP(inflationAdjustedAmount, goal.years, goal.expectedReturn, stepUpRate);
            totalSIP += sip;
            totalFutureValue += inflationAdjustedAmount;
            totalInvested += this.calculateTotalInvestment(sip, goal.years, stepUpRate);
        });

        const totalWealthGained = this.calculateWealthGain(totalFutureValue, totalInvested);

        return {
            totalSIP,
            totalFutureValue,
            totalInvested: Math.max(totalInvested, 0),
            totalWealthGained: Math.max(totalWealthGained, 0)
        };
    }
}

