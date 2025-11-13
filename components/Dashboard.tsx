import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, Percent, HardHat, Wrench, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import KpiCard from './KpiCard';
import RevenueChart from './RevenueChart';
import { Activity, Client, Kpi, RevenueData, Equipment, MaintenanceOrder, RentalOrder } from '../types';


const periods = ['Este Mês', 'Últimos 7 dias', 'Últimos 30 dias', 'Este Ano'];

const ActivityList: React.FC<{title: string; items: Activity[]}> = ({title, items}) => (
    <div className="bg-neutral-card p-6 rounded-lg shadow-sm h-full">
        <h3 className="font-bold text-lg text-neutral-text-primary mb-4">{title}</h3>
        <ul className="space-y-4">
            {items.map(item => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                        <p className="font-semibold text-neutral-text-primary">{item.id}</p>
                        <p className="text-neutral-text-secondary">{item.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="font-medium text-neutral-text-secondary">{item.status}</span>
                    </div>
                </li>
            ))}
             {items.length === 0 && <p className="text-center text-neutral-text-secondary text-sm pt-4">Nenhuma atividade no momento.</p>}
        </ul>
    </div>
);

const ClientList: React.FC<{title: string; clients: Client[]}> = ({title, clients}) => (
     <div className="bg-neutral-card p-6 rounded-lg shadow-sm h-full">
        <h3 className="font-bold text-lg text-neutral-text-primary mb-4">{title}</h3>
        <ul className="space-y-3">
            {clients.map(client => (
                <li key={client.name} className="flex items-center justify-between text-sm hover:bg-neutral-bg p-2 rounded-md">
                    <p className="font-semibold text-neutral-text-primary">{client.name}</p>
                    <p className="text-neutral-text-primary font-bold">R$ {client.debt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </li>
            ))}
             {clients.length === 0 && <p className="text-center text-neutral-text-secondary text-sm pt-4">Nenhum cliente para exibir.</p>}
        </ul>
    </div>
);


const Dashboard: React.FC<{ 
    onOpenQuoteModal: (equipment?: Equipment | null) => void;
    rentalOrders: RentalOrder[];
    equipment: Equipment[];
    maintenanceOrders: MaintenanceOrder[];
}> = ({ onOpenQuoteModal, rentalOrders, equipment, maintenanceOrders }) => {
    const [isDateFilterOpen, setDateFilterOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Este Mês');
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const dateFilterRef = useRef<HTMLDivElement>(null);

    // KPI Calculations
    const kpiData: Kpi[] = useMemo(() => {
        const totalRevenue = rentalOrders.reduce((acc, order) => {
            if (order.status !== 'Proposta') {
                return acc + order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);
            }
            return acc;
        }, 0);

        const equipmentInUse = equipment.filter(e => e.status === 'Em Uso').length;
        const totalEquipment = equipment.length;
        const averageUtilization = totalEquipment > 0 ? Math.round((equipmentInUse / totalEquipment) * 100) : 0;
        
        const availableEquipment = equipment.filter(e => e.status === 'Disponível').length;
        
        const pendingMaintenance = maintenanceOrders.filter(m => m.status === 'Pendente').length;

        return [
            { title: 'Receita (período)', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, Icon: DollarSign },
            { title: 'Utilização Média', value: `${averageUtilization}%`, Icon: Percent },
            { title: 'Equipamentos Disponíveis', value: String(availableEquipment), Icon: HardHat },
            { title: 'Pendências de Manutenção', value: String(pendingMaintenance), Icon: Wrench, isWarning: true },
        ];
    }, [rentalOrders, equipment, maintenanceOrders]);
    
    // Revenue Chart Data
    useEffect(() => {
        const generateRevenueData = (orders: RentalOrder[]): RevenueData[] => {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const revenueByMonth: Record<string, number> = {};

            orders.forEach(order => {
                if (order.status !== 'Proposta') {
                    const date = new Date(order.createdDate + 'T00:00:00');
                    if(date.getFullYear() === 2024){ // Filter for current year as per sample data
                        const monthIndex = date.getMonth();
                        const monthName = months[monthIndex];
                        const orderTotal = order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);
                        if (revenueByMonth[monthName]) {
                            revenueByMonth[monthName] += orderTotal;
                        } else {
                            revenueByMonth[monthName] = orderTotal;
                        }
                    }
                }
            });

            const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => months.indexOf(a) - months.indexOf(b));

            return sortedMonths.map(month => ({
                name: month,
                Receita: revenueByMonth[month],
            }));
        };

        setRevenueData(generateRevenueData(rentalOrders));
    }, [rentalOrders]);

    // Entregas e Retornos Data
    const deliveries: Activity[] = useMemo(() => {
        const relevantOrders = rentalOrders
            .filter(o => ['Em Rota', 'Ativo', 'Concluído'].includes(o.status))
            .sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
            .slice(0,3);

        return relevantOrders.map(o => {
            let statusText = o.status;
            let color = 'bg-gray-500';

            if(o.status === 'Em Rota') {
                color = 'bg-blue-500';
            } else if (o.status === 'Ativo') {
                statusText = 'Ag. Coleta';
                color = 'bg-yellow-500';
            } else if (o.status === 'Concluído') {
                color = 'bg-green-500';
            }
            return {
                id: o.id,
                client: o.client,
                status: statusText,
                color: color,
            };
        });
    }, [rentalOrders]);


    // Top Clients Data (based on total order value)
    const topClients: Client[] = useMemo(() => {
        const clientValue: Record<string, number> = {};
        rentalOrders.forEach(order => {
             const total = order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);
             if (clientValue[order.client]) {
                 clientValue[order.client] += total;
             } else {
                 clientValue[order.client] = total;
             }
        });

        return Object.entries(clientValue)
            .map(([name, debt]) => ({ name, debt }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 5);
    }, [rentalOrders]);

    // Recent Activities Data
    const recentActivities: Activity[] = useMemo(() => {
        return rentalOrders
            .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
            .slice(0, 2)
            .map(o => {
                let statusText = '';
                let color = '';
                let clientText = '';

                if (o.status === 'Aprovado') {
                    statusText = 'Aprovado';
                    color = 'bg-green-500';
                    clientText = `Orçamento para ${o.client} aprovado.`
                } else {
                    statusText = 'Pendente';
                    color = 'bg-orange-500';
                    clientText = `Orçamento para ${o.client} criado.`
                }

                return {
                    id: o.id,
                    client: clientText,
                    status: statusText,
                    color: color,
                };
            });
    }, [rentalOrders]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
                setDateFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const dropdownVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15, ease: 'easeIn' } }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Dashboard</h2>
                    <p className="text-neutral-text-secondary mt-1">Visão geral da sua operação.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                     <div className="relative" ref={dateFilterRef}>
                        <button onClick={() => setDateFilterOpen(prev => !prev)} className="flex items-center gap-2 text-sm font-semibold bg-neutral-card px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-card-alt border border-gray-200">
                            <span>{selectedPeriod}</span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isDateFilterOpen && (
                                <motion.div 
                                    className="absolute right-0 mt-2 w-48 bg-neutral-card rounded-lg shadow-lg py-1 z-10 border border-gray-200"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    {periods.map(period => (
                                        <button 
                                            key={period} 
                                            onClick={() => { setSelectedPeriod(period); setDateFilterOpen(false); }} 
                                            className="w-full text-left px-4 py-2 text-sm text-neutral-text-primary hover:bg-neutral-bg"
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={() => onOpenQuoteModal()} className="flex items-center gap-2 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-secondary-dark transition-colors">
                        <Plus size={16} />
                        <span>Novo Orçamento</span>
                    </button>
                </div>
            </header>

            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </motion.div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                       <RevenueChart data={revenueData} />
                    </div>
                    <div>
                       <ActivityList title="Entregas e Retornos" items={deliveries} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ClientList title="Top 5 Clientes (Valor Total)" clients={topClients} />
                    </div>
                    <div>
                        <ActivityList title="Atividades Recentes e Alertas" items={recentActivities} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;