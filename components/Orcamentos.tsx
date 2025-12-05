
import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer, Edit2, Trash2, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RentalOrder, RentalStatus, Customer } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabaseClient';

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
    const [sharingQuoteId, setSharingQuoteId] = useState<string | null>(null);
    
    const generatePdfBlob = async (quote: RentalOrder) => {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '0';
        element.style.width = '800px'; 
        element.style.backgroundColor = 'white';
        // Adiciona classes do Tailwind para garantir o estilo
        element.className = 'p-8 bg-white font-sans text-gray-800';
        
        const subtotal = quote.value;
        const total = subtotal + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
        const rentalPeriodString = `${new Date(quote.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(quote.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
        
        // Ícone SVG inline para garantir renderização
        const hardHatIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-hat text-secondary"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/></svg>`;

        element.innerHTML = `
            <div class="max-w-3xl mx-auto">
                <header class="flex flex-row justify-between items-start pb-6 border-b-2 border-gray-200 gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                                ${hardHatIcon}
                                <h1 class="text-3xl font-bold text-[#0A4C64]">ObraFácil</h1>
                        </div>
                        <p class="text-sm text-gray-500">Rua da Construção, 123, Bairro Industrial</p>
                        <p class="text-sm text-gray-500">CEP 12345-678, São Paulo, SP</p>
                        <p class="text-sm text-gray-500">contato@obrafacil.com | (11) 98765-4321</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-4xl font-bold text-gray-500 uppercase">Orçamento</h2>
                        <p class="text-lg font-semibold text-[#0A4C64]">${quote.id}</p>
                    </div>
                </header>
                <section class="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h3 class="text-sm font-semibold uppercase text-gray-500 mb-2">PARA:</h3>
                        <p class="font-bold text-lg text-[#2D3E50]">${quote.client}</p>
                        <p class="text-gray-600">CNPJ: 12.345.678/0001-99</p>
                        <p class="text-gray-600">Av. Principal, 456, Centro</p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-600"><span class="font-semibold">Data de Emissão:</span> ${new Date(quote.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <p class="text-gray-600"><span class="font-semibold">Válido até:</span> ${new Date(quote.validUntil + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <p class="text-gray-600"><span class="font-semibold">Período de Locação:</span> ${rentalPeriodString}</p>
                    </div>
                </section>
                <section class="mb-8">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="p-3 text-sm font-semibold uppercase text-gray-600 w-16 text-center">Item</th>
                                    <th class="p-3 text-sm font-semibold uppercase text-gray-600">Descrição</th>
                                    <th class="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Período</th>
                                    <th class="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${quote.equipmentItems.map((item, index) => `
                                    <tr class="border-b border-gray-200">
                                        <td class="p-3 w-16 text-center font-medium">${String(index + 1).padStart(3, '0')}</td>
                                        <td class="p-3 font-medium text-[#2D3E50]">${item.equipmentName}</td>
                                        <td class="p-3 text-right text-sm text-gray-700 whitespace-nowrap">${rentalPeriodString}</td>
                                        <td class="p-3 text-right font-semibold text-[#2D3E50] whitespace-nowrap">R$ ${(item.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section class="flex justify-end mb-8">
                    <div class="w-full max-w-sm space-y-2 text-gray-600">
                        <div class="flex justify-between">
                            <span>Subtotal (Equipamentos):</span>
                            <span class="font-medium">R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ${quote.freightCost ? `
                        <div class="flex justify-between">
                            <span>Frete:</span>
                            <span class="font-medium">R$ ${quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ` : ''}
                        ${quote.accessoriesCost ? `
                        <div class="flex justify-between">
                            <span>Acessórios:</span>
                            <span class="font-medium">R$ ${quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ` : ''}
                        ${quote.discount ? `
                        <div class="flex justify-between text-red-600">
                            <span>Desconto:</span>
                            <span class="font-medium">- R$ ${quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ` : ''}
                        <div class="flex justify-between pt-2 border-t border-gray-300">
                            <span class="font-bold text-lg text-[#2D3E50]">Total:</span>
                            <span class="font-bold text-lg text-[#0A4C64]">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </section>
                <footer class="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
                    <p class="font-semibold">Termos e Condições</p>
                    <p>O pagamento deve ser efetuado em até 30 dias após a emissão da fatura. Agradecemos a sua preferência!</p>
                </footer>
            </div>
        `;
        
        document.body.appendChild(element);
        
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            return pdf.output('blob');
        } finally {
            document.body.removeChild(element);
        }
    };

    const handleWhatsAppShare = async (quote: RentalOrder) => {
        setSharingQuoteId(quote.id);
        try {
            const clientInfo = clients.find(c => c.name === quote.client);
            if (!clientInfo || !clientInfo.phone) {
                alert('Número de telefone do cliente não encontrado para compartilhar via WhatsApp.');
                return;
            }
            
            const pdfBlob = await generatePdfBlob(quote);
            
            const fileName = `orcamento_${quote.id}_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('quotes')
                .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from('quotes')
                .getPublicUrl(fileName);

            const phoneNumber = clientInfo.phone.replace(/\D/g, '');
            const fullPhoneNumber = phoneNumber.length > 10 ? `55${phoneNumber}` : `55${phoneNumber}`;
            
            const equipmentList = quote.equipmentItems.map(item => `- ${item.equipmentName}`).join('\n');
            const total = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);

            const message = `Olá ${quote.client}, segue seu orçamento ${quote.id}:\n\n` +
                `*Baixe o PDF completo aqui:* ${publicUrl}\n\n` +
                `Equipamentos:\n${equipmentList}\n\n` +
                `Período: ${new Date(quote.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(quote.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}\n\n` +
                `*Valor Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
                `Agradecemos a preferência!\nObraFácil`;
            
            const url = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } catch (error: any) {
            console.error("Erro ao compartilhar:", error);
            alert(`Houve um erro ao gerar ou compartilhar o PDF: ${error.message || error}`);
        } finally {
            setSharingQuoteId(null);
        }
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
                                        <button onClick={() => handleWhatsAppShare(quote)} disabled={sharingQuoteId === quote.id} className="p-2 text-neutral-text-secondary hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors disabled:opacity-50" aria-label={`Compartilhar orçamento ${quote.id}`}>
                                            {sharingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
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
                            <button onClick={() => handleWhatsAppShare(quote)} disabled={sharingQuoteId === quote.id} className="p-2 text-neutral-text-secondary hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors disabled:opacity-50" aria-label={`Compartilhar orçamento ${quote.id}`}>
                                {sharingQuoteId === quote.id ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
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
