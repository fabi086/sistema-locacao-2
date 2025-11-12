import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { MaintenanceOrder, MaintenanceStatus, MaintenanceType } from '../types';

const maintenanceData: MaintenanceOrder[] = [
    { id: 'OS-001', equipment: 'Escavadeira CAT 320D', type: 'Corretiva', status: 'Concluída', cost: 2500.00, scheduledDate: '2024-07-10' },
    { id: 'OS-002', equipment: 'Guindaste Liebherr LTM 1050', type: 'Preventiva', status: 'Em Andamento', cost: 1200.00, scheduledDate: '2024-08-10' },
    { id: 'OS-003', equipment: 'Betoneira CSM 400L', type: 'Preventiva', status: 'Pendente', cost: 450.00, scheduledDate: '2024-08-15' },
    { id: 'OS-004', equipment: 'Betoneira Menegotti 150L', type: 'Corretiva', status: 'Concluída', cost: 780.50, scheduledDate: '2024-07-22' },
    { id: 'OS-005', equipment: 'Escavadeira Komatsu PC200', type: 'Preventiva', status: 'Pendente', cost: 900.00, scheduledDate: '2024-08-20' },
];

const statusColors: Record<MaintenanceStatus, string> = {
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Em Andamento': 'bg-blue-500/10 text-blue-600',
    'Concluída': 'bg-accent-success/10 text-accent-success',
};

const StatusBadge: React.FC<{ status: MaintenanceStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

const Manutencao: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'Todos'>('Todos');
    const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'Todos'>('Todos');

    const filteredOrders = useMemo(() => {
        return maintenanceData.filter(order => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.equipment.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || order.status === statusFilter;
            const typeMatch = typeFilter === 'Todos' || order.type === typeFilter;

            return searchMatch && statusMatch && typeMatch;
        });
    }, [searchTerm, statusFilter, typeFilter]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <div className="p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-text-primary">Manutenção</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie as ordens de serviço da sua frota.</p>
                </div>
                 <button className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
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
                        <option value="Pendente">Pendente</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Concluída">Concluída</option>
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

            <motion.div 
                className="bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                        <tr>
                            <th className="p-4">OS</th>
                            <th className="p-4">Equipamento</th>
                            <th className="p-4 hidden md:table-cell">Tipo</th>
                            <th className="p-4 hidden sm:table-cell">Data Agendada</th>
                            <th className="p-4 hidden md:table-cell">Custo</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants}>
                        {filteredOrders.map(order => (
                            <motion.tr 
                                key={order.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                variants={itemVariants}
                            >
                                <td className="p-4 font-semibold text-primary">{order.id}</td>
                                <td className="p-4 text-neutral-text-primary font-medium">{order.equipment}</td>
                                <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{order.type}</td>
                                <td className="p-4 text-neutral-text-secondary hidden sm:table-cell">{new Date(order.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-neutral-text-secondary hidden md:table-cell font-semibold">R$ {order.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="p-4"><StatusBadge status={order.status} /></td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredOrders.length === 0 && (
                    <div className="text-center p-8 text-neutral-text-secondary">
                        <p>Nenhuma ordem de serviço encontrada com os filtros selecionados.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Manutencao;
