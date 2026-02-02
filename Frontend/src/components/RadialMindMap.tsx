import { toPng } from 'html-to-image';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
    MarkerType,
    Node,
    Position,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapNode {
    title: string;
    children: MindMapNode[];
}

interface RadialMindMapProps {
    data: MindMapNode;
    onExportReady?: (exportFn: () => Promise<string>) => void;
}

// Add this export handle type
export interface MindMapExportHandle {
    exportAsImage: () => Promise<string>;
}

// Enhanced Custom Node Component
const CustomNode = ({ data, isConnectable }: any) => {
    const getNodeSize = (level: number) => {
        if (level === 0) return 'w-48 h-48'; // Large root node
        if (level === 1) return 'w-36 h-36'; // Medium for first level
        if (level === 2) return 'w-28 h-28'; // Smaller for second level
        return 'w-24 h-24'; // Smallest for deeper levels
    };

    const getFontSize = (level: number) => {
        if (level === 0) return 'text-xl font-bold';
        if (level === 1) return 'text-base font-semibold';
        return 'text-sm font-medium';
    };

    const size = getNodeSize(data.level);
    const fontSize = getFontSize(data.level);

    return (
        <div
            className={`${size} rounded-full shadow-lg flex items-center justify-center p-4 transition-all hover:scale-105 ${data.className}`}
            style={{
                border: 'none',
            }}
        >
            {/* Target Handle (Input) */}
            {data.level > 0 && (
                <Handle
                    type="target"
                    position={data.targetPosition || Position.Left}
                    isConnectable={isConnectable}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        width: '1px',
                        height: '1px',
                    }}
                />
            )}

            <div className={`text-center ${fontSize} px-2 break-words`}>
                {data.label}
            </div>

            {/* Source Handle (Output) */}
            <Handle
                type="source"
                position={data.sourcePosition || Position.Right}
                isConnectable={isConnectable}
                style={{
                    background: 'transparent',
                    border: 'none',
                    width: '1px',
                    height: '1px',
                }}
            />
        </div>
    );
};

// Helper: Calculate subtree weights (leaf counts)
const calculateWeights = (node: MindMapNode): any => {
    if (!node.children || node.children.length === 0) {
        return { ...node, weight: 1 };
    }
    const childrenWithWeights = node.children.map(calculateWeights);
    const totalWeight = childrenWithWeights.reduce((acc: number, child: any) => acc + child.weight, 0);
    return { ...node, children: childrenWithWeights, weight: totalWeight };
};

// Modern color palette - vibrant and clean
const LEVEL_COLORS = [
    // Root node - bold primary color
    'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl',
    // Level 1 - varied colors
    [
        'bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-lg',
        'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-lg',
        'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg',
        'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg',
        'bg-gradient-to-br from-cyan-400 to-cyan-500 text-white shadow-lg',
        'bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg',
    ],
    // Level 2 - lighter shades
    [
        'bg-purple-100 text-purple-900 border-2 border-purple-300 shadow-md',
        'bg-pink-100 text-pink-900 border-2 border-pink-300 shadow-md',
        'bg-green-100 text-green-900 border-2 border-green-300 shadow-md',
        'bg-amber-100 text-amber-900 border-2 border-amber-300 shadow-md',
        'bg-cyan-100 text-cyan-900 border-2 border-cyan-300 shadow-md',
        'bg-rose-100 text-rose-900 border-2 border-rose-300 shadow-md',
    ],
    // Level 3+ - even lighter
    [
        'bg-purple-50 text-purple-800 border-2 border-purple-200 shadow-sm',
        'bg-pink-50 text-pink-800 border-2 border-pink-200 shadow-sm',
        'bg-green-50 text-green-800 border-2 border-green-200 shadow-sm',
        'bg-amber-50 text-amber-800 border-2 border-amber-200 shadow-sm',
        'bg-cyan-50 text-cyan-800 border-2 border-cyan-200 shadow-sm',
        'bg-rose-50 text-rose-800 border-2 border-rose-200 shadow-sm',
    ],
];

const EDGE_COLORS = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#f43f5e', // rose
];

