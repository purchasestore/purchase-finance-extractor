/**
 * Converts Brazilian currency format to number
 * Examples:
 * "R$ 41,50" -> 41.50
 * "R$ 1.234,56" -> 1234.56
 * "41,50" -> 41.50
 * "1.234,56" -> 1234.56
 */
export function parseBrazilianCurrency(value: any): number {
  if (typeof value === "number") {
    return value
  }

  if (!value || value === null || value === undefined) {
    return 0
  }

  // Convert to string and clean
  let cleanValue = String(value)
    .replace(/R\$\s*/g, "") // Remove R$ and spaces
    .replace(/\s+/g, "") // Remove all spaces
    .trim()

  // Handle empty or invalid values
  if (!cleanValue || cleanValue === "-" || cleanValue === "" || cleanValue === "0") {
    return 0
  }

  // Brazilian format handling
  // If there's a comma, it's the decimal separator
  if (cleanValue.includes(",")) {
    // Check if there are dots before the comma (thousands separators)
    const commaIndex = cleanValue.lastIndexOf(",")
    const beforeComma = cleanValue.substring(0, commaIndex)
    const afterComma = cleanValue.substring(commaIndex + 1)

    // Remove dots from the integer part (thousands separators)
    const integerPart = beforeComma.replace(/\./g, "")

    // Reconstruct with period as decimal separator
    cleanValue = `${integerPart}.${afterComma}`
  } else if (cleanValue.includes(".")) {
    // No comma, check if dots are thousands separators or decimal
    const parts = cleanValue.split(".")
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator, keep as is
    } else {
      // Multiple dots or more than 2 decimal places, treat as thousands separators
      cleanValue = cleanValue.replace(/\./g, "")
    }
  }

  const parsed = Number.parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formats number to Brazilian currency format
 */
export function formatBrazilianCurrency(value: number | string): string {
  if (typeof value === "string") return value

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats number as percentage
 */
export function formatPercentage(value: number | string): string {
  if (typeof value === "string") return value
  return `${(value * 100).toFixed(2)}%`
}

/**
 * Debug function to see what values we're getting
 */
export function debugCurrencyParsing(value: any): { original: any; parsed: number; formatted: string } {
  const parsed = parseBrazilianCurrency(value)
  const formatted = formatBrazilianCurrency(parsed)
  return { original: value, parsed, formatted }
}
