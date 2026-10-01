import React from 'react';
import { SYMBOLS } from '../lib/constants';

const SYMBOL_MAP = {
  H1: 'H1_GoldenGoat.svg',
  H2: 'H2_WateringCan.svg',
  H3: 'H3_GoldenBloom.svg',
  H4: 'H4_SeedPouch.svg',
  L1: 'L1_Ace.svg',
  L2: 'L2_King.svg',
  L3: 'L3_Queen.svg',
  L4: 'L4_Jack.svg',
  WILD: 'WILD_Clover.svg',
  SCATTER: 'SCATTER_SSA.svg',
};

export default function SlotMachine({ grid, isSpinning, winningLines = [], totalWin = 0, formatAmount = (amount) => amount }) {
  const [displayGrid, setDisplayGrid] = React.useState(grid);
  const [visibleWin, setVisibleWin] = React.useState(false);
  const [stoppedReels, setStoppedReels] = React.useState(5);
  const lastGridRef = React.useRef(grid);

  React.useEffect(() => {
    setDisplayGrid(grid);
  }, [grid]);

  React.useEffect(() => {
    if (!isSpinning) {
      setStoppedReels(5);
      lastGridRef.current = grid;
      return;
    }

    if (grid === lastGridRef.current) {
      setStoppedReels(0);
      return;
    }

    lastGridRef.current = grid;
    setStoppedReels(0);
    const stopDelays = [260, 420, 580, 740, 900];
    const timers = stopDelays.map((delay, reelIndex) =>
      setTimeout(() => setStoppedReels(reelIndex + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [grid, isSpinning]);

  React.useEffect(() => {
    if (totalWin > 0) {
      setVisibleWin(true);
      const timer = setTimeout(() => setVisibleWin(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [totalWin]);

  const reelCols = [[], [], [], [], []];
  if (displayGrid) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        if (displayGrid[r] && displayGrid[r][c]) {
          reelCols[c].push(displayGrid[r][c]);
        }
      }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {visibleWin && totalWin > 0 && (
        <div className="win-celebration">
          +{formatAmount(totalWin, true)}
        </div>
      )}

      <div className="slot-grid">
        {reelCols.map((col, colIdx) => (
          <div
            key={colIdx}
            className={`reel-column reel-${colIdx} ${isSpinning && colIdx >= stoppedReels ? 'spinning' : ''}`}
            aria-label={`Reel ${colIdx + 1}`}
          >
            <div className="reel-strip">
              {[...col, ...col].map((sym, itemIndex) => {
                const rowIdx = itemIndex % col.length;
              const symbolInfo = SYMBOLS.find((symbol) => symbol.id === sym);
              return (
                <div
                  key={itemIndex}
                  className={`slot-cell symbol-${sym.toLowerCase()}`}
                >
                  <img
                    src={`/assets/${SYMBOL_MAP[sym] || SYMBOL_MAP.H1}`}
                    alt={symbolInfo?.name || sym}
                    onError={(e) => {
                      e.target.src = '/assets/WILD_Clover.svg';
                    }}
                  />
                  <span className="symbol-mark">{sym}</span>
                  {winningLines.some(
                    (line) => line.line >= 0 && line.symbol === sym && line.count >= 3
                  ) && !isSpinning && <span className="symbol-win-mark" />}
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>

      {winningLines.length > 0 && !isSpinning && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0, 255, 102, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        >
          <strong style={{ color: '#00ff66' }}>
            Winning Lines: {winningLines.length} | Total Win: {formatAmount(totalWin, true)}
          </strong>
          <br />
          {winningLines.map((wl) => (
            <span key={wl.line} style={{ color: '#ccc', display: 'block' }}>
              Line {wl.line}: {wl.count}x {wl.symbol} ({formatAmount(wl.payout, true)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
