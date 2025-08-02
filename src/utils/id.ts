/**
 * Generate a unique ID with a prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a wall ID
 */
export function generateWallId(): string {
  return generateId('wall');
}

/**
 * Generate a door ID
 */
export function generateDoorId(): string {
  return generateId('door');
}

/**
 * Generate a window ID
 */
export function generateWindowId(): string {
  return generateId('window');
}

/**
 * Generate a room ID
 */
export function generateRoomId(): string {
  return generateId('room');
}

/**
 * Generate a material ID
 */
export function generateMaterialId(): string {
  return generateId('material');
}

/**
 * Generate a measurement ID
 */
export function generateMeasurementId(): string {
  return generateId('measure');
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const parts = id.split('-');
  return parts.length >= 3 && parts[0].length > 0;
}

/**
 * Extract prefix from ID
 */
export function getIdPrefix(id: string): string | null {
  if (!isValidId(id)) return null;
  return id.split('-')[0];
}

/**
 * Extract timestamp from ID
 */
export function getIdTimestamp(id: string): number | null {
  if (!isValidId(id)) return null;
  const timestamp = parseInt(id.split('-')[1]);
  return isNaN(timestamp) ? null : timestamp;
}
