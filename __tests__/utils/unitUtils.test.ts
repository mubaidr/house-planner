import {
  convertLength,
  convertArea,
  formatLength,
  formatArea,
  parseLength,
} from '@/utils/unitUtils';

describe('unitUtils', () => {
  describe('convertLength', () => {
    it('should return same value when converting to same unit system', () => {
      expect(convertLength(10, 'metric', 'metric')).toBe(10);
      expect(convertLength(15, 'imperial', 'imperial')).toBe(15);
    });

    it('should convert metric to imperial correctly', () => {
      expect(convertLength(1, 'metric', 'imperial')).toBeCloseTo(3.28084, 5);
      expect(convertLength(10, 'metric', 'imperial')).toBeCloseTo(32.8084, 4);
      expect(convertLength(0, 'metric', 'imperial')).toBe(0);
    });

    it('should convert imperial to metric correctly', () => {
      expect(convertLength(1, 'imperial', 'metric')).toBeCloseTo(0.3048, 5);
      expect(convertLength(10, 'imperial', 'metric')).toBeCloseTo(3.048, 4);
      expect(convertLength(0, 'imperial', 'metric')).toBe(0);
    });

    it('should handle negative values', () => {
      expect(convertLength(-5, 'metric', 'imperial')).toBeCloseTo(-16.4042, 4);
      expect(convertLength(-10, 'imperial', 'metric')).toBeCloseTo(-3.048, 4);
    });

    it('should handle decimal values', () => {
      expect(convertLength(1.5, 'metric', 'imperial')).toBeCloseTo(4.92126, 4);
      expect(convertLength(2.5, 'imperial', 'metric')).toBeCloseTo(0.762, 4);
    });
  });

  describe('convertArea', () => {
    it('should return same value when converting to same unit system', () => {
      expect(convertArea(100, 'metric', 'metric')).toBe(100);
      expect(convertArea(200, 'imperial', 'imperial')).toBe(200);
    });

    it('should convert metric to imperial correctly', () => {
      expect(convertArea(1, 'metric', 'imperial')).toBeCloseTo(10.7639, 4);
      expect(convertArea(10, 'metric', 'imperial')).toBeCloseTo(107.639, 3);
      expect(convertArea(0, 'metric', 'imperial')).toBe(0);
    });

    it('should convert imperial to metric correctly', () => {
      expect(convertArea(1, 'imperial', 'metric')).toBeCloseTo(0.092903, 5);
      expect(convertArea(100, 'imperial', 'metric')).toBeCloseTo(9.2903, 4);
      expect(convertArea(0, 'imperial', 'metric')).toBe(0);
    });

    it('should handle negative values', () => {
      expect(convertArea(-5, 'metric', 'imperial')).toBeCloseTo(-53.8195, 4);
      expect(convertArea(-50, 'imperial', 'metric')).toBeCloseTo(-4.64515, 4);
    });
  });

  describe('formatLength', () => {
    describe('metric formatting', () => {
      it('should format metric length with default settings', () => {
        expect(formatLength(5.123, 'metric')).toBe('5.12 m');
        expect(formatLength(10, 'metric')).toBe('10.00 m');
      });

      it('should respect precision parameter', () => {
        expect(formatLength(5.123456, 'metric', 0)).toBe('5 m');
        expect(formatLength(5.123456, 'metric', 1)).toBe('5.1 m');
        expect(formatLength(5.123456, 'metric', 3)).toBe('5.123 m');
        expect(formatLength(5.123456, 'metric', 4)).toBe('5.1235 m');
      });

      it('should handle showLabel parameter', () => {
        expect(formatLength(5.123, 'metric', 2, true)).toBe('5.12 m');
        expect(formatLength(5.123, 'metric', 2, false)).toBe('5.12');
      });

      it('should ignore format parameter for metric', () => {
        expect(formatLength(5.5, 'metric', 2, true, 'decimal')).toBe('5.50 m');
        expect(formatLength(5.5, 'metric', 2, true, 'fractional')).toBe('5.50 m');
      });
    });

    describe('imperial formatting', () => {
      it('should format imperial length in decimal format', () => {
        expect(formatLength(5.5, 'imperial', 2, true, 'decimal')).toBe('5.50 ft');
        expect(formatLength(10, 'imperial', 1, true, 'decimal')).toBe('10.0 ft');
      });

      it('should format imperial length in fractional format', () => {
        expect(formatLength(5, 'imperial', 2, true, 'fractional')).toBe("5'");
        expect(formatLength(5.5, 'imperial', 2, true, 'fractional')).toBe("5' 6");
        expect(formatLength(6.25, 'imperial', 2, true, 'fractional')).toBe("6' 3");
      });

      it('should handle fractional inches correctly', () => {
        expect(formatLength(5.0625, 'imperial', 2, true, 'fractional')).toBe("5' 12/16\""); // 0.75 inches as fraction
        expect(formatLength(5.125, 'imperial', 2, true, 'fractional')).toBe("5' 1 8/16\""); // 1.5 inches as fraction
      });

      it('should handle showLabel parameter for imperial', () => {
        expect(formatLength(5.5, 'imperial', 2, false, 'decimal')).toBe('5.50');
        expect(formatLength(5.5, 'imperial', 2, false, 'fractional')).toBe("5' 6");
      });

      it('should handle zero and small values', () => {
        expect(formatLength(0, 'imperial', 2, true, 'fractional')).toBe("0'");
        expect(formatLength(0.5, 'imperial', 2, true, 'fractional')).toBe("0' 6");
      });
    });
  });

  describe('formatArea', () => {
    it('should format metric area correctly', () => {
      expect(formatArea(25.123, 'metric')).toBe('25.12 m²');
      expect(formatArea(100, 'metric', 0)).toBe('100 m²');
      expect(formatArea(50.5, 'metric', 1)).toBe('50.5 m²');
    });

    it('should format imperial area correctly', () => {
      expect(formatArea(150.456, 'imperial')).toBe('150.46 ft²');
      expect(formatArea(200, 'imperial', 0)).toBe('200 ft²');
      expect(formatArea(75.7, 'imperial', 1)).toBe('75.7 ft²');
    });

    it('should handle showLabel parameter', () => {
      expect(formatArea(25.5, 'metric', 2, true)).toBe('25.50 m²');
      expect(formatArea(25.5, 'metric', 2, false)).toBe('25.50');
      expect(formatArea(150.5, 'imperial', 2, true)).toBe('150.50 ft²');
      expect(formatArea(150.5, 'imperial', 2, false)).toBe('150.50');
    });

    it('should handle zero and negative values', () => {
      expect(formatArea(0, 'metric')).toBe('0.00 m²');
      expect(formatArea(-10.5, 'imperial')).toBe('-10.50 ft²');
    });
  });

  describe('parseLength', () => {
    it('should return null for empty or invalid input', () => {
      expect(parseLength('', 'metric')).toBe(null);
      expect(parseLength('abc', 'metric')).toBe(null);
      expect(parseLength('', 'imperial')).toBe(null);
      expect(parseLength('xyz', 'imperial')).toBe(null);
    });

    describe('metric parsing', () => {
      it('should parse simple numeric values', () => {
        expect(parseLength('5', 'metric')).toBe(5);
        expect(parseLength('10.5', 'metric')).toBe(10.5);
        expect(parseLength('0', 'metric')).toBe(0);
        expect(parseLength('-5.5', 'metric')).toBe(-5.5);
      });

      it('should handle European decimal format (comma)', () => {
        expect(parseLength('5,5', 'metric')).toBe(5.5);
        expect(parseLength('10,25', 'metric')).toBe(10.25);
      });

      it('should ignore units and extra characters', () => {
        expect(parseLength('5m', 'metric')).toBe(5);
        expect(parseLength('10.5 meters', 'metric')).toBe(10.5);
        expect(parseLength('  7.2  ', 'metric')).toBe(7.2);
      });
    });

    describe('imperial parsing', () => {
      it('should parse feet only notation', () => {
        expect(parseLength("5'", 'imperial')).toBe(5);
        expect(parseLength("10'", 'imperial')).toBe(10);
        expect(parseLength("0'", 'imperial')).toBe(0);
      });

      it('should parse feet and inches notation', () => {
        expect(parseLength("5' 6\"", 'imperial')).toBe(5.5);
        expect(parseLength("6'0\"", 'imperial')).toBe(6);
        expect(parseLength("10' 3\"", 'imperial')).toBe(10.25);
      });

      it('should parse fractional inches', () => {
        expect(parseLength("5' 6 1/2\"", 'imperial')).toBe(5.541666666666667); // 5 + 6.5/12
        expect(parseLength("6' 3 1/4\"", 'imperial')).toBeCloseTo(6.270833, 5); // 6 + 3.25/12
        expect(parseLength("4' 1/2\"", 'imperial')).toBeCloseTo(4.083333, 5); // 4 + 1/2 inch = 4 + 0.5/12
      });

      it('should handle various formatting styles', () => {
        expect(parseLength("5'6\"", 'imperial')).toBe(5.5); // No space
        expect(parseLength("5' 6", 'imperial')).toBe(5.5); // No quote for inches
        expect(parseLength("  5'  6\"  ", 'imperial')).toBe(5.5); // Extra spaces
      });

      it('should parse simple numbers as feet', () => {
        expect(parseLength('5', 'imperial')).toBe(5);
        expect(parseLength('10.5', 'imperial')).toBe(10.5);
        expect(parseLength('-3', 'imperial')).toBe(-3);
      });

      it('should handle invalid fractions gracefully', () => {
        expect(parseLength("5' 6 1/0\"", 'imperial')).toBe(5.5); // Division by zero
        expect(parseLength("5' 6 abc/def\"", 'imperial')).toBe(5.5); // Invalid fraction
      });
    });

    describe('edge cases', () => {
      it('should handle very large numbers', () => {
        expect(parseLength('1000000', 'metric')).toBe(1000000);
        expect(parseLength("1000'", 'imperial')).toBe(1000);
      });

      it('should handle very small numbers', () => {
        expect(parseLength('0.001', 'metric')).toBe(0.001);
        expect(parseLength("0' 1/16\"", 'imperial')).toBeCloseTo(0.083333, 5); // 1/16 inch = 1/16/12 feet
      });

      it('should handle negative values', () => {
        expect(parseLength('-5.5', 'metric')).toBe(-5.5);
        expect(parseLength("-5' 6\"", 'imperial')).toBe(-4.5); // -5 feet (negative) + 6 inches
      });
    });
  });

  describe('integration tests', () => {
    it('should maintain precision through conversion and formatting', () => {
      const originalMetric = 10;
      const convertedImperial = convertLength(originalMetric, 'metric', 'imperial');
      const backToMetric = convertLength(convertedImperial, 'imperial', 'metric');
      
      expect(backToMetric).toBeCloseTo(originalMetric, 5);
    });

    it('should handle parse and format round trip', () => {
      const testValues = ['5.5', '10', '0', '15.25'];
      
      testValues.forEach(value => {
        const parsed = parseLength(value, 'metric');
        const formatted = formatLength(parsed!, 'metric', 2, false);
        const reparsed = parseLength(formatted, 'metric');
        
        expect(reparsed).toBeCloseTo(parseFloat(value), 2);
      });
    });

    it('should handle imperial fractional round trip', () => {
      const testValue = 5.5; // 5' 6"
      const formatted = formatLength(testValue, 'imperial', 2, true, 'fractional');
      const parsed = parseLength(formatted, 'imperial');
      
      expect(parsed).toBeCloseTo(testValue, 1);
    });
  });
});