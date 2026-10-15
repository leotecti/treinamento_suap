# Requisitos — Portal SUAP EDU: Guia do SUAP

**Versão do documento:** 1.1  
**Estado do projeto:** protótipo funcional com três encontros com material disponível; três encontros planejados  
**Objetivo:** orientar a continuidade do desenvolvimento no Codex/VSCode, preservando o portal existente.

## 1. Contexto

O Portal SUAP EDU é uma aplicação web estática de apoio ao treinamento de novos desenvolvedores do SUAP, com foco no módulo `edu`. A versão do participante deve oferecer uma trilha didática independente do roteiro do professor, com explicações, exemplos reais de código, tarefas, revisão e recursos de consulta posterior.

A fonte da verdade para o conteúdo técnico são os arquivos reais do repositório SUAP, os três roteiros originais e o plano de curso fornecido. **Não inventar implementações, nomes de arquivos ou números de linha.**

## 2. Estado atual e arquivos do projeto

Estrutura identificada no protótipo:

```text
portal_suap_participante/
├── index.html                  # Estrutura e navegação principal
├── style.css                   # Aparência, temas e responsividade
├── app.js                      # Renderização, interação, busca e estado
├── dados.js                    # Exemplos de código e conteúdo estruturado
├── fluxo_django_mtv.png        # Diagrama introdutório
├── plano_curso.md              # Plano integral de 12 horas
├── README.md                   # Instruções de uso
```

**Ação inicial no Codex:** abrir os arquivos atuais, executar o portal e mapear as funções existentes antes de refatorar. Não substituir o projeto por uma implementação nova sem necessidade.

## 3. Requisitos funcionais

Legenda: **[E] existente**, **[M] melhorar/validar**, **[P] planejado**.

| ID | Requisito | Situação | Prioridade |
|---|---|---|---|
| RF-01 | Exibir página inicial com apresentação, objetivos e orientações de estudo. | E | Alta |
| RF-02 | Exibir o diagrama Django MTV com texto alternativo e fluxo correto entre URL, view, model, banco e template. | E/M | Alta |
| RF-03 | Disponibilizar o plano de curso com justificativa, público, objetivos, metodologia, avaliação, tecnologias, cronograma e referências. | E/M | Alta |
| RF-04 | Navegar entre módulos de estudo e seções de apoio por menu lateral responsivo. | E/M | Alta |
| RF-05 | Apresentar os três módulos: introdução ao fluxo do SUAP; decoradores do SUAP; permissões do SUAP. | E/M | Alta |
| RF-06 | Em cada módulo, apresentar objetivos, conceitos, exemplos de código, tarefas e questões com explicação das respostas. | E/M | Alta |
| RF-07 | Disponibilizar biblioteca pesquisável de trechos reais do SUAP com caminho do arquivo e referência de origem. | E/M | Alta |
| RF-08 | Apresentar a view `turma()` comentada, o model `Turma` e exemplos de `response.py`. | E/M | Alta |
| RF-09 | Permitir copiar trechos de código com um comando explícito. | E | Média |
| RF-10 | Registrar conclusão de tarefas por módulo e exibir progresso individual. | E/M | Alta |
| RF-11 | Exibir questões de revisão com feedback formativo imediato. | E/M | Alta |
| RF-12 | Permitir escrever anotações pessoais e exportá-las em Markdown. | E/M | Alta |
| RF-13 | Permitir alternar tema claro/escuro, pesquisar conteúdo e imprimir páginas. | E/M | Média |
| RF-14 | Identificar encontros 4, 5 e 6 como planejados, sem apresentar conteúdo inexistente como concluído. | E | Alta |
| RF-15 | Relacionar os materiais disponíveis aos encontros 1, 2 e 3 e oferecer links para os encontros planejados 4, 5 e 6. | E/M | Alta |
| RF-16 | Acrescentar conteúdos completos de forms e relatórios (encontro 4), models (encontro 5) e admin (encontro 6), com investigação, implementação e validação integradas às atividades. | P | Alta |
| RF-17 | Oferecer visualização de código original versus código comentado, preservando formatação e numeração opcional. | P | Média |
| RF-18 | Oferecer glossário de termos Django/SUAP e índice de arquivos/funcionalidades. | P | Média |
| RF-19 | Permitir exportar e importar progresso/anotações em formato portável, sem depender de servidor. | P | Baixa |
| RF-20 | Separar material do instrutor e gabaritos não destinados aos participantes, sem incluí-los no pacote público. | M | Alta |

