import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { fetchOverview } from '../../services/api.js';

export const Shell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: overview } = useQuery({
    queryKey: ['governance-overview'],
    queryFn: fetchOverview,
    staleTime: 30000,
  });

  return (
    <div className="flex h-screen bg-cr-bg text-cr-text overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw]">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          blockchainStatus={overview?.blockchainStatus}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 terminal-grid">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

