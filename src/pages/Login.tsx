import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'saude2026') {
      localStorage.setItem('hmm_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-100 overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="HMM" className="w-full h-full object-contain p-2" onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}vite.svg`)} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HMM Services</h1>
          <p className="text-slate-500">Digite a senha mestre para acessar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Senha de acesso"
              className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all text-center text-xl font-mono tracking-widest ${error ? 'border-red-300 bg-red-50 text-red-900 animate-shake' : 'border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              value={password}
              onChange={(e) => {
                setError(false);
                setPassword(e.target.value);
              }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all transform active:scale-95"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">Hospital Municipal de Mozarlândia</p>
        </div>
      </div>
    </div>
  );
};
