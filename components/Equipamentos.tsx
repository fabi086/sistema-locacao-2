import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Equipment, EquipmentStatus, EquipmentCategory } from '../types';
import EquipmentDetailDrawer from './EquipmentDetailDrawer';

const statusColors: Record<EquipmentStatus, string> = {
    'Disponível': 'bg-accent-success/10 text-accent-success',
    'Em Uso': 'bg-blue-500/10 text-blue-600',
    'Manutenção': 'bg-yellow-500/10 text-yellow-600',
};

const StatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
    </span>
);

interface EquipamentosProps {
    equipment: Equipment[];
    onOpenQuoteModal: (equipment: Equipment) => void;
    onAdd: () => void;
    onEdit: (equipment: Equipment) => void;
    onDelete: (equipment: Equipment) => void;
}

const Equipamentos: React.FC<EquipamentosProps> = ({ equipment, onOpenQuoteModal, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'Todos'>('Todos');
    const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'Todas'>('Todas');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const filteredEquipment = useMemo(() => {
        return equipment.filter(eq => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || eq.status === statusFilter;
            const categoryMatch = categoryFilter === 'Todas' || eq.category === categoryFilter;

            return searchMatch && statusMatch && categoryMatch;
        });
    }, [searchTerm, statusFilter, categoryFilter, equipment]);

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };
    
    const handleRowClick = (eq: Equipment) => {
        setSelectedEquipment(eq);
    };

    return (
        <>
            <AnimatePresence>
                 {selectedEquipment && <EquipmentDetailDrawer equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} onOpenQuoteModal={onOpenQuoteModal} />}
            </AnimatePresence>
            <div className="p-4 sm:p-6 md:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Inventário de Equipamentos</h2>
                        <p className="text-neutral-text-secondary mt-1">Gerencie e monitore sua frota.</p>
                    </div>
                    <button onClick={onAdd} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
                        <Plus size={16} />
                        <span>Adicionar Equipamento</span>
                    </button>
                </header>
                
                <div className="bg-neutral-card p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou n° de série..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:flex gap-4">
                         <select
                            className="w-full md:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'Todos')}
                         >
                            <option value="Todos">Todos Status</option>
                            <option value="Disponível">Disponível</option>
                            <option value="Em Uso">Em Uso</option>
                            <option value="Manutenção">Manutenção</option>
                        </select>
                        <select
                            className="w-full md:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-sm"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as EquipmentCategory | 'Todas')}
                        >
                            <option value="Todas">Todas Categorias</option>
                            <option value="Escavadeiras">Escavadeiras</option>
                            <option value="Betoneiras">Betoneiras</option>
                            <option value="Guindastes">Guindastes</option>
                            <option value="Andaimes">Andaimes</option>
                        </select>
                    </div>
                </div>

                {/* Table for Desktop */}
                <motion.div 
                    className="hidden md:block bg-neutral-card rounded-lg shadow-sm overflow-hidden"
                    {...({
                        initial: "hidden",
                        animate: "visible",
                        variants: containerVariants
                    } as any)}
                >
                    <table className="w-full text-left text-sm table-fixed">
                        <thead className="bg-neutral-card-alt text-neutral-text-secondary font-semibold">
                            <tr>
                                <th className="p-4 w-[35%]">Nome</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">N° de Série</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Localização</th>
                                <th className="p-4 text-center w-[80px]">Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody {...({ variants: containerVariants } as any)}>
                            {filteredEquipment.map(eq => (
                                <motion.tr 
                                    key={eq.id} 
                                    className="border-b border-neutral-card-alt hover:bg-neutral-bg" 
                                    {...({ variants: itemVariants } as any)}
                                >
                                    <td className="p-4 font-semibold text-neutral-text-primary cursor-pointer break-words" onClick={() => handleRowClick(eq)}>{eq.name}</td>
                                    <td className="p-4 text-neutral-text-secondary cursor-pointer break-words" onClick={() => handleRowClick(eq)}>{eq.category}</td>
                                    <td className="p-4 text-neutral-text-secondary cursor-pointer" onClick={() => handleRowClick(eq)}>{eq.serialNumber}</td>
                                    <td className="p-4 cursor-pointer" onClick={() => handleRowClick(eq)}><StatusBadge status={eq.status} /></td>
                                    <td className="p-4 text-neutral-text-secondary cursor-pointer" onClick={() => handleRowClick(eq)}>{eq.location}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onEdit(eq)} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => onDelete(eq)} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </motion.div>

                {/* Cards for Mobile */}
                <motion.div
                    className="block md:hidden space-y-4"
                    {...({
                        initial: "hidden",
                        animate: "visible",
                        variants: containerVariants
                    } as any)}
                >
                    {filteredEquipment.map(eq => (
                        <motion.div 
                            key={eq.id} 
                            className="bg-neutral-card rounded-lg shadow-sm p-4 border border-gray-200"
                             {...({ variants: itemVariants } as any)}
                             onClick={() => handleRowClick(eq)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-primary text-sm">{eq.name}</p>
                                    <p className="text-xs text-neutral-text-secondary">{eq.serialNumber}</p>
                                </div>
                                <StatusBadge status={eq.status} />
                            </div>
                            <div className="my-3 text-sm text-neutral-text-secondary flex justify-between items-center border-t border-b py-2">
                                <span><span className="font-semibold">Categoria:</span> {eq.category}</span>
                                <span><span className="font-semibold">Local:</span> {eq.location}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={(e) => {e.stopPropagation(); onEdit(eq)}} className="p-2 text-neutral-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); onDelete(eq)}} className="p-2 text-neutral-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredEquipment.length === 0 && (
                    <div className="text-center p-8 text-neutral-text-secondary bg-neutral-card rounded-lg shadow-sm">
                        <p>Nenhum equipamento encontrado com os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Equipamentos;