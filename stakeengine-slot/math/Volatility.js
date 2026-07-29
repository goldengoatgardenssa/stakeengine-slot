export function calculateVolatility(spins) {
    const wins = spins.map(s => s.win);
    const mean = wins.reduce((a,b)=>a+b,0) / wins.length;
    const variance = wins.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / wins.length;
    return Math.sqrt(variance);
}