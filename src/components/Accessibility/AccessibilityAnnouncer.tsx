import React, { useCallback } from 'react';
import { useAccessibilityStore } from '@/stores/accessibilityStore';

interface AccessibilityAnnouncerProps {
  announcements?: string[];
}

export function AccessibilityAnnouncer({ announcements = [] }: AccessibilityAnnouncerProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  );
}

// Hook for making accessibility announcements
export function useAccessibilityAnnouncer() {
  const { addAnnouncement, enableScreenReaderSupport } = useAccessibilityStore();

  const announceElementSelected = useCallback((elementType: string, elementId: string) => {
    if (enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} selected`);
    }
  }, [addAnnouncement, enableScreenReaderSupport]);

  const announceElementDeleted = useCallback((elementType: string, elementId: string) => {
    if (enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} deleted`);
    }
  }, [addAnnouncement, enableScreenReaderSupport]);

  const announceElementMoved = useCallback((elementType: string, elementId: string, direction: string, distance: number) => {
    if (enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} moved ${direction} by ${distance} pixels`);
    }
  }, [addAnnouncement, enableScreenReaderSupport]);

  const announceElementCreated = useCallback((elementType: string, elementId: string) => {
    if (enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} created`);
    }
  }, [addAnnouncement, enableScreenReaderSupport]);

  const announceError = useCallback((message: string) => {
    if (enableScreenReaderSupport) {
      addAnnouncement(`Error: ${message}`);
    }
  }, [addAnnouncement, enableScreenReaderSupport]);

  return {
    announceElementSelected,
    announceElementDeleted,
    announceElementMoved,
    announceElementCreated,
    announceError,
  };
}

export default AccessibilityAnnouncer;
