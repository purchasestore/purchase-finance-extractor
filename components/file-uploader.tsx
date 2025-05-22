"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { processExcelFile } from "@/app/actions"
import { DataPreview } from "@/components/data-preview"
import { ProcessingSteps, type ProcessingStep } from "@/components/processing-steps"

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Define processing steps
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: "upload", label: "Enviando arquivo", status: "pending" },
    { id: "validate", label: "Validando estrutura da planilha", status: "pending" },
    { id: "process", label: "Aplicando transformações", status: "pending" },
    { id: "generate", label: "Gerando planilha processada", status: "pending" },
  ])

  // Update processing step status
  const updateStepStatus = (stepId: string, status: "pending" | "processing" | "completed") => {
    setProcessingSteps((prevSteps) => prevSteps.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  // Reset all states
  const resetStates = () => {
    setError(null)
    setPreviewData(null)
    setProcessedFileUrl(null)
    setUploadProgress(0)
    setProcessingStage(null)
    setProcessingComplete(false)
    setProcessingSteps(processingSteps.map((step) => ({ ...step, status: "pending" })))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    processSelectedFile(selectedFile)
  }

  const processSelectedFile = (selectedFile: File | undefined) => {
    resetStates()

    if (!selectedFile) {
      return
    }

    if (!selectedFile.name.endsWith(".xlsx")) {
      setError("Por favor, selecione um arquivo Excel (.xlsx)")
      return
    }

    setFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    processSelectedFile(droppedFile)
  }

  const simulateProgress = () => {
    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval)
          return prevProgress
        }
        return prevProgress + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Por favor, selecione um arquivo para processar")
      return
    }

    setIsUploading(true)
    setError(null)
    setProcessingComplete(false)

    // Start progress simulation
    const clearProgressSimulation = simulateProgress()

    try {
      // Update processing steps
      updateStepStatus("upload", "processing")

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const formData = new FormData()
      formData.append("file", file)

      // Complete upload step
      updateStepStatus("upload", "completed")
      setUploadProgress(100)

      // Start validation step
      updateStepStatus("validate", "processing")
      await new Promise((resolve) => setTimeout(resolve, 800))

      const response = await processExcelFile(formData)

      if (response.error) {
        setError(response.error)
        // Reset processing steps on error
        setProcessingSteps(processingSteps.map((step) => ({ ...step, status: "pending" })))
      } else {
        // Complete validation step
        updateStepStatus("validate", "completed")

        // Start processing step
        updateStepStatus("process", "processing")
        await new Promise((resolve) => setTimeout(resolve, 1200))
        updateStepStatus("process", "completed")

        // Start generation step
        updateStepStatus("generate", "processing")
        await new Promise((resolve) => setTimeout(resolve, 800))
        updateStepStatus("generate", "completed")

        // Set data and complete
        setPreviewData(response.previewData)
        setProcessedFileUrl(response.fileUrl)
        setProcessingComplete(true)
      }
    } catch (err) {
      setError("Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.")
      console.error(err)
    } finally {
      clearProgressSimulation()
      setIsUploading(false)
    }
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Scroll to preview when processing is complete
  useEffect(() => {
    if (processingComplete && previewData) {
      const previewElement = document.getElementById("data-preview")
      if (previewElement) {
        setTimeout(() => {
          previewElement.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 500)
      }
    }
  }, [processingComplete, previewData])

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
              <div
                className="flex items-center justify-center w-full"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  onClick={openFileSelector}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                    isDragging ? "border-primary" : "border-dashed"
                  } rounded-lg cursor-pointer ${
                    isDragging ? "bg-primary/10" : "bg-muted/50 hover:bg-muted"
                  } transition-colors duration-200`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">Apenas arquivos Excel (.xlsx)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!file || isUploading} className="relative">
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Processando...</span>
                  </span>
                ) : (
                  "Processar Planilha"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isUploading && (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-medium">Processando planilha</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>

            <ProcessingSteps steps={processingSteps} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {processingComplete && (
        <Alert className="bg-green-50 border-green-200 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Processamento concluído</AlertTitle>
          <AlertDescription className="text-green-600">
            A planilha foi processada com sucesso. Você pode visualizar os dados abaixo e baixar o arquivo processado.
          </AlertDescription>
        </Alert>
      )}

      {previewData && previewData.length > 0 && (
        <div id="data-preview" className="space-y-4 animate-in fade-in-50 duration-500">
          <h2 className="text-xl font-semibold">Prévia dos Dados Processados</h2>
          <DataPreview data={previewData} />

          {processedFileUrl && (
            <div className="flex justify-end">
              <Button asChild className="group">
                <a href={processedFileUrl} download="planilha_processada.xlsx" className="flex items-center gap-2">
                  <span>Baixar Planilha Processada</span>
                  <span className="inline-block transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5">
                    ↓
                  </span>
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
