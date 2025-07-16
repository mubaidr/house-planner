import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaterialCard from '@/components/Materials/MaterialCard';

describe('MaterialCard', () => {
  it('renders material information', () => {
    const material = {
      id: '1',
      name: 'Test Material',
      category: 'wood' as import('@/types/materials/Material').MaterialCategory,
      color: '#ffffff',
      properties: {
        opacity: 1,
        roughness: 0.5,
        metallic: 0,
        reflectivity: 0.1,
      },
      metadata: {
        description: 'Sample material for testing',
        manufacturer: 'Test Manufacturer',
        productCode: 'TM-001',
        tags: ['test', 'wood'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: false,
      },
    };

    render(<MaterialCard material={material} isSelected={false} onSelect={() => {}} onEdit={() => {}} />);

    expect(screen.getByText(material.name)).toBeInTheDocument();
    expect(screen.getByText(material.metadata.description)).toBeInTheDocument();
  });
});
