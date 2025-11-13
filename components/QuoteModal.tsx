import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Building, HardHat, Calendar, CheckCircle, Printer, Share2, Plus, Trash2, Package, Percent, Truck } from 'lucide-react';
import { Equipment, Customer, RentalOrder, EquipmentOrderItem } from '../types';

interface QuoteModalProps {
    onClose: () => void;
    equipment?: Equipment | null;
    orderToEdit?: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder, onSuccess?: (savedOrder: RentalOrder) => void) => void;
    allEquipment: Equipment[];
    onOpenPrintModal: (order: RentalOrder) => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ onClose, equipment: preselectedEquipment, orderToEdit, clients, onSave, allEquipment, onOpenPrintModal }) => {
    const [client, setClient] = useState('');
    const [equipmentItems, setEquipmentItems] = useState<EquipmentOrderItem[]>([]);
    const [equipmentToAdd, setEquipmentToAdd] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [freightCost, setFreightCost] = useState('');
    const [accessoriesCost, setAccessoriesCost] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [savedOrder, setSavedOrder] = useState<RentalOrder | null>(null);
    
    const isEditing = !!orderToEdit;

    const calculateItemPrice = useCallback((start: string, end: string, equipment: Equipment | undefined): number => {
        if (!start || !end || !equipment?.pricing) return 0;

        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const [startYear, startMonth, startDay] = start.split('-').map(Number);
        const [endYear, endMonth, endDay] = end.split('-').map(Number);
        
        const utcStart = Date.UTC(startYear, startMonth - 1, startDay);
        const utcEnd = Date.UTC(endYear, endMonth - 1, endDay);
        
        if (isNaN(utcStart) || isNaN(utcEnd) || utcEnd < utcStart) return 0;

        let duration = Math.round(((utcEnd - utcStart) / MS_PER_DAY)) + 1;
        let itemCost = 0;
        const { monthly, biweekly, weekly, daily } = equipment.pricing;

        if (duration >= 30 && monthly) {
            itemCost += Math.floor(duration / 30) * monthly;
            duration %= 30;
        }
        if (duration >= 14 && biweekly) {
            itemCost += Math.floor(duration / 14) * biweekly;
            duration %= 14;
        }
        if (duration >= 7 && weekly) {
            itemCost += Math.floor(duration / 7) * weekly;
            duration %= 7;
        }
        itemCost += duration * daily;
        
        return itemCost;
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
            
            const sub = orderToEdit.value || 0;
            const disc = orderToEdit.discount || 0;
            const percentage = sub > 0 ? (disc / sub) * 100 : 0;
            setDiscountPercentage(percentage > 0 ? percentage.toFixed(2).replace(/\.00$/, '') : '');

        } else {
            setClient(clients.length > 0 ? clients[0].name : '');
            setEquipmentItems(preselectedEquipment ? [{ equipmentId: preselectedEquipment.id, equipmentName: preselectedEquipment.name, value: 0 }] : []);
            setStartDate('');
            setEndDate('');
            setFreightCost('');
            setAccessoriesCost('');
            setDiscountPercentage('');
        }
    }, [isEditing, orderToEdit, preselectedEquipment, clients]);
    
    // This effect recalculates item values when dates or items change
    const equipmentIds = useMemo(() => equipmentItems.map(item => item.equipmentId).join(','), [equipmentItems]);

    useEffect(() => {
        setEquipmentItems(prevItems => prevItems.map(item => {
            const equipmentDetails = allEquipment.find(eq => eq.id === item.equipmentId);
            const value = calculateItemPrice(startDate, endDate, equipmentDetails);
            return { ...item, value };
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
                setEquipmentItems([...equipmentItems, { equipmentId: equipment.id, equipmentName: equipment.name, value: 0 }]);
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
            equipmentItems, // This now includes per-item values
            startDate,
            endDate,
            value: subtotal,
            freightCost: parseFloat(freightCost) || undefined,
            accessoriesCost: parseFloat(accessoriesCost) || undefined,
            discount: discountAmount > 0 ? discountAmount : undefined,
        };
        
        if (isEditing) {
            onSave({ ...orderToEdit, ...commonData });
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

    const handleWhatsAppShare = () => {
        if (!savedOrder) return;
        const clientInfo = clients.find(c => c.name === savedOrder.client);
        if (!clientInfo || !clientInfo.phone) {
            alert('Número de telefone do cliente não encontrado para compartilhar via WhatsApp.');
            return;
        }
        
        const phoneNumber = clientInfo.phone.replace(/\D/g, '');
        const fullPhoneNumber = phoneNumber.length > 10 ? `55${phoneNumber}` : `55${phoneNumber}`;
        
        const equipmentList = savedOrder.equipmentItems.map(item => `- ${item.equipmentName}`).join('\n');
        const total = savedOrder.value + (savedOrder.freightCost || 0) + (savedOrder.accessoriesCost || 0) - (savedOrder.discount || 0);

        const message = `Olá ${savedOrder.client}, segue seu orçamento ${savedOrder.id}:\n\n` +
            `Equipamentos:\n${equipmentList}\n\n` +
            `Período: ${new Date(savedOrder.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(savedOrder.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}\n\n` +
            `Subtotal: R$ ${savedOrder.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
            (savedOrder.freightCost ? `Frete: R$ ${savedOrder.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            (savedOrder.accessoriesCost ? `Acessórios: R$ ${savedOrder.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            (savedOrder.discount ? `Desconto: - R$ ${savedOrder.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
            `*Valor Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
            `Agradecemos a preferência!\nConstructFlow`;
        
        const url = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handlePrint = () => {
        if (!savedOrder) return;
        onOpenPrintModal(savedOrder);
        onClose();
    };

    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Pedido' : 'Criar Novo Pedido/Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>

                {!savedOrder ? (
                    <>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="client" className="block text-sm font-semibold text-neutral-text-primary mb-2">Cliente</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <select id="client" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" value={client} onChange={(e) => setClient(e.target.value)}>
                                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>

                             <div>
                                <label className="block text-sm font-semibold text-neutral-text-primary mb-2">Equipamentos</label>
                                <div className="space-y-2">
                                    {equipmentItems.map(item => (
                                        <div key={item.equipmentId} className="flex items-center justify-between bg-neutral-card-alt p-2 rounded-lg">
                                            <span className="text-sm font-medium text-neutral-text-primary">{item.equipmentName}</span>
                                            <button onClick={() => handleRemoveEquipment(item.equipmentId)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                                 <div>
                                    <label htmlFor="freight" className="block text-sm font-semibold text-neutral-text-primary mb-2">Valor do Frete (R$)</label>
                                    <div className="relative"><Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="freight" placeholder="0,00" value={freightCost} onChange={e => setFreightCost(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                </div>
                                <div>
                                    <label htmlFor="accessories" className="block text-sm font-semibold text-neutral-text-primary mb-2">Acessórios (R$)</label>
                                    <div className="relative"><Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="accessories" placeholder="0,00" value={accessoriesCost} onChange={e => setAccessoriesCost(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                </div>
                                <div>
                                    <label htmlFor="discount" className="block text-sm font-semibold text-neutral-text-primary mb-2">Desconto (%)</label>
                                    <div className="relative"><Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="number" id="discount" placeholder="0" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-neutral-text-primary" /></div>
                                </div>
                            </div>
                            
                            <div className="bg-neutral-card-alt p-4 rounded-lg space-y-2">
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
                                <button onClick={handleWhatsAppShare} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm transition-colors"><Share2 size={16} />Compartilhar via WhatsApp</button>
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