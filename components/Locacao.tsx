

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Printer, Edit2, Trash2, LayoutGrid, List, MapPin } from 'lucide-react';
import { Equipment, RentalOrder, RentalStatus, Customer, PaymentStatus } from '../types';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';


const allStatuses: RentalStatus[] = ['Proposta', 'Aprovado', 'Recusado', 'Reservado', 'Em Rota', 'Ativo', 'Concluído', 'Pendente de Pagamento'];
const allPaymentStatuses: PaymentStatus[] = ['Pendente', 'Sinal Pago', 'Pago', 'Vencido'];

const pipelineStatusColors: Record<RentalStatus, string> = {
    'Proposta': 'border-gray-400',
    'Aprovado': 'border-blue-500',
    'Recusado': 'border-red-500',
    'Reservado': 'border-purple-500',
    'Em Rota': 'border-yellow-500',
    'Ativo': 'border-green-500',
    'Concluído': 'border-gray-600',
    'Pendente de Pagamento': 'border-orange-500',
};

const tableStatusColors: Record<RentalStatus, string> = {
    'Proposta': 'bg-yellow-500/10 text-yellow-600',
    'Aprovado': 'bg-accent-success/10 text-accent-success',
    'Recusado': 'bg-accent-danger/10 text-accent-danger',
    'Reservado': 'bg-purple-500/10 text-purple-600',
    'Em Rota': 'bg-yellow-500/10 text-yellow-600',
    'Ativo': 'bg-blue-500/10 text-blue-600',
    'Concluído': 'bg-gray-500/10 text-gray-600',
    'Pendente de Pagamento': 'bg-orange-500/10 text-orange-600',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
    'Pendente': 'bg-orange-500/10 text-orange-600',
    'Sinal Pago': 'bg-blue-500/10 text-blue-600',
    'Pago': 'bg-green-500/10 text-green-600',
    'Vencido': 'bg-red-500/10 text-red-600',
};


interface LocacaoProps {
    orders: RentalOrder[];
    clients: Customer[];
    onOpenAddModal: (equipment?: Equipment | null) => void;
    onEdit: (order: RentalOrder) => void;
    onDelete: (order: RentalOrder) => void;
    onUpdateStatus: (orderId: string, newStatus: RentalStatus) => void;
    onUpdatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
    onOpenScheduleDeliveryModal: (order: RentalOrder) => void;
    onOpenPrintModal: (order: RentalOrder) => void;
    stages: RentalStatus[];
}

