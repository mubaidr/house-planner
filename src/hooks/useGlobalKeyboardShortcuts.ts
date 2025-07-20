// src/hooks/useGlobalKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useUIStore } from '@/stores/uiStore';
import { saveDesign } from '@/utils/storage';

type ShortcutAction = () => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: ShortcutAction;
  description?: string;
}

const isInputLike = (el: Element | null) => {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    (el as HTMLElement).isContentEditable
  );
};

const getShortcuts = (designStore: any, historyStore: any, uiStore: any): ShortcutConfig[] => [
  // Save (Ctrl+S)
  {
    key: 's',
    ctrl: true,
    action: () => {
      saveDesign();
      console.log('Save triggered');
    },
    description: 'Save project',
  },
  // Undo (Ctrl+Z)
  {
    key: 'z',
    ctrl: true,
    action: () => {
      historyStore.undo();
      console.log('Undo triggered');
    },
    description: 'Undo',
  },
  // Redo (Ctrl+Shift+Z)
  {
    key: 'z',
    ctrl: true,
    shift: true,
    action: () => {
      historyStore.redo();
      console.log('Redo triggered');
    },
    description: 'Redo',
  },
  // Export (Ctrl+E)
  {
    key: 'e',
    ctrl: true,
    action: () => {
      uiStore.setExportDialogOpen(true);
      console.log('Export dialog triggered');
    },
    description: 'Open export dialog',
  },
];

export function useGlobalKeyboardShortcuts() {
  const designStore = useDesignStore();
  const historyStore = useHistoryStore();
  const uiStore = useUIStore();

  useEffect(() => {
    const shortcuts = getShortcuts(designStore, historyStore, uiStore);

    function matchShortcut(e: KeyboardEvent, config: ShortcutConfig) {
      return (
        e.key.toLowerCase() === config.key.toLowerCase() &&
        (!!config.ctrl === (e.ctrlKey || e.metaKey)) &&
        (!!config.shift === e.shiftKey) &&
        (!!config.alt === e.altKey) &&
        (!!config.meta === e.metaKey)
      );
    }

    function handler(e: KeyboardEvent) {
      // Ignore if focus is on input/textarea/contenteditable
      if (isInputLike(document.activeElement)) return;

      for (const shortcut of shortcuts) {
        if (matchShortcut(e, shortcut)) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    }

    window.addEventListener('keydown', handler, { capture: true });

    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  }, [designStore, historyStore, uiStore]);
}

export default useGlobalKeyboardShortcuts;
