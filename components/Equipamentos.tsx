import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Equipment, EquipmentStatus, EquipmentCategory, RentalHistoryItem, MaintenanceRecord } from '../types';
import AddEquipmentModal from './AddEquipmentModal';
import EquipmentDetailDrawer from './EquipmentDetailDrawer';

const rentalHistoryData: RentalHistoryItem[] = [
    { id: 'RENT-001', client: 'Construtora Alfa', startDate: '2024-06-05', endDate: '2024-06-15' },
    { id: 'RENT-002', client: 'Engenharia Beta', startDate: '2024-07-20', endDate: '2024-08-05' },
     { id: 'RENT-003', client: 'Obras Gamma', startDate: '2024-05-10', endDate: '2024-05-25' },
];

const maintenanceHistoryData: MaintenanceRecord[] = [
    { id: 'MAINT-001', type: 'Preventiva', date: '2024-06-25', description: 'Troca de óleo e filtros', cost: 850.00 },
    { id: 'MAINT-002', type: 'Corretiva', date: '2024-07-10', description: 'Reparo no sistema hidráulico', cost: 2500.00 },
];


const equipmentData: Equipment[] = [
    { id: 'EQP-001', name: 'Escavadeira CAT 320D', category: 'Escavadeiras', serialNumber: 'CAT320D-12345', status: 'Disponível', location: 'Pátio A', rentalHistory: rentalHistoryData, maintenanceHistory: maintenanceHistoryData },
    { id: 'EQP-002', name: 'Betoneira CSM 400L', category: 'Betoneiras', serialNumber: 'CSM400-67890', status: 'Em Uso', location: 'Obra Central' },
    { id: 'EQP-003', name: 'Guindaste Liebherr LTM 1050', category: 'Guindastes', serialNumber: 'LTM1050-11223', status: 'Manutenção', location: 'Oficina' },
    { id: 'EQP-004', name: 'Andaimes Tubulares (Lote 20)', category: 'Andaimes', serialNumber: 'AND-L20-33445', status: 'Disponível', location: 'Pátio B' },
    { id: 'EQP-005', name: 'Escavadeira Komatsu PC200', category: 'Escavadeiras', serialNumber: 'KPC200-54321', status: 'Disponível', location: 'Pátio A', rentalHistory: [{id: 'RENT-010', client: 'Projetos Delta', startDate: '2024-07-01', endDate: '2024-07-08'}] },
    { id: 'EQP-006', name: 'Betoneira Menegotti 150L', category: 'Betoneiras', serialNumber: 'MEN150-09876', status: 'Manutenção', location: 'Oficina', maintenanceHistory: [{ id: 'MAINT-005', type: 'Preventiva', date: '2024-07-22', description: 'Revisão geral', cost: 1200.00 }] },
];

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

const Equipamentos: React.FC<{ onOpenQuoteModal: (equipment: Equipment) => void }> = ({ onOpenQuoteModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'Todos'>('Todos');
    const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'Todas'>('Todas');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const filteredEquipment = useMemo(() => {
        return equipmentData.filter(eq => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'Todos' || eq.status === statusFilter;
            const categoryMatch = categoryFilter === 'Todas' || eq.category === categoryFilter;

            return searchMatch && statusMatch && categoryMatch;
        });
    }, [searchTerm, statusFilter, categoryFilter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    // FIX: Explicitly type variants with Variants to fix type error.
    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <>
            <AnimatePresence>
                {isAddModalOpen && <AddEquipmentModal onClose={() => setAddModalOpen(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                 {selectedEquipment && <EquipmentDetailDrawer equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} onOpenQuoteModal={onOpenQuoteModal} />}
            </AnimatePresence>
            <div className="p-6 md:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-text-primary">Inventário de Equipamentos</h2>
                        <p className="text-neutral-text-secondary mt-1">Gerencie e monitore sua frota.</p>
                    </div>
                    <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors mt-4 md:mt-0">
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
                                <th className="p-4">Categoria</th>
                                <th className="p-4 hidden md:table-cell">N° de Série</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 hidden sm:table-cell">Localização</th>
                            </tr>
                        </thead>
                        <motion.tbody variants={containerVariants}>
                            {filteredEquipment.map(eq => (
                                <motion.tr 
                                    key={eq.id} 
                                    className="border-b border-neutral-card-alt hover:bg-neutral-bg cursor-pointer" 
                                    variants={itemVariants}
                                    onClick={() => setSelectedEquipment(eq)}
                                >
                                    <td className="p-4 font-semibold text-neutral-text-primary">{eq.name}</td>
                                    <td className="p-4 text-neutral-text-secondary">{eq.category}</td>
                                    <td className="p-4 text-neutral-text-secondary hidden md:table-cell">{eq.serialNumber}</td>
                                    <td className="p-4"><StatusBadge status={eq.status} /></td>
                                    <td className="p-4 text-neutral-text-secondary hidden sm:table-cell">{eq.location}</td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                     {filteredEquipment.length === 0 && (
                        <div className="text-center p-8 text-neutral-text-secondary">
                            <p>Nenhum equipamento encontrado com os filtros selecionados.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default Equipamentos;