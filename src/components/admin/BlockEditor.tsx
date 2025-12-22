import React, { useState, useEffect } from 'react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Plus, Type, Heading1, Quote as QuoteIcon, ImageIcon, 
    MoreHorizontal, X, GripVertical, Trash2
} from 'lucide-react';

// --- Types ---

type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'divider';

interface Block {
    id: string;
    type: BlockType;
    content: string; 
}

interface BlockEditorProps {
    initialContent: string;
    onChange: (html: string) => void;
}

// --- Sortable Block Component ---

function SortableBlock({ 
    block, 
    onUpdate, 
    onRemove 
}: { 
    block: Block, 
    onUpdate: (id: string, content: string) => void,
    onRemove: (id: string) => void 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative flex gap-2 items-start mb-6 w-full">
            {/* Drag Handle */}
            <div 
                {...attributes} 
                {...listeners} 
                className="mt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition"
            >
                <GripVertical size={20} />
            </div>

            {/* Content Renderers */}
            <div className="flex-1 w-full bg-white relative rounded group-hover:ring-1 group-hover:ring-gray-100 transition ring-offset-2">
                
                {/* Delete Button (Visible on Hover) */}
                <button 
                    type="button"
                    onClick={() => onRemove(block.id)}
                    className="absolute -right-10 top-2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 size={18} />
                </button>

                {block.type === 'paragraph' && (
                    <textarea
                        value={block.content}
                        onChange={(e) => onUpdate(block.id, e.target.value)}
                        className="w-full bg-transparent p-2 focus:outline-none rounded resize-none text-lg leading-relaxed font-serif"
                        placeholder="Write your story..."
                        rows={Math.max(2, block.content.split('\n').length)}
                    />
                )}

                {block.type === 'heading' && (
                    <input
                        value={block.content}
                        onChange={(e) => onUpdate(block.id, e.target.value)}
                        className="w-full bg-transparent p-2 focus:outline-none font-serif text-3xl font-bold placeholder-gray-300"
                        placeholder="Heading"
                    />
                )}

                {block.type === 'quote' && (
                    <div className="flex gap-4 p-4 border-l-4 border-[var(--accent)] bg-gray-50 italic text-xl font-serif">
                        <QuoteIcon className="text-gray-300 flex-shrink-0" size={24} />
                        <textarea
                            value={block.content}
                            onChange={(e) => onUpdate(block.id, e.target.value)}
                            className="w-full bg-transparent focus:outline-none resize-none placeholder-gray-400"
                            placeholder="Quote..."
                            rows={Math.max(2, block.content.split('\n').length)}
                        />
                    </div>
                )}

                {block.type === 'divider' && (
                    <div className="py-8 flex items-center justify-center cursor-default">
                        <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                    </div>
                )}

                {block.type === 'image' && (
                    <div className="relative">
                         {block.content ? (
                            <div className="relative group/img">
                                <img src={block.content} alt="Block" className="w-full rounded-sm shadow-sm" />
                                <button 
                                    type="button"
                                    onClick={() => onUpdate(block.id, '')}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow text-gray-500 hover:text-red-500 md:opacity-0 md:group-hover/img:opacity-100 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <ImageUploader onUpload={(url) => onUpdate(block.id, url)} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Main Editor Component ---

export default function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null); // For DragOverlay if needed
    const [isInitialized, setIsInitialized] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initial Parse
    useEffect(() => {
        if (isInitialized) return;
        
        let newBlocks: Block[] = [];
        
        if (!initialContent) {
            newBlocks = [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }];
        } else {
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = initialContent;
             
             Array.from(tempDiv.children).forEach((node) => {
                const id = crypto.randomUUID();
                if (node.tagName === 'P') newBlocks.push({ id, type: 'paragraph', content: node.innerHTML });
                else if (['H1','H2','H3'].includes(node.tagName)) newBlocks.push({ id, type: 'heading', content: node.innerHTML });
                else if (node.tagName === 'BLOCKQUOTE') newBlocks.push({ id, type: 'quote', content: node.innerHTML });
                else if (node.tagName === 'IMG') newBlocks.push({ id, type: 'image', content: (node as HTMLImageElement).src });
                else if (node.tagName === 'HR') newBlocks.push({ id, type: 'divider', content: '' });
                else newBlocks.push({ id, type: 'paragraph', content: node.outerHTML });
             });
             
             if (newBlocks.length === 0 && initialContent) {
                  newBlocks.push({ id: crypto.randomUUID(), type: 'paragraph', content: initialContent });
             }
        }
        
        setBlocks(newBlocks);
        setIsInitialized(true);
    }, [initialContent, isInitialized]);

    // Serialize on Change
    useEffect(() => {
        if (!isInitialized) return;
        const html = blocks.map(block => {
            switch(block.type) {
                case 'paragraph': return `<p>${block.content}</p>`;
                case 'heading': return `<h2>${block.content}</h2>`;
                case 'quote': return `<blockquote>${block.content}</blockquote>`;
                case 'image': return `<img src="${block.content}" alt="Blog Image" class="w-full h-auto my-8 rounded-sm" />`;
                case 'divider': return `<hr class="my-12 border-gray-200" />`;
                default: return '';
            }
        }).join('');
        onChange(html);
    }, [blocks, isInitialized, onChange]);

    // Dnd Handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        
        if (active.id !== over?.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const addBlock = (type: BlockType) => {
        setBlocks(prev => [...prev, { id: crypto.randomUUID(), type, content: '' }]);
    };

    const updateBlock = (id: string, content: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 relative">
            {/* Sidebar Tools */}
            <div className="w-full md:w-48 flex-shrink-0">
                <div className="sticky top-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Herramientas</p>
                    <div className="flex flex-col gap-2">
                        <ToolButton icon={<Type size={18} />} label="Texto" onClick={() => addBlock('paragraph')} />
                        <ToolButton icon={<Heading1 size={18} />} label="Título" onClick={() => addBlock('heading')} />
                        <ToolButton icon={<ImageIcon size={18} />} label="Imagen" onClick={() => addBlock('image')} />
                        <ToolButton icon={<QuoteIcon size={18} />} label="Cita" onClick={() => addBlock('quote')} />
                        <ToolButton icon={<MoreHorizontal size={18} />} label="Divisor" onClick={() => addBlock('divider')} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-8 leading-tight">
                        Haz clic para añadir. Arrastra los bloques en el editor para reordenar.
                    </p>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 min-h-[500px] bg-white rounded-lg">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={blocks.map(b => b.id)} 
                        strategy={verticalListSortingStrategy}
                    >
                        {blocks.map((block) => (
                            <SortableBlock 
                                key={block.id} 
                                block={block} 
                                onUpdate={updateBlock}
                                onRemove={removeBlock}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {blocks.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                        <Plus size={48} className="mb-4 opacity-50" />
                        <p>Añade tu primer bloque</p>
                     </div>
                )}
            </div>
        </div>
    );
}

function ToolButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 p-3 w-full text-left bg-white border border-gray-200 rounded hover:border-black transition hover:shadow-sm text-sm font-medium text-gray-600 hover:text-black group"
        >
            <span className="text-gray-400 group-hover:text-black transition">{icon}</span>
            {label}
        </button>
    )
}

function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
    const [status, setStatus] = useState("Click para subir");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        try {
            setStatus("Optimizando...");
            const file = e.target.files[0];
            const imageCompression = (await import("browser-image-compression")).default;
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" });
            
            setStatus("Subiendo...");
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            
            const { error } = await supabase.storage.from('uploads').upload(filename, compressedFile, { contentType: 'image/webp' });
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filename);
            onUpload(publicUrl);
        } catch (err) {
            console.error(err);
            setStatus("Error");
            setTimeout(() => setStatus("Click para subir"), 2000);
        }
    };

    return (
        <div className="border border-dashed border-gray-300 p-8 rounded bg-gray-50 flex items-center justify-center text-center cursor-pointer relative hover:bg-gray-100 transition group">
            <input type="file" onChange={handleUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-gray-400 flex flex-col items-center gap-2 group-hover:text-black transition">
                <ImageIcon size={32} />
                <span className="text-sm font-medium">{status}</span>
            </div>
        </div>
    );
}
