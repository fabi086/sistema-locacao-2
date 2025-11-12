import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, Variants } from 'framer-motion';
import { X, Building, HardHat, Calendar } from 'lucide-react';
import { Equipment } from '../types';

const QuoteModal: React.FC<{ onClose: () => void; equipment?: Equipment | null }> = ({ onClose, equipment }) => {
    const [client, setClient] = useState('Construtora Alfa');
    const [equipmentName, setEquipmentName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (equipment) {
            setEquipmentName(equipment.name);
        }
    }, [equipment]);

    const handleSubmit = () => {
        console.log({
            client,
            equipmentName,
            startDate,
            endDate,
        });
        onClose();
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    // FIX: Explicitly type variants with Variants to fix type error.
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
            exit="hidden"
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
                    <h2 className="text-xl font-bold text-neutral-text-primary">Criar Novo Orçamento</h2>
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
                                <option>Construtora Alfa</option>
                                <option>Engenharia Beta</option>
                                <option>Obras Gamma</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="equipment" className="block text-sm font-semibold text-neutral-text-primary mb-2">Equipamento</label>
                         <div className="relative">
                            <HardHat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <input 
                                type="text" 
                                id="equipment" 
                                placeholder="Ex: Escavadeira, Betoneira" 
                                className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition ${!!equipment ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                value={equipmentName}
                                onChange={(e) => setEquipmentName(e.target.value)}
                                readOnly={!!equipment}
                            />
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
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar e Enviar
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuoteModal;