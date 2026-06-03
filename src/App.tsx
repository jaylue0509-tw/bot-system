/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-amber-200 relative overflow-x-hidden bg-[#7DD3FC]">
      {/* Sky pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#bae6fd 4px, transparent 4px)', backgroundSize: '32px 32px' }}></div>
      {/* Ground/Grass */}
      <div className="fixed bottom-0 w-full h-[15vh] bg-[#86efac] border-t-[6px] border-slate-800 z-0"></div>
      
      <div className="relative z-10 min-h-screen">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}
