// ── Shared helpers ─────────────────────────────────────────────────
import { IMGS } from "./data.js";

export function gimg(key, size) {
  size = size || 20;
  return (
    '<img src="' +
    IMGS[key] +
    '" alt="' +
    key +
    '" style="width:' +
    size +
    "px;height:" +
    size +
    'px;object-fit:contain;vertical-align:middle">'
  );
}
