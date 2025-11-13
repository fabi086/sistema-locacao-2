import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import PlaceholderPage from './components/PlaceholderPage';
import Equipamentos from './components/Equipamentos';
import QuoteModal from './components/QuoteModal';
import Locacao from './components/Locacao';
import Contratos from './components/Contratos';
import Clientes from './components/Clientes';
import Agenda from './components/Agenda';
import Manutencao from './components/Manutencao';
import Usuarios from './components/Usuarios';
import AddClientModal from './components/AddClientModal';
import { Equipment, Customer, User, RentalOrder, RentalStatus, MaintenanceOrder, MaintenanceStatus } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, Settings, HardHat, LogOut, ChevronLeft, LayoutDashboard, Menu } from 'lucide-react';
import AddEquipmentModal from './components/AddEquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import Configuracoes from './components/Configuracoes';
import AddUserModal from './components/AddUserModal';
import PriceTableModal from './components/PriceTableModal';
import ScheduleDeliveryModal from './components/ScheduleDeliveryModal';
import AddMaintenanceModal from './components/AddMaintenanceModal';
import QuotePrintModal from './components/QuotePrintModal';
import Login from './components/Login';

const initialEquipment: Equipment[] = [
    { id: 'EQP-001', name: 'Escavadeira CAT 320D', category: 'Escavadeiras', serialNumber: 'CAT-12345', status: 'Disponível', location: 'Pátio A', pricing: { daily: 1200, weekly: 7000, biweekly: 13000, monthly: 24000 } },
    { id: 'EQP-002', name: 'Betoneira CSM 400L', category: 'Betoneiras', serialNumber: 'CSM-67890', status: 'Em Uso', location: 'Obra Beta', pricing: { daily: 150, weekly: 900, biweekly: 1600, monthly: 3000 } },
    { id: 'EQP-003', name: 'Guindaste Liebherr LTM 1050', category: 'Guindastes', serialNumber: 'LTM-11223', status: 'Manutenção', location: 'Oficina', pricing: { daily: 2500, weekly: 15000, biweekly: 28000, monthly: 50000 } },
    { id: 'EQP-004', name: 'Andaimes Tubulares (Lote 20)', category: 'Andaimes', serialNumber: 'AND-L20', status: 'Disponível', location: 'Pátio B', pricing: { daily: 50, weekly: 300, biweekly: 550, monthly: 1000 } },
    { id: 'EQP-005', name: 'Escavadeira Komatsu PC200', category: 'Escavadeiras', serialNumber: 'KOM-54321', status: 'Disponível', location: 'Pátio A', pricing: { daily: 1100, weekly: 6500, biweekly: 12000, monthly: 22000 } },
    { id: 'EQP-006', name: 'Betoneira Menegotti 150L', category: 'Betoneiras', serialNumber: 'MEN-98765', status: 'Disponível', location: 'Pátio C', pricing: { daily: 100, weekly: 600, biweekly: 1100, monthly: 2000 } }
];

const initialClients: Customer[] = [
    { id: 'CLI-001', name: 'Construtora Alfa', document: '11.111.111/0001-11', email: 'contato@alfa.com', phone: '(11) 99999-1111', address: 'Rua das Obras, 1', status: 'Ativo' },
    { id: 'CLI-002', name: 'Engenharia Beta', document: '22.222.222/0001-22', email: 'contato@beta.com', phone: '(11) 99999-2222', address: 'Av. Principal, 2', status: 'Ativo' },
    { id: 'CLI-003', name: 'Obras Gamma', document: '33.333.333/0001-33', email: 'contato@gamma.com', phone: '(11) 99999-3333', address: 'Praça Central, 3', status: 'Inativo' },
    { id: 'CLI-004', name: 'Projetos Delta', document: '44.444.444/0001-44', email: 'contato@delta.com', phone: '(11) 99999-4444', address: 'Estrada Longa, 4', status: 'Ativo' }
];

