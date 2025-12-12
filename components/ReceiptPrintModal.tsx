import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, HardHat, CheckCircle } from 'lucide-react';
import { RentalOrder } from '../types';

interface ReceiptPrintModalProps {
    order: RentalOrder;
    onClose: () => void;
}

const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ order, onClose }) => {
    const totalValue = order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0);

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
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:max-h-full print:rounded-none print:w-full" 
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                {/* Header - Hidden on Print */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
                    <h2 className="font-bold text-gray-800">Visualização do Recibo</h2>
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
                    <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-6">
                        <div className="flex items-center gap-3">
                            <HardHat size={40} className="text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ObraFácil</h1>
                                <p className="text-sm text-gray-500">Locação de Equipamentos</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">RECIBO DE PAGAMENTO</h2>
                            <p className="text-gray-600">Pedido #{order.id}</p>
                        </div>
                    </div>
                    
                    <div className="my-8">
                        <p className="text-lg leading-relaxed">
                            Recebemos de <strong className="font-bold">{order.client}</strong>, a importância de <strong className="font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, referente à locação de equipamentos conforme o pedido nº {order.id}.
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border my-8">
                        <h3 className="font-bold text-base mb-2">Detalhes do Pagamento</h3>
                        <div className="text-sm space-y-1">
                             <p><strong>Data do Pagamento:</strong> {order.paymentDate ? new Date(order.paymentDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                             <p><strong>Forma de Pagamento:</strong> {order.paymentMethod || 'Não especificado'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center text-center my-10 text-green-600">
                        <CheckCircle size={24} className="mr-2"/>
                        <p className="font-bold text-xl">PAGAMENTO CONFIRMADO</p>
                    </div>

                    <footer className="text-center text-xs text-gray-500 pt-6 mt-8 border-t border-gray-200">
                        <p>Este é um recibo gerado pelo sistema e confirma o pagamento integral do valor descrito.</p>
                        <p className="mt-4">Agradecemos a sua preferência!</p>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReceiptPrintModal;
