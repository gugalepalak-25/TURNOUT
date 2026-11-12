import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Layers,
  Award,
  Vote,
  Bot,
  Gift,
  ShieldCheck,
  FileCheck2,
  Settings,
  Radio,
  Home,
} from 'lucide-react';
import { Logo } from '../common/Logo.js';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard },
    { label: 'House of Stake', to: '/app/house-of-stake', icon: Landmark, badge: 'Core' },
    { label: 'Sputnik DAOs', to: '/app/sputnik', icon: Layers, badge: 'Phase 7' },
    { label: 'Leaderboard', to: '/app/leaderboard', icon: Award },
    { label: 'Proposals', to: '/app/proposals', icon: Vote },
    { label: 'AI Analyst', to: '/app/analyst', icon: Bot, badge: 'AI' },
    { label: 'Rewards', to: '/app/rewards', icon: Gift },
    { label: 'Delegation Guardian', to: '/app/guardian', icon: ShieldCheck },
    { label: 'Scorecards', to: '/app/scorecards', icon: FileCheck2 },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-black/60 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" title="Return to Landing Page">
            <Logo />
          </Link>
          <Link
            to="/"
            className="text-[10px] font-mono text-[#8e8e8e] hover:text-white bg-[#28282a] border border-white/15 px-2 py-1 rounded-full flex items-center gap-1"
            title="Landing Page"
          >
            <Home className="w-3 h-3" />
            <span className="hidden sm:inline">Landing</span>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="py-4 px-3">
          <div className="text-[10px] font-dotmatrix uppercase tracking-widest text-[#8e8e8e] px-3 mb-2.5">
            CONTROL ROOM PILLS
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.2)]'
                        : 'text-[#c8c8c8] hover:bg-[#28282a] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#8e8e8e]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-black text-white border-black'
                              : 'bg-[#28282a] text-[#c4c2c3] border-white/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Protocol Telemetry & Footer */}
      <div className="p-4 border-t border-white/10 bg-[#121214]/60 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono text-[#8e8e8e] mb-2">
          <span className="flex items-center gap-1.5 text-white">
            <Radio className="w-3 h-3 text-[#B6F36B] animate-pulse-subtle" />
            NEAR TESTNET
          </span>
          <span className="text-[10px] text-[#c4c2c3] bg-[#28282a] px-2 py-0.5 rounded-full border border-white/20">
            HOS EPOCH 14
          </span>
        </div>

        <p className="text-[10px] leading-relaxed text-[#8e8e8e]">
          Turnout governance accountability layer. Verifiable scorecards and performance monitoring.
        </p>
      </div>
    </aside>
  );
};
