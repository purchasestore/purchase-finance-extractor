"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { formatBrazilianCurrency } from "@/lib/currency-utils"
import type { ProcessedOrder } from "@/components/order-profit-calculator"

interface DataTableProps {
  data: ProcessedOrder[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter(
      (row) =>
        row["Nome do produto"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row["Número do produto"]?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [data, searchTerm])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const getCellClassName = (value: number | string) => {
    let className = "whitespace-nowrap text-right"
    if (typeof value === "number" && value < 0) {
      className += " text-red-600 font-medium bg-red-50"
    } else if (typeof value === "string" && value.includes("N/A")) {
      className += " text-yellow-600 bg-yellow-50 text-center"
    }
    return className
  }

  const formatCellValue = (value: number | string) => {
    if (typeof value === "string") return value
    return formatBrazilianCurrency(value)
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalReceita = filteredData.reduce((sum, row) => {
      const value = row["A receber final"]
      return sum + (typeof value === "number" ? value : 0)
    }, 0)

    const totalMargem = filteredData.reduce((sum, row) => {
      const value = row["Margem de contribuição"]
      return sum + (typeof value === "number" ? value : 0)
    }, 0)

    const skusSemCusto = filteredData.filter((row) => typeof row["Custo"] === "string").length

    return {
      totalPedidos: filteredData.length,
      totalReceita,
      totalMargem,
      skusSemCusto,
    }
  }, [filteredData])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou número do produto..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="max-w-sm"
        />
        <span className="text-sm text-gray-500">
          {filteredData.length} de {data.length} registros
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.totalPedidos}</div>
          <div className="text-sm text-gray-600">Total de Pedidos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{formatBrazilianCurrency(summaryStats.totalReceita)}</div>
          <div className="text-sm text-gray-600">Total a Receber</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{formatBrazilianCurrency(summaryStats.totalMargem)}</div>
          <div className="text-sm text-gray-600">Margem Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{summaryStats.skusSemCusto}</div>
          <div className="text-sm text-gray-600">SKUs sem Custo</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-background">SKU</TableHead>
                <TableHead className="sticky top-0 bg-background">Nome do Produto</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Preço</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Cupom</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Comissão</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Receita Est.</TableHead>
                <TableHead className="sticky top-0 bg-background text-center">Peças</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Frete</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">A Receber Final</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Custo</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Margem Contrib.</TableHead>
                <TableHead className="sticky top-0 bg-background text-right">Lucro Bruto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index} className={row._hasError ? "bg-red-50" : ""}>
                  <TableCell className="font-mono text-xs">{row["Número do produto"]}</TableCell>
                  <TableCell className="max-w-48 truncate" title={row["Nome do produto"]}>
                    {row["Nome do produto"]}
                  </TableCell>
                  <TableCell className="text-right">{formatCellValue(row["Preço do produto"])}</TableCell>
                  <TableCell className="text-right">{formatCellValue(row["Valor do cupom"])}</TableCell>
                  <TableCell className="text-right">{formatCellValue(row["Comissão"])}</TableCell>
                  <TableCell className="text-right">
                    {formatCellValue(row["Receita estimada de mercadorias"])}
                  </TableCell>
                  <TableCell className="text-center">{row["Peças"]}</TableCell>
                  <TableCell className="text-right">{formatCellValue(row["Frete"])}</TableCell>
                  <TableCell className={getCellClassName(row["A receber final"])}>
                    {formatCellValue(row["A receber final"])}
                  </TableCell>
                  <TableCell className={getCellClassName(row["Custo"])}>{formatCellValue(row["Custo"])}</TableCell>
                  <TableCell className={getCellClassName(row["Margem de contribuição"])}>
                    {formatCellValue(row["Margem de contribuição"])}
                  </TableCell>
                  <TableCell className={getCellClassName(row["Lucro Bruto"])}>
                    {formatCellValue(row["Lucro Bruto"])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
