'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useErrorStore, ErrorNotification as ErrorNotificationType } from '@/stores/errorStore';

interface NotificationItemProps {
  notification: ErrorNotificationType;
  onDismiss: (id: string) => void;
  count?: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss, count = 1 }) => {
  const [expanded, setExpanded] = useState(false);

  // Handle auto-dismiss
  useEffect(() => {
    if (notification.autoDismiss && notification.duration && !notification.persistent) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.autoDismiss, notification.duration, notification.persistent, notification.id, onDismiss]);

  const getIcon = () => {
    switch (notification.severity || notification.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.severity || notification.type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'critical':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`p-4 border rounded-lg shadow-lg ${getBgColor()} mb-2 animate-slide-in`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
              {count > 1 && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
                  ×{count}
                </span>
              )}
            </p>
            {(notification.details || notification.suggestions?.length) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          {notification.source && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-medium">Source:</span> {notification.source}
            </p>
          )}
          
          {notification.category && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-medium">Category:</span> {notification.category}
            </p>
          )}
          
          {notification.code && !expanded && (
            <p className="text-xs text-gray-500 mt-1">Code: {notification.code}</p>
          )}

          {expanded && (
            <div className="mt-2">
              {notification.details && (
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Details:</strong> {notification.details}
                </div>
              )}
              
              {notification.code && (
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Code:</strong> {notification.code}
                </div>
              )}
              
              {notification.suggestions && notification.suggestions.length > 0 && (
                <div className="text-sm text-gray-700">
                  <strong>Suggestions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {notification.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Always show suggestions even when not expanded */}
          {!expanded && notification.suggestions && notification.suggestions.length > 0 && (
            <div className="mt-2 text-sm text-gray-700">
              <strong>Suggestions:</strong>
              <ul className="list-disc list-inside mt-1">
                {notification.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onDismiss(notification.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Dismiss"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ErrorNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function ErrorNotification({ position = 'top-right' }: ErrorNotificationProps) {
  const { 
    errors, 
    warnings, 
    hasErrors, 
    hasWarnings, 
    removeError, 
    removeWarning, 
    clearAll 
  } = useErrorStore();
  
  const [visibleCount, setVisibleCount] = useState(5);
  const [showMore, setShowMore] = useState(false);

  // Group similar notifications
  const groupNotifications = (notifications: ErrorNotificationType[]) => {
    const grouped = new Map<string, { notification: ErrorNotificationType; count: number }>();
    
    notifications.forEach(notification => {
      const key = `${notification.message}-${notification.source}`;
      if (grouped.has(key)) {
        grouped.get(key)!.count++;
      } else {
        grouped.set(key, { notification, count: 1 });
      }
    });
    
    return Array.from(grouped.values());
  };

  const allNotifications = [...errors, ...warnings].sort((a, b) => b.timestamp - a.timestamp);
  const groupedNotifications = groupNotifications(allNotifications);
  const visibleNotifications = showMore ? groupedNotifications : groupedNotifications.slice(0, visibleCount);
  const hasMoreNotifications = groupedNotifications.length > visibleCount;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!hasErrors && !hasWarnings) return null;

  return (
    <>
      <div className={`fixed ${getPositionClasses()} max-w-md z-50 notification-container`}>
        {visibleNotifications.map(({ notification, count }) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            count={count}
            onDismiss={notification.type === 'error' ? removeError : removeWarning}
          />
        ))}
        
        {hasMoreNotifications && !showMore && (
          <button
            onClick={() => setShowMore(true)}
            className="w-full p-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            +{groupedNotifications.length - visibleCount} more notifications
          </button>
        )}
        
        {(hasErrors || hasWarnings) && groupedNotifications.length > 1 && (
          <button
            onClick={clearAll}
            className="w-full mt-2 p-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Live region for accessibility announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {errors.length > 0 && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
        {warnings.length > 0 && `${warnings.length > 1 ? 's' : ''} warning${warnings.length > 1 ? 's' : ''}`}
      </div>
    </>
  );
}

// Export both default and named export for compatibility
export { ErrorNotification };
