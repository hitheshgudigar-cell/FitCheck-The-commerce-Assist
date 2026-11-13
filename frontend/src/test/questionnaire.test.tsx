import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductQuestionnaireModal } from '../components/Discovery/ProductQuestionnaireModal';
import { getQuestionnaireForProduct, PRODUCT_QUESTIONNAIRES } from '../mocks/questionnaires';
import { MOCK_PRODUCTS } from '../mocks';

describe('Product Questionnaires & Modal', () => {
  it('has structured questionnaires for catalog products', () => {
    const dressQ = getQuestionnaireForProduct('prod_clothing_dress_01');
    expect(dressQ).toBeTruthy();
    expect(dressQ?.questions[0].options.length).toBeGreaterThan(0);

    const hpQ = getQuestionnaireForProduct('prod_elec_cartridge_01');
    expect(hpQ).toBeTruthy();
    expect(hpQ?.questions[0].options.some(o => o.prompt.includes('2331'))).toBe(true);

    const tvQ = getQuestionnaireForProduct('prod_elec_tv_mount_01');
    expect(tvQ).toBeTruthy();

    const sofaQ = getQuestionnaireForProduct('prod_furniture_01');
    expect(sofaQ).toBeTruthy();
  });

  it('renders ProductQuestionnaireModal for Aura Dress with options and submits query', () => {
    const dress = MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_01')!;
    const onSubmitMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <ProductQuestionnaireModal
        product={dress}
        isOpen={true}
        onClose={onCloseMock}
        onSubmitQuestion={onSubmitMock}
      />
    );

    expect(screen.getByText(/Pre-Purchase Questionnaire/i)).toBeInTheDocument();
    expect(screen.getByText(/Aura Silk Floral Wrap Dress/i)).toBeInTheDocument();
    expect(screen.getByText(/Bust 36", Waist 30"/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Verify Fit & Stock Now/i });
    fireEvent.click(submitBtn);

    expect(onSubmitMock).toHaveBeenCalled();
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const dress = MOCK_PRODUCTS[0];
    const { container } = render(
      <ProductQuestionnaireModal
        product={dress}
        isOpen={false}
        onClose={() => {}}
        onSubmitQuestion={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
