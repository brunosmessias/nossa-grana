import { Chip } from "@heroui/chip"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { Button } from "@heroui/button"
import { MoreVertical } from "lucide-react"
import type { RouterOutputs } from "@/src/trpc/react"
import { formatCentsToBRL } from "@/src/app/_components/utils/currency"
import { TransactionType } from "@/src/server/api/routers/transaction"

type MobileTransactionCardProps = {
  transaction: RouterOutputs["transaction"]["getByMonth"][0]
  onEditTransaction: (transaction: TransactionType) => void
  onDeleteTransaction: (transaction: TransactionType) => void
}

export default function MobileTransactionCard({
  transaction,
  onEditTransaction,
  onDeleteTransaction,
}: MobileTransactionCardProps) {
  return (
    <div className="rounded-md border-2 border-default-100 p-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{transaction.description}</p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </span>

            {transaction.category && (
              <Chip
                size="sm"
                style={{
                  backgroundColor: `${transaction.category.color}20`,
                  color: transaction.category.color,
                }}
              >
                {transaction.category.name}
              </Chip>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-medium">
            {formatCentsToBRL(transaction.amountCents)}
          </span>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light" className="mt-1">
                <MoreVertical size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações">
              <DropdownItem
                key="edit"
                onPress={() => {
                  onEditTransaction({
                    ...transaction,
                    categoryId: transaction.category.id,
                    amountCents: transaction.amountCents.toString(),
                  })
                }}
              >
                Editar
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                onPress={() => {
                  onDeleteTransaction({
                    ...transaction,
                    categoryId: transaction.category.id,
                    amountCents: transaction.amountCents.toString(),
                  })
                }}
              >
                Excluir
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
