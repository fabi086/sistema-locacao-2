import React, { useState, useEffect, useMemo } from 'react';
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
    const [discountType, setDiscountType] = useState<'R$' | '%'>('R$');
    const [paymentMethod, setPaymentMethod] = useState('');
    
    // Rastreia se o preço de um item foi editado manualmente pelo usuário
    const [manualPriceOverrides, setManualPriceOverrides] = useState<Record<number, boolean>>({});
    
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedOrder, setSavedOrder] = useState<RentalOrder | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const paymentOptions = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto Bancário', 'Transferência (TED/DOC)', '50% Sinal + 50% Entrega'];

    useEffect(() => {
        if (orderToEdit) {
            setClientName(orderToEdit.client);
            setStartDate(orderToEdit.startDate);
            setEndDate(orderToEdit.endDate);
            setSelectedItems(orderToEdit.equipmentItems);
            setFreightCost(orderToEdit.freightCost?.toString() || '');
            setAccessoriesCost(orderToEdit.accessoriesCost?.toString() || '');
            setDiscount(orderToEdit.discount?.toString() || '');
            setDiscountType('R$'); // Descontos salvos são sempre em R$
            setPaymentMethod(orderToEdit.paymentMethod || '');
            setManualPriceOverrides({}); // Assume que os preços salvos são os desejados
        } else {
            // Reset for new quote
            setClientName('');
            setStartDate('');
            setEndDate('');
            setFreightCost('');
            setAccessoriesCost('');
            setDiscount('');
            setDiscountType('R$');
            setPaymentMethod('');
            
            if (equipment) {
                const initialItems = [{
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                    value: 0 // Inicia com 0, o cálculo automático cuidará disso
                }];
                setSelectedItems(initialItems);
            } else {
                 setSelectedItems([]);
            }
            setManualPriceOverrides({});
        }
    }, [orderToEdit, equipment]);


    const calculateBestPrice = (duration: number, pricing: Equipment['pricing']) => {
        if (!pricing || duration <= 0) return 0;
        
        const { daily = 0, weekly = 0, biweekly = 0, monthly = 0 } = pricing;
        let daysLeft = duration;
        let totalCost = 0;

        // Tenta usar a maior unidade de tempo primeiro para otimizar o custo
        if (monthly > 0) {
            const numMonths = Math.floor(daysLeft / 30);
            totalCost += numMonths * monthly;
            daysLeft %= 30;
        }
        if (biweekly > 0) {
            const numBiweeks = Math.floor(daysLeft / 15);
            totalCost += numBiweeks * biweekly;
            daysLeft %= 15;
        }
        if (weekly > 0) {
            const numWeeks = Math.floor(daysLeft / 7);
            totalCost += numWeeks * weekly;
            daysLeft %= 7;
        }
        if (daily > 0) {
            totalCost += daysLeft * daily;
        }

        // Caso a soma de diárias seja mais barata que uma unidade maior
        if (weekly > 0 && daily > 0 && daily * 7 < weekly) totalCost = Math.min(totalCost, duration * daily);
        if (biweekly > 0 && daily > 0 && daily * 15 < biweekly) totalCost = Math.min(totalCost, duration * daily);
        if (monthly > 0 && daily > 0 && daily * 30 < monthly) totalCost = Math.min(totalCost, duration * daily);

        return totalCost;
    };

    // Efeito para calcular o preço automaticamente
    useEffect(() => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) return;

        // +1 para incluir o dia final no aluguel
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        
        if (duration > 0) {
            const updatedItems = selectedItems.map((item, index) => {
                // Só recalcula se o preço não foi alterado manualmente
                if (item.equipmentId && !manualPriceOverrides[index]) {
                    const equipmentDetails = allEquipment.find(eq => eq.id === item.equipmentId);
                    if (equipmentDetails?.pricing) {
                        const newPrice = calculateBestPrice(duration, equipmentDetails.pricing);
                        return { ...item, value: newPrice };
                    }
                }
                return item;
            });
            setSelectedItems(updatedItems);
        }
    }, [startDate, endDate, selectedItems.map(i => i.equipmentId).join(','), allEquipment, manualPriceOverrides]);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { equipmentId: '', equipmentName: '', value: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);

        const newOverrides = { ...manualPriceOverrides };
        delete newOverrides[index];
        // Reajusta os índices das substituições manuais
        Object.keys(newOverrides).forEach(key => {
            const keyNum = parseInt(key);
            if (keyNum > index) {
                newOverrides[keyNum - 1] = newOverrides[keyNum];
                delete newOverrides[keyNum];
            }
        });
        setManualPriceOverrides(newOverrides);
    };
    
    const handleItemEquipmentSelect = (index: number, eq: Equipment) => {
        const newItems = [...selectedItems];
        newItems[index] = {
            equipmentId: eq.id,
            equipmentName: eq.name,
            value: 0 // Deixa o useEffect calcular
        };
        setSelectedItems(newItems);
        
        // Quando um novo equipamento é selecionado, reseta a flag de override manual
        setManualPriceOverrides(prev => ({ ...prev, [index]: false }));
    };

    const handleItemValueChange = (index: number, value: number) => {
        const newItems = [...selectedItems];
        newItems[index] = { ...newItems[index], value: isNaN(value) ? 0 : value };
        setSelectedItems(newItems);
        // Marca que o usuário alterou o preço manualmente
        setManualPriceOverrides(prev => ({ ...prev, [index]: true }));
    };

    const subTotal = useMemo(() => {
        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        const freight = parseFloat(freightCost) || 0;
        const accessories = parseFloat(accessoriesCost) || 0;
        return itemsTotal + freight + accessories;
    }, [selectedItems, freightCost, accessoriesCost]);

    const calculatedDiscount = useMemo(() => {
        const discValue = parseFloat(discount) || 0;
        if (discountType === '%') {
            return (subTotal * discValue) / 100;
        }
        return discValue;
    }, [discount, discountType, subTotal]);

    const total = useMemo(() => {
        return subTotal - calculatedDiscount;
    }, [subTotal, calculatedDiscount]);

    const handleSubmit = () => {
        if (!clientName || !startDate || !endDate || selectedItems.some(item => !item.equipmentId)) {
            alert("Preencha todos os campos obrigatórios, incluindo a seleção de equipamentos válidos.");
            return;
        }

        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        
        const orderData = {
            id: orderToEdit?.id,
            client: clientName,
            startDate,
            endDate,
            equipmentItems: selectedItems.filter(item => item.equipmentId),
            value: itemsTotal,
            freightCost: parseFloat(freightCost) || 0,
            accessoriesCost: parseFloat(accessoriesCost) || 0,
            discount: calculatedDiscount,
            paymentMethod,
            createdDate: orderToEdit?.createdDate || new Date().toISOString().split('T')[0],
            validUntil: orderToEdit?.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        onSave(orderData, (saved) => {
            setSavedOrder(saved);
            setShowSuccess(true);
        });
    };

    // ... (generatePdfBlob and handleWhatsAppShare remain the same)
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
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto" {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose } as any)}>
            <motion.div className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}>
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Orçamento / Pedido' : 'Novo Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors"><X size={20} /></button>
                </header>
                
                <div className="p-8 flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Cliente</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" value={clientName} onChange={e => setClientName(e.target.value)}>
                                    <option value="">Selecione o Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Data Início</label>
                            <div className="relative">
                                <label htmlFor="start-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer">
                                    <Calendar size={18} />
                                </label>
                                <input type="date" id="start-date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Data Fim</label>
                            <div className="relative">
                                <label htmlFor="end-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer">
                                    <Calendar size={18} />
                                </label>
                                <input type="date" id="end-date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-neutral-text-primary">Itens</h3>
                            <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-primary font-semibold hover:text-primary-dark"><Plus size={16} /> Adicionar Item</button>
                        </div>
                        <div className="bg-neutral-card-alt/50 rounded-lg border border-gray-200">
                             {selectedItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhum item adicionado.
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 bg-neutral-card-alt text-neutral-text-secondary font-semibold text-sm">
                                        <span>Equipamento</span>
                                        <span className="text-right">Valor (R$)</span>
                                        <span></span>
                                    </div>
                                    <div className="space-y-2 p-2">
                                        {selectedItems.map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center bg-white p-2 rounded">
                                                <input
                                                    list={`equipment-list-${idx}`}
                                                    placeholder="Digite para buscar..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                                    value={item.equipmentName}
                                                    onChange={(e) => {
                                                        const newItems = [...selectedItems];
                                                        newItems[idx] = { ...newItems[idx], equipmentName: e.target.value, equipmentId: '' }; // Invalidate id on typing
                                                        setSelectedItems(newItems);

                                                        const selectedEq = allEquipment.find(eq => eq.name === e.target.value);
                                                        if (selectedEq) {
                                                            handleItemEquipmentSelect(idx, selectedEq);
                                                        }
                                                    }}
                                                />
                                                 <datalist id={`equipment-list-${idx}`}>
                                                    {allEquipment.map(eq => (
                                                        <option key={eq.id} value={eq.name} />
                                                    ))}
                                                </datalist>
                                                <input 
                                                    type="number" 
                                                    className="w-32 px-3 py-2 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                                    value={item.value}
                                                    onChange={(e) => handleItemValueChange(idx, parseFloat(e.target.value))}
                                                    onFocus={(e) => e.target.select()}
                                                />
                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4 border-t">
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Forma de Pagamento (Seleção)</label>
                                <select 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                    onChange={e => { if(e.target.value) setPaymentMethod(e.target.value) }}
                                    value={""}
                                >
                                    <option value="">Selecione para preencher...</option>
                                    {paymentOptions.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Forma de Pagamento (Personalizado)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 50% Sinal + 50% Entrega"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-3 p-4 rounded-lg bg-white border border-gray-200">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-neutral-text-secondary">Frete (R$)</label>
                                <input type="number" className="w-32 p-1.5 border border-gray-300 rounded text-right bg-white text-neutral-text-primary" value={freightCost} onChange={e => setFreightCost(e.target.value)} placeholder="0.00"/>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-neutral-text-secondary">Acessórios (R$)</label>
                                <input type="number" className="w-32 p-1.5 border border-gray-300 rounded text-right bg-white text-neutral-text-primary" value={accessoriesCost} onChange={e => setAccessoriesCost(e.target.value)} placeholder="0.00"/>
                            </div>
                           <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-accent-danger">Desconto</label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as '%' | 'R$')}
                                        className="text-xs border border-gray-300 rounded h-6 px-1 bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="R$">R$</option>
                                        <option value="%">%</option>
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    className="w-32 p-1.5 border border-gray-300 rounded text-right bg-white text-accent-danger"
                                    value={discount}
                                    onChange={e => setDiscount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                                <span className="font-bold text-lg text-neutral-text-primary">Total</span>
                                <span className="font-bold text-lg text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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