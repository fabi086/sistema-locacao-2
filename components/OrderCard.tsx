

import React from 'react';
import { Calendar, Building, CheckCircle, PieChart, AlertCircle } from 'lucide-react';
import { RentalOrder, PaymentStatus } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OrderCardProps {
    order: RentalOrder;
    onClick: () => void;
    isDragging: boolean;
}

const paymentStatusConfig: Record<PaymentStatus, { color: string; Icon: React.ElementType }> = {
    'Pendente': { color: 'text-orange-500', Icon: PieChart },
    'Sinal Pago': { color: 'text-blue-500', Icon: PieChart },
    'Pago': { color: 'text-green-500', Icon: CheckCircle },
    'Vencido': { color: 'text-red-500', Icon: AlertCircle },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, isDragging }) => {
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

    const totalValue = order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);
    const paymentStatus = order.paymentStatus || 'Pendente';
    const { color: paymentColor, Icon: PaymentIcon } = paymentStatusConfig[paymentStatus];

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
                     R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </span>
            </div>
            
            <p className="text-sm text-neutral-text-secondary mt-2 mb-3 font-semibold">
                {order.equipmentItems[0]?.equipmentName}
                {order.equipmentItems.length > 1 && (
                    <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        + {order.equipmentItems.length - 1}
                    </span>
                )}
            </p>

            <div className="space-y-2 text-xs text-neutral-text-secondary border-t pt-3">
                 <div className="flex items-center gap-2">
                    <Building size={14} />
                    <span>{order.client}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(order.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(order.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-end pt-2">
                    <div className={`flex items-center gap-1.5 font-semibold ${paymentColor}`}>
                        <PaymentIcon size={14} />
                        <span>{paymentStatus}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;