import { OrderProfitCalculator } from "@/components/order-profit-calculator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp, FileSpreadsheet, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Ferramenta Profissional
              </Badge>
            </div>
            
            <h1 className="font-poppins text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              SHEIN Finance
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Extractor
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Transforme suas planilhas SHEIN em insights financeiros poderosos. 
              Calcule lucros, margens e métricas automaticamente com nossa tecnologia avançada.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cálculos Automáticos</h3>
                  <p className="text-gray-600 text-sm">Margem de contribuição, lucro bruto e métricas financeiras calculadas automaticamente</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Análise Inteligente</h3>
                  <p className="text-gray-600 text-sm">Correspondência inteligente de custos com estatísticas detalhadas de matching</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Export Flexível</h3>
                  <p className="text-gray-600 text-sm">Exporte resultados em múltiplos formatos com dados organizados e prontos para uso</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <OrderProfitCalculator />
          </div>
        </div>
      </section>
    </div>
  )
}
