// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Badge,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as ReasoningIcon,
  Code as CodeIcon,
  Speed as QuickIcon,
  Psychology as EmbedIcon,
  Visibility as VisionIcon,
  DataArray as GenIcon,
  Star as StarIcon,
  TrendingUp as PerformanceIcon,
  MonetizationOn as CostIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import {
  FREE_MODELS_CATALOG,
  getAllFreeModels,
  getModelsByCategory,
  formatModelName,
  ModelInfo
} from '../../services/modelRegistry';

interface ModelCatalogProps {
  onModelSelect?: (modelId: string) => void;
  selectedModel?: string;
  filterCategory?: string;
  showPerformance?: boolean;
}

const ModelCatalog: React.FC<ModelCatalogProps> = ({
  onModelSelect,
  selectedModel,
  filterCategory,
  showPerformance = true
}) => {
  const { t } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['reasoning', 'code']);

  const categoryIcons = useMemo(() => ({
    reasoning: ReasoningIcon,
    code: CodeIcon,
    quick: QuickIcon,
    embed: EmbedIcon,
    vision: VisionIcon,
    gen: GenIcon
  }), []);

  const categoryColors = useMemo(() => ({
    reasoning: nexusColors.sapphire,
    code: nexusColors.quantum,
    quick: nexusColors.emerald,
    embed: nexusColors.crimson,
    vision: nexusColors.nebula,
    gen: nexusColors.frost
  }), []);

  const getCategoryStats = (category: string) => {
    const models = getModelsByCategory(category);
    const avgPerformance = models.reduce((sum, m) => sum + m.performance, 0) / models.length;
    const topModel = models.reduce((best, current) => 
      current.performance > best.performance ? current : best
    );
    return { count: models.length, avgPerformance, topModel };
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleModelClick = (modelId: string) => {
    onModelSelect?.(modelId);
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return nexusColors.emerald;
    if (performance >= 80) return nexusColors.quantum;
    if (performance >= 70) return '#FFA726';
    return nexusColors.crimson;
  };

  const filteredCategories = filterCategory 
    ? [filterCategory] 
    : Object.keys(FREE_MODELS_CATALOG);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{
          color: nexusColors.frost,
          fontFamily: 'Orbitron',
          mb: 1,
          background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Каталог ШІ Моделей
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<StarIcon />}
            label={`${getAllFreeModels().length} безплатних моделей`}
            sx={{
              backgroundColor: `${nexusColors.emerald}20`,
              color: nexusColors.emerald,
              border: `1px solid ${nexusColors.emerald}60`
            }}
          />
          {showPerformance && (
            <Chip
              icon={<PerformanceIcon />}
              label="Сортування за продуктивністю"
              variant="outlined"
              sx={{ borderColor: nexusColors.nebula, color: nexusColors.nebula }}
            />
          )}
        </Stack>
      </Box>

      {/* Model Categories */}
      <Grid container spacing={2}>
        {filteredCategories.map(category => {
          const stats = getCategoryStats(category);
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
          const isExpanded = expandedCategories.includes(category);
          
          return (
            <Grid item xs={12} key={category}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Object.keys(FREE_MODELS_CATALOG).indexOf(category) * 0.1 }}
              >
                <Accordion
                  expanded={isExpanded}
                  onChange={() => handleCategoryToggle(category)}
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                    border: `1px solid ${categoryColors[category as keyof typeof categoryColors]}60`,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-root': {
                      borderBottom: isExpanded ? `1px solid ${categoryColors[category as keyof typeof categoryColors]}60` : 'none'
                    }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: nexusColors.frost }} />}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                      <Badge badgeContent={stats.count} color="primary">
                        <IconComponent 
                          sx={{ 
                            color: categoryColors[category as keyof typeof categoryColors],
                            fontSize: '2rem'
                          }} 
                        />
                      </Badge>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: nexusColors.frost,
                          fontFamily: 'Orbitron',
                          textTransform: 'capitalize'
                        }}>
                          {category === 'reasoning' ? 'Розумування' :
                           category === 'code' ? 'Програмування' :
                           category === 'quick' ? 'Швидкі відповіді' :
                           category === 'embed' ? 'Вбудовування' :
                           category === 'vision' ? 'Комп\'ютерний зір' : 
                           'Генерація'}
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                            Середня продуктивність: {stats.avgPerformance.toFixed(1)}%
                          </Typography>
                          <Chip
                            size="small"
                            label={`Топ: ${formatModelName(stats.topModel.id)}`}
                            sx={{
                              backgroundColor: `${getPerformanceColor(stats.topModel.performance)}20`,
                              color: getPerformanceColor(stats.topModel.performance),
                              fontSize: '0.7rem'
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {getModelsByCategory(category)
                        .sort((a, b) => b.performance - a.performance) // Sort by performance desc
                        .map((model, index) => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              sx={{
                                background: selectedModel === model.id
                                  ? `linear-gradient(135deg, ${categoryColors[category as keyof typeof categoryColors]}40, ${categoryColors[category as keyof typeof categoryColors]}20)`
                                  : `linear-gradient(135deg, ${nexusColors.darkMatter}80, ${nexusColors.obsidian}60)`,
                                border: selectedModel === model.id
                                  ? `2px solid ${categoryColors[category as keyof typeof categoryColors]}`
                                  : `1px solid ${nexusColors.quantum}40`,
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: categoryColors[category as keyof typeof categoryColors],
                                  boxShadow: `0 2px 8px ${categoryColors[category as keyof typeof categoryColors]}40`
                                }
                              }}
                              onClick={() => handleModelClick(model.id)}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{
                                    color: nexusColors.frost,
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                  }}>
                                    {formatModelName(model.id)}
                                  </Typography>
                                  
                                  {index === 0 && (
                                    <Chip
                                      size="small"
                                      icon={<StarIcon sx={{ fontSize: '0.8rem' }} />}
                                      label="TOP"
                                      sx={{
                                        backgroundColor: nexusColors.quantum,
                                        color: nexusColors.obsidian,
                                        fontSize: '0.6rem',
                                        height: 18
                                      }}
                                    />
                                  )}
                                </Stack>
                                
                                <Typography variant="caption" sx={{
                                  color: nexusColors.shadow,
                                  display: 'block',
                                  mb: 1,
                                  fontSize: '0.7rem'
                                }}>
                                  {model.id}
                                </Typography>
                                
                                {showPerformance && (
                                  <Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                      <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                                        Продуктивність
                                      </Typography>
                                      <Typography variant="caption" sx={{ 
                                        color: getPerformanceColor(model.performance),
                                        fontWeight: 'bold'
                                      }}>
                                        {model.performance}%
                                      </Typography>
                                    </Stack>
                                    <LinearProgress
                                      variant="determinate"
                                      value={model.performance}
                                      sx={{
                                        height: 4,
                                        backgroundColor: nexusColors.darkMatter,
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: getPerformanceColor(model.performance)
                                        }
                                      }}
                                    />
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ModelCatalog;
