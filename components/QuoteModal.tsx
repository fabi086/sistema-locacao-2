import React, { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Building, HardHat, Calendar, DollarSign } from 'lucide-react';
import { Equipment, Customer, RentalOrder } from '../types';

interface QuoteModalProps {
    onClose: () => void;
    equipment?: Equipment | null;
    orderToEdit?: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder) => void;
    allEquipment: Equipment[];
}

const QuoteModal: React.FC<QuoteModalProps> = ({ onClose, equipment: preselectedEquipment, orderToEdit, clients, onSave, allEquipment }) => {
    const [client, setClient] = useState('');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalValue, setTotalValue] = useState(0);
    
    const isEditing = !!orderToEdit;
    const activeEquipment = allEquipment.find(eq => eq.id === selectedEquipmentId);

    useEffect(() => {
        if (isEditing) {
            setClient(orderToEdit.client);
            const eq = allEquipment.find(e => e.name === orderToEdit.equipment);
            setSelectedEquipmentId(eq?.id || '');
            setStartDate(orderToEdit.startDate);
            setEndDate(orderToEdit.endDate);
        } else {
            setClient(clients.length > 0 ? clients[0].name : '');
            setSelectedEquipmentId(preselectedEquipment?.id || '');
            setStartDate('');
            setEndDate('');
        }
    }, [isEditing, orderToEdit, preselectedEquipment, clients, allEquipment]);
    
    const calculatePrice = useCallback((start: string, end: string) => {
        if (!activeEquipment?.pricing || !start || !end) {
            return 0;
        }

        // Robust date calculation using UTC to avoid timezone/DST issues
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const [startYear, startMonth, startDay] = start.split('-').map(Number);
        const [endYear, endMonth, endDay] = end.split('-').map(Number);
        
        const utcStart = Date.UTC(startYear, startMonth - 1, startDay);
        const utcEnd = Date.UTC(endYear, endMonth - 1, endDay);
        
        if (isNaN(utcStart) || isNaN(utcEnd) || utcEnd < utcStart) {
            return 0;
        }

        let duration = Math.round(((utcEnd - utcStart) / MS_PER_DAY)) + 1;
        
        let cost = 0;
        const { biweekly, weekly, daily } = activeEquipment.pricing;

        if (duration >= 14) {
            const numBiweekly = Math.floor(duration / 14);
            cost += numBiweekly * biweekly;
            duration %= 14;
        }
        if (duration >= 7) {
            const numWeekly = Math.floor(duration / 7);
            cost += numWeekly * weekly;
            duration %= 7;
        }
        cost += duration * daily;

        return cost;
    }, [activeEquipment]);

    useEffect(() => {
        if (startDate && endDate && activeEquipment?.pricing) {
            const price = calculatePrice(startDate, endDate);
            setTotalValue(price);
        } else {
            setTotalValue(0);
        }
    }, [startDate, endDate, activeEquipment, calculatePrice]);


    const handleSubmit = () => {
        if (!client || !activeEquipment || !startDate || !endDate || totalValue <= 0) {
            alert('Por favor, preencha todos os campos e selecione um período válido.');
            return;
        }

        const commonData = {
            client: client,
            equipment: activeEquipment.name,
            value: totalValue,
            startDate,
            endDate
        };
        
        if (isEditing) {
            onSave({ ...orderToEdit, ...commonData });
        } else {
            const newOrderData = {
                ...commonData,
                createdDate: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Validade de 15 dias
            }
            onSave(newOrderData);
        }
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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Pedido' : 'Criar Novo Pedido/Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div>
                        <label htmlFor="client" className="block text-sm font-semibold text-neutral-text-primary mb-2">Cliente</label>
                        <div className="relative">
                            <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <select 
                                id="client" 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                            >
                                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="equipment" className="block text-sm font-semibold text-neutral-text-primary mb-2">Equipamento</label>
                         <div className="relative">
                            <HardHat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                             <select 
                                id="equipment" 
                                className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition ${!!preselectedEquipment ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                value={selectedEquipmentId}
                                onChange={(e) => setSelectedEquipmentId(e.target.value)}
                                disabled={!!preselectedEquipment && !isEditing}
                            >
                                <option value="" disabled>Selecione um equipamento</option>
                                {allEquipment.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="start-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Início</label>
                             <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input 
                                    type="date" 
                                    id="start-date" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                         <div>
                           <label htmlFor="end-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Fim</label>
                             <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input 
                                    type="date" 
                                    id="end-date" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                     <div className="bg-neutral-card-alt p-4 rounded-lg flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <DollarSign size={24} className="text-primary"/>
                            <span className="font-semibold text-neutral-text-primary">Valor Total Calculado:</span>
                         </div>
                         <span className="text-2xl font-bold text-accent-success">
                             R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                     </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        {isEditing ? 'Salvar Alterações' : 'Salvar e Enviar'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuoteModal;