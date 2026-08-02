export default {
  title: "Bonus/Entry",
  tags: ["autodocs"],
};

export const Trigger = () => {
  const container = document.createElement("div");
  container.className = "storybook-bonus-overlay";

  const card = document.createElement("div");
  card.className = "storybook-bonus-card";
  card.innerHTML = `
    <h1>BONUS ACTIVATED</h1>
    <p>Preparing free spins...</p>
  `;

  container.appendChild(card);
  return container;
};
