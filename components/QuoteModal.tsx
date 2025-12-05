import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Plus, Trash2, Search } from 'lucide-react';
import { RentalOrder, Equipment, Customer, EquipmentOrderItem } from '../types';

interface QuoteModalProps {
    onClose: () => void;
    equipment: Equipment | null;
    orderToEdit: RentalOrder | null;
    clients: Customer[];
    onSave: (orderData: any) => void;
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

        onSave(orderData);
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, y: 50, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 50, scale: 0.95 } };

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