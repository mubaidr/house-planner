import React from 'react';

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

export default AccessibilityAnnouncer;
