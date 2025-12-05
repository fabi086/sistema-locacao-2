import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { EquipmentCategory, Equipment } from '../types';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: EquipmentCategory[];
    onSave: (category: Omit<EquipmentCategory, 'id' | 'tenant_id'> | EquipmentCategory) => void;
    onDelete: (category: EquipmentCategory) => void;
    allEquipment: Equipment[];
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, onSave, onDelete, allEquipment }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddCategory = async () => {
        if (newCategoryName.trim() === '') return;
        setLoading(true);
        await onSave({ name: newCategoryName.trim() });
        setNewCategoryName('');
        setLoading(false);
    };

    const handleUpdateCategory = async () => {
        if (editingCategory && editingCategory.name.trim() !== '') {
            setLoading(true);
            await onSave({ id: editingCategory.id, name: editingCategory.name.trim() });
            setEditingCategory(null);
            setLoading(false);
        }
    };
    
    const handleDeleteCategory = (category: EquipmentCategory) => {
        const isCategoryInUse = allEquipment.some(eq => eq.category === category.name);
        if (isCategoryInUse) {
            alert(`A categoria "${category.name}" está em uso e não pode ser excluída.`);
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            onDelete(category);
        }
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
                    <h2 className="text-xl font-bold text-neutral-text-primary">Gerenciar Categorias de Equipamentos</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal"><X size={20} /></button>
                </header>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-3">
                    {categories.map(category => (
                        <div key={category.id} className="bg-neutral-card p-3 rounded-lg flex items-center justify-between">
                            {editingCategory?.id === category.id ? (
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="flex-grow bg-white border border-primary rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <span className="text-sm font-medium text-neutral-text-primary">{category.name}</span>
                            )}
                            <div className="flex items-center gap-2 ml-4">
                                {editingCategory?.id === category.id ? (
                                    <>
                                        <button onClick={handleUpdateCategory} className="p-2 text-green-600 hover:bg-green-100 rounded-full" disabled={loading}>
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        </button>
                                        <button onClick={() => setEditingCategory(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={16} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEditingCategory({ id: category.id, name: category.name })} className="p-2 text-neutral-text-secondary hover:bg-gray-100 rounded-full"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteCategory(category)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-neutral-text-secondary text-sm">Nenhuma categoria cadastrada.</p>}
                </div>

                <div className="p-6 bg-neutral-card-alt border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nome da nova categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        />
                        <button onClick={handleAddCategory} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center w-32" disabled={loading}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} className="mr-2"/> Adicionar</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CategoryManagerModal;
