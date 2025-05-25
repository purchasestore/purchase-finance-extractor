import * as XLSX from "xlsx"
import type { ProcessedOrder } from "@/components/order-profit-calculator"

export interface ExcelExportOptions {
  includeFormatting?: boolean
  includeFormulas?: boolean
  sheetName?: string
  filename?: string
}

// Helper function to download blob (browser-compatible)
function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

// Browser-compatible Excel write function
function writeExcelFile(workbook: XLSX.WorkBook, filename: string) {
  try {
    // Write workbook to array buffer (browser-compatible)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    downloadBlob(blob, filename)
    return true
  } catch (error) {
    console.error("Error writing Excel file:", error)
    throw error
  }
}

// Function to organize data with ALL original fields first, then calculated fields
function organizeDataForExcel(data: ProcessedOrder[]) {
  return data.map((row) => {
    const { _hasError, _errorMessage, ...cleanRow } = row

    // Create organized row with ALL original data first, then ONLY new calculated fields
    const organizedRow: any = {}

    // ORIGINAL DATA (ALL fields from input spreadsheet) - LEFT SIDE
    // Keep all original fields exactly as they were in the input
    organizedRow["Número do produto"] = cleanRow["Número do produto"]
    organizedRow["Nome do produto"] = cleanRow["Nome do produto"]
    organizedRow["Preço do produto"] = cleanRow["Preço do produto"]
    organizedRow["Valor do cupom"] = cleanRow["Valor do cupom"]
    organizedRow["Comissão"] = cleanRow["Comissão"]
    organizedRow["Receita estimada de mercadorias"] = cleanRow["Receita estimada de mercadorias"]

    // NEW CALCULATED FIELDS (business logic additions) - RIGHT SIDE
    organizedRow["Peças"] = cleanRow["Peças"]
    organizedRow["Frete"] = cleanRow["Frete"]
    organizedRow["A receber final"] = cleanRow["A receber final"]
    organizedRow["Custo"] = cleanRow["Custo"]
    organizedRow["Margem de contribuição"] = cleanRow["Margem de contribuição"]
    organizedRow["Lucro Bruto"] = cleanRow["Lucro Bruto"]

    return organizedRow
  })
}

