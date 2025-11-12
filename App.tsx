import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import PlaceholderPage from './components/PlaceholderPage';
import Equipamentos from './components/Equipamentos';
import QuoteModal from './components/QuoteModal';
import Locacao from './components/Locacao';
import Contratos from './components/Contratos';
import Orcamentos from './components/Orcamentos';
import Clientes from './components/Clientes';
import Agenda from './components/Agenda';
import Manutencao from './components/Manutencao';
import Usuarios from './components/Usuarios';
import AddClientModal from './components/AddClientModal';
import { Equipment, Customer, RentalHistoryItem, MaintenanceRecord } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, Settings, HardHat, LogOut, ChevronLeft, LayoutDashboard, FilePlus2 } from 'lucide-react';
import AddEquipmentModal from './components/AddEquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import Configuracoes from './components/Configuracoes';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: HardHat, label: 'Equipamentos' },
    { icon: Truck, label: 'Locação' },
    { icon: FileText, label: 'Contratos' },
    { icon: FilePlus2, label: 'Orçamentos' },
    { icon: Building, label: 'Clientes' },
    { icon: Calendar, label: 'Agenda' },
    { icon: Wrench, label: 'Manutenção' },
    { icon: Users, label: 'Usuários' }
];

type Page = typeof navItems[number]['label'] | 'Configurações';

const customerData: Customer[] = [
    { id: 'CLI-001', name: 'Construtora Alfa', document: '12.345.678/0001-99', email: 'contato@alfa.com', phone: '(11) 98765-4321', status: 'Ativo' },
    { id: 'CLI-002', name: 'Engenharia Beta', document: '98.765.432/0001-11', email: 'financeiro@beta.eng.br', phone: '(21) 91234-5678', status: 'Ativo' },
    { id: 'CLI-003', name: 'Obras Gamma', document: '45.678.912/0001-33', email: 'compras@gamma.com.br', phone: '(31) 95678-1234', status: 'Inativo' },
];

const rentalHistoryData: RentalHistoryItem[] = [
    { id: 'RENT-001', client: 'Construtora Alfa', startDate: '2024-06-05', endDate: '2024-06-15' },
    { id: 'RENT-002', client: 'Engenharia Beta', startDate: '2024-07-20', endDate: '2024-08-05' },
    { id: 'RENT-003', client: 'Obras Gamma', startDate: '2024-05-10', endDate: '2024-05-25' },
];

const maintenanceHistoryData: MaintenanceRecord[] = [
    { id: 'MAINT-001', type: 'Preventiva', date: '2024-06-25', description: 'Troca de óleo e filtros', cost: 850.00 },
    { id: 'MAINT-002', type: 'Corretiva', date: '2024-07-10', description: 'Reparo no sistema hidráulico', cost: 2500.00 },
];

const initialEquipmentData: Equipment[] = [
    { id: 'EQP-001', name: 'Escavadeira CAT 320D', category: 'Escavadeiras', serialNumber: 'CAT320D-12345', status: 'Disponível', location: 'Pátio A', rentalHistory: rentalHistoryData, maintenanceHistory: maintenanceHistoryData },
    { id: 'EQP-002', name: 'Betoneira CSM 400L', category: 'Betoneiras', serialNumber: 'CSM400-67890', status: 'Em Uso', location: 'Obra Central' },
    { id: 'EQP-003', name: 'Guindaste Liebherr LTM 1050', category: 'Guindastes', serialNumber: 'LTM1050-11223', status: 'Manutenção', location: 'Oficina' },
    { id: 'EQP-004', name: 'Andaimes Tubulares (Lote 20)', category: 'Andaimes', serialNumber: 'AND-L20-33445', status: 'Disponível', location: 'Pátio B' },
    { id: 'EQP-005', name: 'Escavadeira Komatsu PC200', category: 'Escavadeiras', serialNumber: 'KPC200-54321', status: 'Disponível', location: 'Pátio A', rentalHistory: [{id: 'RENT-010', client: 'Projetos Delta', startDate: '2024-07-01', endDate: '2024-07-08'}] },
    { id: 'EQP-006', name: 'Betoneira Menegotti 150L', category: 'Betoneiras', serialNumber: 'MEN150-09876', status: 'Manutenção', location: 'Oficina', maintenanceHistory: [{ id: 'MAINT-005', type: 'Preventiva', date: '2024-07-22', description: 'Revisão geral', cost: 1200.00 }] },
];


