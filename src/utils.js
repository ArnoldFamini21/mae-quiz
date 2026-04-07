import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useKeyboardNav({ onNext, onBack, onSelect, options, selectedValue }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || (e.key === "Backspace" && !e.target.matches("input,textarea"))) {
        e.preventDefault();
        onBack();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!options || options.length === 0) return;
        
        const currentIndex = options.findIndex((o) => o.value === selectedValue);
        let nextIndex;
        
        if (e.key === "ArrowDown") {
          nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        }
        
        onSelect(options[nextIndex].value);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onBack, onSelect, options, selectedValue]);
}
