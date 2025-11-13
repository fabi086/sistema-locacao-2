import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
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
import { Equipment, Customer, User, RentalOrder, RentalStatus } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, Settings, HardHat, LogOut, ChevronLeft, LayoutDashboard } from 'lucide-react';
import AddEquipmentModal from './components/AddEquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import Configuracoes from './components/Configuracoes';
import AddUserModal from './components/AddUserModal';
import PriceTableModal from './components/PriceTableModal';
import ScheduleDeliveryModal from './components/ScheduleDeliveryModal';
import { LoaderCircle } from 'lucide-react';


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

const SupabaseSetupMessage: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-neutral-bg text-neutral-text-primary">
        <div className="text-center p-8 bg-neutral-card rounded-lg shadow-xl max-w-lg mx-4">
            <h1 className="text-2xl font-bold text-primary mb-4">Configuração do Supabase Necessária</h1>
            <p className="mb-4 text-neutral-text-secondary">
                Para que este aplicativo funcione, você precisa conectar seu próprio banco de dados Supabase.
            </p>
            <p className="mb-6 text-neutral-text-secondary">
                Por favor, edite o arquivo <code className="bg-neutral-card-alt px-1 py-0.5 rounded font-mono text-sm text-neutral-text-primary">supabaseClient.ts</code> e substitua os valores de <code className="bg-neutral-card-alt px-1 py-0.5 rounded font-mono text-sm text-neutral-text-primary">supabaseUrl</code> e <code className="bg-neutral-card-alt px-1 py-0.5 rounded font-mono text-sm text-neutral-text-primary">supabaseAnonKey</code> pelas suas credenciais.
            </p>
            <a 
                href="https://supabase.com/dashboard/projects" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors shadow-sm"
            >
                Abrir Dashboard do Supabase
            </a>
        </div>
    </div>
);


