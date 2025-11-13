import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Plus, Search, Printer, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import { Equipment, RentalOrder, RentalStatus } from '../types';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';


const columns: RentalStatus[] = ['Proposta', 'Aprovado', 'Reservado', 'Em Rota', 'Ativo', 'Concluído', 'Pendente de Pagamento'];

const pipelineStatusColors: Record<RentalStatus, string> = {
    'Proposta': 'border-gray-400',
    'Aprovado': 'border-blue-500',
    'Reservado': 'border-purple-500',
    'Em Rota': 'border-yellow-500',
    'Ativo': 'border-green-500',
    'Concluído': 'border-gray-600',
    'Pendente de Pagamento': 'border-orange-500',
};

const tableStatusColors: Record<RentalStatus, string> = {
    'Proposta': 'bg-yellow-500/10 text-yellow-600',
    'Aprovado': 'bg-accent-success/10 text-accent-success',
    'Reservado': 'bg-purple-500/10 text-purple-600',
    'Em Rota': 'bg-yellow-500/10 text-yellow-600',
    'Ativo': 'bg-blue-500/10 text-blue-600',
    'Concluído': 'bg-gray-500/10 text-gray-600',
    'Pendente de Pagamento': 'bg-orange-500/10 text-orange-600',
};


interface LocacaoProps {
    orders: RentalOrder[];
    onOpenAddModal: (equipment?: Equipment | null) => void;
    onEdit: (order: RentalOrder) => void;
    onDelete: (order: RentalOrder) => void;
    onUpdateStatus: (orderId: string, newStatus: RentalStatus) => void;
    onOpenScheduleDeliveryModal: (order: RentalOrder) => void;
    onOpenPrintModal: (order: RentalOrder) => void;
}

const Locacao: React.FC<LocacaoProps> = ({ orders, onOpenAddModal, onEdit, onDelete, onUpdateStatus, onOpenScheduleDeliveryModal, onOpenPrintModal }) => {
    const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
    const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    
    // State for Table View
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RentalStatus | 'Todos'>('Todos');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const ordersByStatus = useMemo(() => {
        return columns.reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status);
            return acc;
        }, {} as Record<RentalStatus, RentalOrder[]>);
    }, [orders]);
    
    const filteredOrdersForTable = useMemo(() => {
        return orders.filter(order => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.equipmentItems.some(item => item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const statusMatch = statusFilter === 'Todos' || order.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter, orders]);


    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const overContainer = (over.data.current?.sortable?.containerId || over.id) as RentalStatus;
            
            if (columns.includes(overContainer)) {
                onUpdateStatus(active.id as string, overContainer);
            }
        }
    };
    
    const renderPipelineView = () => (
        <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-neutral-bg">
            <div className="flex space-x-4 min-w-max h-full">
                {columns.map(status => (
                    <div key={status} id={status} className="w-80 bg-neutral-card-alt rounded-lg flex flex-col h-full">
                        <div className={`flex justify-between items-center p-4 border-t-4 ${pipelineStatusColors[status]} rounded-t-lg`}>
                            <h3 className="font-bold text-neutral-text-primary">{status}</h3>
                            <span className="text-sm font-semibold text-neutral-text-secondary bg-neutral-bg px-2 py-0.5 rounded-full">
                                {ordersByStatus[status].length}
                            </span>
                        </div>
                        <SortableContext id={status} items={ordersByStatus[status].map(o => o.id)} strategy={verticalListSortingStrategy}>
                            <div className="p-2 space-y-3 overflow-y-auto flex-1">
                                {ordersByStatus[status].map(order => (
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
         const containerVariants: Variants = {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        };

        const itemVariants: Variants = {
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
        };

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
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as RentalStatus | 'Todos')}
                     >
                        <option value="Todos">Todos Status</option>
                        {columns.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                 <motion.div 
                    className="bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                    initial="hidden" animate="visible" variants={containerVariants}
                >
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 hidden md:table-cell">Data</th>
                                <th className="p-4 hidden sm:table-cell">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody variants={containerVariants}>
                            {filteredOrdersForTable.map(order => (
                                <motion.tr key={order.id} className="border-b border-neutral-card-alt hover:bg-neutral-bg" variants={itemVariants}>
                                    <td className="p-4 font-semibold text-primary cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.id}</td>
                                    <td className="p-4 text-neutral-text-primary font-medium">{order.client}</td>
                                    <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{new Date(order.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 text-neutral-text-secondary hidden sm:table-cell font-semibold">R$ {order.value.toLocaleString('pt-BR')}</td>
                                    <td className="p-4">
                                         <div className="relative inline-block">
                                            <select
                                                value={order.status}
                                                onChange={(e) => onUpdateStatus(order.id, e.target.value as RentalStatus)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${tableStatusColors[order.status]}`}
                                                aria-label={`Mudar status do pedido ${order.id}`}
                                            >
                                                {columns.map(s => <option key={s} value={s}>{s}</option>)}
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
                     {filteredOrdersForTable.length === 0 && (
                        <div className="text-center p-8 text-neutral-text-secondary">
                            <p>Nenhum pedido encontrado com os filtros selecionados.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        )
    }

    return (
        <>
            <AnimatePresence>
                {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            </AnimatePresence>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col h-full">
                    <header className="p-4 sm:p-6 md:p-8 flex-col md:flex-row flex justify-between items-start md:items-center border-b border-gray-200 bg-white">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Locação & Orçamentos</h2>
                            <p className="text-neutral-text-secondary mt-1">Gerencie o ciclo de vida completo dos seus pedidos.</p>
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