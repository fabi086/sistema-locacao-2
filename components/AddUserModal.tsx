import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { X, User as UserIcon, Mail, Briefcase, Zap } from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';

interface AddUserModalProps {
    onClose: () => void;
    onSave: (userData: Omit<User, 'id' | 'lastLogin'> | User) => void;
    userToEdit?: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSave, userToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [status, setStatus] = useState<UserStatus>('Ativo');
    const isEditing = !!userToEdit;

    useEffect(() => {
        if (isEditing) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setStatus(userToEdit.status);
        } else {
            setName('');
            setEmail('');
            setRole('');
            setStatus('Ativo');
        }
    }, [userToEdit, isEditing]);

    const handleSubmit = () => {
        if (!name || !email || !role) {
            alert('Nome, Email e Papel são obrigatórios.');
            return;
        }
        
        const commonData = { name, email, role, status };
        const userData = isEditing
            ? { ...userToEdit, ...commonData }
            : commonData;

        onSave(userData as Omit<User, 'id' | 'lastLogin'> | User);
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
    
    const roles: UserRole[] = ['Admin', 'Comercial', 'Financeiro', 'Logística', 'Operador'];
    const statuses: UserStatus[] = ['Ativo', 'Inativo'];

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
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 bg-neutral-card border-b border-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-text-primary">{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </header>
                <div className="p-8 space-y-6">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-semibold text-neutral-text-primary mb-2">Nome Completo</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <input type="text" id="user-name" placeholder="Ex: João da Silva" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="user-email" className="block text-sm font-semibold text-neutral-text-primary mb-2">Email</label>
                         <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                            <input type="email" id="user-email" placeholder="joao.silva@empresa.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="user-role" className="block text-sm font-semibold text-neutral-text-primary mb-2">Papel</label>
                             <div className="relative">
                                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select id="user-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                    <option value="">Selecione...</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                           <label htmlFor="user-status" className="block text-sm font-semibold text-neutral-text-primary mb-2">Status</label>
                             <div className="relative">
                                <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <select id="user-status" value={status} onChange={e => setStatus(e.target.value as UserStatus)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white">
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-neutral-text-secondary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                        {isEditing ? 'Salvar Alterações' : 'Salvar Usuário'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default AddUserModal;