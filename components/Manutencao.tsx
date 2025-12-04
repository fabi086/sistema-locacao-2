import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MaintenanceOrder, MaintenanceStatus, MaintenanceType } from '../types';

const statusColors: Record<MaintenanceStatus, string> = {
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Em Andamento': 'bg-blue-500/10 text-blue-600',
    'Concluída': 'bg-accent-success/10 text-accent-success',
};

interface ManutencaoProps {
    maintenanceOrders: MaintenanceOrder[];
    onAdd: () => void;
    onEdit: (order: MaintenanceOrder) => void;
    onDelete: (order: MaintenanceOrder) => void;
    onUpdateStatus: (orderId: string, newStatus: MaintenanceStatus) => void;
}

const Manutencao: React.FC<ManutencaoProps> = ({ maintenanceOrders, onAdd, onEdit, onDelete, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'Todos'>('Todos');
    const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'Todos'>('Todos');

    const filteredOrders = useMemo(() => {
        return maintenanceOrders.filter(order => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.equipment.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || order.status === statusFilter;
            const typeMatch = typeFilter === 'Todos' || order.type === typeFilter;

            return searchMatch && statusMatch && typeMatch;
        });
    }, [searchTerm, statusFilter, typeFilter, maintenanceOrders]);

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };
    
    const allStatuses: MaintenanceStatus[] = ['Pendente', 'Em Andamento', 'Concluída'];

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Manutenção</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie as ordens de serviço da sua frota.</p>
                </div>
                 <button onClick={onAdd} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                    <Plus size={16} />
                    <span>Nova Ordem de Serviço</span>
                </button>
            </header>
            
            <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por OS ou equipamento..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex gap-4">
                     <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'Todos')}
                     >
                        <option value="Todos">Todos Status</option>
                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as MaintenanceType | 'Todos')}
                     >
                        <option value="Todos">Todos Tipos</option>
                        <option value="Preventiva">Preventiva</option>
                        <option value="Corretiva">Corretiva</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <motion.div 
                className="hidden md:block bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                {...({
                    initial: "hidden",
                    animate: "visible",
                    variants: containerVariants
                } as any)}
            >
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                        <tr>
                            <th className="p-4">OS</th>
                            <th className="p-4">Equipamento</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Data Agendada</th>
                            <th className="p-4">Custo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody {...({ variants: containerVariants } as any)}>
                        {filteredOrders.map(order => (
                            <motion.tr 
                                key={order.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                {...({ variants: itemVariants } as any)}
                            >
                                <td className="p-4 font-semibold text-primary">{order.id}</td>
                                <td className="p-4 text-neutral-text-primary font-medium">{order.equipment}</td>
                                <td className="p-4 text-neutral-text-secondary">{order.type}</td>
                                <td className="p-4 text-neutral-text-secondary">{new Date(order.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-neutral-text-secondary font-semibold">R$ {order.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="p-4">
                                     <div className="relative inline-block">
                                        <select
                                            value={order.status}
                                            onChange={(e) => onUpdateStatus(order.id, e.target.value as MaintenanceStatus)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${statusColors[order.status]}`}
                                            aria-label={`Mudar status da OS ${order.id}`}
                                        >
                                            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEdit(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(order)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </motion.div>

            {/* Mobile Cards */}
            <motion.div
                className="block md:hidden space-y-4"
                {...({
                    initial: "hidden",
                    animate: "visible",
                    variants: containerVariants
                } as any)}
            >
                {filteredOrders.map(order => (
                    <motion.div key={order.id} className="bg-neutral-card rounded-lg shadow-sm p-4 border border-gray-200" {...({ variants: itemVariants } as any)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-primary text-sm">{order.id}</p>
                                <p className="text-neutral-text-primary font-medium">{order.equipment}</p>
                            </div>
                            <div className="relative inline-block">
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value as MaintenanceStatus)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary border-none transition-colors ${statusColors[order.status]}`}
                                >
                                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="my-3 text-sm text-neutral-text-secondary flex justify-between items-center border-t border-b py-2">
                             <span><span className="font-semibold">Tipo:</span> {order.type}</span>
                             <span><span className="font-semibold">Data:</span> {new Date(order.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                             <p className="text-sm font-semibold text-neutral-text-primary">Custo: R$ {order.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => onEdit(order)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => onDelete(order)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {filteredOrders.length === 0 && (
                <div className="text-center p-8 text-neutral-text-secondary bg-neutral-card rounded-lg shadow-sm">
                    <p>Nenhuma ordem de serviço encontrada com os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};

export default Manutencao;