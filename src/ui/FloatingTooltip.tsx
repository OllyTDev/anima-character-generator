import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "./useMediaQuery";

type FloatingTooltipProps = {
  tooltip: string;
  className?: string;
  children: ReactNode;
};

export function FloatingTooltip({ tooltip, className = "", children }: FloatingTooltipProps) {
  const isTouch = useMediaQuery("(hover: none), (pointer: coarse)");
  const tooltipId = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateTooltipPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 8;
    const maxWidth = Math.min(288, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin + maxWidth / 2, rect.left + rect.width / 2),
      window.innerWidth - margin - maxWidth / 2,
    );
    setTooltipStyle({ top: rect.top - margin, left });
  }, []);

  const showTooltip = useCallback(() => {
    updateTooltipPosition();
    setTooltipOpen(true);
  }, [updateTooltipPosition]);

  const hideTooltip = useCallback(() => {
    setTooltipOpen(false);
  }, []);

  const toggleTooltip = useCallback(() => {
    if (tooltipOpen) hideTooltip();
    else showTooltip();
  }, [hideTooltip, showTooltip, tooltipOpen]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isTouch) return;
      event.preventDefault();
      event.stopPropagation();
      toggleTooltip();
    },
    [isTouch, toggleTooltip],
  );

  useEffect(() => {
    if (!isTouch || !tooltipOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      hideTooltip();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [hideTooltip, isTouch, tooltipOpen]);

  useEffect(() => {
    if (!tooltipOpen) return;
    const onReposition = () => updateTooltipPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [tooltipOpen, updateTooltipPosition]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`floating-tooltip-trigger${className ? ` ${className}` : ""}`}
        aria-label={tooltip}
        aria-expanded={tooltipOpen}
        aria-describedby={tooltipOpen ? tooltipId : undefined}
        onMouseEnter={isTouch ? undefined : showTooltip}
        onMouseLeave={isTouch ? undefined : hideTooltip}
        onFocus={isTouch ? undefined : showTooltip}
        onBlur={isTouch ? undefined : hideTooltip}
        onClick={handleClick}
      >
        {children}
      </button>
      {tooltipOpen
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              className="floating-tooltip"
              style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
              role="tooltip"
            >
              {tooltip}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
