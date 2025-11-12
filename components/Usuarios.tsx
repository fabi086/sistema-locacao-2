import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { User, UserStatus, UserRole } from '../types';

const statusColors: Record<UserStatus, string> = {
    'Ativo': 'bg-accent-success/10 text-accent-success',
    'Inativo': 'bg-gray-500/10 text-gray-600',
};

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

interface UsuariosProps {
    users: User[];
    onAdd: () => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ users, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'Todos'>('Todos');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'Todos'>('Todos');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || user.status === statusFilter;
            const roleMatch = roleFilter === 'Todos' || user.role === roleFilter;

            return searchMatch && statusMatch && roleMatch;
        });
    }, [searchTerm, statusFilter, roleFilter, users]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <div className="p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-text-primary">Usuários</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie os acessos e permissões da equipe.</p>
                </div>
                 <button onClick={onAdd} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                    <Plus size={16} />
                    <span>Novo Usuário</span>