## 4. Requisitos de conteúdo e didática

### RC-01 — Linguagem do participante

O texto deve falar com quem está aprendendo: “Compreenda”, “Observe”, “Localize”, “Analise”, “Pratique”. Não utilizar instruções internas de apresentação (“mostre aos alunos”, “abra no projetor”, “explique em voz alta”).

### RC-02 — Estrutura de cada unidade

Cada unidade deve conter, sempre que aplicável:

1. Objetivo de aprendizagem.
2. Conceito e contextualização no SUAP.
3. Caminho real do arquivo no repositório.
4. Trecho de código com explicação e indicação de origem.
5. Atividade prática com resultado verificável.
6. Questão de revisão e feedback.
7. Referência ou orientação para estudo posterior.

### RC-03 — Código fiel às fontes

Preservar nomes reais de funções, classes, argumentos, managers e decorators. Distinguir trechos originais, comentários didáticos e exemplos simplificados. Quando um comportamento depender de outra implementação não anexada, informar que precisa ser verificada no repositório.

### RC-04 — Referência de linhas

Exibir caminho do arquivo e, quando confirmado, intervalo de linhas. Linhas são referências do checkout analisado, não identificadores estáveis; conferir após alterações.

### RC-05 — Progressão

Organizar os conteúdos segundo **Conhecer → Localizar → Compreender → Investigar → Corrigir → Validar**, combinando exploração (A), diagnóstico (B) e implementação (C).

### RC-06 — Segurança pedagógica

Indicar claramente que exemplos de escrita no banco, remoção de matrículas, geração de documentos com dados pessoais e sincronização de permissões não devem ser executados em produção. Ressaltar que ocultar botões no template não substitui autorização no servidor. O fluxo de remoção via `request.GET` na view `turma()` deve ser apresentado como ponto de atenção para operações com efeitos colaterais, não como padrão recomendado.

## 5. Plano de curso obrigatório

**Carga horária:** 12 horas (seis encontros de duas horas).

| Encontro | Tema | Caso principal | Tipo de atividade |
|---|---|---|---|
| 1 | Introdução ao fluxo do SUAP | URL → view → template na tela da turma | A — Exploração |
| 2 | Decoradores do SUAP | Decoradores, respostas e documentos PDF | A/C — Exploração e implementação |
| 3 | Permissões do SUAP | Grupos, sincronização e regras contextuais | A/B — Exploração e diagnóstico |
| 4 | Forms e relatórios do SUAP | Formulários, validações e filtros de relatórios | A/C — Exploração e implementação |
| 5 | Models do SUAP | Turma, relacionamentos, managers e métodos de negócio | A/B — Exploração e diagnóstico |
| 6 | Admin do SUAP | Listagens, filtros, buscas, ações e permissões administrativas | A/C — Exploração e implementação |

**Regra de organização:** os materiais existentes correspondem aos encontros 1 (Introdução ao fluxo do SUAP), 2 (Decoradores do SUAP) e 3 (Permissões do SUAP). Os encontros 4 (Forms e relatórios do SUAP), 5 (Models do SUAP) e 6 (Admin do SUAP) têm links próprios e permanecem planejados até a validação do conteúdo completo.

## 6. Casos e códigos obrigatórios

