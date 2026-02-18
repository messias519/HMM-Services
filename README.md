# HMM Services - Hospital Municipal de Mozarlândia 🏥

Este projeto é uma ferramenta web especializada na geração de laudos de **Autorização de Internação Hospitalar (AIH)**, desenvolvida sob medida para o Hospital Municipal de Mozarlândia (HMM). Ele automatiza o preenchimento do formulário oficial, integrando dados do SIGTAP (SUS) e garantindo uma interface moderna e eficiente.

## 🚀 Funcionalidades Principais

- **Segurança**: Camada de acesso protegida por senha mestre (`saude2026`).
- **Gerador de AIH**: Formulário digital para preenchimento de solicitação de internação, com busca de CIDs e procedimentos, e geração automática de PDF no padrão do laudo oficial.
- **Gerador de Etiquetas**: Ferramenta para criar etiquetas de Paciente, Acompanhante e Visitante (100x50mm) compatíveis com impressoras Zebra ZD220.
- **Autenticação**: Sistema simples de login protegido por senha "master".
- **Cálculos Automatizados**: Exibição instantânea de valores de SH (Serviço Hospitalar), SP (Serviço Profissional) e SA (Serviço Ambulatorial) após seleção do procedimento.
- **Motor de PDF**: Geração de PDF em tempo real no lado do cliente (client-side), injetando os dados diretamente nas coordenadas corretas de um template oficial.
- **UX/UI Customizada**: Interface em tons de Azul, alinhada à identidade visual da Prefeitura de Mozarlândia e otimizada para produtividade.
- **Máscaras de Entrada**: Formatação automática de datas (DD/MM/AAAA) e documentos.

## 🛠️ Stack Tecnológica

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Manipulação de PDF**: [pdf-lib](https://pdf-lib.js.org/)
- **Roteamento**: [React Router DOM](https://reactrouter.com/)

## 📂 Estrutura do Projeto

```text
HMM-Services/
├── src/
│   ├── data/              # Bases de dados JSON (CIDs, Procedimentos, Mapping)
│   ├── layout/            # Layout principal e navegação (MainLayout)
│   ├── pages/             # Páginas da aplicação (Login, AIHGenerator)
│   ├── services/          # Lógica de geração de PDF (pdfService.ts)
│   ├── App.tsx            # Gerenciamento de rotas e autenticação
│   └── main.tsx           # Ponto de entrada
├── public/                # Assets (Logo, Template PDF, Ícones)
├── vite.config.ts         # Configuração do Vite (base path para GitHub Pages)
└── mapping.json           # Dicionário de coordenadas X,Y para o PDF
```

## 🧠 Funcionamento Técnico

### Geração do PDF
O sistema utiliza um arquivo central chamado `mapping.json`. Este arquivo contém as coordenadas exatas onde cada campo deve ser impresso no `template_aih.pdf`. O `pdfService.ts` lê estas coordenadas e utiliza a biblioteca `pdf-lib` para "carimbar" as informações do formulário sobre a imagem do laudo oficial.

### Bases de Dados
- `cids.json`: Lista completa de diagnósticos CID-10.
- `procedimentos.json`: Tabela SIGTAP com códigos, descrições, complexidade, valores e tempos de permanência.

### Autenticação
A autenticação é feita via um token simples no `localStorage`. Ao digitar a senha correta, a aplicação salva o estado e libera as rotas protegidas pelo `AuthGuard` implementado no `App.tsx`.

## 💻 Como Rodar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Rodar em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Gerar build de produção**:
   ```bash
   npm run build
   ```

## ⚠️ Solução de Problemas (Windows PowerShell)

Se ao tentar rodar o `npm` você receber um erro de **UnauthorizedAccess** (execução de scripts desabilitada), abra o PowerShell como **Administrador** e execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

> [!NOTE]
> Este projeto foi desenvolvido para funcionar como um SPA (Single Page Application) moderno, focando em performance e conformidade com os dados do Ministério da Saúde.
