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

// Modern, Premium Color Palette
const COLORS = [
    { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700', gradient: 'from-indigo-500 to-indigo-700' },
    { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600', gradient: 'from-rose-400 to-rose-600' },
    { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-600', gradient: 'from-sky-400 to-sky-600' },
    { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', gradient: 'from-emerald-400 to-emerald-600' },
    { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', gradient: 'from-amber-400 to-amber-600' },
    { bg: 'bg-violet-500', text: 'text-white', border: 'border-violet-600', gradient: 'from-violet-400 to-violet-600' },
];

const LIGHT_COLORS = [
    { bg: 'bg-white', text: 'text-indigo-950', border: 'border-indigo-200' },
    { bg: 'bg-white', text: 'text-rose-950', border: 'border-rose-200' },
    { bg: 'bg-white', text: 'text-sky-950', border: 'border-sky-200' },
    { bg: 'bg-white', text: 'text-emerald-950', border: 'border-emerald-200' },
    { bg: 'bg-white', text: 'text-amber-950', border: 'border-amber-200' },
    { bg: 'bg-white', text: 'text-violet-950', border: 'border-violet-200' },
];

// Premium Custom Node
const PremiumNode = ({ data, isConnectable }: any) => {
    const isRoot = data.level === 0;
    const isMainBranch = data.level === 1;

    // determine style based on level
    let containerClass = "shadow-lg transition-all hover:scale-105 duration-300";
    let textClass = "";

    if (isRoot) {
        containerClass += ` rounded-xl border-0 !bg-gradient-to-br from-slate-900 to-slate-800 text-white min-w-[160px] py-4 px-6 z-50`;
        textClass += "text-xl font-bold tracking-tight";
    } else if (isMainBranch) {
        const color = COLORS[data.index % COLORS.length];
        containerClass += ` rounded-full border-0 !bg-gradient-to-r ${color.gradient} ${color.text} min-w-[140px] py-3 px-6 z-40`;
        textClass += "text-md font-bold";
    } else {
        // Leaf/Sub nodes
        // Use tint of the parent branch color if possible, or just clean white cards
        const parentIndex = data.rootIndex || 0;
        const color = LIGHT_COLORS[parentIndex % LIGHT_COLORS.length];
        containerClass += ` rounded-lg border-2 ${color.bg} ${color.border} ${color.text} min-w-[100px] py-2 px-4 shadow-sm hover:shadow-md z-30`;
        textClass += "text-sm font-medium";
    }

    return (
        <div className={`flex items-center justify-center relative ${containerClass}`}>
            {/* Target Handle */}
            {data.level > 0 && (
                <Handle
                    type="target"
                    position={data.targetPosition || Position.Left}
                    isConnectable={isConnectable}
                    className="!w-1 !h-1 !bg-transparent !border-0"
                />
            )}

            <div className={`text-center leading-tight ${textClass}`}>
                {data.label}
            </div>

            {/* Source Handle */}
            <Handle
                type="source"
                position={data.sourcePosition || Position.Right}
                isConnectable={isConnectable}
                className="!w-1 !h-1 !bg-transparent !border-0"
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
        custom: PremiumNode,
    }), []);

    useImperativeHandle(ref, () => ({
        exportAsImage: async () => {
            // Wait a bit to ensure everything is rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Select only the viewport to avoid UI controls
            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewport) {
                // Fallback to the main container if viewport is elusive (unlikely)
                return "";
            }

            const dataUrl = await toPng(viewport, {
                backgroundColor: '#ffffff', // Clean white background for PDF/PNG
                pixelRatio: 2, // High res
                cacheBust: true,
                style: {
                    transform: `translate(${viewport.style.transform})`, // Preserve transform
                }
            });

            return dataUrl;
        }
    }));

    useEffect(() => {
        if (!data) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const weightedData = calculateWeights(data);

        // Advanced Radial Layout
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

            // Calculate center angle for this node
            const angle = startAngle + (endAngle - startAngle) / 2;

            // Handle placement
            let sourcePos = Position.Right;
            let targetPos = Position.Left;

            // Determine handle positions for smoother curves
            if (level > 0) {
                // Normalize angle to 0-2PI
                let normAngle = angle % (2 * Math.PI);
                if (normAngle < 0) normAngle += 2 * Math.PI;

                if (normAngle >= 7 * Math.PI / 4 || normAngle < Math.PI / 4) { // Right side
                    sourcePos = Position.Right;
                    targetPos = Position.Left;
                } else if (normAngle >= Math.PI / 4 && normAngle < 3 * Math.PI / 4) { // Bottom
                    sourcePos = Position.Bottom;
                    targetPos = Position.Top;
                } else if (normAngle >= 3 * Math.PI / 4 && normAngle < 5 * Math.PI / 4) { // Left
                    sourcePos = Position.Left;
                    targetPos = Position.Right;
                } else { // Top
                    sourcePos = Position.Top;
                    targetPos = Position.Bottom;
                }
            } else {
                // Root node handles
                // We don't really use handles on root for radial, edges just go out from center
                // But for ReactFlow data model, we assign them.
                sourcePos = Position.Bottom;
            }

            // Push Node
            newNodes.push({
                id,
                type: 'custom',
                data: {
                    label: node.title,
                    level,
                    index: level === 1 ? newNodes.filter(n => n.data.level === 1).length : 0,
                    rootIndex: rootIndex,
                    sourcePosition: sourcePos,
                    targetPosition: targetPos
                },
                position: { x, y },
                sourcePosition: sourcePos,
                targetPosition: targetPos,
                // Add z-index based on level so root is on top
                zIndex: 100 - level
            });

            // Push Edge
            if (parentId) {
                newEdges.push({
                    id: `${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    type: 'default', // Bezier usually looks best for mind maps
                    style: {
                        stroke: level === 1 ? '#cbd5e1' : '#e2e8f0', // Slate-300 / Slate-200
                        strokeWidth: level === 1 ? 3 : 2,
                    },
                    animated: false,
                });
            }

            // Process Children
            if (node.children && node.children.length > 0) {
                let currentAngle = startAngle;

                // Radius increases with level. 
                // Level 1: 300px
                // Level 2: +250px
                // Level 3: +200px
                const radiusIncrement = Math.max(200, 350 - (level * 50));
                const r = level === 0 ? 0 : Math.sqrt(x * x + y * y) + radiusIncrement;
                // For root (level 0), the children are at radius 300
                const actualRadius = level === 0 ? 300 : r;

                node.children.forEach((child: any, idx: number) => {
                    const childWeight = child.weight;
                    const childAngleSlice = (childWeight / node.weight) * (endAngle - startAngle);

                    const childMidAngle = currentAngle + childAngleSlice / 2;

                    const childX = actualRadius * Math.cos(childMidAngle);
                    const childY = actualRadius * Math.sin(childMidAngle);

                    // Pass down root index for coloring sub-branches
                    const nextRootIndex = level === 0 ? idx : rootIndex;

                    processNode(child, childX, childY, currentAngle, currentAngle + childAngleSlice, level + 1, id, nextRootIndex);

                    currentAngle += childAngleSlice;
                });
            }
        };

        // Initialize Layout
        processNode(weightedData, 0, 0, 0, 2 * Math.PI, 0);

        setNodes(newNodes);
        setEdges(newEdges);

        // Fit view after a brief delay to allow rendering
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
            className="bg-slate-50 dark:bg-slate-900"
        >
            <Background gap={20} size={1} color="#94a3b8" className="opacity-20" />
            <Controls showInteractive={false} className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-lg rounded-lg overflow-hidden" />
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
        <div className="w-full h-full min-h-[500px]">
            <ReactFlowProvider>
                <MindMapWithRef {...props} ref={exportRef} />
            </ReactFlowProvider>
        </div>
    );
}