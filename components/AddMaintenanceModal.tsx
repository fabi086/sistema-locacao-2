import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, HardHat, List, Calendar, DollarSign, Zap } from 'lucide-react';
import { MaintenanceOrder, MaintenanceType, MaintenanceStatus, Equipment } from '../types';

interface AddMaintenanceModalProps {
    onClose: () => void;
    onSave: (orderData: Omit<MaintenanceOrder, 'id'> | MaintenanceOrder) => void;
    maintenanceOrderToEdit?: MaintenanceOrder | null;
    allEquipment: Equipment[];
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ onClose, onSave, maintenanceOrderToEdit, allEquipment }) => {
    const [equipment, setEquipment] = useState('');
    const [type, setType] = useState<MaintenanceType | ''>('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [cost, setCost] = useState('');
    const [status, setStatus] = useState<MaintenanceStatus>('Pendente');

    const isEditing = !!maintenanceOrderToEdit;

    useEffect(() => {
        if (isEditing) {
            setEquipment(maintenanceOrderToEdit.equipment);
            setType(maintenanceOrderToEdit.type);
            setScheduledDate(maintenanceOrderToEdit.scheduledDate);
            setCost(maintenanceOrderToEdit.cost.toString());
            setStatus(maintenanceOrderToEdit.status);
        } else {
            // Reset form for new entry
            setEquipment('');
            setType('');
            setScheduledDate('');
            setCost('');
            setStatus('Pendente');
        }
    }, [maintenanceOrderToEdit, isEditing]);

    const handleSubmit = () => {
        if (!equipment || !type || !scheduledDate) {
            alert('Equipamento, Tipo e Data Agendada são obrigatórios.');
            return;
        }

        const costValue = parseFloat(cost) || 0;

        const commonData = { equipment, type, scheduledDate, cost: costValue, status };
        
        const orderData = isEditing
            ? { ...maintenanceOrderToEdit, ...commonData }
            : commonData;

        onSave(orderData as Omit<MaintenanceOrder, 'id'> | MaintenanceOrder);
    };

    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
    const types: MaintenanceType[] = ['Preventiva', 'Corretiva'];
    const statuses: MaintenanceStatus[] = ['Pendente', 'Em Andamento', 'Concluída'];

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div>
                        <label htmlFor="maintenance-equipment" className="block text-sm font-semibold text-neutral-text-primary mb-2">Equipamento</label>
                        <div className="relative">
                            <HardHat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <select id="maintenance-equipment" value={equipment} onChange={e => setEquipment(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                <option value="">Selecione um equipamento...</option>
                                {allEquipment.map(eq => <option key={eq.id} value={eq.name}>{eq.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="maintenance-type" className="block text-sm font-semibold text-neutral-text-primary mb-2">Tipo de Manutenção</label>
                             <div className="relative">
                                <List size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select id="maintenance-type" value={type} onChange={e => setType(e.target.value as MaintenanceType)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                    <option value="">Selecione...</option>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                           <label htmlFor="maintenance-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data Agendada</label>
                             <div className="relative">
                                <label htmlFor="maintenance-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer">
                                  <Calendar size={18} />
                                </label>
                                <input type="date" id="maintenance-date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="maintenance-cost" className="block text-sm font-semibold text-neutral-text-primary mb-2">Custo (R$)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input type="number" id="maintenance-cost" placeholder="0,00" value={cost} onChange={e => setCost(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                            </div>
                        </div>
                        <div>
                           <label htmlFor="maintenance-status" className="block text-sm font-semibold text-neutral-text-primary mb-2">Status</label>
                             <div className="relative">
                                <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select id="maintenance-status" value={status} onChange={e => setStatus(e.target.value as MaintenanceStatus)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        {isEditing ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default AddMaintenanceModal;