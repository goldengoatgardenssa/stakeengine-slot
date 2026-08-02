export default {
  title: "UI/Buttons",
  tags: ["autodocs"],
};

export const Spin = () => {
  const btn = document.createElement("button");
  btn.className = "spin-button";
  btn.textContent = "SPIN";
  return btn;
};

export const BonusBuy = () => {
  const btn = document.createElement("button");
  btn.className = "bonus-buy-button";
  btn.textContent = "BONUS BUY";
  return btn;
};

export const ButtonGroup = () => {
  const container = document.createElement("div");
  container.className = "storybook-ui-demo";

  const spinBtn = document.createElement("button");
  spinBtn.className = "spin-button";
  spinBtn.textContent = "SPIN";

  const bonusBtn = document.createElement("button");
  bonusBtn.className = "bonus-buy-button";
  bonusBtn.textContent = "BONUS BUY";

  container.appendChild(spinBtn);
  container.appendChild(bonusBtn);
  return container;
};
