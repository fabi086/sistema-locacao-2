import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import PlaceholderPage from './components/PlaceholderPage';
import Equipamentos from './components/Equipamentos';
import QuoteModal from './components/QuoteModal';
import Locacao from './components/Locacao';
import Orcamentos from './components/Orcamentos'; // Importa o novo componente
import { Equipment } from './types';
import { Truck, Wrench, FileText, Users, Building, Calendar, DollarSign, Settings, BarChart2, HardHat, LogOut, ChevronLeft, LayoutDashboard, FilePlus2 } from 'lucide-react';

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

type Page = typeof navItems[number]['label'];

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
                        onClick={() => setActivePage(item.label)}
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
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-dark/50 text-gray-200 text-sm font-semibold transition-colors">
                    <Settings size={20} />
                    <span>Configurações</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-dark/50 text-gray-200 text-sm font-semibold transition-colors">
                    <LogOut size={20} />
                    <span>Sair</span>
                </a>
            </div>
        </aside>
    );
};


const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('Orçamentos');
    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
    const [equipmentForQuote, setEquipmentForQuote] = useState<Equipment | null>(null);

    const handleOpenQuoteModal = (equipment: Equipment | null = null) => {
        setEquipmentForQuote(equipment);
        setQuoteModalOpen(true);
    };

    const handleCloseQuoteModal = () => {
        setQuoteModalOpen(false);
        setEquipmentForQuote(null); // Limpa o equipamento ao fechar
    };


    const renderContent = () => {
        switch(activePage) {
            case 'Dashboard':
                return <Dashboard onOpenQuoteModal={handleOpenQuoteModal} />;
            case 'Equipamentos':
                return <Equipamentos onOpenQuoteModal={handleOpenQuoteModal} />;
            case 'Locação':
                return <Locacao />;
            case 'Orçamentos':
                return <Orcamentos onOpenQuoteModal={handleOpenQuoteModal} />;
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
            </main>
        </div>
    );
};

export default App;