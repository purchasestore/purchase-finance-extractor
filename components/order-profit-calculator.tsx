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
import { AlertCircle, CheckCircle, Info, FileSpreadsheet } from "lucide-react"
import { processOrderData, processZipFiles } from "@/app/actions"

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
  const [zipFile, setZipFile] = useState<File | null>(null)
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

      const result = await processOrderData(formData)

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

  const handleProcessZip = async () => {
    if (!zipFile) {
      setError("Por favor, selecione um arquivo ZIP")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessedData(null)
    setMissingCosts([])
    setCostMatchingStats(null)

    try {
      setProcessingStage("Processando arquivo ZIP...")

      const formData = new FormData()
      formData.append("zipFile", zipFile)

      const result = await processZipFiles(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setProcessedData(result.data || [])
        setMissingCosts(result.missingCosts || [])
        setCostMatchingStats(result.costMatchingStats || null)
      }
    } catch (err) {
      setError("Erro inesperado durante o processamento do ZIP")
      console.error(err)
    } finally {
      setIsProcessing(false)
      setProcessingStage("")
    }
  }

  const handleReset = () => {
    setOrderFile(null)
    setCostFile(null)
    setZipFile(null)
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
    <div className="space-y-8">
      <Tabs defaultValue="calculator" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/70 backdrop-blur-sm border-0 shadow-lg p-1">
            <TabsTrigger 
              value="calculator" 
              className="font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Calculadora de Lucros
            </TabsTrigger>
            <TabsTrigger 
              value="cost-reference"
              className="font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Tabela de Custos
            </TabsTrigger>
          </TabsList>
        </div>

      <TabsContent value="calculator" className="space-y-8">
        {/* File Upload Section */}
        <FileUploadZone
          orderFile={orderFile}
          costFile={costFile}
          zipFile={zipFile}
          onOrderFileChange={setOrderFile}
          onCostFileChange={setCostFile}
          onZipFileChange={setZipFile}
          onProcess={handleProcess}
          onProcessZip={handleProcessZip}
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
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl animate-in fade-in-50 slide-in-from-top-5 duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-poppins font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
                Estatísticas de Correspondência de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{costMatchingStats.totalSKUs}</div>
                  <div className="text-sm font-medium text-blue-700 mt-1">Total SKUs</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{costMatchingStats.exactMatches}</div>
                  <div className="text-sm font-medium text-green-700 mt-1">Exatas</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">{costMatchingStats.partialMatches}</div>
                  <div className="text-sm font-medium text-yellow-700 mt-1">Parciais</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">{costMatchingStats.fuzzyMatches}</div>
                  <div className="text-sm font-medium text-orange-700 mt-1">Similares</div>
                </div>
                <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold font-poppins bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{costMatchingStats.noMatches}</div>
                  <div className="text-sm font-medium text-red-700 mt-1">Sem Match</div>
                </div>
              </div>
              <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-2xl font-bold font-poppins bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                  Eficiência: {getMatchingEfficiency().toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {costFile ? "📊 Usando arquivo de custos fornecido" : "⚙️ Usando dados de custo fixos internos"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Costs Warning */}
        {missingCosts.length > 0 && (
          <Alert className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <AlertTitle className="text-amber-800 font-poppins font-semibold text-lg ml-12 -mt-10">SKUs sem dados de custo</AlertTitle>
            <AlertDescription className="text-amber-700 ml-12 mt-2">
              <div className="mb-3 font-medium">{missingCosts.length} SKUs não possuem dados de custo:</div>
              <div className="text-xs font-mono bg-white/60 backdrop-blur-sm p-4 rounded-lg max-h-32 overflow-y-auto border border-amber-200/50">
                {missingCosts.slice(0, 10).join(", ")}
                {missingCosts.length > 10 && ` ... e mais ${missingCosts.length - 10} SKUs`}
              </div>
              <div className="mt-4 p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-amber-200/50">
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <div>
                    <strong className="text-amber-800">Dica:</strong>
                    <span className="text-amber-700"> Verifique se os SKUs na planilha de pedidos correspondem exatamente aos SKUs na planilha de custos ou na tabela de referência.</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {processedData && (
          <Alert className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl animate-in fade-in-50 slide-in-from-top-5 duration-500">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <AlertTitle className="text-green-800 font-poppins font-semibold text-lg ml-12 -mt-10">Processamento Concluído ✨</AlertTitle>
            <AlertDescription className="text-green-700 ml-12 mt-2">
              <div className="text-base font-medium mb-2">
                🎉 {processedData.length} pedidos processados com sucesso!
              </div>
              {costMatchingStats && (
                <div className="p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-green-200/50">
                  <span className="font-medium">📊 Correspondência de custos:</span> {getMatchingEfficiency().toFixed(1)}% de eficiência.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {processedData && (
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-poppins font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-white" />
                    </div>
                    Dados Processados
                  </CardTitle>
                  <ExportOptions data={processedData} />
                </div>
              </CardHeader>
              <CardContent>
                <DataTable data={processedData} />
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="cost-reference">
        <CostReferenceTab />
      </TabsContent>
    </Tabs>
    </div>
  )
}
