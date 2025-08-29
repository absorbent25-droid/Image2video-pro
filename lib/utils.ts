import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Функция объединяет несколько классов tailwind без конфликтов.
 * Пример:
 * cn("px-2 py-1", condition && "bg-red-500")
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
