import { ChevronRight, History, Terminal, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CommandLineProps {
  height: number;
  onExecuteCommand: (command: string) => void;
  commandHistory: string[];
  theme: 'light' | 'dark' | 'classic';
}

interface CommandSuggestion {
  command: string;
  description: string;
  aliases?: string[];
  parameters?: string[];
}

const CAD_COMMANDS: CommandSuggestion[] = [
  {
    command: 'LINE',
    description: 'Draw a line',
    aliases: ['L'],
    parameters: ['start point', 'end point'],
  },
  {
    command: 'CIRCLE',
    description: 'Draw a circle',
    aliases: ['C'],
    parameters: ['center point', 'radius'],
  },
  {
    command: 'RECTANGLE',
    description: 'Draw a rectangle',
    aliases: ['REC', 'RECT'],
    parameters: ['first corner', 'opposite corner'],
  },
  {
    command: 'ARC',
    description: 'Draw an arc',
    aliases: ['A'],
    parameters: ['start point', 'second point', 'end point'],
  },
  {
    command: 'WALL',
    description: 'Draw a wall',
    aliases: ['W'],
    parameters: ['start point', 'end point', 'height'],
  },
  {
    command: 'DOOR',
    description: 'Insert a door',
    aliases: ['DR'],
    parameters: ['insertion point', 'width', 'height'],
  },
  {
    command: 'WINDOW',
    description: 'Insert a window',
    aliases: ['WI'],
    parameters: ['insertion point', 'width', 'height'],
  },
  {
    command: 'STAIR',
    description: 'Insert stairs',
    aliases: ['ST'],
    parameters: ['start point', 'end point', 'steps'],
  },
  {
    command: 'MOVE',
    description: 'Move objects',
    aliases: ['M'],
    parameters: ['base point', 'destination'],
  },
  {
    command: 'COPY',
    description: 'Copy objects',
    aliases: ['CO', 'CP'],
    parameters: ['base point', 'destination'],
  },
  {
    command: 'ROTATE',
    description: 'Rotate objects',
    aliases: ['RO'],
    parameters: ['base point', 'angle'],
  },
  {
    command: 'SCALE',
    description: 'Scale objects',
    aliases: ['SC'],
    parameters: ['base point', 'scale factor'],
  },
  {
    command: 'MIRROR',
    description: 'Mirror objects',
    aliases: ['MI'],
    parameters: ['first point', 'second point'],
  },
  {
    command: 'OFFSET',
    description: 'Offset objects',
    aliases: ['O'],
    parameters: ['offset distance', 'side to offset'],
  },
  {
    command: 'TRIM',
    description: 'Trim objects',
    aliases: ['TR'],
    parameters: ['cutting edges', 'objects to trim'],
  },
  {
    command: 'EXTEND',
    description: 'Extend objects',
    aliases: ['EX'],
    parameters: ['boundary edges', 'objects to extend'],
  },
  {
    command: 'FILLET',
    description: 'Create rounded corners',
    aliases: ['F'],
    parameters: ['radius', 'first object', 'second object'],
  },
  {
    command: 'CHAMFER',
    description: 'Create beveled corners',
    aliases: ['CHA'],
    parameters: ['distance1', 'distance2', 'first object', 'second object'],
  },
  {
    command: 'ZOOM',
    description: 'Zoom view',
    aliases: ['Z'],
    parameters: ['option (extents/window/scale)'],
  },
  { command: 'PAN', description: 'Pan view', aliases: ['P'], parameters: ['displacement'] },
  {
    command: 'LAYER',
    description: 'Manage layers',
    aliases: ['LA'],
    parameters: ['option (new/delete/current)'],
  },
  { command: 'SAVE', description: 'Save drawing', aliases: ['S'], parameters: [] },
  { command: 'OPEN', description: 'Open drawing', aliases: [], parameters: ['file path'] },
  {
    command: 'EXPORT',
    description: 'Export drawing',
    aliases: ['EXP'],
    parameters: ['format', 'file path'],
  },
  { command: 'UNDO', description: 'Undo last action', aliases: ['U'], parameters: [] },
  { command: 'REDO', description: 'Redo last undone action', aliases: [], parameters: [] },
  { command: 'ERASE', description: 'Delete objects', aliases: ['E', 'DEL'], parameters: [] },
  { command: 'SELECT', description: 'Select objects', aliases: ['SEL'], parameters: [] },
  {
    command: 'MEASURE',
    description: 'Measure distance',
    aliases: ['DIST'],
    parameters: ['first point', 'second point'],
  },
  { command: 'AREA', description: 'Calculate area', aliases: [], parameters: ['boundary points'] },
  { command: 'GRID', description: 'Toggle grid display', aliases: [], parameters: [] },
  { command: 'SNAP', description: 'Toggle object snap', aliases: [], parameters: [] },
  { command: 'ORTHO', description: 'Toggle orthogonal mode', aliases: [], parameters: [] },
];

export function CommandLine({ height, onExecuteCommand, commandHistory, theme }: CommandLineProps) {
  const [currentCommand, setCurrentCommand] = useState('');
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commandState, setCommandState] = useState<'waiting' | 'active' | 'parameter'>('waiting');
  const [currentParameters, setCurrentParameters] = useState<string[]>([]);
  const [parameterIndex, setParameterIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus command line
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Filter suggestions based on current input
    if (currentCommand.trim()) {
      const filtered = CAD_COMMANDS.filter(
        cmd =>
          cmd.command.toLowerCase().startsWith(currentCommand.toLowerCase()) ||
          cmd.aliases?.some(alias => alias.toLowerCase().startsWith(currentCommand.toLowerCase()))
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [currentCommand]);

  const executeCommand = useCallback(
    (command: string) => {
      if (!command.trim()) return;

      // Find the command definition
      const cmdDef = CAD_COMMANDS.find(
        cmd =>
          cmd.command.toLowerCase() === command.toLowerCase() ||
          cmd.aliases?.some(alias => alias.toLowerCase() === command.toLowerCase())
      );

      if (cmdDef && cmdDef.parameters && cmdDef.parameters.length > 0) {
        // Command requires parameters
        setCommandState('parameter');
        setCurrentParameters([]);
        setParameterIndex(0);
        setCurrentCommand('');
        console.log(`Command ${cmdDef.command} started. Enter ${cmdDef.parameters[0]}:`);
      } else {
        // Execute command immediately
        onExecuteCommand(command);
        setCurrentCommand('');
        setCommandState('waiting');
        setCurrentParameters([]);
        setParameterIndex(0);
      }

      setShowSuggestions(false);
      setHistoryIndex(-1);
    },
    [onExecuteCommand]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (showSuggestions && suggestions.length > 0) {
            const selectedCmd = suggestions[selectedSuggestion];
            executeCommand(selectedCmd.command);
          } else if (currentCommand.trim()) {
            if (commandState === 'parameter') {
              // Add parameter and continue or execute
              const newParams = [...currentParameters, currentCommand];
              setCurrentParameters(newParams);

              const activeCmdDef = CAD_COMMANDS.find(
                cmd =>
                  commandHistory.length > 0 &&
                  (cmd.command.toLowerCase() ===
                    commandHistory[commandHistory.length - 1].toLowerCase() ||
                    cmd.aliases?.some(
                      alias =>
                        alias.toLowerCase() ===
                        commandHistory[commandHistory.length - 1].toLowerCase()
                    ))
              );

              if (
                activeCmdDef &&
                activeCmdDef.parameters &&
                parameterIndex + 1 < activeCmdDef.parameters.length
              ) {
                // More parameters needed
                setParameterIndex(parameterIndex + 1);
                setCurrentCommand('');
                console.log(`Enter ${activeCmdDef.parameters[parameterIndex + 1]}:`);
              } else {
                // All parameters collected, execute command
                onExecuteCommand(
                  `${commandHistory[commandHistory.length - 1]} ${newParams.join(' ')}`
                );
                setCommandState('waiting');
                setCurrentParameters([]);
                setParameterIndex(0);
                setCurrentCommand('');
              }
            } else {
              executeCommand(currentCommand);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          setCurrentCommand('');
          setShowSuggestions(false);
          setCommandState('waiting');
          setCurrentParameters([]);
          setParameterIndex(0);
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (showSuggestions) {
            setSelectedSuggestion(Math.max(0, selectedSuggestion - 1));
          } else if (commandHistory.length > 0) {
            const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
            setHistoryIndex(newIndex);
            setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (showSuggestions) {
            setSelectedSuggestion(Math.min(suggestions.length - 1, selectedSuggestion + 1));
          } else if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setCurrentCommand('');
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (showSuggestions && suggestions.length > 0) {
            const selectedCmd = suggestions[selectedSuggestion];
            setCurrentCommand(selectedCmd.command);
            setShowSuggestions(false);
          }
          break;

        case 'F2':
          e.preventDefault();
          setIsExpanded(!isExpanded);
          break;
      }
    },
    [
      currentCommand,
      showSuggestions,
      suggestions,
      selectedSuggestion,
      commandHistory,
      historyIndex,
      executeCommand,
      commandState,
      currentParameters,
      parameterIndex,
      onExecuteCommand,
      isExpanded,
    ]
  );

  const getPrompt = () => {
    switch (commandState) {
      case 'waiting':
        return 'Command:';
      case 'parameter':
        const activeCmdDef = CAD_COMMANDS.find(
          cmd =>
            commandHistory.length > 0 &&
            (cmd.command.toLowerCase() ===
              commandHistory[commandHistory.length - 1].toLowerCase() ||
              cmd.aliases?.some(
                alias =>
                  alias.toLowerCase() === commandHistory[commandHistory.length - 1].toLowerCase()
              ))
        );
        if (activeCmdDef && activeCmdDef.parameters) {
          return `${activeCmdDef.parameters[parameterIndex]}:`;
        }
        return 'Parameter:';
      default:
        return 'Command:';
    }
  };

  return (
    <div
      className={`w-full border-t border-gray-600 relative ${
        theme === 'dark' ? 'bg-gray-900' : theme === 'light' ? 'bg-white' : 'bg-gray-800'
      }`}
      style={{ height: isExpanded ? height * 3 : height }}
    >
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-600 max-h-48 overflow-y-auto z-50"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer ${
                index === selectedSuggestion ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => {
                executeCommand(suggestion.command);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold">{suggestion.command}</span>
                  {suggestion.aliases && suggestion.aliases.length > 0 && (
                    <span className="text-gray-400 ml-2">({suggestion.aliases.join(', ')})</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{suggestion.description}</span>
              </div>
              {suggestion.parameters && suggestion.parameters.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Parameters: {suggestion.parameters.join(' → ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Command History (when expanded) */}
      {isExpanded && (
        <div className="h-2/3 overflow-y-auto p-2 border-b border-gray-600">
          <div className="text-xs font-mono space-y-1">
            {commandHistory.slice(-20).map((cmd, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight size={12} className="text-green-400" />
                <span className="text-green-400">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Input */}
      <div className="flex items-center h-full px-3 space-x-2">
        <Terminal size={16} className="text-blue-400 flex-shrink-0" />

        <span className="text-sm font-mono text-gray-300 flex-shrink-0">{getPrompt()}</span>

        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={e => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm font-mono text-white outline-none"
          placeholder={
            commandState === 'waiting' ? 'Type a command or press Tab for suggestions' : ''
          }
          autoComplete="off"
          spellCheck={false}
        />

        {/* Status Indicators */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {commandState === 'parameter' && (
            <span className="text-xs text-yellow-400">Param {parameterIndex + 1}</span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Toggle command history (F2)"
          >
            <History size={14} />
          </button>

          {currentCommand && (
            <button
              onClick={() => {
                setCurrentCommand('');
                setShowSuggestions(false);
              }}
              className="p-1 hover:bg-gray-700 rounded"
              title="Clear command"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="absolute right-2 bottom-0 text-xs text-gray-500">
        F2: History | Tab: Complete | Esc: Cancel
      </div>
    </div>
  );
}
