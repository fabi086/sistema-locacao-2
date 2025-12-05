import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { RentalStatus } from '../types';
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

interface PipelineManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    stages: RentalStatus[];
    onSave: (newStages: RentalStatus[]) => void;
}

const SortableStageItem: React.FC<{ stage: RentalStatus }> = ({ stage }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: stage });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-neutral-card p-3 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                 <button {...attributes} {...listeners} className="cursor-grab p-1 text-neutral-text-secondary/60 hover:bg-gray-100 rounded-md">
                    <GripVertical size={18} />
                 </button>
                 <span className="text-sm font-medium text-neutral-text-primary">{stage}</span>
            </div>
        </div>
    );
};

const PipelineManagerModal: React.FC<PipelineManagerModalProps> = ({ isOpen, onClose, stages, onSave }) => {
    const [localStages, setLocalStages] = useState<RentalStatus[]>(stages);
    
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
                const oldIndex = items.indexOf(active.id as RentalStatus);
                const newIndex = items.indexOf(over.id as RentalStatus);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
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
                        <SortableContext items={localStages} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {localStages.map(stage => (
                                    <SortableStageItem key={stage} stage={stage} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4 border-t">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar Ordem
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default PipelineManagerModal;
