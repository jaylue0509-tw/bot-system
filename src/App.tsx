/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-amber-200 relative overflow-x-hidden bg-[#FFFDF5]">
      {/* Daisy pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-80" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg transform='translate(40, 40)'%3E%3Ccircle cx='0' cy='-8' r='4' fill='%23ffffff' /%3E%3Ccircle cx='0' cy='8' r='4' fill='%23ffffff' /%3E%3Ccircle cx='-8' cy='0' r='4' fill='%23ffffff' /%3E%3Ccircle cx='8' cy='0' r='4' fill='%23ffffff' /%3E%3Ccircle cx='-6' cy='-6' r='4' fill='%23ffffff' /%3E%3Ccircle cx='6' cy='6' r='4' fill='%23ffffff' /%3E%3Ccircle cx='-6' cy='6' r='4' fill='%23ffffff' /%3E%3Ccircle cx='6' cy='-6' r='4' fill='%23ffffff' /%3E%3Ccircle cx='0' cy='0' r='4.5' fill='%23FCD34D' /%3E%3C/g%3E%3C/svg%3E")`, 
          backgroundSize: '80px 80px' 
        }}
      ></div>
      
      <div className="relative z-10 min-h-screen">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  );
}
