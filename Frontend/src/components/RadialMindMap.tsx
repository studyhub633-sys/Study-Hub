import { useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
    Node,
    Position,
    ReactFlowProvider,
    useEdgesState,
    useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapNode {
    title: string;
    children: MindMapNode[];
}

interface RadialMindMapProps {
    data: MindMapNode;
}

// Custom Node Component for a cleaner look
const CustomNode = ({ data, isConnectable }: any) => {
    return (
        <div className={`px-4 py-2 rounded-full shadow-md border-2 min-w-[100px] text-center font-medium transition-all hover:scale-105 ${data.className}`}>
            {/* Target Handle (Input) */}
            {data.level > 0 && (
                <Handle
                    type="target"
                    position={data.targetPosition || Position.Left}
                    isConnectable={isConnectable}
                    className="w-2 h-2 !bg-gray-400"
                />
            )}

            <div className="text-sm">{data.label}</div>

            {/* Source Handle (Output) */}
            <Handle
                type="source"
                position={data.sourcePosition || Position.Right}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-gray-400"
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

// Colors for different branches/levels
const COLORS = [
    'bg-white border-purple-500 text-purple-900',
    'bg-purple-50 border-purple-400 text-purple-800',
    'bg-pink-50 border-pink-400 text-pink-800',
    'bg-blue-50 border-blue-400 text-blue-800',
    'bg-green-50 border-green-400 text-green-800',
    'bg-amber-50 border-amber-400 text-amber-800',
];

function MindMapInner({ data }: RadialMindMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(() => ({
        custom: CustomNode,
    }), []);

    useEffect(() => {
        if (!data) return;

        // Process data into nodes and edges
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        const weightedData = calculateWeights(data);

        // Recursive layout function
        const processNode = (
            node: any,
            x: number,
            y: number,
            startAngle: number,
            endAngle: number,
            level: number,
            parentId: string | null = null
        ) => {
            const id = node.title + "-" + level + "-" + Math.random().toString(36).substr(2, 9);

            // Determine positions
            // Root is usually distinct styling
            const colorClass = level === 0
                ? 'bg-purple-600 border-purple-700 text-white'
                : COLORS[Math.min(level, COLORS.length - 1)];

            // Determine handle positions based on angle (relative to center)
            // Angle is in radians. 0 is Right, PI/2 is Down.
            const angle = startAngle + (endAngle - startAngle) / 2;
            let sourcePos = Position.Right;
            let targetPos = Position.Left;

            // Adjust handles based on quadrant if not root
            if (level > 0) {
                // Normalize angle to 0-2PI
                let normAngle = angle % (2 * Math.PI);
                if (normAngle < 0) normAngle += 2 * Math.PI;

                if (normAngle >= 7 * Math.PI / 4 || normAngle < Math.PI / 4) { // Right
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
                newEdges.push({
                    id: `${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    type: 'default', // 'smoothstep', 'step', 'straight', 'default' (bezier)
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    //   markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }, 
                });
            }

            if (node.children && node.children.length > 0) {
                let currentAngle = startAngle;
                const radius = 250; // Distance between levels

                node.children.forEach((child: any) => {
                    // Allocate angle proportional to weight
                    const childAngleSlice = (child.weight / node.weight) * (endAngle - startAngle);

                    // Child position
                    const childMidAngle = currentAngle + childAngleSlice / 2;
                    // Calculate relative position based on parent angle? 
                    // Ideally we want radial from center (0,0) or spread out.
                    // True radial: Calculate (x,y) from (0,0) based on depth * radius.

                    // Issue: If we just use depth * radius, children of one branch might overlap with another.
                    // But since we are partitioning the angle space from the root, they shouldn't overlap if we stick to the sector.

                    // Calculate absolute absolute position
                    const r = (level + 1) * radius;
                    const childX = r * Math.cos(childMidAngle);
                    const childY = r * Math.sin(childMidAngle);

                    processNode(child, childX, childY, currentAngle, currentAngle + childAngleSlice, level + 1, id);

                    currentAngle += childAngleSlice;
                });
            }
        };

        // Start layout
        // Root at (0,0)
        // Full 360 degrees (0 to 2PI)
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
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={4}
        >
            <Background gap={16} size={1} />
            <Controls />
        </ReactFlow>
    );
}

export default function RadialMindMap(props: RadialMindMapProps) {
    return (
        <div className="w-full h-full min-h-[500px]">
            <ReactFlowProvider>
                <MindMapInner {...props} />
            </ReactFlowProvider>
        </div>
    );
}

