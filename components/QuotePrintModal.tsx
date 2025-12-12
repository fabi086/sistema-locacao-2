import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { RentalOrder, Customer, CompanySettings } from '../types';

interface QuotePrintModalProps {
    quote: RentalOrder;
    client?: Customer;
    onClose: () => void;
    companySettings?: CompanySettings;
}

const QuotePrintModal: React.FC<QuotePrintModalProps> = ({ quote, client, onClose, companySettings }) => {
    const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const addressString = companySettings?.address 
        ? `${companySettings.address.street}, ${companySettings.address.number}${companySettings.address.complement ? ` - ${companySettings.address.complement}` : ''}`
        : 'Rua da Construção, 123';
    
    const cityString = companySettings?.address
        ? `${companySettings.address.city} - ${companySettings.address.state}, CEP ${companySettings.address.cep}`
        : 'São Paulo - SP, CEP 12345-678';

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-full print:rounded-none print:w-full"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Hidden on Print */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden flex-shrink-0">
                    <h2 className="font-bold text-gray-800">Visualização de Impressão</h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Container for Mobile - IMPORTANT for A4 scaling */}
                <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible">
                    {/* A4 Sheet Wrapper - Fixed width to ensure print consistency */}
                    <div className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0 min-w-[700px] max-w-[210mm] p-[10mm] md:p-[15mm] text-gray-800 text-sm leading-relaxed" style={{ minHeight: '297mm' }}>
                        
                        {/* Document Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{companySettings?.name || 'ObraFácil'}</h1>
                                <div className="text-gray-500 text-xs space-y-1">
                                    <p>{addressString}</p>
                                    <p>{cityString}</p>
                                    <p>{companySettings?.email || 'contato@obrafacil.com'} | {companySettings?.phone || '(11) 98765-4321'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-gray-600 tracking-wide uppercase">Orçamento</h2>
                                <p className="text-primary font-bold text-lg mt-1">#{quote.id}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-10">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dados do Cliente</h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg text-gray-900">{client?.name || quote.client}</p>
                                    {client?.document && <p className="text-gray-600">CNPJ/CPF: {client.document}</p>}
                                    {client?.email && <p className="text-gray-600">{client.email}</p>}
                                    {client?.phone && <p className="text-gray-600">{client.phone}</p>}
                                    <p className="text-gray-600 mt-2">
                                        {client ? `${client.street || ''}, ${client.number || ''} ${client.neighborhood ? `- ${client.neighborhood}` : ''}` : 'Endereço não cadastrado'}
                                    </p>
                                    <p className="text-gray-600">
                                        {client ? `${client.city || ''} - ${client.state || ''}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between py-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-600">Data de Emissão:</span>
                                        <span className="font-bold text-gray-900">{formatDate(quote.createdDate)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-600">Válido até:</span>
                                        <span className="font-bold text-gray-900">{formatDate(quote.validUntil)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-600">Período Geral:</span>
                                        <span className="font-bold text-gray-900">{formatDate(quote.startDate)} a {formatDate(quote.endDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-10">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 font-bold text-gray-600 text-xs uppercase tracking-wider w-16">Item</th>
                                        <th className="text-left py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Descrição</th>
                                        <th className="text-right py-3 font-bold text-gray-600 text-xs uppercase tracking-wider w-32">Período</th>
                                        <th className="text-right py-3 font-bold text-gray-600 text-xs uppercase tracking-wider w-32">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {quote.equipmentItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-4 text-gray-500">{(idx + 1).toString().padStart(2, '0')}</td>
                                            <td className="py-4 font-semibold text-gray-900">{item.equipmentName}</td>
                                            <td className="py-4 text-right whitespace-nowrap text-gray-500 text-xs">
                                                {formatDate(item.startDate || quote.startDate)} <br/> a {formatDate(item.endDate || quote.endDate)}
                                            </td>
                                            <td className="py-4 text-right font-bold text-gray-900">
                                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/2 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>R$ {quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {quote.freightCost ? (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Frete:</span>
                                        <span>+ R$ {quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : null}
                                {quote.accessoriesCost ? (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Acessórios:</span>
                                        <span>+ R$ {quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : null}
                                {quote.discount ? (
                                    <div className="flex justify-between text-red-600 font-medium">
                                        <span>Desconto:</span>
                                        <span>- R$ {quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ) : null}
                                <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-200 pt-4 mt-4">
                                    <span>Total:</span>
                                    <span>R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        {quote.paymentMethod && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-xs">
                                <span className="font-bold text-gray-700">Forma de Pagamento:</span> {quote.paymentMethod}
                            </div>
                        )}

                        <div className="text-xs text-gray-500 text-center mt-20 pt-8 border-t border-gray-100">
                            <p>Este orçamento é válido por 15 dias a partir da data de emissão.</p>
                            <p className="mt-1">Obrigado pela preferência!</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default QuotePrintModal;