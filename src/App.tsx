import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Home } from './pages/Home';
import { AIHGenerator } from './pages/AIHGenerator';
import { LabelGenerator } from './pages/LabelGenerator';
import { Login } from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('hmm_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hmm_auth');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) return null; // Wait for localStorage check

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout onLogout={handleLogout} />}>
          <Route index element={<Home />} />
          <Route path="aih" element={<AIHGenerator />} />
          <Route path="etiquetas" element={<LabelGenerator />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
