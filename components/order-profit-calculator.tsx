"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadZone } from "@/components/file-upload-zone"
import { ProcessingProgress } from "@/components/processing-progress"
import { DataTable } from "@/components/data-table"
import { ExportOptions } from "@/components/export-options"
import { CostReferenceTab } from "@/components/cost-reference-tab"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { processOrderData } from "@/app/actions"

export interface ProcessedOrder {
  "Número do produto": string
  "Nome do produto": string
  "Preço do produto": number
  "Valor do cupom": number
  Comissão: number
  "Receita estimada de mercadorias": number
  Peças: number
  Frete: number
  "A receber final": number
  Custo: number | string
  "Margem de contribuição": number | string
  "Lucro Bruto": number | string
  _hasError?: boolean
  _errorMessage?: string
}

interface CostMatchingStats {
  totalSKUs: number
  exactMatches: number
  partialMatches: number
  fuzzyMatches: number
  noMatches: number
}

export function OrderProfitCalculator() {
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [costFile, setCostFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("")
  const [missingCosts, setMissingCosts] = useState<string[]>([])
  const [costMatchingStats, setCostMatchingStats] = useState<CostMatchingStats | null>(null)

  const handleProcess = async () => {
    if (!orderFile) {
      setError("Por favor, selecione um arquivo de pedidos")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessedData(null)
    setMissingCosts([])
    setCostMatchingStats(null)

    try {
      setProcessingStage("Lendo arquivo de pedidos...")

      const formData = new FormData()
      formData.append("orderFile", orderFile)
      if (costFile) {
        formData.append("costFile", costFile)
      }

      const result = await processOrderData(formData, setProcessingStage)

      if (result.error) {
        setError(result.error)
      } else {
        setProcessedData(result.data || [])
        setMissingCosts(result.missingCosts || [])
        setCostMatchingStats(result.costMatchingStats || null)
      }
    } catch (err) {
      setError("Erro inesperado durante o processamento")
      console.error(err)
    } finally {
      setIsProcessing(false)
      setProcessingStage("")
    }
  }

  const handleReset = () => {
    setOrderFile(null)
    setCostFile(null)
    setProcessedData(null)
    setError(null)
    setMissingCosts([])
    setCostMatchingStats(null)
  }

  const getMatchingEfficiency = () => {
    if (!costMatchingStats) return 0
    const totalMatches =
      costMatchingStats.exactMatches + costMatchingStats.partialMatches + costMatchingStats.fuzzyMatches
    return (totalMatches / costMatchingStats.totalSKUs) * 100
  }

  return (
    <Tabs defaultValue="calculator" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">Calculadora de Lucros</TabsTrigger>
        <TabsTrigger value="cost-reference">Tabela de Custos</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator" className="space-y-6">
        {/* File Upload Section */}
        <FileUploadZone
          orderFile={orderFile}
          costFile={costFile}
          onOrderFileChange={setOrderFile}
          onCostFileChange={setCostFile}
          onProcess={handleProcess}
          onReset={handleReset}
          isProcessing={isProcessing}
        />

        {/* Processing Progress */}
        {isProcessing && <ProcessingProgress stage={processingStage} />}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no Processamento</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cost Matching Statistics */}
        {costMatchingStats && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Estatísticas de Correspondência de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{costMatchingStats.totalSKUs}</div>
                  <div className="text-blue-700">Total SKUs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{costMatchingStats.exactMatches}</div>
                  <div className="text-green-700">Exatas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{costMatchingStats.partialMatches}</div>
                  <div className="text-yellow-700">Parciais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{costMatchingStats.fuzzyMatches}</div>
                  <div className="text-orange-700">Similares</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{costMatchingStats.noMatches}</div>
                  <div className="text-red-700">Sem Match</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-blue-800">
                  Eficiência de Correspondência: {getMatchingEfficiency().toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {costFile ? "Usando arquivo de custos fornecido" : "Usando dados de custo fixos internos"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Costs Warning */}
        {missingCosts.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">SKUs sem dados de custo</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <div className="mb-2">{missingCosts.length} SKUs não possuem dados de custo:</div>
              <div className="text-xs font-mono bg-yellow-100 p-2 rounded max-h-32 overflow-y-auto">
                {missingCosts.slice(0, 10).join(", ")}
                {missingCosts.length > 10 && ` ... e mais ${missingCosts.length - 10} SKUs`}
              </div>
              <div className="mt-2 text-sm">
                💡 <strong>Dica:</strong> Verifique se os SKUs na planilha de pedidos correspondem exatamente aos SKUs
                na planilha de custos ou na tabela de referência.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {processedData && (
          <Alert className="bg-green-50 border-green-200 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Processamento Concluído</AlertTitle>
            <AlertDescription className="text-green-600">
              {processedData.length} pedidos processados com sucesso.
              {costMatchingStats && (
                <span> Correspondência de custos: {getMatchingEfficiency().toFixed(1)}% de eficiência.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {processedData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dados Processados</h2>
              <ExportOptions data={processedData} />
            </div>
            <DataTable data={processedData} />
          </div>
        )}
      </TabsContent>

      <TabsContent value="cost-reference">
        <CostReferenceTab />
      </TabsContent>
    </Tabs>
  )
}
