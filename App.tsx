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
import { Equipment, Customer, RentalHistoryItem, MaintenanceRecord, User, Quote, QuoteStatus, RentalOrder, RentalStatus } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, Settings, HardHat, LogOut, ChevronLeft, LayoutDashboard, FilePlus2 } from 'lucide-react';
import AddEquipmentModal from './components/AddEquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import Configuracoes from './components/Configuracoes';
import AddUserModal from './components/AddUserModal';
import PriceTableModal from './components/PriceTableModal';
import ScheduleDeliveryModal from './components/ScheduleDeliveryModal';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: HardHat, label: 'Equipamentos' },
    { icon: Truck, label: 'Locação' },
    { icon: FileText, label: 'Contratos' },
    { icon: Building, label: 'Clientes' },
    { icon: Calendar, label: 'Agenda' },
    { icon: Wrench, label: 'Manutenção' },
    { icon: Users, label: 'Usuários' }
];

type Page = typeof navItems[number]['label'] | 'Configurações';

const customerData: Customer[] = [
    { id: 'CLI-004', name: 'maria', document: '123.456.789-10', email: 'fabio.net.sp@gmail.com', phone: '11966887073', address: 'rua manucaia 110', status: 'Ativo' },
    { id: 'CLI-001', name: 'Construtora Alfa', document: '12.345.678/0001-99', email: 'contato@alfa.com', phone: '(11) 98765-4321', address: 'Rua das Flores, 123, São Paulo, SP', status: 'Ativo' },
    { id: 'CLI-002', name: 'Engenharia Beta', document: '98.765.432/0001-11', email: 'financeiro@beta.eng.br', phone: '(21) 91234-5678', address: 'Avenida Principal, 456, Rio de Janeiro, RJ', status: 'Ativo' },
    { id: 'CLI-003', name: 'Obras Gamma', document: '45.678.912/0001-33', email: 'compras@gamma.com.br', phone: '(31) 95678-1234', address: 'Praça Central, 789, Belo Horizonte, MG', status: 'Inativo' },
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
    { id: 'EQP-001', name: 'Escavadeira CAT 320D', category: 'Escavadeiras', serialNumber: 'CAT320D-12345', status: 'Disponível', location: 'Pátio A', rentalHistory: rentalHistoryData, maintenanceHistory: maintenanceHistoryData, pricing: { daily: 1200, weekly: 7000, biweekly: 13000 } },
    { id: 'EQP-002', name: 'Betoneira CSM 400L', category: 'Betoneiras', serialNumber: 'CSM400-67890', status: 'Em Uso', location: 'Obra Central', pricing: { daily: 150, weekly: 900, biweekly: 1600 } },
    { id: 'EQP-003', name: 'Guindaste Liebherr LTM 1050', category: 'Guindastes', serialNumber: 'LTM1050-11223', status: 'Manutenção', location: 'Oficina', pricing: { daily: 2500, weekly: 15000, biweekly: 28000 } },
    { id: 'EQP-004', name: 'Andaimes Tubulares (Lote 20)', category: 'Andaimes', serialNumber: 'AND-L20-33445', status: 'Disponível', location: 'Pátio B', pricing: { daily: 50, weekly: 300, biweekly: 550 } },
    { id: 'EQP-005', name: 'Escavadeira Komatsu PC200', category: 'Escavadeiras', serialNumber: 'KPC200-54321', status: 'Disponível', location: 'Pátio A', rentalHistory: [{id: 'RENT-010', client: 'Projetos Delta', startDate: '2024-07-01', endDate: '2024-07-08'}], pricing: { daily: 1150, weekly: 6800, biweekly: 12500 } },
    { id: 'EQP-006', name: 'Betoneira Menegotti 150L', category: 'Betoneiras', serialNumber: 'MEN150-09876', status: 'Manutenção', location: 'Oficina', maintenanceHistory: [{ id: 'MAINT-005', type: 'Preventiva', date: '2024-07-22', description: 'Revisão geral', cost: 1200.00 }], pricing: { daily: 100, weekly: 600, biweekly: 1100 } },
];

