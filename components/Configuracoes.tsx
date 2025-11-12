import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Users, FileText, BadgeDollarSign, Plug } from 'lucide-react';

const settingsCards = [
    {
        icon: Users,
        title: "Usuários e Permissões",
        description: "Gerencie membros da equipe e seus níveis de acesso.",
        buttonText: "Gerenciar"
    },
    {
        icon: FileText,
        title: "Modelos",
        description: "Personalize modelos de contratos, orçamentos e faturas.",
        buttonText: "Gerenciar"
    },
    {
        icon: BadgeDollarSign,
        title: "Tabela de Preços",
        description: "Defina e ajuste as taxas de locação por período e cliente.",
        buttonText: "Gerenciar"
    },
    {
        icon: Plug,
        title: "Integrações",
        description: "Conecte o ConstructFlow com outras ferramentas.",
        buttonText: "Gerenciar"
    }
];

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const Configuracoes: React.FC = () => {
    return (
        <div className="p-6 md:p-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-text-primary">Configurações</h2>
                <p className="text-neutral-text-secondary mt-1">Personalize o sistema para atender às suas necessidades.</p>
            </header>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {settingsCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={index} variants={cardVariants} className="bg-neutral-card p-6 rounded-lg shadow-sm flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <Icon size={24} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-text-primary">{card.title}</h3>
                            </div>
                            <p className="text-neutral-text-secondary text-sm flex-grow mb-6">{card.description}</p>
                            <button className="w-full text-center mt-auto px-4 py-2 text-sm font-semibold bg-neutral-card-alt text-neutral-text-primary rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
                                {card.buttonText}
                            </button>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    );
};

export default Configuracoes;
