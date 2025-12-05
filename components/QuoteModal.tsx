import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Building, HardHat, Calendar, CheckCircle, Printer, Share2, Plus, Trash2, Package, Percent, Truck, CreditCard, PieChart, MapPin, Loader2 } from 'lucide-react';
import { Equipment, Customer, RentalOrder, EquipmentOrderItem, PaymentStatus } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabaseClient';

interface QuoteModalProps {
    onClose: () => void;
    equipment?: Equipment | null;
    orderToEdit?: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder, onSuccess?: (savedOrder: RentalOrder) => void) => void;
    allEquipment: Equipment[];
    onOpenPrintModal: (order: RentalOrder) => void;
}

const paymentMethods = ['PIX', 'Boleto', 'Cartão de Crédito', 'Dinheiro'];
const paymentStatuses: PaymentStatus[] = ['Pendente', 'Sinal Pago', 'Pago', 'Vencido'];

const QuoteModal: React.FC<QuoteModalProps> = ({ onClose, equipment: preselectedEquipment, orderToEdit, clients, onSave, allEquipment, onOpenPrintModal }) => {
    const [client, setClient] = useState('');
    const [equipmentItems, setEquipmentItems] = useState<EquipmentOrderItem[]>([]);
    const [equipmentToAdd, setEquipmentToAdd] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [freightCost, setFreightCost] = useState('');
    const [accessoriesCost, setAccessoriesCost] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pendente');
    const [savedOrder, setSavedOrder] = useState<RentalOrder | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    
    const isEditing = !!orderToEdit;

    const selectedClientData = useMemo(() => clients.find(c => c.name === client), [client, clients]);

    const formatAddress = (c: Customer | undefined) => {
        if (!c || !c.street) return 'Endereço não cadastrado.';
        return `${c.street}, ${c.number || 's/n'} - ${c.neighborhood}, ${c.city}/${c.state}`;
    };

    const calculateItemPrice = useCallback((start: string, end: string, equipment: Equipment | undefined): number => {
        if (!start || !end || !equipment?.pricing) return 0;

        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const [startYear, startMonth, startDay] = start.split('-').map(Number);
        const [endYear, endMonth, endDay] = end.split('-').map(Number);
        
        const utcStart = Date.UTC(startYear, startMonth - 1, startDay);
        const utcEnd = Date.UTC(endYear, endMonth - 1, endDay);
        
        if (isNaN(utcStart) || isNaN(utcEnd) || utcEnd < utcStart) return 0;

        const duration = Math.round(((utcEnd - utcStart) / MS_PER_DAY)) + 1;
        
        const { monthly, biweekly, weekly, daily } = equipment.pricing;
        
        const pDaily = Number(daily) || 0;
        const pWeekly = Number(weekly) || 0;
        const pBiweekly = Number(biweekly) || 0; // Quinzenal = 15 dias
        const pMonthly = Number(monthly) || 0;

        // --- NOVA LÓGICA DE MELHOR PREÇO (BEST PRICE) ---
        if (duration <= 0) return 0;
        
        let remainingDays = duration;
        let totalCost = 0;

        const priceTiers = [
            { name: 'monthly', days: 30, price: pMonthly },
            { name: 'biweekly', days: 15, price: pBiweekly },
            { name: 'weekly', days: 7, price: pWeekly }
        ].filter(tier => tier.price > 0);

        if (priceTiers.length === 0 && pDaily > 0) {
            return duration * pDaily;
        }

        // Passo 1: Calcular o custo base usando a abordagem gulosa (do maior período para o menor)
        for (const tier of priceTiers) {
            const count = Math.floor(remainingDays / tier.days);
            if (count > 0) {
                totalCost += count * tier.price;
                remainingDays %= tier.days;
            }
        }
        totalCost += remainingDays * pDaily;

        // Passo 2: Otimizar - verificar se é mais barato usar o "teto" de um período maior
        let bestPrice = totalCost;

        // Compara o custo total com o próximo período maior se a duração for menor que o período do teto
        if (pWeekly > 0 && duration < 7 && bestPrice > pWeekly) {
            bestPrice = pWeekly;
        }
        if (pBiweekly > 0 && duration < 15 && bestPrice > pBiweekly) {
            bestPrice = pBiweekly;
        }
        if (pMonthly > 0 && duration < 30 && bestPrice > pMonthly) {
            bestPrice = pMonthly;
        }
        
        return bestPrice;
    }, []);
    
    // This effect initializes the form state
    useEffect(() => {
        setSavedOrder(null);
        if (isEditing) {
            setClient(orderToEdit.client);
            setEquipmentItems(orderToEdit.equipmentItems.map(item => ({...item, value: item.value || 0})));
            setStartDate(orderToEdit.startDate);
            setEndDate(orderToEdit.endDate);
            setFreightCost(orderToEdit.freightCost?.toString() ?? '');
            setAccessoriesCost(orderToEdit.accessoriesCost?.toString() ?? '');
            setPaymentMethod(orderToEdit.paymentMethod || '');
            setPaymentStatus(orderToEdit.paymentStatus || 'Pendente');
            
            const sub = orderToEdit.value || 0;
            const disc = orderToEdit.discount || 0;
            const percentage = sub > 0 ? (disc / sub) * 100 : 0;
            setDiscountPercentage(percentage > 0 ? percentage.toFixed(2).replace(/\.00$/, '') : '');

        } else {
            setClient(clients.length > 0 ? clients[0].name : '');
            if (preselectedEquipment) {
                 setEquipmentItems([{ equipmentId: preselectedEquipment.id, equipmentName: preselectedEquipment.name, value: 0 }]);
            } else {
                setEquipmentItems([]);
            }
            setStartDate('');
            setEndDate('');
            setFreightCost('');
            setAccessoriesCost('');
            setDiscountPercentage('');
            setPaymentMethod('');
            setPaymentStatus('Pendente');
        }
    }, [isEditing, orderToEdit, preselectedEquipment, clients]);
    
    // This effect recalculates item values when dates or items change
    const equipmentIds = useMemo(() => equipmentItems.map(item => item.equipmentId).join(','), [equipmentItems]);

    useEffect(() => {
        setEquipmentItems(prevItems => prevItems.map(item => {
            const equipmentDetails = allEquipment.find(eq => eq.id === item.equipmentId);
            const value = calculateItemPrice(startDate, endDate, equipmentDetails);
            if (item.value !== value) {
                return { ...item, value };
            }
            return item;
        }));
    }, [startDate, endDate, equipmentIds, allEquipment, calculateItemPrice]);
    
    const subtotal = useMemo(() => {
        return equipmentItems.reduce((acc, item) => acc + (item.value || 0), 0);
    }, [equipmentItems]);

    const discountAmount = useMemo(() => {
        const discPercent = parseFloat(discountPercentage) || 0;
        const safeDiscPercent = Math.max(0, discPercent);
        return (subtotal * safeDiscPercent) / 100;
    }, [subtotal, discountPercentage]);

    const totalValue = useMemo(() => {
        const freight = parseFloat(freightCost) || 0;
        const accessories = parseFloat(accessoriesCost) || 0;
        const safeFreight = Math.max(0, freight);
        const safeAccessories = Math.max(0, accessories);
        return subtotal + safeFreight + safeAccessories - discountAmount;
    }, [subtotal, freightCost, accessoriesCost, discountAmount]);


    const handleAddEquipment = () => {
        if (equipmentToAdd && !equipmentItems.some(item => item.equipmentId === equipmentToAdd)) {
            const equipment = allEquipment.find(eq => eq.id === equipmentToAdd);
            if (equipment) {
                const initialValue = calculateItemPrice(startDate, endDate, equipment);
                
                setEquipmentItems([...equipmentItems, { 
                    equipmentId: equipment.id, 
                    equipmentName: equipment.name, 
                    value: initialValue 
                }]);
                setEquipmentToAdd('');
            }
        }
    };

    const handleRemoveEquipment = (equipmentId: string) => {
        setEquipmentItems(items => items.filter(item => item.equipmentId !== equipmentId));
    };
    
    const availableEquipment = useMemo(() => {
        const selectedIds = new Set(equipmentItems.map(item => item.equipmentId));
        return allEquipment.filter(eq => !selectedIds.has(eq.id));
    }, [equipmentItems, allEquipment]);

    const handleSubmit = () => {
        if (!client || equipmentItems.length === 0 || !startDate || !endDate) {
            alert('Por favor, preencha os campos obrigatórios (Cliente, Equipamentos, Período).');
            return;
        }

        const commonData = {
            client,
            equipmentItems,
            startDate,
            endDate,
            value: subtotal,
            freightCost: parseFloat(freightCost) || undefined,
            accessoriesCost: parseFloat(accessoriesCost) || undefined,
            discount: discountAmount > 0 ? discountAmount : undefined,
            paymentMethod: paymentMethod || undefined,
            paymentStatus,
        };
        
        if (isEditing) {
            onSave({ ...orderToEdit, ...commonData } as RentalOrder);
        } else {
            const newOrderData = {
                ...commonData,
                createdDate: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
            onSave(newOrderData, (newlySavedOrder) => {
                setSavedOrder(newlySavedOrder);
            });
        }
    };

    const generatePdfBlob = async (quote: RentalOrder) => {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '0';
        element.style.width = '800px'; 
        element.style.backgroundColor = 'white';
        element.style.padding = '40px';
        
        const subtotal = quote.value;
        const total = subtotal + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);
        
        element.innerHTML = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <div style="border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #0A4C64; margin: 0;">ObraFácil</h1>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Orçamento #${quote.id}</p>
                </div>
                <div style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">Cliente</h3>
                    <p style="margin: 0; font-weight: bold;">${quote.client}</p>
                    <p style="margin: 5px 0; font-size: 14px;">Data: ${new Date(quote.createdDate).toLocaleDateString('pt-BR')}</p>
                    <p style="margin: 5px 0; font-size: 14px;">Período: ${new Date(quote.startDate).toLocaleDateString('pt-BR')} a ${new Date(quote.endDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.equipmentItems.map(item => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.equipmentName}</td>
                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">R$ ${(item.value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="text-align: right;">
                    <p style="margin: 5px 0;">Subtotal: R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    ${quote.freightCost ? `<p style="margin: 5px 0;">Frete: R$ ${quote.freightCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>` : ''}
                    ${quote.accessoriesCost ? `<p style="margin: 5px 0;">Acessórios: R$ ${quote.accessoriesCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>` : ''}
                    ${quote.discount ? `<p style="margin: 5px 0; color: red;">Desconto: - R$ ${quote.discount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>` : ''}
                    <h2 style="color: #0A4C64; margin-top: 10px;">Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                </div>
            </div>
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
            const clientInfo = clients.find(c => c.name === savedOrder.client);
            if (!clientInfo || !clientInfo.phone) {
                alert('Número de telefone do cliente não encontrado para compartilhar via WhatsApp.');
                return;
            }
            
            // 1. Gerar PDF
            const pdfBlob = await generatePdfBlob(savedOrder);
            
            // 2. Upload para Supabase Storage
            const fileName = `orcamento_${savedOrder.id}_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('quotes')
                .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });
            
            if (uploadError) throw uploadError;
            
            // 3. Obter Link Público
            const { data: { publicUrl } } = supabase.storage
                .from('quotes')
                .getPublicUrl(fileName);

            const phoneNumber = clientInfo.phone.replace(/\D/g, '');
            const fullPhoneNumber = phoneNumber.length > 10 ? `55${phoneNumber}` : `55${phoneNumber}`;
            
            const equipmentList = savedOrder.equipmentItems.map(item => `- ${item.equipmentName}`).join('\n');
            const total = savedOrder.value + (savedOrder.freightCost || 0) + (savedOrder.accessoriesCost || 0) - (savedOrder.discount || 0);

            const message = `Olá ${savedOrder.client}, segue seu orçamento ${savedOrder.id}:\n\n` +
                `*Baixe o PDF completo aqui:* ${publicUrl}\n\n` +
                `Equipamentos:\n${equipmentList}\n\n` +
                `Período: ${new Date(savedOrder.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(savedOrder.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}\n\n` +
                `Subtotal: R$ ${savedOrder.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                (savedOrder.freightCost ? `Frete: R$ ${savedOrder.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
                (savedOrder.accessoriesCost ? `Acessórios: R$ ${savedOrder.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
                (savedOrder.discount ? `Desconto: - R$ ${savedOrder.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
                `*Valor Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
                `Agradecemos a preferência!\nObraFácil`;
            
            const url = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } catch (error: any) {
            console.error("Erro ao compartilhar:", error);
            alert(`Erro ao gerar/enviar PDF: ${error.message || error}. Verifique se o bucket 'quotes' existe no Supabase Storage e é público.`);
        } finally {
            setIsSharing(false);
        }
    };

    const handlePrint = () => {
        if (!savedOrder) return;
        onOpenPrintModal(savedOrder);
        onClose();
    };

    const backdropVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: any = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            {...({
                variants: backdropVariants,
                initial: "hidden",
                animate: "visible",
                exit: "exit",
                onClick: onClose,
                "aria-modal": "true",
                role: "dialog"
            } as any)}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
                {...({
                    variants: modalVariants,
                    onClick: (e: any) => e.stopPropagation()
                } as any)}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Pedido' : 'Criar Novo Pedido/Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>

                {!savedOrder ? (
                    <>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            {/* Coluna da Esquerda */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="client" className="block text-sm font-semibold text-neutral-text-primary mb-2">Cliente</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <select id="client" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={client} onChange={(e) => setClient(e.target.value)}>
                                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    {selectedClientData && (
                                        <div className="mt-2 text-xs p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-start gap-2">
                                            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                                            <span>{formatAddress(selectedClientData)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="start-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Início</label>
                                        <div className="relative">
                                            <label htmlFor="start-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer" aria-label="Abrir calendário de início"><Calendar size={18} /></label>
                                            <input type="date" id="start-date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ colorScheme: 'light' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="end-date" className="block text-sm font-semibold text-neutral-text-primary mb-2">Data de Fim</label>
                                        <div className="relative">
                                            <label htmlFor="end-date" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary cursor-pointer" aria-label="Abrir calendário de fim"><Calendar size={18} /></label>
                                            <input type="date" id="end-date" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ colorScheme: 'light' }}/>
                                        </div>
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Equipamentos</label>
                                    <div className="space-y-2">
                                        {equipmentItems.map(item => (
                                            <div key={item.equipmentId} className="flex items-center justify-between bg-neutral-card p-2 rounded-lg">
                                                <span className="text-sm font-medium text-neutral-text-primary">{item.equipmentName}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-semibold text-neutral-text-secondary">
                                                        R$ {item.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <button onClick={() => handleRemoveEquipment(item.equipmentId)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        {equipmentItems.length === 0 && (
                                            <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-neutral-text-secondary text-sm">
                                                Nenhum equipamento adicionado.
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="relative flex-grow">
                                            <HardHat size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                            <select id="equipment" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={equipmentToAdd} onChange={(e) => setEquipmentToAdd(e.target.value)}>
                                                <option value="" disabled>Selecione para adicionar...</option>
                                                {availableEquipment.map(eq => (<option key={eq.id} value={eq.id}>{eq.name}</option>))}
                                            </select>
                                        </div>
                                        <button onClick={handleAddEquipment} className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"><Plus size={20}/></button>
                                    </div>
                                </div>
                            </div>
                            {/* Coluna da Direita */}
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                     <div className="sm:col-span-1">
                                        <label htmlFor="freight" className="block text-sm font-semibold text-neutral-text-primary mb-2">Frete (R$)</label>
                                        <div className="relative"><Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="freight" placeholder="0,00" value={freightCost} onChange={e => setFreightCost(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label htmlFor="accessories" className="block text-sm font-semibold text-neutral-text-primary mb-2">Acessórios (R$)</label>
                                        <div className="relative"><Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="accessories" placeholder="0,00" value={accessoriesCost} onChange={e => setAccessoriesCost(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label htmlFor="discount" className="block text-sm font-semibold text-neutral-text-primary mb-2">Desconto (%)</label>
                                        <div className="relative"><Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="discount" placeholder="0" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="payment-method" className="block text-sm font-semibold text-neutral-text-primary mb-2">Forma de Pagamento</label>
                                        <div className="relative">
                                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                            <select id="payment-method" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                <option value="">Selecione...</option>
                                                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="payment-status" className="block text-sm font-semibold text-neutral-text-primary mb-2">Status do Pagamento</label>
                                        <div className="relative">
                                            <PieChart size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                            <select id="payment-status" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                                                {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-neutral-card-alt p-4 rounded-lg space-y-2 mt-auto">
                                    <div className="flex justify-between items-center text-sm text-neutral-text-secondary"><span>Subtotal (Equipamentos):</span><span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center text-sm text-neutral-text-secondary"><span>Frete:</span><span>+ R$ {(parseFloat(freightCost) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center text-sm text-neutral-text-secondary"><span>Acessórios:</span><span>+ R$ {(parseFloat(accessoriesCost) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between items-center text-sm text-accent-danger"><span>Desconto:</span><span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="pt-2 border-t flex justify-between items-center">
                                        <span className="font-semibold text-neutral-text-primary">Valor Total Calculado:</span>
                                        <span className="text-2xl font-bold text-accent-success">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">Cancelar</button>
                            <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">{isEditing ? 'Salvar Alterações' : 'Salvar e Enviar'}</button>
                        </footer>
                    </>
                ) : (
                    <>
                        <div className="p-8 text-center flex flex-col items-center">
                             <div className="bg-accent-success/10 rounded-full w-16 h-16 flex items-center justify-center mb-4"><CheckCircle size={32} className="text-accent-success" /></div>
                            <h3 className="text-2xl font-bold text-neutral-text-primary">Orçamento Salvo!</h3>
                            <p className="text-neutral-text-secondary mt-2 mb-6">O orçamento <span className="font-semibold text-neutral-text-primary">{savedOrder.id}</span> foi criado com sucesso. O que você gostaria de fazer a seguir?</p>
                            <div className="w-full space-y-3 max-w-sm">
                                <button onClick={handleWhatsAppShare} disabled={isSharing} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm transition-colors disabled:opacity-70">
                                    {isSharing ? <Loader2 size={16} className="animate-spin"/> : <Share2 size={16} />}
                                    Compartilhar via WhatsApp
                                </button>
                                <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-neutral-text-primary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"><Printer size={16} />Imprimir / Gerar PDF</button>
                            </div>
                        </div>
                        <footer className="p-6 bg-neutral-card-alt flex justify-end items-center"><button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">Concluir</button></footer>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default QuoteModal;