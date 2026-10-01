import React from 'react';
import {
  SYMBOLS,
  RTP,
  MAX_WIN,
  GAME_TITLE,
  GAME_DESCRIPTION,
  BET_MODES,
  DISCLAIMER,
  WIN_COMBINATIONS,
  FREE_GAME_INFO,
  PAYTABLE_MULTIPLIER,
} from '../lib/constants';

export default function GameRules({ onClose, betAmount = 0, formatAmount = (value) => value }) {
  const getPaytableRow = (symbol) => {
    return symbol.pays.slice(2).map((value) =>
      value > 0 ? `${(value * PAYTABLE_MULTIPLIER).toFixed(2)}x` : '-',
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h2>{GAME_TITLE} - Game Rules</h2>

        <h3>About</h3>
        <p>{GAME_DESCRIPTION}</p>

        <h3>Game Overview</h3>
        <ul>
          <li>RTP: {RTP}%</li>
          <li>Maximum Win: {MAX_WIN.toFixed(2)}x total spin bet</li>
          <li>Paylines: 5 fixed</li>
          <li>Reels: 5 x 3</li>
        </ul>

        <h3>How to Play</h3>
        <p>Select a bet level and press Spin. Spacebar also starts a spin when permitted by the operator.</p>

        <h3>Paytable</h3>
        <p>Values are multipliers of the selected total spin bet for each winning line. Current spin cost: {formatAmount(betAmount)}.</p>
        <table className="paytable">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
            </tr>
          </thead>
          <tbody>
            {SYMBOLS.map((symbol) => {
              const cells = getPaytableRow(symbol);
              return (
                <tr key={symbol.id}>
                  <td>{symbol.id}</td>
                  <td>{symbol.name}</td>
                  {cells.map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3>Win Combinations</h3>
        <ul>
          {WIN_COMBINATIONS.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>

        <h3>Game Modes</h3>
        {BET_MODES.map((mode) => (
          <div key={mode.id} style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#00ff66' }}>{mode.name}</strong>
            <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>{mode.description}</p>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Cost: {mode.cost}</p>
          </div>
        ))}

        <h3>Free Games & Re-triggers</h3>
        <ul>
          {FREE_GAME_INFO.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>

        <h3>Disclaimer</h3>
        <p style={{ fontSize: '12px', color: '#aaa' }}>{DISCLAIMER}</p>
      </div>
    </div>
  );
}
