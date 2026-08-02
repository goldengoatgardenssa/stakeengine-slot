export const parameters = {
  actions: { argsToIgnore: ["element", "target", "currentTarget", "srcElement", "path", "nodeName"] },
  controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  layout: "fullscreen",
};

const style = document.createElement("style");
style.textContent = `
  .symbol-showcase {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 24px;
    justify-content: center;
    align-items: flex-start;
  }
  .symbol-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.08);
    min-width: 100px;
  }
  .symbol-visual {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .symbol-visual svg {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  }
  .symbol-label {
    font-size: 11px;
    text-align: center;
    color: #e5e7eb;
    word-break: break-word;
    max-width: 96px;
    line-height: 1.3;
  }
  .symbol-card.premium .symbol-label {
    color: #fbbf24;
  }
  .symbol-card.mid .symbol-label {
    color: #34d399;
  }
  .symbol-card.low .symbol-label {
    color: #94a3b8;
  }

  .story-reels {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
  .story-reel-column {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    gap: 6px;
    background: #0f172a;
    border-radius: 10px;
    padding: 8px;
    aspect-ratio: 1 / 4;
  }
  .story-symbol {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: #1e293b;
  }
  .story-symbol svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .storybook-bonus-overlay {
    position: relative;
    width: 100%;
    height: 320px;
    background: radial-gradient(circle at center, #1f2937 0%, #000 70%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .storybook-bonus-card {
    background: linear-gradient(135deg, #2a1a00, #5b3bff);
    border: 2px solid #ffd700;
    border-radius: 16px;
    padding: 32px 48px;
    text-align: center;
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.4);
    animation: bonusPulse 1.5s ease-in-out infinite;
  }
  .storybook-bonus-card h1 {
    margin: 0 0 12px 0;
    font-size: 28px;
    letter-spacing: 0.1em;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }
  .storybook-bonus-card p {
    margin: 0;
    font-size: 16px;
    color: #fff;
  }
  @keyframes bonusPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  .storybook-ui-demo {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    padding: 24px;
    justify-content: center;
  }
  .spin-button {
    padding: 14px 28px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #7c3aed, #db2777);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(219, 39, 123, 0.35);
  }
  .bonus-buy-button {
    padding: 14px 28px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    color: #1f2937;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);
  }
`;
document.head.appendChild(style);
