"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NeuralNetworkGame = ({ onXPGain, onScoreUpdate }) => {
    const [gameOpen, setGameOpen] = (0, react_1.useState)(false);
    const [gameActive, setGameActive] = (0, react_1.useState)(false);
    const [gamePaused, setGamePaused] = (0, react_1.useState)(false);
    const [gameStats, setGameStats] = (0, react_1.useState)({
        score: 0,
        level: 1,
        lives: 3,
        combo: 0,
        time: 60,
        accuracy: 100
    });
    // Ігрове поле - нейронна мережа
    const [neurons, setNeurons] = (0, react_1.useState)([]);
    const [gameTarget, setGameTarget] = (0, react_1.useState)(null);
    const gameInterval = (0, react_1.useRef)();
    const timeInterval = (0, react_1.useRef)();
    // Ініціалізація нейронної мережі
    const initializeNeuralNetwork = (0, react_1.useCallback)(() => {
        const newNeurons = [];
        let id = 0;
        // Вхідний шар (4 нейрони)
        for (let i = 0; i < 4; i++) {
            newNeurons.push({
                id: id++,
                x: 50,
                y: 100 + i * 100,
                active: false,
                type: 'input',
                connections: [4, 5, 6, 7],
                energy: 0
            });
        }
        // Прихований шар (4 нейрони)
        for (let i = 0; i < 4; i++) {
            newNeurons.push({
                id: id++,
                x: 250,
                y: 100 + i * 100,
                active: false,
                type: 'hidden',
                connections: [8, 9],
                energy: 0
            });
        }
        // Вихідний шар (2 нейрони)
        for (let i = 0; i < 2; i++) {
            newNeurons.push({
                id: id++,
                x: 450,
                y: 150 + i * 100,
                active: false,
                type: 'output',
                connections: [],
                energy: 0
            });
        }
        setNeurons(newNeurons);
    }, []);
    // Генерація нового завдання
    const generateTarget = (0, react_1.useCallback)(() => {
        const patterns = [
            {
                pattern: [0, 1, 0, 1],
                description: 'Активувати парні входи',
                points: 100
            },
            {
                pattern: [1, 1, 0, 0],
                description: 'Активувати верхні входи',
                points: 120
            },
            {
                pattern: [1, 0, 1, 0],
                description: 'Активувати непарні входи',
                points: 110
            },
            {
                pattern: [1, 1, 1, 1],
                description: 'Активувати всі входи',
                points: 150
            }
        ];
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        setGameTarget(randomPattern);
    }, []);
    // Обробка кліку по нейрону
    const handleNeuronClick = (0, react_1.useCallback)((neuronId) => {
        if (!gameActive || gamePaused)
            return;
        setNeurons(prev => prev.map(neuron => {
            if (neuron.id === neuronId && neuron.type === 'input') {
                return Object.assign(Object.assign({}, neuron), { active: !neuron.active, energy: 100 });
            }
            return neuron;
        }));
        // Перевірка правильності паттерну
        setTimeout(() => {
            setNeurons(current => {
                const inputNeurons = current.filter(n => n.type === 'input');
                const currentPattern = inputNeurons.map(n => n.active ? 1 : 0);
                if (gameTarget && JSON.stringify(currentPattern) === JSON.stringify(gameTarget.pattern)) {
                    // Правильний паттерн!
                    setGameStats(prevStats => {
                        const newScore = prevStats.score + gameTarget.points * (prevStats.combo + 1);
                        const newCombo = prevStats.combo + 1;
                        const accuracy = Math.min(100, prevStats.accuracy + 2);
                        onScoreUpdate(newScore);
                        onXPGain(gameTarget.points);
                        return Object.assign(Object.assign({}, prevStats), { score: newScore, combo: newCombo, accuracy });
                    });
                    generateTarget();
                    // Анімація успіху
                    return current.map(neuron => (Object.assign(Object.assign({}, neuron), { energy: neuron.type === 'output' ? 100 : neuron.energy })));
                }
                else {
                    // Неправильний паттерн
                    setGameStats(prevStats => (Object.assign(Object.assign({}, prevStats), { combo: 0, accuracy: Math.max(0, prevStats.accuracy - 5) })));
                }
                return current;
            });
        }, 500);
    }, [gameActive, gamePaused, gameTarget, onXPGain, onScoreUpdate, generateTarget]);
    // Анімація поширення сигналу
    (0, react_1.useEffect)(() => {
        if (!gameActive)
            return;
        const interval = setInterval(() => {
            setNeurons(prev => prev.map(neuron => (Object.assign(Object.assign({}, neuron), { energy: Math.max(0, neuron.energy - 10) }))));
        }, 100);
        return () => clearInterval(interval);
    }, [gameActive]);
    // Запуск гри
    const startGame = (0, react_1.useCallback)(() => {
        setGameActive(true);
        setGamePaused(false);
        setGameStats({
            score: 0,
            level: 1,
            lives: 3,
            combo: 0,
            time: 60,
            accuracy: 100
        });
        initializeNeuralNetwork();
        generateTarget();
        // Таймер гри
        timeInterval.current = setInterval(() => {
            setGameStats(prev => {
                if (prev.time <= 1) {
                    setGameActive(false);
                    return prev;
                }
                return Object.assign(Object.assign({}, prev), { time: prev.time - 1 });
            });
        }, 1000);
    }, [initializeNeuralNetwork, generateTarget]);
    // Зупинка гри
    const stopGame = (0, react_1.useCallback)(() => {
        setGameActive(false);
        setGamePaused(false);
        if (timeInterval.current)
            clearInterval(timeInterval.current);
    }, []);
    // Пауза гри
    const togglePause = (0, react_1.useCallback)(() => {
        setGamePaused(prev => !prev);
    }, []);
    (0, react_1.useEffect)(() => {
        return () => {
            if (timeInterval.current)
                clearInterval(timeInterval.current);
            if (gameInterval.current)
                clearInterval(gameInterval.current);
        };
    }, []);
    return (<>
      {/* Кнопка відкриття мінігри */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="secondary" onClick={() => setGameOpen(true)} sx={{
            position: 'fixed',
            bottom: 240,
            right: 24,
            background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
            '&:hover': {
                background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
                transform: 'scale(1.1)',
            }
        }}>
          <icons_material_1.Games />
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Діалог мінігри */}
      <material_1.Dialog open={gameOpen} onClose={() => setGameOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3,
                minHeight: '70vh'
            }
        }}>
        <material_1.DialogTitle>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
            <material_1.Box display="flex" alignItems="center" gap={2}>
              <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.secondary.main, fontSize: 32 }}/>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                🧠 Нейронна Мережа
              </material_1.Typography>
            </material_1.Box>
            <material_1.IconButton onClick={() => setGameOpen(false)} sx={{ color: 'white' }}>
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          {/* Статистика гри */}
          <material_1.Grid container spacing={2} mb={3}>
            <material_1.Grid item xs={6} md={2}>
              <material_1.Card sx={{ background: 'rgba(0,255,198,0.1)', border: '1px solid #00ffc6' }}>
                <material_1.CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <material_1.Typography variant="h6" color="#00ffc6">
                    {gameStats.score}
                  </material_1.Typography>
                  <material_1.Typography variant="caption" color="textSecondary">
                    Очки
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={6} md={2}>
              <material_1.Card sx={{ background: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107' }}>
                <material_1.CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <material_1.Typography variant="h6" color="#ffc107">
                    {gameStats.combo}x
                  </material_1.Typography>
                  <material_1.Typography variant="caption" color="textSecondary">
                    Комбо
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={6} md={2}>
              <material_1.Card sx={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
                <material_1.CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <material_1.Typography variant="h6" color="#4caf50">
                    {gameStats.accuracy}%
                  </material_1.Typography>
                  <material_1.Typography variant="caption" color="textSecondary">
                    Точність
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={6} md={2}>
              <material_1.Card sx={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336' }}>
                <material_1.CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <material_1.Typography variant="h6" color="#f44336">
                    {gameStats.lives}
                  </material_1.Typography>
                  <material_1.Typography variant="caption" color="textSecondary">
                    Життя
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={12} md={4}>
              <material_1.Card sx={{ background: 'rgba(156,39,176,0.1)', border: '1px solid #9c27b0' }}>
                <material_1.CardContent sx={{ py: 1 }}>
                  <material_1.Box display="flex" alignItems="center" gap={1}>
                    <icons_material_1.Timer sx={{ color: '#9c27b0' }}/>
                    <material_1.Typography variant="h6" color="#9c27b0">
                      {gameStats.time}s
                    </material_1.Typography>
                  </material_1.Box>
                  <material_1.LinearProgress variant="determinate" value={(gameStats.time / 60) * 100} sx={{
            mt: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(156,39,176,0.3)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#9c27b0'
            }
        }}/>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
          </material_1.Grid>

          {/* Поточне завдання */}
          {gameTarget && (<material_1.Card sx={{ mb: 3, background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3' }}>
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ color: '#2196f3', mb: 1 }}>
                  🎯 Завдання:
                </material_1.Typography>
                <material_1.Typography variant="body1" sx={{ mb: 1 }}>
                  {gameTarget.description}
                </material_1.Typography>
                <material_1.Typography variant="body2" color="textSecondary">
                  Нагорода: {gameTarget.points} очок
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>)}

          {/* Ігрове поле - Нейронна мережа */}
          <material_1.Card sx={{ mb: 3, minHeight: 400, position: 'relative', overflow: 'hidden' }}>
            <material_1.CardContent>
              <material_1.Box position="relative" width="100%" height={400}>
                {/* Рендер нейронів */}
                {neurons.map((neuron) => (<framer_motion_1.motion.div key={neuron.id} style={{
                position: 'absolute',
                left: neuron.x,
                top: neuron.y,
                transform: 'translate(-50%, -50%)'
            }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} animate={{
                scale: neuron.active ? 1.2 : 1,
                opacity: neuron.energy > 0 ? 1 : 0.7
            }}>
                    <material_1.IconButton onClick={() => handleNeuronClick(neuron.id)} disabled={neuron.type !== 'input' || !gameActive || gamePaused} sx={{
                width: 60,
                height: 60,
                background: neuron.active
                    ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.secondary.main})`
                    : 'rgba(255,255,255,0.1)',
                border: `2px solid ${neuron.type === 'input' ? nexusTheme_1.nexusColors.primary.main :
                    neuron.type === 'hidden' ? nexusTheme_1.nexusColors.secondary.main :
                        nexusTheme_1.nexusColors.warning.main}`,
                boxShadow: neuron.energy > 0
                    ? `0 0 20px ${nexusTheme_1.nexusColors.primary.main}`
                    : 'none',
                '&:hover': {
                    background: neuron.type === 'input'
                        ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.secondary.main})`
                        : undefined
                }
            }}>
                      <icons_material_1.Psychology sx={{
                color: neuron.active ? 'white' : nexusTheme_1.nexusColors.grey[400],
                fontSize: 24
            }}/>
                    </material_1.IconButton>
                  </framer_motion_1.motion.div>))}

                {/* Лейбли шарів */}
                <material_1.Typography variant="caption" sx={{
            position: 'absolute',
            left: 50,
            top: 20,
            color: nexusTheme_1.nexusColors.primary.main,
            fontWeight: 'bold'
        }}>
                  Вхідний шар
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{
            position: 'absolute',
            left: 250,
            top: 20,
            color: nexusTheme_1.nexusColors.secondary.main,
            fontWeight: 'bold'
        }}>
                  Прихований шар
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{
            position: 'absolute',
            left: 450,
            top: 20,
            color: nexusTheme_1.nexusColors.warning.main,
            fontWeight: 'bold'
        }}>
                  Вихідний шар
                </material_1.Typography>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>

          {/* Кнопки управління */}
          <material_1.Box display="flex" gap={2} justifyContent="center">
            {!gameActive ? (<material_1.Button variant="contained" startIcon={<icons_material_1.PlayArrow />} onClick={startGame} sx={{
                background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #45a049, #7cb342)'
                }
            }}>
                Почати Гру
              </material_1.Button>) : (<>
                <material_1.Button variant="contained" startIcon={gamePaused ? <icons_material_1.PlayArrow /> : <icons_material_1.Pause />} onClick={togglePause} sx={{
                background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #f57c00, #ffb300)'
                }
            }}>
                  {gamePaused ? 'Продовжити' : 'Пауза'}
                </material_1.Button>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Refresh />} onClick={stopGame} sx={{
                background: 'linear-gradient(45deg, #f44336, #e57373)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #d32f2f, #ef5350)'
                }
            }}>
                  Завершити
                </material_1.Button>
              </>)}
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>
    </>);
};
exports.default = NeuralNetworkGame;
