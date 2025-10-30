"use strict";
/**
 * NetworkPanel Component - Entity Connections Graph
 *
 * Features:
 * - Interactive node-link diagram (d3-force simulation)
 * - Click to select entity → load details
 * - Zoom/pan controls
 * - Aggregation for >60 nodes
 * - Responsive canvas rendering
 * - Integration with backend graph API
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
const react_i18next_1 = require("react-i18next");
const assistantStore_1 = require("../state/assistantStore");
const useAssistantAPI_1 = require("../hooks/useAssistantAPI");
const d3 = __importStar(require("d3"));
function NetworkPanel() {
    const { t } = (0, react_i18next_1.useTranslation)();
    const svgRef = (0, react_1.useRef)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const graph = (0, assistantStore_1.useAssistantStore)((s) => s.graph);
    const setGraph = (0, assistantStore_1.useAssistantStore)((s) => s.setGraph);
    const setSelectedNode = (0, assistantStore_1.useAssistantStore)((s) => s.setSelectedNode);
    const { fetchGraph } = (0, useAssistantAPI_1.useAssistantAPI)();
    // D3 force simulation
    (0, react_1.useEffect)(() => {
        if (!svgRef.current || graph.nodes.length === 0)
            return;
        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        // Clear previous
        svg.selectAll('*').remove();
        // Create groups
        const g = svg.append('g');
        const linkGroup = g.append('g').attr('class', 'links');
        const nodeGroup = g.append('g').attr('class', 'nodes');
        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
        svg.call(zoom);
        // Force simulation
        const simulation = d3.forceSimulation(graph.nodes)
            .force('link', d3.forceLink(graph.edges).id((d) => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));
        // Links
        const links = linkGroup
            .selectAll('line')
            .data(graph.edges)
            .join('line')
            .attr('stroke', '#06b6d4')
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1.5);
        // Nodes
        const nodes = nodeGroup
            .selectAll('g')
            .data(graph.nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));
        // Node circles
        nodes.append('circle')
            .attr('r', (d) => d.id === graph.selectedId ? 12 : 8)
            .attr('fill', (d) => d.id === graph.selectedId ? '#06b6d4' : '#374151')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', (d) => d.id === graph.selectedId ? 2 : 1);
        // Node labels
        nodes.append('text')
            .text((d) => d.label)
            .attr('x', 0)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#9ca3af')
            .attr('font-size', '10px');
        // Click handler
        nodes.on('click', (event, d) => __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            setSelectedNode(d.id);
            // Fetch entity details
            setLoading(true);
            try {
                const details = yield fetchGraph(d.id);
                if (details) {
                    setGraph(details.nodes, details.edges);
                    setSelectedNode(d.id);
                }
            }
            catch (error) {
                console.error('Failed to fetch graph:', error);
            }
            finally {
                setLoading(false);
            }
        }));
        // Simulation tick
        simulation.on('tick', () => {
            links
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
            nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
        });
        // Drag handlers
        function dragStarted(event) {
            if (!event.active)
                simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragEnded(event) {
            if (!event.active)
                simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return () => {
            simulation.stop();
        };
    }, [graph.nodes, graph.edges, graph.selectedId]);
    return (<div className="relative flex flex-col h-full bg-nexus-panel border-l border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <h2 className="text-lg font-bold text-cyan-400">
          {t('network.title')}
        </h2>
        {loading && (<div className="text-xs text-cyan-400">
            {t('network.loading')}
          </div>)}
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative">
        {graph.nodes.length === 0 ? (<div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>{t('network.empty')}</p>
              <p className="text-sm mt-2">{t('network.hint')}</p>
            </div>
          </div>) : (<svg ref={svgRef} className="w-full h-full graph-canvas"/>)}
      </div>

      {/* Controls */}
      <div className="p-2 border-t border-cyan-500/20 flex items-center justify-between text-xs text-gray-500">
        <span>
          {t('network.nodeCount', { count: graph.nodes.length })}
        </span>
        <div className="flex space-x-2">
          <button onClick={() => {
            setGraph([], []);
            setSelectedNode(undefined);
        }} className="px-2 py-1 hover:text-cyan-400 transition-colors" title={t('network.clear')}>
            🗑️ Clear
          </button>
          <button className="px-2 py-1 hover:text-cyan-400 transition-colors" title={t('network.reset')} onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
        }}>
            ⟲ Reset View
          </button>
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && graph.selectedId && (<div className="absolute top-14 right-2 text-xs text-cyan-400 font-mono bg-black/50 p-2 rounded">
          <div>Selected: {graph.selectedId}</div>
          <div>Nodes: {graph.nodes.length}</div>
          <div>Edges: {graph.edges.length}</div>
        </div>)}
    </div>);
}
exports.default = NetworkPanel;
