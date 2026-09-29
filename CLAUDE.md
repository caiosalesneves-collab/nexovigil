# NexoVigil: protótipo navegável

Plataforma B2B de vigilância pós-procedimento para clínicas de harmonização facial.
Este repositório é um PROTÓTIPO DEMONSTRATIVO para validar o conceito com profissionais da área.
NÃO é um produto clínico.

## Regras permanentes (seguir em todas as sessões)

1. Protótipo apenas com dados fictícios. Nunca criar campos para dados reais de pacientes, nunca conectar APIs externas, nunca usar WhatsApp real.
2. Banner fixo em todas as telas: "Protótipo demonstrativo com dados fictícios. Não utilizar para decisões clínicas."
3. O sistema não diagnostica e não prescreve. Nenhum texto da interface pode sugerir diagnóstico. Alertas indicam prioridade de avaliação, nunca probabilidade diagnóstica.
4. Todo alerta deve exibir o motivo (quais dados o acionaram).
5. Imagem inadequada nunca gera tranquilidade: status "Imagem insuficiente para triagem".
6. Interface em português do Brasil. Nos textos da interface: não usar travessão (em dash) nem emojis.
7. Layout responsivo, otimizado para iPad (retrato e paisagem) e desktop.
8. Trabalhar em etapas. Ao fim de cada etapa: fazer commit, publicar, resumir o que foi feito e PARAR aguardando aprovação.
9. Se algo estiver ambíguo, perguntar antes de assumir. Listar as premissas usadas.
10. Regras clínicas de alerta ficam em um arquivo de configuração separado (`src/config/regras-alerta.ts`), marcadas como "PLACEHOLDER: requer validação clínica".

## Stack

- React + TypeScript + Vite + Tailwind CSS (v4, via `@tailwindcss/vite`).
- Dados fictícios em arquivos locais (`src/data/`). Sem backend.
- Estado de interação somente em memória.
- Publicação automática no GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na branch `main`.
- `base: './'` no Vite para funcionar em qualquer subcaminho do Pages. Quando houver rotas, usar `HashRouter`.

## Estrutura

- `src/types/` modelo de dados.
- `src/config/regras-alerta.ts` regras de alerta (PLACEHOLDER, editáveis).
- `src/config/protocolos.ts` protocolos de acompanhamento e perguntas (PLACEHOLDER).
- `src/engine/` motor de regras determinístico.
- `src/data/` geração dos dados fictícios (datas relativas ao momento de carregamento da página).
- `src/components/` componentes de interface.

## Etapas

1. Estrutura, CLAUDE.md, dados fictícios, deploy com tela inicial simples.
2. Cockpit: contadores por nível, filas, casos sem responsável, vermelho fixado no topo até alguém assumir.
3. Agenda mensal de vigilância com filtros.
4. Ficha do episódio: procedimento, linha do tempo auditável, fotos lado a lado, motivos, mudança de status, anotação.

## Checklist antes de cada commit

- `npm run build` sem erros.
- Nenhum travessão (U+2014) nem emoji em textos da interface: `grep -rnP "\x{2014}" src` deve voltar vazio.
- Nenhum texto sugere diagnóstico ("suspeita de", "provável", "indica necrose" etc.).
