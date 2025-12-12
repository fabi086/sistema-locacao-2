import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, Truck, HardHat, Users, FileText, 
  Calendar, Settings, LogOut, Wrench, Menu 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Locacao from './components/Locacao';
import Equipamentos from './components/Equipamentos';
import Clientes from './components/Clientes';
import Orcamentos from './components/Orcamentos';
import Contratos from './components/Contratos';
import Agenda from './components/Agenda';
import Manutencao from './components/Manutencao';
import Usuarios from './components/Usuarios';
import Configuracoes from './components/Configuracoes';
import Login from './components/Login';

import AddClientModal from './components/AddClientModal';
import AddEquipmentModal from './components/AddEquipmentModal';
import QuoteModal from './components/QuoteModal';
import ScheduleDeliveryModal from './components/ScheduleDeliveryModal';
import QuotePrintModal from './components/QuotePrintModal';
import ContractPrintModal from './components/ContractPrintModal';
import ReceiptPrintModal from './components/ReceiptPrintModal';
import AddMaintenanceModal from './components/AddMaintenanceModal';
import AddUserModal from './components/AddUserModal';
import PriceTableModal from './components/PriceTableModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import PipelineManagerModal from './components/PipelineManagerModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import ConfirmationModal from './components/ConfirmationModal';

import { 
  Customer, Equipment, RentalOrder, Contract, User, 
  EquipmentCategory, RentalStatus, MaintenanceOrder, 
  MaintenanceStatus, PaymentStatus, CompanySettings
} from './types';

// Mock Data for Demo Mode
const mockClients: Customer[] = [
    { id: 'CLI-001', name: 'Construtora Exemplo', document: '12.345.678/0001-90', email: 'contato@exemplo.com', phone: '(11) 98765-4321', status: 'Ativo', city: 'São Paulo', state: 'SP' },
    { id: 'CLI-002', name: 'Engenharia Civil Ltda', document: '98.765.432/0001-10', email: 'comercial@engenharia.com', phone: '(21) 91234-5678', status: 'Ativo', city: 'Rio de Janeiro', state: 'RJ' }
];

const mockEquipment: Equipment[] = [
    { id: 'EQ-001', name: 'Escavadeira Hidráulica', category: 'Terraplanagem', serialNumber: 'CAT-320D-2023', status: 'Disponível', location: 'Pátio Central', pricing: { daily: 1500, weekly: 9000, biweekly: 17000, monthly: 30000 } },
    { id: 'EQ-002', name: 'Betoneira 400L', category: 'Concretagem', serialNumber: 'BET-400-X5', status: 'Em Uso', location: 'Obra Alfa', pricing: { daily: 50, weekly: 300, biweekly: 550, monthly: 1000 }, rentalHistory: [{ id: 'HIS-001', client: 'Construtora Exemplo', startDate: '2023-10-01', endDate: '2023-10-15' }] }
];

const mockOrders: RentalOrder[] = [
    { id: 'PED-001', client: 'Construtora Exemplo', equipmentItems: [{ equipmentId: 'EQ-002', equipmentName: 'Betoneira 400L', value: 3000 }], startDate: '2023-10-20', endDate: '2023-11-20', value: 3000, status: 'Ativo', statusHistory: [{ status: 'Proposta', date: '2023-10-10' }, { status: 'Ativo', date: '2023-10-20' }], createdDate: '2023-10-10', validUntil: '2023-10-17', paymentStatus: 'Pendente' }
];

const mockContracts: Contract[] = [
    { id: 'CON-001', client: 'Construtora Exemplo', startDate: '2023-10-20', endDate: '2023-11-20', value: 3000, status: 'Ativo' }
];

const defaultCompanySettings: CompanySettings = {
    name: 'ObraFácil Locações',
    document: '00.000.000/0001-00',
    email: 'contato@obrafacil.com',
    phone: '(11) 98765-4321',
    website: 'www.obrafacil.com',
    address: {
        street: 'Rua da Construção',
        number: '123',
        neighborhood: 'Bairro Industrial',
        city: 'São Paulo',
        state: 'SP',
        cep: '12345-678'
    }
};

