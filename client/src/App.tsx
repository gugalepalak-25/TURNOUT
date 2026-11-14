import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NearWalletProvider } from './context/NearWalletContext.js';
import { Shell } from './components/layout/Shell.js';

import { LandingPage } from './pages/LandingPage.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { HouseOfStakePage } from './pages/HouseOfStakePage.js';
import { SputnikPage } from './pages/SputnikPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { DelegatePassportPage } from './pages/DelegatePassportPage.js';
import { ProposalsPage } from './pages/ProposalsPage.js';
import { ProposalDetailPage } from './pages/ProposalDetailPage.js';
import { AnalystPage } from './pages/AnalystPage.js';
import { GuardianPage } from './pages/GuardianPage.js';
import { ScorecardsPage } from './pages/ScorecardsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NearWalletProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Landing Page (Single-Viewport Full-Bleed Video UI/UX) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />

            {/* DApp Control Room Application Routes (/app) */}
            <Route path="/app" element={<Shell />}>
              <Route index element={<OverviewPage />} />
              <Route path="house-of-stake" element={<HouseOfStakePage />} />
              <Route path="sputnik" element={<SputnikPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="delegate/:account" element={<DelegatePassportPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="proposals/:id" element={<ProposalDetailPage />} />
              <Route path="analyst" element={<AnalystPage />} />
              <Route path="guardian" element={<GuardianPage />} />
              <Route path="scorecards" element={<ScorecardsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Direct Shortcuts without /app prefix */}
            <Route element={<Shell />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/house-of-stake" element={<HouseOfStakePage />} />
              <Route path="/sputnik" element={<SputnikPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/delegate/:account" element={<DelegatePassportPage />} />
              <Route path="/proposals" element={<ProposalsPage />} />
              <Route path="/proposals/:id" element={<ProposalDetailPage />} />
              <Route path="/analyst" element={<AnalystPage />} />
              <Route path="/guardian" element={<GuardianPage />} />
              <Route path="/scorecards" element={<ScorecardsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NearWalletProvider>
    </QueryClientProvider>
  );
};

export default App;
