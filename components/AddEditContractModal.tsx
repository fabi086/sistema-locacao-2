
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { Contract } from '../types';

interface AddEditContractModalProps {
    onClose: () => void;
    onSave: (contractData: Contract) => void;
    contractToEdit: Contract | null;
}

const AddEditContractModal: React.FC<AddEditContractModalProps> = ({ onClose, onSave, contractToEdit }) => {
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (contractToEdit) {
            setDueDate(contractToEdit.dueDate || '');
        }
    }, [contractToEdit]);

    const handleSubmit = () => {
        if (contractToEdit) {
            onSave({ ...contractToEdit, dueDate });
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

    if (!contractToEdit) return null;

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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                {...({
                    variants: modalVariants,
                    onClick: (e: any) => e.stopPropagation()
                } as any)}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Editar Contrato</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div className="p-4 bg-neutral-card-alt rounded-lg text-sm">
                        <p><span className="font-semibold">Contrato:</span> {contractToEdit.id}</p>
                        <p><span className="font-semibold">Cliente:</span> {contractToEdit.client}</p>
                    </div>
                    <div>
                        <label htmlFor="due-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Vencimento</label>
                        <div className="relative">
                             <label
                                htmlFor="due-date"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer"
                                aria-label="Abrir calendário"
                            >
                                <Calendar size={18} />
                            </label>
                            <input 
                                type="date" 
                                id="due-date" 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        Salvar Alterações
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default AddEditContractModal;
