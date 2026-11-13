import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerdictBadge } from '../components/AnswerCard/VerdictBadge';
import { ChecksTable } from '../components/AnswerCard/ChecksTable';
import { ClarifyCard } from '../components/AnswerCard/ClarifyCard';
import { CheckResult } from '../types';

describe('VerdictBadge Component', () => {
  it('renders YES verdict correctly with green styling and label', () => {
    render(<VerdictBadge verdict="YES" />);
    const badge = screen.getByTestId('verdict-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/FITS YOU|COMPATIBLE/i);
    expect(badge.className).toContain('text-[#15803D]');
  });

  it('renders NO verdict correctly with red styling and label', () => {
    render(<VerdictBadge verdict="NO" />);
    const badge = screen.getByTestId('verdict-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/WILL NOT FIT|INCOMPATIBLE/i);
    expect(badge.className).toContain('text-[#B91C1C]');
  });

  it('renders CANNOT_CONFIRM verdict with amber styling and label', () => {
    render(<VerdictBadge verdict="CANNOT_CONFIRM" />);
    const badge = screen.getByTestId('verdict-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/CANNOT CONFIRM/i);
    expect(badge.className).toContain('text-[#B45309]');
  });

  it('renders custom badge text when supplied', () => {
    render(<VerdictBadge verdict="NO" customText="Snug at waist" />);
    const badge = screen.getByTestId('verdict-badge');
    expect(badge).toHaveTextContent(/Snug at waist/i);
  });
});

describe('ChecksTable Component', () => {
  const sampleChecks: CheckResult[] = [
    {
      attribute: 'Bust / Chest',
      required: '36 in',
      actual: '35–37 in',
      passed: true,
      source_ref: 'doc_clothing_aura_dress · p.2'
    },
    {
      attribute: 'Waist',
      required: '30 in',
      actual: '28–29.5 in',
      passed: false,
      source_ref: 'doc_clothing_aura_dress · p.2'
    }
  ];

  it('renders all attributes, monospace needed/actual values, and failing row', () => {
    render(<ChecksTable checks={sampleChecks} defaultOpen={true} />);

    expect(screen.getByText('Bust / Chest')).toBeInTheDocument();
    expect(screen.getByText('Waist')).toBeInTheDocument();
    expect(screen.getByText('36 in')).toBeInTheDocument();
    expect(screen.getByText('28–29.5 in')).toBeInTheDocument();

    const failingRow = screen.getByTestId('check-row-1');
    expect(failingRow.className).toContain('bg-red-50');
  });
});

describe('ClarifyCard Component', () => {
  it('renders clarifying question, options, and fires callback on tap', () => {
    const onAnswerMock = vi.fn();
    render(
      <ClarifyCard
        question="Which vacuum model do you own?"
        options={['Dyson V11 Absolute', 'Dyson V8 Animal']}
        onAnswer={onAnswerMock}
      />
    );

    expect(screen.getByText('Which vacuum model do you own?')).toBeInTheDocument();
    const v11Button = screen.getByText('Dyson V11 Absolute');
    expect(v11Button).toBeInTheDocument();

    fireEvent.click(v11Button);
    expect(onAnswerMock).toHaveBeenCalledWith('Dyson V11 Absolute');
  });

  it('allows typing custom reply and submitting', () => {
    const onAnswerMock = vi.fn();
    render(
      <ClarifyCard
        question="Which vacuum model do you own?"
        onAnswer={onAnswerMock}
      />
    );

    const input = screen.getByPlaceholderText(/type your exact model/i);
    fireEvent.change(input, { target: { value: 'Dyson Outsize' } });

    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    expect(onAnswerMock).toHaveBeenCalledWith('Dyson Outsize');
  });
});