const App: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [activePage, setActivePage] = useState('Dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data States
    const [clients, setClients] = useState<Customer[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
    const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<EquipmentCategory[]>([
        { id: 'CAT-1', name: 'Terraplanagem' },
        { id: 'CAT-2', name: 'Concretagem' },
        { id: 'CAT-3', name: 'Elevação' },
        { id: 'CAT-4', name: 'Geradores' }
    ]);
    const [stages, setStages] = useState<RentalStatus[]>(['Proposta', 'Aprovado', 'Reservado', 'Em Rota', 'Ativo', 'Concluído', 'Recusado', 'Pendente de Pagamento']);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);

    // Modal States
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Customer | null>(null);

    const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteEquipment, setQuoteEquipment] = useState<Equipment | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<RentalOrder | null>(null);

    const [isScheduleDeliveryModalOpen, setIsScheduleDeliveryModalOpen] = useState(false);
    const [deliveryOrder, setDeliveryOrder] = useState<RentalOrder | null>(null);

    const [isQuotePrintModalOpen, setIsQuotePrintModalOpen] = useState(false);
    const [printOrder, setPrintOrder] = useState<RentalOrder | null>(null);

    const [isContractPrintModalOpen, setIsContractPrintModalOpen] = useState(false);
    const [printContract, setPrintContract] = useState<Contract | null>(null);

    const [isReceiptPrintModalOpen, setIsReceiptPrintModalOpen] = useState(false);
    const [printReceiptOrder, setPrintReceiptOrder] = useState<RentalOrder | null>(null);

    const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
    const [maintenanceOrderToEdit, setMaintenanceOrderToEdit] = useState<MaintenanceOrder | null>(null);

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const [isPriceTableModalOpen, setIsPriceTableModalOpen] = useState(false);
    const [isCategoryManagerModalOpen, setIsCategoryManagerModalOpen] = useState(false);
    const [isPipelineManagerModalOpen, setIsPipelineManagerModalOpen] = useState(false);
    const [isCompanySettingsModalOpen, setIsCompanySettingsModalOpen] = useState(false);

    // Confirmation Modal
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationProps, setConfirmationProps] = useState<{ title: string; message: string; onConfirm: () => void }>({ title: '', message: '', onConfirm: () => {} });

    // Helper for safe error messages (Prevents [object Object])
    const getErrorMessage = (error: any): string => {
        if (!error) return 'Erro desconhecido';
        if (typeof error === 'string') return error;
        
        // Supabase / Database Error - Formatação rica
        if (error.message) {
            let msg = error.message;
            if (error.code) msg += ` (Código: ${error.code})`;
            if (error.details) msg += ` - Detalhes: ${error.details}`;
            if (error.hint) msg += ` - Dica: ${error.hint}`;
            return msg;
        }
        
        // Fallback seguro
        try {
            return JSON.stringify(error);
        } catch (e) {
            return 'Erro interno não serializável';
        }
    };

    // Function to fetch tenant
    const fetchTenant = async (userId: string) => {
        try {
            const { data: user, error } = await supabase.from('users').select('tenant_id').eq('auth_id', userId).single();
            if (error) {
                console.error('Error fetching tenant:', getErrorMessage(error));
                return;
            }
            if (user) setTenantId(user.tenant_id);
        } catch (e) {
            console.error('Exception fetching tenant:', getErrorMessage(e));
        }
    };

    // Fetch all app data
    const fetchData = useCallback(async () => {
        if (!supabase || !tenantId) return;
        
        console.log("Carregando dados para tenant:", tenantId);

        try {
            // Updated table name: 'clients' instead of 'customers'
            const { data: clientsData, error: clientsError } = await supabase.from('clients').select('*').eq('tenant_id', tenantId);
            if (clientsError) {
                console.error("Erro carregando clientes:", getErrorMessage(clientsError));
            } else {
                setClients(clientsData || []);
            }

            // Updated table name: 'equipments' instead of 'equipment'
            const { data: equipmentData, error: equipmentError } = await supabase.from('equipments').select('*').eq('tenant_id', tenantId);
            if (equipmentError) {
                console.error("Erro carregando equipamentos:", getErrorMessage(equipmentError));
            } else {
                setEquipment(equipmentData || []);
            }

            const { data: ordersData, error: ordersError } = await supabase.from('rental_orders').select('*').eq('tenant_id', tenantId);
            if (ordersError) {
                console.error("Erro carregando pedidos:", getErrorMessage(ordersError));
            } else {
                setRentalOrders(ordersData || []);
            }
            
            const { data: maintData, error: maintError } = await supabase.from('maintenance_orders').select('*').eq('tenant_id', tenantId);
            if (maintError) {
                console.error("Erro carregando manutenção:", getErrorMessage(maintError));
            } else {
                setMaintenanceOrders(maintData || []);
            }

        } catch (error) {
            console.error("Erro geral ao carregar dados:", getErrorMessage(error));
        }
    }, [tenantId]);

    useEffect(() => {
        const initSession = async () => {
            const demo = localStorage.getItem('obrafacil_demo') === 'true';
            
            // Carregar configurações da empresa (persistente)
            const savedCompany = localStorage.getItem('obrafacil_company_settings');
            if (savedCompany) {
                setCompanySettings(JSON.parse(savedCompany));
            }

            if (demo) {
                setIsDemo(true);
                setTenantId('demo-tenant');
                // Load Mock Data
                setClients(mockClients);
                setEquipment(mockEquipment);
                setRentalOrders(mockOrders);
                setContracts(mockContracts);
                
                // Carregar config demo específica se existir
                const demoCompany = localStorage.getItem('obrafacil_demo_company');
                if (demoCompany) setCompanySettings(JSON.parse(demoCompany));
                
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                fetchTenant(session.user.id);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                fetchTenant(session.user.id);
            } else {
                setTenantId(null);
                setIsDemo(false);
                setClients([]);
                setEquipment([]);
                setRentalOrders([]);
                localStorage.removeItem('obrafacil_demo');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Trigger fetch when tenantId changes
    useEffect(() => {
        if (tenantId && !isDemo) {
            fetchData();
        }
    }, [tenantId, isDemo, fetchData]);

    const handleLoginSuccess = () => {
        const isDemoMode = localStorage.getItem('obrafacil_demo') === 'true';
        if (isDemoMode) {
            setIsDemo(true);
            setTenantId('demo-tenant');
            setClients(mockClients);
            setEquipment(mockEquipment);
            setRentalOrders(mockOrders);
            setContracts(mockContracts);
            
            const demoCompany = localStorage.getItem('obrafacil_demo_company');
            if (demoCompany) setCompanySettings(JSON.parse(demoCompany));
        } else {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if(session) fetchTenant(session.user.id);
            });
        }
    };

    // Handlers
    const handleLogout = async () => {
        if (isDemo) {
            localStorage.removeItem('obrafacil_demo');
            setIsDemo(false);
            setSession(null);
        } else {
            await supabase.auth.signOut();
        }
    };

    const handleSaveClient = async (data: any) => {
        if (isDemo) {
            const newItem = { 
                ...data, 
                id: data.id || `CLI-MOCK-${Date.now()}`,
                status: data.status || 'Ativo'
            };
            setClients(prev => {
                 const exists = prev.find(c => c.id === newItem.id);
                 return exists ? prev.map(c => c.id === newItem.id ? newItem : c) : [newItem, ...prev];
            });
            setIsAddClientModalOpen(false);
            return;
        }

        // Try to recover tenantId if missing but session exists
        let currentTenantId = tenantId;
        if (!currentTenantId && session) {
             const { data: user } = await supabase.from('users').select('tenant_id').eq('auth_id', session.user.id).single();
             if (user) {
                 currentTenantId = user.tenant_id;
                 setTenantId(user.tenant_id);
             }
        }

        if (!supabase || !currentTenantId) {
            alert("Sessão expirada ou inválida. Por favor, recarregue a página ou faça login novamente.");
            return;
        }

        try {
            let savedClient: Customer | null = null;

            // Updated table name: 'clients' instead of 'customers'
            if (data.id) {
                const { data: updatedData, error } = await supabase
                    .from('clients')
                    .update(data)
                    .eq('id', data.id)
                    .select()
                    .single();

                if (error) throw error;
                savedClient = updatedData;
            } else {
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const timestamp = Date.now().toString().slice(-4);
                const newId = `CLI-${timestamp}${randomSuffix}`;

                const newClient = {
                    ...data,
                    id: newId,
                    tenant_id: currentTenantId,
                    status: 'Ativo'
                };

                const { data: createdData, error } = await supabase
                    .from('clients')
                    .insert(newClient)
                    .select()
                    .single();

                if (error) throw error;
                savedClient = createdData;
            }

            if (savedClient) {
                setClients(prev => {
                    const exists = prev.find(c => c.id === savedClient!.id);
                    return exists 
                        ? prev.map(c => c.id === savedClient!.id ? savedClient! : c) 
                        : [savedClient!, ...prev];
                });
                setIsAddClientModalOpen(false);
            }

        } catch (error: any) {
            console.error("Erro ao salvar cliente:", error);
            alert(`Falha ao salvar cliente: ${getErrorMessage(error)}`);
        }
    };

    const handleSaveEquipment = async (data: any) => {
         if (isDemo) {
            const newItem = { ...data, id: data.id || `EQ-MOCK-${Date.now()}` };
            setEquipment(prev => {
                const exists = prev.find(e => e.id === newItem.id);
                return exists ? prev.map(e => e.id === newItem.id ? newItem : e) : [newItem, ...prev];
            });
            setIsAddEquipmentModalOpen(false);
            return;
        }

        let currentTenantId = tenantId;
        if (!currentTenantId && session) {
             const { data: user } = await supabase.from('users').select('tenant_id').eq('auth_id', session.user.id).single();
             if (user) {
                 currentTenantId = user.tenant_id;
                 setTenantId(user.tenant_id);
             }
        }

        if (!supabase || !currentTenantId) {
            alert("Sessão inválida.");
            return;
        }

        try {
            const payload = { ...data, tenant_id: currentTenantId };
            
            let savedEquipment: Equipment | null = null;

            // Updated table name: 'equipments' instead of 'equipment'
            if (data.id) {
                const { data: updated, error } = await supabase.from('equipments').update(payload).eq('id', data.id).select().single();
                if (error) throw error;
                savedEquipment = updated;
            } else {
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const timestamp = Date.now().toString().slice(-4);
                const newId = `EQ-${timestamp}${randomSuffix}`;
                
                const { data: created, error } = await supabase.from('equipments').insert({ ...payload, id: newId }).select().single();
                if (error) throw error;
                savedEquipment = created;
            }

            if (savedEquipment) {
                setEquipment(prev => {
                    const exists = prev.find(e => e.id === savedEquipment!.id);
                    return exists ? prev.map(e => e.id === savedEquipment!.id ? savedEquipment! : e) : [savedEquipment!, ...prev];
                });
                setIsAddEquipmentModalOpen(false);
            }
        } catch (error: any) {
            console.error("Erro ao salvar equipamento", error);
            alert(`Erro ao salvar equipamento: ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteClient = (client: Customer) => {
        setConfirmationProps({
            title: 'Excluir Cliente',
            message: `Tem certeza que deseja excluir o cliente ${client.name}?`,
            onConfirm: async () => {
                if (isDemo) {
                    setClients(prev => prev.filter(c => c.id !== client.id));
                } else if (supabase) {
                    // Updated table name: 'clients'
                    const { error } = await supabase.from('clients').delete().eq('id', client.id);
                    if (!error) {
                        setClients(prev => prev.filter(c => c.id !== client.id));
                    } else {
                        alert(`Erro ao excluir: ${getErrorMessage(error)}`);
                    }
                }
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };

    const handleDeleteEquipment = (eq: Equipment) => {
        setConfirmationProps({
            title: 'Excluir Equipamento',
            message: `Tem certeza que deseja excluir o equipamento ${eq.name}?`,
            onConfirm: async () => {
                if (isDemo) {
                    setEquipment(prev => prev.filter(e => e.id !== eq.id));
                } else if (supabase) {
                    // Updated table name: 'equipments'
                    const { error } = await supabase.from('equipments').delete().eq('id', eq.id);
                    if (!error) {
                        setEquipment(prev => prev.filter(e => e.id !== eq.id));
                    } else {
                        alert(`Erro ao excluir: ${getErrorMessage(error)}`);
                    }
                }
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };

    const handleSaveOrder = async (orderData: any, onSuccess?: (saved: RentalOrder) => void) => {
        if (isDemo) {
            const newOrder = { 
                ...orderData, 
                id: orderData.id || `PED-MOCK-${Date.now()}`,
                status: orderData.status || 'Proposta',
                statusHistory: orderData.statusHistory || [{ status: 'Proposta', date: new Date().toISOString() }]
            };
            setRentalOrders(prev => {
                const exists = prev.find(o => o.id === newOrder.id);
                return exists ? prev.map(o => o.id === newOrder.id ? newOrder : o) : [newOrder, ...prev];
            });
            if (onSuccess) onSuccess(newOrder);
            else setIsQuoteModalOpen(false);
            return;
        }

        let currentTenantId = tenantId;
        if (!currentTenantId && session) {
             const { data: user } = await supabase.from('users').select('tenant_id').eq('auth_id', session.user.id).single();
             if (user) {
                 currentTenantId = user.tenant_id;
                 setTenantId(user.tenant_id);
             }
        }

        if (!supabase || !currentTenantId) {
            alert("Sessão inválida.");
            return;
        }

        try {
            const payload = { ...orderData, tenant_id: currentTenantId };
            
            let savedOrder: RentalOrder | null = null;

            if (orderData.id) {
                const { data, error } = await supabase.from('rental_orders').update(payload).eq('id', orderData.id).select().single();
                if (error) throw error;
                savedOrder = data;
            } else {
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const timestamp = Date.now().toString().slice(-4);
                const newId = `PED-${timestamp}${randomSuffix}`;
                
                const newOrderPayload = {
                    ...payload,
                    id: newId,
                    status: 'Proposta',
                    createdDate: new Date().toISOString(),
                    statusHistory: [{ status: 'Proposta', date: new Date().toISOString() }]
                };

                const { data, error } = await supabase.from('rental_orders').insert(newOrderPayload).select().single();
                if (error) throw error;
                savedOrder = data;
            }

            if (savedOrder) {
                setRentalOrders(prev => {
                    const exists = prev.find(o => o.id === savedOrder!.id);
                    return exists ? prev.map(o => o.id === savedOrder!.id ? savedOrder! : o) : [savedOrder!, ...prev];
                });
                if (onSuccess) onSuccess(savedOrder);
                else setIsQuoteModalOpen(false);
            }

        } catch (error: any) {
            console.error("Erro ao salvar pedido", error);
            alert(`Erro ao salvar pedido: ${getErrorMessage(error)}`);
        }
    };

    const handleDeleteOrder = (order: RentalOrder) => {
         setConfirmationProps({
            title: 'Excluir Pedido',
            message: `Tem certeza que deseja excluir o pedido ${order.id}?`,
            onConfirm: async () => {
                if (isDemo) {
                    setRentalOrders(prev => prev.filter(o => o.id !== order.id));
                } else if (supabase) {
                    const { error } = await supabase.from('rental_orders').delete().eq('id', order.id);
                    if (!error) {
                        setRentalOrders(prev => prev.filter(o => o.id !== order.id));
                    } else {
                        alert(`Erro ao excluir: ${getErrorMessage(error)}`);
                    }
                }
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };
    
    const handleUpdateOrderStatus = async (orderId: string, newStatus: RentalStatus) => {
        // Optimistic update
        setRentalOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status: newStatus, statusHistory: [...(o.statusHistory || []), { status: newStatus, date: new Date().toISOString() }] };
            }
            return o;
        }));

        if (!isDemo && supabase) {
            try {
                // Fetch current history first to append
                const currentOrder = rentalOrders.find(o => o.id === orderId);
                const currentHistory = currentOrder?.statusHistory || [];
                const newHistory = [...currentHistory, { status: newStatus, date: new Date().toISOString() }];

                const { error } = await supabase.from('rental_orders')
                    .update({ status: newStatus, statusHistory: newHistory })
                    .eq('id', orderId);
                
                if (error) throw error;
            } catch (error: any) {
                console.error("Erro ao atualizar status", error);
                alert(`Falha ao atualizar status: ${getErrorMessage(error)}`);
            }
        }
            
        // Auto-create contract if Active
        if (newStatus === 'Ativo') {
                const order = rentalOrders.find(o => o.id === orderId);
                if (order && !contracts.some(c => c.id === `CON-${order.id}`)) {
                    const newContract: Contract = {
                        id: `CON-${order.id}`,
                        client: order.client,
                        startDate: order.startDate,
                        endDate: order.endDate,
                        value: order.value + (order.freightCost||0) + (order.accessoriesCost||0) - (order.discount||0),
                        status: 'Ativo'
                    };
                    setContracts(prev => [...prev, newContract]);
                    // Se não for demo, salvar contrato no supabase aqui também (futuro)
                }
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, newStatus: PaymentStatus) => {
        setRentalOrders(prev => prev.map(o => 
            o.id === orderId ? { ...o, paymentStatus: newStatus } : o
        ));

        if (!isDemo && supabase) {
            await supabase.from('rental_orders').update({ paymentStatus: newStatus }).eq('id', orderId);
        }
    };

    const handleSaveDeliveryDate = (orderId: string, date: string) => {
         if (isDemo) {
            setRentalOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryDate: date } : o));
            setIsScheduleDeliveryModalOpen(false);
        } else if (supabase) {
            supabase.from('rental_orders').update({ deliveryDate: date }).eq('id', orderId)
                .then(({error}) => {
                    if(!error) {
                        setRentalOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryDate: date } : o));
                        setIsScheduleDeliveryModalOpen(false);
                    }
                });
        }
    };

    const handleDeleteContract = (contract: Contract) => {
        setConfirmationProps({
            title: 'Excluir Contrato',
            message: `Tem certeza que deseja excluir o contrato ${contract.id}?`,
            onConfirm: () => {
                if (isDemo) {
                    setContracts(prev => prev.filter(c => c.id !== contract.id));
                }
                // Implement supabase delete logic for contracts if table exists
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };

    const handleSaveMaintenance = async (data: any) => {
         if (isDemo) {
            const newItem = { ...data, id: data.id || `OS-MOCK-${Date.now()}` };
            setMaintenanceOrders(prev => {
                const exists = prev.find(o => o.id === newItem.id);
                return exists ? prev.map(o => o.id === newItem.id ? newItem : o) : [newItem, ...prev];
            });
            setIsAddMaintenanceModalOpen(false);
            return;
        }

        let currentTenantId = tenantId;
        if (!currentTenantId && session) {
             const { data: user } = await supabase.from('users').select('tenant_id').eq('auth_id', session.user.id).single();
             if (user) currentTenantId = user.tenant_id;
        }

        if (!supabase || !currentTenantId) return;

        try {
            const payload = { ...data, tenant_id: currentTenantId };
            let savedOrder: MaintenanceOrder | null = null;

            if (data.id) {
                const { data: updated, error } = await supabase.from('maintenance_orders').update(payload).eq('id', data.id).select().single();
                if (error) throw error;
                savedOrder = updated;
            } else {
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const newId = `OS-${randomSuffix}`;
                const { data: created, error } = await supabase.from('maintenance_orders').insert({ ...payload, id: newId }).select().single();
                if (error) throw error;
                savedOrder = created;
            }

            if (savedOrder) {
                setMaintenanceOrders(prev => {
                    const exists = prev.find(o => o.id === savedOrder!.id);
                    return exists ? prev.map(o => o.id === savedOrder!.id ? savedOrder! : o) : [savedOrder!, ...prev];
                });
                setIsAddMaintenanceModalOpen(false);
            }
        } catch (error: any) {
            alert(`Erro ao salvar manutenção: ${getErrorMessage(error)}`);
        }
    };

     const handleDeleteMaintenance = (order: MaintenanceOrder) => {
         setConfirmationProps({
            title: 'Excluir Manutenção',
            message: `Tem certeza que deseja excluir a OS ${order.id}?`,
            onConfirm: async () => {
                if (isDemo) {
                    setMaintenanceOrders(prev => prev.filter(o => o.id !== order.id));
                } else if (supabase) {
                    const { error } = await supabase.from('maintenance_orders').delete().eq('id', order.id);
                    if (!error) {
                        setMaintenanceOrders(prev => prev.filter(o => o.id !== order.id));
                    }
                }
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };

    const handleSaveUser = (data: any) => {
         // User management usually requires admin Auth API, keeping simple for now
         if (isDemo) {
             const newItem = { ...data, id: data.id || `USR-MOCK-${Date.now()}`, lastLogin: new Date().toISOString() };
             setUsers(prev => {
                const exists = prev.find(u => u.id === newItem.id);
                return exists ? prev.map(u => u.id === newItem.id ? newItem : u) : [newItem, ...prev];
             });
             setIsAddUserModalOpen(false);
         }
    };

    const handleDeleteUser = (user: User) => {
         setConfirmationProps({
            title: 'Excluir Usuário',
            message: `Tem certeza que deseja excluir o usuário ${user.name}?`,
            onConfirm: () => {
                if (isDemo) {
                    setUsers(prev => prev.filter(u => u.id !== user.id));
                }
                setIsConfirmationModalOpen(false);
            }
        });
        setIsConfirmationModalOpen(true);
    };
    
    const handleSavePrices = (updatedEquipment: Equipment[]) => {
        if(isDemo) {
            setEquipment(updatedEquipment);
            setIsPriceTableModalOpen(false);
        }
        // Implement batch update for supabase if needed
    };

    const handleSaveCategory = (categoryData: any) => {
        if(isDemo) {
            if (categoryData.id) {
                 setCategories(prev => prev.map(c => c.id === categoryData.id ? { ...c, ...categoryData } : c));
            } else {
                 setCategories(prev => [...prev, { id: `CAT-${Date.now()}`, ...categoryData }]);
            }
        }
    };

    const handleDeleteCategory = (category: EquipmentCategory) => {
        if(isDemo) {
            setCategories(prev => prev.filter(c => c.id !== category.id));
        }
    };

    const handleSaveCompanySettings = (settings: CompanySettings) => {
        setCompanySettings(settings);
        localStorage.setItem('obrafacil_company_settings', JSON.stringify(settings));
        
        if (isDemo) {
            localStorage.setItem('obrafacil_demo_company', JSON.stringify(settings));
        }
        setIsCompanySettingsModalOpen(false);
    };

    const renderContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard 
                            onOpenQuoteModal={() => { setQuoteEquipment(null); setOrderToEdit(null); setIsQuoteModalOpen(true); }} 
                            rentalOrders={rentalOrders} 
                            equipment={equipment} 
                            maintenanceOrders={maintenanceOrders}
                        />;
            case 'Locação':
                return <Locacao 
                            orders={rentalOrders} 
                            clients={clients} 
                            onOpenAddModal={(eq) => { setQuoteEquipment(eq || null); setOrderToEdit(null); setIsQuoteModalOpen(true); }} 
                            onEdit={(order) => { setOrderToEdit(order); setIsQuoteModalOpen(true); }}
                            onDelete={handleDeleteOrder}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                            onOpenScheduleDeliveryModal={(order) => { setDeliveryOrder(order); setIsScheduleDeliveryModalOpen(true); }}
                            onOpenPrintModal={(order) => { setPrintOrder(order); setIsQuotePrintModalOpen(true); }}
                            stages={stages}
                        />;
            case 'Equipamentos':
                return <Equipamentos 
                            equipment={equipment} 
                            categories={categories}
                            onOpenQuoteModal={(eq) => { setQuoteEquipment(eq); setOrderToEdit(null); setIsQuoteModalOpen(true); }}
                            onAdd={() => { setEquipmentToEdit(null); setIsAddEquipmentModalOpen(true); }}
                            onEdit={(eq) => { setEquipmentToEdit(eq); setIsAddEquipmentModalOpen(true); }}
                            onDelete={handleDeleteEquipment}
                        />;
            case 'Clientes':
                return <Clientes 
                            clients={clients} 
                            onOpenAddClientModal={() => { setClientToEdit(null); setIsAddClientModalOpen(true); }}
                            onEdit={(client) => { setClientToEdit(client); setIsAddClientModalOpen(true); }}
                            onDelete={handleDeleteClient}
                        />;
            case 'Orçamentos':
                return <Orcamentos 
                            quotes={rentalOrders.filter(o => o.status === 'Proposta' || o.status === 'Recusado')} 
                            clients={clients}
                            onOpenAddModal={() => { setQuoteEquipment(null); setOrderToEdit(null); setIsQuoteModalOpen(true); }}
                            onEdit={(order) => { setOrderToEdit(order); setIsQuoteModalOpen(true); }}
                            onDelete={handleDeleteOrder}
                            onUpdateStatus={handleUpdateOrderStatus}
                            onOpenPrintModal={(order) => { setPrintOrder(order); setIsQuotePrintModalOpen(true); }}
                        />;
            case 'Contratos':
                return <Contratos 
                            contracts={contracts} 
                            rentalOrders={rentalOrders}
                            clients={clients}
                            onDelete={handleDeleteContract}
                            onEdit={() => {}} // Simple edit not implemented for contract
                            onOpenContractPrintModal={(contract) => { setPrintContract(contract); setIsContractPrintModalOpen(true); }}
                            onOpenReceiptPrintModal={(order) => { setPrintReceiptOrder(order); setIsReceiptPrintModalOpen(true); }}
                        />;
            case 'Agenda':
                return <Agenda rentalOrders={rentalOrders} maintenanceOrders={maintenanceOrders} />;
            case 'Manutenção':
                return <Manutencao 
                            maintenanceOrders={maintenanceOrders}
                            onAdd={() => { setMaintenanceOrderToEdit(null); setIsAddMaintenanceModalOpen(true); }}
                            onEdit={(order) => { setMaintenanceOrderToEdit(order); setIsAddMaintenanceModalOpen(true); }}
                            onDelete={handleDeleteMaintenance}
                            onUpdateStatus={(id, status) => { 
                                if(isDemo) setMaintenanceOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
                                else if (supabase) supabase.from('maintenance_orders').update({status}).eq('id', id);
                            }}
                        />;
            case 'Usuários':
                return <Usuarios 
                            users={users}
                            onAdd={() => { setUserToEdit(null); setIsAddUserModalOpen(true); }}
                            onEdit={(user) => { setUserToEdit(user); setIsAddUserModalOpen(true); }}
                            onDelete={handleDeleteUser}
                        />;
            case 'Configurações':
                return <Configuracoes 
                            onOpenPriceTableModal={() => setIsPriceTableModalOpen(true)}
                            onOpenCategoryManagerModal={() => setIsCategoryManagerModalOpen(true)}
                            onOpenPipelineManagerModal={() => setIsPipelineManagerModalOpen(true)}
                            onOpenCompanySettingsModal={() => setIsCompanySettingsModalOpen(true)}
                            setActivePage={setActivePage}
                        />;
            default:
                return <Dashboard 
                            onOpenQuoteModal={() => { setQuoteEquipment(null); setOrderToEdit(null); setIsQuoteModalOpen(true); }} 
                            rentalOrders={rentalOrders} 
                            equipment={equipment} 
                            maintenanceOrders={maintenanceOrders}
                        />;
        }
    };

    if (!session && !isDemo) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const navigationItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Locação', icon: Truck },
        { name: 'Equipamentos', icon: HardHat },
        { name: 'Clientes', icon: Users },
        { name: 'Orçamentos', icon: FileText },
        { name: 'Contratos', icon: FileText },
        { name: 'Agenda', icon: Calendar },
        { name: 'Manutenção', icon: Wrench },
        { name: 'Usuários', icon: Users },
        { name: 'Configurações', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-neutral-bg text-neutral-text-primary overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-neutral-card shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-primary text-white p-2 rounded-lg">
                        <HardHat size={24} />
                    </div>
                    <span className="text-xl font-bold text-primary">ObraFácil</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto md:hidden text-gray-500"><LogOut size={20} /></button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => { setActivePage(item.name); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                        activePage === item.name 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'text-neutral-text-secondary hover:bg-neutral-bg hover:text-primary'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={20} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-lg">
                            <HardHat size={20} />
                        </div>
                        <span className="text-lg font-bold text-primary">ObraFácil</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Modals */}
            {isAddClientModalOpen && (
                <AddClientModal 
                    onClose={() => setIsAddClientModalOpen(false)} 
                    onSave={handleSaveClient} 
                    clientToEdit={clientToEdit} 
                />
            )}
            {isAddEquipmentModalOpen && (
                <AddEquipmentModal 
                    onClose={() => setIsAddEquipmentModalOpen(false)} 
                    onSave={handleSaveEquipment} 
                    equipmentToEdit={equipmentToEdit}
                    categories={categories}
                />
            )}
            {isQuoteModalOpen && (
                <QuoteModal 
                    onClose={() => setIsQuoteModalOpen(false)} 
                    equipment={quoteEquipment}
                    orderToEdit={orderToEdit}
                    clients={clients}
                    onSave={handleSaveOrder}
                    allEquipment={equipment}
                    onOpenPrintModal={(order) => { setPrintOrder(order); setIsQuotePrintModalOpen(true); }}
                />
            )}
            {isScheduleDeliveryModalOpen && deliveryOrder && (
                <ScheduleDeliveryModal 
                    isOpen={isScheduleDeliveryModalOpen}
                    onClose={() => setIsScheduleDeliveryModalOpen(false)}
                    order={deliveryOrder}
                    onSave={handleSaveDeliveryDate}
                />
            )}
            {isQuotePrintModalOpen && printOrder && (
                <QuotePrintModal 
                    quote={printOrder} 
                    client={clients.find(c => c.name === printOrder.client)}
                    onClose={() => setIsQuotePrintModalOpen(false)} 
                />
            )}
            {isContractPrintModalOpen && printContract && (
                <ContractPrintModal
                    contract={printContract}
                    order={rentalOrders.find(o => `CON-${o.id}` === printContract.id)}
                    client={clients.find(c => c.name === printContract.client)}
                    onClose={() => setIsContractPrintModalOpen(false)}
                />
            )}
            {isReceiptPrintModalOpen && printReceiptOrder && (
                <ReceiptPrintModal
                    order={printReceiptOrder}
                    onClose={() => setIsReceiptPrintModalOpen(false)}
                />
            )}
            {isAddMaintenanceModalOpen && (
                <AddMaintenanceModal 
                    onClose={() => setIsAddMaintenanceModalOpen(false)}
                    onSave={handleSaveMaintenance}
                    maintenanceOrderToEdit={maintenanceOrderToEdit}
                    allEquipment={equipment}
                />
            )}
            {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                    onSave={handleSaveUser}
                    userToEdit={userToEdit}
                />
            )}
            {isPriceTableModalOpen && (
                <PriceTableModal 
                    onClose={() => setIsPriceTableModalOpen(false)}
                    onSave={handleSavePrices}
                    equipment={equipment}
                />
            )}
            {isCategoryManagerModalOpen && (
                <CategoryManagerModal 
                    isOpen={isCategoryManagerModalOpen}
                    onClose={() => setIsCategoryManagerModalOpen(false)}
                    categories={categories}
                    onSave={handleSaveCategory}
                    onDelete={handleDeleteCategory}
                    allEquipment={equipment}
                />
            )}
            {isPipelineManagerModalOpen && (
                <PipelineManagerModal 
                    isOpen={isPipelineManagerModalOpen}
                    onClose={() => setIsPipelineManagerModalOpen(false)}
                    stages={stages}
                    onSave={(newStages) => { setStages(newStages); setIsPipelineManagerModalOpen(false); }}
                />
            )}
            {isCompanySettingsModalOpen && (
                <CompanySettingsModal 
                    isOpen={isCompanySettingsModalOpen}
                    onClose={() => setIsCompanySettingsModalOpen(false)}
                    currentSettings={companySettings}
                    onSave={handleSaveCompanySettings}
                />
            )}
            {isConfirmationModalOpen && (
                <ConfirmationModal 
                    isOpen={isConfirmationModalOpen}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    onConfirm={confirmationProps.onConfirm}
                    title={confirmationProps.title}
                    message={confirmationProps.message}
                />
            )}
        </div>
    );
};

export default App;