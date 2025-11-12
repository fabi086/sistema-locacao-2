import type { LucideIcon } from 'lucide-react';

export interface Kpi {
    title: string;
    value: string;
    change: number;
    Icon: LucideIcon;
    isWarning?: boolean;
}

export interface Activity {
    id: string;
    client: string;
    status: string;
    color: string;
}

export interface Client {
    name: string;
    debt: number;
}

export interface RevenueData {
    name: string;
    Receita: number;
}

export type EquipmentStatus = 'Disponível' | 'Em Uso' | 'Manutenção';
export type EquipmentCategory = 'Escavadeiras' | 'Betoneiras' | 'Guindastes' | 'Andaimes';

export interface RentalHistoryItem {
    id: string;
    client: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

export interface MaintenanceRecord {
    id: string;
    type: 'Preventiva' | 'Corretiva';
    date: string; // YYYY-MM-DD
    description: string;
    cost: number;
}

export interface Equipment {
    id: string;
    name: string;
    category: EquipmentCategory;
    serialNumber: string;
    status: EquipmentStatus;
    location: string;
    rentalHistory?: RentalHistoryItem[];
    maintenanceHistory?: MaintenanceRecord[];
}

export type RentalStatus = 'Proposta' | 'Aprovado' | 'Reservado' | 'Em Rota' | 'Ativo' | 'Concluído';

export interface StatusHistory {
    status: RentalStatus;
    date: string;
}

export interface RentalOrder {
    id: string;
    client: string;
    equipment: string;
    startDate: string;
    endDate: string;
    value: number;
    status: RentalStatus;
    statusHistory: StatusHistory[];
}

export type QuoteStatus = 'Pendente' | 'Aprovado' | 'Recusado';

export interface Quote {
    id: string;
    client: string;
    equipment: string;
    createdDate: string;
    validUntil: string;
    value: number;
    status: QuoteStatus;
}

export type CustomerStatus = 'Ativo' | 'Inativo';

export interface Customer {
    id: string;
    name: string;
    document: string; // CNPJ ou CPF
    email: string;
    phone: string;
    status: CustomerStatus;
}