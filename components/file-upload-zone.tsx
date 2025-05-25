"use client"

import type React from "react"

import { useRef } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FileUploadZoneProps {
  orderFile: File | null
  costFile: File | null
  onOrderFileChange: (file: File | null) => void
  onCostFileChange: (file: File | null) => void
  onProcess: () => void
  onReset: () => void
  isProcessing: boolean
}

export function FileUploadZone({
  orderFile,
  costFile,
  onOrderFileChange,
  onCostFileChange,
  onProcess,
  onReset,
  isProcessing,
}: FileUploadZoneProps) {
  const orderFileRef = useRef<HTMLInputElement>(null)
  const costFileRef = useRef<HTMLInputElement>(null)

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

  const handleDrop = (e: React.DragEvent, type: "order" | "cost") => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith(".xlsx")) {
      if (type === "order") {
        onOrderFileChange(file)
      } else {
        onCostFileChange(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Order File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arquivo de Pedidos (Obrigatório)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={(e) => handleDrop(e, "order")}
            onDragOver={handleDragOver}
            onClick={() => orderFileRef.current?.click()}
          >
            {orderFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-8 w-8 text-green-500" />
                <p className="text-sm font-medium">{orderFile.name}</p>
                <Button
                  variant="outline"
                  size="sm"
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
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">Clique ou arraste o arquivo de pedidos (.xlsx)</p>
                <p className="text-xs text-gray-500">Deve conter: Número do produto, Preço do produto, etc.</p>
              </div>
            )}
          </div>
          <input ref={orderFileRef} type="file" accept=".xlsx" className="hidden" onChange={handleOrderFileChange} />
        </CardContent>
      </Card>

      {/* Cost File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arquivo de Custos (Opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={(e) => handleDrop(e, "cost")}
            onDragOver={handleDragOver}
            onClick={() => costFileRef.current?.click()}
          >
            {costFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium">{costFile.name}</p>
                <Button
                  variant="outline"
                  size="sm"
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
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">Clique ou arraste o arquivo de custos (.xlsx)</p>
                <p className="text-xs text-gray-500">Deve conter: SKU, Custo Unitário</p>
              </div>
            )}
          </div>
          <input ref={costFileRef} type="file" accept=".xlsx" className="hidden" onChange={handleCostFileChange} />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex justify-center gap-4">
        <Button onClick={onProcess} disabled={!orderFile || isProcessing} size="lg" className="min-w-32">
          {isProcessing ? "Processando..." : "Processar Dados"}
        </Button>

        {(orderFile || costFile) && (
          <Button variant="outline" onClick={onReset} disabled={isProcessing} size="lg">
            Limpar Tudo
          </Button>
        )}
      </div>
    </div>
  )
}
