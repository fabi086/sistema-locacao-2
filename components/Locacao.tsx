import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
import { RentalOrder, RentalStatus } from '../types';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';

const rentalOrdersData: RentalOrder[] = [
    { id: 'LOC-001', client: 'Construtora Alfa', equipment: 'Escavadeira CAT 320D', startDate: '2024-08-01', endDate: '2024-08-15', value: 15000, status: 'Ativo', statusHistory: [ { status: 'Proposta', date: '2024-07-10' }, { status: 'Aprovado', date: '2024-07-12' }, { status: 'Reservado', date: '2024-07-15' }, { status: 'Em Rota', date: '2024-08-01' }, { status: 'Ativo', date: '2024-08-01' }] },
    { id: 'LOC-002', client: 'Engenharia Beta', equipment: 'Betoneira CSM 400L', startDate: '2024-08-05', endDate: '2024-08-10', value: 2500, status: 'Reservado', statusHistory: [ { status: 'Proposta', date: '2024-07-20' }, { status: 'Aprovado', date: '2024-07-22' }, { status: 'Reservado', date: '2024-07-23' }] },
    { id: 'LOC-003', client: 'Obras Gamma', equipment: 'Guindaste Liebherr LTM 1050', startDate: '2024-07-25', endDate: '2024-08-25', value: 45000, status: 'Aprovado', statusHistory: [ { status: 'Proposta', date: '2024-07-18' }, { status: 'Aprovado', date: '2024-07-20' }] },
    { id: 'LOC-004', client: 'Projetos Delta', equipment: 'Andaimes Tubulares (Lote 20)', startDate: '2024-09-01', endDate: '2024-09-30', value: 7500, status: 'Proposta', statusHistory: [ { status: 'Proposta', date: '2024-07-28' }] },
    { id: 'LOC-005', client: 'Construtora Alfa', equipment: 'Escavadeira Komatsu PC200', startDate: '2024-07-20', endDate: '2024-07-28', value: 9800, status: 'Concluído', statusHistory: [ { status: 'Proposta', date: '2024-07-01' }, { status: 'Aprovado', date: '2024-07-02' }, { status: 'Reservado', date: '2024-07-05' }, { status: 'Em Rota', date: '2024-07-20' }, { status: 'Ativo', date: '2024-07-20' }, { status: 'Concluído', date: '2024-07-28' }] },
     { id: 'LOC-006', client: 'Engenharia Beta', equipment: 'Betoneira Menegotti 150L', startDate: '2024-08-12', endDate: '2024-08-18', value: 1800, status: 'Ativo', statusHistory: [ { status: 'Proposta', date: '2024-07-25' }, { status: 'Aprovado', date: '2024-07-28' }, { status: 'Reservado', date: '2024-08-01' }, { status: 'Em Rota', date: '2024-08-12' }, { status: 'Ativo', date: '2024-08-12' }] },
];

const columns: RentalStatus[] = ['Proposta', 'Aprovado', 'Reservado', 'Em Rota', 'Ativo', 'Concluído'];

const statusColors: Record<RentalStatus, string> = {
    'Proposta': 'border-gray-400',
    'Aprovado': 'border-blue-500',
    'Reservado': 'border-purple-500',
    'Em Rota': 'border-yellow-500',
    'Ativo': 'border-green-500',
    'Concluído': 'border-gray-600',
};

const Locacao: React.FC = () => {
    const [orders, setOrders] = useState<RentalOrder[]>(rentalOrdersData);
    const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);

    const handleScheduleDelivery = (orderId: string) => {
        setOrders(currentOrders => 
            currentOrders.map(order => {
                if (order.id === orderId) {
                    const today = new Date().toISOString().split('T')[0];
                    return {
                        ...order,
                        status: 'Em Rota',
                        statusHistory: [...order.statusHistory, { status: 'Em Rota', date: today }]
                    };
                }
                return order;
            })
        );
    };

    const ordersByStatus = useMemo(() => {
        return columns.reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status);
            return acc;
        }, {} as Record<RentalStatus, RentalOrder[]>);
    }, [orders]);

    return (
        <>
            <AnimatePresence>
                {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            </AnimatePresence>
            <div className="flex flex-col h-full">
                <header className="p-6 md:p-8 flex justify-between items-center border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-text-primary">Pipeline de Locação</h2>
                        <p className="text-neutral-text-secondary mt-1">Acompanhe o status de todos os pedidos.</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors">
                        <Plus size={16} />
                        <span>Novo Pedido</span>
                    </button>
                </header>
                
                <div className="flex-1 overflow-x-auto p-4 md:p-6 bg-neutral-bg">
                    <div className="flex space-x-4 min-w-max h-full">
                        {columns.map(status => (
                            <div key={status} className="w-80 bg-neutral-card-alt rounded-lg flex flex-col h-full">
                                <div className={`flex justify-between items-center p-4 border-t-4 ${statusColors[status]} rounded-t-lg`}>
                                    <h3 className="font-bold text-neutral-text-primary">{status}</h3>
                                    <span className="text-sm font-semibold text-neutral-text-secondary bg-neutral-bg px-2 py-0.5 rounded-full">
                                        {ordersByStatus[status].length}
                                    </span>
                                </div>
                                <div className="p-2 space-y-3 overflow-y-auto flex-1">
                                    {ordersByStatus[status].map(order => (
                                        <OrderCard 
                                            key={order.id} 
                                            order={order} 
                                            onClick={() => setSelectedOrder(order)}
                                            onScheduleDelivery={handleScheduleDelivery}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Locacao;