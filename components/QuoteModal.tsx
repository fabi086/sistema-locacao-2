import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Plus, Trash2, Share2, Loader2, CheckCircle } from 'lucide-react';
import { RentalOrder, Equipment, Customer, EquipmentOrderItem } from '../types';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuoteModalProps {
    onClose: () => void;
    equipment: Equipment | null;
    orderToEdit: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: any, onSuccess?: (savedOrder: RentalOrder) => void) => void;
    allEquipment: Equipment[];
    onOpenPrintModal: (order: RentalOrder) => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ 
    onClose, 
    equipment, 
    orderToEdit, 
    clients, 
    onSave, 
    allEquipment,
    onOpenPrintModal
}) => {
    const isEditing = !!orderToEdit;
    
    const [clientName, setClientName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedItems, setSelectedItems] = useState<EquipmentOrderItem[]>([]);
    const [freightCost, setFreightCost] = useState<string>('');
    const [accessoriesCost, setAccessoriesCost] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('');
    
    // Sharing state
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedOrder, setSavedOrder] = useState<RentalOrder | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (orderToEdit) {
            setClientName(orderToEdit.client);
            setStartDate(orderToEdit.startDate);
            setEndDate(orderToEdit.endDate);
            setSelectedItems(orderToEdit.equipmentItems);
            setFreightCost(orderToEdit.freightCost?.toString() || '');
            setAccessoriesCost(orderToEdit.accessoriesCost?.toString() || '');
            setDiscount(orderToEdit.discount?.toString() || '');
            setPaymentMethod(orderToEdit.paymentMethod || '');
        } else {
            if (equipment) {
                const defaultPrice = equipment.pricing?.monthly || equipment.pricing?.weekly || equipment.pricing?.daily || 0;
                setSelectedItems([{
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                    value: defaultPrice
                }]);
            }
        }
    }, [orderToEdit, equipment]);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { equipmentId: '', equipmentName: '', value: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof EquipmentOrderItem, value: any) => {
        const newItems = [...selectedItems];
        if (field === 'equipmentId') {
            const eq = allEquipment.find(e => e.id === value);
            if (eq) {
                newItems[index].equipmentId = eq.id;
                newItems[index].equipmentName = eq.name;
                newItems[index].value = eq.pricing?.monthly || 0;
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setSelectedItems(newItems);
    };

    const calculateTotal = () => {
        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        const freight = parseFloat(freightCost) || 0;
        const accessories = parseFloat(accessoriesCost) || 0;
        const disc = parseFloat(discount) || 0;
        return itemsTotal + freight + accessories - disc;
    };

    const handleSubmit = () => {
        if (!clientName || !startDate || !endDate || selectedItems.length === 0) {
            alert("Preencha os campos obrigatórios");
            return;
        }

        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        
        const orderData = {
            id: orderToEdit?.id,
            client: clientName,
            startDate,
            endDate,
            equipmentItems: selectedItems,
            value: itemsTotal,
            freightCost: parseFloat(freightCost) || 0,
            accessoriesCost: parseFloat(accessoriesCost) || 0,
            discount: parseFloat(discount) || 0,
            paymentMethod,
            createdDate: orderToEdit?.createdDate || new Date().toISOString().split('T')[0],
            validUntil: orderToEdit?.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        onSave(orderData, (saved) => {
            setSavedOrder(saved);
            setShowSuccess(true);
        });
    };

    // PDF Generator (Duplicated logic for modal)
    const generatePdfBlob = async (quote: RentalOrder): Promise<Blob> => {
        const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
        
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.width = '800px';
        element.style.padding = '40px';
        element.style.backgroundColor = 'white';
        element.style.fontFamily = 'Inter, sans-serif';
        element.className = 'text-gray-900';

        element.innerHTML = `
            <div class="flex justify-between items-start border-b-2 border-[#0A4C64] pb-6 mb-6">
                <div class="flex items-center gap-3">
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

    const handleWhatsAppShare = async () => {
        if (!savedOrder) return;
        setIsSharing(true);
        
        try {
            const pdfBlob = await generatePdfBlob(savedOrder);
            const file = new File([pdfBlob], `orcamento_${savedOrder.id}.pdf`, { type: 'application/pdf' });
            const fileName = `${savedOrder.id}_${Date.now()}.pdf`;
            
            const { error: uploadError } = await supabase.storage
                .from('quotes')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('quotes')
                .getPublicUrl(fileName);

            const totalValue = savedOrder.value + (savedOrder.freightCost || 0) + (savedOrder.accessoriesCost || 0) - (savedOrder.discount || 0);
            const message = `*Orçamento ObraFácil* %0A` +
                `*Cliente:* ${savedOrder.client} %0A` +
                `*Valor Total:* R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} %0A` +
                `%0A📄 *Baixe o PDF do orçamento aqui:* %0A${publicUrl}`;

            window.open(`https://wa.me/?text=${message}`, '_blank');
        } catch (error: any) {
            console.error("Erro ao compartilhar:", error);
            alert("Erro ao compartilhar o orçamento. Verifique a configuração do Supabase Storage.");
        } finally {
            setIsSharing(false);
        }
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 50, scale: 0.95 } };

    if (showSuccess) {
        return (
            <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit" } as any)}>
                <motion.div className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-md p-8 text-center" {...({ variants: modalVariants } as any)}>
                    <div className="mx-auto bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-text-primary mb-2">Sucesso!</h2>
                    <p className="text-neutral-text-secondary mb-8">O orçamento foi salvo corretamente.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleWhatsAppShare} disabled={isSharing} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                            {isSharing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
                            Compartilhar no WhatsApp
                        </button>
                        <button onClick={onClose} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose } as any)}>
            <motion.div className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}>
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Orçamento / Pedido' : 'Novo Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors"><X size={20} /></button>
                </header>
                
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Cliente</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={clientName} onChange={e => setClientName(e.target.value)}>
                                    <option value="">Selecione o Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Data Início</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input type="date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Data Fim</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input type="date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-neutral-text-primary">Itens</h3>
                            <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-primary font-semibold hover:text-primary-dark"><Plus size={16} /> Adicionar Item</button>
                        </div>
                        <div className="bg-neutral-card rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                                    <tr>
                                        <th className="p-3">Equipamento</th>
                                        <th className="p-3 w-32">Valor (R$)</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                                            <td className="p-3">
                                                <select 
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    value={item.equipmentId}
                                                    onChange={(e) => handleItemChange(idx, 'equipmentId', e.target.value)}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {allEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>)}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                    value={item.value}
                                                    onChange={(e) => handleItemChange(idx, 'value', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {selectedItems.length === 0 && (
                                        <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nenhum item adicionado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Forma de Pagamento</label>
                            <input 
                                type="text" 
                                placeholder="Ex: 50% Sinal + 50% Entrega"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 bg-neutral-card-alt p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold">Frete (R$)</label>
                                <input type="number" className="w-32 p-1.5 border border-gray-300 rounded text-right" value={freightCost} onChange={e => setFreightCost(e.target.value)} placeholder="0.00"/>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold">Acessórios (R$)</label>
                                <input type="number" className="w-32 p-1.5 border border-gray-300 rounded text-right" value={accessoriesCost} onChange={e => setAccessoriesCost(e.target.value)} placeholder="0.00"/>
                            </div>
                            <div className="flex justify-between items-center text-accent-danger">
                                <label className="text-sm font-semibold">Desconto (R$)</label>
                                <input type="number" className="w-32 p-1.5 border border-red-200 rounded text-right text-accent-danger" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0.00"/>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg text-primary">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">Salvar Orçamento</button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuoteModal;