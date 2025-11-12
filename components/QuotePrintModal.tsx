import React from 'react';
import { motion, Variants } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { Quote } from '../types';

const QuotePrintModal: React.FC<{ quote: Quote; onClose: () => void }> = ({ quote, onClose }) => {
    
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

    const items = [
        { description: quote.equipment, period: '15 dias', unitPrice: quote.value, total: quote.value },
    ];
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.05; // 5% de imposto
    const total = subtotal + tax;

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
                            </div>
                        </section>
                        <section className="mb-8">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600">Item</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-center">Período</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Preço Unit.</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-gray-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="p-3 font-medium">{item.description}</td>
                                        <td className="p-3 text-center text-gray-600">{item.period}</td>
                                        <td className="p-3 text-right text-gray-600">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-semibold">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        <section className="flex justify-end mb-8">
                            <div className="w-full max-w-xs space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Impostos (5%):</span>
                                    <span className="font-medium">R$ {tax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
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