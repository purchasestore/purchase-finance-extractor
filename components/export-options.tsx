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
      <Button variant="outline" size="sm" disabled>
        <Download className="h-4 w-4 mr-2" />
        Sem dados para exportar
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      {/* Quick Excel Export Button */}
      <Button variant="default" size="sm" onClick={handleExportExcelSimple} disabled={isExporting}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {isExporting ? "Exportando..." : "Excel"}
      </Button>

      {/* Quick CSV Export Button */}
      <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting}>
        <FileText className="h-4 w-4 mr-2" />
        {isExporting ? "Exportando..." : "CSV"}
      </Button>

      {/* Dropdown with all options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Mais opções"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Excel Options */}
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">Excel</div>
          <DropdownMenuItem onClick={handleExportExcelSimple}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Simples (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcelAdvanced}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Formatado (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcelMultiSheet}>
            <Layers className="h-4 w-4 mr-2" />
            Excel Multi-Planilhas (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcelHTML}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel HTML (.xls)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Other Formats */}
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">Outros Formatos</div>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileText className="h-4 w-4 mr-2" />
            CSV (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportText}>
            <File className="h-4 w-4 mr-2" />
            Texto (.txt)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Info about browser compatibility */}
      <div className="text-xs text-gray-500 flex items-center ml-2">
        <AlertTriangle className="h-3 w-3 mr-1" />
        <span className="hidden md:inline">Compatível com todos os navegadores</span>
      </div>
    </div>
  )
}
