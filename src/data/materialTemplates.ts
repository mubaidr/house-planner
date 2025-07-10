import { MaterialTemplate } from '@/types/materials/MaterialTemplate';

export const BUILT_IN_TEMPLATES: MaterialTemplate[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines with neutral colors and smooth finishes. Perfect for contemporary homes.',
    category: 'modern',
    materials: [
      {
        elementType: 'wall',
        materialId: 'wall-drywall-white',
        priority: 1,
      },
      {
        elementType: 'door',
        materialId: 'door-wood-mahogany',
        priority: 1,
      },
      {
        elementType: 'floor',
        materialId: 'floor-hardwood-oak',
        priority: 1,
      },
      {
        elementType: 'room',
        materialId: 'paint-eggshell-beige',
        conditions: [
          {
            type: 'roomType',
            property: 'roomType',
            value: ['living', 'bedroom', 'office'],
            operator: 'in',
          },
        ],
        priority: 1,
      },
      {
        elementType: 'room',
        materialId: 'floor-tile-ceramic',
        conditions: [
          {
            type: 'roomType',
            property: 'roomType',
            value: ['bathroom', 'kitchen'],
            operator: 'in',
          },
        ],
        priority: 2,
      },
    ],
    metadata: {
      author: 'Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['modern', 'minimalist', 'neutral', 'clean'],
      style: 'modern',
      difficulty: 'beginner',
      estimatedCost: {
        min: 15,
        max: 25,
        currency: 'USD',
        unit: 'sqft',
        lastCalculated: new Date(),
      },
      usageCount: 0,
      rating: 4.8,
    },
    isBuiltIn: true,
  },
  {
    id: 'rustic-farmhouse',
    name: 'Rustic Farmhouse',
    description: 'Warm wood tones with natural textures. Cozy and inviting country style.',
    category: 'traditional',
    materials: [
      {
        elementType: 'wall',
        materialId: 'wall-brick-red',
        conditions: [
          {
            type: 'location',
            property: 'exterior',
            value: 'true',
            operator: 'equals',
          },
        ],
        priority: 2,
      },
      {
        elementType: 'wall',
        materialId: 'wall-drywall-white',
        priority: 1,
      },
      {
        elementType: 'door',
        materialId: 'door-wood-mahogany',
        priority: 1,
      },
      {
        elementType: 'floor',
        materialId: 'floor-hardwood-oak',
        priority: 1,
      },
      {
        elementType: 'room',
        materialId: 'floor-hardwood-oak',
        conditions: [
          {
            type: 'roomType',
            property: 'roomType',
            value: ['living', 'dining', 'bedroom'],
            operator: 'in',
          },
        ],
        priority: 1,
      },
    ],
    metadata: {
      author: 'Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['rustic', 'farmhouse', 'wood', 'traditional', 'warm'],
      style: 'rustic',
      difficulty: 'intermediate',
      estimatedCost: {
        min: 20,
        max: 35,
        currency: 'USD',
        unit: 'sqft',
        lastCalculated: new Date(),
      },
      usageCount: 0,
      rating: 4.6,
    },
    isBuiltIn: true,
  },
  {
    id: 'luxury-contemporary',
    name: 'Luxury Contemporary',
    description: 'Premium materials with sophisticated finishes. High-end modern design.',
    category: 'luxury',
    materials: [
      {
        elementType: 'wall',
        materialId: 'wall-drywall-white',
        priority: 1,
      },
      {
        elementType: 'door',
        materialId: 'door-wood-mahogany',
        priority: 1,
      },
      {
        elementType: 'floor',
        materialId: 'floor-hardwood-oak',
        priority: 1,
      },
      {
        elementType: 'room',
        materialId: 'countertop-granite-black',
        conditions: [
          {
            type: 'roomType',
            property: 'roomType',
            value: 'kitchen',
            operator: 'equals',
          },
        ],
        priority: 3,
      },
      {
        elementType: 'room',
        materialId: 'floor-tile-ceramic',
        conditions: [
          {
            type: 'roomType',
            property: 'roomType',
            value: 'bathroom',
            operator: 'equals',
          },
        ],
        priority: 2,
      },
    ],
    metadata: {
      author: 'Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['luxury', 'contemporary', 'premium', 'sophisticated'],
      style: 'luxury',
      difficulty: 'advanced',
      estimatedCost: {
        min: 50,
        max: 100,
        currency: 'USD',
        unit: 'sqft',
        lastCalculated: new Date(),
      },
      usageCount: 0,
      rating: 4.9,
    },
    isBuiltIn: true,
  },
  {
    id: 'budget-friendly',
    name: 'Budget Friendly',
    description: 'Cost-effective materials without compromising on style. Great for first-time buyers.',
    category: 'budget',
    materials: [
      {
        elementType: 'wall',
        materialId: 'paint-eggshell-beige',
        priority: 1,
      },
      {
        elementType: 'door',
        materialId: 'door-wood-mahogany',
        priority: 1,
      },
      {
        elementType: 'floor',
        materialId: 'floor-tile-ceramic',
        priority: 1,
      },
      {
        elementType: 'room',
        materialId: 'paint-eggshell-beige',
        priority: 1,
      },
    ],
    metadata: {
      author: 'Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['budget', 'affordable', 'cost-effective', 'starter'],
      style: 'contemporary',
      difficulty: 'beginner',
      estimatedCost: {
        min: 8,
        max: 15,
        currency: 'USD',
        unit: 'sqft',
        lastCalculated: new Date(),
      },
      usageCount: 0,
      rating: 4.2,
    },
    isBuiltIn: true,
  },
  {
    id: 'industrial-loft',
    name: 'Industrial Loft',
    description: 'Raw materials with exposed elements. Urban industrial aesthetic.',
    category: 'industrial',
    materials: [
      {
        elementType: 'wall',
        materialId: 'wall-brick-red',
        priority: 2,
      },
      {
        elementType: 'wall',
        materialId: 'wall-drywall-white',
        priority: 1,
      },
      {
        elementType: 'door',
        materialId: 'door-wood-mahogany',
        priority: 1,
      },
      {
        elementType: 'floor',
        materialId: 'floor-tile-ceramic',
        priority: 1,
      },
    ],
    metadata: {
      author: 'Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['industrial', 'loft', 'urban', 'raw', 'exposed'],
      style: 'industrial',
      difficulty: 'intermediate',
      estimatedCost: {
        min: 25,
        max: 40,
        currency: 'USD',
        unit: 'sqft',
        lastCalculated: new Date(),
      },
      usageCount: 0,
      rating: 4.5,
    },
    isBuiltIn: true,
  },
];

