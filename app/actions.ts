"use server"

import * as XLSX from "xlsx"
import JSZip from "jszip"
import type { ProcessedOrder } from "@/components/order-profit-calculator"
import { parseBrazilianCurrency } from "@/lib/currency-utils"

interface CostData {
  SKU: string
  "Custo Unitário": number | string
  "Número do produto"?: string
  Codigo?: string
  Code?: string
  sku?: string
  Custo?: number | string
  Cost?: number | string
  Valor?: number | string
  Price?: number | string
}

// Fixed cost data as fallback
const FIXED_COST_DATA = [
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

function normalizeSKU(sku: string): string {
  return String(sku || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

function findBestCostMatch(orderSKU: string, costMap: Map<string, number>): number | null {
  const normalizedOrderSKU = normalizeSKU(orderSKU)

  // 1. Exact match
  if (costMap.has(normalizedOrderSKU)) {
    return costMap.get(normalizedOrderSKU)!
  }

  // 2. Try original SKU without normalization
  if (costMap.has(orderSKU)) {
    return costMap.get(orderSKU)!
  }

  // 3. Partial match - find SKUs that contain the order SKU or vice versa
  for (const [costSKU, cost] of Array.from(costMap.entries())) {
    const normalizedCostSKU = normalizeSKU(costSKU)

    // Check if order SKU contains cost SKU (for cases like "VEST-LONG-TOP-SAI-FEND-123" matching "VEST-LONG-TOP-SAI-FEND-")
    if (normalizedOrderSKU.includes(normalizedCostSKU) && normalizedCostSKU.length > 5) {
      return cost
    }

    // Check if cost SKU contains order SKU
    if (normalizedCostSKU.includes(normalizedOrderSKU) && normalizedOrderSKU.length > 5) {
      return cost
    }
  }

  // 4. Fuzzy match - find the most similar SKU
  let bestMatch: { sku: string; cost: number; similarity: number } | null = null

  for (const [costSKU, cost] of Array.from(costMap.entries())) {
    const similarity = calculateSimilarity(normalizedOrderSKU, normalizeSKU(costSKU))
    if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { sku: costSKU, cost, similarity }
    }
  }

  return bestMatch ? bestMatch.cost : null
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export async function processOrderData(
  formData: FormData,
): Promise<{
  data?: ProcessedOrder[]
  error?: string
  missingCosts?: string[]
  costMatchingStats?: {
    totalSKUs: number
    exactMatches: number
    partialMatches: number
    fuzzyMatches: number
    noMatches: number
  }
}> {
  try {
    const orderFile = formData.get("orderFile") as File
    const costFile = formData.get("costFile") as File | null

    if (!orderFile) {
      return { error: "Arquivo de pedidos é obrigatório" }
    }

    // Read order file
    const orderBuffer = await orderFile.arrayBuffer()
    const orderWorkbook = XLSX.read(orderBuffer, {
      type: "buffer",
      cellText: false,
      cellDates: true,
    })

    // Get first sheet or sheet named "0"
    const orderSheetName = orderWorkbook.SheetNames.find((name) => name === "0") || orderWorkbook.SheetNames[0]
    const orderWorksheet = orderWorkbook.Sheets[orderSheetName]

    if (!orderWorksheet) {
      return { error: "Não foi possível encontrar dados na planilha de pedidos" }
    }

    // Convert to JSON with raw values
    const orderData = XLSX.utils.sheet_to_json(orderWorksheet, {
      range: 1,
      raw: false,
      defval: "",
    }) as any[]

    if (!orderData || orderData.length === 0) {
      return { error: "A planilha de pedidos não contém dados válidos" }
    }

    // Debug: log first row to see what we're getting
    console.log("First row sample:", orderData[0])

    // Validate required columns - order-details format (new.xlsx)
    const requiredColumns = [
      "Número do produto",
      "Preço do produto",
      "Valor do cupom",
      "Comissão",
      "Receita estimada de mercadorias",
    ]

    const firstRow = orderData[0]
    const availableColumns = Object.keys(firstRow)
    console.log("Available columns:", availableColumns)

    const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

    if (missingColumns.length > 0) {
      return {
        error: `Colunas obrigatórias não encontradas: ${missingColumns.join(", ")}. Colunas disponíveis: ${availableColumns.join(", ")}`,
      }
    }

    // Column mapping for order-details format
    const columnMapping = {
      sku: "Número do produto",
      nome: "Nome do produto",
      preco: "Preço do produto",
      cupom: "Valor do cupom",
      comissao: "Comissão",
      receita: "Receita estimada de mercadorias",
      quantidade: "Quantidade de produto", // may not exist in this layout
    }

    // Build cost map
    const costMap = new Map<string, number>()
    let costDataSource = "Dados fixos internos"

    // First, load fixed cost data
    FIXED_COST_DATA.forEach((row) => {
      if (row.SKU && row["Custo Unitário"]) {
        const parsedCost =
          typeof row["Custo Unitário"] === "number"
            ? row["Custo Unitário"]
            : parseBrazilianCurrency(row["Custo Unitário"])
        if (parsedCost > 0) {
          costMap.set(row.SKU.trim(), parsedCost)
          // Also add normalized version
          costMap.set(normalizeSKU(row.SKU), parsedCost)
        }
      }
    })

    // Read cost file if provided (this will override fixed data)
    if (costFile) {
      try {
        const costBuffer = await costFile.arrayBuffer()
        const costWorkbook = XLSX.read(costBuffer, { type: "buffer", cellText: false })

        // Look for "Custo" sheet or use first sheet
        const costSheetName =
          costWorkbook.SheetNames.find((name) => name.toLowerCase().includes("custo")) || costWorkbook.SheetNames[0]

        const costWorksheet = costWorkbook.Sheets[costSheetName]

        if (costWorksheet) {
          const costData = XLSX.utils.sheet_to_json(costWorksheet, {
            range: 1,
            raw: false,
            defval: "",
          }) as CostData[]

          console.log("Cost file data sample:", costData.slice(0, 3))
          console.log("Cost file columns:", Object.keys(costData[0] || {}))

          // Clear previous cost data and load from file
          costMap.clear()
          costDataSource = "Arquivo de custos fornecido"

          costData.forEach((row) => {
            // Try different possible column names for SKU
            const skuValue = row.SKU || row["Número do produto"] || row["Codigo"] || row["Code"] || row["sku"]
            // Try different possible column names for cost
            const costValue = row["Custo Unitário"] || row["Custo"] || row["Cost"] || row["Valor"] || row["Price"]

            if (skuValue && costValue) {
              const parsedCost = parseBrazilianCurrency(costValue)
              if (parsedCost > 0) {
                const skuStr = String(skuValue).trim()
                costMap.set(skuStr, parsedCost)
                // Also add normalized version
                costMap.set(normalizeSKU(skuStr), parsedCost)
              }
            }
          })

          console.log(`Loaded ${costMap.size / 2} cost entries from file`) // Divided by 2 because we store both original and normalized
        }
      } catch (error) {
        console.error("Error reading cost file:", error)
        // Continue with fixed data
        costDataSource = "Dados fixos internos"
      }
    }

    console.log(`Using cost data: ${costDataSource}`)
    console.log(`Total cost entries: ${costMap.size / 2}`)

    // Process order data - order-details format
    const processedData: ProcessedOrder[] = []
    const missingCosts: string[] = []

    // Cost matching statistics
    const costMatchingStats = {
      totalSKUs: 0,
      exactMatches: 0,
      partialMatches: 0,
      fuzzyMatches: 0,
      noMatches: 0,
    }

    for (let i = 0; i < orderData.length; i++) {
      const row = orderData[i]

      try {
        const sku = String(row[columnMapping.sku] || "").trim()
        costMatchingStats.totalSKUs++

        // Debug: log parsing for first few rows
        if (i < 3) {
          console.log(`Row ${i + 1} parsing:`, {
            sku,
            precoOriginal: row[columnMapping.preco],
            precoParsed: parseBrazilianCurrency(row[columnMapping.preco]),
            comissaoOriginal: row[columnMapping.comissao],
            comissaoParsed: parseBrazilianCurrency(row[columnMapping.comissao]),
            receitaOriginal: row[columnMapping.receita],
            receitaParsed: parseBrazilianCurrency(row[columnMapping.receita]),
            quantidade: row[columnMapping.quantidade],
          })
        }

        // Parse Brazilian currency format for all monetary fields
        const precoProtudo = parseBrazilianCurrency(row[columnMapping.preco])
        const valorCupom = parseBrazilianCurrency(row[columnMapping.cupom])
        const comissao = parseBrazilianCurrency(row[columnMapping.comissao])
        const receitaEstimada = parseBrazilianCurrency(row[columnMapping.receita])
        const quantidade = Number(row[columnMapping.quantidade]) || 1

        // Apply business rules
        const pecas = quantidade
        const frete = 4
        const aReceberFinal = receitaEstimada - comissao

        // Debug calculation for first few rows
        if (i < 3) {
          console.log(`Row ${i + 1} calculation:`, {
            receitaEstimada,
            comissao,
            aReceberFinal: receitaEstimada - comissao,
          })
        }

        // Get cost using improved matching
        let custo: number | string = "N/A - Sem dados de custo"
        let margemContribuicao: number | string = "N/A"
        let lucroBruto: number | string = "N/A"
        let matchType = "none"

        if (sku) {
          const foundCost = findBestCostMatch(sku, costMap)

          if (foundCost !== null) {
            custo = foundCost
            margemContribuicao = aReceberFinal - custo
            lucroBruto = margemContribuicao / pecas

            // Determine match type for statistics
            if (costMap.has(sku)) {
              matchType = "exact"
              costMatchingStats.exactMatches++
            } else if (costMap.has(normalizeSKU(sku))) {
              matchType = "normalized"
              costMatchingStats.exactMatches++
            } else {
              // Check if it was a partial or fuzzy match
              const normalizedSKU = normalizeSKU(sku)
              let isPartialMatch = false

              for (const costSKU of Array.from(costMap.keys())) {
                if (normalizedSKU.includes(normalizeSKU(costSKU)) || normalizeSKU(costSKU).includes(normalizedSKU)) {
                  isPartialMatch = true
                  break
                }
              }

              if (isPartialMatch) {
                matchType = "partial"
                costMatchingStats.partialMatches++
              } else {
                matchType = "fuzzy"
                costMatchingStats.fuzzyMatches++
              }
            }
          } else {
            missingCosts.push(sku)
            costMatchingStats.noMatches++
          }

          // Debug cost matching for first few rows
          if (i < 5) {
            console.log(`Row ${i + 1} cost matching:`, {
              originalSKU: sku,
              normalizedSKU: normalizeSKU(sku),
              foundCost,
              matchType,
              custo,
            })
          }
        } else {
          costMatchingStats.noMatches++
        }

        const processedRow: ProcessedOrder = {
          "Número do produto": sku,
          "Nome do produto": String(row[columnMapping.nome] || sku),
          "Preço do produto": precoProtudo,
          "Valor do cupom": valorCupom,
          Comissão: comissao,
          "Receita estimada de mercadorias": receitaEstimada,
          Peças: pecas,
          Frete: frete,
          "A receber final": aReceberFinal,
          Custo: custo,
          "Margem de contribuição": margemContribuicao,
          "Lucro Bruto": lucroBruto,
        }

        processedData.push(processedRow)
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error, row)
        // Continue processing other rows
      }
    }

    console.log("Cost matching statistics:", costMatchingStats)
    console.log("Sample processed data:", processedData.slice(0, 2))

    return {
      data: processedData,
      missingCosts: [...Array.from(new Set(missingCosts))], // Remove duplicates
      costMatchingStats,
    }
  } catch (error) {
    console.error("Error in processOrderData:", error)
    return { error: "Erro inesperado durante o processamento dos dados" }
  }
}

export async function processZipFiles(
  formData: FormData,
): Promise<{
  data?: ProcessedOrder[]
  error?: string
  missingCosts?: string[]
  costMatchingStats?: {
    totalSKUs: number
    exactMatches: number
    partialMatches: number
    fuzzyMatches: number
    noMatches: number
  }
}> {
  try {
    const zipFile = formData.get("zipFile") as File

    if (!zipFile) {
      return { error: "Arquivo ZIP é obrigatório" }
    }

    console.log("Processing ZIP file:", zipFile.name)
    
    // Read ZIP file
    const zipBuffer = await zipFile.arrayBuffer()
    const zip = new JSZip()
    await zip.loadAsync(zipBuffer)
    
    // Get all Excel files from ZIP
    const excelFiles = Object.keys(zip.files).filter(
      fileName => fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')
    )
    
    if (excelFiles.length === 0) {
      return { error: "Nenhum arquivo Excel encontrado no ZIP" }
    }
    
    console.log(`Found ${excelFiles.length} Excel files in ZIP:`, excelFiles)
    
    // Build cost map from fixed data
    const costMap = new Map<string, number>()
    FIXED_COST_DATA.forEach((row) => {
      if (row.SKU && row["Custo Unitário"]) {
        const parsedCost =
          typeof row["Custo Unitário"] === "number"
            ? row["Custo Unitário"]
            : parseBrazilianCurrency(row["Custo Unitário"])
        if (parsedCost > 0) {
          costMap.set(row.SKU.trim(), parsedCost)
          costMap.set(normalizeSKU(row.SKU), parsedCost)
        }
      }
    })
    
    // Column mapping for order-details format (ZIP processing)
    const columnMapping = {
      sku: "Número do produto",
      nome: "Nome do produto",
      preco: "Preço do produto",
      cupom: "Valor do cupom",
      comissao: "Comissão",
      receita: "Receita estimada de mercadorias",
      quantidade: "Quantidade de produto", // may not exist in this layout
    }
    
    // Process all Excel files
    let allProcessedData: ProcessedOrder[] = []
    let allMissingCosts: string[] = []
    let allCostMatchingStats = {
      totalSKUs: 0,
      exactMatches: 0,
      partialMatches: 0,
      fuzzyMatches: 0,
      noMatches: 0,
    }
    
    for (const fileName of excelFiles) {
      try {
        console.log(`Processing file: ${fileName}`)
        
        // Get file content from ZIP
        const file = zip.file(fileName)
        if (!file) {
          console.warn(`Could not read file: ${fileName}`)
          continue
        }
        
        // Convert to buffer
        const fileBuffer = await file.async('arraybuffer')
        
        // Read Excel file
        const workbook = XLSX.read(fileBuffer, {
          type: "buffer",
          cellText: false,
          cellDates: true,
        })
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        if (!worksheet) {
          console.warn(`No data found in sheet: ${sheetName}`)
          continue
        }
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 1,
          raw: false,
          defval: "",
        }) as any[]
        
        if (!data || data.length === 0) {
          console.warn(`No data in file: ${fileName}`)
          continue
        }
        
        // Validate required columns (order-details layout)
        const requiredColumns = [
          "Número do produto",
          "Preço do produto",
          "Valor do cupom",
          "Comissão",
          "Receita estimada de mercadorias",
        ]
        
        const firstRow = data[0]
        const availableColumns = Object.keys(firstRow)
        const missingColumns = requiredColumns.filter((col) => !(col in firstRow))
        
        if (missingColumns.length > 0) {
          console.warn(`Missing columns in ${fileName}:`, missingColumns)
          continue
        }
        
        // Process data from this file
        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          
          try {
            const sku = String(row[columnMapping.sku] || "").trim()
            allCostMatchingStats.totalSKUs++
            
            // Parse values
            const precoProtudo = parseBrazilianCurrency(row[columnMapping.preco])
            const valorCupom = parseBrazilianCurrency(row[columnMapping.cupom])
            const comissao = parseBrazilianCurrency(row[columnMapping.comissao])
            const receitaEstimada = parseBrazilianCurrency(row[columnMapping.receita])
            const quantidade = Number(row[columnMapping.quantidade]) || 1
            
            // Apply business rules
            const pecas = quantidade
            const frete = 4
            const aReceberFinal = receitaEstimada - comissao
            
            // Get cost using improved matching
            let custo: number | string = "N/A - Sem dados de custo"
            let margemContribuicao: number | string = "N/A"
            let lucroBruto: number | string = "N/A"
            
            if (sku) {
              const foundCost = findBestCostMatch(sku, costMap)
              
              if (foundCost !== null) {
                custo = foundCost
                margemContribuicao = aReceberFinal - custo
                lucroBruto = margemContribuicao / pecas
                
                // Determine match type for statistics
                if (costMap.has(sku)) {
                  allCostMatchingStats.exactMatches++
                } else if (costMap.has(normalizeSKU(sku))) {
                  allCostMatchingStats.exactMatches++
                } else {
                  // Check if it was a partial or fuzzy match
                  const normalizedSKU = normalizeSKU(sku)
                  let isPartialMatch = false
                  
                  for (const costSKU of Array.from(costMap.keys())) {
                    if (normalizedSKU.includes(normalizeSKU(costSKU)) || normalizeSKU(costSKU).includes(normalizedSKU)) {
                      isPartialMatch = true
                      break
                    }
                  }
                  
                  if (isPartialMatch) {
                    allCostMatchingStats.partialMatches++
                  } else {
                    allCostMatchingStats.fuzzyMatches++
                  }
                }
              } else {
                allMissingCosts.push(sku)
                allCostMatchingStats.noMatches++
              }
            } else {
              allCostMatchingStats.noMatches++
            }
            
            const processedRow: ProcessedOrder = {
              "Número do produto": sku,
              "Nome do produto": String(row[columnMapping.nome] || sku),
              "Preço do produto": precoProtudo,
              "Valor do cupom": valorCupom,
              Comissão: comissao,
              "Receita estimada de mercadorias": receitaEstimada,
              Peças: pecas,
              Frete: frete,
              "A receber final": aReceberFinal,
              Custo: custo,
              "Margem de contribuição": margemContribuicao,
              "Lucro Bruto": lucroBruto,
            }
            
            allProcessedData.push(processedRow)
          } catch (error) {
            console.error(`Error processing row ${i + 1} in ${fileName}:`, error)
            continue
          }
        }
        
        console.log(`Successfully processed ${fileName}`)
        
      } catch (error) {
        console.error(`Error processing file ${fileName}:`, error)
        continue
      }
    }
    
    console.log(`ZIP processing complete. Total rows: ${allProcessedData.length}`)
    
    return {
      data: allProcessedData,
      missingCosts: [...Array.from(new Set(allMissingCosts))], // Remove duplicates
      costMatchingStats: allCostMatchingStats,
    }
    
  } catch (error) {
    console.error("Error in processZipFiles:", error)
    return { error: "Erro inesperado durante o processamento do arquivo ZIP" }
  }
}
