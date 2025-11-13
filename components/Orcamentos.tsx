import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Quote, QuoteStatus, Equipment, RentalOrder } from '../types';
import QuotePrintModal from './QuotePrintModal';

const statusColors: Record<QuoteStatus, string> = {
    'Aprovado': 'bg-accent-success/10 text-accent-success',
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Recusado': 'bg-accent-danger/10 text-accent-danger',
};

interface OrcamentosProps {
    quotes: Quote[];
    onOpenQuoteModal: (equipment?: Equipment | null) => void;
    onEdit: (quote: Quote) => void;
    onDelete: (quote: Quote) => void;
    onUpdateStatus: (quoteId: string, newStatus: QuoteStatus) => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ quotes, onOpenQuoteModal, onEdit, onDelete, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'Todos'>('Todos');
    const [quoteToPrint, setQuoteToPrint] = useState<Quote | null>(null);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.equipment.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || quote.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter, quotes]);
    
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <>
            <AnimatePresence>
                {quoteToPrint && <QuotePrintModal quote={{
                    ...quoteToPrint,
                    equipmentItems: [{ equipmentId: 'N/A', equipmentName: quoteToPrint.equipment, value: quoteToPrint.value }],
                    status: 'Proposta', 
                    statusHistory: [{ status: 'Proposta', date: quoteToPrint.createdDate }],
                } as RentalOrder} onClose={() => setQuoteToPrint(null)} />}
            </AnimatePresence>
            <div className="p-6 md:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-text-primary">Orçamentos</h2>
                        <p className="text-neutral-text-secondary mt-1">Crie e gerencie propostas comerciais.</p>
                    </div>
                    <button onClick={() => onOpenQuoteModal()} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                        <Plus size={16} />
                        <span>Novo Orçamento</span>
                    </button>
                </header>
                
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
                        onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'Todos')}
                     >
                        <option value="Todos">Todos Status</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Recusado">Recusado</option>
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
                                <th className="p-4">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 hidden md:table-cell">Data</th>
                                <th className="p-4 hidden sm:table-cell">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody variants={containerVariants}>
                            {filteredQuotes.map(quote => (
                                <motion.tr 
                                    key={quote.id} 
                                    className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                    variants={itemVariants}
                                >
                                    <td className="p-4 font-semibold text-primary">{quote.id}</td>
                                    <td className="p-4 text-neutral-text-primary font-medium">{quote.client}</td>
                                    <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{new Date(quote.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 text-neutral-text-secondary hidden sm:table-cell font-semibold">R$ {quote.value.toLocaleString('pt-BR')}</td>
                                    <td className="p-4">
                                        <div className="relative inline-block">
                                            <select
                                                value={quote.status}
                                                onChange={(e) => onUpdateStatus(quote.id, e.target.value as QuoteStatus)}
                                                onClick={(e) => e.stopPropagation()} // Impede que outros eventos de clique na linha sejam acionados
                                                className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${statusColors[quote.status]}`}
                                                aria-label={`Mudar status do orçamento ${quote.id}`}
                                            >
                                                <option value="Pendente">Pendente</option>
                                                <option value="Aprovado">Aprovado</option>
                                                <option value="Recusado">Recusado</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onEdit(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Editar orçamento ${quote.id}`}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setQuoteToPrint(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Imprimir orçamento ${quote.id}`}>
                                                <Printer size={18} />
                                            </button>
                                            <button onClick={() => onDelete(quote)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors" aria-label={`Excluir orçamento ${quote.id}`}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                     {filteredQuotes.length === 0 && (
                        <div className="text-center p-8 text-neutral-text-secondary">
                            <p>Nenhum orçamento encontrado com os filtros selecionados.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default Orcamentos;