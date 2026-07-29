export function calculateRTP(spins) {
    const totalBet = spins.length;
    const totalWin = spins.reduce((acc, s) => acc + s.win, 0);
    return totalWin / totalBet;
}