import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animated stats counting hook
  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);
  const [stat4, setStat4] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 1600;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setStat1(parseFloat((eased * 99.9).toFixed(1)));
      setStat2(parseFloat((eased * 2.4).toFixed(1)));
      setStat3(Math.floor(eased * 120));
      setStat4(Math.floor(eased * 12));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(step);
    }, 350);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        {/* Subtle cinematic overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      </div>

      {/* 1) Header */}
      <header className="landing-header">
        {/* Circular Logo Button */}
        <Link to="/" className="landing-logo-btn" aria-label="Turnout Home">
          <img
            src="/assets/logo.webp"
            alt=""
            width="52"
            height="52"
            className="landing-logo-img"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <svg
            className="w-[72%] h-[72%] absolute inset-0 m-auto pointer-events-none"
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
          Enter App
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
        <div className="fixed inset-0 z-50 flex flex-col justify-start p-6 bg-black/90 backdrop-blur-xl">
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

      {/* 2) Hero (Center) */}
      <section className="landing-hero" id="home">
        {/* Trust Row */}
        <div className="landing-trust-row landing-anim" style={{ ['--d' as any]: '0.05s' }}>
          <div className="landing-avatar-ring landing-avatar-1" title="Microsoft">
            <div className="landing-avatar-inner">
              <i className="fa-brands fa-microsoft" />
            </div>
          </div>
          <div className="landing-avatar-ring landing-avatar-2" title="Amazon">
            <div className="landing-avatar-inner">
              <i className="fa-brands fa-amazon" />
            </div>
          </div>
          <div className="landing-avatar-ring landing-avatar-3" title="Google">
            <div className="landing-avatar-inner">
              <i className="fa-brands fa-google" />
            </div>
          </div>
          <div className="landing-trust-pill">
            <span>Trusted by 2000+ Enterprises</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="landing-headline landing-anim" style={{ ['--d' as any]: '0.12s' }}>
          <span className="landing-headline-line landing-line-1">INTELLIGENCE</span>
          <span className="landing-headline-line landing-line-2">DESIGNED TO EVOLVE</span>
        </h1>

        {/* Subhead */}
        <p className="landing-subhead landing-anim" style={{ ['--d' as any]: '0.22s' }}>
          A unified AI work platform transforming raw data into self-learning automation, resilient systems, and ambient intelligence.
        </p>

        {/* CTA Row */}
        <div className="landing-cta-wrap landing-anim" style={{ ['--d' as any]: '0.34s' }}>
          <Link to="/app" className="landing-cta-btn">
            <span>Enter Control Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/app/house-of-stake" className="landing-secondary-btn">
            <span>Explore Governance</span>
          </Link>
        </div>
      </section>

      {/* 3) Stats Footer */}
      <footer className="landing-stats-footer landing-anim" style={{ ['--d' as any]: '0.44s' }}>
        <div className="landing-stats-grid">
          {/* Stat 1 */}
          <div className="landing-stat-item">
            <span className="landing-stat-icon">⊙</span>
            <div className="landing-stat-content">
              <span className="landing-stat-val">{stat1}%</span>
              <span className="landing-stat-label">System Precision</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="landing-stat-item">
            <span className="landing-stat-icon">▲</span>
            <div className="landing-stat-content">
              <span className="landing-stat-val">{stat2}x</span>
              <span className="landing-stat-label">Iteration Velocity</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="landing-stat-item">
            <span className="landing-stat-icon">❖</span>
            <div className="landing-stat-content">
              <span className="landing-stat-val">{stat3}M+</span>
              <span className="landing-stat-label">Workflows Automated</span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="landing-stat-item">
            <span className="landing-stat-icon">⚡</span>
            <div className="landing-stat-content">
              <span className="landing-stat-val">&lt;{stat4}ms</span>
              <span className="landing-stat-label">Inference Latency</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
