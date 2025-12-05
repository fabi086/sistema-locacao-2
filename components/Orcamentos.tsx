import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Printer, ArrowRight, Share2, Loader2 } from 'lucide-react';
import { RentalOrder, Customer, RentalStatus } from '../types';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    const [sharingQuoteId, setSharingQuoteId] = useState<string | null>(null);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const matchesSearch = 
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Todos' || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchTerm, statusFilter]);

    // Função para gerar PDF visualmente idêntico à impressão
    const generatePdfBlob = async (quote: RentalOrder): Promise<Blob> => {
        const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
        
        // Cria um elemento HTML temporário para renderizar o PDF
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.width = '800px'; // Largura fixa para A4
        element.style.padding = '40px';
        element.style.backgroundColor = 'white';
        element.style.fontFamily = 'Inter, sans-serif';
        element.className = 'text-gray-900';

        element.innerHTML = `
            <div class="flex justify-between items-start border-b-2 border-[#0A4C64] pb-6 mb-6">
                <div class="flex items-center gap-3">
                    <!-- Ícone HardHat SVG simplificado -->
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A4C64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"></path>
                        <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"></path>
                        <path d="M4 15v-3a6 6 0 0 1 6-6h0"></path>
                        <path d="M14 6h0a6 6 0 0 1 6 6v3"></path>
                    </svg>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">ObraFácil</h1>
                        <p class="text-sm text-gray-500">Locação de Equipamentos</p>
                    </div>
                </div>
                <div class="text-right">
                    <h2 class="text-xl font-bold text-gray-800">PROPOSTA COMERCIAL</h2>
                    <p class="text-gray-600">#${quote.id}</p>
                    <p class="text-sm text-gray-500">Data: ${new Date(quote.createdDate).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h3 class="text-sm font-bold text-gray-500 uppercase mb-2">Cliente</h3>
                    <p class="font-semibold text-lg text-gray-900">${quote.client}</p>
                </div>
                <div class="text-right">
                    <h3 class="text-sm font-bold text-gray-500 uppercase mb-2">Detalhes</h3>
                    <p class="text-gray-700"><span class="font-semibold">Período:</span> ${new Date(quote.startDate).toLocaleDateString('pt-BR')} a ${new Date(quote.endDate).toLocaleDateString('pt-BR')}</p>
                    <p class="text-gray-700"><span class="font-semibold">Validade:</span> ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>

            <div class="mb-8">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr class="bg-gray-100 text-gray-600 text-sm uppercase" style="background-color: #f3f4f6;">
                            <th style="padding: 12px; text-align: left;">Item / Equipamento</th>
                            <th style="padding: 12px; text-align: right;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.equipmentItems.map(item => `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px; font-weight: 500;">${item.equipmentName}</td>
                                <td style="padding: 12px; text-align: right;">R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 3rem;">
                <div style="width: 250px;">
                    <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 0.5rem;">
                        <span>Subtotal</span>
                        <span>R$ ${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    ${quote.freightCost ? `
                    <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 0.5rem;">
                        <span>Frete</span>
                        <span>R$ ${quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>` : ''}
                    ${quote.accessoriesCost ? `
                    <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 0.5rem;">
                        <span>Acessórios</span>
                        <span>R$ ${quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>` : ''}
                    ${quote.discount ? `
                    <div style="display: flex; justify-content: space-between; color: #ef4444; margin-bottom: 0.5rem;">
                        <span>Desconto</span>
                        <span>- R$ ${quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.25rem; color: #0A4C64; border-top: 1px solid #e5e7eb; padding-top: 0.5rem; margin-top: 0.5rem;">
                        <span>Total</span>
                        <span>R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <footer class="text-center text-xs text-gray-500 pt-6 border-t border-gray-200" style="text-align: center; font-size: 0.75rem; color: #6b7280; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                <p class="font-semibold mb-1" style="font-weight: 600; margin-bottom: 0.25rem;">Termos e Condições</p>
                <p>Esta proposta é válida por 15 dias a partir da data de emissão. Pagamento conforme combinado.</p>
                <p class="mt-4" style="margin-top: 1rem;">Agradecemos a sua preferência!</p>
            </footer>
        `;

        document.body.appendChild(element);

        try {
            const canvas = await html2canvas(element, { scale: 2 });
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
            // 1. Gerar PDF
            const pdfBlob = await generatePdfBlob(quote);
            const file = new File([pdfBlob], `orcamento_${quote.id}.pdf`, { type: 'application/pdf' });

            // 2. Upload para Supabase Storage
            const fileName = `${quote.id}_${Date.now()}.pdf`;
            const { data, error } = await supabase.storage
                .from('quotes')
                .upload(fileName, file);

            if (error) throw error;

            // 3. Obter URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('quotes')
                .getPublicUrl(fileName);

            // 4. Montar Mensagem
            const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
            const message = `*Orçamento ObraFácil* %0A` +
                `*Cliente:* ${quote.client} %0A` +
                `*Valor Total:* R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} %0A` +
                `%0A📄 *Baixe o PDF do orçamento aqui:* %0A${publicUrl}`;

            // 5. Abrir WhatsApp
            window.open(`https://wa.me/?text=${message}`, '_blank');

        } catch (error: any) {
            console.error("Erro ao compartilhar:", error);
            const errorMsg = error.message || (error.error ? error.error : 'Erro desconhecido');
            alert(`Erro ao gerar ou compartilhar PDF: ${errorMsg}. Verifique se o Bucket 'quotes' existe e é público no Supabase Storage.`);
        } finally {
            setSharingQuoteId(null);
        }
    };

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
                                        <button 
                                            onClick={() => handleWhatsAppShare(quote)} 
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full" 
                                            title="Compartilhar WhatsApp"
                                            disabled={sharingQuoteId === quote.id}
                                        >
                                            {sharingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                                        </button>
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