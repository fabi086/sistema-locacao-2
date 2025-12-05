import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Printer, ArrowRight } from 'lucide-react';
import { RentalOrder, Customer, RentalStatus } from '../types';

interface OrcamentosProps {
    quotes: RentalOrder[];
    clients: Customer[];
    onOpenAddModal: () => void;
    onEdit: (order: RentalOrder) => void;
    onDelete: (order: RentalOrder) => void;
    onUpdateStatus: (id: string, status: RentalStatus) => void;
    onOpenPrintModal: (order: RentalOrder) => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ 
    quotes, 
    clients, 
    onOpenAddModal, 
    onEdit, 
    onDelete, 
    onUpdateStatus, 
    onOpenPrintModal 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RentalStatus | 'Todos'>('Todos');

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const matchesSearch = 
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Todos' || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchTerm, statusFilter]);

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const statusBadgeColors: Record<string, string> = {
        'Proposta': 'bg-yellow-100 text-yellow-800',
        'Aprovado': 'bg-green-100 text-green-800',
        'Recusado': 'bg-red-100 text-red-800'
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Orçamentos</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie propostas e orçamentos pendentes.</p>
                </div>
                <button onClick={onOpenAddModal} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                    <Plus size={16} />
                    <span>Novo Orçamento</span>
                </button>
            </header>

            <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID..."
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
                    <option value="Proposta">Proposta</option>
                    <option value="Recusado">Recusado</option>
                </select>
            </div>

            <motion.div 
                className="bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                {...({ variants: containerVariants, initial: "hidden", animate: "visible" } as any)}
            >
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Data Criação</th>
                            <th className="p-4">Validade</th>
                            <th className="p-4">Valor Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody {...({ variants: containerVariants } as any)}>
                        {filteredQuotes.map(quote => (
                            <motion.tr key={quote.id} className="border-b border-neutral-card-alt hover:bg-neutral-bg" {...({ variants: itemVariants } as any)}>
                                <td className="p-4 font-semibold text-primary">{quote.id}</td>
                                <td className="p-4">{quote.client}</td>
                                <td className="p-4 text-neutral-text-secondary">{new Date(quote.createdDate).toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-neutral-text-secondary">{new Date(quote.validUntil).toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 font-semibold">
                                    R$ {(quote.value + (quote.freightCost||0) + (quote.accessoriesCost||0) - (quote.discount||0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadgeColors[quote.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {quote.status === 'Proposta' && (
                                            <button 
                                                onClick={() => onUpdateStatus(quote.id, 'Aprovado')} 
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full" 
                                                title="Aprovar"
                                            >
                                                <ArrowRight size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => onOpenPrintModal(quote)} className="p-2 text-neutral-text-secondary hover:bg-gray-100 rounded-full" title="Imprimir">
                                            <Printer size={16} />
                                        </button>
                                        <button onClick={() => onEdit(quote)} className="p-2 text-neutral-text-secondary hover:bg-gray-100 rounded-full" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(quote)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                {filteredQuotes.length === 0 && (
                    <div className="p-8 text-center text-neutral-text-secondary">Nenhum orçamento encontrado.</div>
                )}
            </motion.div>
        </div>
    );
};

export default Orcamentos;