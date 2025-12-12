import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, User, Trash2, CheckCircle, Search as SearchIcon, CreditCard, Plus, Calendar } from 'lucide-react';
import { RentalOrder, Equipment, Customer, EquipmentOrderItem } from '../types';

interface QuoteModalProps {
    onClose: () => void;
    equipment: Equipment | null;
    orderToEdit: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: any, onSuccess?: (savedOrder: RentalOrder) => void) => void;
    allEquipment: Equipment[];
    onOpenPrintModal: (order: RentalOrder) => void;
}

const paymentTypes = [
    "À Vista (Pix/Dinheiro)",
    "Boleto 15 dias",
    "Boleto 30 dias",
    "Cartão de Crédito",
    "Cartão de Débito",
    "50% Sinal + 50% Entrega",
    "30/60/90 dias",
    "Transferência Bancária"
];

const QuoteModal: React.FC<QuoteModalProps> = ({ 
    onClose, 
    equipment, 
    orderToEdit, 
    clients, 
    onSave, 
    allEquipment
}) => {
    const isEditing = !!orderToEdit;
    
    const [clientName, setClientName] = useState('');
    // Global dates (defaults for new items)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [selectedItems, setSelectedItems] = useState<EquipmentOrderItem[]>([]);
    const [freightCost, setFreightCost] = useState<string>('');
    const [accessoriesCost, setAccessoriesCost] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [discountType, setDiscountType] = useState<'money' | 'percent'>('money');
    const [paymentMethod, setPaymentMethod] = useState('');
    
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedOrder, setSavedOrder] = useState<RentalOrder | null>(null);

    // State for custom equipment search dropdown
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (orderToEdit) {
            setClientName(orderToEdit.client);
            setStartDate(orderToEdit.startDate);
            setEndDate(orderToEdit.endDate);
            // Ensure existing items have start/end dates if they were missing in old data
            const loadedItems = orderToEdit.equipmentItems.map(item => ({
                ...item,
                startDate: item.startDate || orderToEdit.startDate,
                endDate: item.endDate || orderToEdit.endDate
            }));
            setSelectedItems(loadedItems);
            setFreightCost(orderToEdit.freightCost?.toString() || '');
            setAccessoriesCost(orderToEdit.accessoriesCost?.toString() || '');
            setDiscount(orderToEdit.discount?.toString() || '');
            setPaymentMethod(orderToEdit.paymentMethod || '');
            setSavedOrder(orderToEdit);
        } else if (equipment) {
            if (selectedItems.length === 0) {
                // Initial load with a pre-selected equipment
                const initialItem = {
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                    value: equipment.pricing?.daily || 0,
                    startDate: startDate, // Will likely be empty initially, but good practice
                    endDate: endDate
                };
                setSelectedItems([initialItem]);
            }
        }
    }, [orderToEdit, equipment]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const calculatePrice = (eq: Equipment, start: string, end: string): number => {
        if (!start || !end || !eq.pricing) return eq.pricing?.daily || 0;

        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e.getTime() - s.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays <= 0) return 0;

        if (diffDays >= 30 && eq.pricing.monthly && eq.pricing.monthly > 0) {
             return eq.pricing.monthly; 
        } else if (diffDays >= 15 && eq.pricing.biweekly && eq.pricing.biweekly > 0) {
             return eq.pricing.biweekly; 
        } else if (diffDays >= 7 && eq.pricing.weekly && eq.pricing.weekly > 0) {
             return eq.pricing.weekly; 
        } else {
             return (eq.pricing.daily || 0) * diffDays; 
        }
    };

    // Update global date handlers to also update existing items
    const handleGlobalStartDateChange = (date: string) => {
        setStartDate(date);
        const updatedItems = selectedItems.map(item => {
            const newItem = { ...item, startDate: date };
            const eq = allEquipment.find(e => e.id === item.equipmentId);
            if (eq && date && newItem.endDate) {
                newItem.value = calculatePrice(eq, date, newItem.endDate);
            }
            return newItem;
        });
        setSelectedItems(updatedItems);
    };

    const handleGlobalEndDateChange = (date: string) => {
        setEndDate(date);
        const updatedItems = selectedItems.map(item => {
            const newItem = { ...item, endDate: date };
            const eq = allEquipment.find(e => e.id === item.equipmentId);
            if (eq && newItem.startDate && date) {
                newItem.value = calculatePrice(eq, newItem.startDate, date);
            }
            return newItem;
        });
        setSelectedItems(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);
    };

    const handleItemValueChange = (index: number, field: keyof EquipmentOrderItem, value: string) => {
        const newItems = [...selectedItems];
        const item = { ...newItems[index] };

        if (field === 'value') {
            item.value = parseFloat(value) || 0;
        } else if (field === 'startDate' || field === 'endDate') {
            (item as any)[field] = value;
            
            // Recalculate price if dates change
            const eq = allEquipment.find(e => e.id === item.equipmentId);
            const sDate = field === 'startDate' ? value : item.startDate;
            const eDate = field === 'endDate' ? value : item.endDate;

            if (eq && sDate && eDate) {
                item.value = calculatePrice(eq, sDate, eDate);
            }
        }

        newItems[index] = item;
        setSelectedItems(newItems);
    };

    const handleEquipmentSelect = (eq: Equipment) => {
        // Use global dates as default, or empty string
        const itemStart = startDate;
        const itemEnd = endDate;
        
        const price = calculatePrice(eq, itemStart, itemEnd);
        
        const newItem: EquipmentOrderItem = {
            equipmentId: eq.id,
            equipmentName: eq.name,
            value: price,
            startDate: itemStart,
            endDate: itemEnd
        };

        setSelectedItems([...selectedItems, newItem]);
        setSearchQuery('');
        setShowDropdown(false);
    };
    
    const filteredEquipment = allEquipment.filter(eq => {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = 
            eq.name.toLowerCase().includes(lowerQuery) || 
            eq.serialNumber.toLowerCase().includes(lowerQuery);
        const isNotSelected = !selectedItems.some(item => item.equipmentId === eq.id);
        return matchesSearch && isNotSelected;
    });

    const calculateTotal = () => {
        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        const freight = parseFloat(freightCost) || 0;
        const accessories = parseFloat(accessoriesCost) || 0;
        const subtotal = itemsTotal + freight + accessories;
        
        let calculatedDiscount = 0;
        const discountVal = parseFloat(discount) || 0;

        if (discountType === 'percent') {
            calculatedDiscount = (subtotal * discountVal) / 100;
        } else {
            calculatedDiscount = discountVal;
        }

        return Math.max(0, subtotal - calculatedDiscount);
    };

    const getFinalDiscountValue = () => {
        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        const freight = parseFloat(freightCost) || 0;
        const accessories = parseFloat(accessoriesCost) || 0;
        const subtotal = itemsTotal + freight + accessories;
        const discountVal = parseFloat(discount) || 0;

        if (discountType === 'percent') {
            return (subtotal * discountVal) / 100;
        }
        return discountVal;
    }

    const handlePaymentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected) {
            setPaymentMethod(selected);
        }
    };

    const handleSubmit = () => {
        if (!clientName) {
            alert("Preencha o cliente.");
            return;
        }
        if (selectedItems.length === 0) {
            alert("Adicione pelo menos um item.");
            return;
        }
        
        // Validation: All items must have dates
        const missingDates = selectedItems.some(item => !item.startDate || !item.endDate);
        if (missingDates) {
            alert("Por favor, preencha as datas de início e fim para todos os equipamentos.");
            return;
        }

        const itemsTotal = selectedItems.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
        const finalDiscount = getFinalDiscountValue();
        
        // If items have different dates, calculate global min/max for the order record
        let minStart = startDate;
        let maxEnd = endDate;

        if (selectedItems.length > 0) {
            const starts = selectedItems.map(i => i.startDate).sort();
            const ends = selectedItems.map(i => i.endDate).sort();
            minStart = starts[0] || startDate;
            maxEnd = ends[ends.length - 1] || endDate;
        }

        const orderData = {
            id: orderToEdit?.id,
            client: clientName,
            startDate: minStart, 
            endDate: maxEnd,
            equipmentItems: selectedItems,
            value: itemsTotal,
            freightCost: parseFloat(freightCost) || 0,
            accessoriesCost: parseFloat(accessoriesCost) || 0,
            discount: finalDiscount,
            paymentMethod,
            createdDate: orderToEdit?.createdDate || new Date().toISOString().split('T')[0],
            validUntil: orderToEdit?.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        onSave(orderData, (saved) => {
            setSavedOrder(saved);
            setShowSuccess(true);
        });
    };
    
    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 50, scale: 0.95 } };

    if (showSuccess) {
        return (
            <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit" } as any)}>
                <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center" {...({ variants: modalVariants } as any)}>
                    <div className="mx-auto bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
                    <p className="text-gray-600 mb-8">O orçamento foi salvo corretamente.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => {
                            setShowSuccess(false);
                            onClose();
                        }} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
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
                <header className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Orçamento / Pedido' : 'Novo Orçamento'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><X size={20} /></button>
                </header>
                
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    {/* Linha 1: Cliente e Datas Padrão */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900" value={clientName} onChange={e => setClientName(e.target.value)}>
                                    <option value="">Selecione o Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Início (Padrão)</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900" 
                                    value={startDate} 
                                    onChange={e => handleGlobalStartDateChange(e.target.value)}
                                    style={{ colorScheme: 'light' }} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Fim (Padrão)</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900" 
                                    value={endDate} 
                                    onChange={e => handleGlobalEndDateChange(e.target.value)} 
                                    style={{ colorScheme: 'light' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Linha 2: Itens e Busca */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Itens do Orçamento</h3>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 shadow-sm">
                            
                            {/* Lista de Itens Selecionados - Exibição Detalhada com Datas */}
                            {selectedItems.length === 0 ? (
                                <p className="text-center text-gray-400 py-4 italic">Nenhum item adicionado.</p>
                            ) : (
                                selectedItems.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 animate-fadeIn border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-800 font-bold text-md">{item.equipmentName}</p>
                                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Remover item"><Trash2 size={18} /></button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="relative">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Início</label>
                                                <input 
                                                    type="date"
                                                    value={item.startDate || ''}
                                                    onChange={(e) => handleItemValueChange(idx, 'startDate', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-primary"
                                                    style={{ colorScheme: 'light' }}
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Fim</label>
                                                <input 
                                                    type="date"
                                                    value={item.endDate || ''}
                                                    onChange={(e) => handleItemValueChange(idx, 'endDate', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-primary"
                                                    style={{ colorScheme: 'light' }}
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Valor (R$)</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-primary font-semibold"
                                                        value={item.value}
                                                        onChange={(e) => handleItemValueChange(idx, 'value', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Campo de Busca Inteligente */}
                            <div className="relative mt-4 pt-4 border-t border-gray-100" ref={searchRef}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Adicionar Equipamento</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text"
                                            placeholder="Digite nome ou número de série para buscar..."
                                            value={searchQuery}
                                            onChange={e => {
                                                setSearchQuery(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900 shadow-sm"
                                        />
                                    </div>
                                </div>
                                
                                {showDropdown && searchQuery && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredEquipment.length > 0 ? (
                                            filteredEquipment.map(eq => (
                                                <div 
                                                    key={eq.id} 
                                                    onClick={() => handleEquipmentSelect(eq)}
                                                    className="px-4 py-3 text-sm hover:bg-primary/5 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center group"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{eq.name}</p>
                                                        <p className="text-xs text-gray-500">Série: {eq.serialNumber}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${eq.status === 'Disponível' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{eq.status}</span>
                                                        <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Nenhum equipamento encontrado.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Linha 3: Pagamento e Totais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pagamento (Seleção)</label>
                                <div className="relative">
                                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                        onChange={handlePaymentSelect}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Selecione para preencher...</option>
                                        {paymentTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pagamento (Personalizado)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 50% Sinal + 50% Entrega"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">Frete (R$)</label>
                                <input 
                                    type="number" 
                                    className="w-32 p-2 border border-gray-300 rounded-md text-right bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary font-medium" 
                                    value={freightCost} 
                                    onChange={e => setFreightCost(e.target.value)} 
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">Acessórios (R$)</label>
                                <input 
                                    type="number" 
                                    className="w-32 p-2 border border-gray-300 rounded-md text-right bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary font-medium" 
                                    value={accessoriesCost} 
                                    onChange={e => setAccessoriesCost(e.target.value)} 
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-red-600">Desconto</label>
                                    <div className="flex bg-gray-100 rounded-md p-0.5">
                                        <button 
                                            onClick={() => setDiscountType('money')}
                                            className={`px-2 py-0.5 text-xs font-bold rounded ${discountType === 'money' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                                        >R$</button>
                                        <button 
                                            onClick={() => setDiscountType('percent')}
                                            className={`px-2 py-0.5 text-xs font-bold rounded ${discountType === 'percent' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                                        >%</button>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    className="w-32 p-2 border border-red-200 rounded-md text-right bg-white text-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium placeholder-red-200" 
                                    value={discount} 
                                    onChange={e => setDiscount(e.target.value)} 
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                                <span className="font-bold text-xl text-gray-800">Total</span>
                                <span className="font-bold text-xl text-primary">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-gray-50 flex justify-end items-center gap-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">Salvar Orçamento</button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuoteModal;