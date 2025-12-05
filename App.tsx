import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Equipment, Customer, User, RentalOrder, RentalStatus, MaintenanceOrder, MaintenanceStatus, Contract, EquipmentStatus, PaymentStatus, EquipmentCategory, PipelineStage, ContractStatus } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, Settings, HardHat, LogOut, ChevronLeft, LayoutDashboard, Menu, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import AddEquipmentModal from './components/AddEquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import Configuracoes from './components/Configuracoes';
import AddUserModal from './components/AddUserModal';
import PriceTableModal from './components/PriceTableModal';
import ScheduleDeliveryModal from './components/ScheduleDeliveryModal';
import AddMaintenanceModal from './components/AddMaintenanceModal';
import QuotePrintModal from './components/QuotePrintModal';
import Login from './components/Login';
import Orcamentos from './components/Orcamentos';
import Integracoes from './components/Integracoes';
import { supabase } from './supabaseClient';
import AddEditContractModal from './components/AddEditContractModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import PipelineManagerModal from './components/PipelineManagerModal';
import ReceiptPrintModal from './components/ReceiptPrintModal';
import ContractPrintModal from './components/ContractPrintModal';

// --- CONFIGURAÇÃO DE NOTIFICAÇÃO ---
// IMPORTANTE: Gere suas chaves VAPID em https://www.stephane-quantin.com/en/tools/generators/vapid-keys
// Substitua a string abaixo pela sua CHAVE PÚBLICA
const VAPID_PUBLIC_KEY = 'SUBSTITUA_PELA_SUA_PUBLIC_KEY_AQUI'; 

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: HardHat, label: 'Equipamentos' },
    { icon: ClipboardList, label: 'Orçamentos' },
    { icon: Truck, label: 'Locação' },
    { icon: FileText, label: 'Contratos' },
    { icon: Building, label: 'Clientes' },
    { icon: Calendar, label: 'Agenda' },
    { icon: Wrench, label: 'Manutenção' },
    { icon: Users, label: 'Usuários' }
];

type Page = typeof navItems[number]['label'] | 'Configurações' | 'Integrações';

const defaultStageColors: Record<string, string> = {
    'Aprovado': '#3B82F6', 
    'Reservado': '#8B5CF6',
    'Em Rota': '#F59E0B', 
    'Ativo': '#22C55E',
    'Concluído': '#6B7280',
    'Pendente de Pagamento': '#F97316', 
};

const initialPipelineStages: string[] = ['Aprovado', 'Reservado', 'Em Rota', 'Ativo', 'Concluído', 'Pendente de Pagamento'];

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
                        {...({
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            onClick: () => setIsOpen(false)
                        } as any)}
                    />
                )}
            </AnimatePresence>
             <aside className={`w-64 bg-primary text-white flex flex-col fixed inset-y-0 left-0 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <HardHat size={28} className="text-secondary"/>
                         <h1 className="text-xl font-bold">ObraFácil</h1>
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

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [activePage, setActivePage] = useState<Page>('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [profileError, setProfileError] = useState(false);
    
    // State Management
    const [clients, setClients] = useState<Customer[]>([]);
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
    const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [equipmentCategories, setEquipmentCategories] = useState<EquipmentCategory[]>([]);
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(
        initialPipelineStages.map(stageName => ({
            id: stageName,
            name: stageName,
            color: defaultStageColors[stageName] || '#cccccc',
            isCore: true
        }))
    );


    // Modals & UI State
    const [isAddEditClientModalOpen, setAddEditClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Customer | null>(null);
    const [isDeleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Customer | null>(null);
    
    const [isAddEditEquipmentModalOpen, setAddEditEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isDeleteEquipmentModalOpen, setDeleteEquipmentModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    const [isAddEditUserModalOpen, setAddEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [isAddEditOrderModalOpen, setAddEditOrderModalOpen] = useState(false);
    const [equipmentForOrder, setEquipmentForOrder] = useState<Equipment | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<RentalOrder | null>(null);
    const [isDeleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<RentalOrder | null>(null);
    const [isScheduleDeliveryModalOpen, setScheduleDeliveryModalOpen] = useState(false);
    const [orderToSchedule, setOrderToSchedule] = useState<RentalOrder | null>(null);
    const [orderToPrint, setOrderToPrint] = useState<RentalOrder | null>(null);
    const [orderSource, setOrderSource] = useState<'quote' | 'rental'>('quote');

    const [isAddEditMaintenanceModalOpen, setAddEditMaintenanceModalOpen] = useState(false);
    const [maintenanceOrderToEdit, setMaintenanceOrderToEdit] = useState<MaintenanceOrder | null>(null);
    const [isDeleteMaintenanceModalOpen, setDeleteMaintenanceModalOpen] = useState(false);
    const [maintenanceOrderToDelete, setMaintenanceOrderToDelete] = useState<MaintenanceOrder | null>(null);

    const [isAddEditContractModalOpen, setAddEditContractModalOpen] = useState(false);
    const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
    const [isDeleteContractModalOpen, setDeleteContractModalOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

    const [isPriceTableModalOpen, setPriceTableModalOpen] = useState(false);
    const [isCategoryManagerModalOpen, setCategoryManagerModalOpen] = useState(false);
    const [isPipelineManagerModalOpen, setPipelineManagerModalOpen] = useState(false);

    const [dataForDocuments, setDataForDocuments] = useState<{ contract: Contract; order: RentalOrder } | null>(null);
    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [isContractModalOpen, setContractModalOpen] = useState(false);


    // Initial Data Fetch
    const fetchAllData = async () => {
        if (!supabase) return;
        setLoadingData(true);
        try {
            const [eqRes, cliRes, userRes, orderRes, maintRes, contractsRes, catRes] = await Promise.all([
                supabase.from('equipments').select('*'),
                supabase.from('clients').select('*'),
                supabase.from('users').select('*'),
                supabase.from('rental_orders').select('*'),
                supabase.from('maintenance_orders').select('*'),
                supabase.from('contracts').select('*'),
                supabase.from('equipment_categories').select('*').order('name', { ascending: true }),
            ]);

            if (eqRes.data) setAllEquipment(eqRes.data);
            if (cliRes.data) setClients(cliRes.data);
            if (userRes.data) setUsers(userRes.data);
            if (orderRes.data) setRentalOrders(orderRes.data);
            if (maintRes.data) setMaintenanceOrders(maintRes.data);
            if (contractsRes.data) setContracts(contractsRes.data);
            if (catRes.data) setEquipmentCategories(catRes.data);


        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoadingData(false);
        }
    };
    
    // --- LÓGICA DE NOTIFICAÇÃO PUSH ---
    useEffect(() => {
        const subscribeToPush = async () => {
            if (isAuthenticated && tenantId && 'serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    });

                    // Salva a subscription no Supabase
                    const { error } = await supabase.from('push_subscriptions').upsert({
                        user_id: (await supabase.auth.getUser()).data.user?.id,
                        tenant_id: tenantId,
                        endpoint: subscription.endpoint,
                        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!))),
                        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!)))
                    });

                    if (error) console.error("Erro ao salvar subscription:", error);
                    else console.log("Notificações Push ativadas com sucesso!");

                } catch (error) {
                    console.error("Erro ao registrar push:", error);
                }
            }
        };

        if (isAuthenticated && tenantId && VAPID_PUBLIC_KEY !== 'SUBSTITUA_PELA_SUA_PUBLIC_KEY_AQUI') {
            subscribeToPush();
        }
    }, [isAuthenticated, tenantId]);


    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
        setIsAuthenticated(false);
        setTenantId(null);
        setProfileError(false);
        // Clear local state
        setClients([]);
        setAllEquipment([]);
        setUsers([]);
        setRentalOrders([]);
        setMaintenanceOrders([]);
        setContracts([]);
        setEquipmentCategories([]);
        // Forçar reload para limpar estados globais
        window.location.reload();
    };

    // Load User and Tenant Info
    const loadUserTenant = useCallback(async (retries = 5) => {
        if(!isAuthenticated || !supabase) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if(user) {
                // Fetch profile to get tenant_id
                const { data: profile, error } = await supabase.from('users').select('tenant_id').eq('auth_id', user.id).maybeSingle();
                
                if(profile && profile.tenant_id) {
                    setTenantId(profile.tenant_id);
                    setProfileError(false);
                    fetchAllData(); 
                } else {
                    console.log(`Perfil não encontrado. Tentativas restantes: ${retries}`);
                    if (retries > 0) {
                        const delay = Math.pow(2, 6 - retries) * 1000;
                        setTimeout(() => loadUserTenant(retries - 1), delay);
                    } else {
                         console.error("Erro crítico: Perfil não encontrado após várias tentativas.");
                         handleLogout();
                    }
                }
            } else {
                if (retries > 0) {
                    setTimeout(() => loadUserTenant(retries - 1), 500);
                } else {
                     handleLogout();
                }
            }
        } catch (e) {
            console.error("Erro ao carregar perfil:", e);
            setProfileError(true);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            loadUserTenant();
        }
    }, [isAuthenticated, loadUserTenant]);

    // Auth Check
    useEffect(() => {
        if (!supabase) {
            setIsLoadingAuth(false);
            return;
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setIsLoadingAuth(false);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (!session) {
                setTenantId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);


    // Filtered orders for specific views
    const quotes = useMemo(() => rentalOrders.filter(o => o.status === 'Proposta' || o.status === 'Recusado'), [rentalOrders]);
    const activeRentals = useMemo(() => rentalOrders.filter(o => o.status !== 'Proposta' && o.status !== 'Recusado'), [rentalOrders]);

    const handleOpenOrderModal = (equipment: Equipment | null = null) => {
        setOrderSource('quote');
        setOrderToEdit(null);
        setEquipmentForOrder(equipment);
        setAddEditOrderModalOpen(true);
    };

    const handleOpenRentalOrderModal = (equipment: Equipment | null = null) => {
        setOrderSource('rental');
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
        if (!supabase || !tenantId) {
            alert("Erro: Sessão inválida ou tenant não encontrado. Faça login novamente.");
            return;
        }

        let savedData: Customer | null = null;
        let error: any = null;

        try {
            if ('id' in clientData && clientData.id) { // Update
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, tenant_id, ...updateData } = clientData;
                const { data, error: updateError } = await supabase
                    .from('clients')
                    .update(updateData)
                    .match({ id: clientData.id, tenant_id: tenantId })
                    .select()
                    .single();
                
                if (updateError) throw updateError;
                savedData = data;

            } else { // Create
                const maxId = clients.reduce((max, c) => Math.max(max, parseInt(c.id.split('-')[1] || '0')), 0);
                const newId = `CLI-${(maxId + 1).toString().padStart(3, '0')}`;
                const newClient: Omit<Customer, 'id' | 'tenant_id' | 'status'> & { id: string; status: 'Ativo'; tenant_id: string } = {
                    ...(clientData as Omit<Customer, 'id' | 'status'>),
                    id: newId,
                    status: 'Ativo',
                    tenant_id: tenantId,
                };
                
                const { data, error: insertError } = await supabase
                    .from('clients')
                    .insert(newClient)
                    .select()
                    .single();

                if (insertError) throw insertError;
                savedData = data;
            }
        } catch (e) {
            error = e;
        }

        if (savedData) {
            setClients(prev => {
                const exists = prev.some(c => c.id === savedData!.id);
                return exists ? prev.map(c => c.id === savedData!.id ? savedData! : c) : [savedData!, ...prev];
            });
            setAddEditClientModalOpen(false);
            setClientToEdit(null);
        } else {
            console.error("Erro ao salvar cliente:", error);
            alert(`Falha ao salvar cliente: ${error?.message || 'Erro desconhecido.'}\nVerifique se o banco de dados está atualizado com o último script SQL.`);
        }
    };
    
    const handleOpenDeleteClientModal = (client: Customer) => {
        setClientToDelete(client);
        setDeleteClientModalOpen(true);
    };
    
    const handleDeleteClient = async () => {
        if (clientToDelete && supabase && tenantId) {
            const { error } = await supabase
                .from('clients')
                .delete()
                .match({ id: clientToDelete.id, tenant_id: tenantId });
                
            if (!error) {
                setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
                setDeleteClientModalOpen(false);
                setClientToDelete(null);
            } else {
                console.error("Erro ao deletar cliente:", error);
                alert(`Falha ao deletar cliente: ${error.message}`);
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
        if (!supabase || !tenantId) return;

        let savedData: Equipment | null = null;

        if ('id' in equipmentData && equipmentData.id) { // Update
            const { data, error } = await supabase.from('equipments').update(equipmentData).eq('id', equipmentData.id).select().single();
             if (!error && data) savedData = data;
        } else { // Create
            const maxId = allEquipment.reduce((max, eq) => Math.max(max, parseInt(eq.id.split('-')[1] || '0')), 0);
            const newId = `EQP-${(maxId + 1).toString().padStart(3, '0')}`;
            const newEquipment = { 
                ...equipmentData, 
                id: newId, 
                status: 'Disponível',
                tenant_id: tenantId 
            };
            const { data, error } = await supabase.from('equipments').insert(newEquipment).select().single();
             if (!error && data) savedData = data;
             else console.error(error);
        }

        if (savedData) {
            setAllEquipment(prev => {
                 const exists = prev.find(e => e.id === savedData!.id);
                 return exists ? prev.map(e => e.id === savedData!.id ? savedData! : e) : [savedData!, ...prev];
            });
            setAddEditEquipmentModalOpen(false);
            setEquipmentToEdit(null);
        }
    };

    const handleOpenDeleteEquipmentModal = (equipment: Equipment) => {
        setEquipmentToDelete(equipment);
        setDeleteEquipmentModalOpen(true);
    };

    const handleDeleteEquipment = async () => {
        if (equipmentToDelete && supabase) {
            const { error } = await supabase.from('equipments').delete().eq('id', equipmentToDelete.id);
            if (!error) {
                setAllEquipment(prev => prev.filter(eq => eq.id !== equipmentToDelete.id));
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
        if (!supabase || !tenantId) return;
        
        let savedData: User | null = null;

        if ('id' in userData && userData.id) { // Update
            const { data, error } = await supabase.from('users').update(userData).eq('id', userData.id).select().single();
             if (!error && data) savedData = data;
        } else { // Create
             const maxId = users.reduce((max, u) => Math.max(max, parseInt(u.id.split('-')[1] || '0')), 0);
             const newId = `USR-${(maxId + 1).toString().padStart(3, '0')}`;
             const newUser = { 
                 ...userData, 
                 id: newId, 
                 lastLogin: new Date().toISOString(),
                 tenant_id: tenantId 
            };
            // Note: In a real app, you would also create the Auth user here or trigger an invite.
             const { data, error } = await supabase.from('users').insert(newUser).select().single();
             if (!error && data) savedData = data;
        }

        if (savedData) {
            setUsers(prev => {
                const exists = prev.find(u => u.id === savedData!.id);
                return exists ? prev.map(u => u.id === savedData!.id ? savedData! : u) : [savedData!, ...prev];
            });
            setAddEditUserModalOpen(false);
            setUserToEdit(null);
        }
    };
    
    const handleOpenDeleteUserModal = (user: User) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };
    
    const handleDeleteUser = async () => {
        if (userToDelete && supabase) {
            const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
             if (!error) {
                setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                setDeleteUserModalOpen(false);
                setUserToDelete(null);
             }
        }
    };
    
    // Pricing Handlers
    const handleOpenPriceTableModal = () => setPriceTableModalOpen(true);

    const handleSavePrices = async (updatedEquipmentList: Equipment[]) => {
        if (!supabase) return;
        
        const updates = updatedEquipmentList.map(eq => 
            supabase!.from('equipments').update({ pricing: eq.pricing }).eq('id', eq.id)
        );
        
        await Promise.all(updates);
        setAllEquipment(updatedEquipmentList);
        setPriceTableModalOpen(false);
    };

    // Rental Order Handlers
    const handleSaveOrder = async (orderData: Omit<RentalOrder, 'id' | 'status' | 'statusHistory'> | RentalOrder, onSuccess?: (savedOrder: RentalOrder) => void) => {
        if (!supabase || !tenantId) return;

        let savedData: RentalOrder | null = null;

        if ('id' in orderData && orderData.id) { // Update
            const { data, error } = await supabase.from('rental_orders').update(orderData).eq('id', orderData.id).select().single();
            if (!error && data) savedData = data;
        } else { // Create
            const maxId = rentalOrders.reduce((max, q) => Math.max(max, parseInt(q.id.split('-')[1] || '0')), 0);
            const newId = `ORC-${(maxId + 1).toString().padStart(3, '0')}`;
            const initialStatus: RentalStatus = orderSource === 'rental' ? 'Aprovado' : 'Proposta';
            
            const newOrder = {
                ...orderData,
                id: newId,
                status: initialStatus,
                statusHistory: [{ status: initialStatus, date: (orderData as any).createdDate }],
                tenant_id: tenantId
            };
            const { data, error } = await supabase.from('rental_orders').insert(newOrder).select().single();
            if (!error && data) savedData = data;
        }

        if (savedData) {
            setRentalOrders(prev => {
                const exists = prev.find(o => o.id === savedData!.id);
                return exists ? prev.map(o => o.id === savedData!.id ? savedData! : o) : [savedData!, ...prev];
            });
            if (onSuccess) onSuccess(savedData);
            else handleCloseOrderModal();
        }
    };
    
    const handleOpenDeleteOrderModal = (order: RentalOrder) => {
        setOrderToDelete(order);
        setDeleteOrderModalOpen(true);
    };
    
    const handleDeleteOrder = async () => {
        if (orderToDelete && supabase) {
            const { error } = await supabase.from('rental_orders').delete().eq('id', orderToDelete.id);
            if (!error) {
                setRentalOrders(prev => prev.filter(q => q.id !== orderToDelete.id));
                setDeleteOrderModalOpen(false);
                setOrderToDelete(null);
            }
        }
    };

    const checkAndFinalizeContract = async (order: RentalOrder) => {
        if (!supabase || !tenantId) return;

        if (order.status === 'Concluído' && order.paymentStatus === 'Pago') {
            const contractId = `CON-${order.id}`;
            const existingContract = contracts.find(c => c.id === contractId);
            
            if (existingContract && existingContract.status !== 'Concluído') {
                const { data: updatedContract, error } = await supabase
                    .from('contracts')
                    .update({ status: 'Concluído' as ContractStatus })
                    .eq('id', contractId)
                    .select()
                    .single();
                
                if (updatedContract && !error) {
                    setContracts(prev => prev.map(c => c.id === contractId ? updatedContract : c));
                }
            }
        }
    };

    const checkAndCreateContract = async (order: RentalOrder) => {
        if (!supabase || !tenantId) return;

        // Condition to create the contract
        if (order.status === 'Aprovado' && order.paymentStatus === 'Pago') {
            const contractId = `CON-${order.id}`;
            const contractExists = contracts.some(c => c.id === contractId);

            if (!contractExists) {
                const totalValue = order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);
                const newContract: Omit<Contract, 'tenant_id'> & { tenant_id: string } = {
                    id: contractId,
                    client: order.client,
                    startDate: order.startDate,
                    endDate: order.endDate,
                    value: totalValue,
                    status: 'Ativo', // Starts as 'Ativo'
                    tenant_id: tenantId,
                };
                
                const { data: newContractData, error: contractError } = await supabase
                    .from('contracts')
                    .insert(newContract)
                    .select()
                    .single();

                if (contractError) {
                    console.error("Erro ao criar contrato:", contractError);
                } else if (newContractData) {
                    setContracts(prev => [...prev, newContractData]);
                }
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: RentalStatus) => {
        if (!supabase || !tenantId) return;
    
        const order = rentalOrders.find(o => o.id === orderId);
        if (!order || order.status === newStatus) return; // No change needed
    
        const newHistory = [...order.statusHistory, { status: newStatus, date: new Date().toISOString() }];
    
        const { data: updatedOrder, error: orderError } = await supabase
            .from('rental_orders')
            .update({ status: newStatus, statusHistory: newHistory })
            .eq('id', orderId)
            .select()
            .single();
    
        if (orderError || !updatedOrder) {
            console.error("Error updating order status:", orderError);
            alert("Falha ao atualizar o status do pedido.");
            return;
        }
    
        const updatedOrdersList = rentalOrders.map(o => (o.id === orderId ? updatedOrder : o));
    
        const statusesMarkingInUse: RentalStatus[] = ['Aprovado', 'Reservado', 'Em Rota', 'Ativo'];
        const statusesThatRelease: RentalStatus[] = ['Concluído', 'Recusado', 'Proposta'];
    
        const equipmentIdsInOrder = order.equipmentItems.map(item => item.equipmentId);
        const equipmentStatusUpdates: { id: string; status: EquipmentStatus }[] = [];
    
        if (statusesMarkingInUse.includes(newStatus)) {
            equipmentIdsInOrder.forEach(id => {
                equipmentStatusUpdates.push({ id, status: 'Em Uso' });
            });
        } 
        else if (statusesMarkingInUse.includes(order.status) && statusesThatRelease.includes(newStatus)) {
            for (const eqId of equipmentIdsInOrder) {
                const isInOutherActiveOrder = updatedOrdersList.some(otherOrder => 
                    otherOrder.id !== orderId &&
                    statusesMarkingInUse.includes(otherOrder.status) &&
                    otherOrder.equipmentItems.some(item => item.equipmentId === eqId)
                );
    
                if (!isInOutherActiveOrder) {
                    equipmentStatusUpdates.push({ id: eqId, status: 'Disponível' });
                }
            }
        }
    
        if (equipmentStatusUpdates.length > 0) {
            const updates = equipmentStatusUpdates.map(eq =>
                supabase.from('equipments').update({ status: eq.status }).eq('id', eq.id)
            );
    
            const results = await Promise.all(updates);
            const hasErrors = results.some(res => res.error);
            if (hasErrors) {
                console.error("Error updating equipment statuses:", results.map(r => r.error).filter(Boolean));
            }
        }
        
        setRentalOrders(updatedOrdersList);
    
        if (equipmentStatusUpdates.length > 0) {
             setAllEquipment(prevEquipment => 
                prevEquipment.map(eq => {
                    const update = equipmentStatusUpdates.find(u => u.id === eq.id);
                    return update ? { ...eq, status: update.status } : eq;
                })
            );
        }
        
        await checkAndCreateContract(updatedOrder);
        await checkAndFinalizeContract(updatedOrder);
    };

    const handleUpdatePaymentStatus = async (orderId: string, newStatus: PaymentStatus) => {
        if (!supabase) return;
        
        const updatePayload: { paymentStatus: PaymentStatus, paymentDate?: string } = { paymentStatus: newStatus };
        if (newStatus === 'Pago') {
            updatePayload.paymentDate = new Date().toISOString();
        }

        const { data: updatedOrder, error } = await supabase
            .from('rental_orders')
            .update(updatePayload)
            .eq('id', orderId)
            .select()
            .single();

        if (!error && updatedOrder) {
            setRentalOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
            await checkAndCreateContract(updatedOrder);
            await checkAndFinalizeContract(updatedOrder);
        } else {
            console.error("Error updating payment status:", error);
            alert("Falha ao atualizar o status do pagamento.");
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
        if (!supabase) return;
        const order = rentalOrders.find(o => o.id === orderId);
        if (!order) return;

        const newStatus = 'Reservado';
        const newHistory = [...order.statusHistory, { status: newStatus, date: new Date().toISOString() }];

        const { data, error } = await supabase
            .from('rental_orders')
            .update({ deliveryDate, status: newStatus, statusHistory: newHistory })
            .eq('id', orderId)
            .select()
            .single();

        if (!error && data) {
            setRentalOrders(prev => prev.map(o => o.id === orderId ? data : o));
            handleCloseScheduleDeliveryModal();
        }
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

    const handleSaveMaintenanceOrder = async (orderData: Omit<MaintenanceOrder, 'id'> | MaintenanceOrder) => {
        if (!supabase || !tenantId) return;
        
        let savedData: MaintenanceOrder | null = null;

        if ('id' in orderData && orderData.id) { // Update
            const { data, error } = await supabase.from('maintenance_orders').update(orderData).eq('id', orderData.id).select().single();
             if (!error && data) savedData = data;
        } else { // Create
            const maxId = maintenanceOrders.reduce((max, o) => Math.max(max, parseInt(o.id.split('-')[1] || '0')), 0);
            const newId = `OS-${(maxId + 1).toString().padStart(3, '0')}`;
            const newOrder = { 
                ...orderData, 
                id: newId, 
                tenant_id: tenantId
            };
            const { data, error } = await supabase.from('maintenance_orders').insert(newOrder).select().single();
            if (!error && data) savedData = data;
        }

        if (savedData) {
            setMaintenanceOrders(prev => {
                const exists = prev.find(o => o.id === savedData!.id);
                return exists ? prev.map(o => o.id === savedData!.id ? savedData! : o) : [savedData!, ...prev];
            });
            setAddEditMaintenanceModalOpen(false);
            setMaintenanceOrderToEdit(null);
        }
    };

    const handleOpenDeleteMaintenanceModal = (order: MaintenanceOrder) => {
        setMaintenanceOrderToDelete(order);
        setDeleteMaintenanceModalOpen(true);
    };

    const handleDeleteMaintenanceOrder = async () => {
        if (maintenanceOrderToDelete && supabase) {
            const { error } = await supabase.from('maintenance_orders').delete().eq('id', maintenanceOrderToDelete.id);
            if (!error) {
                setMaintenanceOrders(prev => prev.filter(o => o.id !== maintenanceOrderToDelete.id));
                setDeleteMaintenanceModalOpen(false);
                setMaintenanceOrderToDelete(null);
            }
        }
    };

    const handleUpdateMaintenanceStatus = async (orderId: string, newStatus: MaintenanceStatus) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('maintenance_orders').update({ status: newStatus }).eq('id', orderId).select().single();
        if (!error && data) {
             setMaintenanceOrders(prev => prev.map(order => order.id === orderId ? data : order));
        }
    };

    // Contract Handlers
    const handleOpenEditContractModal = (contract: Contract) => {
        setContractToEdit(contract);
        setAddEditContractModalOpen(true);
    };

    const handleSaveContract = async (contractData: Contract) => {
        if (!supabase) return;
        
        const { data, error } = await supabase
            .from('contracts')
            .update({ dueDate: contractData.dueDate })
            .eq('id', contractData.id)
            .select()
            .single();

        if (!error && data) {
            setContracts(prev => prev.map(c => c.id === data.id ? data : c));
            setAddEditContractModalOpen(false);
            setContractToEdit(null);
        } else {
            console.error("Erro ao salvar contrato:", error);
        }
    };

    const handleOpenDeleteContractModal = (contract: Contract) => {
        setContractToDelete(contract);
        setDeleteContractModalOpen(true);
    };

    const handleDeleteContract = async () => {
        if (contractToDelete && supabase) {
            const { error } = await supabase.from('contracts').delete().eq('id', contractToDelete.id);
            if (!error) {
                setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
                setDeleteContractModalOpen(false);
                setContractToDelete(null);
            }
        }
    };
    
    // Category Handlers
    const handleSaveCategory = async (categoryData: Omit<EquipmentCategory, 'id' | 'tenant_id'> | EquipmentCategory) => {
        if (!supabase || !tenantId) return;
        let savedData: EquipmentCategory | null = null;
        let error;

        if ('id' in categoryData) { // Update
            const { data, error: updateError } = await supabase
                .from('equipment_categories')
                .update({ name: categoryData.name })
                .match({ id: categoryData.id, tenant_id: tenantId })
                .select()
                .single();
            savedData = data;
            error = updateError;
        } else { // Create
            const { data, error: insertError } = await supabase
                .from('equipment_categories')
                .insert({ name: categoryData.name, tenant_id: tenantId })
                .select()
                .single();
            savedData = data;
            error = insertError;
        }

        if (savedData) {
            setEquipmentCategories(prev => {
                const exists = prev.find(c => c.id === savedData!.id);
                return (exists ? prev.map(c => c.id === savedData!.id ? savedData! : c) : [...prev, savedData!])
                       .sort((a, b) => a.name.localeCompare(b.name));
            });
        } else {
            console.error("Erro ao salvar categoria:", error);
            alert(`Falha ao salvar categoria: ${error?.message}`);
        }
    };

    const handleDeleteCategory = async (category: EquipmentCategory) => {
        if (!supabase || !tenantId) return;

        const isCategoryInUse = allEquipment.some(eq => eq.category === category.name);
        if (isCategoryInUse) {
            alert(`A categoria "${category.name}" está em uso por um ou mais equipamentos e não pode ser excluída.`);
            return;
        }

        const { error } = await supabase.from('equipment_categories').delete().match({ id: category.id, tenant_id: tenantId });

        if (!error) {
            setEquipmentCategories(prev => prev.filter(c => c.id !== category.id));
        } else {
            console.error("Erro ao deletar categoria:", error);
            alert(`Falha ao deletar categoria: ${error.message}`);
        }
    };
    
    // Pipeline Handlers
    const handleSavePipeline = (newStages: PipelineStage[]) => {
        const stagesToDelete = pipelineStages.filter(
            oldStage => !newStages.some(newStage => newStage.id === oldStage.id)
        );

        for (const stage of stagesToDelete) {
            if (rentalOrders.some(order => order.status === stage.name)) {
                alert(`A etapa "${stage.name}" está em uso e não pode ser excluída.`);
                return;
            }
        }
        setPipelineStages(newStages);
        setPipelineManagerModalOpen(false);
    };


    // Print Handlers
    const handleOpenPrintModal = (order: RentalOrder) => setOrderToPrint(order);
    const handleClosePrintModal = () => setOrderToPrint(null);

    const handleOpenReceiptModal = (data: { contract: Contract; order: RentalOrder; }) => {
        setDataForDocuments(data);
        setReceiptModalOpen(true);
    };

    const handleOpenContractModal = (data: { contract: Contract; order: RentalOrder; }) => {
        setDataForDocuments(data);
        setContractModalOpen(true);
    };

    // Auth Handlers
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setActivePage('Dashboard');
    };

    // Loading Screen
    if (isLoadingAuth) {
        return <div className="h-screen w-full flex items-center justify-center bg-neutral-bg"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (profileError) {
        return (
             <div className="h-screen w-full flex items-center justify-center bg-neutral-bg flex-col gap-4 p-8 text-center">
                <h2 className="text-xl font-bold text-neutral-text-primary">Erro no Perfil</h2>
                <p className="text-neutral-text-secondary">Não foi possível carregar seu perfil. Isso pode ocorrer se o cadastro ainda estiver sendo processado ou se houve um erro na conexão.</p>
                
                <div className="flex gap-4 mt-2">
                    <button 
                        onClick={() => loadUserTenant(5)} 
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <RefreshCw size={16} />
                        Tentar Novamente
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-card text-neutral-text-primary border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </div>
        )
    }

    if (loadingData && activePage === 'Dashboard' && rentalOrders.length === 0) {
        return <div className="h-screen w-full flex items-center justify-center bg-neutral-bg"><div className="text-center"><Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-2" /><p className="text-neutral-text-secondary">Carregando dados da sua empresa...</p></div></div>;
    }

    const renderContent = () => {
        switch(activePage) {
            case 'Dashboard':
                return <Dashboard 
                    onOpenQuoteModal={handleOpenOrderModal}
                    rentalOrders={rentalOrders}
                    equipment={allEquipment}
                    maintenanceOrders={maintenanceOrders}
                />;
            case 'Equipamentos':
                return <Equipamentos 
                            equipment={allEquipment}
                            categories={equipmentCategories}
                            onOpenQuoteModal={handleOpenOrderModal}
                            onAdd={handleOpenAddEquipmentModal}
                            onEdit={handleOpenEditEquipmentModal}
                            onDelete={handleOpenDeleteEquipmentModal}
                        />;
            case 'Orçamentos':
                return <Orcamentos 
                            quotes={quotes}
                            clients={clients}
                            onOpenAddModal={handleOpenOrderModal}
                            onEdit={handleOpenEditOrderModal}
                            onDelete={handleOpenDeleteOrderModal}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onOpenPrintModal={handleOpenPrintModal}
                        />;
            case 'Locação':
                return <Locacao 
                            orders={activeRentals} 
                            clients={clients}
                            onOpenAddModal={handleOpenRentalOrderModal}
                            onEdit={handleOpenEditOrderModal}
                            onDelete={handleOpenDeleteOrderModal}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                            onOpenScheduleDeliveryModal={handleOpenScheduleDeliveryModal}
                            onOpenPrintModal={handleOpenPrintModal}
                            stages={pipelineStages}
                        />;
            case 'Contratos':
                return <Contratos 
                            contracts={contracts}
                            rentalOrders={rentalOrders}
                            onDelete={handleOpenDeleteContractModal}
                            onEdit={handleOpenEditContractModal}
                            onOpenReceipt={handleOpenReceiptModal}
                            onOpenContract={handleOpenContractModal}
                        />;
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
                return <Configuracoes onOpenPriceTableModal={handleOpenPriceTableModal} onOpenCategoryManagerModal={() => setCategoryManagerModalOpen(true)} onOpenPipelineManagerModal={() => setPipelineManagerModalOpen(true)} setActivePage={setActivePage} />;
            case 'Integrações':
                return <Integracoes />;
            default:
                return <PlaceholderPage title={activePage} />;
        }
    };

    return (
        <div className="flex h-screen font-sans text-neutral-text-primary bg-neutral-bg">
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
                         <h1 className="text-lg font-bold text-primary">ObraFácil</h1>
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
                    {isAddEditEquipmentModalOpen && <AddEquipmentModal onClose={() => setAddEditEquipmentModalOpen(false)} onSave={handleSaveEquipment} equipmentToEdit={equipmentToEdit} categories={equipmentCategories} />}
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
                    {isDeleteContractModalOpen && contractToDelete && (
                        <ConfirmationModal
                            isOpen={isDeleteContractModalOpen}
                            onClose={() => setDeleteContractModalOpen(false)}
                            onConfirm={handleDeleteContract}
                            title="Confirmar Exclusão de Contrato"
                            message={`Tem certeza de que deseja excluir o contrato "${contractToDelete.id}"? Esta ação não pode ser desfeita.`}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isAddEditContractModalOpen && contractToEdit && (
                        <AddEditContractModal
                            onClose={() => setAddEditContractModalOpen(false)}
                            onSave={handleSaveContract}
                            contractToEdit={contractToEdit}
                        />
                    )}
                </AnimatePresence>
                 <AnimatePresence>
                    {orderToPrint && <QuotePrintModal quote={orderToPrint} onClose={handleClosePrintModal} />}
                </AnimatePresence>
                 <AnimatePresence>
                    {isReceiptModalOpen && dataForDocuments && <ReceiptPrintModal data={dataForDocuments} onClose={() => setReceiptModalOpen(false)} />}
                </AnimatePresence>
                 <AnimatePresence>
                    {isContractModalOpen && dataForDocuments && <ContractPrintModal data={dataForDocuments} onClose={() => setContractModalOpen(false)} />}
                </AnimatePresence>
                <AnimatePresence>
                    {isCategoryManagerModalOpen && (
                        <CategoryManagerModal
                            isOpen={isCategoryManagerModalOpen}
                            onClose={() => setCategoryManagerModalOpen(false)}
                            categories={equipmentCategories}
                            onSave={handleSaveCategory}
                            onDelete={handleDeleteCategory}
                            allEquipment={allEquipment}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isPipelineManagerModalOpen && (
                        <PipelineManagerModal
                            isOpen={isPipelineManagerModalOpen}
                            onClose={() => setPipelineManagerModalOpen(false)}
                            stages={pipelineStages}
                            onSave={handleSavePipeline}
                            rentalOrders={rentalOrders}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;