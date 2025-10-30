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
const material_1 = require("@mui/material");
const lab_1 = require("@mui/lab");
const icons_material_1 = require("@mui/icons-material");
const LineChart_1 = require("@mui/x-charts/LineChart");
const nexusTheme_1 = require("../../theme/nexusTheme");
const ChronoModule = () => {
    const [timelineData, setTimelineData] = (0, react_1.useState)([
        { time: '00:00', imports: 120, exports: 95, anomalies: 2 },
        { time: '04:00', imports: 150, exports: 110, anomalies: 1 },
        { time: '08:00', imports: 280, exports: 190, anomalies: 0 },
        { time: '12:00', imports: 340, exports: 250, anomalies: 3 },
        { time: '16:00', imports: 290, exports: 220, anomalies: 1 },
        { time: '20:00', imports: 180, exports: 140, anomalies: 0 },
    ]);
    const [events] = (0, react_1.useState)([
        {
            id: '1',
            timestamp: '2025-09-27 14:30',
            title: 'Аномалія в імпорті',
            type: 'anomaly',
            value: 350,
            description: 'Різкий стрибок імпорту товарів з ЄС на 45%'
        },
        {
            id: '2',
            timestamp: '2025-09-27 12:15',
            title: 'Тренд зростання',
            type: 'trend',
            value: 280,
            description: 'Стабільне зростання експорту протягом 6 годин'
        },
        {
            id: '3',
            timestamp: '2025-09-27 09:45',
            title: 'Нормалізація показників',
            type: 'normal',
            value: 200,
            description: 'Повернення до нормальних значень після ранкового сплеску'
        },
        {
            id: '4',
            timestamp: '2025-09-27 06:20',
            title: 'Попередження системи',
            type: 'warning',
            value: 150,
            description: 'Виявлено підозрілі патерни в декларації товарів'
        }
    ]);
    const getEventIcon = (type) => {
        switch (type) {
            case 'anomaly': return <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.error }}/>;
            case 'trend': return <icons_material_1.TrendingUp sx={{ color: nexusTheme_1.nexusColors.success }}/>;
            case 'warning': return <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.warning }}/>;
            default: return <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.emerald }}/>;
        }
    };
    const getEventColor = (type) => {
        switch (type) {
            case 'anomaly': return nexusTheme_1.nexusColors.error;
            case 'trend': return nexusTheme_1.nexusColors.success;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            default: return nexusTheme_1.nexusColors.emerald;
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.frost,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.sapphire})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
        🕐 Хроно-Аналіз 4D
      </material_1.Typography>

      <material_1.Grid container spacing={3}>
        {/* Головний граф */}
        <material_1.Grid item xs={12} lg={8}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 2,
            p: 2
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              📈 Тренди імпорту/експорту (24 години)
            </material_1.Typography>

            <material_1.Box sx={{ width: '100%', height: 300 }}>
              <LineChart_1.LineChart width={800} height={300} series={[
            {
                data: timelineData.map(item => item.imports),
                label: 'Імпорт',
                color: nexusTheme_1.nexusColors.emerald
            },
            {
                data: timelineData.map(item => item.exports),
                label: 'Експорт',
                color: nexusTheme_1.nexusColors.sapphire
            }
        ]} xAxis={[{
                scaleType: 'point',
                data: timelineData.map(item => item.time)
            }]} sx={{
            '& .MuiChartsAxis-line': {
                stroke: nexusTheme_1.nexusColors.nebula
            },
            '& .MuiChartsAxis-tick': {
                stroke: nexusTheme_1.nexusColors.nebula
            },
            '& .MuiChartsAxis-tickLabel': {
                fill: nexusTheme_1.nexusColors.nebula
            }
        }}/>
            </material_1.Box>
          </material_1.Card>
        </material_1.Grid>

        {/* Таймлайн подій */}
        <material_1.Grid item xs={12} lg={4}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}B3)`,
            border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 2,
            p: 2,
            height: '360px',
            overflow: 'auto'
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              🎯 Хронологія подій
            </material_1.Typography>

            <lab_1.Timeline sx={{ p: 0 }}>
              {events.map((event, index) => (<lab_1.TimelineItem key={event.id}>
                  <lab_1.TimelineSeparator>
                    <lab_1.TimelineDot sx={{ bgcolor: 'transparent', p: 0 }}>
                      {getEventIcon(event.type)}
                    </lab_1.TimelineDot>
                    {index < events.length - 1 && <lab_1.TimelineConnector sx={{ bgcolor: nexusTheme_1.nexusColors.shadow }}/>}
                  </lab_1.TimelineSeparator>
                  <lab_1.TimelineContent>
                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 600 }}>
                        {event.title}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                        {event.timestamp}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mt: 0.5 }}>
                        {event.description}
                      </material_1.Typography>
                      <material_1.Chip size="small" label={`Значення: ${event.value}`} sx={{
                mt: 1,
                backgroundColor: `${getEventColor(event.type)}20`,
                color: getEventColor(event.type),
                fontSize: '0.7rem'
            }}/>
                    </material_1.Box>
                  </lab_1.TimelineContent>
                </lab_1.TimelineItem>))}
            </lab_1.Timeline>
          </material_1.Card>
        </material_1.Grid>

        {/* Статистика */}
        <material_1.Grid item xs={12}>
          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12} sm={6} md={3}>
              <material_1.Card sx={{ background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.success}20, ${nexusTheme_1.nexusColors.emerald}10)`, border: `1px solid ${nexusTheme_1.nexusColors.success}40`, p: 2 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.success }}>
                  📈 Загальний тренд
                </material_1.Typography>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost }}>+12.5%</material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>За останні 24 години</material_1.Typography>
              </material_1.Card>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={3}>
              <material_1.Card sx={{ background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.error}20, ${nexusTheme_1.nexusColors.crimson}10)`, border: `1px solid ${nexusTheme_1.nexusColors.error}40`, p: 2 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.error }}>
                  ⚠️ Аномалії
                </material_1.Typography>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost }}>7</material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>Виявлено сьогодні</material_1.Typography>
              </material_1.Card>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={3}>
              <material_1.Card sx={{ background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}20, ${nexusTheme_1.nexusColors.amethyst}10)`, border: `1px solid ${nexusTheme_1.nexusColors.sapphire}40`, p: 2 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                  🔄 Активність
                </material_1.Typography>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost }}>1.2K</material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>Транзакцій/годину</material_1.Typography>
              </material_1.Card>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={3}>
              <material_1.Card sx={{ background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.warning}20, ${nexusTheme_1.nexusColors.emerald}10)`, border: `1px solid ${nexusTheme_1.nexusColors.warning}40`, p: 2 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                  🎯 Точність
                </material_1.Typography>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost }}>94.8%</material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>Прогнозування</material_1.Typography>
              </material_1.Card>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = ChronoModule;