const initialUsers: User[] = [
    { id: 'USR-001', name: 'Admin Geral', email: 'admin@constructflow.com', role: 'Admin', status: 'Ativo', lastLogin: '2024-07-29' },
    { id: 'USR-002', name: 'Carlos Comercial', email: 'carlos@constructflow.com', role: 'Comercial', status: 'Ativo', lastLogin: '2024-07-29' },
    { id: 'USR-003', name: 'Fernanda Financeiro', email: 'fernanda@constructflow.com', role: 'Financeiro', status: 'Inativo', lastLogin: '2024-06-15' }
];

const initialRentalOrders: RentalOrder[] = [
    { id: 'ORC-001', client: 'Construtora Alfa', equipmentItems: [{ equipmentId: 'EQP-001', equipmentName: 'Escavadeira CAT 320D', value: 15000 }], startDate: '2024-07-31', endDate: '2024-08-11', value: 15000, status: 'Aprovado', statusHistory: [{ status: 'Proposta', date: '2024-07-25' }, { status: 'Aprovado', date: '2024-07-26' }], createdDate: '2024-07-25', validUntil: '2024-08-09' },
    { id: 'ORC-002', client: 'Engenharia Beta', equipmentItems: [{ equipmentId: 'EQP-002', equipmentName: 'Betoneira CSM 400L', value: 2500 }], startDate: '2024-08-04', endDate: '2024-08-09', value: 2500, status: 'Reservado', deliveryDate: '2024-08-03', statusHistory: [{ status: 'Proposta', date: '2024-07-28' }, { status: 'Aprovado', date: '2024-07-29' }, { status: 'Reservado', date: '2024-07-30' }], createdDate: '2024-07-28', validUntil: '2024-08-12' },
    { id: 'ORC-003', client: 'Obras Gamma', equipmentItems: [{ equipmentId: 'EQP-003', equipmentName: 'Guindaste Liebherr LTM 1050', value: 25000 }], startDate: '2024-08-15', endDate: '2024-08-25', value: 25000, status: 'Ativo', deliveryDate: '2024-08-15', statusHistory: [{ status: 'Proposta', date: '2024-08-01' }, { status: 'Aprovado', date: '2024-08-02' }, { status: 'Reservado', date: '2024-08-05' }, { status: 'Em Rota', date: '2024-08-15' }, { status: 'Ativo', date: '2024-08-15' }], createdDate: '2024-08-01', validUntil: '2024-08-16' },
    { id: 'ORC-004', client: 'Projetos Delta', equipmentItems: [{ equipmentId: 'EQP-004', equipmentName: 'Andaimes Tubulares (Lote 20)', value: 7500 }], startDate: '2024-08-14', endDate: '2024-09-12', value: 7500, status: 'Proposta', statusHistory: [{ status: 'Proposta', date: '2024-08-05' }], createdDate: '2024-08-05', validUntil: '2024-08-20' }
];

const initialMaintenanceOrders: MaintenanceOrder[] = [
    { id: 'OS-001', equipment: 'Escavadeira CAT 320D', type: 'Corretiva', status: 'Concluída', cost: 2500.00, scheduledDate: '2024-07-10' },
    { id: 'OS-002', equipment: 'Guindaste Liebherr LTM 1050', type: 'Preventiva', status: 'Em Andamento', cost: 1200.00, scheduledDate: '2024-08-10' },
    { id: 'OS-003', equipment: 'Betoneira CSM 400L', type: 'Preventiva', status: 'Pendente', cost: 450.00, scheduledDate: '2024-08-15' },
    { id: 'OS-004', equipment: 'Betoneira Menegotti 150L', type: 'Corretiva', status: 'Concluída', cost: 780.50, scheduledDate: '2024-07-22' },
    { id: 'OS-005', equipment: 'Escavadeira Komatsu PC200', type: 'Preventiva', status: 'Pendente', cost: 900.00, scheduledDate: '2024-08-20' },
];


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

