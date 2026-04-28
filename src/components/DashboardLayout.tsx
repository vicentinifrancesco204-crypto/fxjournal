import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

const DashboardLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
        {/* Sidebar - fixed width */}
        <Sidebar />

        {/* Main Content Area - scrolls independently */}
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          {/* Header - sticky top */}
          <Header />

          {/* Main Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-slate-950">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
