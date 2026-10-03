import { useEffect, useId, useRef, useState } from "react";
export function EditableSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder,
  clearLabel,
}: {
  id?: string;
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder: string;
  clearLabel: string;
}) {
  const list = useId(),
    input = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.id === value)?.name ?? "";
  const [text, setText] = useState(selected),
    [open, setOpen] = useState(false),
    [filtering, setFiltering] = useState(false),
    [active, setActive] = useState(0);
  useEffect(() => setText(selected), [selected, value]);
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  const matches = filtering
    ? options.filter((o) => fold(o.name).includes(fold(text)))
    : options;
  useEffect(() => {
    if (open)
      document
        .getElementById(`${list}-${active}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, list]);
  function commit(option: { id: string; name: string }) {
    setText(option.name);
    onChange(option.id);
    setOpen(false);
    setFiltering(false);
    input.current?.focus();
  }
  return (
    <div className="editable-select">
      <input
        id={id}
        ref={input}
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={list}
        aria-autocomplete="list"
        aria-activedescendant={
          open && matches[active] ? `${list}-${active}` : undefined
        }
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onFocus={(e) => {
          e.target.select();
        }}
        onClick={() => {
          setOpen(true);
          setFiltering(false);
          setActive(0);
        }}
        onChange={(e) => {
          const q = e.target.value;
          setText(q);
          setFiltering(true);
          setActive(0);
          setOpen(true);
          if (!q) {
            setOpen(false);
            onChange("");
            return;
          }
          const found = options.find((o) => fold(o.name) === fold(q));
          if (found) {
            onChange(found.id);
            setOpen(false);
          }
        }}
        onBlur={() => {
          setText(selected);
          setOpen(false);
          setFiltering(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setText(selected);
            setOpen(false);
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((i) =>
              open
                ? Math.max(
                    0,
                    Math.min(
                      matches.length - 1,
                      i + (e.key === "ArrowDown" ? 1 : -1),
                    ),
                  )
                : 0,
            );
          }
          if (e.key === "Enter" && open && matches[active]) {
            e.preventDefault();
            commit(matches[active]);
          }
        }}
      />
      <button
        type="button"
        className="show-options"
        aria-label={clearLabel.replace("Borrar", "Desplegar")}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          input.current?.focus();
          setFiltering(false);
          setActive(0);
          setOpen(!open);
        }}
      >
        ⌄
      </button>
      <button
        type="button"
        className="clear-selection"
        aria-label={clearLabel}
        disabled={disabled || (!text && !value)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setText("");
          onChange("");
          setFiltering(false);
          setOpen(false);
          input.current?.focus();
        }}
      >
        ×
      </button>
      {open && !disabled && (
        <div
          id={list}
          role="listbox"
          aria-label={clearLabel.replace("Borrar", "Opciones de")}
          className="select-options"
        >
          {matches.length ? (
            matches.map((o, i) => (
              <button
                type="button"
                role="option"
                tabIndex={-1}
                id={`${list}-${i}`}
                key={o.id}
                value={o.name}
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(o)}
              >
                {o.name}
              </button>
            ))
          ) : (
            <div role="status">Sin coincidencias</div>
          )}
        </div>
      )}
    </div>
  );
}
