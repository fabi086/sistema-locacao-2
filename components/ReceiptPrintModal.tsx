import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { Contract, RentalOrder } from '../types';

interface ReceiptPrintModalProps {
    data: {
        contract: Contract;
        order: RentalOrder;
    };
    onClose: () => void;
}

const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ data, onClose }) => {
    const { contract, order } = data;
    const totalValue = contract.value;

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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:max-h-full print:rounded-none print:w-full" 
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
                    <h2 className="font-bold text-gray-800">Visualização de Recibo</h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-10 overflow-y-auto flex-1 print:overflow-visible font-serif">
                    <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-8">
                        <div className="flex items-center gap-3">
                            <HardHat size={40} className="text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ObraFácil</h1>
                                <p className="text-sm text-gray-500">Locação de Equipamentos</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-800">RECIBO</h2>
                            <p className="text-gray-600">Nº: REC-{order.id}</p>
                        </div>
                    </div>
                    
                    <div className="mb-8 text-right">
                         <p className="text-5xl font-bold text-primary">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="mb-10 text-lg leading-relaxed text-gray-800">
                        <p>
                            Recebemos de <strong className="font-bold">{order.client}</strong> a importância de 
                            <strong className="font-bold"> R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, 
                            referente ao pagamento do contrato de locação de equipamentos <strong className="font-bold">{contract.id}</strong>.
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border mb-10 text-sm">
                         <h3 className="font-bold text-gray-700 mb-2">Detalhes da Locação:</h3>
                         <ul className="list-disc list-inside text-gray-600">
                           {order.equipmentItems.map(item => <li key={item.equipmentId}>{item.equipmentName}</li>)}
                         </ul>
                         <p className="mt-2"><span className="font-semibold">Período:</span> {new Date(order.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(order.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>

                     <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                             <h4 className="font-bold uppercase text-gray-500 mb-2 text-xs">Pagamento</h4>
                             <p><span className="font-semibold">Data:</span> {order.paymentDate ? new Date(order.paymentDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                             <p><span className="font-semibold">Método:</span> {order.paymentMethod || 'Não especificado'}</p>
                        </div>
                         <div className="text-right">
                             <h4 className="font-bold uppercase text-gray-500 mb-2 text-xs">Emitido em</h4>
                             <p>{new Date().toLocaleDateString('pt-BR')}</p>
                         </div>
                    </div>


                    <footer className="mt-20 text-center">
                        <div className="inline-block">
                            <div className="border-t-2 border-gray-800 w-64 pt-2">
                                <p className="text-sm font-semibold">Assinatura ObraFácil</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReceiptPrintModal;
