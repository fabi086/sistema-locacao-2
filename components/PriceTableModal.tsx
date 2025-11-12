import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { Equipment } from '../types';

interface PriceTableModalProps {
    onClose: () => void;
    onSave: (updatedEquipment: Equipment[]) => void;
    equipment: Equipment[];
}

type PricesState = Record<string, {
    daily: string;
    weekly: string;
    biweekly: string;
}>;

const PriceTableModal: React.FC<PriceTableModalProps> = ({ onClose, onSave, equipment }) => {
    const [prices, setPrices] = useState<PricesState>(() => 
        equipment.reduce((acc, eq) => {
            acc[eq.id] = {
                daily: eq.pricing?.daily?.toString() ?? '',
                weekly: eq.pricing?.weekly?.toString() ?? '',
                biweekly: eq.pricing?.biweekly?.toString() ?? '',
            };
            return acc;
        }, {} as PricesState)
    );

    const handlePriceChange = (id: string, field: 'daily' | 'weekly' | 'biweekly', value: string) => {
        // Permite apenas números e um ponto decimal
        if (/^\d*\.?\d*$/.test(value)) {
            setPrices(prev => ({
                ...prev,
                [id]: {
                    ...(prev[id] || {}),
                    [field]: value
                }
            }));
        }
    };

    const handleSavePrices = () => {
        const updatedEquipment = equipment.map(eq => {
            const newPrices = prices[eq.id];
            return {
                ...eq,
                pricing: {
                    daily: parseFloat(newPrices.daily) || 0,
                    weekly: parseFloat(newPrices.weekly) || 0,
                    biweekly: parseFloat(newPrices.biweekly) || 0,
                }
            };
        });
        onSave(updatedEquipment);
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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Tabela de Preços de Locação</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="bg-neutral-card rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                                <tr>
                                    <th className="p-4">Equipamento</th>
                                    <th className="p-4 w-40 text-right">Diária (R$)</th>
                                    <th className="p-4 w-40 text-right">Semanal (R$)</th>
                                    <th className="p-4 w-40 text-right">Quinzenal (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipment.map(eq => (
                                    <tr key={eq.id} className="border-b border-neutral-card-alt last:border-b-0">
                                        <td className="p-4 font-semibold text-neutral-text-primary">{eq.name}</td>
                                        <td className="p-2">
                                            <input type="text" value={prices[eq.id]?.daily ?? ''} onChange={e => handlePriceChange(eq.id, 'daily', e.target.value)} className="w-full text-right px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" />
                                        </td>
                                        <td className="p-2">
                                            <input type="text" value={prices[eq.id]?.weekly ?? ''} onChange={e => handlePriceChange(eq.id, 'weekly', e.target.value)} className="w-full text-right px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" />
                                        </td>
                                        <td className="p-2">
                                            <input type="text" value={prices[eq.id]?.biweekly ?? ''} onChange={e => handlePriceChange(eq.id, 'biweekly', e.target.value)} className="w-full text-right px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSavePrices} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar Alterações
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default PriceTableModal;