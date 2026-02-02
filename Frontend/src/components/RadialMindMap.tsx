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

// Enhanced Bubble Map Colors with better hierarchy and visual appeal
const BUBBLE_COLORS = [
    { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', shadow: 'shadow-blue-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', shadow: 'shadow-emerald-100' },
    { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', shadow: 'shadow-amber-100' },
    { bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-800', shadow: 'shadow-rose-100' },
    { bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-800', shadow: 'shadow-violet-100' },
    { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-800', shadow: 'shadow-cyan-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-800', shadow: 'shadow-indigo-100' },
    { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-800', shadow: 'shadow-pink-100' },
];

// Bubble Node Component with improved styling
const BubbleNode = ({ data, isConnectable }: any) => {
    const isRoot = data.level === 0;

    // Base styles for the bubble with better visual hierarchy
    let containerClass = "flex items-center justify-center text-center rounded-full shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-110 hover:z-50 aspect-square relative overflow-hidden";
    let textClass = "";

    // Dynamic sizing based on level - improved spacing
    // Root: Extra Large (central focus)
    // Level 1: Large (primary concepts)
    // Level 2: Medium (sub-concepts)
    // Level 3+: Small (details)
    const sizeStyle = isRoot
        ? "w-44 h-44"
        : data.level === 1
            ? "w-36 h-36"
            : data.level === 2
                ? "w-28 h-28"
                : "w-24 h-24";

    if (isRoot) {
        // Root node - Deep, primary color for central focus
        containerClass += ` ${sizeStyle} bg-gradient-to-br from-blue-600 to-blue-700 border-blue-800 text-white z-50 shadow-blue-200`;
        textClass += "text-base font-bold px-3 leading-tight";
    } else {
        // Child Bubbles with better visual distinction
        const color = BUBBLE_COLORS[data.rootIndex % BUBBLE_COLORS.length];

        // Level 1 vs deeper levels distinction with better contrast
        if (data.level === 1) {
            containerClass += ` ${sizeStyle} ${color.bg} ${color.border} ${color.text} z-40 ${color.shadow} border-[2.5px]`;
            textClass += "text-sm font-semibold px-3 leading-snug";
        } else if (data.level === 2) {
            containerClass += ` ${sizeStyle} ${color.bg} ${color.border} ${color.text} z-30 ${color.shadow} border-2`;
            textClass += "text-xs font-semibold px-2 leading-snug";
        } else {
            containerClass += ` ${sizeStyle} ${color.bg} ${color.border} ${color.text} z-20 ${color.shadow} border-2`;
            textClass += "text-xs font-medium px-2 leading-tight";
        }
    }

    return (
        <div className={`${containerClass}`}>
            {/* Target Handle */}
            {data.level > 0 && (
                <Handle
                    type="target"
                    position={data.targetPosition || Position.Top}
                    isConnectable={isConnectable}
                    className="!w-1 !h-1 !bg-transparent !border-0 opacity-0"
                />
            )}

            <div className="flex flex-col items-center justify-center h-full px-1">
                <span className={`break-words ${textClass} pointer-events-none line-clamp-4 w-full`}>
                    {data.label}
                </span>
            </div>

            {/* Source Handle */}
            <Handle
                type="source"
                position={data.sourcePosition || Position.Top}
                isConnectable={isConnectable}
                className="!w-1 !h-1 !bg-transparent !border-0 opacity-0"
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

            newNodes.push({
                id,
                type: 'custom',
                data: {
                    label: node.title,
                    level,
                    rootIndex: rootIndex,
                    // We simply pass these for consistency, though we might rely on Center handles in CSS
                    sourcePosition: sourcePos,
                    targetPosition: targetPos
                },
                position: { x, y: y },
                // Centering the node on the coordinate
                // Bubble sizes are roughly: Root=160px(40rem?), L1=128px, L2=96px
                // ReactFlow positions are top-left. We need to offset by half width/height to center.
                // We'll leave that to the CSS centering or adjust here.
                // It's cleaner to let the node be top-left anchored and just position it correct relative to that.
                // But for radial math, (x,y) is center.
                // Let's apply a hook to center:
                style: {
                    transform: 'translate(-50%, -50%)',
                },
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
                        stroke: '#94a3b8', // Slate-400 for better visibility
                        strokeWidth: 2.5,
                        opacity: 0.7,
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