| Código/caso | Arquivo de referência | Conceitos a ensinar |
|---|---|---|
| View `turma(request, pk)` | `edu/views.py` | Request, `pk`, managers, 404, permissões, ORM, `locals()`, `httprr` |
| Model `Turma` | `edu/models/...` (confirmar caminho exato no checkout) | Fields, ForeignKey, `Meta`, managers, relacionamentos, métodos de negócio |
| `Turma.get_alunos_matriculados()` e `get_alunos_matriculados_diarios()` | Model `Turma` | QuerySets, `filter`, `exclude`, `distinct`, `select_related` |
| `Turma.get_horarios()` e `diarios_pendentes()` | Model `Turma` | Relações acadêmicas e lógica de consulta |
| `rtr()` | `djtools/utils/response.py` | Decorators, `HttpResponse`, renderização do contexto |
| `get_template_path()` | `djtools/utils/response.py` | Convenção de templates |
| `httprr()` | `djtools/utils/response.py` | Redirecionamentos e mensagens |
| `PDFResponse` | `djtools/utils/response.py` | Respostas PDF e cabeçalhos HTTP |
| Grupos e autorização | `permissions.yaml`, `edu/perms.py`, `edu/views.py` | Grupos, permissões declarativas e regras contextuais |

Para `@documento`, forms, templates e sincronização de permissões, usar os roteiros existentes e confirmar implementações no código antes de acrescentar explicações detalhadas.

## 7. Requisitos não funcionais

| ID | Requisito | Critério |
|---|---|---|
| RNF-01 | Simplicidade | Manter HTML, CSS e JS puro; sem frameworks ou build obrigatório. |
| RNF-02 | Execução local | `index.html` deve funcionar offline, sem backend. Se houver dependência de servidor local, documentar claramente a mudança. |
| RNF-03 | Privacidade | Progresso e anotações ficam no dispositivo; não coletar nem transmitir dados pessoais. |
| RNF-04 | Persistência resiliente | Falhas, bloqueio ou indisponibilidade de `localStorage` não devem impedir leitura do material. |
| RNF-05 | Acessibilidade | Navegação por teclado, foco visível, contraste adequado, rótulos acessíveis, textos alternativos e feedback compreensível. |
| RNF-06 | Responsividade | Interface utilizável em desktop, tablet e celular; códigos longos com rolagem horizontal controlada. |
| RNF-07 | Segurança do front-end | Escapar conteúdo dinâmico ao inserir HTML; não executar trechos de código exibidos. |
| RNF-08 | Manutenibilidade | Separar conteúdo, estado, renderização e estilos sempre que possível, sem complexidade desnecessária. |
| RNF-09 | Compatibilidade | Navegadores modernos (Chrome, Firefox e Edge). |
| RNF-10 | Clareza de origem | Identificar código real, exemplo didático, versão e limitações das referências. |
| RNF-11 | Preservação | Melhorias não devem remover funcionalidades já existentes nem apagar dados locais do participante sem aviso. |

## 8. Regras de negócio da aplicação

- **RB-01:** o progresso é calculado pelas tarefas efetivamente marcadas pelo participante.
- **RB-02:** respostas de questões devem apresentar explicação; não há atribuição oficial de nota.
- **RB-03:** módulos incompletos ou planejados devem ser sinalizados como tal.
- **RB-04:** anotações pertencem ao navegador/dispositivo e não são sincronizadas.
- **RB-05:** o conteúdo destinado ao instrutor não deve ser apresentado como instrução ao participante.
- **RB-06:** os trechos do SUAP são somente leitura; o portal não altera o repositório.
- **RB-07:** a consulta por palavras-chave deve funcionar sem internet.
- **RB-08:** não presumir que todos os participantes têm acesso ao repositório; atividades que exigem VSCode devem indicar esse pré-requisito e oferecer contexto suficiente para compreensão.

## 9. Organização recomendada para evolução

Manter a estrutura existente no primeiro ciclo. Quando o conteúdo crescer, considerar uma divisão progressiva:

```text
portal_suap_participante/
├── index.html
├── style.css
├── app.js
├── dados.js
├── fluxo_django_mtv.png
├── plano_curso.md
├── requisitos.md
├── visao_geral.md
├── README.md
```

**Evolução opcional:** separar `dados.js` por módulo ou gerar um bundle estático a partir de Markdown/JSON. Evitar dependências que quebrem a abertura direta por `file://` sem oferecer alternativa.

## 10. Testes e critérios de aceitação

### TA-01 — Inicialização

Abrir `index.html` em navegador moderno, sem internet, e verificar carregamento de interface, estilos, imagem e exemplos.

