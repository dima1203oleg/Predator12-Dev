/**
 * Network Graph - Візуалізація мережі зв'язків
 * Інтерактивний граф для показу відношень між сутностями
 */

class NetworkGraph {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.nodes = [];
        this.links = [];
        this.selectedNode = null;
        
        // Розміри
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Кольори за типом ризику
        this.riskColors = {
            low: '#80ff00',      // Зелений
            medium: '#ffff00',   // Жовтий  
            high: '#ff0080',     // Пурпурний
            critical: '#ff0000'  // Червоний
        };
        
        this.init();
    }

    init() {
        this.createSVG();
        this.loadSampleData();
        this.setupForceSimulation();
        this.render();
        
        console.log('Network Graph initialized');
    }

    createSVG() {
        // Очистити контейнер
        this.container.innerHTML = '';
        
        // Створити SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'network-svg');
            
        // Додати градієнти для свічення
        const defs = this.svg.append('defs');
        
        // Градієнт для високого ризику
        const highRiskGradient = defs.append('radialGradient')
            .attr('id', 'highRiskGlow')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');
            
        highRiskGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ff0080')
            .attr('stop-opacity', 1);
            
        highRiskGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ff0080')
            .attr('stop-opacity', 0);
    }

    loadSampleData() {
        // Зразкові дані мережі
        this.nodes = [
            {
                id: 'counteragent_x',
                name: 'Контрагент X',
                type: 'entity',
                risk: 'high',
                details: {
                    amount: '5000$',
                    source: 'Prozorro',
                    description: 'Підозрілі транзакції'
                }
            },
            {
                id: 'officer_y',
                name: 'Онличенк Y',
                type: 'person',
                risk: 'medium',
                details: {
                    position: 'Офіцер',
                    department: 'Закупівлі'
                }
            },
            {
                id: 'company_offshore',
                name: 'Судова справа',
                type: 'legal',
                risk: 'high',
                details: {
                    case_number: '#2023-456',
                    status: 'Розглядається'
                }
            },
            {
                id: 'sanctioned_entity',
                name: 'Офшор',
                type: 'offshore',
                risk: 'critical',
                details: {
                    jurisdiction: 'BVI',
                    status: 'Санкційна фірма'
                }
            }
        ];

        this.links = [
            {
                source: 'officer_y',
                target: 'counteragent_x',
                type: 'transaction',
                strength: 0.8
            },
            {
                source: 'counteragent_x',
                target: 'company_offshore',
                type: 'legal_case',
                strength: 0.9
            },
            {
                source: 'counteragent_x',
                target: 'sanctioned_entity',
                type: 'connection',
                strength: 1.0
            }
        ];
    }

    setupForceSimulation() {
        // Налаштування фізичної симуляції
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(100)
                .strength(d => d.strength))
            .force('charge', d3.forceManyBody()
                .strength(-300))
            .force('center', d3.forceCenter(
                this.width / 2, 
                this.height / 2
            ))
            .force('collision', d3.forceCollide()
                .radius(30));
    }

    render() {
        // Контейнери для елементів
        const linkGroup = this.svg.append('g').attr('class', 'links');
        const nodeGroup = this.svg.append('g').attr('class', 'nodes');
        const labelGroup = this.svg.append('g').attr('class', 'labels');

        // Лінії зв'язків
        const links = linkGroup.selectAll('.link')
            .data(this.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', d => this.getLinkColor(d.type))
            .attr('stroke-width', d => d.strength * 3)
            .attr('stroke-dasharray', '5,5')
            .style('animation', 'dashMove 2s linear infinite');

        // Вузли
        const nodes = nodeGroup.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', d => this.getNodeSize(d.risk))
            .attr('fill', d => this.riskColors[d.risk])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .style('filter', d => d.risk === 'high' ? 'drop-shadow(0 0 10px #ff0080)' : 'none')
            .style('cursor', 'pointer')
            .call(this.createDragBehavior());

        // Лейбли
        const labels = labelGroup.selectAll('.node-label')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dy', -25)
            .style('font-size', '12px')
            .style('fill', '#ffffff')
            .style('pointer-events', 'none')
            .text(d => d.name);

        // Обробники подій
        nodes.on('click', (event, d) => {
            this.selectNode(d);
        });

        nodes.on('mouseover', (event, d) => {
            this.highlightNode(d, true);
        });

        nodes.on('mouseout', (event, d) => {
            if (this.selectedNode !== d) {
                this.highlightNode(d, false);
            }
        });

        // Оновлення позицій при симуляції
        this.simulation.on('tick', () => {
            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
    }

    createDragBehavior() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) {
                    this.simulation.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) {
                    this.simulation.alphaTarget(0);
                }
                d.fx = null;
                d.fy = null;
            });
    }

    selectNode(node) {
        // Скинути попередній вибір
        if (this.selectedNode) {
            this.highlightNode(this.selectedNode, false);
        }

        // Встановити новий вибір
        this.selectedNode = node;
        this.highlightNode(node, true);
        
        // Оновити панель деталей
        this.updateNodeDetails(node);
        
        // Анімація пульсації
        const nodeElement = this.svg.select(`.node`)
            .filter(d => d.id === node.id);
            
        nodeElement
            .transition()
            .duration(300)
            .attr('r', this.getNodeSize(node.risk) * 1.5)
            .transition()
            .duration(300)
            .attr('r', this.getNodeSize(node.risk));

        console.log('Selected node:', node.name);
    }

    highlightNode(node, highlight) {
        const nodeElement = this.svg.select(`.node`)
            .filter(d => d.id === node.id);
            
        if (highlight) {
            nodeElement
                .style('stroke-width', 4)
                .style('filter', 'drop-shadow(0 0 15px currentColor)');
        } else {
            nodeElement
                .style('stroke-width', 2)
                .style('filter', node.risk === 'high' ? 'drop-shadow(0 0 10px #ff0080)' : 'none');
        }
    }

    updateNodeDetails(node) {
        const detailsContainer = document.getElementById('nodeDetails');
        if (!detailsContainer) return;

        let detailsHTML = `
            <h3>${node.name}</h3>
            <div class="detail-item">
                <span class="label">Тип:</span>
                <span class="value">${this.getTypeLabel(node.type)}</span>
            </div>
            <div class="detail-item">
                <span class="label">Ризик:</span>
                <span class="value risk-${node.risk}">${this.getRiskLabel(node.risk)}</span>
            </div>
        `;

        // Додати специфічні деталі
        if (node.details) {
            for (const [key, value] of Object.entries(node.details)) {
                const label = this.getDetailLabel(key);
                detailsHTML += `
                    <div class="detail-item">
                        <span class="label">${label}:</span>
                        <span class="value">${value}</span>
                    </div>
                `;
            }
        }

        detailsContainer.innerHTML = detailsHTML;
    }

    addNode(nodeData) {
        // Додати новий вузол
        this.nodes.push(nodeData);
        
        // Перезапустити симуляцію
        this.simulation.nodes(this.nodes);
        this.simulation.alpha(1).restart();
        
        // Оновити відображення
        this.updateVisualization();
    }

    addLink(linkData) {
        // Додати новий зв'язок
        this.links.push(linkData);
        
        // Оновити force simulation
        this.simulation
            .force('link')
            .links(this.links);
            
        this.simulation.alpha(1).restart();
        
        // Оновити відображення
        this.updateVisualization();
    }

    updateVisualization() {
        // Перемалювати граф з новими даними
        this.svg.selectAll('.links').remove();
        this.svg.selectAll('.nodes').remove();
        this.svg.selectAll('.labels').remove();
        
        this.render();
    }

    getLinkColor(type) {
        const colors = {
            transaction: '#00ffff',
            legal_case: '#ff0080',
            connection: '#ffff00',
            ownership: '#80ff00'
        };
        return colors[type] || '#ffffff';
    }

    getNodeSize(risk) {
        const sizes = {
            low: 8,
            medium: 12,
            high: 16,
            critical: 20
        };
        return sizes[risk] || 10;
    }

    getTypeLabel(type) {
        const labels = {
            entity: 'Сутність',
            person: 'Особа',
            legal: 'Юридична справа',
            offshore: 'Офшор',
            company: 'Компанія'
        };
        return labels[type] || type;
    }

    getRiskLabel(risk) {
        const labels = {
            low: 'Низький',
            medium: 'Середній',
            high: 'Високий',
            critical: 'Критичний'
        };
        return labels[risk] || risk;
    }

    getDetailLabel(key) {
        const labels = {
            amount: 'Сума',
            source: 'Джерело',
            description: 'Опис',
            position: 'Посада',
            department: 'Відділ',
            case_number: 'Номер справи',
            status: 'Статус',
            jurisdiction: 'Юрисдикція'
        };
        return labels[key] || key;
    }

    resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.svg
            .attr('width', this.width)
            .attr('height', this.height);
            
        this.simulation
            .force('center', d3.forceCenter(
                this.width / 2, 
                this.height / 2
            ));
    }

    reset() {
        this.selectedNode = null;
        this.simulation.alpha(1).restart();
        
        // Скинути деталі
        const detailsContainer = document.getElementById('nodeDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<p>Виберіть вузол для деталей</p>';
        }
    }

    destroy() {
        if (this.simulation) {
            this.simulation.stop();
        }
        
        if (this.svg) {
            this.svg.remove();
        }
        
        console.log('Network Graph destroyed');
    }
}

// Експорт для використання
window.NetworkGraph = NetworkGraph;
