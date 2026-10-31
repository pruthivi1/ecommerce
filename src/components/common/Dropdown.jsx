import { useEffect, useRef, useState } from "react";

export default function Dropdown({ trigger, children, align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger({ open })}</div>
      {open && (
        <div
          className={`absolute z-30 mt-2 min-w-[12rem] rounded-md border border-border bg-white py-1.5 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-text hover:bg-slate-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
