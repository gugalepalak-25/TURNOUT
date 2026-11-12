import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Bot, Radio } from 'lucide-react';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Full-viewport cover video background */}
      <div className="landing-bg">
        <video className="landing-bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        {/* Subtle cinematic overlays for maximum legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
      </div>

      {/* 1) Header */}
      <header className="landing-header">
        {/* Circular Logo Button */}
        <Link to="/" className="landing-logo-btn" aria-label="Turnout Home">
          <svg
            className="landing-logo-svg"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 22V15C9 10 13 6 18 6C23 6 27 10 27 15V22"
              stroke="#111111"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="3" fill="#111111" />
            <circle cx="10" cy="27" r="2.5" fill="#111111" />
            <circle cx="18" cy="27" r="2.5" fill="#111111" />
            <circle cx="26" cy="27" r="2.5" fill="#111111" />
          </svg>
        </Link>

        {/* Desktop Navigation Pill (White) */}
        <nav className="landing-nav-pill" aria-label="Primary Navigation">
          <Link to="/" className="landing-nav-link active">
            Home
          </Link>
          <Link to="/app/house-of-stake" className="landing-nav-link">
            House of Stake
          </Link>
          <Link to="/app/leaderboard" className="landing-nav-link">
            Leaderboard
          </Link>
          <Link to="/app/analyst" className="landing-nav-link">
            AI Analyst
          </Link>
          <Link to="/app/scorecards" className="landing-nav-link">
            Scorecards
          </Link>
        </nav>

        {/* Desktop Launch / Sign In (Dark Pill) */}
        <Link to="/app" className="landing-sign-in-btn">
          Enter Control Room
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="landing-burger-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="landing-burger-bar" />
          <span className="landing-burger-bar" />
          <span className="landing-burger-bar" />
        </button>
      </header>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start p-6 bg-black/95 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="font-dotmatrix text-lg text-white">TURNOUT</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-mono text-[#8e8e8e] hover:text-white px-3 py-1.5 rounded-full bg-[#28282a]"
            >
              [CLOSE]
            </button>
          </div>
          <div className="flex flex-col gap-4 text-base font-sans">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-white font-medium border-b border-white/5"
            >
              Home
            </Link>
            <Link
              to="/app/house-of-stake"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#c8c8c8] hover:text-white border-b border-white/5"
            >
              House of Stake
            </Link>
            <Link
              to="/app/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#c8c8c8] hover:text-white border-b border-white/5"
            >
              Leaderboard
            </Link>
            <Link
              to="/app/analyst"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#c8c8c8] hover:text-white border-b border-white/5"
            >
              AI Analyst
            </Link>
            <Link
              to="/app/scorecards"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#c8c8c8] hover:text-white border-b border-white/5"
            >
              Scorecards
            </Link>
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 py-3 rounded-full bg-white text-black font-semibold text-center"
            >
              Launch Control Room
            </Link>
          </div>
        </div>
      )}

      {/* 2) Hero (Center - Perfectly Aligned) */}
      <section className="landing-hero" id="home">
        {/* Governance Verified Pill */}
        <div className="landing-trust-row landing-anim" style={{ ['--d' as any]: '0.05s' }}>
          <div className="landing-avatar-ring landing-avatar-1" title="NEAR Protocol">
            <div className="landing-avatar-inner">
              <span className="text-[11px] font-bold text-black font-mono">N</span>
            </div>
          </div>
          <div className="landing-avatar-ring landing-avatar-2" title="House of Stake">
            <div className="landing-avatar-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
            </div>
          </div>
          <div className="landing-avatar-ring landing-avatar-3" title="On-Chain Registry">
            <div className="landing-avatar-inner">
              <Award className="w-3.5 h-3.5 text-black" />
            </div>
          </div>
          <div className="landing-trust-pill">
            <span className="w-2 h-2 rounded-full bg-[#B6F36B] shadow-[0_0_8px_#B6F36B]" />
            <span>NEAR Protocol • House of Stake Governance</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="landing-headline landing-anim" style={{ ['--d' as any]: '0.12s' }}>
          <span className="landing-headline-line landing-line-1">THE ACCOUNTABILITY LAYER</span>
          <span className="landing-headline-line landing-line-2">FOR DECENTRALIZED GOVERNANCE</span>
        </h1>

        {/* Subhead */}
        <p className="landing-subhead landing-anim" style={{ ['--d' as any]: '0.22s' }}>
          Turnout transforms on-chain NEAR voting records into transparent reputation, verifiable performance scorecards, and performance-based incentives across House of Stake.
        </p>

        {/* Governance Lifecycle Workflow Track */}
        <div className="landing-workflow-pills landing-anim" style={{ ['--d' as any]: '0.30s' }}>
          <span className="landing-stage-pill active">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36B] inline-block mr-1.5 animate-pulse-subtle" />
            MONITOR
          </span>
          <span className="landing-arrow-div">→</span>
          <span className="landing-stage-pill">EVALUATE</span>
          <span className="landing-arrow-div">→</span>
          <span className="landing-stage-pill">VERIFY</span>
          <span className="landing-arrow-div">→</span>
          <span className="landing-stage-pill">REWARD</span>
          <span className="landing-arrow-div">→</span>
          <span className="landing-stage-pill">PROTECT</span>
        </div>

        {/* CTA Row */}
        <div className="landing-cta-wrap landing-anim" style={{ ['--d' as any]: '0.38s' }}>
          <Link to="/app" className="landing-cta-btn">
            <span>Launch Control Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/app/leaderboard" className="landing-secondary-btn">
            <span>Delegate Directory</span>
          </Link>
          <Link to="/app/analyst" className="landing-secondary-btn">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Analyst</span>
          </Link>
        </div>
      </section>

      {/* 3) Clean Minimalist Telemetry Footer (Old 4-stat line completely removed) */}
      <footer className="landing-footer-telemetry landing-anim" style={{ ['--d' as any]: '0.45s' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B6F36B] animate-pulse-subtle" />
          <span>TURNOUT PROTOCOL • NEAR TESTNET</span>
        </div>
        <div>
          <span>HOUSE OF STAKE EPOCH 14 • veNEAR SNAPSHOTS • NON-CUSTODIAL</span>
        </div>
      </footer>
    </div>
  );
};
