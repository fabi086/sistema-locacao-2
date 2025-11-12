import React from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, Variants } from 'framer-motion';
import { HardHat, Calendar, Building, DollarSign, Truck } from 'lucide-react';
import { RentalOrder } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OrderCardProps {
    order: RentalOrder;
    onClick: () => void;
    onScheduleDelivery: (orderId: string) => void;
    isDragging: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, onScheduleDelivery, isDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: order.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    };


    const handleScheduleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onScheduleDelivery(order.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-primary cursor-pointer transition-all touch-none"
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
        </div>
    );
};

export default OrderCard;