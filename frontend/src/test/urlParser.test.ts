import { describe, it, expect } from 'vitest';
import { parseProductUrl, SAMPLE_PRODUCT_LINKS } from '../utils/urlParser';
import { evaluateMockQuery } from '../mocks';

describe('Online Product Link Parser & Matcher', () => {
  it('parses Amazon product link and matches local HP cartridge', () => {
    const amazonUrl = 'https://www.amazon.in/HP-DeskJet-Cartridge-Original-3YM61AE/dp/B0852T8B9S';
    const res = parseProductUrl(amazonUrl);

    expect(res.platform).toBe('amazon');
    expect(res.platformName).toBe('Amazon.in');
    expect(res.extractedId).toBe('B0852T8B9S');
    expect(res.matchedProduct).toBeTruthy();
    expect(res.matchedProduct?.id).toBe('prod_elec_cartridge_01');
    expect(res.matchedProduct?.name).toContain('HP 67');
    expect(res.localAvailability.length).toBeGreaterThan(0);
    expect(res.localAvailability[0].distance_km).toBe(1.2);
    expect(res.localAvailability[0].pickup_today).toBe(true);
  });

  it('parses Myntra dress link and matches Aura Silk Wrap Dress', () => {
    const myntraUrl = 'https://www.myntra.com/dresses/aura-apparel/silk-floral-wrap-dress/18293041/buy';
    const res = parseProductUrl(myntraUrl);

    expect(res.platform).toBe('myntra');
    expect(res.platformName).toBe('Myntra');
    expect(res.matchedProduct?.id).toBe('prod_clothing_dress_01');
    expect(res.matchedProduct?.name).toContain('Aura Silk');
    expect(res.localAvailability.some(s => s.qty > 0)).toBe(true);
  });

  it('parses Flipkart TV mount link and matches ProMount', () => {
    const flipkartUrl = 'https://www.flipkart.com/promount-heavy-duty-tilting-tv-wall-mount-55-inch/p/itm7a1b89c';
    const res = parseProductUrl(flipkartUrl);

    expect(res.platform).toBe('flipkart');
    expect(res.platformName).toBe('Flipkart');
    expect(res.matchedProduct?.id).toBe('prod_elec_tv_mount_01');
    expect(res.localAvailability.length).toBeGreaterThan(0);
  });

  it('parses IKEA sofa link and matches Nordic Comfort Sofa', () => {
    const ikeaUrl = 'https://www.ikea.com/in/en/p/nordic-comfort-fabric-sofa-3-seater-slate-grey-80419284';
    const res = parseProductUrl(ikeaUrl);

    expect(res.platform).toBe('ikea');
    expect(res.platformName).toBe('IKEA India');
    expect(res.matchedProduct?.id).toBe('prod_furniture_01');
  });

  it('evaluates pasted Amazon URL in evaluateMockQuery and returns certified compatibility', () => {
    const res = evaluateMockQuery('https://www.amazon.in/HP-DeskJet-Cartridge-Original-3YM61AE/dp/B0852T8B9S');
    expect(res.verdict).toBe('YES');
    expect(res.headline).toContain('Amazon.in');
    expect(res.headline).toContain('HP DeskJet 2331');
    expect(res.availability.length).toBeGreaterThan(0);
    expect(res.citations.some(c => c.doc.includes('HP DeskJet'))).toBe(true);
  });

  it('evaluates pasted Myntra dress URL and returns sizing assessment', () => {
    const res = evaluateMockQuery('https://www.myntra.com/dresses/aura-apparel/silk-floral-wrap-dress/18293041/buy');
    expect(res.verdict).toBe('NO');
    expect(res.headline).toContain('Myntra');
    expect(res.headline).toContain('snug at 30" waist');
  });

  it('provides all 5 valid sample links with corresponding local catalog matches', () => {
    expect(SAMPLE_PRODUCT_LINKS.length).toBe(5);
    SAMPLE_PRODUCT_LINKS.forEach(sample => {
      const parsed = parseProductUrl(sample.url);
      expect(parsed.matchedProduct).toBeTruthy();
    });
  });
});
