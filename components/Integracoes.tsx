import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, MessageSquare, Briefcase, CheckCircle, PlusCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Integration {
    name: string;
    description: string;
    icon: LucideIcon;
    status: 'Conectado' | 'Disponível';
    category: 'Comunicação' | 'Produtividade' | 'Financeiro';
}

const integrations: Integration[] = [
    {
        name: "Google Agenda",
        description: "Sincronize entregas, coletas e manutenções com sua agenda do Google.",
        icon: Calendar,
        status: 'Conectado',
        category: 'Produtividade'
    },
    {
        name: "Zapier",
        description: "Conecte o ObraFácil a mais de 5.000 apps para automatizar fluxos de trabalho.",
        icon: Zap,
        status: 'Disponível',
        category: 'Produtividade'
    },
    {
        name: "Slack",
        description: "Receba notificações sobre novos orçamentos e status de locação em seus canais.",
        icon: MessageSquare,
        status: 'Disponível',
        category: 'Comunicação'
    },
    {
        name: "Conta Azul",
        description: "Exporte dados de faturamento e contratos para sua conta do Conta Azul.",
        icon: Briefcase,
        status: 'Conectado',
        category: 'Financeiro'
    },
];

const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => {
    const { name, description, icon: Icon, status } = integration;
    const isConnected = status === 'Conectado';

    return (
        <motion.div 
            {...({
                variants: {
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
                }
            } as any)}
            className="bg-neutral-card p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 hover:shadow-md hover:border-primary transition-all"
        >
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text-primary">{name}</h3>
                </div>
                <p className="text-neutral-text-secondary text-sm mb-6 flex-grow">{description}</p>
            </div>
            <div className="mt-auto flex justify-between items-center">
                {isConnected ? (
                    <span className="flex items-center gap-2 text-sm font-semibold text-accent-success">
                        <CheckCircle size={16} />
                        Conectado
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-sm font-semibold text-neutral-text-secondary">
                         <PlusCircle size={16} />
                        Disponível
                    </span>
                )}
                <button 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        isConnected 
                        ? 'bg-neutral-card-alt text-neutral-text-primary border border-gray-300 hover:bg-gray-200'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                    }`}
                >
                    {isConnected ? 'Gerenciar' : 'Conectar'}
                </button>
            </div>
        </motion.div>
    );
};


const Integracoes: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary">Integrações</h2>
                <p className="text-neutral-text-secondary mt-1">Conecte o ObraFácil com as ferramentas que você já usa para otimizar seu fluxo de trabalho.</p>
            </header>
            
            <motion.div 
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                 {...({
                     initial: "hidden",
                     animate: "visible",
                     variants: {
                         visible: { transition: { staggerChildren: 0.1 } }
                     }
                 } as any)}
            >
                {integrations.map((integration, index) => (
                    <IntegrationCard key={index} integration={integration} />
                ))}
            </motion.div>
        </div>
    );
};

export default Integracoes;