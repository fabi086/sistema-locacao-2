import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building, Mail, Phone, Globe, MapPin, Search, Loader2, Save } from 'lucide-react';
import { CompanySettings } from '../types';

interface CompanySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: CompanySettings;
    onSave: (settings: CompanySettings) => void;
}

const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState<CompanySettings>(currentSettings);
    const [isCepLoading, setIsCepLoading] = useState(false);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);

    const handleInputChange = (field: keyof CompanySettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field: keyof CompanySettings['address'], value: string) => {
        setSettings(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const handleCepSearch = async () => {
        const cleanedCep = settings.address.cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) return;
        
        setIsCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setSettings(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        } finally {
            setIsCepLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 } };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose })}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() })}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">Dados da Empresa</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors"><X size={20} /></button>
                </header>
                
                <div className="p-8 flex-1 overflow-y-auto">
                    <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Identificação */}
                        <div>
                            <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-4 border-b pb-1">Identificação</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Nome Fantasia / Razão Social</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input 
                                            type="text" 
                                            required 
                                            value={settings.name} 
                                            onChange={(e) => handleInputChange('name', e.target.value)} 
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">CNPJ</label>
                                    <input 
                                        type="text" 
                                        value={settings.document} 
                                        onChange={(e) => handleInputChange('document', e.target.value)} 
                                        placeholder="00.000.000/0001-00" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contato */}
                        <div>
                            <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-4 border-b pb-1">Contato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Telefone / WhatsApp</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input 
                                            type="text" 
                                            value={settings.phone} 
                                            onChange={(e) => handleInputChange('phone', e.target.value)} 
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Email Geral</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input 
                                            type="email" 
                                            value={settings.email} 
                                            onChange={(e) => handleInputChange('email', e.target.value)} 
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Website (Opcional)</label>
                                    <div className="relative">
                                        <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input 
                                            type="text" 
                                            value={settings.website || ''} 
                                            onChange={(e) => handleInputChange('website', e.target.value)} 
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div>
                            <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-4 border-b pb-1">Endereço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">CEP</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={settings.address.cep} 
                                            onChange={(e) => handleAddressChange('cep', e.target.value)} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                        />
                                        <button type="button" onClick={handleCepSearch} className="p-2 bg-neutral-card-alt border border-gray-300 rounded-lg hover:bg-gray-200">
                                            {isCepLoading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Logradouro</label>
                                    <input 
                                        type="text" 
                                        value={settings.address.street} 
                                        onChange={(e) => handleAddressChange('street', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Número</label>
                                    <input 
                                        type="text" 
                                        value={settings.address.number} 
                                        onChange={(e) => handleAddressChange('number', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Complemento</label>
                                    <input 
                                        type="text" 
                                        value={settings.address.complement || ''} 
                                        onChange={(e) => handleAddressChange('complement', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Bairro</label>
                                    <input 
                                        type="text" 
                                        value={settings.address.neighborhood} 
                                        onChange={(e) => handleAddressChange('neighborhood', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">Cidade</label>
                                    <input 
                                        type="text" 
                                        value={settings.address.city} 
                                        onChange={(e) => handleAddressChange('city', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-neutral-text-primary mb-1">UF</label>
                                    <input 
                                        type="text" 
                                        maxLength={2} 
                                        value={settings.address.state} 
                                        onChange={(e) => handleAddressChange('state', e.target.value)} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-text-primary" 
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button form="company-form" type="submit" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        <Save size={18} />
                        Salvar Dados
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default CompanySettingsModal;