const ConstructFlowApp: React.FC<{ supabase: SupabaseClient }> = ({ supabase }) => {
    const [activePage, setActivePage] = useState<Page>('Locação');
    const [loading, setLoading] = useState(true);
    
    // Client State Management
    const [clients, setClients] = useState<Customer[]>([]);
    const [isAddEditClientModalOpen, setAddEditClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Customer | null>(null);
    const [isDeleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Customer | null>(null);
    
    // Equipment State Management
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [isAddEditEquipmentModalOpen, setAddEditEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isDeleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    // User State Management
    const [users, setUsers] = useState<User[]>([]);
    const [isAddEditUserModalOpen, setAddEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Unified Rental Order State Management
    const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
    const [isAddEditOrderModalOpen, setAddEditOrderModalOpen] = useState(false);
    const [equipmentForOrder, setEquipmentForOrder] = useState<Equipment | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<RentalOrder | null>(null);
    const [isDeleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<RentalOrder | null>(null);
    const [isScheduleDeliveryModalOpen, setScheduleDeliveryModalOpen] = useState(false);
    const [orderToSchedule, setOrderToSchedule] = useState<RentalOrder | null>(null);


    // Pricing State Management
    const [isPriceTableModalOpen, setPriceTableModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all([
                    supabase.from('customers').select('*').order('name', { ascending: true }),
                    supabase.from('equipment').select('*').order('name', { ascending: true }),
                    supabase.from('users').select('*').order('name', { ascending: true }),
                    supabase.from('rental_orders').select('*').order('createdDate', { ascending: false })
                ]);
                
                const [customersRes, equipmentRes, usersRes, ordersRes] = results;

                if (customersRes.error) throw customersRes.error;
                setClients(customersRes.data || []);

                if (equipmentRes.error) throw equipmentRes.error;
                setAllEquipment(equipmentRes.data || []);

                if (usersRes.error) throw usersRes.error;
                setUsers(usersRes.data || []);

                if (ordersRes.error) throw ordersRes.error;
                setRentalOrders(ordersRes.data || []);

            } catch (error) {
                console.error("Error fetching initial data:", error);
                alert("Falha ao carregar dados do banco de dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [supabase]);


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

    const handleSaveClient = async (clientData: Omit<Customer, 'id' | 'status'> | Customer) => {
        try {
            if ('id' in clientData && clientData.id) { // Update
                const { data, error } = await supabase.from('customers').update(clientData).eq('id', clientData.id).select().single();
                if (error) throw error;
                setClients(prev => prev.map(c => c.id === data.id ? data : c));
            } else { // Create
                const maxId = clients.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1])), 0);
                const newId = `CLI-${(maxId + 1).toString().padStart(3, '0')}`;
                const newClient = { ...clientData, id: newId, status: 'Ativo' };
                const { data, error } = await supabase.from('customers').insert(newClient).select().single();
                if (error) throw error;
                setClients(prev => [data, ...prev]);
            }
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Falha ao salvar cliente.');
        } finally {
            setAddEditClientModalOpen(false);
            setClientToEdit(null);
        }
    };
    
    const handleOpenDeleteClientModal = (client: Customer) => {
        setClientToDelete(client);
        setDeleteClientModalOpen(true);
    };
    
    const handleDeleteClient = async () => {
        if (clientToDelete) {
            try {
                const { error } = await supabase.from('customers').delete().eq('id', clientToDelete.id);
                if (error) throw error;
                setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            } catch (error) {
                console.error('Error deleting client:', error);
                alert('Falha ao excluir cliente.');
            } finally {
                setDeleteClientModalOpen(false);
                setClientToDelete(null);
            }
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
    
    const handleSaveEquipment = async (equipmentData: Omit<Equipment, 'id'> | Equipment) => {
        try {
            if ('id' in equipmentData && equipmentData.id) { // Update
                const { data, error } = await supabase.from('equipment').update(equipmentData).eq('id', equipmentData.id).select().single();
                if (error) throw error;
                setAllEquipment(prev => prev.map(eq => eq.id === data.id ? data : eq));
            } else { // Create
                const maxId = allEquipment.reduce((max, eq) => Math.max(max, parseInt(eq.id.split('-')[1])), 0);
                const newId = `EQP-${(maxId + 1).toString().padStart(3, '0')}`;
                const newEquipment = { ...equipmentData, id: newId, status: 'Disponível' };
                const { data, error } = await supabase.from('equipment').insert(newEquipment).select().single();
                if (error) throw error;
                setAllEquipment(prev => [data, ...prev]);
            }
        } catch (error) {
             console.error('Error saving equipment:', error);
            alert('Falha ao salvar equipamento.');
        } finally {
            setAddEditEquipmentModalOpen(false);
            setEquipmentToEdit(null);
        }
    };

    const handleOpenDeleteEquipmentModal = (equipment: Equipment) => {
        setEquipmentToDelete(equipment);
        setDeleteEquipmentModalOpen(true);
    };

    const handleDeleteEquipment = async () => {
        if (equipmentToDelete) {
            try {
                 const { error } = await supabase.from('equipment').delete().eq('id', equipmentToDelete.id);
                 if (error) throw error;
                 setAllEquipment(prev => prev.filter(eq => eq.id !== equipmentToDelete.id));
            } catch (error) {
                 console.error('Error deleting equipment:', error);
                alert('Falha ao excluir equipamento.');
            } finally {
                setDeleteEquipmentModalOpen(false);
                setEquipmentToDelete(null);
            }
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

    const handleSaveUser = async (userData: Omit<User, 'id' | 'lastLogin'> | User) => {
        try {
            if ('id' in userData && userData.id) { // Update
                const { data, error } = await supabase.from('users').update(userData).eq('id', userData.id).select().single();
                if (error) throw error;
                setUsers(prev => prev.map(u => u.id === data.id ? data : u));
            } else { // Create
                 const maxId = users.reduce((max, u) => Math.max(max, parseInt(u.id.split('-')[1])), 0);
                 const newId = `USR-${(maxId + 1).toString().padStart(3, '0')}`;
                 const newUser = { ...userData, id: newId, lastLogin: new Date().toISOString() };
                 const { data, error } = await supabase.from('users').insert(newUser).select().single();
                 if (error) throw error;
                 setUsers(prev => [data, ...prev]);
            }
        } catch(error) {
             console.error('Error saving user:', error);
            alert('Falha ao salvar usuário.');
        } finally {
             setAddEditUserModalOpen(false);
            setUserToEdit(null);
        }
    };
    
    const handleOpenDeleteUserModal = (user: User) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };
    
    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                 const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
                 if (error) throw error;
                 setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            } catch (error) {
                 console.error('Error deleting user:', error);
                alert('Falha ao excluir usuário.');
            } finally {
                setDeleteUserModalOpen(false);
                setUserToDelete(null);
            }
        }
    };
    
    // Pricing Handlers
    const handleOpenPriceTableModal = () => setPriceTableModalOpen(true);

    const handleSavePrices = async (updatedEquipmentList: Equipment[]) => {
       try {
            const updatePromises = updatedEquipmentList.map(eq =>
                supabase.from('equipment').update({ pricing: eq.pricing }).eq('id', eq.id)
            );
            const results = await Promise.all(updatePromises);
            const firstError = results.find(res => res.error);
            if (firstError) throw firstError.error;
            
            setAllEquipment(updatedEquipmentList);
            setPriceTableModalOpen(false);
        } catch (error) {
            console.error('Error saving prices:', error);
            alert('Falha ao salvar preços.');
        }
    };

    // Rental Order Handlers
    const handleSaveOrder = async (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder) => {
        try {
            if ('id' in orderData && orderData.id) { // Update
                const { data, error } = await supabase.from('rental_orders').update(orderData).eq('id', orderData.id).select().single();
                if (error) throw error;
                setRentalOrders(prev => prev.map(o => o.id === data.id ? data : o));
            } else { // Create
                const maxId = rentalOrders.reduce((max, q) => Math.max(max, parseInt(q.id.split('-')[1] || '0')), 0);
                const newId = `ORC-${(maxId + 1).toString().padStart(3, '0')}`;
                const newOrder: Omit<RentalOrder, 'deliveryDate'> = {
                    ...orderData,
                    id: newId,
                    status: 'Proposta',
                    statusHistory: [{ status: 'Proposta', date: orderData.createdDate }]
                };
                const { data, error } = await supabase.from('rental_orders').insert(newOrder).select().single();
                if (error) throw error;
                setRentalOrders(prev => [data, ...prev]);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Falha ao salvar pedido.');
        } finally {
            handleCloseOrderModal();
        }
    };
    
    const handleOpenDeleteOrderModal = (order: RentalOrder) => {
        setOrderToDelete(order);
        setDeleteOrderModalOpen(true);
    };
    
    const handleDeleteOrder = async () => {
        if (orderToDelete) {
            try {
                const { error } = await supabase.from('rental_orders').delete().eq('id', orderToDelete.id);
                if (error) throw error;
                setRentalOrders(prev => prev.filter(q => q.id !== orderToDelete.id));
            } catch (error) {
                 console.error('Error deleting order:', error);
                alert('Falha ao excluir pedido.');
            } finally {
                setDeleteOrderModalOpen(false);
                setOrderToDelete(null);
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: RentalStatus) => {
        const order = rentalOrders.find(o => o.id === orderId);
        if (!order) return;
        
        const updatedOrder = { 
            ...order, 
            status: newStatus,
            statusHistory: [...order.statusHistory, { status: newStatus, date: new Date().toISOString() }]
        };

        try {
            const { error } = await supabase.from('rental_orders').update(updatedOrder).eq('id', orderId);
            if (error) throw error;
            setRentalOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        } catch(error) {
            console.error('Error updating status:', error);
            alert('Falha ao atualizar status.');
        }
    };

    const handleOpenScheduleDeliveryModal = (order: RentalOrder) => {
        setOrderToSchedule(order);
        setScheduleDeliveryModalOpen(true);
    };

    const handleCloseScheduleDeliveryModal = () => {
        setOrderToSchedule(null);
        setScheduleDeliveryModalOpen(false);
    };

    const handleSaveDeliveryDate = async (orderId: string, deliveryDate: string) => {
        const order = rentalOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder = {
            ...order,
            deliveryDate: deliveryDate,
            status: 'Reservado' as RentalStatus,
            statusHistory: [...order.statusHistory, { status: 'Reservado' as RentalStatus, date: new Date().toISOString() }]
        };

        try {
            const { error } = await supabase.from('rental_orders').update(updatedOrder).eq('id', orderId);
            if(error) throw error;
            setRentalOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            handleCloseScheduleDeliveryModal();
        } catch(error) {
            console.error('Error saving delivery date:', error);
            alert('Falha ao agendar entrega.');
        }
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
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-bg text-neutral-text-primary">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle size={48} className="animate-spin text-primary" />
                    <p className="font-semibold text-lg">Carregando dados...</p>
                </div>
            </div>
        )
    }

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

const App: React.FC = () => {
    if (!isSupabaseConfigured || !supabase) {
        return <SupabaseSetupMessage />;
    }
    return <ConstructFlowApp supabase={supabase} />;
};

export default App;
