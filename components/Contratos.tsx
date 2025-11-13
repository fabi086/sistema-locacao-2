import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Contract, ContractStatus } from '../types';

const contractData: Contract[] = [
    { id: 'CTR-001', client: 'Construtora Alfa', startDate: '2024-08-01', endDate: '2025-07-31', value: 180000, status: 'Ativo' },
    { id: 'CTR-002', client: 'Engenharia Beta', startDate: '2024-08-05', endDate: '2024-11-04', value: 30000, status: 'Ativo' },
    { id: 'CTR-003', client: 'Obras Gamma', startDate: '2024-07-25', endDate: '2024-08-24', value: 45000, status: 'Pendente' },
    { id: 'CTR-004', client: 'Projetos Delta', startDate: '2023-09-01', endDate: '2024-08-31', value: 90000, status: 'Vencido' },
    { id: 'CTR-005', client: 'Infra Epsilon', startDate: '2024-09-01', endDate: '2024-12-31', value: 55000, status: 'Pendente' },
];

const statusColors: Record<ContractStatus, string> = {
    'Ativo': 'bg-accent-success/10 text-accent-success',
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Vencido': 'bg-gray-500/10 text-gray-600',
};

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

const Contratos: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ContractStatus | 'Todos'>('Todos');

    const filteredContracts = useMemo(() => {
        return contractData.filter(contract => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.client.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || contract.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter]);

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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Contratos</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie seus acordos e vigências.</p>
                </div>
            </header>
            
            <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por ID do contrato ou cliente..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <select
                    className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ContractStatus | 'Todos')}
                 >
                    <option value="Todos">Todos Status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Vencido">Vencido</option>
                </select>
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
                            <th className="p-4">ID Contrato</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4 hidden md:table-cell">Vigência</th>
                            <th className="p-4 hidden sm:table-cell">Valor Total</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants}>
                        {filteredContracts.map(contract => (
                            <motion.tr 
                                key={contract.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                variants={itemVariants}
                            >
                                <td className="p-4 font-semibold text-primary">{contract.id}</td>
                                <td className="p-4 text-neutral-text-primary font-medium">{contract.client}</td>
                                <td className="p-4 text-neutral-text-secondary hidden md:table-cell">
                                    {new Date(contract.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(contract.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-4 text-neutral-text-secondary hidden sm:table-cell font-semibold">R$ {contract.value.toLocaleString('pt-BR')}</td>
                                <td className="p-4"><StatusBadge status={contract.status} /></td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredContracts.length === 0 && (
                    <div className="text-center p-8 text-neutral-text-secondary">
                        <p>Nenhum contrato encontrado com os filtros selecionados.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Contratos;