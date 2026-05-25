import {
  Home,
  ShoppingCart,
  Car,
  Heart,
  Film,
  Pizza,
  Plane,
  Gift,
  PiggyBank,
  TrendingUp,
  CreditCard,
  HandCoins,
  Briefcase,
  Wrench,
  Baby,
  PawPrint,
  Smartphone,
  Dumbbell,
  CalendarSync,
  Shirt,
  Lightbulb,
  Wallet,
  Landmark,
  CircleDollarSign,
  BadgeDollarSign,
  Coins,
  Banknote,
  type LucideIcon,
} from "lucide-react"

export const iconOptions = [
  { value: "housing", label: "Habitação", icon: Home },
  { value: "groceries", label: "Compras", icon: ShoppingCart },
  { value: "transport", label: "Transporte", icon: Car },
  { value: "health", label: "Saúde", icon: Heart },
  { value: "entertainment", label: "Lazer", icon: Film },
  { value: "dining", label: "Alimentação", icon: Pizza },
  { value: "travel", label: "Viagem", icon: Plane },
  { value: "gifts", label: "Presentes", icon: Gift },
  { value: "savings", label: "Poupança", icon: PiggyBank },
  { value: "investments", label: "Investimentos", icon: TrendingUp },
  { value: "creditCard", label: "Cartão", icon: CreditCard },
  { value: "taxes", label: "Impostos", icon: HandCoins },
  { value: "work", label: "Trabalho", icon: Briefcase },
  { value: "maintenance", label: "Manutenção", icon: Wrench },
  { value: "kids", label: "Filhos", icon: Baby },
  { value: "pets", label: "Pets", icon: PawPrint },
  { value: "tech", label: "Tecnologia", icon: Smartphone },
  { value: "sports", label: "Esporte", icon: Dumbbell },
  { value: "signature", label: "Assinatura", icon: CalendarSync },
  { value: "clothing", label: "Roupas", icon: Shirt },
  { value: "ideas", label: "Extra", icon: Lightbulb },
  { value: "wallet", label: "Carteira", icon: Wallet },
  { value: "bank", label: "Banco", icon: Landmark },
  { value: "cash", label: "Dinheiro", icon: CircleDollarSign },
  { value: "salary", label: "Salário", icon: BadgeDollarSign },
  { value: "coins", label: "Moedas", icon: Coins },
  { value: "money", label: "Dinheiro", icon: Banknote },
] as const

export type IconValue = (typeof iconOptions)[number]["value"]

export function getIconByValue(value: string): LucideIcon {
  return iconOptions.find((o) => o.value === value)?.icon ?? Wallet
}

export const colorOptions = [
  { value: "red", hex: "#e61a1a" },
  { value: "blue", hex: "#1866e4" },
  { value: "green", hex: "#16a34a" },
  { value: "yellow", hex: "#eab308" },
  { value: "purple", hex: "#9333ea" },
  { value: "pink", hex: "#ec4899" },
  { value: "indigo", hex: "#6366f1" },
  { value: "orange", hex: "#f97316" },
  { value: "teal", hex: "#14b8a6" },
] as const

export type ColorHex = (typeof colorOptions)[number]["hex"]
