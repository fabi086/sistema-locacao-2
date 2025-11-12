import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Calendar, Truck } from 'lucide-react';
import { RentalOrder } from '../types';

interface ScheduleDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: RentalOrder;
    onSave: (orderId: string, deliveryDate: string) => void;
}

const ScheduleDeliveryModal: React.FC<ScheduleDeliveryModalProps> = ({ isOpen, onClose, order, onSave }) => {
    const [deliveryDate, setDeliveryDate] = useState('');

    const handleSubmit = () => {
        if (!deliveryDate) {
            alert('Por favor, selecione uma data de entrega.');
            return;
        }
        onSave(order.id, deliveryDate);
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

    if (!isOpen) return null;

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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Agendar Entrega</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div className="p-4 bg-neutral-card-alt rounded-lg text-sm">
                        <p><span className="font-semibold">Pedido:</span> {order.id}</p>
                        <p><span className="font-semibold">Equipamento:</span> {order.equipment}</p>
                        <p><span className="font-semibold">Cliente:</span> {order.client}</p>
                    </div>
                    <div>
                        <label htmlFor="delivery-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Selecione a Data de Entrega</label>
                        <div className="relative">
                             <label
                                htmlFor="delivery-date"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer"
                                aria-label="Abrir calendário"
                            >
                                <Calendar size={18} />
                            </label>
                            <input 
                                type="date" 
                                id="delivery-date" 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" 
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        <Truck size={16} />
                        Confirmar e Reservar
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default ScheduleDeliveryModal;