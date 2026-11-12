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
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      {/* Full-viewport cover video behind DApp interface */}
      <div className="fixed inset-0 overflow-hidden bg-black z-0 pointer-events-none">
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-25"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        {/* Cinematic gradient overlays for maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw]">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
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
