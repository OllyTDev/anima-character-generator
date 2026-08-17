import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | null;
  onChange: (value: number | null) => void;
};

function formatValue(value: number | null): string {
  return value === null ? "" : String(value);
}

export function NumberInput({ value, onChange, className, onFocus, onBlur, ...props }: NumberInputProps) {
  const [text, setText] = useState(() => formatValue(value));
  const focused = useRef(false);
  const invalid = text.trim() === "";

  useEffect(() => {
    if (!focused.current) {
      setText(formatValue(value));
    }
  }, [value]);

  return (
    <input
      {...props}
      type="number"
      className={`${className ?? ""} ${invalid ? "input--invalid" : ""}`.trim()}
      value={text}
      aria-invalid={invalid}
      onFocus={(event) => {
        focused.current = true;
        onFocus?.(event);
      }}
      onBlur={(event) => {
        focused.current = false;
        onBlur?.(event);
      }}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        if (next.trim() === "") {
          onChange(null);
          return;
        }
        const parsed = Number(next);
        if (!Number.isNaN(parsed)) onChange(parsed);
      }}
    />
  );
}
