import {
  validateWall,
  validateDoor,
  validateWindow,
  validateRoom,
  validateMaterial,
  validateHexColor,
  validateRGBColor,
  validateCoordinates
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateWall', () => {
    it('should validate correct wall data', () => {
      const validWall = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };
      const result = validateWall(validWall);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject wall with invalid coordinates', () => {
      const invalidWall = {
        startX: 'invalid' as any,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };
      const result = validateWall(invalidWall);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('startX must be a valid number');
    });

    it('should reject wall with zero thickness', () => {
      const invalidWall = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0,
        height: 3,
        color: '#ffffff'
      };
      const result = validateWall(invalidWall);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('thickness must be a positive number');
    });

    it('should reject wall with zero length', () => {
      const invalidWall = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };
      const result = validateWall(invalidWall);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('wall cannot have zero length');
    });

    it('should reject wall without color', () => {
      const invalidWall = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: ''
      };
      const result = validateWall(invalidWall);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('color must be a valid string');
    });
  });

  describe('validateDoor', () => {
    it('should validate correct door data', () => {
      const validDoor = {
        wallId: 'wall-123',
        width: 0.8,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };
      const result = validateDoor(validDoor);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject door with invalid dimensions', () => {
      const invalidDoor = {
        wallId: 'wall-123',
        width: -1,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };
      const result = validateDoor(invalidDoor);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('width must be a positive number');
    });

    it('should reject door with invalid open direction', () => {
      const invalidDoor = {
        wallId: 'wall-123',
        width: 0.8,
        height: 2.1,
        openDirection: 'invalid' as any,
        color: '#8B4513'
      };
      const result = validateDoor(invalidDoor);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('openDirection must be one of: left, right, inward, outward');
    });

    it('should reject door without wallId', () => {
      const invalidDoor = {
        wallId: '',
        width: 0.8,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };
      const result = validateDoor(invalidDoor);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('wallId must be a valid string');
    });
  });

  describe('validateWindow', () => {
    it('should validate correct window data', () => {
      const validWindow = {
        wallId: 'wall-123',
        width: 1.2,
        height: 1.5,
        sillHeight: 1.0,
        color: '#FFFFFF'
      };
      const result = validateWindow(validWindow);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject window with negative sill height', () => {
      const invalidWindow = {
        wallId: 'wall-123',
        width: 1.2,
        height: 1.5,
        sillHeight: -1,
        color: '#FFFFFF'
      };
      const result = validateWindow(invalidWindow);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('sillHeight must be a non-negative number');
    });

    it('should accept window with zero sill height', () => {
      const validWindow = {
        wallId: 'wall-123',
        width: 1.2,
        height: 1.5,
        sillHeight: 0,
        color: '#FFFFFF'
      };
      const result = validateWindow(validWindow);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRoom', () => {
    it('should validate correct room data', () => {
      const validRoom = {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 },
          { x: 0, y: 3 }
        ],
        ceilingHeight: 3
      };
      const result = validateRoom(validRoom);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject room with less than 3 points', () => {
      const invalidRoom = {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 }
        ]
      };
      const result = validateRoom(invalidRoom);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('points must be an array with at least 3 points');
    });

    it('should reject room with invalid point coordinates', () => {
      const invalidRoom = {
        points: [
          { x: 'invalid' as any, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 }
        ]
      };
      const result = validateRoom(invalidRoom);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('point 0 x coordinate must be a valid number');
    });

    it('should reject room with invalid ceiling height', () => {
      const invalidRoom = {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 }
        ],
        ceilingHeight: -1
      };
      const result = validateRoom(invalidRoom);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ceilingHeight must be a positive number');
    });
  });

  describe('validateMaterial', () => {
    it('should validate correct material data', () => {
      const validMaterial = {
        name: 'Wood',
        color: '#8B4513',
        properties: {
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1.0
        }
      };
      const result = validateMaterial(validMaterial);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject material with empty name', () => {
      const invalidMaterial = {
        name: '',
        color: '#8B4513',
        properties: {}
      };
      const result = validateMaterial(invalidMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be a non-empty string');
    });

    it('should reject material with invalid roughness', () => {
      const invalidMaterial = {
        name: 'Wood',
        color: '#8B4513',
        properties: {
          roughness: 1.5
        }
      };
      const result = validateMaterial(invalidMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('roughness must be a number between 0 and 1');
    });

    it('should reject material with invalid metalness', () => {
      const invalidMaterial = {
        name: 'Metal',
        color: '#C0C0C0',
        properties: {
          metalness: -0.1
        }
      };
      const result = validateMaterial(invalidMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('metalness must be a number between 0 and 1');
    });

    it('should reject material with invalid opacity', () => {
      const invalidMaterial = {
        name: 'Glass',
        color: '#FFFFFF',
        properties: {
          opacity: 2.0
        }
      };
      const result = validateMaterial(invalidMaterial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('opacity must be a number between 0 and 1');
    });
  });

  describe('validateHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(validateHexColor('#ffffff')).toBe(true);
      expect(validateHexColor('#FFFFFF')).toBe(true);
      expect(validateHexColor('#fff')).toBe(true);
      expect(validateHexColor('#ABC')).toBe(true);
      expect(validateHexColor('#123456')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(validateHexColor('ffffff')).toBe(false); // missing #
      expect(validateHexColor('#gggggg')).toBe(false); // invalid characters
      expect(validateHexColor('#ff')).toBe(false); // too short
      expect(validateHexColor('#fffffff')).toBe(false); // too long
      expect(validateHexColor('')).toBe(false); // empty
      expect(validateHexColor('#')).toBe(false); // just #
    });
  });

  describe('validateRGBColor', () => {
    it('should validate correct RGB colors', () => {
      expect(validateRGBColor({ r: 255, g: 255, b: 255 })).toBe(true);
      expect(validateRGBColor({ r: 0, g: 0, b: 0 })).toBe(true);
      expect(validateRGBColor({ r: 128, g: 64, b: 192 })).toBe(true);
    });

    it('should reject invalid RGB colors', () => {
      expect(validateRGBColor({ r: -1, g: 0, b: 0 })).toBe(false);
      expect(validateRGBColor({ r: 256, g: 0, b: 0 })).toBe(false);
      expect(validateRGBColor({ r: 'invalid' as any, g: 0, b: 0 })).toBe(false);
      expect(validateRGBColor({ r: 255, g: 255.5, b: 255 })).toBe(false);
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(validateCoordinates(0, 0)).toBe(true);
      expect(validateCoordinates(-5, 10)).toBe(true);
      expect(validateCoordinates(3.14, -2.71)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates(NaN, 0)).toBe(false);
      expect(validateCoordinates(0, NaN)).toBe(false);
      expect(validateCoordinates('invalid' as any, 0)).toBe(false);
      expect(validateCoordinates(0, 'invalid' as any)).toBe(false);
    });

    it('should validate coordinates within bounds', () => {
      const bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
      expect(validateCoordinates(5, 5, bounds)).toBe(true);
      expect(validateCoordinates(-5, -5, bounds)).toBe(true);
      expect(validateCoordinates(0, 0, bounds)).toBe(true);
    });

    it('should reject coordinates outside bounds', () => {
      const bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
      expect(validateCoordinates(15, 5, bounds)).toBe(false);
      expect(validateCoordinates(5, 15, bounds)).toBe(false);
      expect(validateCoordinates(-15, -5, bounds)).toBe(false);
      expect(validateCoordinates(-5, -15, bounds)).toBe(false);
    });
  });
});
