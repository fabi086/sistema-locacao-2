import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { ConfirmationModalProps } from '../types';

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <div className="mx-auto bg-accent-danger/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-accent-danger" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-text-primary mb-2">{title}</h2>
                    <p className="text-neutral-text-secondary">{message}</p>
                </div>
                <footer className="p-6 bg-neutral-card-alt grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-accent-danger hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                    >
                        Confirmar Exclusão
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmationModal;