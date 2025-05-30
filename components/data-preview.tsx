"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataPreviewProps {
  data: any[]
}

export function DataPreview({ data }: DataPreviewProps) {
  if (!data || data.length === 0) {
    return <p>Nenhum dado disponível para visualização.</p>
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(new Set(data.flatMap((item) => Object.keys(item))))

  // Prioritize these columns to appear first
  const priorityColumns = [
    "Número do pedido",
    "Nome do produto",
    "Preço do produto",
    "Receita estimada de mercadorias",
    "Frete",
    "A Receber Final",
    "Peças",
    "Custo",
    "Margem de Contribuição",
    "Lucro Bruto (%)",
  ]

  // Sort keys to prioritize important columns
  const sortedKeys = [
    ...priorityColumns.filter((key) => allKeys.includes(key)),
    ...allKeys.filter((key) => !priorityColumns.includes(key)),
  ]

  return (
    <div className="rounded-md border animate-in fade-in-50 duration-700">
      <ScrollArea className="h-[500px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {sortedKeys.map((key, index) => (
                  <TableHead
                    key={key}
                    className="whitespace-nowrap font-semibold"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeIn 0.5s ease forwards",
                    }}
                  >
                    {key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  style={{
                    animationDelay: `${rowIndex * 100}ms`,
                    animation: "fadeIn 0.5s ease forwards",
                    opacity: 0,
                  }}
                >
                  {sortedKeys.map((key) => (
                    <TableCell key={`${rowIndex}-${key}`} className="whitespace-nowrap">
                      {row[key] !== undefined ? String(row[key]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
