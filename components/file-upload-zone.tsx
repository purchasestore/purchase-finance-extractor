"use client"

import type React from "react"

import { useRef } from "react"
import { Upload, FileSpreadsheet, X, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FileUploadZoneProps {
  orderFile: File | null
  costFile: File | null
  zipFile: File | null
  onOrderFileChange: (file: File | null) => void
  onCostFileChange: (file: File | null) => void
  onZipFileChange: (file: File | null) => void
  onProcess: () => void
  onProcessZip: () => void
  onReset: () => void
  isProcessing: boolean
}

export function FileUploadZone({
  orderFile,
  costFile,
  zipFile,
  onOrderFileChange,
  onCostFileChange,
  onZipFileChange,
  onProcess,
  onProcessZip,
  onReset,
  isProcessing,
}: FileUploadZoneProps) {
  const orderFileRef = useRef<HTMLInputElement>(null)
  const costFileRef = useRef<HTMLInputElement>(null)
  const zipFileRef = useRef<HTMLInputElement>(null)

  const handleOrderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".xlsx")) {
      onOrderFileChange(file)
    }
  }

  const handleCostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".xlsx")) {
      onCostFileChange(file)
    }
  }

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".zip")) {
      onZipFileChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent, type: "order" | "cost" | "zip") => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (type === "zip" && file.name.endsWith(".zip")) {
        onZipFileChange(file)
      } else if ((type === "order" || type === "cost") && file.name.endsWith(".xlsx")) {
        if (type === "order") {
          onOrderFileChange(file)
        } else {
          onCostFileChange(file)
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-8">
      {/* ZIP File Upload - Priority Option */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-poppins font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Archive className="h-5 w-5 text-white" />
            </div>
            Arquivo ZIP com Múltiplas Planilhas
          </CardTitle>
          <p className="text-blue-600 font-medium ml-13">
            🚀 Recomendado: Processe várias planilhas de uma vez. Ideal para todos os arquivos de extrato.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-blue-300/50 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-white/40 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/20"
            onDrop={(e) => handleDrop(e, "zip")}
            onDragOver={handleDragOver}
            onClick={() => zipFileRef.current?.click()}
          >
            {zipFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto">
                  <Archive className="h-8 w-8 text-white" />
                </div>
                <p className="text-base font-semibold text-blue-800">{zipFile.name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onZipFileChange(null)
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center mx-auto opacity-70">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-blue-700 mb-1">Clique ou arraste o arquivo ZIP (.zip)</p>
                  <p className="text-sm text-blue-600">Deve conter arquivos Excel (.xlsx) com planilhas de pedidos</p>
                </div>
              </div>
            )}
          </div>
          <input ref={zipFileRef} type="file" accept=".zip" className="hidden" onChange={handleZipFileChange} />
          
          {zipFile && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={onProcessZip} 
                disabled={isProcessing} 
                size="lg" 
                className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando ZIP...
                  </>
                ) : (
                  "⚡ Processar ZIP"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm font-medium">
          <span className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-2 text-gray-600 rounded-full border border-gray-200/50">
            🔄 ou processe arquivos individuais
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order File Upload */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-white" />
            </div>
            Arquivo de Pedidos
            <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Obrigatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50/30 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/30"
            onDrop={(e) => handleDrop(e, "order")}
            onDragOver={handleDragOver}
            onClick={() => orderFileRef.current?.click()}
          >
            {orderFile ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-green-800">{orderFile.name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOrderFileChange(null)
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto opacity-70">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Arquivo de pedidos (.xlsx)</p>
                  <p className="text-xs text-gray-600 mt-1">Número do produto, Preço, etc.</p>
                </div>
              </div>
            )}
          </div>
          <input ref={orderFileRef} type="file" accept=".xlsx" className="hidden" onChange={handleOrderFileChange} />
        </CardContent>
      </Card>

      {/* Cost File Upload */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-poppins font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-white" />
            </div>
            Arquivo de Custos
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Opcional</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/30"
            onDrop={(e) => handleDrop(e, "cost")}
            onDragOver={handleDragOver}
            onClick={() => costFileRef.current?.click()}
          >
            {costFile ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-purple-800">{costFile.name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCostFileChange(null)
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto opacity-70">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Arquivo de custos (.xlsx)</p>
                  <p className="text-xs text-gray-600 mt-1">SKU, Custo Unitário</p>
                </div>
              </div>
            )}
          </div>
          <input ref={costFileRef} type="file" accept=".xlsx" className="hidden" onChange={handleCostFileChange} />
        </CardContent>
      </Card>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-center gap-4">
          <Button 
            onClick={onProcess} 
            disabled={!orderFile || isProcessing} 
            size="lg" 
            className="min-w-40 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              "🚀 Processar Dados"
            )}
          </Button>

          {(orderFile || costFile) && (
            <Button 
              variant="outline" 
              onClick={onReset} 
              disabled={isProcessing} 
              size="lg"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              🗜️ Limpar Tudo
            </Button>
          )}
        </div>
      </div>

      {/* Global Reset Button */}
      {(orderFile || costFile || zipFile) && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onReset} 
            disabled={isProcessing} 
            size="lg"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 font-medium"
          >
            🗑️ Limpar Todos os Arquivos
          </Button>
        </div>
      )}
    </div>
  )
}
