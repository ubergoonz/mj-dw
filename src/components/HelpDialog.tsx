import { useRef } from "react";
import type { ReactNode } from "react";

interface HelpDialogProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  triggerLabel?: string;
}

/** Reusable "?" help trigger + modal dialog, shared across utility pages. */
export default function HelpDialog({ eyebrow, title, children, triggerLabel = "查看规则" }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="icon-button"
        type="button"
        aria-label={triggerLabel}
        onClick={() => dialogRef.current?.showModal()}
      >
        <span>?</span>
      </button>

      <dialog
        className="rules-dialog"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="dialog-content">
          <button
            className="close-button"
            type="button"
            aria-label="关闭"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {children}
        </div>
      </dialog>
    </>
  );
}
