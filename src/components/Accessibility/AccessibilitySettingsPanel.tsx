'use client';

import React, { useState } from 'react';
import { useAccessibilityStore, isAccessibilityModeActive } from '@/stores/accessibilityStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accessibility, Eye, Volume2, Keyboard, Palette, RotateCcw } from 'lucide-react';

interface AccessibilitySettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilitySettingsPanel({ isOpen, onClose }: AccessibilitySettingsPanelProps) {
  const {
    highContrastMode,
    reducedMotion,
    largerText,
    largerFocusIndicators,
    enableAlternativeElementList,
    textScale,
    colorBlindMode,
    enableAudioFeedback,
    audioVolume,
    keyboardNavigationOnly,
    toggleHighContrastMode,
    toggleReducedMotion,
    toggleLargerText,
    toggleLargerFocusIndicators,
    toggleAlternativeElementList,
    setTextScale,
    setColorBlindMode,
    setAudioFeedback,
    setAudioVolume,
    toggleKeyboardNavigationOnly,
    resetToDefaults,
  } = useAccessibilityStore();

  const isActive = isAccessibilityModeActive(useAccessibilityStore());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Accessibility className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Accessibility Settings</h2>
          </div>
          {isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Visual Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex items-center">
                  High Contrast Mode
                  <span className="ml-2 text-sm text-gray-500">Improves visibility</span>
                </Label>
                <input
                  type="checkbox"
                  id="high-contrast"
                  checked={highContrastMode}
                  onChange={toggleHighContrastMode}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="larger-text" className="flex items-center">
                  Larger Text
                  <span className="ml-2 text-sm text-gray-500">Increases font size</span>
                </Label>
                <input
                  type="checkbox"
                  id="larger-text"
                  checked={largerText}
                  onChange={toggleLargerText}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-scale" className="text-sm font-medium">
                  Text Scale: {Math.round(textScale * 100)}%
                </Label>
                <input
                  type="range"
                  id="text-scale"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={textScale}
                  onChange={(e) => setTextScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="larger-focus" className="flex items-center">
                  Larger Focus Indicators
                  <span className="ml-2 text-sm text-gray-500">Easier keyboard navigation</span>
                </Label>
                <input
                  type="checkbox"
                  id="larger-focus"
                  checked={largerFocusIndicators}
                  onChange={toggleLargerFocusIndicators}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="color-blind" className="text-sm font-medium">Color Blind Mode</Label>
                <select
                  id="color-blind"
                  value={colorBlindMode}
                  onChange={(e) => setColorBlindMode(e.target.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Red-blind (Protanopia)</option>
                  <option value="deuteranopia">Green-blind (Deuteranopia)</option>
                  <option value="tritanopia">Blue-blind (Tritanopia)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Motion Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Motion & Animation
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex items-center">
                Reduced Motion
                <span className="ml-2 text-sm text-gray-500">Minimizes animations</span>
              </Label>
              <input
                type="checkbox"
                id="reduced-motion"
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Screen Reader Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Accessibility className="w-5 h-5 mr-2" />
              Screen Reader Support
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="element-list" className="flex items-center">
                Alternative Element List
                <span className="ml-2 text-sm text-gray-500">Screen reader-friendly view</span>
              </Label>
              <input
                type="checkbox"
                id="element-list"
                checked={enableAlternativeElementList}
                onChange={toggleAlternativeElementList}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard Navigation
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard-only" className="flex items-center">
                Keyboard Navigation Only
                <span className="ml-2 text-sm text-gray-500">Disables mouse interactions</span>
              </Label>
              <input
                type="checkbox"
                id="keyboard-only"
                checked={keyboardNavigationOnly}
                onChange={toggleKeyboardNavigationOnly}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Audio Feedback
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="audio-feedback" className="flex items-center">
                  Enable Audio Feedback
                  <span className="ml-2 text-sm text-gray-500">Sound cues for actions</span>
                </Label>
                <input
                  type="checkbox"
                  id="audio-feedback"
                  checked={enableAudioFeedback}
                  onChange={(e) => setAudioFeedback(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {enableAudioFeedback && (
                <div className="space-y-2">
                  <Label htmlFor="audio-volume" className="text-sm font-medium">
                    Volume: {Math.round(audioVolume * 100)}%
                  </Label>
                  <input
                    type="range"
                    id="audio-volume"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
