import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { RentalOrder } from '../types';

interface QuotePrintModalProps {
    quote: RentalOrder;
    onClose: () => void;
}

const QuotePrintModal: React.FC<QuotePrintModalProps> = ({ quote, onClose }) => {
    const totalValue = quote.value + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);

    const handlePrint = () => {
        window.print();
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

    return (
        <motion.div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static" 
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose } as any)}
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:max-h-full print:rounded-none print:w-full" 
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                {/* Header - Hidden on Print */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
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

                {/* Printable Content */}
                <div className="p-8 overflow-y-auto flex-1 print:overflow-visible">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-6">
                        <div className="flex items-center gap-3">
                            <HardHat size={40} className="text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ObraFácil</h1>
                                <p className="text-sm text-gray-500">Locação de Equipamentos</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">PROPOSTA COMERCIAL</h2>
                            <p className="text-gray-600">#{quote.id}</p>
                            <p className="text-sm text-gray-500">Data: {new Date(quote.createdDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Cliente</h3>
                            <p className="font-semibold text-lg text-gray-900">{quote.client}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Detalhes</h3>
                            <p className="text-gray-700"><span className="font-semibold">Período:</span> {new Date(quote.startDate).toLocaleDateString('pt-BR')} a {new Date(quote.endDate).toLocaleDateString('pt-BR')}</p>
                            <p className="text-gray-700"><span className="font-semibold">Validade:</span> {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                    <th className="p-3">Item / Equipamento</th>
                                    <th className="p-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {quote.equipmentItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-medium text-gray-900">{item.equipmentName}</td>
                                        <td className="p-3 text-right">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>R$ {quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {quote.freightCost && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span>R$ {quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {quote.accessoriesCost && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Acessórios</span>
                                    <span>R$ {quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {quote.discount && (
                                <div className="flex justify-between text-red-500">
                                    <span>Desconto</span>
                                    <span>- R$ {quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl text-primary border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
                        <p className="font-semibold mb-1">Termos e Condições</p>
                        <p>Esta proposta é válida por 15 dias a partir da data de emissão. Pagamento conforme combinado.</p>
                        <p className="mt-4">Obrigado pela preferência!</p>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default QuotePrintModal;