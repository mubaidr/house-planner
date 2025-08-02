import {
  generateId,
  generateWallId,
  generateDoorId,
  generateWindowId,
  generateRoomId,
  generateMaterialId,
  generateMeasurementId,
  isValidId,
  getIdPrefix,
  getIdTimestamp
} from '@/utils/id';

describe('ID Utils', () => {
  describe('generateId', () => {
    it('should generate ID with correct prefix', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test-\d+-[a-z0-9]{7}$/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).not.toBe(id2);
    });

    it('should handle different prefixes', () => {
      const wallId = generateId('wall');
      const doorId = generateId('door');
      expect(wallId).toMatch(/^wall-/);
      expect(doorId).toMatch(/^door-/);
    });
  });

  describe('specific ID generators', () => {
    it('should generate wall ID', () => {
      const id = generateWallId();
      expect(id).toMatch(/^wall-\d+-[a-z0-9]{7}$/);
    });

    it('should generate door ID', () => {
      const id = generateDoorId();
      expect(id).toMatch(/^door-\d+-[a-z0-9]{7}$/);
    });

    it('should generate window ID', () => {
      const id = generateWindowId();
      expect(id).toMatch(/^window-\d+-[a-z0-9]{7}$/);
    });

    it('should generate room ID', () => {
      const id = generateRoomId();
      expect(id).toMatch(/^room-\d+-[a-z0-9]{7}$/);
    });

    it('should generate material ID', () => {
      const id = generateMaterialId();
      expect(id).toMatch(/^material-\d+-[a-z0-9]{7}$/);
    });

    it('should generate measurement ID', () => {
      const id = generateMeasurementId();
      expect(id).toMatch(/^measure-\d+-[a-z0-9]{7}$/);
    });
  });

  describe('isValidId', () => {
    it('should validate correct ID format', () => {
      const validId = 'wall-1234567890-abc123';
      expect(isValidId(validId)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidId('')).toBe(false);
      expect(isValidId('invalid')).toBe(false);
      expect(isValidId('wall-')).toBe(false);
      expect(isValidId('wall-123')).toBe(false);
      expect(isValidId(null as any)).toBe(false);
      expect(isValidId(undefined as any)).toBe(false);
      expect(isValidId(123 as any)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidId('a-b-c')).toBe(true); // minimum valid format
      expect(isValidId('-1-2')).toBe(false); // empty prefix
    });
  });

  describe('getIdPrefix', () => {
    it('should extract prefix from valid ID', () => {
      expect(getIdPrefix('wall-123-abc')).toBe('wall');
      expect(getIdPrefix('door-456-def')).toBe('door');
      expect(getIdPrefix('window-789-ghi')).toBe('window');
    });

    it('should return null for invalid IDs', () => {
      expect(getIdPrefix('invalid')).toBe(null);
      expect(getIdPrefix('')).toBe(null);
      expect(getIdPrefix('wall-')).toBe(null);
    });
  });

  describe('getIdTimestamp', () => {
    it('should extract timestamp from valid ID', () => {
      const timestamp = Date.now();
      const id = `wall-${timestamp}-abc123`;
      expect(getIdTimestamp(id)).toBe(timestamp);
    });

    it('should return null for invalid IDs', () => {
      expect(getIdTimestamp('invalid')).toBe(null);
      expect(getIdTimestamp('wall-invalid-abc')).toBe(null);
      expect(getIdTimestamp('')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(getIdTimestamp('wall-0-abc')).toBe(0);
      expect(getIdTimestamp('wall-123-abc')).toBe(123);
    });
  });

  describe('ID uniqueness over time', () => {
    it('should generate unique IDs even in rapid succession', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId('test'));
      }
      expect(ids.size).toBe(100);
    });
  });
});
