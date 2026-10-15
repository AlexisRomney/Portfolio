"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "@gd/i18n";

export type DemoSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: DemoSelectOption[];
  onChange: (value: string) => void;
  "aria-label": string;
  placeholder?: string;
  className?: string;
  /** Affichage custom du déclencheur (ex. badge), sans changer les options. */
  renderValue?: (label: string, value: string) => ReactNode;
};

/**
 * Liste déroulante accessible : déclencheur cliquable minimal pour l’UX inline.
 */
export function DemoSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  placeholder,
  className = "",
  renderValue,
}: Props) {
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const label = selected?.label ?? placeholder ?? t("common.choose");

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`demo-select${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="demo-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="demo-select-value">
          {renderValue ? renderValue(label, value) : label}
        </span>
        <span className="demo-select-chevron" aria-hidden>
          ▼
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="demo-select-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || "__empty"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`demo-select-option${isSelected ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
