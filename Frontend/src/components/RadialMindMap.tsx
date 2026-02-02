import { toPng } from 'html-to-image';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
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

export interface MindMapExportHandle {
    exportAsImage: () => Promise<string>;
}

// Vibrant Bubble Map Colors - Bold and Readable like Miro
const BUBBLE_COLORS = [
    { bg: '#3B82F6', text: '#FFFFFF' }, // Bright Blue
    { bg: '#10B981', text: '#FFFFFF' }, // Vibrant Emerald
    { bg: '#F59E0B', text: '#FFFFFF' }, // Bright Amber
    { bg: '#EF4444', text: '#FFFFFF' }, // Vibrant Red
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Bright Purple
    { bg: '#06B6D4', text: '#FFFFFF' }, // Bright Cyan
    { bg: '#EC4899', text: '#FFFFFF' }, // Hot Pink
    { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
    { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
    { bg: '#F97316', text: '#FFFFFF' }, // Orange
];

// Bubble Node Component with vibrant colors and excellent readability
const BubbleNode = ({ data, isConnectable }: any) => {
    const isRoot = data.level === 0;

    // Use vibrant colors and better sizing
    let backgroundColor = '#3B82F6';
    let textColor = '#FFFFFF';
    let fontSize = '13px';
    let fontWeight = '600';
    let width = '100px';
    let height = '100px';
    let boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
    let borderWidth = 0;

    if (isRoot) {
        width = '180px';
        height = '180px';
        backgroundColor = '#1E40AF'; // Deep Blue for root
        fontSize = '18px';
        fontWeight = '700';
        boxShadow = '0 10px 25px rgba(30, 64, 175, 0.4)';
    } else {
        const colorIndex = data.rootIndex % BUBBLE_COLORS.length;
        const color = BUBBLE_COLORS[colorIndex];
        
        backgroundColor = color.bg;
        textColor = color.text;

        if (data.level === 1) {
            width = '140px';
            height = '140px';
            fontSize = '14px';
            fontWeight = '700';
            boxShadow = `0 6px 16px ${backgroundColor}40`;
        } else if (data.level === 2) {
            width = '110px';
            height = '110px';
            fontSize = '12px';
            fontWeight = '600';
            boxShadow = `0 4px 10px ${backgroundColor}30`;
        } else {
            width = '90px';
            height = '90px';
            fontSize = '11px';
            fontWeight = '600';
            boxShadow = `0 3px 8px ${backgroundColor}25`;
        }
    }

    const nodeStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: '50%',
        border: borderWidth > 0 ? `${borderWidth}px solid ${textColor}` : 'none',
        backgroundColor: backgroundColor,
        color: textColor,
        width: width,
        height: height,
        fontSize: fontSize,
        fontWeight: fontWeight,
        padding: '12px',
        boxShadow: boxShadow,
        cursor: 'pointer',
        transition: 'all 200ms ease',
        overflow: 'hidden',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
        lineHeight: '1.3',
    };

    return (
        <div style={nodeStyle}>
            {data.level > 0 && (
                <Handle
                    type="target"
                    position={data.targetPosition || Position.Top}
                    isConnectable={isConnectable}
                    style={{ width: '4px', height: '4px', backgroundColor: 'transparent', border: 'none', opacity: 0 }}
                />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                <span style={{ pointerEvents: 'none', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontWeight: 'inherit', fontSize: 'inherit' }}>
                    {data.label}
                </span>
            </div>

            <Handle
                type="source"
                position={data.sourcePosition || Position.Top}
                isConnectable={isConnectable}
                style={{ width: '4px', height: '4px', backgroundColor: 'transparent', border: 'none', opacity: 0 }}
            />
        </div>
    );
};

// Calculate weights for layout distribution
const calculateWeights = (node: MindMapNode): any => {
    if (!node.children || node.children.length === 0) {
        return { ...node, weight: 1 };
    }
    const childrenWithWeights = node.children.map(calculateWeights);
    const totalWeight = childrenWithWeights.reduce((acc: number, child: any) => acc + child.weight, 0);
    return { ...node, children: childrenWithWeights, weight: totalWeight };
};

function MindMapInner({ data, onExportReady }: RadialMindMapProps, ref: any) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    const nodeTypes = useMemo(() => ({
        custom: BubbleNode,
    }), []);

    useImperativeHandle(ref, () => ({
        exportAsImage: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewport) return "";

            const dataUrl = await toPng(viewport, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                cacheBust: true,
                style: { transform: `translate(${viewport.style.transform})` }
            });
            return dataUrl;
        }
    }));

    useEffect(() => {
        if (!data) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const weightedData = calculateWeights(data);

        // Bubble Layout Logic
        const processNode = (
            node: any,
            x: number,
            y: number,
            startAngle: number,
            endAngle: number,
            level: number,
            parentId: string | null = null,
            rootIndex: number = 0
        ) => {
            const id = `node-${level}-${node.title}-${Math.random().toString(36).substr(2, 5)}`;

            // Calculate center angle
            const angle = startAngle + (endAngle - startAngle) / 2;

            // For straight lines in a radial map, handles are best at the center usually,
            // or we use specific perimeter points. 
            // In ReactFlow for 'straight' edges to look right with circles, Center to Center often works best
            // if we want the line to stop at the edge. 
            // However, ReactFlow's default handles are strictly directional (Top/Bottom/Left/Right).
            // For a bubble map, dynamic handles or Center handles are best.
            // We set Position.Center conceptually, but physically we need to pick a side 
            // based on the angle to avoid the line going THROUGH the bubble.

            // Actually, for pure straight lines radiating out, Center handles + proper z-indexing 
            // (line behind node) is the easiest trick.
            // Let's try Center-like positioning logic.

            let sourcePos = Position.Right;
            let targetPos = Position.Left;

            // Normalize angle
            let normAngle = angle % (2 * Math.PI);
            if (normAngle < 0) normAngle += 2 * Math.PI;

            // Basic Quadrant logic for handles if we weren't using center-center
            if (normAngle >= 7 * Math.PI / 4 || normAngle < Math.PI / 4) { // Right
                sourcePos = Position.Right; targetPos = Position.Left;
            } else if (normAngle >= Math.PI / 4 && normAngle < 3 * Math.PI / 4) { // Bottom
                sourcePos = Position.Bottom; targetPos = Position.Top;
            } else if (normAngle >= 3 * Math.PI / 4 && normAngle < 5 * Math.PI / 4) { // Left
                sourcePos = Position.Left; targetPos = Position.Right;
            } else { // Top
                sourcePos = Position.Top; targetPos = Position.Bottom;
            }

            // Calculate node size for proper centering
            let nodeSize = 96; // Default for level 3+
            if (level === 0) nodeSize = 176;
            else if (level === 1) nodeSize = 144;
            else if (level === 2) nodeSize = 112;
            
            const halfSize = nodeSize / 2;

            newNodes.push({
                id,
                type: 'custom',
                data: {
                    label: node.title,
                    level,
                    rootIndex: rootIndex,
                    sourcePosition: sourcePos,
                    targetPosition: targetPos
                },
                position: { x: x - halfSize, y: y - halfSize },
                sourcePosition: sourcePos,
                targetPosition: targetPos,
                zIndex: 100 - level
            });

            if (parentId) {
                newEdges.push({
                    id: `${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    type: 'straight',
                    style: {
                        stroke: '#CBD5E1', // Light slate for clean look
                        strokeWidth: 2,
                        opacity: 0.5,
                    },
                    animated: false,
                });
            }

            if (node.children && node.children.length > 0) {
                let currentAngle = startAngle;

                // Improved radius calculation for better spacing
                // Root (176px/88 half) -> L1 (144px/72 half). Gap should be at least 150px.
                // Base spacing starts larger and increases per level for better visual hierarchy

                const baseRadius = 400;  // Increased from 350 for more breathing room
                const levelRadiusStep = 340; // Increased from 300 for better separation
                const actualRadius = level === 0 ? baseRadius : baseRadius + (level * levelRadiusStep);

                // More intelligent angle distribution to prevent overlap
                const totalChildren = node.children.length;
                const minAngle = 0.6; // Minimum angle between nodes (radians) to prevent overlap

                node.children.forEach((child: any, idx: number) => {
                    const childWeight = child.weight;
                    const childAngleSlice = Math.max(minAngle, (childWeight / node.weight) * (endAngle - startAngle));

                    const childMidAngle = currentAngle + childAngleSlice / 2;

                    const childX = actualRadius * Math.cos(childMidAngle);
                    const childY = actualRadius * Math.sin(childMidAngle);

                    const nextRootIndex = level === 0 ? idx : rootIndex;

                    processNode(child, childX, childY, currentAngle, currentAngle + childAngleSlice, level + 1, id, nextRootIndex);

                    currentAngle += childAngleSlice;
                });
            }
        };

        // Root at (0,0)
        processNode(weightedData, 0, 0, 0, 2 * Math.PI, 0);

        setNodes(newNodes);
        setEdges(newEdges);

        setTimeout(() => {
            fitView({ padding: 0.2 });
        }, 100);

    }, [data, setNodes, setEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={4}
            className="bg-gradient-to-br from-slate-50 via-white to-slate-50"
        >
            <Background gap={16} size={1} color="#cbd5e1" className="opacity-30" />
            <Controls showInteractive={false} className="!bg-white !shadow-md rounded-lg border border-slate-300 text-slate-600 hover:!bg-slate-50" />
        </ReactFlow>
    );
}

const MindMapWithRef = forwardRef(MindMapInner);

export default function RadialMindMap(props: RadialMindMapProps) {
    const exportRef = useRef<MindMapExportHandle>(null);

    useEffect(() => {
        if (props.onExportReady && exportRef.current) {
            props.onExportReady(exportRef.current.exportAsImage);
        }
    }, [props.onExportReady]);

    return (
        <div className="w-full h-full min-h-[500px] bg-white">
            <ReactFlowProvider>
                <MindMapWithRef {...props} ref={exportRef} />
            </ReactFlowProvider>
        </div>
    );
}