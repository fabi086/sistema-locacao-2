import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

interface CustomDateRangeModalProps {
    onClose: () => void;
    onApply: (start: Date, end: Date) => void;
}

const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({ onClose, onApply }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApply = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start <= end) {
                onApply(start, end);
            } else {
                alert('A data de início deve ser anterior ou igual à data de fim.');
            }
        } else {
            alert('Por favor, selecione a data de início e de fim.');
        }
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

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose, "aria-modal": "true", role: "dialog" } as any)}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Selecionar Período</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Início</label>
                            <div className="relative">
                                <label htmlFor="start-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer"><Calendar size={18} /></label>
                                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" style={{ colorScheme: 'light' }} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Fim</label>
                            <div className="relative">
                                <label htmlFor="end-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer"><Calendar size={18} /></label>
                                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" style={{ colorScheme: 'light' }} />
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">Cancelar</button>
                    <button onClick={handleApply} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">Aplicar</button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default CustomDateRangeModal;