import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer } from 'lucide-react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Quote, QuoteStatus, Equipment } from '../types';
import QuotePrintModal from './QuotePrintModal';

const quoteData: Quote[] = [
    { id: 'ORC-001', client: 'Construtora Alfa', equipment: 'Escavadeira CAT 320D', createdDate: '2024-07-28', validUntil: '2024-08-12', value: 15000, status: 'Aprovado' },
    { id: 'ORC-002', client: 'Engenharia Beta', equipment: 'Betoneira CSM 400L', createdDate: '2024-07-25', validUntil: '2024-08-09', value: 2500, status: 'Pendente' },
    { id: 'ORC-003', client: 'Obras Gamma', equipment: 'Guindaste Liebherr LTM 1050', createdDate: '2024-07-22', validUntil: '2024-08-06', value: 45000, status: 'Recusado' },
    { id: 'ORC-004', client: 'Projetos Delta', equipment: 'Andaimes Tubulares (Lote 20)', createdDate: '2024-07-29', validUntil: '2024-08-13', value: 7500, status: 'Pendente' },
];

const statusColors: Record<QuoteStatus, string> = {
    'Aprovado': 'bg-accent-success/10 text-accent-success',
    'Pendente': 'bg-yellow-500/10 text-yellow-600',
    'Recusado': 'bg-accent-danger/10 text-accent-danger',
};

const StatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

const Orcamentos: React.FC<{ onOpenQuoteModal: (equipment?: Equipment | null) => void }> = ({ onOpenQuoteModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'Todos'>('Todos');
    const [quoteToPrint, setQuoteToPrint] = useState<Quote | null>(null);

    const filteredQuotes = useMemo(() => {
        return quoteData.filter(quote => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.equipment.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || quote.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    // FIX: Explicitly type variants with Variants to fix type error.
    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <>
            <AnimatePresence>
                {quoteToPrint && <QuotePrintModal quote={quoteToPrint} onClose={() => setQuoteToPrint(null)} />}
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
                                    <td className="p-4"><StatusBadge status={quote.status} /></td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setQuoteToPrint(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <Printer size={18} />
                                        </button>
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