### TA-02 — Navegação

Acessar todas as seções pelo menu e voltar à página inicial sem erros no console.

### TA-03 — Conteúdo

Conferir que os três módulos e o plano de seis encontros estão disponíveis; encontros 4, 5 e 6 devem estar identificados como planejados.

### TA-04 — Código

Verificar formatação, cópia, fidelidade e referência de arquivo dos trechos de `Turma`, `turma()` e `response.py`.

### TA-05 — Exercícios

Marcar e desmarcar atividades; confirmar atualização correta do progresso, inclusive após recarregar a página.

### TA-06 — Questões

Responder alternativas corretas e incorretas e verificar feedback explicativo consistente.

### TA-07 — Anotações

Criar notas, recarregar a página, confirmar persistência e exportar Markdown legível.

### TA-08 — Pesquisa e aparência

Testar busca, alternância de tema, impressão e layout em larguras de celular e desktop.

### TA-09 — Acessibilidade

Percorrer interface com Tab/Enter/Espaço, verificar foco, rótulos e textos alternativos.

### TA-10 — Resiliência

Simular `localStorage` indisponível e confirmar que o conteúdo permanece acessível; testar notas e busca com caracteres especiais.

### TA-11 — Isolamento

Confirmar que o portal não executa operações do SUAP, não faz requisições a banco e não inclui dados acadêmicos reais.

## 11. Priorização para o Codex

### Ciclo 1 — Auditoria e estabilização

1. Ler `README.md`, `index.html`, `app.js`, `dados.js`, `style.css` e as fontes.
2. Executar o protótipo e registrar o que funciona e o que precisa de correção.
3. Verificar fidelidade dos exemplos e referências de arquivo/linha.
4. Corrigir problemas de acessibilidade, responsividade, persistência e segurança sem alterar o visual desnecessariamente.

### Ciclo 2 — Consolidação didática

1. Melhorar os três módulos existentes com linguagem do participante.
2. Explicitar relação entre módulos e encontros do curso.
3. Padronizar objetivos, exemplos, atividades e questões.
4. Melhorar a biblioteca de códigos comentados e a busca.

### Ciclo 3 — Conclusão da trilha

1. Desenvolver conteúdo do encontro 4: forms, validações, filtros e relatórios.
2. Desenvolver conteúdo do encontro 5: models, relacionamentos, managers e ORM.
3. Desenvolver conteúdo do encontro 6: configuração e personalizações do admin.
4. Acrescentar exercícios baseados em evidências, testes de regressão e documentação de resultados.
5. Validar todo o curso contra o plano de 12 horas.

### Ciclo 4 — Publicação e manutenção

1. Preparar pacote estático distribuível e documentação de uso.
2. Revisar acessibilidade e execução offline.
3. Garantir separação dos materiais internos do instrutor.
4. Criar checklist para atualização de caminhos/linhas após mudanças do repositório SUAP.

## 12. Instruções de trabalho para o Codex

- Tratar `visao_geral.md` como referência de propósito e `requisitos.md` como critérios de implementação.
- Inspecionar o código existente antes de propor mudanças.
- Preservar a identidade visual, o conteúdo útil e a simplicidade tecnológica.
- Fazer alterações incrementais e verificáveis, preferindo pequenos ciclos.
- Sempre informar arquivos modificados, justificativa e como testar.
- Não apresentar código hipotético como se fosse retirado do SUAP.
- Não criar integração com banco, autenticação ou backend sem necessidade expressa.
- Não alterar arquivos do próprio SUAP; o trabalho é no portal didático.
- Não inserir dados pessoais reais nem credenciais em exemplos.

## 13. Definição de pronto

Uma versão está pronta para distribuição quando os módulos existentes estiverem corretos, os links e exemplos funcionarem offline, as tarefas/questões/anotações operarem de forma confiável, o conteúdo tiver linguagem apropriada ao participante, as referências técnicas forem rastreáveis e o cronograma distinguir claramente conteúdos disponíveis dos planejados. A **conclusão integral do projeto** também exige conteúdo validado para os encontros 4, 5 e 6.
