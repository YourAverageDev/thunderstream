import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveTvKey } from "@/lib/tvKeys";

// A deliberately minimal, dependency-free dropdown — no portal, no
// floating-ui positioning, no CSS custom properties, no animation classes.
// It replaces both the native <select> (whose OS-level picker on Samsung's
// Tizen TV browser swallows the D-pad once open — you can select but can't
// move) and a Radix-based popover (which relies on rendering/positioning
// machinery that didn't work reliably on the same TV either). Every option
// here is a plain <button> sitting directly in the page's own DOM, so the
// app's existing D-pad spatial navigation (which already works fine for
// every other button on every page) drives it with zero special-casing.
export type TvSelectOption<T extends string> = { value: T; label: string };

export function TvSelect<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: TvSelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-tv-select={open ? "open" : undefined}
      className={`relative inline-block ${className ?? ""}`}
      onKeyDown={(e) => {
        if (!open) return;
        const key = resolveTvKey(e.nativeEvent);
        if (key === "Backspace" || key === "Escape" || key === "GoBack" || key === "BrowserBack") {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-secondary/80 px-3 text-xs text-foreground"
      >
        <span>{current?.label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              data-tv-primary={opt.value === value ? "true" : undefined}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`block w-full px-3 py-2 text-left text-xs hover:bg-accent focus:bg-accent focus:outline-none ${
                opt.value === value ? "font-medium text-primary" : "text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
