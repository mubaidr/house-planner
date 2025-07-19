// src/hooks/useGlobalKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';

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

const getShortcuts = (designStore: any, historyStore: any): ShortcutConfig[] => [
  // Save (Ctrl+S)
  {
    key: 's',
    ctrl: true,
    action: () => {
      designStore.save();
    },
    description: 'Save project',
  },
  // Undo (Ctrl+Z)
  {
    key: 'z',
    ctrl: true,
    action: () => {
      historyStore.undo();
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
    },
    description: 'Redo',
  },
  // Export (Ctrl+E)
  {
    key: 'e',
    ctrl: true,
    action: () => {
      designStore.setExportDialogOpen(true);
    },
    description: 'Open export dialog',
  },
];

export function useGlobalKeyboardShortcuts() {
  const designStore = useDesignStore();
  const historyStore = useHistoryStore();

  useEffect(() => {
    const shortcuts = getShortcuts(designStore, historyStore);

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
  }, [designStore, historyStore]);
}

export default useGlobalKeyboardShortcuts;
