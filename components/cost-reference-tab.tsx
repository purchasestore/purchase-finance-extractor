"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Copy, FileSpreadsheet, FileText } from "lucide-react"
import { formatBrazilianCurrency } from "@/lib/currency-utils"
import { exportToCSV, exportToExcelHTML } from "@/lib/export-utils"

const COST_DATA = [
  { SKU: "CONJ-TRANSPASSADO-TOP-", "Custo Unitário": 22 },
  { SKU: "CONJ-BUTTERFLY-TOP-SAIA-", "Custo Unitário": 14 },
  { SKU: "CONJ-BUTTERFLY-TOP-SAIA", "Custo Unitário": 14 },
  { SKU: "Vestido-Agua-Viva", "Custo Unitário": 15 },
  { SKU: "1Vestido-Agua-Viva-", "Custo Unitário": 15 },
  { SKU: "1Vestido-Agua-Viva", "Custo Unitário": 15 },
  { SKU: "3Vestido-Agua-Viva-", "Custo Unitário": 15 },
  { SKU: "VESTIDO-ARO-", "Custo Unitário": 18 },
  { SKU: "VEST-CURTINHO-RIBANA-", "Custo Unitário": 15 },
  { SKU: "VEST-RIBANA-FECHADO-ALCINHA-", "Custo Unitário": 15 },
  { SKU: "VEST-ALCINHA-FENDA-RIBANA-", "Custo Unitário": 15 },
  { SKU: "VEST-TOMAQUECAIA-LONGO-", "Custo Unitário": 15 },
  { SKU: "Vest-Longo-Bojo-Romano-", "Custo Unitário": 18 },
  { SKU: "VEST-ROMANOO-", "Custo Unitário": 18 },
  { SKU: "REGATA-INFLUENCER-", "Custo Unitário": 10 },
  { SKU: "CONJ-FEND-TOP", "Custo Unitário": 18 },
  { SKU: "Vest-Longo-Bojo-Romano", "Custo Unitário": 18 },
  { SKU: "CROPPED-RIBANINHA-", "Custo Unitário": 6 },
  { SKU: "MAC-SEM-MANGA", "Custo Unitário": 15 },
  { SKU: "VESTIDO-MIDI-", "Custo Unitário": 16.5 },
  { SKU: "CONJ-BADDIE-", "Custo Unitário": 18 },
  { SKU: "VESTIDO-VEGAS", "Custo Unitário": 18 },
  { SKU: "CONJ-TRANSPASSADO-", "Custo Unitário": 18 },
  { SKU: "MACACAO-MANG-COMPRID-TUMBLR", "Custo Unitário": 22 },
  { SKU: "VESTIDO-TUBO-ALCINHA-", "Custo Unitário": 14 },
  { SKU: "VEST-TOP-SAIIA-", "Custo Unitário": 16 },
  { SKU: "CROPPED-RIBANINHA-", "Custo Unitário": 16 },
  { SKU: "stillVEST-LONG-TOP-SAI-FEND", "Custo Unitário": 16 },
  { SKU: "1stillVEST-LONG-TOP-SAI-FEND", "Custo Unitário": 16 },
  { SKU: "VEST-TOMAQUECAIA-LONGO-", "Custo Unitário": 18 },
  { SKU: "TOP-DECOTADO-FAIXA", "Custo Unitário": 11 },
  { SKU: "VEST-LONG-TOP-SAI-FEND", "Custo Unitário": 18 },
  { SKU: "VEST-LONGo-TOP-SAI", "Custo Unitário": 18 },
  { SKU: "VEST-LONG-TOP-SAI-FEND-", "Custo Unitário": 18 },
  { SKU: "1VEST-LONG-TOP-SAI-FEND-", "Custo Unitário": 18 },
  { SKU: "CONJ-AFRODITE-TOP-ASSIMET-", "Custo Unitário": 18 },
  { SKU: "MAC-MANGA-LONG-FRANZIDO-", "Custo Unitário": 18 },
  { SKU: "MAC-SABONETEIRA", "Custo Unitário": 18 },
  { SKU: "VESTIDO-MADRID-", "Custo Unitário": 16 },
  { SKU: "VESTIDO-ELEGANTE-MANGA-", "Custo Unitário": 18 },
  { SKU: "CONJ-BADDIE", "Custo Unitário": 18 },
  { SKU: "CROPPED-DECOTADO-", "Custo Unitário": 10 },
]

