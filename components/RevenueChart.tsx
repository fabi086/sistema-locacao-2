import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '../types';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

    return (
      <div className="bg-neutral-text-primary text-white p-2 rounded-md shadow-lg">
        <p className="font-bold">{`${label}`}</p>
        <p className="text-sm">{`Receita: ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
        // Formata para "R$ 1,4 mil"
        return `R$ ${(tickItem / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
    }
    // Formata para "R$ 700"
    return `R$ ${tickItem.toLocaleString('pt-BR')}`;
};

const RevenueChart: React.FC<{ data: RevenueData[] }> = ({ data }) => {
    return (
        <div className="bg-neutral-card p-6 rounded-lg shadow-sm h-[400px]">
            <h3 className="font-bold text-lg text-neutral-text-primary mb-4">Receita por Período</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F6" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7B8C' }} axisLine={false} tickLine={false} />
                    <YAxis 
                        tickFormatter={formatYAxis} 
                        tick={{ fill: '#6B7B8C', fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F7FA' }} />
                    <Bar dataKey="Receita" fill="#0A4C64" radius={[4, 4, 0, 0]} animationDuration={500} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;