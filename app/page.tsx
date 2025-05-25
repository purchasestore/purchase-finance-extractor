import { OrderProfitCalculator } from "@/components/order-profit-calculator"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <PageHeader
        title="Order Profit Calculator"
        description="Faça upload da sua planilha de pedidos SHEIN e opcionalmente uma planilha de custos para calcular automaticamente as métricas financeiras."
      />
      <div className="mt-8">
        <OrderProfitCalculator />
      </div>
    </main>
  )
}
