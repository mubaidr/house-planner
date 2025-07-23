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
  const { addAnnouncement, preferences } = useAccessibilityStore();

  const announceElementSelected = useCallback((elementType: string, elementId: string) => {
    if (preferences.enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} selected`);
    }
  }, [addAnnouncement, preferences.enableScreenReaderSupport]);

  const announceElementDeleted = useCallback((elementType: string, elementId: string) => {
    if (preferences.enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} deleted`);
    }
  }, [addAnnouncement, preferences.enableScreenReaderSupport]);

  const announceElementMoved = useCallback((elementType: string, elementId: string, direction: string, distance: number) => {
    if (preferences.enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} moved ${direction} by ${distance} pixels`);
    }
  }, [addAnnouncement, preferences.enableScreenReaderSupport]);

  const announceElementCreated = useCallback((elementType: string, elementId: string) => {
    if (preferences.enableScreenReaderSupport) {
      addAnnouncement(`${elementType} ${elementId} created`);
    }
  }, [addAnnouncement, preferences.enableScreenReaderSupport]);

  const announceError = useCallback((message: string) => {
    if (preferences.enableScreenReaderSupport) {
      addAnnouncement(`Error: ${message}`);
    }
  }, [addAnnouncement, preferences.enableScreenReaderSupport]);

  return {
    announceElementSelected,
    announceElementDeleted,
    announceElementMoved,
    announceElementCreated,
    announceError,
  };
}

export default AccessibilityAnnouncer;
