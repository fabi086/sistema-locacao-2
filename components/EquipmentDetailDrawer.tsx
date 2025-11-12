import React, { useState, useEffect, useMemo } from 'react';
// FIX: Import Variants type from framer-motion to fix type errors.
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Calendar, Wrench, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Equipment, RentalHistoryItem, MaintenanceRecord } from '../types';

type Tab = 'Disponibilidade' | 'Histórico de Locações' | 'Manutenção';

const tabs: Tab[] = ['Disponibilidade', 'Histórico de Locações', 'Manutenção'];

const AvailabilityCalendar: React.FC<{ rentals: RentalHistoryItem[], maintenance: MaintenanceRecord[] }> = ({ rentals = [], maintenance = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    const eventsMap = useMemo(() => {
        const map = new Map<string, 'Em Uso' | 'Manutenção'>();
        
        (rentals || []).forEach(rental => {
            const start = new Date(rental.startDate + 'T00:00:00');
            const end = new Date(rental.endDate + 'T23:59:59');
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                map.set(d.toISOString().split('T')[0], 'Em Uso');
            }
        });

        (maintenance || []).forEach(maint => {
            map.set(maint.date, 'Manutenção');
        });

        return map;
    }, [rentals, maintenance]);

    const getDayStatus = (day: Date) => {
        const dateString = day.toISOString().split('T')[0];
        return eventsMap.get(dateString) || 'Disponível';
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const today = new Date();

        const calendarDays = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const status = getDayStatus(dayDate);
            const isToday = isSameDay(dayDate, today);

            let dayClasses = 'flex items-center justify-center h-10 w-10 text-sm rounded-full transition-colors';

            if (status === 'Em Uso') {
                dayClasses += ' bg-blue-500/80 text-white font-semibold';
            } else if (status === 'Manutenção') {
                dayClasses += ' bg-yellow-500/80 text-neutral-text-primary font-semibold';
            } else { // Disponível
                dayClasses += ' text-neutral-text-primary hover:bg-neutral-card-alt';
            }

            if (isToday) {
                dayClasses += ' ring-2 ring-primary ring-offset-1';
            }

            calendarDays.push(
                <div key={i} className={dayClasses}>
                    {i}
                </div>
            );
        }
        return calendarDays;
    };
    
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="p-4 bg-neutral-bg rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-neutral-card-alt"><ChevronLeft size={20} /></button>
                <h4 className="font-semibold text-lg">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-neutral-card-alt"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-text-secondary font-semibold mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <div key={index}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs text-neutral-text-secondary border-t border-neutral-card-alt pt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white rounded-full border border-gray-300"></span>Disponível</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500/80 rounded-full"></span>Em Uso</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>Manutenção</div>
            </div>
        </div>
    );
};

interface EquipmentDetailDrawerProps {
    equipment: Equipment;
    onClose: () => void;
    onOpenQuoteModal: (equipment: Equipment) => void;
}

const EquipmentDetailDrawer: React.FC<EquipmentDetailDrawerProps> = ({ equipment, onClose, onOpenQuoteModal }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Disponibilidade');
    
    useEffect(() => {
        setActiveTab('Disponibilidade');
    }, [equipment]);

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } },
    };

    // FIX: Explicitly type variants with Variants to fix type error.
    const drawerVariants: Variants = {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] } },
        exit: { x: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
    };
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Disponibilidade':
                return <AvailabilityCalendar rentals={equipment.rentalHistory || []} maintenance={equipment.maintenanceHistory || []} />;
            case 'Histórico de Locações':
                return (
                    <ul className="space-y-3">
                        {(equipment.rentalHistory || []).length > 0 ? (equipment.rentalHistory || []).map(item => (
                            <li key={item.id} className="p-4 bg-neutral-bg rounded-lg">
                                <p className="font-semibold">{item.client}</p>
                                <p className="text-sm text-neutral-text-secondary">De: {new Date(item.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(item.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                            </li>
                        )) : (<p className="text-center text-neutral-text-secondary p-4">Nenhum histórico de locação.</p>)}
                    </ul>
                );
            case 'Manutenção':
                return (
                     <ul className="space-y-3">
                        {(equipment.maintenanceHistory || []).length > 0 ? (equipment.maintenanceHistory || []).map(item => (
                            <li key={item.id} className="p-4 bg-neutral-bg rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{item.type}</p>
                                        <p className="text-sm text-neutral-text-secondary">{item.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">R$ {item.cost.toFixed(2)}</p>
                                        <p className="text-sm text-neutral-text-secondary">{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            </li>
                        )) : (<p className="text-center text-neutral-text-secondary p-4">Nenhum registro de manutenção.</p>)}
                    </ul>
                );
            default:
                return null;
        }
    }

    const handleReserveClick = () => {
        onOpenQuoteModal(equipment);
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/40 z-40 flex justify-end"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                className="bg-neutral-card w-full max-w-2xl h-full flex flex-col shadow-2xl"
                variants={drawerVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-neutral-card-alt flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-text-primary">{equipment.name}</h2>
                        <p className="text-neutral-text-secondary">{equipment.serialNumber} - {equipment.category}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-card-alt text-neutral-text-secondary transition-colors" aria-label="Fechar painel">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="border-b border-neutral-card-alt mb-6">
                        <nav className="flex space-x-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 font-semibold text-sm transition-colors ${
                                        activeTab === tab 
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-neutral-text-secondary hover:text-primary'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    {renderTabContent()}
                </div>

                <footer className="p-6 bg-neutral-card-alt flex justify-end items-center gap-4 border-t border-gray-200">
                    <button 
                        onClick={handleReserveClick}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors"
                    >
                        <Calendar size={16} />
                        Reservar Equipamento
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-neutral-text-primary bg-neutral-card rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                        <Wrench size={16} />
                        Criar Manutenção
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default EquipmentDetailDrawer;