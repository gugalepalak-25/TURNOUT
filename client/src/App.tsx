import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NearWalletProvider } from './context/NearWalletContext.js';
import { Shell } from './components/layout/Shell.js';

import { OverviewPage } from './pages/OverviewPage.js';
import { HouseOfStakePage } from './pages/HouseOfStakePage.js';
import { SputnikPage } from './pages/SputnikPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { DelegatePassportPage } from './pages/DelegatePassportPage.js';
import { ProposalsPage } from './pages/ProposalsPage.js';
import { ProposalDetailPage } from './pages/ProposalDetailPage.js';
import { AnalystPage } from './pages/AnalystPage.js';
import { RewardsPage } from './pages/RewardsPage.js';
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
            <Route path="/" element={<Shell />}>
              <Route index element={<OverviewPage />} />
              <Route path="house-of-stake" element={<HouseOfStakePage />} />
              <Route path="sputnik" element={<SputnikPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="delegate/:account" element={<DelegatePassportPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="proposals/:id" element={<ProposalDetailPage />} />
              <Route path="analyst" element={<AnalystPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="guardian" element={<GuardianPage />} />
              <Route path="scorecards" element={<ScorecardsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NearWalletProvider>
    </QueryClientProvider>
  );
};

export default App;

