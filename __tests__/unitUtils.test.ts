import { 
  convertLength, 
  convertArea, 
  formatLength, 
  formatArea, 
  parseLength 
} from '../src/utils/unitUtils';

describe('Unit Conversion Utilities', () => {
  describe('convertLength', () => {
    it('should convert from metric to imperial correctly', () => {
      expect(convertLength(1, 'metric', 'imperial')).toBeCloseTo(3.28084);
      expect(convertLength(10, 'metric', 'imperial')).toBeCloseTo(32.8084);
    });

    it('should convert from imperial to metric correctly', () => {
      expect(convertLength(3.28084, 'imperial', 'metric')).toBeCloseTo(1);
      expect(convertLength(10, 'imperial', 'metric')).toBeCloseTo(3.048);
    });

    it('should return the same value when source and target units are the same', () => {
      expect(convertLength(10, 'metric', 'metric')).toBe(10);
      expect(convertLength(10, 'imperial', 'imperial')).toBe(10);
    });
  });

  describe('convertArea', () => {
    it('should convert from metric to imperial correctly', () => {
      expect(convertArea(1, 'metric', 'imperial')).toBeCloseTo(10.7639);
      expect(convertArea(10, 'metric', 'imperial')).toBeCloseTo(107.639);
    });

    it('should convert from imperial to metric correctly', () => {
      expect(convertArea(10.7639, 'imperial', 'metric')).toBeCloseTo(1);
      expect(convertArea(100, 'imperial', 'metric')).toBeCloseTo(9.2903);
    });
  });

  describe('formatLength', () => {
    it('should format metric lengths correctly', () => {
      expect(formatLength(1, 'metric', 2, true)).toBe('1.00 m');
      expect(formatLength(1, 'metric', 2, false)).toBe('1.00');
      expect(formatLength(1.5, 'metric', 1, true)).toBe('1.5 m');
    });

    it('should format imperial lengths in decimal format correctly', () => {
      expect(formatLength(1, 'imperial', 2, true, 'decimal')).toBe('1.00 ft');
      expect(formatLength(1, 'imperial', 2, false, 'decimal')).toBe('1.00');
      expect(formatLength(1.5, 'imperial', 1, true, 'decimal')).toBe('1.5 ft');
    });

    it('should format imperial lengths in fractional format correctly', () => {
      expect(formatLength(1, 'imperial', 2, true, 'fractional')).toBe('1\'');
      expect(formatLength(1.5, 'imperial', 2, true, 'fractional')).toBe('1\' 6');
      expect(formatLength(5.25, 'imperial', 2, true, 'fractional')).toBe('5\' 3');
    });
  });

  describe('formatArea', () => {
    it('should format metric areas correctly', () => {
      expect(formatArea(1, 'metric', 2, true)).toBe('1.00 m²');
      expect(formatArea(1, 'metric', 2, false)).toBe('1.00');
      expect(formatArea(1.5, 'metric', 1, true)).toBe('1.5 m²');
    });

    it('should format imperial areas correctly', () => {
      expect(formatArea(1, 'imperial', 2, true)).toBe('1.00 ft²');
      expect(formatArea(1, 'imperial', 2, false)).toBe('1.00');
      expect(formatArea(1.5, 'imperial', 1, true)).toBe('1.5 ft²');
    });
  });

  describe('parseLength', () => {
    it('should parse metric length inputs correctly', () => {
      expect(parseLength('1', 'metric')).toBe(1);
      expect(parseLength('1.5', 'metric')).toBe(1.5);
      expect(parseLength('1.5m', 'metric')).toBe(1.5);
      expect(parseLength('1,5', 'metric')).toBe(1.5);
    });

    it('should parse imperial decimal inputs correctly', () => {
      expect(parseLength('1', 'imperial')).toBe(1);
      expect(parseLength('1.5', 'imperial')).toBe(1.5);
      expect(parseLength('1.5ft', 'imperial')).toBe(1.5);
    });

    it('should parse imperial feet and inches notation correctly', () => {
      expect(parseLength('1\'', 'imperial')).toBe(1);
      expect(parseLength('1\' 6"', 'imperial')).toBe(1.5);
      expect(parseLength('5\' 6 1/2"', 'imperial')).toBeCloseTo(5.54, 2);
    });

    it('should return null for invalid inputs', () => {
      expect(parseLength('', 'metric')).toBeNull();
      expect(parseLength('abc', 'metric')).toBeNull();
      expect(parseLength('1\'abc', 'imperial')).toBe(1);
    });
  });
});