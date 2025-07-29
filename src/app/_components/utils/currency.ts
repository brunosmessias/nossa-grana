export function formatCentsToBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

export function formatCurrency(value: string) {
  const numericValue = value.replace(/[^\d]/g, "")
  if (numericValue === "") return ""

  const cents = parseInt(numericValue)
  const reais = cents / 100
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function applyAmountMask(value: string) {
  const numericValue = value.replace(/[^\d]/g, "")
  return formatCurrency(numericValue)
}

export function parseCurrencyToCents(value: string): number {
  const cleanValue = value.replace(/\./g, "").replace(",", ".")

  const numericValue = parseFloat(cleanValue)

  if (isNaN(numericValue)) {
    throw new Error("Valor inválido")
  }

  return Math.round(numericValue * 100)
}