const userData: User[] = [
    { id: 'USR-001', name: 'Admin Geral', email: 'admin@constructflow.com', role: 'Admin', status: 'Ativo', lastLogin: '2024-08-01' },
    { id: 'USR-002', name: 'João Silva', email: 'joao.silva@constructflow.com', role: 'Operador', status: 'Ativo', lastLogin: '2024-07-31' },
    { id: 'USR-003', name: 'Maria Souza', email: 'maria.souza@constructflow.com', role: 'Comercial', status: 'Ativo', lastLogin: '2024-08-01' },
    { id: 'USR-004', name: 'Carlos Pereira', email: 'carlos.p@constructflow.com', role: 'Logística', status: 'Inativo', lastLogin: '2024-06-15' },
    { id: 'USR-005', name: 'Ana Costa', email: 'ana.costa@constructflow.com', role: 'Financeiro', status: 'Ativo', lastLogin: '2024-07-29' },
    { id: 'USR-006', name: 'Pedro Martins', email: 'pedro.m@constructflow.com', role: 'Operador', status: 'Inativo', lastLogin: '2024-05-20' },
];

const initialQuoteData: Quote[] = [
    { id: 'ORC-001', client: 'Construtora Alfa', equipment: 'Escavadeira CAT 320D', startDate: '2024-08-01', endDate: '2024-08-12', createdDate: '2024-07-28', validUntil: '2024-08-12', value: 15000, status: 'Aprovado' },
    { id: 'ORC-002', client: 'Engenharia Beta', equipment: 'Betoneira CSM 400L', startDate: '2024-08-05', endDate: '2024-08-20', createdDate: '2024-07-25', validUntil: '2024-08-09', value: 2500, status: 'Pendente' },
    { id: 'ORC-003', client: 'Obras Gamma', equipment: 'Guindaste Liebherr LTM 1050', startDate: '2024-08-10', endDate: '2024-08-28', createdDate: '2024-07-22', validUntil: '2024-08-06', value: 45000, status: 'Recusado' },
    { id: 'ORC-004', client: 'Projetos Delta', equipment: 'Andaimes Tubulares (Lote 20)', startDate: '2024-08-15', endDate: '2024-09-13', createdDate: '2024-07-29', validUntil: '2024-08-13', value: 7500, status: 'Pendente' },
];

const otherStageOrdersData: RentalOrder[] = [
    { id: 'LOC-001-DEMO', client: 'Construtora Alfa', equipment: 'Escavadeira CAT 320D', startDate: '2024-08-01', endDate: '2024-08-15', value: 15000, status: 'Ativo', statusHistory: [ { status: 'Proposta', date: '2024-07-10' }, { status: 'Aprovado', date: '2024-07-12' }, { status: 'Reservado', date: '2024-07-15' }, { status: 'Em Rota', date: '2024-08-01' }, { status: 'Ativo', date: '2024-08-01' }], createdDate: '2024-07-10', validUntil: '2024-07-25'},
    { id: 'LOC-002-DEMO', client: 'Engenharia Beta', equipment: 'Betoneira CSM 400L', startDate: '2024-08-05', endDate: '2024-08-10', value: 2500, status: 'Reservado', statusHistory: [ { status: 'Proposta', date: '2024-07-20' }, { status: 'Aprovado', date: '2024-07-22' }, { status: 'Reservado', date: '2024-07-23' }], createdDate: '2024-07-20', validUntil: '2024-08-04'},
    { id: 'LOC-005-DEMO', client: 'Construtora Alfa', equipment: 'Escavadeira Komatsu PC200', startDate: '2024-07-20', endDate: '2024-07-28', value: 9800, status: 'Pendente de Pagamento', statusHistory: [ { status: 'Proposta', date: '2024-07-01' }, { status: 'Aprovado', date: '2024-07-02' }, { status: 'Reservado', date: '2024-07-05' }, { status: 'Em Rota', date: '2024-07-20' }, { status: 'Ativo', date: '2024-07-20' }, { status: 'Concluído', date: '2024-07-28' }, { status: 'Pendente de Pagamento', date: '2024-07-29' } ], createdDate: '2024-07-01', validUntil: '2024-07-16'},
    { id: 'LOC-006-DEMO', client: 'Engenharia Beta', equipment: 'Betoneira Menegotti 150L', startDate: '2024-08-12', endDate: '2024-08-18', value: 1800, status: 'Ativo', statusHistory: [ { status: 'Proposta', date: '2024-07-25' }, { status: 'Aprovado', date: '2024-07-28' }, { status: 'Reservado', date: '2024-08-01' }, { status: 'Em Rota', date: '2024-08-12' }, { status: 'Ativo', date: '2024-08-12' }], createdDate: '2024-07-25', validUntil: '2024-08-09' },
];

