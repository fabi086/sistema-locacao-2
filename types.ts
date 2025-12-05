

import type { LucideIcon } from 'lucide-react';

export interface Kpi {
    title: string;
    value: string;
    change?: number;
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
export interface EquipmentCategory {
    id: string;
    name: string;
    tenant_id?: string;
}

export interface PipelineStage {
    id: string;
    name: string;
    color: string;
    isCore: boolean;
}


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
    tenant_id?: string;
    name: string;
    category: string;
    serialNumber: string;
    status: EquipmentStatus;
    location: string;
    rentalHistory?: RentalHistoryItem[];
    maintenanceHistory?: MaintenanceRecord[];
    pricing?: {
        daily: number;
        weekly: number;
        biweekly: number; // Quinzenal
        monthly: number;
    };
}

export type RentalStatus = string;

export interface StatusHistory {
    status: RentalStatus;
    date: string;
}

export interface EquipmentOrderItem {
    equipmentId: string;
    equipmentName: string;
    value: number;
}

export type PaymentStatus = 'Pendente' | 'Sinal Pago' | 'Pago' | 'Vencido';

export interface RentalOrder {
    id: string;
    tenant_id?: string;
    client: string;
    equipmentItems: EquipmentOrderItem[];
    startDate: string;
    endDate: string;
    value: number; // Subtotal for equipment
    freightCost?: number;
    accessoriesCost?: number;
    discount?: number;
    status: RentalStatus;
    statusHistory: StatusHistory[];
    createdDate: string;
    validUntil: string;
    deliveryDate?: string;
    paymentMethod?: string;
    paymentStatus?: PaymentStatus;
}


export type QuoteStatus = 'Pendente' | 'Aprovado' | 'Recusado';

export interface Quote {
    id: string;
    tenant_id?: string;
    client: string;
    equipment: string;
    startDate: string;
    endDate: string;
    createdDate: string;
    validUntil: string;
    value: number;
    status: QuoteStatus;
}

export type CustomerStatus = 'Ativo' | 'Inativo';

export interface Customer {
    id: string;
    tenant_id?: string;
    name: string;
    document: string; // CNPJ ou CPF
    email: string;
    phone: string;
    status: CustomerStatus;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

export type ContractStatus = 'Pendente' | 'Ativo' | 'Vencido';

export interface Contract {
    id: string;
    tenant_id?: string;
    client: string;
    startDate: string;
    endDate: string;
    value: number;
    status: ContractStatus;
    dueDate?: string;
}

export type CalendarEventType = 'Entrega' | 'Coleta' | 'Manutenção';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: CalendarEventType;
}

export type MaintenanceStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type MaintenanceType = 'Preventiva' | 'Corretiva';

export interface MaintenanceOrder {
    id: string;
    tenant_id?: string;
    equipment: string;
    type: MaintenanceType;
    status: MaintenanceStatus;
    cost: number;
    scheduledDate: string;
}

export type UserRole = 'Admin' | 'Operador' | 'Comercial' | 'Logística' | 'Financeiro';
export type UserStatus = 'Ativo' | 'Inativo';

export interface User {
    id: string;
    tenant_id?: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}