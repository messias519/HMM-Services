import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FileText, Menu, X, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
    return (
        <aside
            className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex flex-col items-center justify-center py-8 px-6 bg-blue-950/50">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner overflow-hidden border-2 border-white/20">
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt="Logo Mozarlândia"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}vite.svg`)}
                    />
                </div>
                <div className="text-center">
                    <span className="text-xl font-bold tracking-tight block">HMM Services</span>
                    <span className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold opacity-70">Mozarlândia - GO</span>
                </div>
                <button onClick={toggle} className="lg:hidden absolute top-4 right-4">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="p-4 space-y-2 mt-4">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        clsx(
                            "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                            isActive ? "bg-white/10 text-white shadow-lg ring-1 ring-white/20" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                        )
                    }
                >
                    <FileText className="w-5 h-5 text-blue-300" />
                    <span className="font-medium">Gerador de AIH</span>
                </NavLink>
            </nav>

            <div className="absolute bottom-0 w-full p-6 border-t border-white/5">
                <p className="text-[10px] text-blue-400 text-center uppercase tracking-tighter opacity-50">
                    &copy; 2026 Hospital Municipal de Mozarlândia
                </p>
            </div>
        </aside>
    );
};

export const MainLayout = ({ onLogout }: { onLogout: () => void }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-600 lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-2 ml-auto sm:space-x-4">
                        <div className="flex items-center px-2 py-1 bg-slate-50 rounded-full border border-slate-200 sm:px-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                M
                            </div>
                            <span className="ml-2 text-xs font-semibold text-slate-600 hidden sm:inline">Admin</span>
                        </div>

                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100 sm:px-4"
                            title="Sair do sistema"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">Sair</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