function MindMapInner({ data, onExportReady }: RadialMindMapProps, ref: any) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getNodes } = useReactFlow();

    const nodeTypes = useMemo(() => ({
        custom: CustomNode,
    }), []);

    useImperativeHandle(ref, () => ({
        exportAsImage: async () => {
            // Wait a bit to ensure everything is rendered
            await new Promise(resolve => setTimeout(resolve, 300));

            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewport) {
                throw new Error('ReactFlow viewport not found');
            }

            const dataUrl = await toPng(viewport, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                cacheBust: true,
            });

            return dataUrl;
        }
    }));

    useEffect(() => {
        if (!data) return;

        // Process data into nodes and edges
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        const weightedData = calculateWeights(data);
        let branchIndex = 0; // Track which main branch we're in for coloring

        // Recursive layout function
        const processNode = (
            node: any,
            x: number,
            y: number,
            startAngle: number,
            endAngle: number,
            level: number,
            parentId: string | null = null,
            parentBranchIndex: number = 0
        ) => {
            const id = node.title + "-" + level + "-" + Math.random().toString(36).substr(2, 9);

            // Determine color based on level and branch
            let colorClass: string;
            if (level === 0) {
                colorClass = LEVEL_COLORS[0] as string;
            } else {
                const levelColors = LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)];
                if (Array.isArray(levelColors)) {
                    colorClass = levelColors[parentBranchIndex % levelColors.length];
                } else {
                    colorClass = levelColors;
                }
            }

            // Determine handle positions based on angle
            const angle = startAngle + (endAngle - startAngle) / 2;
            let sourcePos = Position.Right;
            let targetPos = Position.Left;

            if (level > 0) {
                let normAngle = angle % (2 * Math.PI);
                if (normAngle < 0) normAngle += 2 * Math.PI;

                if (normAngle >= 7 * Math.PI / 4 || normAngle < Math.PI / 4) {
                    sourcePos = Position.Right;
                    targetPos = Position.Left;
                } else if (normAngle >= Math.PI / 4 && normAngle < 3 * Math.PI / 4) {
                    sourcePos = Position.Bottom;
                    targetPos = Position.Top;
                } else if (normAngle >= 3 * Math.PI / 4 && normAngle < 5 * Math.PI / 4) {
                    sourcePos = Position.Left;
                    targetPos = Position.Right;
                } else {
                    sourcePos = Position.Top;
                    targetPos = Position.Bottom;
                }
            }

            newNodes.push({
                id,
                type: 'custom',
                data: {
                    label: node.title,
                    level,
                    className: colorClass,
                    sourcePosition: sourcePos,
                    targetPosition: targetPos
                },
                position: { x, y },
                sourcePosition: sourcePos,
                targetPosition: targetPos,
            });

            if (parentId) {
                const edgeColor = EDGE_COLORS[parentBranchIndex % EDGE_COLORS.length];
                newEdges.push({
                    id: `${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    type: 'smoothstep', // Smooth curved edges
                    style: {
                        stroke: edgeColor,
                        strokeWidth: level === 1 ? 3 : 2,
                        opacity: 0.6
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: edgeColor,
                        width: 20,
                        height: 20,
                    },
                });
            }

            if (node.children && node.children.length > 0) {
                let currentAngle = startAngle;
                const radius = level === 0 ? 300 : 220; // Increased spacing

                node.children.forEach((child: any, idx: number) => {
                    // Allocate angle proportional to weight
                    const childAngleSlice = (child.weight / node.weight) * (endAngle - startAngle);

                    // Child position
                    const childMidAngle = currentAngle + childAngleSlice / 2;

                    // Calculate absolute position
                    const r = (level + 1) * radius;
                    const childX = r * Math.cos(childMidAngle);
                    const childY = r * Math.sin(childMidAngle);

                    // Determine branch index for coloring
                    const childBranchIndex = level === 0 ? idx : parentBranchIndex;

                    processNode(child, childX, childY, currentAngle, currentAngle + childAngleSlice, level + 1, id, childBranchIndex);

                    currentAngle += childAngleSlice;
                });
            }
        };

        // Start layout
        processNode(weightedData, 0, 0, 0, 2 * Math.PI, 0);

        setNodes(newNodes);
        setEdges(newEdges);
    }, [data, setNodes, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
                padding: 0.2,
                minZoom: 0.5,
                maxZoom: 1.5,
            }}
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={4}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
        >
            <Background
                gap={20}
                size={1}
                color="#e5e7eb"
                style={{ backgroundColor: '#fafafa' }}
            />
            <Controls
                showInteractive={false}
            />
        </ReactFlow>
    );
}

const MindMapWithRef = forwardRef(MindMapInner);

export default function RadialMindMap(props: RadialMindMapProps) {
    const exportRef = React.useRef<MindMapExportHandle>(null);

    useEffect(() => {
        if (props.onExportReady && exportRef.current) {
            props.onExportReady(exportRef.current.exportAsImage);
        }
    }, [props.onExportReady, exportRef.current]);

    return (
        <div className="w-full h-full min-h-[500px]">
            <ReactFlowProvider>
                <MindMapWithRef {...props} ref={exportRef} />
            </ReactFlowProvider>
        </div>
    );
}