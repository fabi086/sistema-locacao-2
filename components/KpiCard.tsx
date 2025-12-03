import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Kpi } from '../types';

const cardVariants: any = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.2, 0.8, 0.2, 1]
        }
    }
};

const KpiCard: React.FC<Kpi> = ({ title, value, change, Icon, isWarning = false }) => {
    const isPositive = typeof change !== 'undefined' && change >= 0;
    const changeColor = isWarning ? 'text-accent-danger' : (isPositive ? 'text-accent-success' : 'text-accent-danger');

    return (
        <motion.div 
            className="bg-neutral-card p-6 rounded-lg shadow-sm flex flex-col justify-between"
            {...({ variants: cardVariants } as any)}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-neutral-text-secondary">{title}</h3>
                <div className="bg-neutral-bg p-2 rounded-lg">
                    <Icon className="text-primary" size={24} />
                </div>
            </div>
            <div>
                <p className="text-3xl font-bold text-neutral-text-primary mt-4">{value}</p>
                {typeof change !== 'undefined' && (
                    <div className="flex items-center text-sm mt-1">
                        <span className={`flex items-center font-semibold ${changeColor}`}>
                            { isWarning ? null : (isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />) }
                            {Math.abs(change)}% 
                        </span>
                        <span className="text-neutral-text-secondary ml-1">vs mês anterior</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default KpiCard;