export const TEMPLATE_CATEGORIES = {
  residential: { name: 'Residential', icon: '🏠', description: 'Home and apartment designs' },
  commercial: { name: 'Commercial', icon: '🏢', description: 'Office and retail spaces' },
  modern: { name: 'Modern', icon: '✨', description: 'Contemporary and sleek designs' },
  traditional: { name: 'Traditional', icon: '🏛️', description: 'Classic and timeless styles' },
  industrial: { name: 'Industrial', icon: '⚙️', description: 'Raw and urban aesthetics' },
  luxury: { name: 'Luxury', icon: '💎', description: 'Premium and high-end materials' },
  budget: { name: 'Budget', icon: '💰', description: 'Cost-effective solutions' },
  'eco-friendly': { name: 'Eco-Friendly', icon: '🌱', description: 'Sustainable materials' },
  custom: { name: 'Custom', icon: '🎨', description: 'User-created templates' },
};

export const DESIGN_STYLES = {
  modern: { name: 'Modern', description: 'Clean lines and minimal ornamentation' },
  contemporary: { name: 'Contemporary', description: 'Current trends and styles' },
  traditional: { name: 'Traditional', description: 'Classic and timeless design' },
  industrial: { name: 'Industrial', description: 'Raw materials and exposed elements' },
  scandinavian: { name: 'Scandinavian', description: 'Light colors and natural materials' },
  mediterranean: { name: 'Mediterranean', description: 'Warm colors and natural textures' },
  rustic: { name: 'Rustic', description: 'Natural and weathered materials' },
  minimalist: { name: 'Minimalist', description: 'Simple and uncluttered design' },
  luxury: { name: 'Luxury', description: 'Premium materials and finishes' },
  eclectic: { name: 'Eclectic', description: 'Mix of styles and periods' },
};