export function CostReferenceTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  // Filter data based on search term
  const filteredData = searchTerm
    ? COST_DATA.filter((item) => item.SKU.toLowerCase().includes(searchTerm.toLowerCase()))
    : COST_DATA

  // Calculate statistics
  const totalSKUs = COST_DATA.length
  const averageCost = COST_DATA.reduce((sum, item) => sum + item["Custo Unitário"], 0) / totalSKUs
  const minCost = Math.min(...COST_DATA.map((item) => item["Custo Unitário"]))
  const maxCost = Math.max(...COST_DATA.map((item) => item["Custo Unitário"]))

  const handleDownloadExcel = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      console.log("Exporting cost data to Excel...")
      exportToExcelHTML(COST_DATA as any, "tabela_custos_referencia.xlsx")
      console.log("Excel export completed")
    } catch (error) {
      console.error("Error downloading Excel:", error)
      alert("Erro ao baixar Excel. Tentando CSV...")
      exportToCSV(COST_DATA as any, "tabela_custos_referencia.csv")
    } finally {
      setTimeout(() => setIsExporting(false), 1000)
    }
  }

  const handleDownloadCSV = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      console.log("Exporting cost data to CSV...")
      exportToCSV(COST_DATA as any, "tabela_custos_referencia.csv")
      console.log("CSV export completed")
    } catch (error) {
      console.error("Error downloading CSV:", error)
      alert("Erro ao baixar CSV")
    } finally {
      setTimeout(() => setIsExporting(false), 1000)
    }
  }

  const handleCopyData = async () => {
    if (isExporting) return
    setIsExporting(true)

    const csvContent = ["SKU,Custo Unitário", ...COST_DATA.map((item) => `${item.SKU},${item["Custo Unitário"]}`)].join(
      "\n",
    )

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(csvContent)
        alert("Dados copiados para a área de transferência!")
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(csvContent)
      }
    } catch (error) {
      console.error("Error copying data:", error)
      fallbackCopyTextToClipboard(csvContent)
    } finally {
      setTimeout(() => setIsExporting(false), 500)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"
    textArea.style.opacity = "0"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        alert("Dados copiados para a área de transferência!")
      } else {
        alert("Erro ao copiar dados. Tente novamente.")
      }
    } catch (err) {
      console.error("Fallback copy failed:", err)
      alert("Erro ao copiar dados. Seu navegador pode não suportar esta funcionalidade.")
    }

    document.body.removeChild(textArea)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Tabela de Custos de Referência</h2>
          <p className="text-muted-foreground">
            Dados de custo fixos para {totalSKUs} SKUs diferentes. Use esta tabela como referência ou baixe para usar
            como arquivo de custos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyData} disabled={isExporting}>
            <Copy className="h-4 w-4 mr-2" />
            {isExporting ? "Copiando..." : "Copiar"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "CSV"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadExcel} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Excel"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSKUs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBrazilianCurrency(averageCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatBrazilianCurrency(minCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatBrazilianCurrency(maxCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-gray-500">
          {filteredData.length} de {totalSKUs} SKUs
        </span>
      </div>

      {/* Cost Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background">SKU</TableHead>
                  <TableHead className="sticky top-0 bg-background text-right">Custo Unitário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{item.SKU}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatBrazilianCurrency(item["Custo Unitário"])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Como usar esta tabela</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>
              • <strong>Referência:</strong> Use para consultar custos de SKUs específicos
            </li>
            <li>
              • <strong>Download:</strong> Baixe como Excel ou CSV para usar como arquivo de custos no processamento de
              pedidos
            </li>
            <li>
              • <strong>Copiar:</strong> Copie os dados em formato CSV para usar em outras ferramentas
            </li>
            <li>
              • <strong>Busca:</strong> Use o campo de busca para encontrar rapidamente SKUs específicos
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
