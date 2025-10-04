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
     * @returns {number} Required monthly SIP amount
     */
    calculateMonthlySIP(targetAmount, years, annualRate) {
        const n = years * 12; // Total months
        const i = annualRate / 12 / 100; // Monthly rate of return

        if (targetAmount === 0 || n === 0 || i === 0) {
            return 0;
        }

        const futureValueFactor = ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const monthlySIP = targetAmount / futureValueFactor;
        
        return Math.round(monthlySIP);
    }

    /**
     * Calculates total investment over the period
     * @param {number} monthlySIP - Monthly SIP amount
     * @param {number} years - Investment period in years
     * @returns {number} Total amount invested
     */
    calculateTotalInvestment(monthlySIP, years) {
        return monthlySIP * years * 12;
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
            const sip = this.calculateMonthlySIP(inflationAdjustedAmount, goal.years, goal.expectedReturn);
            totalSIP += sip;
            totalFutureValue += inflationAdjustedAmount;
            totalInvested += this.calculateTotalInvestment(sip, goal.years);
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