const Locacao: React.FC<LocacaoProps> = ({ orders, clients, onOpenAddModal, onEdit, onDelete, onUpdateStatus, onUpdatePaymentStatus, onOpenScheduleDeliveryModal, onOpenPrintModal, stages }) => {
    const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
    const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    
    // State for Table View
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RentalStatus | 'Todos'>('Todos');
    const [clientFilter, setClientFilter] = useState<string>('Todos');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const ordersByStatus = useMemo(() => {
        return stages.reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status);
            return acc;
        }, {} as Record<RentalStatus, RentalOrder[]>);
    }, [orders, stages]);

    const uniqueClients = useMemo(() => {
        const clients = new Set(orders.map(order => order.client));
        return ['Todos', ...Array.from(clients).sort()];
    }, [orders]);
    
    const filteredOrdersForTable = useMemo(() => {
        return orders.filter(order => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.equipmentItems.some(item => item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const statusMatch = statusFilter === 'Todos' || order.status === statusFilter;
            const clientMatch = clientFilter === 'Todos' || order.client === clientFilter;

            return searchMatch && statusMatch && clientMatch;
        });
    }, [searchTerm, statusFilter, clientFilter, orders]);

    const formatAddress = (clientName: string) => {
        const client = clients.find(c => c.name === clientName);
        if (!client || !client.street) return 'N/A';
        return `${client.street}, ${client.number || 's/n'} - ${client.neighborhood}, ${client.city}`;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const overContainer = (over.data.current?.sortable?.containerId || over.id) as RentalStatus;
            
            if (stages.includes(overContainer)) {
                onUpdateStatus(active.id as string, overContainer);
            }
        }
    };
    
    const renderPipelineView = () => (
        <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-neutral-bg">
            <div className="flex space-x-4 min-w-max h-full">
                {stages.map(status => (
                    <div key={status} id={status} className="w-80 bg-neutral-card-alt rounded-lg flex flex-col h-full">
                        <div className={`flex justify-between items-center p-4 border-t-4 ${pipelineStatusColors[status]} rounded-t-lg`}>
                            <h3 className="font-bold text-neutral-text-primary">{status}</h3>
                            <span className="text-sm font-semibold text-neutral-text-secondary bg-neutral-bg px-2 py-0.5 rounded-full">
                                {ordersByStatus[status]?.length || 0}
                            </span>
                        </div>
                        <SortableContext id={status} items={ordersByStatus[status]?.map(o => o.id) || []} strategy={verticalListSortingStrategy}>
                            <div className="p-2 space-y-3 overflow-y-auto flex-1">
                                {ordersByStatus[status]?.map(order => (
                                    <OrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onClick={() => setSelectedOrder(order)}
                                        onScheduleDelivery={() => onOpenScheduleDeliveryModal(order)}
                                        isDragging={activeId === order.id}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderTableView = () => {
         const containerVariants: any = {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        };

        const itemVariants: any = {
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
        };

        const totalValue = (order: RentalOrder) => order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);

        return (
             <div className="p-4 sm:p-6 md:p-8">
                <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por ID, cliente ou equipamento..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                    >
                        {uniqueClients.map(client => <option key={client} value={client}>{client === 'Todos' ? 'Todos Clientes' : client}</option>)}
                    </select>
                     <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as RentalStatus | 'Todos')}
                     >
                        <option value="Todos">Todos Status</option>
                        {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                
                {/* Desktop Table */}
                 <motion.div 
                    className="hidden lg:block bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                    {...({
                        initial: "hidden",
                        animate: "visible",
                        variants: containerVariants
                    } as any)}
                >
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Endereço</th>
                                <th className="p-4">Pagamento</th>
                                <th className="p-4">Status Operacional</th>
                                <th className="p-4">Status Financeiro</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody {...({ variants: containerVariants } as any)}>
                            {filteredOrdersForTable.map(order => (
                                <motion.tr key={order.id} className="border-b border-neutral-card-alt hover:bg-neutral-bg" {...({ variants: itemVariants } as any)}>
                                    <td className="p-4 font-semibold text-primary cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.id}</td>
                                    <td className="p-4 text-neutral-text-primary font-medium">{order.client}</td>
                                    <td className="p-4 text-neutral-text-secondary text-xs max-w-xs truncate" title={formatAddress(order.client)}>{formatAddress(order.client)}</td>
                                    <td className="p-4 text-neutral-text-secondary">{order.paymentMethod || 'N/A'}</td>
                                    <td className="p-4">
                                         <div className="relative inline-block">
                                            <select
                                                value={order.status}
                                                onChange={(e) => onUpdateStatus(order.id, e.target.value as RentalStatus)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${tableStatusColors[order.status]}`}
                                                aria-label={`Mudar status do pedido ${order.id}`}
                                            >
                                                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative inline-block">
                                            <select
                                                value={order.paymentStatus || 'Pendente'}
                                                onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${paymentStatusColors[order.paymentStatus || 'Pendente']}`}
                                                aria-label={`Mudar status financeiro do pedido ${order.id}`}
                                            >
                                                {allPaymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onEdit(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Editar pedido ${order.id}`}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => onOpenPrintModal(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Imprimir pedido ${order.id}`}>
                                                <Printer size={18} />
                                            </button>
                                            <button onClick={() => onDelete(order)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors" aria-label={`Excluir pedido ${order.id}`}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </motion.div>

                {/* Mobile & Tablet Cards */}
                 <motion.div
                    className="block lg:hidden space-y-4"
                    {...({
                        initial: "hidden",
                        animate: "visible",
                        variants: containerVariants
                    } as any)}
                >
                    {filteredOrdersForTable.map(order => (
                        <motion.div key={order.id} className="bg-neutral-card rounded-lg shadow-sm p-4 border border-gray-200" {...({ variants: itemVariants } as any)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-primary text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.id}</p>
                                    <p className="text-neutral-text-primary font-medium">{order.client}</p>
                                </div>
                                <div className="relative inline-block">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onUpdateStatus(order.id, e.target.value as RentalStatus)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary border-none transition-colors ${tableStatusColors[order.status]}`}
                                    >
                                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                                </div>
                            </div>
                            <div className="my-3 text-sm text-neutral-text-secondary space-y-2 border-t pt-2">
                                <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5"/><span>{formatAddress(order.client)}</span></div>
                                <div className="flex justify-between">
                                    <span><span className="font-semibold">Pagamento:</span> {order.paymentMethod || 'N/A'}</span>
                                     <div className="relative inline-block">
                                        <select
                                            value={order.paymentStatus || 'Pendente'}
                                            onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary border-none transition-colors ${paymentStatusColors[order.paymentStatus || 'Pendente']}`}
                                        >
                                            {allPaymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-1 border-t pt-2">
                                <button onClick={() => onEdit(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => onOpenPrintModal(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Printer size={18} /></button>
                                <button onClick={() => onDelete(order)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                 {(filteredOrdersForTable.length === 0) && (
                    <div className="text-center p-8 text-neutral-text-secondary bg-neutral-card rounded-lg shadow-sm">
                        <p>Nenhum pedido encontrado com os filtros selecionados.</p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <AnimatePresence>
                {selectedOrder && <OrderDetailModal order={selectedOrder} clients={clients} onClose={() => setSelectedOrder(null)} />}
            </AnimatePresence>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col h-full">
                    <header className="p-4 sm:p-6 md:p-8 flex-col md:flex-row flex justify-between items-start md:items-center border-b border-gray-200 bg-white">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Operação / Locação</h2>
                            <p className="text-neutral-text-secondary mt-1">Gerencie o ciclo de vida dos seus pedidos ativos.</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                             <div className="flex items-center p-1 bg-neutral-card-alt rounded-lg">
                                <button onClick={() => setView('pipeline')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'pipeline' ? 'bg-white text-primary shadow-sm' : 'text-neutral-text-secondary hover:bg-white/50'}`}>
                                    <LayoutGrid size={16} />
                                    <span>Pipeline</span>
                                </button>
                                <button onClick={() => setView('table')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'table' ? 'bg-white text-primary shadow-sm' : 'text-neutral-text-secondary hover:bg-white/50'}`}>
                                    <List size={16} />
                                    <span>Lista</span>
                                </button>
                            </div>
                            <button onClick={() => onOpenAddModal()} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors">
                                <Plus size={16} />
                                <span>Novo Pedido</span>
                            </button>
                        </div>
                    </header>
                    
                    {view === 'pipeline' ? renderPipelineView() : renderTableView()}
                </div>
            </DndContext>
        </>
    );
}

export default Locacao;