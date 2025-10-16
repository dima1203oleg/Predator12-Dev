/**
 * Test import - verify components can be imported
 */

// Test direct imports
import Head3D from './components/Head3D';
import ChatPanel from './components/ChatPanel';
import NetworkPanel from './components/NetworkPanel';
import RiskBanner from './components/RiskBanner';
import MicStatus from './components/MicStatus';

// Test barrel export
import * as Components from './components';

console.log('Imports work!', Head3D, ChatPanel, NetworkPanel, RiskBanner, MicStatus, Components);
