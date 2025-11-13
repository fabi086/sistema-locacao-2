import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Customer, CustomerStatus } from '../types';

const statusColors: Record<CustomerStatus, string> = {
    'Ativo': 'bg-accent-success/10 text-accent-success',
    'Inativo': 'bg-gray-500/10 text-gray-600',
};

const StatusBadge: React.FC<{ status: CustomerStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

interface ClientesProps {
    clients: Customer[];
    onOpenAddClientModal: () => void;
    onEdit: (client: Customer) => void;
    onDelete: (client: Customer) => void;
}

const Clientes: React.FC<ClientesProps> = ({ clients, onOpenAddClientModal, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.document.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatch;
        });
    }, [searchTerm, clients]);

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
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Clientes</h2>
                    <p className="text-neutral-text-secondary mt-1">Gerencie sua base de clientes.</p>
                </div>
                <button onClick={onOpenAddClientModal} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                    <Plus size={16} />
                    <span>Novo Cliente</span>
                </button>
            </header>
            
            <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CNPJ/CPF..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                            <th className="p-4 hidden sm:table-cell">Contato</th>
                            <th className="p-4 hidden md:table-cell">Endereço</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants}>
                        {filteredClients.map(client => (
                            <motion.tr 
                                key={client.id} 
                                className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                variants={itemVariants}
                            >
                                <td className="p-4 font-semibold text-neutral-text-primary">{client.name}</td>
                                <td className="p-4 text-neutral-text-secondary hidden sm:table-cell">
                                    <div>{client.email}</div>
                                    <div>{client.phone}</div>
                                </td>
                                <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{client.address}</td>
                                <td className="p-4"><StatusBadge status={client.status} /></td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onEdit(client)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(client)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredClients.length === 0 && (
                    <div className="text-center p-8 text-neutral-text-secondary">
                        <p>Nenhum cliente encontrado.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Clientes;