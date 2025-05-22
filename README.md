# Processador de Planilhas SHEIN

Esta aplicação permite processar planilhas de pedidos da SHEIN, aplicando transformações automáticas conforme regras específicas.

## Funcionalidades

- Upload de planilhas Excel (.xlsx)
- Processamento automático com adição de colunas calculadas
- Visualização prévia dos dados processados
- Download da planilha processada

## Requisitos

- Node.js 18.x ou superior
- npm ou yarn

## Como Executar Localmente

1. Clone este repositório
2. Instale as dependências:

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. Inicie o servidor de desenvolvimento:

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## Regras de Processamento

A aplicação aplica as seguintes transformações às planilhas:

1. **Frete**: Adiciona coluna com valor fixo de 4,00
2. **A Receber Final**: Calcula "Receita estimada de mercadorias" - "Frete"
3. **Peças**: Adiciona coluna com valor padrão 1
4. **Custo**: Adiciona coluna vazia para preenchimento manual
5. **Margem de Contribuição**: Calcula "A Receber Final" - "Custo" (quando disponível)
6. **Lucro Bruto (%)**: Calcula "Margem de Contribuição" / "Preço do produto" (quando disponível)

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- xlsx (para processamento de planilhas)
