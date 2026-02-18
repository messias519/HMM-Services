
import { Link } from 'react-router-dom';
import { FileText, Tag, ArrowRight } from 'lucide-react';

export const Home = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo ao HMM Services</h1>
                <p className="text-slate-500 mt-2">Selecione uma ferramenta abaixo para começar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Label Generator Card */}
                <Link
                    to="/etiquetas"
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-blue-100/50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                            <Tag className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">Gerador de Etiquetas</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Crie etiquetas personalizadas para Pacientes, Acompanhantes e Visitantes. Otimizado para impressoras Zebra.
                    </p>
                </Link>

                {/* AIH Generator Card */}
                <Link
                    to="/aih"
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-emerald-100/50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
                            <FileText className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">Gerador de AIH</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Preencha e gere laudos de AIH (Autorização de Internação Hospitalar) com busca de CIDs e procedimentos.
                    </p>
                </Link>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest mb-4">Informações do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
                    <div>
                        <span className="block text-xs text-slate-400 mb-1">Unidade</span>
                        Hospital Municipal de Mozarlândia
                    </div>
                    <div>
                        <span className="block text-xs text-slate-400 mb-1">CNES</span>
                        2535165
                    </div>
                    <div>
                        <span className="block text-xs text-slate-400 mb-1">Versão</span>
                        v1.1.0
                    </div>
                </div>
            </div>
        </div>
    );
};