type Page = typeof navItems[number]['label'] | 'Configurações' | 'Integrações';


const Sidebar: React.FC<{ 
    activePage: Page; 
    setActivePage: (page: Page) => void; 
    onLogout: () => void; 
    isOpen: boolean; 
    setIsOpen: (isOpen: boolean) => void; 
}> = ({ activePage, setActivePage, onLogout, isOpen, setIsOpen }) => {
    
    const handleNavigation = (page: Page) => {
        setActivePage(page);
        setIsOpen(false); // Close sidebar on navigation
    };
    
    const handleLogoutClick = () => {
        onLogout();
        setIsOpen(false);
    };

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-30 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
             <aside className={`w-64 bg-primary text-white flex flex-col fixed inset-y-0 left-0 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <HardHat size={28} className="text-secondary"/>
                         <h1 className="text-xl font-bold">ConstructFlow</h1>
                    </div>
                     <button className="p-1 rounded-full bg-primary-dark/50 hover:bg-primary-dark transition-colors md:hidden" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
                        <ChevronLeft size={16} />
                     </button>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1">
                    {navItems.map((item) => (
                        <button 
                            key={item.label} 
                            onClick={() => handleNavigation(item.label as Page)}
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
                        onClick={() => handleNavigation('Configurações')}
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
                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-dark/50 text-gray-200 text-sm font-semibold transition-colors text-left">
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activePage, setActivePage] = useState<Page>('Agenda');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Client State Management
    const [clients, setClients] = useState<Customer[]>(initialClients);
    const [isAddEditClientModalOpen, setAddEditClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Customer | null>(null);
    const [isDeleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Customer | null>(null);
    
    // Equipment State Management
    const [allEquipment, setAllEquipment] = useState<Equipment[]>(initialEquipment);
    const [isAddEditEquipmentModalOpen, setAddEditEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isDeleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    // User State Management
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isAddEditUserModalOpen, setAddEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Unified Rental Order State Management
    const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>(initialRentalOrders);
    const [isAddEditOrderModalOpen, setAddEditOrderModalOpen] = useState(false);
    const [equipmentForOrder, setEquipmentForOrder] = useState<Equipment | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<RentalOrder | null>(null);
    const [isDeleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<RentalOrder | null>(null);
    const [isScheduleDeliveryModalOpen, setScheduleDeliveryModalOpen] = useState(false);
    const [orderToSchedule, setOrderToSchedule] = useState<RentalOrder | null>(null);
    const [orderToPrint, setOrderToPrint] = useState<RentalOrder | null>(null);

    // Maintenance State Management
    const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>(initialMaintenanceOrders);
    const [isAddEditMaintenanceModalOpen, setAddEditMaintenanceModalOpen] = useState(false);
    const [maintenanceOrderToEdit, setMaintenanceOrderToEdit] = useState<MaintenanceOrder | null>(null);
    const [isDeleteMaintenanceModalOpen, setDeleteMaintenanceModalOpen] = useState(false);
    const [maintenanceOrderToDelete, setMaintenanceOrderToDelete] = useState<MaintenanceOrder | null>(null);

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
            setClients(prev => prev.map(c => c.id === clientData.id ? { ...c, ...clientData } : c));
        } else { // Create
            const maxId = clients.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1])), 0);
            const newId = `CLI-${(maxId + 1).toString().padStart(3, '0')}`;
            const newClient: Customer = { ...clientData, id: newId, status: 'Ativo' };
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
    
    const handleSaveEquipment = (equipmentData: Omit<Equipment, 'id'> | Equipment) => {
        if ('id' in equipmentData && equipmentData.id) { // Update
            setAllEquipment(prev => prev.map(eq => eq.id === equipmentData.id ? { ...eq, ...equipmentData } as Equipment : eq));
        } else { // Create
            const maxId = allEquipment.reduce((max, eq) => Math.max(max, parseInt(eq.id.split('-')[1])), 0);
            const newId = `EQP-${(maxId + 1).toString().padStart(3, '0')}`;
            const newEquipment: Equipment = { ...(equipmentData as Omit<Equipment, 'id'>), id: newId, status: 'Disponível' };
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
            setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
        } else { // Create
             const maxId = users.reduce((max, u) => Math.max(max, parseInt(u.id.split('-')[1])), 0);
             const newId = `USR-${(maxId + 1).toString().padStart(3, '0')}`;
             const newUser: User = { ...userData, id: newId, lastLogin: new Date().toISOString() };
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

    const handleSavePrices = (updatedEquipmentList: Equipment[]) => {
        setAllEquipment(updatedEquipmentList);
        setPriceTableModalOpen(false);
    };

    // Rental Order Handlers
    const handleSaveOrder = (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder, onSuccess?: (savedOrder: RentalOrder) => void) => {
        if ('id' in orderData && orderData.id) { // Update
            setRentalOrders(prev => prev.map(o => o.id === orderData.id ? { ...o, ...orderData } : o));
            handleCloseOrderModal(); // Close on edit
        } else { // Create
            const maxId = rentalOrders.reduce((max, q) => Math.max(max, parseInt(q.id.split('-')[1] || '0')), 0);
            const newId = `ORC-${(maxId + 1).toString().padStart(3, '0')}`;
            const newOrder: RentalOrder = {
                ...(orderData as Omit<RentalOrder, 'id' | 'status' | 'statusHistory'>),
                id: newId,
                status: 'Proposta',
                statusHistory: [{ status: 'Proposta', date: orderData.createdDate }]
            };
            setRentalOrders(prev => [newOrder, ...prev]);
            if (onSuccess) {
                onSuccess(newOrder);
            } else {
                handleCloseOrderModal(); // Fallback to close if no success handler
            }
        }
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
        setRentalOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                return {
                    ...order,
                    status: newStatus,
                    statusHistory: [...order.statusHistory, { status: newStatus, date: new Date().toISOString() }]
                };
            }
            return order;
        }));
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
        setRentalOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const updatedOrder = {
                    ...o,
                    deliveryDate,
                    status: 'Reservado' as RentalStatus,
                    statusHistory: [...o.statusHistory, { status: 'Reservado' as RentalStatus, date: new Date().toISOString() }]
                };
                return updatedOrder;
            }
            return o;
        }));
        handleCloseScheduleDeliveryModal();
    };
    
    // Maintenance Handlers
    const handleOpenAddMaintenanceModal = () => {
        setMaintenanceOrderToEdit(null);
        setAddEditMaintenanceModalOpen(true);
    };

    const handleOpenEditMaintenanceModal = (order: MaintenanceOrder) => {
        setMaintenanceOrderToEdit(order);
        setAddEditMaintenanceModalOpen(true);
    };

    const handleSaveMaintenanceOrder = (orderData: Omit<MaintenanceOrder, 'id'> | MaintenanceOrder) => {
        if ('id' in orderData && orderData.id) { // Update
            setMaintenanceOrders(prev => prev.map(o => o.id === orderData.id ? { ...o, ...orderData } as MaintenanceOrder : o));
        } else { // Create
            const maxId = maintenanceOrders.reduce((max, o) => Math.max(max, parseInt(o.id.split('-')[1])), 0);
            const newId = `OS-${(maxId + 1).toString().padStart(3, '0')}`;
            const newOrder: MaintenanceOrder = { ...(orderData as Omit<MaintenanceOrder, 'id'>), id: newId };
            setMaintenanceOrders(prev => [newOrder, ...prev]);
        }
        setAddEditMaintenanceModalOpen(false);
        setMaintenanceOrderToEdit(null);
    };

    const handleOpenDeleteMaintenanceModal = (order: MaintenanceOrder) => {
        setMaintenanceOrderToDelete(order);
        setDeleteMaintenanceModalOpen(true);
    };

    const handleDeleteMaintenanceOrder = () => {
        if (maintenanceOrderToDelete) {
            setMaintenanceOrders(prev => prev.filter(o => o.id !== maintenanceOrderToDelete.id));
            setDeleteMaintenanceModalOpen(false);
            setMaintenanceOrderToDelete(null);
        }
    };

    const handleUpdateMaintenanceStatus = (orderId: string, newStatus: MaintenanceStatus) => {
        setMaintenanceOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    // Print Handler
    const handleOpenPrintModal = (order: RentalOrder) => setOrderToPrint(order);
    const handleClosePrintModal = () => setOrderToPrint(null);

    // Auth Handlers
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
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
                            onOpenPrintModal={handleOpenPrintModal}
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
                return <Agenda rentalOrders={rentalOrders} maintenanceOrders={maintenanceOrders} />;
            case 'Manutenção':
                return <Manutencao 
                            maintenanceOrders={maintenanceOrders} 
                            onAdd={handleOpenAddMaintenanceModal}
                            onEdit={handleOpenEditMaintenanceModal}
                            onDelete={handleOpenDeleteMaintenanceModal}
                            onUpdateStatus={handleUpdateMaintenanceStatus}
                        />;
            case 'Usuários':
                return <Usuarios 
                            users={users}
                            onAdd={handleOpenAddUserModal}
                            onEdit={handleOpenEditUserModal}
                            onDelete={handleOpenDeleteUserModal}
                        />;
            case 'Configurações':
                return <Configuracoes onOpenPriceTableModal={handleOpenPriceTableModal} setActivePage={setActivePage} />;
            default:
                return <PlaceholderPage title={activePage} />;
        }
    };
    
    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="h-screen font-sans text-neutral-text-primary bg-neutral-bg">
            <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                onLogout={handleLogout} 
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <main className="flex-1 md:ml-64 overflow-y-auto">
                 {/* Mobile Header */}
                <header className="sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b md:hidden flex items-center justify-between z-20">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2" aria-label="Abrir menu">
                        <Menu size={24} className="text-neutral-text-primary" />
                    </button>
                    <div className="flex items-center gap-2">
                         <HardHat size={24} className="text-secondary"/>
                         <h1 className="text-lg font-bold text-primary">ConstructFlow</h1>
                    </div>
                    <div className="w-8"></div> {/* Spacer to balance the header */}
                </header>
                {renderContent()}
                <AnimatePresence>
                    {isAddEditOrderModalOpen && <QuoteModal 
                        onClose={handleCloseOrderModal} 
                        equipment={equipmentForOrder} 
                        orderToEdit={orderToEdit}
                        clients={clients}
                        onSave={handleSaveOrder}
                        allEquipment={allEquipment}
                        onOpenPrintModal={handleOpenPrintModal}
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
                <AnimatePresence>
                    {isAddEditMaintenanceModalOpen && <AddMaintenanceModal
                        onClose={() => setAddEditMaintenanceModalOpen(false)}
                        onSave={handleSaveMaintenanceOrder}
                        maintenanceOrderToEdit={maintenanceOrderToEdit}
                        allEquipment={allEquipment}
                    />}
                </AnimatePresence>
                <AnimatePresence>
                    {isDeleteMaintenanceModalOpen && maintenanceOrderToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteMaintenanceModalOpen}
                            onClose={() => setDeleteMaintenanceModalOpen(false)}
                            onConfirm={handleDeleteMaintenanceOrder}
                            title="Confirmar Exclusão de OS"
                            message={`Tem certeza de que deseja excluir a Ordem de Serviço "${maintenanceOrderToDelete.id}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
                </AnimatePresence>
                 <AnimatePresence>
                    {orderToPrint && <QuotePrintModal quote={orderToPrint} onClose={handleClosePrintModal} />}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;