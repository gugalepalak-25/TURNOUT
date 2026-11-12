import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { Logo } from '../components/common/Logo.js';

describe('Frontend Common Components', () => {
  it('renders GradeBadge correctly for Grade A', () => {
    const { container } = render(<GradeBadge grade="A" showLabel={true} />);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('Exemplary');
  });

  it('renders GradeBadge correctly for Grade F', () => {
    const { container } = render(<GradeBadge grade="F" showLabel={true} />);
    expect(container.textContent).toContain('F');
    expect(container.textContent).toContain('Deficient');
  });

  it('renders StatusBadge for proposal statuses', () => {
    const { container } = render(<StatusBadge status="Executed" />);
    expect(container.textContent).toContain('Executed');
  });

  it('renders Turnout Logo and brand typography', () => {
    const { container } = render(<Logo showText={true} />);
    expect(container.textContent).toContain('TURNOUT');
    expect(container.textContent).toContain('GOVERNANCE LAYER');
  });
});

