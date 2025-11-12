import React from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, Variants } from 'framer-motion';
import { X, Calendar, HardHat, Building, DollarSign, CheckCircle } from 'lucide-react';
import { RentalOrder, RentalStatus } from '../types';

const OrderDetailModal: React.FC<{ order: RentalOrder; onClose: () => void }> = ({ order, onClose }) => {
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

    const statusColors: Record<RentalStatus, string> = {
        'Proposta': 'bg-gray-400',
        'Aprovado': 'bg-blue-500',
        'Reservado': 'bg-purple-500',
        'Em Rota': 'bg-yellow-500',
        'Ativo': 'bg-green-500',
        'Concluído': 'bg-gray-600',
        'Pendente de Pagamento': 'bg-orange-500',
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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-text-primary">Detalhes do Pedido: {order.id}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-3 h-3 rounded-full ${statusColors[order.status]}`}></span>
                            <span className="font-semibold text-sm text-neutral-text-secondary">{order.status}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                   <div className="space-y-6">
                       <h3 className="font-bold text-lg text-neutral-text-primary border-b pb-2">Informações Gerais</h3>
                       <div className="space-y-4 text-sm">
                           <div className="flex items-center gap-3"><Building size={18} className="text-primary"/> <div><span className="font-semibold">Cliente:</span> {order.client}</div></div>
                           <div className="flex items-center gap-3"><HardHat size={18} className="text-primary"/> <div><span className="font-semibold">Equipamento:</span> {order.equipment}</div></div>
                           <div className="flex items-center gap-3"><Calendar size={18} className="text-primary"/> <div><span className="font-semibold">Período:</span> {new Date(order.startDate).toLocaleDateString('pt-BR')} a {new Date(order.endDate).toLocaleDateString('pt-BR')}</div></div>
                           <div className="flex items-center gap-3"><DollarSign size={18} className="text-primary"/> <div><span className="font-semibold">Valor Total:</span> R$ {order.value.toLocaleString('pt-BR')}</div></div>
                       </div>
                   </div>
                   <div className="space-y-6">
                       <h3 className="font-bold text-lg text-neutral-text-primary border-b pb-2">Histórico de Status</h3>
                        <div className="relative pl-4">
                           <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                           {order.statusHistory.map((history, index) => (
                               <div key={index} className="relative mb-6">
                                   <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full ${statusColors[history.status]}`}></div>
                                   <p className="font-semibold text-neutral-text-primary">{history.status}</p>
                                   <p className="text-xs text-neutral-text-secondary">{new Date(history.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                               </div>
                           ))}
                       </div>
                   </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Fechar
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default OrderDetailModal;