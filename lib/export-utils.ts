import * as XLSX from "xlsx"
import type { ProcessedOrder } from "@/components/order-profit-calculator"

export function exportToExcel(data: ProcessedOrder[], filename: string) {
  try {
    // Clean data for export (remove internal fields)
    const cleanData = data.map((row) => {
      const { _hasError, _errorMessage, ...cleanRow } = row
      return cleanRow
    })

    if (cleanData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    // Create worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(cleanData)

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Número do produto
      { wch: 35 }, // Nome do produto
      { wch: 15 }, // Preço do produto
      { wch: 12 }, // Valor do cupom
      { wch: 12 }, // Comissão
      { wch: 18 }, // Receita estimada
      { wch: 8 }, // Peças
      { wch: 8 }, // Frete
      { wch: 15 }, // A receber final
      { wch: 15 }, // Custo
      { wch: 18 }, // Margem contribuição
      { wch: 12 }, // Lucro bruto
    ]
    worksheet["!cols"] = colWidths

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos Processados")

    // Use writeFileXLSX for better browser compatibility
    XLSX.writeFileXLSX(workbook, filename)

    console.log("Excel file exported successfully")
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    // Fallback to CSV if Excel export fails
    alert("Erro ao exportar Excel. Tentando CSV...")
    exportToCSV(data, filename.replace(".xlsx", ".csv"))
  }
}

export function exportToCSV(data: ProcessedOrder[], filename: string) {
  try {
    // Clean data for export
    const cleanData = data.map((row) => {
      const { _hasError, _errorMessage, ...cleanRow } = row
      return cleanRow
    })

    if (cleanData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = Object.keys(cleanData[0])

    // Create CSV content with proper encoding
    const csvContent = [
      // Add BOM for proper UTF-8 encoding in Excel
      "\uFEFF",
      // Header row
      headers
        .map((header) => `"${header}"`)
        .join(","),
      // Data rows
      ...cleanData.map((row) =>
        headers
          .map((header) => {
            let value = row[header as keyof ProcessedOrder]

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
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    alert("Erro ao exportar arquivo CSV")
  }
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    // Add to DOM, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } else {
    // Fallback for very old browsers
    alert("Seu navegador não suporta download automático. Por favor, atualize seu navegador.")
  }
}

// Alternative Excel export using HTML table format
export function exportToExcelHTML(data: ProcessedOrder[], filename: string) {
  try {
    // Clean data
    const cleanData = data.map((row) => {
      const { _hasError, _errorMessage, ...cleanRow } = row
      return cleanRow
    })

    if (cleanData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = Object.keys(cleanData[0] || {})

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
            th { background-color: #f2f2f2; font-weight: bold; }
            .number { text-align: right; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
    `

    cleanData.forEach((row) => {
      htmlContent += "<tr>"
      headers.forEach((header) => {
        const value = row[header as keyof ProcessedOrder]
        const isNumber = typeof value === "number"
        const cellValue = value === null || value === undefined ? "" : String(value)
        htmlContent += `<td class="${isNumber ? "number" : ""}">${cellValue}</td>`
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

    downloadBlob(blob, filename.replace(".xlsx", ".xls"))
    console.log("Excel HTML file exported successfully")
  } catch (error) {
    console.error("Error in HTML Excel export:", error)
    exportToCSV(data, filename.replace(".xlsx", ".csv"))
  }
}

// Simple text export for debugging
export function exportToText(data: ProcessedOrder[], filename: string) {
  try {
    const cleanData = data.map((row) => {
      const { _hasError, _errorMessage, ...cleanRow } = row
      return cleanRow
    })

    if (cleanData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = Object.keys(cleanData[0])

    let textContent = headers.join("\t") + "\n"

    cleanData.forEach((row) => {
      const rowData = headers.map((header) => {
        const value = row[header as keyof ProcessedOrder]
        return value === null || value === undefined ? "" : String(value)
      })
      textContent += rowData.join("\t") + "\n"
    })

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" })
    downloadBlob(blob, filename.replace(/\.(xlsx|csv)$/, ".txt"))
    console.log("Text file exported successfully")
  } catch (error) {
    console.error("Error exporting to text:", error)
    alert("Erro ao exportar arquivo de texto")
  }
}
