import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Palette, Edit2, Trash2, Check, Plus } from 'lucide-react';
import { PipelineStage, RentalOrder } from '../types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStageItemProps {
    stage: PipelineStage;
    isEditing: boolean;
    onEditStart: (stage: PipelineStage) => void;
    onDelete: (stage: PipelineStage) => void;
    onUpdate: (stage: PipelineStage) => void;
    onCancelEdit: () => void;
}

const SortableStageItem: React.FC<SortableStageItemProps> = ({ stage, isEditing, onEditStart, onDelete, onUpdate, onCancelEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: stage.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [editedStage, setEditedStage] = useState(stage);

    useEffect(() => {
        setEditedStage(stage);
    }, [stage, isEditing]);

    const handleSave = () => {
        onUpdate(editedStage);
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-neutral-card p-3 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 flex-grow">
                <button {...attributes} {...listeners} className="cursor-grab p-1 text-neutral-text-secondary/60 hover:bg-gray-100 rounded-md active:cursor-grabbing">
                    <GripVertical size={18} />
                </button>
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: isEditing ? editedStage.color : stage.color }} />
                {isEditing ? (
                    <input
                        type="text"
                        value={editedStage.name}
                        disabled={stage.isCore}
                        onChange={(e) => setEditedStage(s => ({ ...s, name: e.target.value }))}
                        className="flex-grow bg-white border border-primary rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                ) : (
                    <span className="text-sm font-medium text-neutral-text-primary">{stage.name}</span>
                )}
            </div>
            <div className="flex items-center gap-2 ml-4">
                {isEditing ? (
                    <>
                        <div className="relative w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md border">
                            <Palette size={18} className="absolute pointer-events-none text-gray-500" />
                            <input 
                                type="color" 
                                value={editedStage.color} 
                                onChange={(e) => setEditedStage(s => ({ ...s, color: e.target.value }))} 
                                className="w-full h-full opacity-0 cursor-pointer"
                                title="Selecionar cor"
                            />
                        </div>
                        <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Salvar"><Check size={16} /></button>
                        <button onClick={onCancelEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Cancelar"><X size={16} /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onEditStart(stage)} className="p-2 text-neutral-text-secondary hover:bg-gray-100 rounded-full" title="Editar"><Edit2 size={16} /></button>
                        {!stage.isCore && <button onClick={() => onDelete(stage)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Excluir"><Trash2 size={16} /></button>}
                    </>
                )}
            </div>
        </div>
    );
};

interface PipelineManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    stages: PipelineStage[];
    onSave: (newStages: PipelineStage[]) => void;
    rentalOrders: RentalOrder[];
}

const PipelineManagerModal: React.FC<PipelineManagerModalProps> = ({ isOpen, onClose, stages, onSave, rentalOrders }) => {
    const [localStages, setLocalStages] = useState<PipelineStage[]>(stages);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('#CCCCCC');
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 5,
          },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setLocalStages((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddStage = () => {
        if (newStageName.trim() === '') return;
        const newStage: PipelineStage = {
            id: `custom-${Date.now()}`,
            name: newStageName.trim(),
            color: newStageColor,
            isCore: false,
        };
        setLocalStages(prev => [...prev, newStage]);
        setNewStageName('');
        setNewStageColor('#CCCCCC');
    };

    const handleDeleteStage = (stageToDelete: PipelineStage) => {
        if (stageToDelete.isCore) return;
        
        const isStageInUse = rentalOrders.some(order => order.status === stageToDelete.name);
        if (isStageInUse) {
            alert(`A etapa "${stageToDelete.name}" está em uso por um ou mais pedidos e não pode ser excluída.`);
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir a etapa "${stageToDelete.name}"?`)) {
            setLocalStages(prev => prev.filter(s => s.id !== stageToDelete.id));
        }
    };

    const handleUpdateStage = (updatedStage: PipelineStage) => {
        setLocalStages(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s));
        setEditingStageId(null);
    };
    
    const handleSave = () => {
        onSave(localStages);
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 } };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose })}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() })}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Gerenciar Etapas do Funil</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal"><X size={20} /></button>
                </header>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-sm text-neutral-text-secondary mb-4">Arraste e solte as etapas para reordenar as colunas na visualização do pipeline de locação.</p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={localStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {localStages.map(stage => (
                                    <SortableStageItem 
                                        key={stage.id} 
                                        stage={stage} 
                                        isEditing={editingStageId === stage.id}
                                        onEditStart={() => setEditingStageId(stage.id)}
                                        onCancelEdit={() => setEditingStageId(null)}
                                        onDelete={handleDeleteStage}
                                        onUpdate={handleUpdateStage}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                
                 <div className="p-6 bg-neutral-card-alt border-t">
                    <h3 className="text-sm font-semibold text-neutral-text-primary mb-2">Adicionar Nova Etapa</h3>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Nome da nova etapa"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        />
                         <div className="relative w-10 h-10 flex-shrink-0">
                            <input 
                                type="color" 
                                value={newStageColor} 
                                onChange={(e) => setNewStageColor(e.target.value)} 
                                className="w-full h-full p-0 border-none rounded-md cursor-pointer"
                                style={{ backgroundColor: newStageColor, appearance: 'none', WebkitAppearance: 'none' }}
                                title="Selecionar cor para nova etapa"
                            />
                        </div>
                        <button onClick={handleAddStage} className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors" title="Adicionar etapa">
                            <Plus size={20}/>
                        </button>
                    </div>
                </div>

                <footer className="p-6 bg-neutral-card flex justify-end items-center gap-4 border-t">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card-alt rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar Alterações
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default PipelineManagerModal;