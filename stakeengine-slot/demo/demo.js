import SlotEngine from "../engine/SlotEngine.js";

const engine = new SlotEngine();
const resultDiv = document.getElementById("result");

function renderSpin(spin) {
    resultDiv.classList.remove("win");

    resultDiv.innerText =
        `Mode: ${spin.mode}\n` +
        `Result: ${spin.result.join(" - ")}\n` +
        `Bet: ${spin.bet} | Win: ${spin.win}\n` +
        (spin.bonus ? `Bonus: ${spin.bonus.type}\n` : "");

    if (spin.win > 0) {
        resultDiv.classList.add("win");
    }
}

document.getElementById("spinBase").onclick = () => {
    const spin = engine.spin("base");
    renderSpin(spin);
};

document.getElementById("spinFeature").onclick = () => {
    const spin = engine.spin("feature_spin");
    renderSpin(spin);
};

document.getElementById("buyBase").onclick = () => {
    const spin = engine.spin("bonus_buy_base");
    renderSpin(spin);
};

document.getElementById("buySuper").onclick = () => {
    const spin = engine.spin("bonus_buy_super");
    renderSpin(spin);
};