import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Percent, HardHat, Wrench, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import KpiCard from './KpiCard';
import RevenueChart from './RevenueChart';
import { Activity, Client, Kpi, RevenueData, Equipment } from '../types';

const kpiData: Kpi[] = [
    { title: 'Receita (período)', value: 'R$ 1.250.300', change: 12, Icon: DollarSign },
    { title: 'Utilização Média', value: '82%', change: -2, Icon: Percent },
    { title: 'Equipamentos Disponíveis', value: '48', change: 5, Icon: HardHat },
    { title: 'Pendências de Manutenção', value: '7', change: 1, Icon: Wrench, isWarning: true },
];

const deliveries: Activity[] = [
    { id: 'ORD-001', client: 'Construtora Alfa', status: 'Em Rota', color: 'bg-blue-500' },
    { id: 'ORD-002', client: 'Engenharia Beta', status: 'Ag. Coleta', color: 'bg-yellow-500' },
    { id: 'ORD-003', client: 'Obras Gamma', status: 'Concluído', color: 'bg-green-500' },
];

const recentActivities: Activity[] = [
    { id: 'CTR-123', client: 'Contrato com Construtora Alfa assinado.', status: 'Pendente', color: 'bg-orange-500' },
    { id: 'ORC-456', client: 'Orçamento para Engenharia Beta aprovado.', status: 'Aprovado', color: 'bg-green-500' },
];

const topClients: Client[] = [
    { name: 'Construtora Alfa', debt: 15230.50 },
    { name: 'Engenharia Beta', debt: 12100.00 },
    { name: 'Obras Gamma', debt: 8750.80 },
    { name: 'Projetos Delta', debt: 4500.00 },
    { name: 'Infra Epsilon', debt: 2100.25 },
];

const periods = ['Este Mês', 'Últimos 7 dias', 'Últimos 30 dias', 'Este Ano'];

const generateRevenueData = (): RevenueData[] => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    return months.map(month => ({
        name: month,
        Receita: Math.floor(Math.random() * (250000 - 100000 + 1)) + 100000,
    }));
};


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
                    <p className="text-accent-danger font-bold">R$ {client.debt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </li>
            ))}
        </ul>
    </div>
);


const Dashboard: React.FC<{ onOpenQuoteModal: (equipment?: Equipment | null) => void }> = ({ onOpenQuoteModal }) => {
    const [isDateFilterOpen, setDateFilterOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Este Mês');
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const dateFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRevenueData(generateRevenueData());
    }, [selectedPeriod]);

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <RevenueChart data={revenueData} />
                </div>
                <div className="space-y-6">
                   <ActivityList title="Entregas e Retornos" items={deliveries} />
                </div>
                 <div className="lg:col-span-2">
                    <ClientList title="Top 5 Clientes com Dívida" clients={topClients} />
                </div>
                <div>
                    <ActivityList title="Atividades Recentes e Alertas" items={recentActivities} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;