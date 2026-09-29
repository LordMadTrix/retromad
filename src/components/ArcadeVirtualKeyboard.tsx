import React, { useState, useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft, Space, RotateCcw, X, Gamepad2 } from 'lucide-react';

interface ArcadeVirtualKeyboardProps {
  isOpen: boolean;
  initialValue?: string;
  placeholder?: string;
  title?: string;
  onClose: () => void;
  onConfirm: (text: string) => void;
  onChange?: (text: string) => void;
  soundEnabled?: boolean;
}

const KEYBOARD_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '(', ')'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', ':', '!'],
  ['W', 'X', 'C', 'V', 'B', 'N', '?', '.', ',', '/', '\'', '#'],
];

export const ArcadeVirtualKeyboard: React.FC<ArcadeVirtualKeyboardProps> = ({
  isOpen,
  initialValue = '',
  placeholder = 'Tapez votre texte...',
  title = 'Clavier Virtuel Arcade',
  onClose,
  onConfirm,
  onChange,
  soundEnabled = true,
}) => {
  const [text, setText] = useState(initialValue);
  const [currentRow, setCurrentRow] = useState(1);
  const [currentCol, setCurrentCol] = useState(0);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const updateText = useCallback(
    (newText: string) => {
      setText(newText);
      onChange?.(newText);
    },
    [onChange]
  );

  const handleCharClick = useCallback(
    (char: string) => {
      updateText(text + char);
    },
    [text, updateText]
  );

  const handleBackspace = useCallback(() => {
    updateText(text.slice(0, -1));
  }, [text, updateText]);

  const handleClear = useCallback(() => {
    updateText('');
  }, [updateText]);

  const handleSpace = useCallback(() => {
    updateText(text + ' ');
  }, [text, updateText]);

  const handleConfirm = useCallback(() => {
    onConfirm(text);
    onClose();
  }, [text, onConfirm, onClose]);

  // Support Manette & Touches Clavier / D-pad
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setCurrentRow((r) => Math.max(0, r - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCurrentRow((r) => Math.min(KEYBOARD_LAYOUT.length - 1, r + 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentCol((c) => Math.max(0, c - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentCol((c) => Math.min(KEYBOARD_LAYOUT[currentRow].length - 1, c + 1));
          break;
        case 'Enter':
          e.preventDefault();
          const char = KEYBOARD_LAYOUT[currentRow]?.[currentCol];
          if (char) handleCharClick(char);
          break;
        case 'Backspace':
          e.preventDefault();
          handleBackspace();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentRow, currentCol, handleCharClick, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.3)] overflow-hidden p-6 flex flex-col gap-4 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titre & Bouton Fermer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Gamepad2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-slate-400">Naviguez au stick / flèches, validez avec Entrée ou bouton A</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Champ de saisie actuel */}
        <div className="relative">
          <input
            type="text"
            value={text}
            readOnly
            placeholder={placeholder}
            className="w-full bg-slate-950 border-2 border-cyan-500/60 rounded-xl px-4 py-3 text-lg font-mono text-cyan-200 tracking-wider shadow-inner focus:outline-none"
          />
          {text && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-400 transition"
              title="Vider"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grille des Touches */}
        <div className="flex flex-col gap-2">
          {KEYBOARD_LAYOUT.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
              {row.map((char, cIdx) => {
                const isFocused = currentRow === rIdx && currentCol === cIdx;
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => {
                      setCurrentRow(rIdx);
                      setCurrentCol(cIdx);
                      handleCharClick(char);
                    }}
                    className={`w-9 h-10 sm:w-11 sm:h-11 rounded-xl font-bold font-mono text-sm sm:text-base transition-all flex items-center justify-center ${
                      isFocused
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.8)] scale-110 z-10 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400/50'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Barre des actions spéciales */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpace}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition active:scale-95"
            >
              <Space className="w-4 h-4" />
              <span>Espace</span>
            </button>

            <button
              onClick={handleBackspace}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition active:scale-95"
            >
              <Delete className="w-4 h-4" />
              <span>Effacer</span>
            </button>

            <button
              onClick={handleClear}
              className="px-3.5 py-2 bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vider</span>
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition active:scale-95"
          >
            <CornerDownLeft className="w-4 h-4" />
            <span>Valider</span>
          </button>
        </div>

        {/* Légende manette arcade */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
          <span>[🕹️ Stick/D-pad] Déplacer</span>
          <span>[🟢 A] Valider</span>
          <span>[🔴 B] Effacer</span>
          <span>[🔵 X] Espace</span>
          <span>[⚡ START] Confirmer</span>
        </div>
      </div>
    </div>
  );
};
