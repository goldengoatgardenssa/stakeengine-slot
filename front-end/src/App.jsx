import React, { useState, useEffect, useCallback, useRef } from 'react';
import SlotMachine from './components/SlotMachine';
import GameRules from './components/GameRules';
import {
  authenticate,
  play,
  endRound,
  subscribeBalance,
  subscribeRoundActive,
} from './lib/rgsClient';
import { API_MULTIPLIER, parseAmount, displayAmount } from './lib/currency';
import './index.css';

const INITIAL_GRID = [
  ['H1', 'H2', 'H3', 'H4', 'L1'],
  ['L2', 'L3', 'L4', 'WILD', 'SCATTER'],
  ['H4', 'H3', 'H2', 'H1', 'L2'],
];

export default function App() {
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [betLevels, setBetLevels] = useState([]);
  const [jurisdiction, setJurisdiction] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [showRules, setShowRules] = useState(false);
  const [showAutoPlayConfirm, setShowAutoPlayConfirm] = useState(false);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [grid, setGrid] = useState(null);
  const [winningLines, setWinningLines] = useState([]);
  const [disabledSpacebar, setDisabledSpacebar] = useState(false);
  const [disabledAutoplay, setDisabledAutoplay] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [showBetConfirm, setShowBetConfirm] = useState(false);
  const soundEnabledRef = useRef(soundEnabled);

  const audioContextRef = useRef(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playSound = (type) => {
    if (!soundEnabledRef.current || typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = audioContextRef.current || (audioContextRef.current = new AudioContext());
    context.resume().catch(() => {});
    const notes = type === 'win'
      ? [[523.25, 0, 0.24], [659.25, 0.08, 0.24], [783.99, 0.16, 0.3]]
      : [[220, 0, 0.12], [293.66, 0.07, 0.12]];

    notes.forEach(([frequency, offset, duration]) => {
      const start = context.currentTime + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(type === 'win' ? 0.07 : 0.035, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    });
  };

  const fmt = (amount, includeSubcent = false) => {
    return displayAmount({
      amount: Math.round(amount * API_MULTIPLIER),
      currency,
    }, { includeSubcent });
  };

  const handleAuthenticate = useCallback(async () => {
    try {
      const response = await authenticate();

      if (response && !response.error && response.balance) {
        setBalance(parseAmount(response.balance.amount));
        setCurrency(response.balance.currency);
        setIsAuthenticated(true);

        if (response.config) {
          const levels = (response.config.betLevels || []).map((l) => parseAmount(l));
          setBetLevels(levels);
          const defaultLevel = parseAmount(response.config.defaultBetLevel);
          setBetAmount(defaultLevel > 0 ? defaultLevel : (levels[0] || 10));
        }

        if (response.jurisdictionFlags) {
          setJurisdiction(response.jurisdictionFlags);
          setDisabledSpacebar(!!response.jurisdictionFlags.disabledSpacebar);
          setDisabledAutoplay(!!response.jurisdictionFlags.disabledAutoplay);
        }

        if (response.round && response.round.active) {
          setActiveRound(response.round);
          setRoundActive(true);
          if (Array.isArray(response.round.state)) {
            setGrid(response.round.state);
          }
          if (response.round.amount) {
            setBetAmount(parseAmount(response.round.amount));
          }
          setTotalWin(parseAmount(response.round.payout || 0));
        }
      } else if (response && response.error) {
        setAuthError(response.error);
      } else {
        setAuthError('Authentication failed: invalid response');
      }
    } catch (error) {
      setAuthError(error.message || 'Authentication failed');
    }
  }, []);

  useEffect(() => {
    const unsubBalance = subscribeBalance((balance) => {
      setBalance(parseAmount(balance.amount));
      setCurrency(balance.currency);
    });

    const unsubRound = subscribeRoundActive((active) => {
      setRoundActive(active);
    });

    handleAuthenticate();

    return () => {
      unsubBalance();
      unsubRound();
    };
  }, [handleAuthenticate]);

  const HIGH_COST_THRESHOLD = 5000;

  const handleBetConfirmation = () => {
    setShowBetConfirm(false);
    if (isSpinning || !isAuthenticated || roundActive || betAmount > balance) {
      if (betAmount > balance) setAuthError('Insufficient balance');
      return;
    }
    const betAmountInt = Math.round(betAmount * 1_000_000);
    executeBet(betAmountInt);
  };

  const handleBet = useCallback(() => {
    if (isSpinning || !isAuthenticated || roundActive || betAmount <= 0) return;

    if (betAmount > balance) {
      setAuthError('Insufficient balance');
      return;
    }

    const BET_IN_MICRO = Math.round(betAmount * 1_000_000);
    if (BET_IN_MICRO >= HIGH_COST_THRESHOLD * 1_000_000 && !jurisdiction.socialCasino) {
      setShowBetConfirm(true);
      return;
    }

    executeBet(BET_IN_MICRO);
  }, [isSpinning, isAuthenticated, roundActive, betAmount, balance, jurisdiction.socialCasino]);

  const executeBet = useCallback(async (betAmountInt) => {

    setIsSpinning(true);
    setTotalWin(0);
    setWinningLines([]);
    playSound('spin');

    try {
      const response = await play(betAmountInt, 'BASE');

      if (response && response.error) {
        setAuthError(response.error);
        setIsSpinning(false);
        return;
      }

      if (response && response.balance) {
        setBalance(parseAmount(response.balance.amount));
        setCurrency(response.balance.currency);
      }

      if (response && response.round) {
        const roundData = response.round;
        const winAmount = parseAmount(roundData.payout || 0);

        if (Array.isArray(roundData.state)) setGrid(roundData.state);
        setActiveRound(roundData);
        setRoundActive(!!roundData.active);

        setTimeout(async () => {
          if (winAmount > 0) {
            playSound('win');
            setTotalWin(winAmount);
          }
          setWinningLines([]);

          try {
            if (winAmount > 0 && roundData.active) {
              const endResponse = await endRound();
              if (endResponse && endResponse.error) {
                setAuthError(endResponse.error);
              } else if (endResponse && endResponse.balance) {
                setBalance(parseAmount(endResponse.balance.amount));
                setCurrency(endResponse.balance.currency);
                setRoundActive(false);
                setActiveRound(null);
              }
            } else if (!roundData.active) {
              setRoundActive(false);
              setActiveRound(null);
            }
          } catch (error) {
            setAuthError(error.message || 'End-round request failed');
          } finally {
            setIsSpinning(false);
          }
        }, 1200);
      } else if (response && response.balance) {
        setGrid(INITIAL_GRID);
        setTotalWin(0);
        setIsSpinning(false);
      } else {
        setAuthError('Play request failed: invalid response');
        setIsSpinning(false);
      }
    } catch (error) {
      setAuthError(error.message || 'Play request failed');
      setIsSpinning(false);
    }
  }, [isSpinning, isAuthenticated, roundActive, betAmount, balance]);

  const toggleAutoPlay = () => {
    if (disabledAutoplay) return;
    if (autoPlayActive) {
      setAutoPlayActive(false);
    } else {
      setShowAutoPlayConfirm(true);
    }
  };

  const startAutoPlay = () => {
    setShowAutoPlayConfirm(false);
    setAutoPlayActive(true);
  };

  const stopAutoPlay = () => {
    setAutoPlayActive(false);
    setShowAutoPlayConfirm(false);
  };

  const finishActiveRound = async () => {
    if (!activeRound?.active || !activeRound.payout || isSpinning) return;

    setIsSpinning(true);
    try {
      const response = await endRound();
      if (response && response.error) {
        setAuthError(response.error);
      } else if (response && response.balance) {
        setBalance(parseAmount(response.balance.amount));
        setCurrency(response.balance.currency);
        setRoundActive(false);
        setActiveRound(null);
      }
    } catch (error) {
      setAuthError(error.message || 'End-round request failed');
    } finally {
      setIsSpinning(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!disabledSpacebar) handleBet();
      }
    };
    if (!disabledSpacebar) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabledSpacebar, handleBet]);

  useEffect(() => {
    if (autoPlayActive && !isSpinning) {
      const timer = setTimeout(() => {
        if (balance >= betAmount && isAuthenticated) {
          handleBet();
        } else if (balance < betAmount) {
          setAutoPlayActive(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoPlayActive, isSpinning, balance, betAmount, isAuthenticated, handleBet]);

  return (
    <div className="game-container" style={{ overflow: 'hidden' }}>
      {!isAuthenticated ? (
        <div role={authError ? 'alert' : undefined} style={{ color: authError ? '#ff8888' : '#ccc', fontSize: '18px' }}>
          {authError || 'Authenticating with RGS...'}
        </div>
      ) : (
        <>
          <div className="game-header">
            <div>
              <span className="game-title">
                Golden Goat <span style={{ color: '#fff' }}>GARDEN</span>
              </span>
              <span className="badge">5 FIXED PAYLINES</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowRules(true)}
                className="rules-button"
              >
                RULES
              </button>
              <button
                onClick={toggleAutoPlay}
                className={`autoplay-button ${autoPlayActive ? 'active' : ''}`}
                disabled={disabledAutoplay}
                title={disabledAutoplay ? 'Autoplay disabled by jurisdiction' : ''}
              >
                {autoPlayActive ? 'STOP' : 'AUTO'}
              </button>
            </div>
          </div>

          <div className="game-main">
            <div className="game-status">
              <div className="stat-box">
                <div className="stat-label">BALANCE</div>
                <div className="stat-value">{fmt(balance)}</div>
              </div>
              <button
                onClick={roundActive ? finishActiveRound : handleBet}
                disabled={isSpinning || (roundActive ? !activeRound?.payout : betAmount > balance)}
                className={`spin-button ${isSpinning ? 'spinning' : ''}`}
              >
                {isSpinning ? 'SPINNING...' : roundActive ? 'COLLECT' : 'SPIN'}
              </button>
              <div className="stat-box">
                <div className="stat-label">WIN</div>
                <div className={`stat-value ${totalWin > 0 ? 'win' : ''}`}>
                  {fmt(totalWin, true)}
                </div>
              </div>
            </div>

            <SlotMachine
              grid={grid || INITIAL_GRID}
              isSpinning={isSpinning}
              totalWin={totalWin}
              winningLines={winningLines}
              formatAmount={fmt}
            />
          </div>

          <div className="game-controls">
            <div className="bet-bar" aria-label="Bet amount">
              {betLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`bet-level-button ${betAmount === level ? 'selected' : ''}`}
                  onClick={() => setBetAmount(level)}
                  aria-pressed={betAmount === level}
                >
                  {fmt(level)}
                </button>
              ))}
            </div>
            <div className="control-group">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`sound-toggle ${soundEnabled ? '' : 'muted'}`}
              >
                {soundEnabled ? 'SOUND ON' : 'MUTED'}
              </button>
            </div>
          </div>
        </>
      )}

      {authError && isAuthenticated && (
        <div className="error-message">{authError}</div>
      )}

      {showAutoPlayConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Auto-Play Confirmation</h3>
            <p>
              Are you sure you want to start auto-play? This will automatically place
              bets at {fmt(betAmount)} per spin.
            </p>
            <div className="confirm-buttons">
              <button onClick={startAutoPlay} className="confirm-btn yes">
                Yes, Start
              </button>
              <button onClick={stopAutoPlay} className="confirm-btn no">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBetConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>High Bet Confirmation</h3>
            <p>
              You are about to place a bet of {fmt(betAmount)}. Confirm this high-cost bet?
            </p>
            <div className="confirm-buttons">
              <button onClick={handleBetConfirmation} className="confirm-btn yes">
                Confirm
              </button>
              <button onClick={() => setShowBetConfirm(false)} className="confirm-btn no">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <GameRules
          onClose={() => setShowRules(false)}
          betAmount={betAmount}
          formatAmount={fmt}
        />
      )}
    </div>
  );
}
