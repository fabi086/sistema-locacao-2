import React from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, Variants } from 'framer-motion';
import { HardHat, Calendar, Building, DollarSign, Truck } from 'lucide-react';
import { RentalOrder } from '../types';

interface OrderCardProps {
    order: RentalOrder;
    onClick: () => void;
    onScheduleDelivery: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, onScheduleDelivery }) => {
    // FIX: Explicitly type variants with Variants to fix type error.
    const cardVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    const handleScheduleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onScheduleDelivery(order.id);
    };

    return (
        <motion.div
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary cursor-pointer transition-all"
        >
            <div className="flex justify-between items-start">
                 <p className="font-bold text-neutral-text-primary text-sm">{order.id}</p>
                 <span className="text-xs font-bold text-accent-success">
                     R$ {order.value.toLocaleString('pt-BR')}
                 </span>
            </div>
            
            <p className="text-sm text-neutral-text-secondary mt-2 mb-4 font-semibold">{order.equipment}</p>

            <div className="space-y-2 text-xs text-neutral-text-secondary">
                 <div className="flex items-center gap-2">
                    <Building size={14} />
                    <span>{order.client}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(order.startDate).toLocaleDateString('pt-BR')} - {new Date(order.endDate).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
            
            {order.status === 'Aprovado' && (
                <div className="mt-4 pt-3 border-t border-neutral-card-alt">
                    <button
                        onClick={handleScheduleClick}
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-secondary text-white px-3 py-1.5 rounded-md hover:bg-secondary-dark transition-colors"
                    >
                        <Truck size={14} />
                        Agendar Entrega
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default OrderCard;