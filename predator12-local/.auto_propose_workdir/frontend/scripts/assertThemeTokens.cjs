// Simple build-time assertion that theme tokens are available
const path = require('path');
try {
  const tokens = require('@nexus/ui-theme/tokens.json');
  if (!tokens.colors || !tokens.colors['nexus-primary']) {
    throw new Error('Missing required nexus-primary token');
  }
  console.log('[assertThemeTokens] OK');
} catch (e) {
  console.error('[assertThemeTokens] FAILED', e.message);
  process.exit(1);
}