export function exportToExcelAdvanced(data: ProcessedOrder[], options: ExcelExportOptions = {}) {
  try {
    const {
      includeFormatting = true,
      includeFormulas = false,
      sheetName = "Pedidos Processados",
      filename = "pedidos_processados.xlsx",
    } = options

    if (data.length === 0) {
      throw new Error("Não há dados para exportar")
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Organize data with original fields first, then calculated fields
    const organizedData = organizeDataForExcel(data)

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(organizedData)

    // Set column widths - adjusted for the new structure
    const columnWidths = [
      // ORIGINAL DATA COLUMNS
      { wch: 20 }, // Número do produto
      { wch: 40 }, // Nome do produto
      { wch: 15 }, // Preço do produto
      { wch: 12 }, // Valor do cupom
      { wch: 12 }, // Comissão
      { wch: 18 }, // Receita estimada de mercadorias
      { wch: 8 }, // Peças
      { wch: 8 }, // Frete
      { wch: 15 }, // A receber final
      { wch: 15 }, // Custo
      { wch: 18 }, // Margem de contribuição
      { wch: 12 }, // Lucro Bruto
    ]
    worksheet["!cols"] = columnWidths

    // Add formatting if requested
    if (includeFormatting) {
      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")

      // Format header row
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col })
        if (worksheet[headerCell]) {
          // Different colors for original vs calculated sections
          let headerColor = "#366092" // Default blue
          if (col <= 5) {
            headerColor = "#2E5984" // Darker blue for original data
          } else {
            headerColor = "#4A90A4" // Teal for calculated fields
          }

          worksheet[headerCell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: headerColor.replace("#", "") } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          }
        }
      }

      // Add section headers
      const sectionHeaderRow = ["DADOS ORIGINAIS", "", "", "", "", "", "CAMPOS CALCULADOS", "", "", "", "", ""]

      // Insert section headers at row 0 (push existing data down)
      XLSX.utils.sheet_add_aoa(worksheet, [sectionHeaderRow], { origin: "A1" })

      // Merge cells for section headers
      if (!worksheet["!merges"]) worksheet["!merges"] = []
      worksheet["!merges"].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Original data header
        { s: { r: 0, c: 6 }, e: { r: 0, c: 11 } }, // Calculated fields header
      )

      // Format section headers
      const sectionHeaderStyle = {
        font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F4E79" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
        },
      }

      // Apply section header styles
      for (let col = 0; col <= 5; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = sectionHeaderStyle
        }
      }

      for (let col = 7; col <= 12; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = sectionHeaderStyle
        }
      }

      // Format separator column
      const separatorCellAddress = XLSX.utils.encode_cell({ r: 0, c: 6 })
      if (worksheet[separatorCellAddress]) {
        worksheet[separatorCellAddress].s = {
          fill: { fgColor: { rgb: "F0F0F0" } },
          border: {
            left: { style: "medium", color: { rgb: "CCCCCC" } },
            right: { style: "medium", color: { rgb: "CCCCCC" } },
          },
        }
      }

      // Update range to account for the new header row
      const newRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
      newRange.e.r += 1 // Add one more row

      // Format monetary columns
      const originalMonetaryColumns = [2, 3, 4, 5] // Original data monetary columns
      const calculatedMonetaryColumns = [8, 9, 10, 11] // Calculated monetary columns

      for (let row = 2; row <= newRange.e.r; row++) {
        // Format original data monetary columns
        for (const col of originalMonetaryColumns) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === "number") {
            worksheet[cellAddress].z = '"R$ "#,##0.00'
            worksheet[cellAddress].s = {
              alignment: { horizontal: "right" },
              fill: { fgColor: { rgb: "F8F9FA" } },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            }
          }
        }

        // Format calculated monetary columns
        for (const col of calculatedMonetaryColumns) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === "number") {
            worksheet[cellAddress].z = '"R$ "#,##0.00'
            worksheet[cellAddress].s = {
              alignment: { horizontal: "right" },
              fill: { fgColor: { rgb: "F0F8FF" } },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            }
          }
        }

        // Format text columns (original data)
        const textColumns = [0, 1] // SKU and Nome do Produto
        for (const col of textColumns) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              alignment: { horizontal: "left", vertical: "center" },
              fill: { fgColor: { rgb: "F8F9FA" } },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            }
          }
        }

        // Format center columns (Peças)
        const centerColumns = [6] // Peças
        for (const col of centerColumns) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              alignment: { horizontal: "center", vertical: "center" },
              fill: { fgColor: { rgb: "F0F8FF" } },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            }
          }
        }
      }
    }

    // Add formulas if requested
    if (includeFormulas && data.length > 0) {
      // Add summary row
      const summaryRowIndex = data.length + 3 // Account for section headers

      // Add summary labels and formulas
      const summaryData = [
        ["", "", "", "", "", "TOTAIS:", "", "", "", "", "", "", ""],
        [
          "",
          "",
          "",
          "",
          "",
          `=SUM(F3:F${data.length + 2})`, // Receita estimada total
          "",
          "",
          `=SUM(I3:I${data.length + 2})`, // A Receber Final total
          "",
          `=SUM(K3:K${data.length + 2})`, // Margem de Contribuição total
          `=SUM(L3:L${data.length + 2})`, // Lucro Bruto total
        ],
      ]

      // Add summary rows to worksheet
      XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: `A${summaryRowIndex}` })
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Set workbook properties
    workbook.Props = {
      Title: "Relatório de Pedidos Processados - Dados Originais + Calculados",
      Subject: "Análise de Lucros e Custos com Separação de Dados",
      Author: "Order Profit Calculator",
      CreatedDate: new Date(),
    }

    // Write file using browser-compatible method
    writeExcelFile(workbook, filename)

    console.log(`Excel file exported successfully: ${filename}`)
    return true
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    throw error
  }
}

