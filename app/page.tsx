import { FileUploader } from "@/components/file-uploader"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <PageHeader
        title="Processador de Planilhas SHEIN"
        description="Faça upload da sua planilha de pedidos da SHEIN e receba uma versão processada com cálculos automáticos."
      />
      <div className="mt-8">
        <FileUploader />
      </div>
    </main>
  )
}
