import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

type DialogBackdropProps = {
  onDismiss: () => void;
  className?: string;
  children: ReactNode;
};

/** Dismisses only when the pointer is pressed and released on the backdrop itself. */
export function DialogBackdrop({ onDismiss, className = "dialog-backdrop", children }: DialogBackdropProps) {
  const dismissOnRelease = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dismissOnRelease.current = event.target === event.currentTarget;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dismissOnRelease.current && event.target === event.currentTarget) {
      onDismiss();
    }
    dismissOnRelease.current = false;
  };

  const handlePointerCancel = () => {
    dismissOnRelease.current = false;
  };

  return (
    <div
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </div>
  );
}
