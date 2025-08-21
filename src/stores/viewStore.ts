import { useDesignStore } from './designStore';

/**
 * viewStore
 *
 * Small compatibility wrapper for view-related selectors. The canonical viewMode
 * is stored in `designStore` to keep related UI and design state together.
 */
export function useViewStore() {
  const viewMode = useDesignStore(state => state.viewMode);
  const setViewMode = useDesignStore(state => state.setViewMode);
  return { viewMode, setViewMode };
}