const initialRentalOrdersData: RentalOrder[] = [
    ...initialQuoteData
        .filter(q => q.status !== 'Recusado')
        .map((q): RentalOrder => ({
            ...q,
            status: q.status === 'Pendente' ? 'Proposta' : 'Aprovado',
            statusHistory: [{ status: q.status === 'Pendente' ? 'Proposta' : 'Aprovado', date: q.createdDate }]
        })),
    ...otherStageOrdersData
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
    const [activePage, setActivePage] = useState<Page>('Locação');
    
    // Client State Management
    const [clients, setClients] = useState<Customer[]>(customerData);
    const [isAddEditClientModalOpen, setAddEditClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Customer | null>(null);
    const [isDeleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Customer | null>(null);
    
    // Equipment State Management
    const [allEquipment, setAllEquipment] = useState<Equipment[]>(initialEquipmentData);
    const [isAddEditEquipmentModalOpen, setAddEditEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isDeleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    // User State Management
    const [users, setUsers] = useState<User[]>(userData);
    const [isAddEditUserModalOpen, setAddEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Unified Rental Order State Management
    const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>(initialRentalOrdersData);
    const [isAddEditOrderModalOpen, setAddEditOrderModalOpen] = useState(false);
    const [equipmentForOrder, setEquipmentForOrder] = useState<Equipment | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<RentalOrder | null>(null);
    const [isDeleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<RentalOrder | null>(null);
    const [isScheduleDeliveryModalOpen, setScheduleDeliveryModalOpen] = useState(false);
    const [orderToSchedule, setOrderToSchedule] = useState<RentalOrder | null>(null);


    // Pricing State Management
    const [isPriceTableModalOpen, setPriceTableModalOpen] = useState(false);


    const handleOpenOrderModal = (equipment: Equipment | null = null) => {
        setOrderToEdit(null);
        setEquipmentForOrder(equipment);
        setAddEditOrderModalOpen(true);
    };
    
    const handleOpenEditOrderModal = (order: RentalOrder) => {
        setOrderToEdit(order);
        setEquipmentForOrder(null);
        setAddEditOrderModalOpen(true);
    };

    const handleCloseOrderModal = () => {
        setAddEditOrderModalOpen(false);
        setEquipmentForOrder(null);
        setOrderToEdit(null);
    };
    
    // Client Handlers
    const handleOpenAddClientModal = () => {
        setClientToEdit(null);
        setAddEditClientModalOpen(true);
    };

    const handleOpenEditClientModal = (client: Customer) => {
        setClientToEdit(client);
        setAddEditClientModalOpen(true);
    };

    const handleSaveClient = (clientData: Omit<Customer, 'id' | 'status'> | Customer) => {
        if ('id' in clientData && clientData.id) { // Update
            setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
        } else { // Create
            const newId = `CLI-${(clients.length + 1).toString().padStart(3, '0')}`;
            const newClient: Customer = {
                ...clientData,
                id: newId,
                status: 'Ativo',
            };
            setClients(prev => [newClient, ...prev]);
        }
        setAddEditClientModalOpen(false);
        setClientToEdit(null);
    };
    
    const handleOpenDeleteClientModal = (client: Customer) => {
        setClientToDelete(client);
        setDeleteClientModalOpen(true);
    };
    
    const handleDeleteClient = () => {
        if (clientToDelete) {
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            setDeleteClientModalOpen(false);
            setClientToDelete(null);
        }
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

    // User Handlers
    const handleOpenAddUserModal = () => {
        setUserToEdit(null);
        setAddEditUserModalOpen(true);
    };

    const handleOpenEditUserModal = (user: User) => {
        setUserToEdit(user);
        setAddEditUserModalOpen(true);
    };

    const handleSaveUser = (userData: Omit<User, 'id' | 'lastLogin'> | User) => {
        if ('id' in userData && userData.id) { // Update
            setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
        } else { // Create
            const newId = `USR-${(users.length + 1).toString().padStart(3, '0')}`;
            const newUser: User = {
                ...userData,
                id: newId,
                lastLogin: new Date().toISOString().split('T')[0],
            };
            setUsers(prev => [newUser, ...prev]);
        }
        setAddEditUserModalOpen(false);
        setUserToEdit(null);
    };
    
    const handleOpenDeleteUserModal = (user: User) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };
    
    const handleDeleteUser = () => {
        if (userToDelete) {
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setDeleteUserModalOpen(false);
            setUserToDelete(null);
        }
    };
    
    // Pricing Handlers
    const handleOpenPriceTableModal = () => setPriceTableModalOpen(true);

    const handleSavePrices = (updatedEquipment: Equipment[]) => {
        setAllEquipment(updatedEquipment);
        setPriceTableModalOpen(false);
    };

    // Rental Order Handlers
    const handleSaveOrder = (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder) => {
        if ('id' in orderData && orderData.id) { // Update
            setRentalOrders(prev => prev.map(o => o.id === orderData.id ? orderData as RentalOrder : o));
        } else { // Create
            const maxIdNum = rentalOrders.reduce((max, q) => {
                const num = parseInt(q.id.split('-')[1]);
                return isNaN(num) ? max : Math.max(num, max);
            }, 0);
            const newId = `ORC-${(maxIdNum + 1).toString().padStart(3, '0')}`;
            const newOrder: RentalOrder = {
                ...(orderData as Omit<RentalOrder, 'id' | 'status' | 'statusHistory'>),
                id: newId,
                status: 'Proposta',
                statusHistory: [{ status: 'Proposta', date: orderData.createdDate }]
            };
            setRentalOrders(prev => [newOrder, ...prev]);
        }
        handleCloseOrderModal();
    };
    
    const handleOpenDeleteOrderModal = (order: RentalOrder) => {
        setOrderToDelete(order);
        setDeleteOrderModalOpen(true);
    };
    
    const handleDeleteOrder = () => {
        if (orderToDelete) {
            setRentalOrders(prev => prev.filter(q => q.id !== orderToDelete.id));
            setDeleteOrderModalOpen(false);
            setOrderToDelete(null);
        }
    };

    const handleUpdateOrderStatus = (orderId: string, newStatus: RentalStatus) => {
        setRentalOrders(prev => prev.map(o => o.id === orderId ? { 
            ...o, 
            status: newStatus,
            statusHistory: [...o.statusHistory, { status: newStatus, date: new Date().toISOString().split('T')[0]}]
        } : o));
    };

    const handleOpenScheduleDeliveryModal = (order: RentalOrder) => {
        setOrderToSchedule(order);
        setScheduleDeliveryModalOpen(true);
    };

    const handleCloseScheduleDeliveryModal = () => {
        setOrderToSchedule(null);
        setScheduleDeliveryModalOpen(false);
    };

    const handleSaveDeliveryDate = (orderId: string, deliveryDate: string) => {
        setRentalOrders(prev => prev.map(o => o.id === orderId ? {
            ...o,
            deliveryDate: deliveryDate,
            status: 'Reservado', // Move to next stage
            statusHistory: [...o.statusHistory, { status: 'Reservado', date: new Date().toISOString().split('T')[0]}]
        } : o));
        handleCloseScheduleDeliveryModal();
    };


    const renderContent = () => {
        switch(activePage) {
            case 'Dashboard':
                return <Dashboard onOpenQuoteModal={handleOpenOrderModal} />;
            case 'Equipamentos':
                return <Equipamentos 
                            equipment={allEquipment}
                            onOpenQuoteModal={handleOpenOrderModal}
                            onAdd={handleOpenAddEquipmentModal}
                            onEdit={handleOpenEditEquipmentModal}
                            onDelete={handleOpenDeleteEquipmentModal}
                        />;
            case 'Locação':
                return <Locacao 
                            orders={rentalOrders} 
                            onOpenAddModal={handleOpenOrderModal}
                            onEdit={handleOpenEditOrderModal}
                            onDelete={handleOpenDeleteOrderModal}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onOpenScheduleDeliveryModal={handleOpenScheduleDeliveryModal}
                        />;
            case 'Contratos':
                return <Contratos />;
            case 'Clientes':
                return <Clientes 
                            clients={clients} 
                            onOpenAddClientModal={handleOpenAddClientModal}
                            onEdit={handleOpenEditClientModal}
                            onDelete={handleOpenDeleteClientModal}
                        />;
            case 'Agenda':
                return <Agenda />;
            case 'Manutenção':
                return <Manutencao />;
            case 'Usuários':
                return <Usuarios 
                            users={users}
                            onAdd={handleOpenAddUserModal}
                            onEdit={handleOpenEditUserModal}
                            onDelete={handleOpenDeleteUserModal}
                        />;
            case 'Configurações':
                return <Configuracoes onOpenPriceTableModal={handleOpenPriceTableModal} />;
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
                    {isAddEditOrderModalOpen && <QuoteModal 
                        onClose={handleCloseOrderModal} 
                        equipment={equipmentForOrder} 
                        orderToEdit={orderToEdit}
                        clients={clients}
                        onSave={handleSaveOrder}
                        allEquipment={allEquipment}
                    />}
                </AnimatePresence>
                 <AnimatePresence>
                    {isAddEditClientModalOpen && <AddClientModal 
                        onClose={() => setAddEditClientModalOpen(false)} 
                        onSave={handleSaveClient}
                        clientToEdit={clientToEdit}
                    />}
                </AnimatePresence>
                <AnimatePresence>
                    {isDeleteClientModalOpen && clientToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteClientModalOpen}
                            onClose={() => setDeleteClientModalOpen(false)}
                            onConfirm={handleDeleteClient}
                            title="Confirmar Exclusão de Cliente"
                            message={`Tem certeza de que deseja excluir o cliente "${clientToDelete.name}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
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
                 <AnimatePresence>
                    {isAddEditUserModalOpen && <AddUserModal 
                        onClose={() => setAddEditUserModalOpen(false)} 
                        onSave={handleSaveUser}
                        userToEdit={userToEdit}
                    />}
                </AnimatePresence>
                <AnimatePresence>
                    {isDeleteUserModalOpen && userToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteUserModalOpen}
                            onClose={() => setDeleteUserModalOpen(false)}
                            onConfirm={handleDeleteUser}
                            title="Confirmar Exclusão de Usuário"
                            message={`Tem certeza de que deseja excluir o usuário "${userToDelete.name}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isDeleteOrderModalOpen && orderToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteOrderModalOpen}
                            onClose={() => setDeleteOrderModalOpen(false)}
                            onConfirm={handleDeleteOrder}
                            title="Confirmar Exclusão de Pedido"
                            message={`Tem certeza de que deseja excluir o pedido "${orderToDelete.id}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
                </AnimatePresence>
                 <AnimatePresence>
                    {isPriceTableModalOpen && <PriceTableModal 
                        equipment={allEquipment}
                        onClose={() => setPriceTableModalOpen(false)}
                        onSave={handleSavePrices}
                    />}
                </AnimatePresence>
                 <AnimatePresence>
                    {isScheduleDeliveryModalOpen && orderToSchedule && (
                        <ScheduleDeliveryModal
                            isOpen={isScheduleDeliveryModalOpen}
                            onClose={handleCloseScheduleDeliveryModal}
                            order={orderToSchedule}
                            onSave={handleSaveDeliveryDate}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;