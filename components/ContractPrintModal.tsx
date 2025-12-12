import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { Contract, RentalOrder, Customer, CompanySettings } from '../types';

interface ContractPrintModalProps {
    contract: Contract;
    order?: RentalOrder;
    client?: Customer;
    onClose: () => void;
    companySettings?: CompanySettings;
}

const ContractPrintModal: React.FC<ContractPrintModalProps> = ({ contract, order, client, onClose, companySettings }) => {
    
    const handlePrint = () => {
        window.print();
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };
    
    const totalValue = order ? order.value + (order.freightCost || 0) + (order.accessoriesCost || 0) - (order.discount || 0) : contract.value;

    const companyName = companySettings?.name || 'ObraFácil Locações Ltda.';
    const companyDoc = companySettings?.document || '00.000.000/0001-00';
    const companyAddress = companySettings?.address 
        ? `${companySettings.address.street}, ${companySettings.address.number}, ${companySettings.address.neighborhood}, ${companySettings.address.city}-${companySettings.address.state}`
        : 'Rua Exemplo, 123, Bairro, Cidade-UF';

    return (
        <motion.div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static" 
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose } as any)}
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:max-h-full print:rounded-none print:w-full" 
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                {/* Header - Hidden on Print */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
                    <h2 className="font-bold text-gray-800">Visualização do Contrato</h2>
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
                <div className="p-8 md:p-12 overflow-y-auto flex-1 print:overflow-visible text-gray-800 text-sm leading-relaxed" id="contract-content">
                    <header className="text-center mb-10">
                        <h1 className="text-2xl font-bold uppercase">Contrato de Locação de Equipamentos</h1>
                        <p className="text-lg font-semibold mt-1">Contrato Nº: {contract.id}</p>
                    </header>

                    <section className="mb-6">
                        <h2 className="text-base font-bold uppercase border-b pb-1 mb-2">Partes Contratantes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">LOCADORA:</p>
                                <p>{companyName}</p>
                                <p>CNPJ: {companyDoc}</p>
                                <p>{companyAddress}</p>
                            </div>
                            <div>
                                <p className="font-semibold">LOCATÁRIO(A):</p>
                                <p>{client?.name || contract.client}</p>
                                <p>CPF/CNPJ: {client?.document}</p>
                                <p>{client ? `${client.street}, ${client.number}` : 'Endereço não cadastrado'}</p>
                            </div>
                        </div>
                    </section>
                    
                     <section className="mb-6">
                        <h2 className="text-base font-bold uppercase border-b pb-1 mb-2">Objeto do Contrato</h2>
                         <p>O presente contrato tem por objeto a locação do(s) equipamento(s) abaixo descrito(s), de propriedade da LOCADORA, para uso exclusivo do(a) LOCATÁRIO(A) na obra/local indicado.</p>
                        <table className="w-full text-left my-4 text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">Item</th>
                                    <th className="p-2">Descrição do Equipamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order?.equipmentItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2">{idx + 1}</td>
                                        <td className="p-2 font-medium">{item.equipmentName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    
                    <section className="mb-6">
                        <h2 className="text-base font-bold uppercase border-b pb-1 mb-2">Prazo e Valor da Locação</h2>
                         <p><strong>Prazo de Vigência:</strong> De {new Date(contract.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(contract.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}.</p>
                         <p><strong>Valor Total do Contrato:</strong> R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                         <p><strong>Forma de Pagamento:</strong> {order?.paymentMethod || 'A combinar'}</p>
                    </section>

                    <section className="mb-6 text-xs space-y-2">
                        <h2 className="text-base font-bold uppercase border-b pb-1 mb-2">Cláusulas Gerais</h2>
                        <p><strong>1. OBRIGAÇÕES DA LOCADORA:</strong> Entregar o equipamento em perfeitas condições de uso e funcionamento.</p>
                        <p><strong>2. OBRIGAÇÕES DO(A) LOCATÁRIO(A):</strong> Utilizar o equipamento conforme as especificações, zelar por sua conservação, e devolvê-lo nas mesmas condições em que o recebeu, ressalvado o desgaste natural. Quaisquer danos, avarias ou extravio do equipamento serão de responsabilidade do(a) LOCATÁRIO(A).</p>
                        <p><strong>3. DEVOLUÇÃO:</strong> O equipamento deverá ser devolvido na data de término deste contrato. A não devolução implicará em cobrança de diárias adicionais.</p>
                    </section>

                    <footer className="mt-16 pt-8">
                        <p className="text-center">E por estarem justos e contratados, assinam o presente em duas vias de igual teor e forma.</p>
                        <div className="grid grid-cols-2 gap-8 mt-12 text-center">
                            <div>
                                <hr className="border-gray-500 w-3/4 mx-auto" />
                                <p className="mt-2 font-semibold">{companyName}</p>
                                <p className="text-xs">(LOCADORA)</p>
                            </div>
                            <div>
                                <hr className="border-gray-500 w-3/4 mx-auto" />
                                <p className="mt-2 font-semibold">{client?.name || contract.client}</p>
                                <p className="text-xs">(LOCATÁRIO(A))</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContractPrintModal;