import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building, FileText, Mail, Phone, MapPin, Search, Loader2 } from 'lucide-react';
import { Customer } from '../types';

interface AddClientModalProps {
    onClose: () => void;
    onSave: (clientData: Omit<Customer, 'id' | 'status'> | Customer) => void;
    clientToEdit?: Customer | null;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave, clientToEdit }) => {
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    // Address fields
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');
    
    const isEditing = !!clientToEdit;

    const resetAddressFields = () => {
        setStreet('');
        setNeighborhood('');
        setCity('');
        setState('');
    };

    const handleCepSearch = async () => {
        const cleanedCep = cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) {
            setCepError('CEP inválido. Deve conter 8 dígitos.');
            return;
        }
        
        setIsCepLoading(true);
        setCepError('');
        resetAddressFields();
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            if (!response.ok) {
                throw new Error('Não foi possível buscar o CEP.');
            }
            const data = await response.json();
            if (data.erro) {
                throw new Error('CEP não encontrado.');
            }
            setStreet(data.logradouro);
            setNeighborhood(data.bairro);
            setCity(data.localidade);
            setState(data.uf);
        } catch (error: any) {
            setCepError(error.message);
        } finally {
            setIsCepLoading(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            setName(clientToEdit.name);
            setDocument(clientToEdit.document);
            setEmail(clientToEdit.email);
            setPhone(clientToEdit.phone);
            setCep(clientToEdit.cep || '');
            setStreet(clientToEdit.street || '');
            setNumber(clientToEdit.number || '');
            setComplement(clientToEdit.complement || '');
            setNeighborhood(clientToEdit.neighborhood || '');
            setCity(clientToEdit.city || '');
            setState(clientToEdit.state || '');
        } else {
            // Reset all fields for new client
            setName('');
            setDocument('');
            setEmail('');
            setPhone('');
            setCep('');
            resetAddressFields();
            setNumber('');
            setComplement('');
        }
    }, [clientToEdit, isEditing]);

    const handleSubmit = () => {
        if (!name || !document) {
            alert('Nome e Documento são obrigatórios.');
            return;
        }
        
        const commonData = { name, document, email, phone, cep, street, number, complement, neighborhood, city, state };
        const clientData = isEditing
            ? { ...clientToEdit, ...commonData }
            : commonData;

        onSave(clientData as Omit<Customer, 'id' | 'status'> | Customer);
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
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose, "aria-modal": "true", role: "dialog" } as any)}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="client-name" className="block text-sm font-semibold text-neutral-text-primary mb-2">Nome do Cliente</label>
                            <div className="relative"><Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="text" id="client-name" placeholder="Ex: Construtora Alfa" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" /></div>
                        </div>
                        <div>
                            <label htmlFor="client-document" className="block text-sm font-semibold text-neutral-text-primary mb-2">CNPJ / CPF</label>
                            <div className="relative"><FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="text" id="client-document" placeholder="00.000.000/0001-00" value={document} onChange={e => setDocument(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" /></div>
                        </div>
                         <div>
                           <label htmlFor="client-email" className="block text-sm font-semibold text-neutral-text-primary mb-2">Email de Contato</label>
                             <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="email" id="client-email" placeholder="contato@empresa.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" /></div>
                        </div>
                         <div>
                           <label htmlFor="client-phone" className="block text-sm font-semibold text-neutral-text-primary mb-2">Telefone</label>
                             <div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="tel" id="client-phone" placeholder="(11) 98765-4321" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" /></div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold text-neutral-text-primary mb-4">Endereço</h3>
                        <div>
                            <label htmlFor="client-cep" className="block text-sm font-semibold text-neutral-text-primary mb-2">CEP</label>
                            <div className="flex gap-2">
                                <div className="relative flex-grow"><MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" /><input type="text" id="client-cep" placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" /></div>
                                <button onClick={handleCepSearch} disabled={isCepLoading} className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center w-32 disabled:opacity-50">
                                    {isCepLoading ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} className="mr-2"/> Buscar</>}
                                </button>
                            </div>
                            {cepError && <p className="text-red-500 text-sm mt-1">{cepError}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div className="md:col-span-2">
                                <label htmlFor="client-street" className="block text-sm font-semibold text-neutral-text-primary mb-2">Rua / Logradouro</label>
                                <input type="text" id="client-street" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                            <div>
                                <label htmlFor="client-number" className="block text-sm font-semibold text-neutral-text-primary mb-2">Número</label>
                                <input type="text" id="client-number" value={number} onChange={e => setNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div>
                                <label htmlFor="client-complement" className="block text-sm font-semibold text-neutral-text-primary mb-2">Complemento</label>
                                <input type="text" id="client-complement" placeholder="Apto, Bloco, etc." value={complement} onChange={e => setComplement(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="client-neighborhood" className="block text-sm font-semibold text-neutral-text-primary mb-2">Bairro</label>
                                <input type="text" id="client-neighborhood" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div className="md:col-span-2">
                                <label htmlFor="client-city" className="block text-sm font-semibold text-neutral-text-primary mb-2">Cidade</label>
                                <input type="text" id="client-city" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                            <div>
                                <label htmlFor="client-state" className="block text-sm font-semibold text-neutral-text-primary mb-2">Estado (UF)</label>
                                <input type="text" id="client-state" maxLength={2} value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white" />
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default AddClientModal;