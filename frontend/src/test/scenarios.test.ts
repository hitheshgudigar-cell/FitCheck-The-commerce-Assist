import { describe, it, expect } from 'vitest';
import {
  evaluateMockQuery,
  getRankedDiscoveryProducts,
  SCENARIO_DRESS_M,
  SCENARIO_HP_CARTRIDGE,
  SCENARIO_TV_MOUNT,
  SCENARIO_SOFA_DOOR,
  SCENARIO_VACUUM_FILTER,
  SCENARIO_DISCOVERY_BLACK_DRESS,
  SCENARIO_PHARMACY
} from '../mocks';

describe('7 Mock Scenarios Evaluation', () => {
  // Scenario 1: Dress
  it('Scenario 1: Dress "bust 36, waist 30, will the M fit?" -> NO (snug waist) with alternative Size L', () => {
    const res = evaluateMockQuery('I am bust 36, waist 30. Will the M fit?');
    expect(res.verdict).toBe('NO');
    expect(res.headline).toContain('snug at the waist');
    expect(res.checks.some(c => c.attribute.includes('Waist') && c.passed === false)).toBe(true);
    expect(res.alternatives.length).toBeGreaterThan(0);
    expect(res.alternatives[0].product_name).toContain('Size L');
    expect(res.availability.length).toBeGreaterThan(0);
  });

  // Scenario 2: HP cartridge
  it('Scenario 2: "Does this cartridge work with my HP DeskJet 2331?" -> YES + citation + stock', () => {
    const res = evaluateMockQuery('Does this cartridge work with my HP DeskJet 2331?');
    expect(res.verdict).toBe('YES');
    expect(res.headline).toContain('HP DeskJet 2331');
    expect(res.citations.some(c => c.doc.includes('HP DeskJet'))).toBe(true);
    expect(res.availability.some(s => s.qty > 0)).toBe(true);
  });

  // Scenario 3: TV Mount
  it('Scenario 3: TV mount with wrong VESA (75 inch / 600x400) -> NO with check table and in-stock alternative', () => {
    const res = evaluateMockQuery('I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?');
    expect(res.verdict).toBe('NO');
    expect(res.headline).toContain('Incompatible');
    expect(res.checks.some(c => c.attribute.includes('VESA') && c.passed === false)).toBe(true);
    expect(res.alternatives.some(a => a.product_name.includes('85'))).toBe(true);
  });

  // Scenario 4: Sofa
  it('Scenario 4: Sofa with 80 cm door -> CANNOT_CONFIRM with missing packaged carton dimensions', () => {
    const res = evaluateMockQuery('Sofa that fits through an 80 cm door');
    expect(res.verdict).toBe('CANNOT_CONFIRM');
    expect(res.headline).toContain('Packaged carton dimensions missing');
    expect(res.checks.some(c => c.attribute.includes('Packaged Box') && c.passed === null)).toBe(true);
  });

  // Scenario 5: Vacuum Filter
  it('Scenario 5: "Does this filter fit my vacuum?" -> CANNOT_CONFIRM with ClarifyCard asking for model', () => {
    const res = evaluateMockQuery('Does this filter fit my vacuum?');
    expect(res.verdict).toBe('CANNOT_CONFIRM');
    expect(res.clarifying_question).toBeTruthy();
    expect(res.clarifying_options?.length).toBeGreaterThan(0);

    // Follow-up answer with V11
    const followUpRes = evaluateMockQuery('I have a Dyson V11 Absolute');
    expect(followUpRes.verdict).toBe('YES');
    expect(followUpRes.headline).toContain('Dyson V11');
  });

  // Scenario 6: Discovery
  it('Scenario 6: Discovery "black dress size M near me today" -> 4 ranked results', () => {
    const res = evaluateMockQuery('Black dress, size M, available near me today');
    expect(res.verdict).toBe('YES');
    expect(res.headline).toContain('Found 4 black dresses');

    const ranked = getRankedDiscoveryProducts('black dress size M near me today');
    expect(ranked.length).toBe(4);
    expect(ranked.some(r => r.fit_verdict?.badgeText === 'Fits you')).toBe(true);
    expect(ranked.some(r => r.fit_verdict?.badgeText === 'Snug at waist')).toBe(true);
  });

  // Scenario 7: Pharmacy item
  it('Scenario 7: Pharmacy item -> label facts only, with distinct consult notice', () => {
    const res = evaluateMockQuery('I need a gluten-free pain reliever. Is Crocin Advance gluten-free?');
    expect(res.verdict).toBe('YES');
    expect(res.headline).toContain('gluten-free');
    expect(res.notice?.type).toBe('medical');
    expect(res.notice?.text).toContain('Medical Advice Disclaimer');
  });
});
