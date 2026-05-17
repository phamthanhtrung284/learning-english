export const EST_TOOLTIP_W = 360;

/** Khoảng cách từ con trỏ tới góc tooltip (px) — nhỏ để bám sát chuột. */
export const CURSOR_PAD = 6;

/** Khớp max-h của WordTooltip / portal. */
export function estimateTooltipSize() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const margin = 10;
  return {
    estH: Math.min(520, vh * 0.72),
    estW: Math.min(EST_TOOLTIP_W, vw - 2 * margin),
    vh,
    vw,
    margin,
  };
}

/**
 * Neo tooltip gần con trỏ (góc trên-trái của vùng đặt), kẹp trong viewport.
 * placement dùng cho WordTooltip (padding / caret).
 */
export function clampCursorTooltip(clientX, clientY) {
  const { estH, estW, vh, vw, margin } = estimateTooltipSize();
  const gap = CURSOR_PAD;

  let left = clientX + gap;
  if (left + estW > vw - margin) left = vw - estW - margin;
  if (left < margin) left = margin;

  const roomBelow = vh - clientY - gap - margin;
  const roomAbove = clientY - gap - margin;

  let top;
  let placement;
  if (roomBelow >= estH) {
    top = clientY + gap;
    placement = "bottom";
  } else if (roomAbove >= estH) {
    top = clientY - gap - estH;
    placement = "top";
  } else if (roomAbove > roomBelow) {
    placement = "top";
    top = margin;
  } else {
    placement = "bottom";
    top = Math.max(margin, vh - margin - estH);
  }

  if (top + estH > vh - margin) top = vh - margin - estH;
  if (top < margin) top = margin;

  return { left, top, placement };
}
