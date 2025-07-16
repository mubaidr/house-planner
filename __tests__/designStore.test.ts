import { act } from 'react-dom/test-utils';
import { useDesignStore } from '../src/stores/designStore';

describe('designStore', () => {
  it('can add a wall', () => {
    act(() => {
      useDesignStore.getState().addWall({ id: '1', startX: 0, startY: 0, endX: 1, endY: 1 });
    });
    expect(useDesignStore.getState().walls.length).toBeGreaterThan(0);
  });
});
