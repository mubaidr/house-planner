// Simple test to verify the undefined handling fix
const handleFloorSelection = (floorId) => {
  if (!floorId || typeof floorId !== 'string') return;
  console.log('Processing floorId:', floorId);
  // Simulate the state update
  const prev = ['floor1', 'floor2'];
  const result = prev.includes(floorId)
    ? prev.filter(id => id !== floorId)
    : [...prev, floorId];
  console.log('Result:', result);
  return result;
};

// Test cases
console.log('Testing undefined handling:');
console.log('1. undefined:', handleFloorSelection(undefined));
console.log('2. null:', handleFloorSelection(null));
console.log('3. empty string:', handleFloorSelection(''));
console.log('4. valid string:', handleFloorSelection('floor3'));
