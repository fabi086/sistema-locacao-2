import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, HardHat, List, Tag, MapPin } from 'lucide-react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';

interface AddEquipmentModalProps {
    onClose: () => void;
    onSave: (equipmentData: Omit<Equipment, 'id'> | Equipment) => void;
    equipmentToEdit?: Equipment | null;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ onClose, onSave, equipmentToEdit }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<EquipmentCategory | ''>('');
    const [serialNumber, setSerialNumber] = useState('');
    const [location, setLocation] = useState('');

    const isEditing = !!equipmentToEdit;

    useEffect(() => {
        if (isEditing) {
            setName(equipmentToEdit.name);
            setCategory(equipmentToEdit.category);
            setSerialNumber(equipmentToEdit.serialNumber);
            setLocation(equipmentToEdit.location);
        }
    }, [equipmentToEdit, isEditing]);

    const handleSubmit = () => {
        if (!name || !category || !serialNumber || !location) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        const commonData = { name, category, serialNumber, location };
        
        const equipmentData = isEditing 
            ? { ...equipmentToEdit, ...commonData } 
            : { ...commonData, status: 'Disponível' as EquipmentStatus }; // Status default para novos

        onSave(equipmentData);
    };

    const backdropVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: any = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
    const categories: EquipmentCategory[] = ['Escavadeiras', 'Betoneiras', 'Guindastes', 'Andaimes'];

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            {...({
                variants: backdropVariants,
                initial: "hidden",
                animate: "visible",
                exit: "exit",
                onClick: onClose,
                "aria-modal": "true",
                role: "dialog"
            } as any)}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                {...({
                    variants: modalVariants,
                    onClick: (e: any) => e.stopPropagation()
                } as any)}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Equipamento' : 'Adicionar Novo Equipamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-text-primary mb-2">Nome do Equipamento</label>
                        <div className="relative">
                            <HardHat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <input type="text" id="name" placeholder="Ex: Escavadeira CAT 320D" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="category" className="block text-sm font-semibold text-neutral-text-primary mb-2">Categoria</label>
                             <div className="relative">
                                <List size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select id="category" value={category} onChange={e => setCategory(e.target.value as EquipmentCategory)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                    <option value="">Selecione...</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                           <label htmlFor="serial" className="block text-sm font-semibold text-neutral-text-primary mb-2">N° de Série</label>
                             <div className="relative">
                                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input type="text" id="serial" placeholder="ABC-12345" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-semibold text-neutral-text-primary mb-2">Localização Inicial</label>
                         <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <input type="text" id="location" placeholder="Ex: Pátio A, Garagem 2" value={location} onChange={e => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar Equipamento
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default AddEquipmentModal;