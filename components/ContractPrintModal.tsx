import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, HardHat } from 'lucide-react';
import { Contract, RentalOrder, Customer } from '../types';

interface ContractPrintModalProps {
    data: {
        contract: Contract;
        order: RentalOrder;
    };
    onClose: () => void;
}

const ContractPrintModal: React.FC<ContractPrintModalProps> = ({ data, onClose }) => {
    const { contract, order } = data;
    
    // Supondo que você terá os dados completos do cliente em algum lugar.
    // Por enquanto, usaremos placeholders.
    const locadora = {
        name: "ObraFácil Locações Ltda.",
        cnpj: "00.000.000/0001-00",
        address: "Rua Exemplo, 123, Bairro Modelo, São Paulo, SP, 01000-000"
    };
    const locatario = {
        name: order.client,
        document: "CPF/CNPJ do Cliente", // Este dado precisaria vir do objeto Customer
        address: "Endereço do Cliente" // Este dado precisaria vir do objeto Customer
    };
    
    const handlePrint = () => {
        window.print();
    };

    const backdropVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const modalVariants: any = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

    const Clause: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => (
        <div className="mb-4">
            <p className="font-bold">CLÁUSULA {number}ª - {title.toUpperCase()}</p>
            <p className="mt-1">{children}</p>
        </div>
    );

    return (
        <motion.div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static" 
            {...({ variants: backdropVariants, initial: "hidden", animate: "visible", exit: "exit", onClick: onClose } as any)}
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:max-h-full print:rounded-none print:w-full" 
                {...({ variants: modalVariants, onClick: (e: any) => e.stopPropagation() } as any)}
            >
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
                    <h2 className="font-bold text-gray-800">Visualização de Contrato</h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-10 overflow-y-auto flex-1 print:overflow-visible text-sm leading-relaxed text-justify" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    <h1 className="text-center font-bold text-lg mb-6">CONTRATO DE LOCAÇÃO DE BENS MÓVEIS</h1>

                    <p className="font-bold mb-4">IDENTIFICAÇÃO DAS PARTES CONTRATANTES</p>
                    <p className="mb-2">
                        <strong className="font-bold">LOCADORA:</strong> {locadora.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {locadora.cnpj}, com sede em {locadora.address}.
                    </p>
                    <p className="mb-6">
                        <strong className="font-bold">LOCATÁRIO(A):</strong> {locatario.name}, inscrito(a) no CPF/CNPJ sob o nº {locatario.document}, residente e domiciliado(a) em {locatario.address}.
                    </p>

                    <Clause number={1} title="Do Objeto do Contrato">
                        O presente contrato tem como objeto a locação do(s) seguinte(s) bem(ns) móvel(is):
                        <ul className="list-disc list-inside ml-4 my-2">
                            {order.equipmentItems.map(item => <li key={item.equipmentId}>{item.equipmentName}</li>)}
                        </ul>
                    </Clause>

                    <Clause number={2} title="Do Prazo">
                        A presente locação terá o prazo de {Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 3600 * 24)) + 1} dias, iniciando-se em {new Date(order.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} e terminando em {new Date(order.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}, data em que o(s) equipamento(s) deverá(ão) ser devolvido(s).
                    </Clause>

                    <Clause number={3} title="Do Valor e do Pagamento">
                        O valor total da locação é de <strong className="font-bold">R$ {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. O pagamento foi realizado na forma de <strong className="font-bold">{order.paymentMethod || 'não especificado'}</strong>.
                    </Clause>

                    <Clause number={4} title="Das Obrigações da Locatária">
                        Compete à LOCATÁRIA zelar pelo(s) equipamento(s) como se seu(s) fosse(m), utilizando-o(s) para os fins a que se destina(m), sendo responsável por quaisquer danos causados por mau uso, negligência ou imprudência. A devolução do(s) bem(ns) deverá ser feita nas mesmas condições em que foi(ram) recebido(s), ressalvado o desgaste natural.
                    </Clause>

                     <Clause number={5} title="Das Obrigações da Locadora">
                        Compete à LOCADORA entregar o(s) equipamento(s) em perfeitas condições de uso e funcionamento.
                    </Clause>

                    <Clause number={6} title="Do Foro">
                        Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem o foro da comarca de São Paulo/SP.
                    </Clause>

                    <p className="mt-8">E, por estarem assim justos e contratados, firmam o presente instrumento.</p>

                    <div className="mt-20 flex justify-around">
                        <div className="text-center">
                            <div className="border-t-2 border-gray-800 w-64 pt-2">
                                <p>{locadora.name}</p>
                                <p>LOCADORA</p>
                            </div>
                        </div>
                         <div className="text-center">
                            <div className="border-t-2 border-gray-800 w-64 pt-2">
                                <p>{locatario.name}</p>
                                <p>LOCATÁRIO(A)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContractPrintModal;
