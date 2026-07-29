export function toMathRound(id, spin) {
    const payoutMultiplier = Math.round((spin.win / spin.bet) * 100);

    const events = [
        {
            type: "spin",
            mode: spin.mode,
            symbols: spin.result,
            bonus: spin.bonus ? spin.bonus.type : null
        }
    ];

    return {
        id,
        events,
        payoutMultiplier
    };
}