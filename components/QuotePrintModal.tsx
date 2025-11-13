import React from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { RentalOrder } from '../types';

const QuotePrintModal: React.FC<{ quote: RentalOrder; onClose: () => void }> = ({ quote, onClose }) => {
    
    const handlePrint = () => {
        const printContent = document.getElementById('printable-area');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            // Recarregar a página para restaurar scripts e eventos
            window.location.reload(); 
        }
    };
    
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    const subtotal = quote.value;
    const total = subtotal + (quote.freightCost || 0) + (quote.accessoriesCost || 0) - (quote.discount || 0);

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
        >
            <motion.div
                className="bg-neutral-bg rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 bg-neutral-card-alt flex justify-between items-center">
                    <h2 className="text-lg font-bold text-neutral-text-primary">Pré-visualização do Orçamento: {quote.id}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors">
                            <Printer size={16} />
                            Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-neutral-text-secondary transition-colors" aria-label="Fechar modal">
                            <X size={20} />
                        </button>
                    </div>
                </header>
                <div id="printable-area" className="flex-1 p-8 overflow-y-auto bg-white">
                     {/* Estilos para impressão */}
                    <style type="text/css" media="print">
                      {`
                        @page { size: A4; margin: 0; }
                        body { -webkit-print-color-adjust: exact; }
                        .no-print { display: none; }
                      `}
                    </style>
                    <div className="max-w-3xl mx-auto font-sans text-gray-800">
                        <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                     <HardHat size={32} className="text-secondary"/>
                                     <h1 className="text-3xl font-bold text-primary">ConstructFlow</h1>
                                </div>
                                <p className="text-sm text-gray-500">Rua da Construção, 123, Bairro Industrial</p>
                                <p className="text-sm text-gray-500">CEP 12345-678, São Paulo, SP</p>
                                <p className="text-sm text-gray-500">contato@constructflow.com | (11) 98765-4321</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-bold text-gray-500 uppercase">Orçamento</h2>
                                <p className="text-lg font-semibold text-primary">{quote.id}</p>
                            </div>
                        </header>
                        <section className="grid grid-cols-2 gap-8 my-6">
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">PARA:</h3>
                                <p className="font-bold text-lg text-neutral-text-primary">{quote.client}</p>
                                <p className="text-gray-600">CNPJ: 12.345.678/0001-99</p>
                                <p className="text-gray-600">Av. Principal, 456, Centro</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600"><span className="font-semibold">Data de Emissão:</span> {new Date(quote.createdDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                <p className="text-gray-600"><span className="font-semibold">Válido até:</span> {new Date(quote.validUntil + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                <p className="text-gray-600"><span className="font-semibold">Período de Locação:</span> {`${new Date(quote.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(quote.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}</p>
                            </div>
                        </section>
                        <section className="mb-8">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 w-16 text-center">Item</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600">Descrição</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right w-48">Período de Locação</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right w-32">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.equipmentItems.length > 0 ? (
                                        quote.equipmentItems.map((item, index) => {
                                            const rentalPeriodString = `${new Date(quote.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(quote.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
                                            const itemValue = item.value || 0;
                                            
                                            return (
                                                <tr key={item.equipmentId} className="border-b border-gray-200">
                                                    <td className="p-3 w-16 text-center font-medium">{String(index + 1).padStart(3, '0')}</td>
                                                    <td className="p-3 font-medium text-neutral-text-primary">{item.equipmentName}</td>
                                                    <td className="p-3 text-right text-sm text-gray-700">{rentalPeriodString}</td>
                                                    <td className="p-3 text-right font-semibold text-neutral-text-primary">R$ {itemValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="border-b border-gray-200">
                                            <td colSpan={4} className="p-4 text-center text-gray-500">Nenhum item de equipamento no orçamento.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>
                        <section className="flex justify-end mb-8">
                            <div className="w-full max-w-sm space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal (Equipamentos):</span>
                                    <span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {quote.freightCost && (
                                <div className="flex justify-between">
                                    <span>Frete:</span>
                                    <span className="font-medium">R$ {quote.freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                )}
                                {quote.accessoriesCost && (
                                <div className="flex justify-between">
                                    <span>Acessórios:</span>
                                    <span className="font-medium">R$ {quote.accessoriesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                )}
                                {quote.discount && (
                                <div className="flex justify-between text-red-600">
                                    <span>Desconto:</span>
                                    <span className="font-medium">- R$ {quote.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-300">
                                    <span className="font-bold text-lg text-neutral-text-primary">Total:</span>
                                    <span className="font-bold text-lg text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </section>
                        <footer className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
                            <p className="font-semibold">Termos e Condições</p>
                            <p>O pagamento deve ser efetuado em até 30 dias após a emissão da fatura. Agradecemos a sua preferência!</p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default QuotePrintModal;