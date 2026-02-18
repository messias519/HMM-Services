import { useState } from 'react';
import { Search, FileText, Check, User, Stethoscope, Hospital } from 'lucide-react';
import { generateAIHPDF } from '../services/pdfService';
import { saveAIH } from '../services/storageService';
import cidsData from '../data/cids.json';
import procsData from '../data/procedimentos.json';

// Types based on JSON structure
interface CID {
    co_cid: string;
    no_cid: string;
}

interface Procedure {
    co_procedimento: string;
    no_procedimento: string;
    tp_complexidade: string;
    tp_sexO: string;
    vl_idade_minima: string | number;
    vl_idade_maxima: string | number;
    vl_sh: string | number;
    vl_sa: string | number;
    vl_sp: string | number;
    qt_tempo_permanencia: string | number;
}

export const AIHGenerator = () => {
    const [formData, setFormData] = useState<any>({
        "Nome do paciente": "",
        "Data Nasc": "",
        "CNS Paciente": "",
        "Sexo": "", // M or F
        "Sinais/Sintomas": "",
        "Justificativa": "",
        "Resultados": "",
        "Diagnóstico (Busca)": "",
        "CID": "",
        "Procedimento (Busca)": "",
        "Nome Médico": "",
        "CPF Médico": "",
        "Data Solicitação": new Date().toLocaleDateString('pt-BR'),
        "Nome do estabelecimento solicitante": "Hospital Municipal de Mozarlândia",
        "CNS Estabelecimento Solicitante": "2535165",
        "Nome do estabelecimento executante": "Hospital Municipal de Mozarlândia",
        "CNS Estabelecimento executante": "2535165",
        "CheckCPF Médico": true
    });

    const [cidResults, setCidResults] = useState<CID[]>([]);
    const [procResults, setProcResults] = useState<Procedure[]>([]);
    const [showCidSearch, setShowCidSearch] = useState(false);
    const [showProcSearch, setShowProcSearch] = useState(false);
    const [selectedProc, setSelectedProc] = useState<Procedure | null>(null);

    // Constants
    const MIN_SEARCH_CHARS = 3;

    // Search Logic
    const handleCidSearch = (term: string) => {
        setFormData({ ...formData, "Diagnóstico (Busca)": term });
        if (term.length >= MIN_SEARCH_CHARS) {
            const results = cidsData.filter((c: any) =>
                c.no_cid.toLowerCase().includes(term.toLowerCase()) ||
                c.co_cid.toLowerCase().includes(term.toLowerCase())
            ).slice(0, 50);
            setCidResults(results);
            setShowCidSearch(true);
        } else {
            setShowCidSearch(false);
        }
    };

    const selectCid = (cid: CID) => {
        setFormData({
            ...formData,
            "Diagnóstico (Busca)": cid.no_cid,
            "CID": cid.co_cid
        });
        setShowCidSearch(false);
    };

    const handleProcSearch = (term: string) => {
        setFormData({ ...formData, "Procedimento (Busca)": term });
        if (term.length >= MIN_SEARCH_CHARS) {
            // Filter procedures
            const results = procsData.filter((p: any) =>
                p.no_procedimento.toLowerCase().includes(term.toLowerCase()) ||
                p.co_procedimento.toLowerCase().includes(term.toLowerCase())
            ).slice(0, 50);
            setProcResults(results);
            setShowProcSearch(true);
        } else {
            setShowProcSearch(false);
        }
    };

    const selectProc = (proc: Procedure) => {
        // Procedure code logic if needed for PDF mapping? 
        // The mapping has "Cód. Procedimento Principal". We need to populate that!
        // Let's add it to formData
        setFormData((prev: any) => ({
            ...prev,
            "Procedimento (Busca)": proc.no_procedimento,
            "Cód. Procedimento Principal": proc.co_procedimento
        }));

        console.log("Selected Procedure:", proc); // DEBUG
        setSelectedProc(proc);
        setShowProcSearch(false);
    };



    const handleGenerate = async () => {
        try {
            // Prepare data for PDF with correct mapping keys
            const pdfData: any = {
                "Nome do estabelecimento solicitante": formData["Nome do estabelecimento solicitante"],
                "CNS Estabelecimento Solicitante": formData["CNS Estabelecimento Solicitante"],
                "Nome do estabelecimento executante": formData["Nome do estabelecimento executante"],
                "CNS Estabelecimento executante": formData["CNS Estabelecimento executante"],
                "Nome do paciente": formData["Nome do paciente"],
                "CNS Paciente": formData["CNS Paciente"],
                "Data de nascimento": formData["Data Nasc"],
                "Principais sinais e sintomas": formData["Sinais/Sintomas"],
                "Condições que justificam a internação": formData["Justificativa"],
                "Resultado de provas diagnósticas": formData["Resultados"],
                "Diagnóstico": formData["Diagnóstico (Busca)"], // Needs name? Or search term is the name?
                "CID": formData["CID"],
                "Descrição do procedimento solicitado": selectedProc ? selectedProc.no_procedimento : formData["Procedimento (Busca)"],
                "Cód. Procedimento Principal": selectedProc ? selectedProc.co_procedimento : "",
                "CheckCPF Médico": formData["CheckCPF Médico"],
                "CPF Médico": formData["CPF Médico"],
                "Nome do médico": formData["Nome Médico"],
                "Data da solicitação": formData["Data Solicitação"]
            };

            // Handle Gender Boolean
            if (formData.Sexo === 'M') {
                pdfData["Sexo Masculino"] = true;
                pdfData["Sexo Feminino"] = false;
            } else if (formData.Sexo === 'F') {
                pdfData["Sexo Masculino"] = false;
                pdfData["Sexo Feminino"] = true;
            }

            const pdfBytes = await generateAIHPDF(pdfData);

            // Automatic Save to LocalStorage
            saveAIH({
                patientName: formData["Nome do paciente"] || "Sem Nome",
                cns: formData["CNS Paciente"] || "",
                diagnosis: formData["Diagnóstico (Busca)"] || formData["CID"] || "",
                procedure: selectedProc ? selectedProc.no_procedimento : (formData["Procedimento (Busca)"] || ""),
                doctor: formData["Nome Médico"] || "",
                date: new Date().toISOString(), // Use ISO for sorting
                data: formData
            });

            // Create blob and download
            // Fix for TS error: cast to any or BlobPart[]
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `HMM-${new Date().getFullYear()}-${formData["Nome do paciente"] || 'Paciente'}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Erro ao gerar PDF via Web. Verifique o console.");
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits

        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* ... header ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gerador de AIH</h1>
                    <p className="text-slate-500 mt-1">Preencha os dados para gerar o laudo de internação.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                >
                    <FileText className="w-5 h-5" />
                    <span>Gerar PDF</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

                    {/* Patient Info */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-semibold text-slate-800">
                            <User className="w-5 h-5 mr-2 text-blue-500" /> Identificação
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Paciente</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData["Nome do paciente"]}
                                    onChange={e => setFormData({ ...formData, "Nome do paciente": e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data Nasc.</label>
                                <input
                                    type="text"
                                    placeholder="DD/MM/AAAA"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData["Data Nasc"]}
                                    onChange={(e) => handleDateChange(e, "Data Nasc")}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CNS</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData["CNS Paciente"]}
                                    onChange={e => setFormData({ ...formData, "CNS Paciente": e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                                <div className="flex space-x-6 pt-1">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sexo"
                                            value="M"
                                            checked={formData.Sexo === 'M'}
                                            onChange={() => setFormData({ ...formData, Sexo: 'M' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Masculino</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sexo"
                                            value="F"
                                            checked={formData.Sexo === 'F'}
                                            onChange={() => setFormData({ ...formData, Sexo: 'F' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Feminino</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Clinical Data */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-semibold text-slate-800">
                            <Stethoscope className="w-5 h-5 mr-2 text-blue-500" /> Dados Clínicos
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sinais e Sintomas</label>
                            <textarea
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                value={formData["Sinais/Sintomas"]}
                                onChange={e => setFormData({ ...formData, "Sinais/Sintomas": e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Justificativa</label>
                            <textarea
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                value={formData["Justificativa"]}
                                onChange={e => setFormData({ ...formData, "Justificativa": e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resultados</label>
                            <textarea
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                value={formData["Resultados"]}
                                onChange={e => setFormData({ ...formData, "Resultados": e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Diagnosis & Procedure */}
                    <div className="space-y-4 relative">
                        <h3 className="flex items-center text-lg font-semibold text-slate-800">
                            <Hospital className="w-5 h-5 mr-2 text-blue-500" /> Diagnóstico & Procedimentos
                        </h3>

                        {/* CID Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico (Busca CID)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Digite nome ou código..."
                                    value={formData["Diagnóstico (Busca)"]}
                                    onChange={e => handleCidSearch(e.target.value)}
                                    onFocus={() => formData["Diagnóstico (Busca)"].length >= MIN_SEARCH_CHARS && setShowCidSearch(true)}
                                />
                            </div>
                            {showCidSearch && cidResults.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {cidResults.map(cid => (
                                        <div
                                            key={cid.co_cid}
                                            className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm"
                                            onClick={() => selectCid(cid)}
                                        >
                                            <span className="font-bold text-blue-600">{cid.co_cid}</span> - {cid.no_cid}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <div className="w-32">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código CID</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-500"
                                    value={formData["CID"]}
                                />
                            </div>
                        </div>

                        {/* Procedure Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Procedimento Principal</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Busque o procedimento..."
                                    value={formData["Procedimento (Busca)"]}
                                    onChange={e => handleProcSearch(e.target.value)}
                                    onFocus={() => formData["Procedimento (Busca)"].length >= MIN_SEARCH_CHARS && setShowProcSearch(true)}
                                />
                            </div>
                            {showProcSearch && procResults.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {procResults.map(proc => (
                                        <div
                                            key={proc.co_procedimento}
                                            className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm"
                                            onClick={() => selectProc(proc)}
                                        >
                                            <span className="font-bold text-blue-600">{proc.co_procedimento}</span> - {proc.no_procedimento}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Professional Data */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-semibold text-slate-800">
                            <User className="w-5 h-5 mr-2 text-blue-500" /> Profissional Solicitante
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Médico</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData["Nome Médico"]}
                                    onChange={e => setFormData({ ...formData, "Nome Médico": e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData["CPF Médico"]}
                                    onChange={e => setFormData({ ...formData, "CPF Médico": e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data Solicitação</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData["Data Solicitação"]}
                                    onChange={e => setFormData({ ...formData, "Data Solicitação": e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Details & Preview */}
                <div className="space-y-6 sticky top-6">
                    <div className="bg-blue-900 text-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Check className="w-5 h-5 mr-2 text-blue-300" /> Status do Preenchimento
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-200/50">Paciente</span>
                                <span className={formData["Nome do paciente"] ? "text-blue-300" : "text-amber-400"}>
                                    {formData["Nome do paciente"] ? "Preenchido" : "Pendente"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-200/50">Diagnóstico</span>
                                <span className={formData["CID"] ? "text-blue-300" : "text-amber-400"}>
                                    {formData["CID"] || "Pendente"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-200/50">Procedimento</span>
                                <span className={selectedProc ? "text-blue-300" : "text-amber-400"}>
                                    {selectedProc ? "Selecionado" : "Pendente"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-blue-800">
                            <p className="text-xs text-blue-400 mb-2">Estabelecimento Solicitante</p>
                            <p className="font-medium text-blue-100">Hospital Municipal de Mozarlândia</p>
                            <p className="text-xs text-blue-400">CNES: 2535165</p>
                        </div>
                    </div>

                    {selectedProc && (
                        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Detalhes do Procedimento</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="block text-xs text-blue-500 uppercase tracking-wide">Código</span>
                                    <span className="font-mono text-blue-900 font-medium">{String(selectedProc.co_procedimento || '-')}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-blue-500 uppercase tracking-wide">Descrição</span>
                                    <span className="text-blue-800">{String(selectedProc.no_procedimento || '-')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Complexidade</span>
                                        <span className="text-blue-900 font-medium">{String(selectedProc.tp_complexidade || '-')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Valor SH</span>
                                        <span className="text-blue-600 font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedProc.vl_sh) || 0)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Valor SP</span>
                                        <span className="text-blue-600 font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedProc.vl_sp) || 0)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Valor SA</span>
                                        <span className="text-blue-600 font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedProc.vl_sa) || 0)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Permanência</span>
                                        <span className="text-blue-900 font-medium">{String(selectedProc.qt_tempo_permanencia)} dias</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-blue-500 uppercase tracking-wide">Idade Mín.</span>
                                        <span className="text-blue-900 font-medium">{String(selectedProc.vl_idade_minima)} meses</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
