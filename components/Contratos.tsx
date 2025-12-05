

import React, { useState, useMemo } from 'react';
import { Search, Trash2, Edit2, FileText, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Contract, ContractStatus, RentalOrder } from '../types';

const statusColors: Record<ContractStatus, string> = {
    'Ativo': 'bg-accent-success/10 text-accent-success',
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Vencido': 'bg-accent-danger/10 text-accent-danger',
    'Concluído': 'bg-gray-500/10 text-gray-600',
};

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

interface ContratosProps {
    contracts: Contract[];
    rentalOrders: RentalOrder[];
    onDelete: (contract: Contract) => void;
    onEdit: (contract: Contract) => void;
    onOpenReceipt: (data: { contract: Contract, order: RentalOrder }) => void;
    onOpenContract: (data: { contract: Contract, order: RentalOrder }) => void;
}

const Contratos: React.FC<ContratosProps> = ({ contracts = [], rentalOrders, onDelete, onEdit, onOpenReceipt, onOpenContract }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ContractStatus | 'Todos'>('Todos');

    const filteredContracts = useMemo(() => {
        return contracts.filter(contract => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.client.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || contract.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter, contracts]);

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };
    
    const getOrderFromContract = (contractId: string) => {
        const orderId = contractId.replace('CON-', '');
        return rentalOrders.find(o => o.id === orderId);
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
                    <option value="Concluído">Concluído</option>
                </select>
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
                            <th className="p-4">ID Contrato</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Vigência</th>
                            <th className="p-4">Vencimento</th>
                            <th className="p-4">Valor Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody {...({ variants: containerVariants } as any)}>
                        {filteredContracts.map(contract => {
                            const order = getOrderFromContract(contract.id);
                            const isPaid = order?.paymentStatus === 'Pago';
                            return (
                                <motion.tr 
                                    key={contract.id} 
                                    className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                    {...({ variants: itemVariants } as any)}
                                >
                                    <td className="p-4 font-semibold text-primary">{contract.id}</td>
                                    <td className="p-4 text-neutral-text-primary font-medium">{contract.client}</td>
                                    <td className="p-4 text-neutral-text-secondary">
                                        {new Date(contract.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(contract.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 text-neutral-text-secondary">
                                        {contract.dueDate ? new Date(contract.dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                                    </td>
                                    <td className="p-4 text-neutral-text-secondary font-semibold">R$ {contract.value.toLocaleString('pt-BR')}</td>
                                    <td className="p-4"><StatusBadge status={contract.status} /></td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => order && onOpenContract({contract, order})} disabled={!order} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50" title="Gerar Contrato"><FileText size={16} /></button>
                                            <button onClick={() => order && onOpenReceipt({contract, order})} disabled={!isPaid || !order} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50" title="Gerar Recibo"><ScrollText size={16} /></button>
                                            <button onClick={() => onEdit(contract)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Editar contrato ${contract.id}`}><Edit2 size={16} /></button>
                                            <button onClick={() => onDelete(contract)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors" aria-label={`Excluir contrato ${contract.id}`}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )
                        })}
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
                {filteredContracts.map(contract => {
                    const order = getOrderFromContract(contract.id);
                    const isPaid = order?.paymentStatus === 'Pago';
                    return (
                        <motion.div key={contract.id} className="bg-neutral-card rounded-lg shadow-sm p-4 border border-gray-200" {...({ variants: itemVariants } as any)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-primary text-sm">{contract.id}</p>
                                    <p className="text-neutral-text-primary font-medium">{contract.client}</p>
                                </div>
                                <StatusBadge status={contract.status} />
                            </div>
                            <div className="my-3 text-sm text-neutral-text-secondary space-y-1 border-t border-b py-2">
                                <p><span className="font-semibold">Vigência:</span> {new Date(contract.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(contract.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                <p><span className="font-semibold">Vencimento:</span> {contract.dueDate ? new Date(contract.dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</p>
                                <p><span className="font-semibold">Valor:</span> R$ {contract.value.toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => order && onOpenContract({contract, order})} disabled={!order} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50" title="Gerar Contrato"><FileText size={18} /></button>
                                <button onClick={() => order && onOpenReceipt({contract, order})} disabled={!isPaid || !order} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50" title="Gerar Recibo"><ScrollText size={18} /></button>
                                <button onClick={() => onEdit(contract)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => onDelete(contract)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {filteredContracts.length === 0 && (
                <div className="text-center p-8 text-neutral-text-secondary bg-neutral-card rounded-lg shadow-sm">
                    <p>Nenhum contrato encontrado com os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};

export default Contratos;