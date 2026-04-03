import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './Games.css';

const COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
];

const EMOJI_SETS = {
    easy: ['●', '◆', '▲', '■', '★', '✦'],
    medium: ['○', '●', '□', '■', '△', '▲'],
    hard: ['◌', '○', '◍', '●', '▵', '△'],
};

const LEVELS = {
    easy: { label: 'Easy', rounds: 6, colorOptions: 4, objectCells: 16, objectCols: 4, reactionRounds: 4, patternRounds: 4, patternLength: 4, revealMs: 2300 },
    medium: { label: 'Medium', rounds: 8, colorOptions: 6, objectCells: 25, objectCols: 5, reactionRounds: 5, patternRounds: 5, patternLength: 5, revealMs: 1800 },
    hard: { label: 'Hard', rounds: 10, colorOptions: 8, objectCells: 36, objectCols: 6, reactionRounds: 6, patternRounds: 6, patternLength: 6, revealMs: 1400 },
};

const PATTERN_SYMBOLS = ['▲', '■', '●', '◆', '✦', '⬢'];

const STORAGE_KEY = 'eyeguard_games_best_v1';

const DAILY_CHALLENGES = [
    { tab: 'color', level: 'easy', title: 'Warm-Up Colors', goal: 'Hit 5+ correct with steady pace.' },
    { tab: 'object', level: 'medium', title: 'Pattern Hunter', goal: 'Find odd symbols quickly in medium grid.' },
    { tab: 'reaction', level: 'hard', title: 'Lightning Reflex', goal: 'Keep average reaction under 420ms.' },
    { tab: 'color', level: 'hard', title: 'Spectrum Master', goal: 'Beat hard color rounds with high accuracy.' },
    { tab: 'object', level: 'hard', title: 'Focus Tunnel', goal: 'Clear hard object grid with 70%+ hits.' },
    { tab: 'pattern', level: 'medium', title: 'Memory Matrix', goal: 'Replay symbol sequences with high streak.' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function nextColorRound(levelKey) {
    const level = LEVELS[levelKey];
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    const distractors = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, level.colorOptions - 1);
    const options = shuffle([target, ...distractors]);
    return { target, options, startedAt: Date.now() };
}

function nextObjectRound(levelKey) {
    const level = LEVELS[levelKey];
    const symbols = EMOJI_SETS[levelKey];
    const base = symbols[Math.floor(Math.random() * symbols.length)];
    let odd = base;

    while (odd === base) {
        odd = symbols[Math.floor(Math.random() * symbols.length)];
    }

    const oddIndex = Math.floor(Math.random() * level.objectCells);
    return { base, odd, oddIndex, startedAt: Date.now() };
}

function nextPatternRound(levelKey) {
    const level = LEVELS[levelKey];
    const sequence = Array.from({ length: level.patternLength }).map(
        () => PATTERN_SYMBOLS[Math.floor(Math.random() * PATTERN_SYMBOLS.length)]
    );

    return {
        sequence,
        startedAt: Date.now(),
    };
}

export default function Games() {
    const [activeTab, setActiveTab] = useState('color');
    const [level, setLevel] = useState('easy');
    const reactionTimerRef = useRef(null);
    const patternTimerRef = useRef(null);

    const [colorRound, setColorRound] = useState(() => nextColorRound('easy'));
    const [colorCount, setColorCount] = useState(1);
    const [colorScore, setColorScore] = useState(0);
    const [colorHits, setColorHits] = useState(0);
    const [colorStreak, setColorStreak] = useState(0);
    const [colorTimes, setColorTimes] = useState([]);
    const [colorDone, setColorDone] = useState(false);

    const [objectRound, setObjectRound] = useState(() => nextObjectRound('easy'));
    const [objectCount, setObjectCount] = useState(1);
    const [objectScore, setObjectScore] = useState(0);
    const [objectHits, setObjectHits] = useState(0);
    const [objectStreak, setObjectStreak] = useState(0);
    const [objectTimes, setObjectTimes] = useState([]);
    const [objectDone, setObjectDone] = useState(false);

    const [reactionState, setReactionState] = useState('idle');
    const [reactionMessage, setReactionMessage] = useState('Press Start and wait for GREEN.');
    const [reactionCount, setReactionCount] = useState(0);
    const [reactionScore, setReactionScore] = useState(0);
    const [reactionHits, setReactionHits] = useState(0);
    const [reactionStreak, setReactionStreak] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [reactionDone, setReactionDone] = useState(false);
    const [reactionStartAt, setReactionStartAt] = useState(0);

    const [patternRound, setPatternRound] = useState(() => nextPatternRound('easy'));
    const [patternCount, setPatternCount] = useState(1);
    const [patternScore, setPatternScore] = useState(0);
    const [patternHits, setPatternHits] = useState(0);
    const [patternStreak, setPatternStreak] = useState(0);
    const [patternTimes, setPatternTimes] = useState([]);
    const [patternDone, setPatternDone] = useState(false);
    const [patternInput, setPatternInput] = useState([]);
    const [patternReveal, setPatternReveal] = useState(true);
    const [bestStats, setBestStats] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const colorAvg = useMemo(() => {
        if (!colorTimes.length) return 0;
        return colorTimes.reduce((a, b) => a + b, 0) / colorTimes.length;
    }, [colorTimes]);

    const objectAvg = useMemo(() => {
        if (!objectTimes.length) return 0;
        return objectTimes.reduce((a, b) => a + b, 0) / objectTimes.length;
    }, [objectTimes]);

    const reactionAvg = useMemo(() => {
        if (!reactionTimes.length) return 0;
        return reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    }, [reactionTimes]);

    const patternAvg = useMemo(() => {
        if (!patternTimes.length) return 0;
        return patternTimes.reduce((a, b) => a + b, 0) / patternTimes.length;
    }, [patternTimes]);

    const dailyChallenge = useMemo(() => {
        const daySeed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
        const index = daySeed % DAILY_CHALLENGES.length;
        return DAILY_CHALLENGES[index];
    }, []);

    const levelConfig = LEVELS[level];

    const clearReactionTimer = () => {
        if (reactionTimerRef.current) {
            clearTimeout(reactionTimerRef.current);
            reactionTimerRef.current = null;
        }
    };

    const clearPatternTimer = () => {
        if (patternTimerRef.current) {
            clearTimeout(patternTimerRef.current);
            patternTimerRef.current = null;
        }
    };

    const triggerPatternReveal = (levelKey) => {
        clearPatternTimer();
        setPatternReveal(true);
        patternTimerRef.current = setTimeout(() => {
            setPatternReveal(false);
        }, LEVELS[levelKey].revealMs);
    };

    const progressPercent = useMemo(() => {
        if (activeTab === 'color') {
            if (colorDone) return 100;
            return Math.min(100, ((colorCount - 1) / levelConfig.rounds) * 100);
        }

        if (activeTab === 'object') {
            if (objectDone) return 100;
            return Math.min(100, ((objectCount - 1) / levelConfig.rounds) * 100);
        }

        if (activeTab === 'pattern') {
            if (patternDone) return 100;
            return Math.min(100, ((patternCount - 1) / levelConfig.patternRounds) * 100);
        }

        if (reactionDone) return 100;
        return Math.min(100, (reactionCount / levelConfig.reactionRounds) * 100);
    }, [activeTab, colorCount, colorDone, objectCount, objectDone, patternCount, patternDone, reactionCount, reactionDone, levelConfig]);

    const bestForActive = useMemo(() => {
        return bestStats?.[activeTab]?.[level] || null;
    }, [bestStats, activeTab, level]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bestStats));
    }, [bestStats]);

    useEffect(() => {
        return () => {
            clearReactionTimer();
            clearPatternTimer();
        };
    }, []);

    useEffect(() => {
        triggerPatternReveal(level);
    }, []);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (activeTab !== 'reaction') return;
            if (event.code !== 'Space') return;
            event.preventDefault();

            if (reactionState === 'idle') {
                startReactionRound();
                return;
            }

            handleReactionClick();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const updateBestStats = (game, levelKey, points, avgMs) => {
        setBestStats((prev) => {
            const gameStats = prev?.[game] || {};
            const current = gameStats?.[levelKey] || { bestScore: 0, bestAvg: 0 };
            const bestScore = Math.max(current.bestScore || 0, points);

            let bestAvg = current.bestAvg || 0;
            if (avgMs > 0) {
                bestAvg = bestAvg > 0 ? Math.min(bestAvg, avgMs) : avgMs;
            }

            return {
                ...prev,
                [game]: {
                    ...gameStats,
                    [levelKey]: { bestScore, bestAvg },
                },
            };
        });
    };

    const handleColorPick = (picked) => {
        if (colorDone) return;

        const reaction = Date.now() - colorRound.startedAt;
        const newTimes = [...colorTimes, reaction];
        const newAvg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const correct = picked.name === colorRound.target.name;
        const nextStreak = correct ? colorStreak + 1 : 0;
        const bonus = correct ? Math.min(colorStreak, 2) : 0;
        const pointsGain = correct ? 1 + bonus : 0;
        const nextScore = colorScore + pointsGain;
        const nextHits = colorHits + (correct ? 1 : 0);

        setColorTimes(newTimes);
        setColorStreak(nextStreak);
        setColorScore(nextScore);
        setColorHits(nextHits);

        if (colorCount >= levelConfig.rounds) {
            setColorDone(true);
            updateBestStats('color', level, nextScore, newAvg);
            return;
        }

        setColorCount((prev) => prev + 1);
        setColorRound(nextColorRound(level));
    };

    const handleObjectPick = (index) => {
        if (objectDone) return;

        const reaction = Date.now() - objectRound.startedAt;
        const newTimes = [...objectTimes, reaction];
        const newAvg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const correct = index === objectRound.oddIndex;
        const nextStreak = correct ? objectStreak + 1 : 0;
        const bonus = correct ? Math.min(objectStreak, 2) : 0;
        const pointsGain = correct ? 1 + bonus : 0;
        const nextScore = objectScore + pointsGain;
        const nextHits = objectHits + (correct ? 1 : 0);

        setObjectTimes(newTimes);
        setObjectStreak(nextStreak);
        setObjectScore(nextScore);
        setObjectHits(nextHits);

        if (objectCount >= levelConfig.rounds) {
            setObjectDone(true);
            updateBestStats('object', level, nextScore, newAvg);
            return;
        }

        setObjectCount((prev) => prev + 1);
        setObjectRound(nextObjectRound(level));
    };

    const resetColor = () => {
        setColorCount(1);
        setColorScore(0);
        setColorHits(0);
        setColorStreak(0);
        setColorTimes([]);
        setColorDone(false);
        setColorRound(nextColorRound(level));
    };

    const resetObject = () => {
        setObjectCount(1);
        setObjectScore(0);
        setObjectHits(0);
        setObjectStreak(0);
        setObjectTimes([]);
        setObjectDone(false);
        setObjectRound(nextObjectRound(level));
    };

    const setDifficulty = (nextLevel) => {
        clearReactionTimer();
        clearPatternTimer();

        setLevel(nextLevel);
        setColorCount(1);
        setColorScore(0);
        setColorHits(0);
        setColorStreak(0);
        setColorTimes([]);
        setColorDone(false);
        setColorRound(nextColorRound(nextLevel));

        setObjectCount(1);
        setObjectScore(0);
        setObjectHits(0);
        setObjectStreak(0);
        setObjectTimes([]);
        setObjectDone(false);
        setObjectRound(nextObjectRound(nextLevel));

        setPatternCount(1);
        setPatternScore(0);
        setPatternHits(0);
        setPatternStreak(0);
        setPatternTimes([]);
        setPatternDone(false);
        setPatternInput([]);
        setPatternRound(nextPatternRound(nextLevel));
        triggerPatternReveal(nextLevel);

        setReactionState('idle');
        setReactionMessage('Press Start and wait for GREEN.');
        setReactionCount(0);
        setReactionScore(0);
        setReactionHits(0);
        setReactionStreak(0);
        setReactionTimes([]);
        setReactionDone(false);
        setReactionStartAt(0);
    };

    const startDailyChallenge = () => {
        setActiveTab(dailyChallenge.tab);
        setDifficulty(dailyChallenge.level);
    };

    const resetPattern = () => {
        clearPatternTimer();
        setPatternCount(1);
        setPatternScore(0);
        setPatternHits(0);
        setPatternStreak(0);
        setPatternTimes([]);
        setPatternDone(false);
        setPatternInput([]);
        setPatternRound(nextPatternRound(level));
        triggerPatternReveal(level);
    };

    const advancePatternRound = (success) => {
        const reaction = Date.now() - patternRound.startedAt;
        const newTimes = [...patternTimes, reaction];
        const newAvg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const nextStreak = success ? patternStreak + 1 : 0;
        const bonus = success ? Math.min(patternStreak, 2) : 0;
        const pointsGain = success ? 1 + bonus : 0;
        const nextScore = patternScore + pointsGain;
        const nextHits = patternHits + (success ? 1 : 0);

        setPatternTimes(newTimes);
        setPatternStreak(nextStreak);
        setPatternScore(nextScore);
        setPatternHits(nextHits);

        if (patternCount >= levelConfig.patternRounds) {
            setPatternDone(true);
            updateBestStats('pattern', level, nextScore, newAvg);
            return;
        }

        setPatternCount((prev) => prev + 1);
        setPatternInput([]);
        setPatternRound(nextPatternRound(level));
        triggerPatternReveal(level);
    };

    const handlePatternPick = (symbol) => {
        if (patternDone || patternReveal) return;

        const nextInput = [...patternInput, symbol];
        setPatternInput(nextInput);

        const expected = patternRound.sequence[nextInput.length - 1];
        if (symbol !== expected) {
            advancePatternRound(false);
            return;
        }

        if (nextInput.length >= patternRound.sequence.length) {
            advancePatternRound(true);
        }
    };

    const finalizeReactionRound = (success, reactionMs) => {
        const safeReaction = typeof reactionMs === 'number' ? reactionMs : 1000;
        const newTimes = [...reactionTimes, safeReaction];
        const newAvg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const nextStreak = success ? reactionStreak + 1 : 0;
        const bonus = success ? Math.min(reactionStreak, 2) : 0;
        const pointsGain = success ? 1 + bonus : 0;
        const nextScore = reactionScore + pointsGain;
        const nextHits = reactionHits + (success ? 1 : 0);
        const nextCount = reactionCount + 1;

        setReactionTimes(newTimes);
        setReactionStreak(nextStreak);
        setReactionScore(nextScore);
        setReactionHits(nextHits);
        setReactionCount(nextCount);

        if (nextCount >= levelConfig.reactionRounds) {
            setReactionDone(true);
            setReactionState('idle');
            setReactionMessage('Session complete.');
            updateBestStats('reaction', level, nextScore, newAvg);
            return;
        }

        setReactionState('idle');
        setReactionMessage(success ? 'Great. Press Start for next round.' : 'Missed round. Press Start again.');
    };

    const startReactionRound = () => {
        if (reactionDone || reactionState === 'waiting') return;
        if (reactionState === 'ready') return;

        clearReactionTimer();

        setReactionState('waiting');
        setReactionMessage('Wait for green... do not click yet.');

        const delay = 800 + Math.random() * 1800;
        reactionTimerRef.current = setTimeout(() => {
            setReactionState('ready');
            setReactionMessage('CLICK NOW!');
            setReactionStartAt(Date.now());
        }, delay);
    };

    const handleReactionClick = () => {
        if (reactionDone) return;

        if (reactionState === 'idle') {
            startReactionRound();
            return;
        }

        if (reactionState === 'waiting') {
            clearReactionTimer();
            setReactionMessage('Too soon. Round restarted.');
            setReactionState('error');
            setTimeout(() => {
                finalizeReactionRound(false, 1200);
            }, 700);
            return;
        }

        if (reactionState !== 'ready') return;

        const reaction = Date.now() - reactionStartAt;
        const success = reaction < 700;
        finalizeReactionRound(success, reaction);
    };

    const resetReaction = () => {
        clearReactionTimer();

        setReactionState('idle');
        setReactionMessage('Press Start and wait for GREEN.');
        setReactionCount(0);
        setReactionScore(0);
        setReactionHits(0);
        setReactionStreak(0);
        setReactionTimes([]);
        setReactionDone(false);
        setReactionStartAt(0);
    };

    return (
        <div className="games-page">
            <div className="games-bg" aria-hidden="true" />

            <motion.div
                className="games-wrap"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
            >
                <header className="games-header">
                    <h1>Eye Training Games</h1>
                    <p>Challenge your color recognition and object detection speed in quick rounds.</p>
                </header>

                <section className="daily-card">
                    <div>
                        <h3>Daily Challenge: {dailyChallenge.title}</h3>
                        <p>{dailyChallenge.goal}</p>
                    </div>
                    <button className="btn-premium" onClick={startDailyChallenge}>Start Daily Challenge</button>
                </section>

                <div className="difficulty-row">
                    {Object.entries(LEVELS).map(([key, cfg]) => (
                        <button
                            key={key}
                            className={`difficulty-chip ${level === key ? 'active' : ''}`}
                            onClick={() => setDifficulty(key)}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                <div className="game-progress">
                    <div className="game-progress-label">Progress</div>
                    <div className="game-progress-track">
                        <div className="game-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                {bestForActive && (
                    <div className="best-stats">
                        <span>Personal Best Score: {bestForActive.bestScore}</span>
                        <span>Best Avg Time: {bestForActive.bestAvg ? `${Math.round(bestForActive.bestAvg)} ms` : '--'}</span>
                    </div>
                )}

                <div className="games-tabs">
                    <button
                        className={`games-tab ${activeTab === 'color' ? 'active' : ''}`}
                        onClick={() => setActiveTab('color')}
                    >
                        Color Test
                    </button>
                    <button
                        className={`games-tab ${activeTab === 'object' ? 'active' : ''}`}
                        onClick={() => setActiveTab('object')}
                    >
                        Object Speed Test
                    </button>
                    <button
                        className={`games-tab ${activeTab === 'pattern' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pattern')}
                    >
                        Pattern Recall
                    </button>
                    <button
                        className={`games-tab ${activeTab === 'reaction' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reaction')}
                    >
                        Reaction Sprint
                    </button>
                </div>

                {activeTab === 'color' && (
                    <section className="game-card">
                        <div className="game-meta">
                            <span>Round {colorCount}/{levelConfig.rounds}</span>
                            <span>Score: {colorScore}</span>
                            <span>Hits: {colorHits}</span>
                            <span>Streak: {colorStreak}</span>
                            <span>Avg: {colorAvg ? `${colorAvg.toFixed(0)} ms` : '--'}</span>
                        </div>

                        {!colorDone ? (
                            <>
                                <h2 className="game-title">Tap the matching color</h2>
                                <div className="target-color-row">
                                    <span>Target:</span>
                                    <strong style={{ color: colorRound.target.value }}>{colorRound.target.name}</strong>
                                </div>

                                <div className="color-grid">
                                    {colorRound.options.map((opt) => (
                                        <button
                                            key={`${opt.name}-${opt.value}`}
                                            className="color-option"
                                            style={{ background: opt.value }}
                                            onClick={() => handleColorPick(opt)}
                                            aria-label={`Pick ${opt.name}`}
                                        >
                                            {opt.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="game-result">
                                <h3>Color Test Complete</h3>
                                <p>You got {colorHits} exact hits and {colorScore} points.</p>
                                <p>Your average response time is {colorAvg.toFixed(0)} ms.</p>
                                <button className="btn-premium" onClick={resetColor}>Play Again</button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'object' && (
                    <section className="game-card">
                        <div className="game-meta">
                            <span>Round {objectCount}/{levelConfig.rounds}</span>
                            <span>Score: {objectScore}</span>
                            <span>Hits: {objectHits}</span>
                            <span>Streak: {objectStreak}</span>
                            <span>Avg: {objectAvg ? `${objectAvg.toFixed(0)} ms` : '--'}</span>
                        </div>

                        {!objectDone ? (
                            <>
                                <h2 className="game-title">Find the different symbol fast</h2>
                                <div
                                    className="object-grid"
                                    role="grid"
                                    aria-label="Object detection grid"
                                    style={{ gridTemplateColumns: `repeat(${levelConfig.objectCols}, minmax(44px, 1fr))` }}
                                >
                                    {Array.from({ length: levelConfig.objectCells }).map((_, i) => {
                                        const isOdd = i === objectRound.oddIndex;
                                        return (
                                            <button
                                                key={i}
                                                className="object-cell"
                                                onClick={() => handleObjectPick(i)}
                                                aria-label={`Object ${i + 1}`}
                                            >
                                                {isOdd ? objectRound.odd : objectRound.base}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="game-result">
                                <h3>Object Speed Test Complete</h3>
                                <p>You got {objectHits} exact hits and {objectScore} points.</p>
                                <p>Your average response time is {objectAvg.toFixed(0)} ms.</p>
                                <button className="btn-premium" onClick={resetObject}>Play Again</button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'pattern' && (
                    <section className="game-card">
                        <div className="game-meta">
                            <span>Round {patternCount}/{levelConfig.patternRounds}</span>
                            <span>Score: {patternScore}</span>
                            <span>Hits: {patternHits}</span>
                            <span>Streak: {patternStreak}</span>
                            <span>Avg: {patternAvg ? `${patternAvg.toFixed(0)} ms` : '--'}</span>
                        </div>

                        {!patternDone ? (
                            <>
                                <h2 className="game-title">Pattern Recall</h2>
                                <p className="pattern-help">Memorize the sequence, then repeat it in the same order.</p>

                                <div className={`pattern-sequence ${patternReveal ? 'revealing' : 'hidden'}`}>
                                    {patternRound.sequence.map((item, idx) => (
                                        <span key={`${item}-${idx}`} className="pattern-chip">{patternReveal ? item : '?'}</span>
                                    ))}
                                </div>

                                <div className="pattern-input-preview">
                                    Input: {patternInput.length ? patternInput.join(' ') : '--'}
                                </div>

                                <div className="pattern-pad">
                                    {PATTERN_SYMBOLS.map((symbol) => (
                                        <button
                                            key={symbol}
                                            className="pattern-btn"
                                            onClick={() => handlePatternPick(symbol)}
                                            disabled={patternReveal}
                                        >
                                            {symbol}
                                        </button>
                                    ))}
                                </div>

                                <div className="reaction-controls">
                                    <button className="game-btn-ghost" onClick={() => setPatternInput([])} disabled={patternReveal}>Clear Input</button>
                                    <button className="game-btn-ghost" onClick={() => triggerPatternReveal(level)}>Show Again</button>
                                </div>
                            </>
                        ) : (
                            <div className="game-result">
                                <h3>Pattern Recall Complete</h3>
                                <p>You got {patternHits} exact rounds and {patternScore} points.</p>
                                <p>Your average solve time is {patternAvg.toFixed(0)} ms.</p>
                                <button className="btn-premium" onClick={resetPattern}>Play Again</button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'reaction' && (
                    <section className="game-card">
                        <div className="game-meta">
                            <span>Round {Math.min(reactionCount + 1, levelConfig.reactionRounds)}/{levelConfig.reactionRounds}</span>
                            <span>Score: {reactionScore}</span>
                            <span>Hits: {reactionHits}</span>
                            <span>Streak: {reactionStreak}</span>
                            <span>Avg: {reactionAvg ? `${reactionAvg.toFixed(0)} ms` : '--'}</span>
                        </div>

                        {!reactionDone ? (
                            <>
                                <h2 className="game-title">Reaction Sprint</h2>
                                <p className="reaction-help">Click only when the panel turns green. Fast and accurate clicks improve score.</p>
                                <button
                                    className={`reaction-panel ${reactionState}`}
                                    onClick={handleReactionClick}
                                >
                                    {reactionState === 'ready' ? 'CLICK' : reactionMessage}
                                </button>

                                <div className="reaction-controls">
                                    <button
                                        className="btn-premium"
                                        onClick={startReactionRound}
                                        disabled={reactionState === 'waiting' || reactionState === 'ready'}
                                    >
                                        {reactionCount === 0 ? 'Start' : 'Start Next'}
                                    </button>
                                    <button className="game-btn-ghost" onClick={resetReaction}>Reset</button>
                                </div>
                                <p className="reaction-tip">Tip: Press Space to start/click in reaction mode.</p>
                            </>
                        ) : (
                            <div className="game-result">
                                <h3>Reaction Sprint Complete</h3>
                                <p>You got {reactionHits} exact hits and {reactionScore} points.</p>
                                <p>Your average click time is {reactionAvg.toFixed(0)} ms.</p>
                                <button className="btn-premium" onClick={resetReaction}>Play Again</button>
                            </div>
                        )}
                    </section>
                )}
            </motion.div>
        </div>
    );
}