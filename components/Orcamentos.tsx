import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer, Edit2, Trash2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RentalOrder, RentalStatus, Customer } from '../types';

const statusColors: Record<RentalStatus, string> = {
    'Proposta': 'bg-yellow-500/10 text-yellow-600',
    'Aprovado': 'bg-accent-success/10 text-accent-success',
    'Recusado': 'bg-accent-danger/10 text-accent-danger',
    'Reservado': 'bg-purple-500/10 text-purple-600',
    'Em Rota': 'bg-yellow-500/10 text-yellow-600',
    'Ativo': 'bg-blue-500/10 text-blue-600',
    'Concluído': 'bg-gray-500/10 text-gray-600',
    'Pendente de Pagamento': 'bg-orange-500/10 text-orange-600',
};

const quoteStatuses: RentalStatus[] = ['Proposta', 'Aprovado', 'Recusado'];

interface OrcamentosProps {
    quotes: RentalOrder[];
    clients: Customer[];
    onOpenAddModal: () => void;
    onEdit: (order: RentalOrder) => void;
    onDelete: (order: RentalOrder) => void;
    onUpdateStatus: (orderId: string, newStatus: RentalStatus) => void;
    onOpenPrintModal: (order: RentalOrder) => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ quotes, clients, onOpenAddModal, onEdit, onDelete, onUpdateStatus, onOpenPrintModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RentalStatus | 'Todos'>('Todos');
    
    const handleWhatsAppShare = (quote: RentalOrder) => {
        const clientInfo = clients.find(c => c.name === quote.client);
        if (!clientInfo || !clientInfo.phone) {
            alert('Número de telefone do cliente não encontrado para compartilhar via WhatsApp.');
            return;
        }
        
        const phoneNumber = clientInfo.phone.replace(/\D/g, '');
        const fullPhoneNumber = phoneNumber.length > 10 ? `55${phoneNumber}` : `55${phoneNumber}`;
        
        const equipmentList = quote.equipmentItems.map(item => `- ${item.equipmentName}`).join('\n');
        const total = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);

        const message = `Olá ${quote.client}, segue seu orçamento ${quote.id}:\n\n` +
            `Equipamentos:\n${equipmentList}\n\n` +
            `Período: ${new Date(quote.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(quote.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}\n\n` +
            `Subtotal: R$ ${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
            (quote.freightCost ? `Frete: R$ ${quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            (quote.accessoriesCost ? `Acessórios: R$ ${quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            (quote.discount ? `Desconto: - R$ ${quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            `*Valor Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
            `Agradecemos a preferência!\nObraFácil`;
        
        const url = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.equipmentItems.some(item => item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const statusMatch = statusFilter === 'Todos' || quote.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter, quotes]);
    
    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Orçamentos</h2>
                    <p className="text-neutral-text-secondary mt-1">Crie e gerencie propostas comerciais.</p>
                </div>
                <button onClick={() => onOpenAddModal()} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
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
                    onChange={(e) => setStatusFilter(e.target.value as RentalStatus | 'Todos')}
                 >
                    <option value="Todos">Todos Status</option>
                    {quoteStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
            
            {/* Table View for medium screens and up */}
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
                            <th className="p-4">ID</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Valor</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody {...({ variants: containerVariants } as any)}>
                        {filteredQuotes.map(quote => (
                            <motion.tr 
                                key={quote.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                {...({ variants: itemVariants } as any)}
                            >
                                <td className="p-4 font-semibold text-primary">{quote.id}</td>
                                <td className="p-4 text-neutral-text-primary font-medium">{quote.client}</td>
                                <td className="p-4 text-neutral-text-secondary">{new Date(quote.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-neutral-text-secondary font-semibold">R$ {quote.value.toLocaleString('pt-BR')}</td>
                                <td className="p-4">
                                    <div className="relative inline-block">
                                        <select
                                            value={quote.status}
                                            onChange={(e) => onUpdateStatus(quote.id, e.target.value as RentalStatus)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-none transition-colors ${statusColors[quote.status]}`}
                                            aria-label={`Mudar status do orçamento ${quote.id}`}
                                        >
                                            {quoteStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => handleWhatsAppShare(quote)} className="p-2 text-neutral-text-secondary hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors" aria-label={`Compartilhar orçamento ${quote.id}`}>
                                            <Share2 size={16} />
                                        </button>
                                        <button onClick={() => onEdit(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Editar orçamento ${quote.id}`}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onOpenPrintModal(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Imprimir orçamento ${quote.id}`}>
                                            <Printer size={16} />
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
            </motion.div>

            {/* Card View for small screens */}
            <motion.div
                className="block md:hidden space-y-4"
                {...({
                    initial: "hidden",
                    animate: "visible",
                    variants: containerVariants
                } as any)}
            >
                {filteredQuotes.map(quote => (
                    <motion.div key={quote.id} className="bg-neutral-card rounded-lg shadow-sm p-4 border border-gray-200" {...({ variants: itemVariants } as any)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-primary text-sm">{quote.id}</p>
                                <p className="text-neutral-text-primary font-medium">{quote.client}</p>
                            </div>
                            <div className="relative inline-block">
                                <select
                                    value={quote.status}
                                    onChange={(e) => onUpdateStatus(quote.id, e.target.value as RentalStatus)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`pl-2.5 pr-8 py-1 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary border-none transition-colors ${statusColors[quote.status]}`}
                                    aria-label={`Mudar status do orçamento ${quote.id}`}
                                >
                                    {quoteStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="my-3 text-sm text-neutral-text-secondary flex justify-between items-center border-t border-b py-2">
                            <span><span className="font-semibold">Data:</span> {new Date(quote.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                            <span><span className="font-semibold">Valor:</span> R$ {quote.value.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleWhatsAppShare(quote)} className="p-2 text-neutral-text-secondary hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors" aria-label={`Compartilhar orçamento ${quote.id}`}>
                                <Share2 size={18} />
                            </button>
                            <button onClick={() => onEdit(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Editar orçamento ${quote.id}`}>
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => onOpenPrintModal(quote)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" aria-label={`Imprimir orçamento ${quote.id}`}>
                                <Printer size={18} />
                            </button>
                            <button onClick={() => onDelete(quote)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors" aria-label={`Excluir orçamento ${quote.id}`}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {filteredQuotes.length === 0 && (
                <div className="text-center p-8 text-neutral-text-secondary bg-neutral-card rounded-lg shadow-sm">
                    <p>Nenhum orçamento encontrado com os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};

export default Orcamentos;