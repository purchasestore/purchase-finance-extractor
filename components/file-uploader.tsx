"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { processExcelFile } from "@/app/actions"
import { DataPreview } from "@/components/data-preview"

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setPreviewData(null)
    setProcessedFileUrl(null)

    if (!selectedFile) {
      return
    }

    if (!selectedFile.name.endsWith(".xlsx")) {
      setError("Por favor, selecione um arquivo Excel (.xlsx)")
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Por favor, selecione um arquivo para processar")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await processExcelFile(formData)

      if (response.error) {
        setError(response.error)
      } else {
        setPreviewData(response.previewData)
        setProcessedFileUrl(response.fileUrl)
      }
    } catch (err) {
      setError("Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label
                htmlFor="file"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecione a planilha de pedidos SHEIN
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">Apenas arquivos Excel (.xlsx)</p>
                  </div>
                  <input id="file-upload" type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!file || isUploading}>
                {isUploading ? "Processando..." : "Processar Planilha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {previewData && previewData.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Prévia dos Dados Processados</h2>
          <DataPreview data={previewData} />

          {processedFileUrl && (
            <div className="flex justify-end">
              <Button asChild>
                <a href={processedFileUrl} download="planilha_processada.xlsx">
                  Baixar Planilha Processada
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