const Sidebar: React.FC<{ activePage: Page; setActivePage: (page: Page) => void }> = ({ activePage, setActivePage }) => {
    return (
        <aside className="w-64 bg-primary text-white flex flex-col fixed h-full shadow-lg">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <HardHat size={28} className="text-secondary"/>
                     <h1 className="text-xl font-bold">ConstructFlow</h1>
                </div>
                 <button className="p-1 rounded-full bg-primary-dark/50 hover:bg-primary-dark transition-colors">
                    <ChevronLeft size={16} />
                 </button>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => (
                    <button 
                        key={item.label} 
                        onClick={() => setActivePage(item.label as Page)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-left ${
                            activePage === item.label
                            ? 'bg-secondary text-primary-dark' 
                            : 'hover:bg-primary-dark/50 text-gray-200'
                        }`}
                        aria-current={activePage === item.label ? 'page' : undefined}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-primary-dark/50">
                 <button 
                    onClick={() => setActivePage('Configurações')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-left ${
                        activePage === 'Configurações'
                        ? 'bg-secondary text-primary-dark' 
                        : 'hover:bg-primary-dark/50 text-gray-200'
                    }`}
                    aria-current={activePage === 'Configurações' ? 'page' : undefined}
                >
                    <Settings size={20} />
                    <span>Configurações</span>
                </button>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-dark/50 text-gray-200 text-sm font-semibold transition-colors">
                    <LogOut size={20} />
                    <span>Sair</span>
                </a>
            </div>
        </aside>
    );
};


const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('Equipamentos');
    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
    const [equipmentForQuote, setEquipmentForQuote] = useState<Equipment | null>(null);
    const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
    const [clients, setClients] = useState<Customer[]>(customerData);
    
    // Equipment State Management
    const [allEquipment, setAllEquipment] = useState<Equipment[]>(initialEquipmentData);
    const [isAddEditEquipmentModalOpen, setAddEditEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isDeleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    const handleOpenQuoteModal = (equipment: Equipment | null = null) => {
        setEquipmentForQuote(equipment);
        setQuoteModalOpen(true);
    };

    const handleCloseQuoteModal = () => {
        setQuoteModalOpen(false);
        setEquipmentForQuote(null);
    };

    const handleSaveClient = (newClient: Omit<Customer, 'id' | 'status'>) => {
        const newId = `CLI-${(clients.length + 1).toString().padStart(3, '0')}`;
        const clientToAdd: Customer = {
            ...newClient,
            id: newId,
            status: 'Ativo',
        };
        setClients(prevClients => [clientToAdd, ...prevClients]);
        setAddClientModalOpen(false);
    };
    
    // Equipment Handlers
    const handleOpenAddEquipmentModal = () => {
        setEquipmentToEdit(null);
        setAddEditEquipmentModalOpen(true);
    };

    const handleOpenEditEquipmentModal = (equipment: Equipment) => {
        setEquipmentToEdit(equipment);
        setAddEditEquipmentModalOpen(true);
    };
    
    const handleSaveEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
        if ('id' in equipmentData && equipmentData.id) { // Update
            setAllEquipment(prev => prev.map(eq => eq.id === (equipmentData as Equipment).id ? (equipmentData as Equipment) : eq));
        } else { // Create
            const newId = `EQP-${(allEquipment.length + 1).toString().padStart(3, '0')}`;
            const newEquipment: Equipment = {
                ...equipmentData,
                id: newId,
                status: 'Disponível', // Default status
            };
            setAllEquipment(prev => [newEquipment, ...prev]);
        }
        setAddEditEquipmentModalOpen(false);
        setEquipmentToEdit(null);
    };

    const handleOpenDeleteEquipmentModal = (equipment: Equipment) => {
        setEquipmentToDelete(equipment);
        setDeleteEquipmentModalOpen(true);
    };

    const handleDeleteEquipment = () => {
        if (equipmentToDelete) {
            setAllEquipment(prev => prev.filter(eq => eq.id !== equipmentToDelete.id));
            setDeleteEquipmentModalOpen(false);
            setEquipmentToDelete(null);
        }
    };

    const renderContent = () => {
        switch(activePage) {
            case 'Dashboard':
                return <Dashboard onOpenQuoteModal={handleOpenQuoteModal} />;
            case 'Equipamentos':
                return <Equipamentos 
                            equipment={allEquipment}
                            onOpenQuoteModal={handleOpenQuoteModal}
                            onAdd={handleOpenAddEquipmentModal}
                            onEdit={handleOpenEditEquipmentModal}
                            onDelete={handleOpenDeleteEquipmentModal}
                        />;
            case 'Locação':
                return <Locacao />;
            case 'Contratos':
                return <Contratos />;
            case 'Orçamentos':
                return <Orcamentos onOpenQuoteModal={handleOpenQuoteModal} />;
            case 'Clientes':
                return <Clientes clients={clients} onOpenAddClientModal={() => setAddClientModalOpen(true)} />;
            case 'Agenda':
                return <Agenda />;
            case 'Manutenção':
                return <Manutencao />;
            case 'Usuários':
                return <Usuarios />;
            case 'Configurações':
                return <Configuracoes />;
            default:
                return <PlaceholderPage title={activePage} />;
        }
    };

    return (
        <div className="flex h-screen font-sans text-neutral-text-primary bg-neutral-bg">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 ml-64 overflow-y-auto">
                {renderContent()}
                <AnimatePresence>
                    {isQuoteModalOpen && <QuoteModal onClose={handleCloseQuoteModal} equipment={equipmentForQuote} />}
                </AnimatePresence>
                 <AnimatePresence>
                    {isAddClientModalOpen && <AddClientModal onClose={() => setAddClientModalOpen(false)} onSave={handleSaveClient} />}
                </AnimatePresence>
                <AnimatePresence>
                    {isAddEditEquipmentModalOpen && <AddEquipmentModal onClose={() => setAddEditEquipmentModalOpen(false)} onSave={handleSaveEquipment} equipmentToEdit={equipmentToEdit} />}
                </AnimatePresence>
                <AnimatePresence>
                    {isDeleteEquipmentModalOpen && equipmentToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteEquipmentModalOpen}
                            onClose={() => setDeleteEquipmentModalOpen(false)}
                            onConfirm={handleDeleteEquipment}
                            title="Confirmar Exclusão"
                            message={`Tem certeza de que deseja excluir o equipamento "${equipmentToDelete.name}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;