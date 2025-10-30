"use strict";
// @ts-nocheck
/**
 * 🔗 LINK COLLECTOR
 *
 * Збір даних з URL, RSS, Sitemap
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
// ============= HELPER FUNCTIONS =============
const getLinkTypeIcon = (type) => {
    switch (type) {
        case 'rss': return <icons_material_1.RssFeed />;
        case 'sitemap': return <icons_material_1.Map />;
        default: return <icons_material_1.Link />;
    }
};
const detectLinkType = (url) => {
    const lower = url.toLowerCase();
    if (lower.includes('rss') || lower.includes('feed'))
        return 'rss';
    if (lower.includes('sitemap'))
        return 'sitemap';
    return 'url';
};
// ============= COMPONENT =============
const LinkCollector = () => {
    const [links, setLinks] = (0, react_1.useState)([]);
    const [inputUrl, setInputUrl] = (0, react_1.useState)('');
    const [linkType, setLinkType] = (0, react_1.useState)('url');
    const [crawlDepth, setCrawlDepth] = (0, react_1.useState)(1);
    const [extractImages, setExtractImages] = (0, react_1.useState)(true);
    const [extractLinks, setExtractLinks] = (0, react_1.useState)(false);
    // Add link
    const handleAddLink = (0, react_1.useCallback)(() => {
        if (!inputUrl.trim())
            return;
        const newLink = {
            id: `${Date.now()}-${Math.random()}`,
            url: inputUrl.trim(),
            type: linkType,
            status: 'pending',
            depth: crawlDepth,
            extractImages,
            extractLinks
        };
        setLinks(prev => [...prev, newLink]);
        setInputUrl('');
    }, [inputUrl, linkType, crawlDepth, extractImages, extractLinks]);
    // Auto-detect link type
    const handleUrlChange = (0, react_1.useCallback)((url) => {
        setInputUrl(url);
        setLinkType(detectLinkType(url));
    }, []);
    // Process links
    const handleProcessLinks = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        const pendingLinks = links.filter(l => l.status === 'pending');
        for (const linkItem of pendingLinks) {
            // Update status to processing
            setLinks(prev => prev.map(l => l.id === linkItem.id ? Object.assign(Object.assign({}, l), { status: 'processing' }) : l));
            try {
                // Simulate processing
                yield new Promise(resolve => setTimeout(resolve, 2000));
                // TODO: Implement real API call
                // const response = await fetch('/api/ingest/crawl', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify({
                //     url: linkItem.url,
                //     type: linkItem.type,
                //     depth: linkItem.depth,
                //     extractImages: linkItem.extractImages,
                //     extractLinks: linkItem.extractLinks
                //   })
                // });
                // const data = await response.json();
                // Success
                setLinks(prev => prev.map(l => l.id === linkItem.id
                    ? Object.assign(Object.assign({}, l), { status: 'success', itemsFound: Math.floor(Math.random() * 100) + 1 }) : l));
            }
            catch (error) {
                // Error
                setLinks(prev => prev.map(l => l.id === linkItem.id
                    ? Object.assign(Object.assign({}, l), { status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }) : l));
            }
        }
    }), [links]);
    // Remove link
    const handleRemove = (0, react_1.useCallback)((id) => {
        setLinks(prev => prev.filter(l => l.id !== id));
    }, []);
    // Clear all
    const handleClearAll = (0, react_1.useCallback)(() => {
        setLinks([]);
    }, []);
    // Statistics
    const stats = {
        total: links.length,
        pending: links.filter(l => l.status === 'pending').length,
        processing: links.filter(l => l.status === 'processing').length,
        success: links.filter(l => l.status === 'success').length,
        error: links.filter(l => l.status === 'error').length,
        totalItems: links.reduce((sum, l) => sum + (l.itemsFound || 0), 0)
    };
    return (<material_1.Stack spacing={3}>
      {/* Input Form */}
      <material_1.Card sx={{
            background: nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
            p: 3
        }}>
        <material_1.Stack spacing={2}>
          <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
            Add Link Source
          </material_1.Typography>

          {/* URL Input */}
          <material_1.TextField fullWidth label="URL" value={inputUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://example.com or https://example.com/feed.xml" onKeyPress={(e) => e.key === 'Enter' && handleAddLink()} sx={{
            '& .MuiOutlinedInput-root': {
                color: nexusThemeV2_1.nexusColorsDark.text.primary,
                '& fieldset': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
            }
        }}/>

          {/* Options */}
          <material_1.Stack direction="row" spacing={2}>
            <material_1.FormControl sx={{ minWidth: 150 }}>
              <material_1.InputLabel sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>Type</material_1.InputLabel>
              <material_1.Select value={linkType} onChange={(e) => setLinkType(e.target.value)} label="Type" sx={{
            color: nexusThemeV2_1.nexusColorsDark.text.primary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
        }}>
                <material_1.MenuItem value="url">URL (Web Page)</material_1.MenuItem>
                <material_1.MenuItem value="rss">RSS Feed</material_1.MenuItem>
                <material_1.MenuItem value="sitemap">Sitemap</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>

            {linkType === 'url' && (<material_1.FormControl sx={{ minWidth: 150 }}>
                <material_1.InputLabel sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>Crawl Depth</material_1.InputLabel>
                <material_1.Select value={crawlDepth} onChange={(e) => setCrawlDepth(e.target.value)} label="Crawl Depth" sx={{
                color: nexusThemeV2_1.nexusColorsDark.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusThemeV2_1.nexusColorsDark.border.medium }
            }}>
                  <material_1.MenuItem value={1}>Level 1 (Current page)</material_1.MenuItem>
                  <material_1.MenuItem value={2}>Level 2 (+ Links)</material_1.MenuItem>
                  <material_1.MenuItem value={3}>Level 3 (Deep crawl)</material_1.MenuItem>
                </material_1.Select>
              </material_1.FormControl>)}

            <material_1.FormControlLabel control={<material_1.Switch checked={extractImages} onChange={(e) => setExtractImages(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusThemeV2_1.nexusColorsDark.primary.main
                }
            }}/>} label="Extract Images" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={extractLinks} onChange={(e) => setExtractLinks(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusThemeV2_1.nexusColorsDark.primary.main
                }
            }}/>} label="Extract Links" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>
          </material_1.Stack>

          {/* Add Button */}
          <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={handleAddLink} disabled={!inputUrl.trim()} sx={{
            background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
            alignSelf: 'flex-start',
            '&:disabled': {
                background: nexusThemeV2_1.nexusColorsDark.border.light
            }
        }}>
            Add to Queue
          </material_1.Button>
        </material_1.Stack>
      </material_1.Card>

      {/* Statistics */}
      {links.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 2
            }}>
          <material_1.Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <material_1.Stack direction="row" spacing={2}>
              <material_1.Chip label={`Total: ${stats.total}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20', color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
              <material_1.Chip label={`Pending: ${stats.pending}`} size="small" icon={<icons_material_1.Schedule />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.yellow + '20', color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>
              <material_1.Chip label={`Success: ${stats.success}`} size="small" icon={<icons_material_1.CheckCircle />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.success + '20', color: nexusThemeV2_1.nexusColorsDark.status.success }}/>
              {stats.error > 0 && (<material_1.Chip label={`Errors: ${stats.error}`} size="small" icon={<icons_material_1.Error />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.error + '20', color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
              {stats.totalItems > 0 && (<material_1.Chip label={`Items Found: ${stats.totalItems}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.cyan + '20', color: nexusThemeV2_1.nexusColorsDark.accent.cyan }}/>)}
            </material_1.Stack>

            <material_1.Stack direction="row" spacing={1}>
              <material_1.Button variant="contained" size="small" startIcon={<icons_material_1.PlayArrow />} disabled={stats.pending === 0} onClick={handleProcessLinks} sx={{
                background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
                '&:disabled': {
                    background: nexusThemeV2_1.nexusColorsDark.border.light
                }
            }}>
                Process ({stats.pending})
              </material_1.Button>
              <material_1.Button variant="outlined" size="small" onClick={handleClearAll} sx={{
                borderColor: nexusThemeV2_1.nexusColorsDark.border.medium,
                color: nexusThemeV2_1.nexusColorsDark.text.secondary
            }}>
                Clear All
              </material_1.Button>
            </material_1.Stack>
          </material_1.Stack>
        </material_1.Card>)}

      {/* Link List */}
      {links.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                maxHeight: 500,
                overflow: 'auto'
            }}>
          <material_1.List>
            {links.map((linkItem, index) => (<material_1.ListItem key={linkItem.id} sx={{
                    borderBottom: index < links.length - 1 ? `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}` : 'none'
                }}>
                <material_1.ListItemIcon>
                  {getLinkTypeIcon(linkItem.type)}
                </material_1.ListItemIcon>

                <material_1.ListItemText primary={<material_1.Stack direction="row" spacing={1} alignItems="center">
                      <material_1.Typography variant="body2" sx={{
                        color: nexusThemeV2_1.nexusColorsDark.text.primary,
                        maxWidth: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {linkItem.url}
                      </material_1.Typography>
                      <material_1.Chip label={linkItem.type.toUpperCase()} size="small" sx={{ height: 20 }}/>
                      {linkItem.depth && linkItem.depth > 1 && (<material_1.Chip label={`Depth: ${linkItem.depth}`} size="small" sx={{ height: 20 }}/>)}
                    </material_1.Stack>} secondary={<material_1.Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {linkItem.status === 'processing' && (<material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.cyan }}>
                          Processing...
                        </material_1.Typography>)}

                      {linkItem.status === 'success' && linkItem.itemsFound !== undefined && (<material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}>
                          Found {linkItem.itemsFound} items
                        </material_1.Typography>)}

                      {linkItem.status === 'error' && (<material_1.Alert severity="error" sx={{ py: 0 }}>
                          {linkItem.error || 'Processing failed'}
                        </material_1.Alert>)}
                    </material_1.Stack>}/>

                <material_1.ListItemSecondaryAction>
                  <material_1.Stack direction="row" spacing={1} alignItems="center">
                    {linkItem.status === 'success' && (<icons_material_1.CheckCircle sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}/>)}
                    {linkItem.status === 'error' && (<icons_material_1.Error sx={{ color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
                    {linkItem.status === 'pending' && (<icons_material_1.Schedule sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>)}

                    <material_1.IconButton size="small" onClick={() => handleRemove(linkItem.id)} disabled={linkItem.status === 'processing'}>
                      <icons_material_1.Delete />
                    </material_1.IconButton>
                  </material_1.Stack>
                </material_1.ListItemSecondaryAction>
              </material_1.ListItem>))}
          </material_1.List>
        </material_1.Card>)}
    </material_1.Stack>);
};
exports.default = LinkCollector;