// Simple Excel export with organized structure
export function exportToExcelSimple(data: ProcessedOrder[], filename = "pedidos_processados.xlsx") {
  try {
    if (data.length === 0) {
      throw new Error("Não há dados para exportar")
    }

    // Organize data with original fields first, then calculated fields
    const organizedData = organizeDataForExcel(data)

    // Create worksheet directly from organized data
    const worksheet = XLSX.utils.json_to_sheet(organizedData)

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Número do produto
      { wch: 40 }, // Nome do produto
      { wch: 15 }, // Preço do produto
      { wch: 12 }, // Valor do cupom
      { wch: 12 }, // Comissão
      { wch: 18 }, // Receita estimada
      { wch: 8 }, // Peças
      { wch: 8 }, // Frete
      { wch: 15 }, // A receber final
      { wch: 15 }, // Custo
      { wch: 18 }, // Margem de contribuição
      { wch: 12 }, // Lucro bruto
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos")

    // Write file using browser-compatible method
    writeExcelFile(workbook, filename)

    console.log(`Simple Excel file exported successfully: ${filename}`)
    return true
  } catch (error) {
    console.error("Error in simple Excel export:", error)
    throw error
  }
}

// Excel export with multiple sheets - all using organized structure
export function exportToExcelMultiSheet(data: ProcessedOrder[], filename = "relatorio_completo.xlsx") {
  try {
    if (data.length === 0) {
      throw new Error("Não há dados para exportar")
    }

    const workbook = XLSX.utils.book_new()

    // Organize data
    const organizedData = organizeDataForExcel(data)

    // Sheet 1: All data with organized structure
    const allDataSheet = XLSX.utils.json_to_sheet(organizedData)
    allDataSheet["!cols"] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 8 },
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(workbook, allDataSheet, "Todos os Dados")

    // Sheet 2: Summary statistics
    const summaryData = [
      ["RESUMO GERAL", ""],
      ["", ""],
      ["Métrica", "Valor"],
      ["Total de Pedidos", data.length],
      ["", ""],
      ["DADOS ORIGINAIS", ""],
      [
        "Total Receita Estimada",
        data.reduce(
          (sum, row) =>
            sum +
            (typeof row["Receita estimada de mercadorias"] === "number" ? row["Receita estimada de mercadorias"] : 0),
          0,
        ),
      ],
      [
        "Total Comissões",
        data.reduce((sum, row) => sum + (typeof row["Comissão"] === "number" ? row["Comissão"] : 0), 0),
      ],
      ["", ""],
      ["CAMPOS CALCULADOS", ""],
      [
        "Total a Receber Final",
        data.reduce((sum, row) => sum + (typeof row["A receber final"] === "number" ? row["A receber final"] : 0), 0),
      ],
      [
        "Total Margem de Contribuição",
        data.reduce(
          (sum, row) => sum + (typeof row["Margem de contribuição"] === "number" ? row["Margem de contribuição"] : 0),
          0,
        ),
      ],
      [
        "Total Lucro Bruto",
        data.reduce((sum, row) => sum + (typeof row["Lucro Bruto"] === "number" ? row["Lucro Bruto"] : 0), 0),
      ],
      ["", ""],
      ["ANÁLISE DE CUSTOS", ""],
      ["SKUs com Custo", data.filter((row) => typeof row["Custo"] === "number").length],
      ["SKUs sem Custo", data.filter((row) => typeof row["Custo"] === "string").length],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo")

    // Sheet 3: Only items with costs (organized structure)
    const itemsWithCosts = data.filter((row) => typeof row["Custo"] === "number")
    if (itemsWithCosts.length > 0) {
      const organizedCostsData = organizeDataForExcel(itemsWithCosts)
      const costsSheet = XLSX.utils.json_to_sheet(organizedCostsData)
      costsSheet["!cols"] = allDataSheet["!cols"]
      XLSX.utils.book_append_sheet(workbook, costsSheet, "Com Custos")
    }

    // Sheet 4: Items without costs (organized structure)
    const itemsWithoutCosts = data.filter((row) => typeof row["Custo"] === "string")
    if (itemsWithoutCosts.length > 0) {
      const organizedNoCostsData = organizeDataForExcel(itemsWithoutCosts)
      const noCostsSheet = XLSX.utils.json_to_sheet(organizedNoCostsData)
      noCostsSheet["!cols"] = allDataSheet["!cols"]
      XLSX.utils.book_append_sheet(workbook, noCostsSheet, "Sem Custos")
    }

    // Sheet 5: Original data only (for reference)
    const originalDataOnly = data.map((row) => ({
      "Número do produto": row["Número do produto"],
      "Nome do produto": row["Nome do produto"],
      "Preço do produto": row["Preço do produto"],
      "Valor do cupom": row["Valor do cupom"],
      Comissão: row["Comissão"],
      "Receita estimada de mercadorias": row["Receita estimada de mercadorias"],
    }))

    const originalSheet = XLSX.utils.json_to_sheet(originalDataOnly)
    originalSheet["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(workbook, originalSheet, "Dados Originais")

    // Write file using browser-compatible method
    writeExcelFile(workbook, filename)

    console.log(`Multi-sheet Excel file exported successfully: ${filename}`)
    return true
  } catch (error) {
    console.error("Error in multi-sheet Excel export:", error)
    throw error
  }
}

// Excel export using HTML table (fallback) - with organized structure
export function exportToExcelHTML(data: ProcessedOrder[], filename = "pedidos_processados.xls") {
  try {
    if (data.length === 0) {
      throw new Error("Não há dados para exportar")
    }

    // Organize data
    const organizedData = organizeDataForExcel(data)
    const headers = Object.keys(organizedData[0] || {})

    // Create HTML table format that Excel can read
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Excel.Sheet">
          <meta name="Generator" content="Microsoft Excel 15">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; white-space: nowrap; }
            .original-header { background-color: #2E5984; color: white; font-weight: bold; }
            .calculated-header { background-color: #4A90A4; color: white; font-weight: bold; }
            .separator-header { background-color: #E5E5E5; color: #666; }
            .number { text-align: right; }
            .original-data { background-color: #F8F9FA; }
            .calculated-data { background-color: #F0F8FF; }
            .separator-col { background-color: #F0F0F0; width: 20px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th colspan="6" style="background-color: #1F4E79; color: white; text-align: center; font-size: 14px;">DADOS ORIGINAIS</th>
                <th colspan="6" style="background-color: #1F4E79; color: white; text-align: center; font-size: 14px;">CAMPOS CALCULADOS</th>
              </tr>
              <tr>
                ${headers
                  .map((header, index) => {
                    if (index <= 5) {
                      return `<th class="original-header">${header}</th>`
                    } else {
                      return `<th class="calculated-header">${header}</th>`
                    }
                  })
                  .join("")}
              </tr>
            </thead>
            <tbody>
    `

    organizedData.forEach((row) => {
      htmlContent += "<tr>"
      headers.forEach((header, index) => {
        const value = row[header]
        const isNumber = typeof value === "number"
        const cellValue = value === null || value === undefined ? "" : String(value)

        let cellClass = ""
        if (index <= 5) {
          cellClass = isNumber ? "number original-data" : "original-data"
        } else {
          cellClass = isNumber ? "number calculated-data" : "calculated-data"
        }

        htmlContent += `<td class="${cellClass}">${cellValue}</td>`
      })
      htmlContent += "</tr>"
    })

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `

    // Create and download
    const blob = new Blob([htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })

    downloadBlob(blob, filename)
    console.log("Excel HTML file exported successfully")
    return true
  } catch (error) {
    console.error("Error in HTML Excel export:", error)
    throw error
  }
}

// Fallback CSV export with organized structure
export function exportToCSVFallback(data: ProcessedOrder[], filename = "pedidos_processados.csv") {
  try {
    if (data.length === 0) {
      throw new Error("Não há dados para exportar")
    }

    // Organize data
    const organizedData = organizeDataForExcel(data)
    const headers = Object.keys(organizedData[0])

    // Create CSV content with section headers
    const csvContent = [
      // Add BOM for proper UTF-8 encoding in Excel
      "\uFEFF",
      // Section headers
      '"DADOS ORIGINAIS","","","","","","CAMPOS CALCULADOS","","","","",""',
      // Column headers
      headers
        .map((header) => `"${header}"`)
        .join(","),
      // Data rows
      ...organizedData.map((row) =>
        headers
          .map((header) => {
            let value = row[header]

            // Convert to string and handle special characters
            if (value === null || value === undefined) {
              value = ""
            } else {
              value = String(value)
            }

            // Always wrap in quotes for CSV safety
            return `"${value.replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    downloadBlob(blob, filename)
    console.log("CSV file exported successfully")
    return true
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    throw error
  }
}
