import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Truck, Wrench } from 'lucide-react';
import { CalendarEvent, CalendarEventType, RentalOrder, MaintenanceOrder } from '../types';

const eventColors: Record<CalendarEventType, { bg: string; text: string; Icon: React.ElementType }> = {
    'Entrega': { bg: 'bg-blue-100', text: 'text-blue-700', Icon: Truck },
    'Coleta': { bg: 'bg-yellow-100', text: 'text-yellow-700', Icon: Truck },
    'Manutenção': { bg: 'bg-purple-100', text: 'text-purple-700', Icon: Wrench },
};

interface AgendaProps {
    rentalOrders: RentalOrder[];
    maintenanceOrders: MaintenanceOrder[];
}

const Agenda: React.FC<AgendaProps> = ({ rentalOrders, maintenanceOrders }) => {
    const [currentDate, setCurrentDate] = useState(new Date('2024-08-01T12:00:00Z'));

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        // Events from rental orders
        rentalOrders.forEach(order => {
            if (order.deliveryDate) {
                events.push({
                    id: `${order.id}-entrega`,
                    title: `Entrega: ${order.id}`,
                    date: order.deliveryDate,
                    type: 'Entrega'
                });
            }
            // Add collection event based on the rental end date
            if (['Ativo', 'Concluído', 'Pendente de Pagamento'].includes(order.status)) {
                 events.push({
                    id: `${order.id}-coleta`,
                    title: `Coleta: ${order.id}`,
                    date: order.endDate,
                    type: 'Coleta'
                 });
            }
        });

        // Events from maintenance orders
        maintenanceOrders.forEach(maint => {
            events.push({
                id: maint.id,
                title: `Manut: ${maint.equipment.substring(0, 10)}...`,
                date: maint.scheduledDate,
                type: 'Manutenção'
            });
        });

        return events;
    }, [rentalOrders, maintenanceOrders]);


    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();
        
        const days = [];
        // Dias do mês anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek; i > 0; i--) {
            days.push({ day: prevMonthLastDay - i + 1, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i + 1) });
        }
        // Dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        // Dias do próximo mês
        const remainingDays = 42 - days.length; // 6 semanas * 7 dias
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }
        return days;
    }, [currentDate]);

    const eventsByDate = useMemo(() => {
        return allEvents.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {} as Record<string, CalendarEvent[]>);
    }, [allEvents]);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col h-[calc(100vh-65px)] md:h-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Agenda</h2>
                    <p className="text-neutral-text-secondary mt-1">Visualize entregas, coletas e manutenções.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-neutral-text-primary bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Hoje</button>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-neutral-card-alt"><ChevronLeft size={20} /></button>
                        <h3 className="font-semibold text-lg text-neutral-text-primary w-40 text-center">
                            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-neutral-card-alt"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </header>

            <div className="flex-1 bg-neutral-card rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                        <div key={day} className="p-3 text-center text-xs sm:text-sm font-semibold text-neutral-text-secondary">
                           <span className="hidden sm:inline">{['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].indexOf(day)]}</span>
                           <span className="sm:hidden">{day}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 grid-rows-6 flex-1">
                    {calendarGrid.map(({ day, isCurrentMonth, date }, index) => {
                        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const dayEvents = eventsByDate[dateString] || [];
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                            <div key={index} className={`border-r border-b border-gray-200 p-2 flex flex-col ${isCurrentMonth ? '' : 'bg-neutral-bg'}`}>
                                <span className={`font-semibold mb-2 text-sm ${
                                    isCurrentMonth ? 'text-neutral-text-primary' : 'text-gray-400'
                                } ${isToday ? 'bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`
                                }>
                                    {day}
                                </span>
                                <div className="space-y-1 overflow-y-auto">
                                    {dayEvents.map(event => {
                                        const { bg, text, Icon } = eventColors[event.type];
                                        return (
                                            <div key={event.id} className={`p-1.5 rounded-md text-xs ${bg} ${text} flex items-center gap-1.5`}>
                                                <Icon size={12} />
                                                <span className="font-semibold truncate">{event.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Agenda;