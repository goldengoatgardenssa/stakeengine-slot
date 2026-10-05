export function describeBonus(bonus) {
    if (!bonus) return "";
    switch (bonus.type) {
        case "free_spins":
            return `FREE SPINS TRIGGERED! You have been awarded ${bonus.spins} Free Spins with enhanced multipliers.`;
        case "feature_spin":
            return `FEATURE SPIN ACTIVATED! Guaranteed high-value symbol stacks on the reels.`;
        case "bonus_buy_super":
            return `SUPER BONUS BUY ACTIVATED! Maximum volatility mode with progressive global multipliers.`;
        default:
            return `BONUS ROUND ACTIVE! Good luck!`;
    }
}
