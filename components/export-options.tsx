"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileSpreadsheet, FileText, Download, ChevronDown, File, Layers, AlertTriangle } from "lucide-react"
import { exportToCSV, exportToText } from "@/lib/export-utils"
import {
  exportToExcelAdvanced,
  exportToExcelSimple,
  exportToExcelMultiSheet,
  exportToExcelHTML,
  exportToCSVFallback,
} from "@/lib/excel-export"
import type { ProcessedOrder } from "@/components/order-profit-calculator"

interface ExportOptionsProps {
  data: ProcessedOrder[]
}

export function ExportOptions({ data }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (
    exportFunction: () => Promise<boolean> | boolean,
    type: string,
    fallbackFunction?: () => Promise<boolean> | boolean,
  ) => {
    if (isExporting) return

    setIsExporting(true)
    try {
      console.log(`Starting ${type} export...`)
      await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay for UI feedback

      const result = await exportFunction()

      if (result !== false) {
        console.log(`${type} export completed successfully`)
      }
    } catch (error) {
      console.error(`${type} export failed:`, error)

      // Try fallback if available
      if (fallbackFunction) {
        try {
          console.log(`Trying fallback for ${type}...`)
          await fallbackFunction()
          console.log(`Fallback ${type} export completed`)
        } catch (fallbackError) {
          console.error(`Fallback ${type} export also failed:`, fallbackError)
          alert(`Erro ao exportar ${type}: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
        }
      } else {
        alert(`Erro ao exportar ${type}: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
      }
    } finally {
      setTimeout(() => setIsExporting(false), 1000) // Keep loading state for a moment
    }
  }

  // Excel export handlers with fallbacks
  const handleExportExcelSimple = () => {
    handleExport(
      () => exportToExcelSimple(data, "pedidos_processados.xlsx"),
      "Excel Simples",
      () => exportToExcelHTML(data, "pedidos_processados.xls"),
    )
  }

  const handleExportExcelAdvanced = () => {
    handleExport(
      () =>
        exportToExcelAdvanced(data, {
          includeFormatting: true,
          includeFormulas: true,
          filename: "pedidos_processados_formatado.xlsx",
        }),
      "Excel Avançado",
      () => exportToExcelHTML(data, "pedidos_processados_formatado.xls"),
    )
  }

  const handleExportExcelMultiSheet = () => {
    handleExport(
      () => exportToExcelMultiSheet(data, "relatorio_completo.xlsx"),
      "Excel Multi-Planilhas",
      () => exportToExcelHTML(data, "relatorio_completo.xls"),
    )
  }

  const handleExportExcelHTML = () => {
    handleExport(() => exportToExcelHTML(data, "pedidos_processados.xls"), "Excel HTML")
  }

  // Other export handlers
  const handleExportCSV = () => {
    handleExport(
      () => {
        exportToCSV(data, "pedidos_processados.csv")
        return Promise.resolve(true)
      },
      "CSV",
      () => exportToCSVFallback(data, "pedidos_processados.csv"),
    )
  }

  const handleExportText = () => {
    handleExport(() => {
      exportToText(data, "pedidos_processados.txt")
      return Promise.resolve(true)
    }, "Texto")
  }

  if (data.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="border-gray-200 text-gray-400">
        <Download className="h-4 w-4 mr-2" />
        Sem dados para exportar
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Quick Excel Export Button */}
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleExportExcelSimple} 
        disabled={isExporting}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-medium"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exportando...
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            📊 Excel
          </>
        )}
      </Button>

      {/* Quick CSV Export Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportCSV} 
        disabled={isExporting}
        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 font-medium"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Exportando...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            📋 CSV
          </>
        )}
      </Button>

      {/* Dropdown with all options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isExporting}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 font-medium"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                ⚙️ Mais opções
                <ChevronDown className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl p-2">
          {/* Excel Options */}
          <div className="px-3 py-2 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent border-b border-gray-100 mb-2">
            📊 Excel
          </div>
          <DropdownMenuItem 
            onClick={handleExportExcelSimple}
            className="rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-medium"
          >
            <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
            Excel Simples (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportExcelAdvanced}
            className="rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-medium"
          >
            <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
            Excel Formatado (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportExcelMultiSheet}
            className="rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-medium"
          >
            <Layers className="h-4 w-4 mr-3 text-green-600" />
            Excel Multi-Planilhas (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportExcelHTML}
            className="rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-medium"
          >
            <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
            Excel HTML (.xls)
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-3" />

          {/* Other Formats */}
          <div className="px-3 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b border-gray-100 mb-2">
            📄 Outros Formatos
          </div>
          <DropdownMenuItem 
            onClick={handleExportCSV}
            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 font-medium"
          >
            <FileText className="h-4 w-4 mr-3 text-blue-600" />
            CSV (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportText}
            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 font-medium"
          >
            <File className="h-4 w-4 mr-3 text-blue-600" />
            Texto (.txt)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Info about browser compatibility */}
      <div className="flex items-center ml-2 px-3 py-1 bg-gray-100/60 backdrop-blur-sm rounded-lg border border-gray-200/50">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        <span className="text-xs font-medium text-gray-600 hidden md:inline">
          ✅ Compatível com todos os navegadores
        </span>
      </div>
    </div>
  )
}
