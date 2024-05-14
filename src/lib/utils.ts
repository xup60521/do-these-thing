import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRuleTypeColor({ruleType}:{ruleType?: string}) {
    switch(ruleType) {
        case "conditional-add": return "bg-green-200 text-green-700";
        case "planned-toggle-group": return "bg-blue-200 text-blue-700"
        default: return "bg-neutral-400 text-white"
    }
}