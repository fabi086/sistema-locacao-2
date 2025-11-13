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
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Usuários</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie os acessos e permissões da equipe.</p>
                </div>
                 <button onClick={onAdd} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                    <Plus size={16} />
                    <span>Novo Usuário</span>
                </button>
            </header>
            
            <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex gap-4">
                     <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'Todos')}
                     >
                        <option value="Todos">Todos Papéis</option>
                        <option value="Admin">Admin</option>
                        <option value="Operador">Operador</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Logística">Logística</option>
                        <option value="Financeiro">Financeiro</option>
                    </select>
                     <select
                        className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'Todos')}
                     >
                        <option value="Todos">Todos Status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                </div>
            </div>

            <motion.div 
                className="bg-neutral-card rounded-lg shadow-sm overflow-x-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4 hidden sm:table-cell">Email</th>
                            <th className="p-4 hidden md:table-cell">Papel</th>
                            <th className="p-4 hidden lg:table-cell">Último Acesso</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants}>
                        {filteredUsers.map(user => (
                            <motion.tr 
                                key={user.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                variants={itemVariants}
                            >
                                <td className="p-4 font-semibold text-neutral-text-primary">{user.name}</td>
                                <td className="p-4 text-neutral-text-secondary hidden sm:table-cell">{user.email}</td>
                                <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{user.role}</td>
                                <td className="p-4 text-neutral-text-secondary hidden lg:table-cell">{new Date(user.lastLogin + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-4"><StatusBadge status={user.status} /></td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEdit(user)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(user)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredUsers.length === 0 && (
                    <div className="text-center p-8 text-neutral-text-secondary">
                        <p>Nenhum usuário encontrado com os filtros selecionados.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Usuarios;