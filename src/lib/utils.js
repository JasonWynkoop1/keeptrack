import { clsx } from "../../node_modules/clsx/dist/clsx.js"
import { twMerge } from "../../node_modules/tailwind-merge/dist/index.js"

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly
 * @param {...string} inputs - Class names to combine
 * @returns {string} - Combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
