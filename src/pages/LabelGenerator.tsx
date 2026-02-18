
import { useState, useEffect } from 'react';
import { Tag, Printer, User, Calendar, Clock, Users } from 'lucide-react';
import { generateLabelPDF, type LabelType } from '../services/labelPdfService';

export const LabelGenerator = () => {
    const [type, setType] = useState<LabelType>('PACIENTE');
    const [patientName, setPatientName] = useState('');
    const [personName, setPersonName] = useState(''); // Companion or Visitor Name
    const [dob, setDob] = useState('');
    const [age, setAge] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');

    useEffect(() => {
        // Set default date/time to now
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setAdmissionDate(`${dateStr} ${timeStr}`);
    }, []);

    // Calculate Age on DOB change
    useEffect(() => {
        if (dob.length === 10) {
            const parts = dob.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const birthDate = new Date(year, month, day);
                const today = new Date();

                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                }
                setAge(calculatedAge.toString());
            }
        }
    }, [dob]);

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setDob(value);
    };

    const handlePrint = async () => {
        if (!patientName) {
            alert("Nome do paciente é obrigatório.");
            return;
        }

        if ((type === 'ACOMPANHANTE' || type === 'VISITANTE') && !personName) {
            alert(`Nome do ${type.toLowerCase()} é obrigatório.`);
            return;
        }

        try {
            const pdfBytes = await generateLabelPDF({
                type,
                patientName,
                personName,
                dob,
                age,
                admissionDate
            });


            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error generating label:", error);
            alert("Erro ao gerar etiqueta.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <Tag className="w-8 h-8 mr-3 text-blue-600" />
                        Gerador de Etiquetas
                    </h1>
                    <p className="text-slate-500 mt-1 ml-11">Crie etiquetas para impressão rápida (Zebra ZD220).</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">

                {/* Type Selection */}
                <div className="flex justify-center space-x-4">
                    {(['PACIENTE', 'ACOMPANHANTE', 'VISITANTE'] as LabelType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${type === t
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-600 ring-offset-2'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common Field: Date/Time */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" /> Data e Hora (Automático)
                        </label>
                        <input
                            type="text"
                            value={admissionDate}
                            onChange={(e) => setAdmissionDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-mono text-slate-600"
                        />
                    </div>

                    {/* Conditional Fields */}
                    {type === 'PACIENTE' && (
                        <>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Nome do Paciente
                                </label>
                                <input
                                    type="text"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder="Digite o nome completo"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" /> Data de Nascimento
                                </label>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={handleDobChange}
                                    placeholder="DD/MM/AAAA"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Idade (Calculada)</label>
                                <input
                                    type="text"
                                    value={age}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                                />
                            </div>
                        </>
                    )}

                    {(type === 'ACOMPANHANTE' || type === 'VISITANTE') && (
                        <>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                    <Users className="w-4 h-4 mr-2" /> Nome do {type === 'ACOMPANHANTE' ? 'Acompanhante' : 'Visitante'}
                                </label>
                                <input
                                    type="text"
                                    value={personName}
                                    onChange={(e) => setPersonName(e.target.value)}
                                    placeholder="Digite o nome completo"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    autoFocus
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Paciente (Vínculo)
                                </label>
                                <input
                                    type="text"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder="Nome do paciente internado"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 hover:shadow-2xl"
                    >
                        <Printer className="w-6 h-6" />
                        <span>Imprimir Etiqueta</span>
                    </button>
                </div>
            </div>

            {/* Preview Hint */}
            <div className="text-center text-sm text-slate-400">
                <p>O navegador abrirá uma nova aba com o PDF. Selecione a impressora Zebra ZD220 nas configurações de impressão.</p>
            </div>
        </div>
    );
};
