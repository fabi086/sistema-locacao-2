import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Printer, ArrowRight, Share2, Loader2, HardHat } from 'lucide-react';
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

    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

    // Função para gerar PDF visualmente idêntico à impressão
    const generatePdfBlob = async (quote: RentalOrder, client?: Customer): Promise<Blob> => {
        const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
        
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.width = '8.27in'; // A4 width
        element.style.height = '11.69in'; // A4 height
        element.style.backgroundColor = 'white';
        
        const content = `
        <div style="padding: 48px; font-family: 'Inter', sans-serif; color: #374151;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; margin-bottom: 32px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div>
                         <h1 style="font-size: 24px; font-weight: bold; color: #111827;">ObraFácil</h1>
                         <p style="font-size: 12px; color: #6b7280;">Rua da Construção, 123, Bairro Industrial</p>
                         <p style="font-size: 12px; color: #6b7280;">CEP 12345-678, São Paulo, SP</p>
                         <p style="font-size: 12px; color: #6b7280;">contato@obrafacil.com | (11) 98765-4321</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <h2 style="font-size: 28px; font-weight: bold; color: #4b5563; letter-spacing: 0.05em;">ORÇAMENTO</h2>
                    <p style="font-weight: 600; color: #0A4C64;">${quote.id}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; font-size: 14px;">
                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px;">
                    <p style="font-size: 12px; font-weight: bold; color: #6b7280; margin-bottom: 4px;">PARA:</p>
                    <p style="font-weight: bold; font-size: 16px;">${client?.name || quote.client}</p>
                    ${client?.document ? `<p style="color: #4b5563;">CNPJ: ${client.document}</p>` : ''}
                    ${client?.street ? `<p style="color: #4b5563;">${client.street}, ${client.number || 'S/N'}</p>` : ''}
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: flex-end; gap: 8px;"><p style="font-weight: bold; color: #4b5563;">Data de Emissão:</p><p>${formatDate(quote.createdDate)}</p></div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px;"><p style="font-weight: bold; color: #4b5563;">Válido até:</p><p>${formatDate(quote.validUntil)}</p></div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px;"><p style="font-weight: bold; color: #4b5563;">Período de Locação:</p><p>${formatDate(quote.startDate)} a ${formatDate(quote.endDate)}</p></div>
                </div>
            </div>

            <table style="width: 100%; text-align: left; margin-bottom: 32px; border-collapse: collapse;">
                <thead style="background-color: #f3f4f6;">
                    <tr>
                        <th style="padding: 12px; font-size: 14px; font-weight: bold; color: #4b5563; width: 64px;">ITEM</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: bold; color: #4b5563;">DESCRIÇÃO</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: bold; color: #4b5563; width: 192px;">PERÍODO</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: bold; color: #4b5563; width: 128px; text-align: right;">VALOR</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.equipmentItems.map((item, idx) => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 12px; color: #4b5563;">${(idx + 1).toString().padStart(3, '0')}</td>
                            <td style="padding: 12px; font-weight: 600;">${item.equipmentName}</td>
                            <td style="padding: 12px; color: #4b5563;">${formatDate(quote.startDate)} a ${formatDate(quote.endDate)}</td>
                            <td style="padding: 12px; text-align: right; font-weight: 600;">R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 320px; font-size: 14px; line-height: 2;">
                    <div style="display: flex; justify-content: space-between; color: #4b5563;">
                        <p>Subtotal (Equipamentos):</p>
                        <p>R$ ${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    ${quote.freightCost > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: #4b5563;">
                        <p>Frete:</p>
                        <p>R$ ${quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>` : ''}
                    ${quote.accessoriesCost > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: #4b5563;">
                        <p>Acessórios:</p>
                        <p>R$ ${quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>` : ''}
                     ${quote.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: #dc2626; font-weight: 600;">
                        <p>Desconto:</p>
                        <p>- R$ ${quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                        <span>Total:</span>
                        <span>R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
        element.innerHTML = content;

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
        const client = clients.find(c => c.name === quote.client);
        
        try {
            // 1. Gerar PDF
            const pdfBlob = await generatePdfBlob(quote, client);
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