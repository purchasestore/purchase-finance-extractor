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
      className += " text-red-700 font-semibold bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 rounded-md px-2 py-1"
    } else if (typeof value === "string" && value.includes("N/A")) {
      className += " text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 text-center font-medium border border-amber-200/50 rounded-md px-2 py-1"
    } else if (typeof value === "number" && value > 0) {
      className += " text-green-700 font-semibold"
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
      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou número do produto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white/80"
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100/60 px-3 py-2 rounded-lg">
          <span className="text-blue-600 font-semibold">{filteredData.length}</span>
          <span>de</span>
          <span className="text-gray-800 font-semibold">{data.length}</span>
          <span>registros</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">📄</span>
          </div>
          <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{summaryStats.totalPedidos}</div>
          <div className="text-sm font-medium text-blue-700 mt-1">Total de Pedidos</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">💰</span>
          </div>
          <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">{formatBrazilianCurrency(summaryStats.totalReceita)}</div>
          <div className="text-sm font-medium text-green-700 mt-1">Total a Receber</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">📈</span>
          </div>
          <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{formatBrazilianCurrency(summaryStats.totalMargem)}</div>
          <div className="text-sm font-medium text-purple-700 mt-1">Margem Total</div>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">⚠️</span>
          </div>
          <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{summaryStats.skusSemCusto}</div>
          <div className="text-sm font-medium text-orange-700 mt-1">SKUs sem Custo</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 border-r border-gray-200/50">SKU</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 border-r border-gray-200/50">Nome do Produto</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Preço</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Cupom</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Comissão</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Receita Est.</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-center border-r border-gray-200/50">Peças</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Frete</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">A Receber Final</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Custo</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right border-r border-gray-200/50">Margem Contrib.</TableHead>
                <TableHead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 text-right">Lucro Bruto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className={`
                    ${row._hasError ? "bg-red-50/80" : "hover:bg-blue-50/30"} 
                    transition-colors duration-200 border-b border-gray-100
                  `}
                >
                  <TableCell className="font-mono text-xs bg-gray-50/50 border-r border-gray-100 font-medium">{row["Número do produto"]}</TableCell>
                  <TableCell className="max-w-48 truncate border-r border-gray-100 font-medium" title={row["Nome do produto"]}>
                    {row["Nome do produto"]}
                  </TableCell>
                  <TableCell className="text-right border-r border-gray-100 font-medium">{formatCellValue(row["Preço do produto"])}</TableCell>
                  <TableCell className="text-right border-r border-gray-100 font-medium">{formatCellValue(row["Valor do cupom"])}</TableCell>
                  <TableCell className="text-right border-r border-gray-100 font-medium">{formatCellValue(row["Comissão"])}</TableCell>
                  <TableCell className="text-right border-r border-gray-100 font-medium">
                    {formatCellValue(row["Receita estimada de mercadorias"])}
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-100 font-semibold">{row["Peças"]}</TableCell>
                  <TableCell className="text-right border-r border-gray-100 font-medium">{formatCellValue(row["Frete"])}</TableCell>
                  <TableCell className={`${getCellClassName(row["A receber final"])} border-r border-gray-100 font-semibold`}>
                    {formatCellValue(row["A receber final"])}
                  </TableCell>
                  <TableCell className={`${getCellClassName(row["Custo"])} border-r border-gray-100 font-semibold`}>{formatCellValue(row["Custo"])}</TableCell>
                  <TableCell className={`${getCellClassName(row["Margem de contribuição"])} border-r border-gray-100 font-semibold`}>
                    {formatCellValue(row["Margem de contribuição"])}
                  </TableCell>
                  <TableCell className={`${getCellClassName(row["Lucro Bruto"])} font-semibold`}>
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
        <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            Página <span className="font-semibold text-blue-600">{currentPage}</span> de <span className="font-semibold text-gray-800">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
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
