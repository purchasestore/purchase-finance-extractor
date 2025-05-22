"use server"

import * as XLSX from "xlsx"

export async function processExcelFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { error: "Nenhum arquivo foi enviado" }
    }

    // Convert the file to an array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Read the Excel file
    const workbook = XLSX.read(arrayBuffer)

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON (considering the second row as header)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 1 })

    if (!jsonData || jsonData.length === 0) {
      return { error: "A planilha não contém dados válidos" }
    }

    // Check if required columns exist
    const firstRow = jsonData[0] as any
    if (!firstRow["Número do pedido"] || !firstRow["Receita estimada de mercadorias"]) {
      return { error: "A planilha não contém as colunas necessárias" }
    }

    // Process the data according to the rules
    const processedData = jsonData.map((row: any) => {
      const receitaEstimada = Number.parseFloat(String(row["Receita estimada de mercadorias"]).replace(",", ".")) || 0
      const precoProtudo = Number.parseFloat(String(row["Preço do produto"]).replace(",", ".")) || 0

      // Add new columns
      const frete = 4.0
      const aReceberFinal = receitaEstimada - frete
      const pecas = 1

      // Initialize with empty values
      const custo = ""
      let margemContribuicao = ""
      let lucroBruto = ""

      // If cost is available, calculate contribution margin and gross profit
      if (row["Custo"] && !isNaN(Number.parseFloat(String(row["Custo"]).replace(",", ".")))) {
        const custoValue = Number.parseFloat(String(row["Custo"]).replace(",", "."))
        margemContribuicao = (aReceberFinal - custoValue).toFixed(2)
        lucroBruto = precoProtudo ? (((aReceberFinal - custoValue) / precoProtudo) * 100).toFixed(2) + "%" : "0.00%"
      }

      return {
        ...row,
        Frete: frete.toFixed(2),
        "A Receber Final": aReceberFinal.toFixed(2),
        Peças: pecas,
        Custo: custo,
        "Margem de Contribuição": margemContribuicao || "Aguardando custo",
        "Lucro Bruto (%)": lucroBruto || "Aguardando custo",
      }
    })

    // Create a new workbook with the processed data
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(processedData)

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Dados Processados")

    // Convert the workbook to a buffer
    const excelBuffer = XLSX.write(newWorkbook, { bookType: "xlsx", type: "buffer" })

    // Convert buffer to base64 for browser download
    const base64 = Buffer.from(excelBuffer).toString("base64")
    const fileUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`

    // Return preview data (first 20 rows) and the file URL
    return {
      previewData: processedData.slice(0, 20),
      fileUrl,
    }
  } catch (error) {
    console.error("Error processing Excel file:", error)
    return { error: "Ocorreu um erro ao processar o arquivo" }
  }
}
