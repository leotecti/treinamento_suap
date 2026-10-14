# Visão Geral — Portal SUAP EDU: Guia do Participante

## 1. Apresentação

O **Portal SUAP EDU — Guia do Participante** é uma aplicação web estática, desenvolvida com **HTML, CSS e JavaScript**, destinada a apoiar a formação de novos desenvolvedores responsáveis pela manutenção e evolução do SUAP, com prioridade para exemplos reais do módulo `edu` (Ensino).

O portal não é um clone do SUAP nem um ambiente para executar suas rotinas. É um **material de aprendizagem e consulta**, que explica conceitos, relaciona arquivos reais do repositório, propõe investigações no VSCode e registra o progresso individual. Deve ser útil durante os encontros presenciais/remotos e como referência após o curso.

## 2. Problema e justificativa

O SUAP é um projeto Django de grande porte, organizado em aplicações por domínio e com componentes próprios, como os utilitários `djtools`, managers locais, decorators, regras de autorização e mecanismos de geração de documentos. Para atuar nesse código, conhecer Django genericamente não basta: é necessário saber **localizar uma funcionalidade, compreender o fluxo da requisição, interpretar regras acadêmicas, investigar chamados e validar alterações**.

O projeto transforma os roteiros técnicos do instrutor em uma trilha didática autônoma, com linguagem dirigida ao participante. Não se trata de simplesmente publicar os roteiros originais: cada assunto deve ser contextualizado, explicado e associado a uma tarefa verificável.

## 3. Público-alvo

Novos desenvolvedores do SUAP e profissionais que precisam consultar a organização e o funcionamento do módulo `edu`. Pressupõe familiaridade básica com Python, leitura de código e navegação no VSCode; conteúdos de apoio devem esclarecer conceitos de Django e particularidades do SUAP quando necessário.

## 4. Objetivo geral

Capacitar o participante a localizar, compreender, investigar, alterar com segurança e validar funcionalidades do SUAP, priorizando exemplos do módulo `edu`.

### Objetivos específicos

- Reconhecer a arquitetura do SUAP e a organização de seus arquivos.
- Seguir o fluxo URL → view → model/ORM → view → template → resposta.
- Entender o uso de forms, admin, managers e relacionamentos.
- Interpretar decorators próprios, como `@rtr` e `@documento`.
- Identificar regras de grupos, permissões e autorização contextual.
- Investigar problemas com base em evidências, sem depender de tentativa e erro.
- Planejar correções, propor testes de regressão e documentar conclusões.

## 5. Plano de curso

**Carga horária:** 12 horas, distribuídas em seis encontros de duas horas.

| Encontro | Tema | Caso condutor | Abordagem | Situação do conteúdo no portal atual |
|---|---|---|---|---|
| 1 | Introdução ao fluxo do SUAP | URL → view → template na tela da turma | A — Exploração | Disponível no encontro 1 |
| 2 | Decoradores do SUAP | Decoradores, respostas e documentos PDF | A/C — Exploração e implementação | Disponível no encontro 2 |
| 3 | Permissões do SUAP | Grupos, sincronização e regras contextuais | A/B — Exploração e diagnóstico | Disponível no encontro 3 |
| 4 | Forms e relatórios do SUAP | Formulários, validações e filtros de relatórios | A/C — Exploração e implementação | Planejado |
| 5 | Models do SUAP | Turma, relacionamentos, managers e métodos de negócio | A/B — Exploração e diagnóstico | Planejado |
| 6 | Admin do SUAP | Listagens, filtros, buscas, ações e permissões administrativas | A/C — Exploração e implementação | Planejado |

**Organização:** os materiais existentes correspondem diretamente aos encontros 1, 2 e 3. Os encontros 4 (Forms e relatórios do SUAP), 5 (Models do SUAP) e 6 (Admin do SUAP) possuem páginas próprias sinalizadas como planejadas; exemplos já disponíveis na biblioteca permanecem acessíveis.

### Progressão metodológica

**Conhecer → Localizar → Compreender → Investigar → Corrigir → Validar.**

Atividades: **A — Exploração** (localizar e explicar); **B — Diagnóstico** (investigar evidências e causa provável); **C — Implementação** (corrigir e validar em ambiente isolado).

## 6. Conteúdo já implementado

O protótipo atual oferece:

- Página inicial com apresentação do curso e imagem do fluxo Django MTV.
- Plano de curso, objetivos, cronograma e referências.
- Três módulos temáticos com conceitos, exemplos, tarefas e questões de revisão.
- Biblioteca de código com trechos reais do model `Turma`, view `turma()` comentada e `djtools/utils/response.py`.
- Explicações de `@rtr`, `get_template_path`, `httprr` e `PDFResponse`.
- Checklists, feedback das questões, progresso e anotações salvos localmente.
- Exportação das anotações em Markdown, pesquisa local, tema claro/escuro, cópia de código e impressão.
- Indicação dos encontros 4, 5 e 6 como planejados, sem simular que já foram concluídos.

## 7. Estudos de caso e exemplos centrais

### A view `turma()` como fio condutor

A função `turma(request, pk)` permite relacionar os principais conceitos em um exemplo real:

1. A rota encaminha o identificador `pk` à view.
2. A view seleciona `Turma.objects` ou `Turma.locals`, conforme o perfil.
3. `get_object_or_404` recupera a turma.
4. `perms.realizar_procedimentos_academicos` avalia autorização contextual.
5. O model fornece alunos, diários, horários e pendências.
6. `return locals()` entrega o contexto ao mecanismo de renderização quando a view utiliza o decorator adequado.
7. `httprr` trata redirecionamentos e mensagens em fluxos específicos.

A biblioteca deve permitir comparar **código original**, **código comentado** e **explicação por conceito**, preservando a referência de arquivo e a origem do trecho.

### Outros casos sugeridos para expansão

- Horários de turma e aluno.
- Documentos acadêmicos em PDF.
- Regras de grupos, permissões e perfis acadêmicos.
- Relações Diretoria → CursoCampus → MatrizCurso e diagnóstico de dados inconsistentes.
- Pendências de diários, PCC e dispensa de nota.
- Conselho de Classe, quando houver material validado para a atividade.

## 8. Princípios pedagógicos e linguagem

A versão do participante deve ser **explicativa e orientada à aprendizagem**. Preferir construções como “Entenda como...”, “Observe...”, “Localize...”, “Compare...” e “Pratique...”. Evitar instruções exclusivas do instrutor, como “mostre na tela”, “explique aos alunos” ou “reserve 15 minutos”.

Estrutura recomendada de cada unidade: **objetivo de aprendizagem → conceito → exemplo real → explicação do código → atividade guiada → verificação de aprendizagem → referência para consulta**.

Gabaritos internos e roteiros de condução devem permanecer em material separado do conteúdo público do participante; escondê-los apenas com CSS não é proteção.

## 9. Tecnologias e arquitetura

- Interface: HTML5, CSS3 e JavaScript puro.
- Execução: arquivos estáticos abertos no navegador, sem servidor obrigatório, banco de dados ou autenticação.
- Conteúdo: atualmente incorporado em `dados.js` e `app.js`, com fontes de referência em `fontes/`.
- Persistência: `localStorage` para tarefas, respostas, tema e anotações.
- Exportação: arquivo Markdown gerado no navegador.
- Compatibilidade desejada: navegadores modernos, desktop e celular, inclusive uso offline.

A evolução pode separar os conteúdos em arquivos Markdown/JSON, desde que preserve uma forma simples e confiável de execução local. O carregamento por `fetch()` de arquivos locais pode falhar sob `file://`; se adotado, deve existir um modo de execução documentado ou uma etapa de geração estática.

## 10. Referências técnicas do treinamento

Conforme o plano de curso fornecido, o repositório analisado utiliza **Django 4.1.5**, **DRF 3.14.0**, **Celery 5.2.7**, **behave 1.2.6** e PostgreSQL no ambiente de desenvolvimento. Os arquivos relevantes incluem `edu/urls.py`, `edu/views.py`, `edu/forms.py`, `edu/admin.py`, `edu/perms.py`, `edu/managers.py`, `edu/models/*.py`, `djtools/utils/response.py`, `edu/tests.py` e `edu/features/*.feature`.

**Referência do levantamento:** commit `936e818c17` (investigação registrada em 11/10/2026). Caminhos e linhas de código precisam ser conferidos no checkout efetivamente utilizado; a documentação não deve presumir que continuam idênticos.

## 11. Escopo e limites

**Incluído:** documentação didática, navegação, exemplos, exercícios, revisão, anotações, progresso local e referência aos arquivos do SUAP.

**Fora do escopo inicial:** executar o SUAP no portal, acessar banco de dados acadêmico, modificar código do SUAP, sincronizar permissões, autenticar participantes, registrar notas em servidor ou emitir certificados.

As operações de escrita, alterações de permissões e exemplos que envolvam dados pessoais devem ser demonstrados somente em ambiente de desenvolvimento isolado e com dados fictícios.

## 12. Direção de evolução

1. Consolidar e revisar o conteúdo dos três módulos existentes, especialmente referências de arquivos e linhas.
2. Manter títulos, links, cronograma e referências alinhados à sequência dos seis encontros.
3. Aprimorar a biblioteca de código e as atividades de investigação no VSCode.
4. Produzir os materiais dos encontros 4, 5 e 6 com base em casos e testes reais.
5. Reforçar acessibilidade, responsividade, exportação e qualidade da documentação.
6. Opcionalmente, evoluir para uma biblioteca permanente de exemplos do módulo EDU.

## 13. Critérios de sucesso

O participante deve conseguir, com o portal e acesso ao repositório: localizar uma funcionalidade, explicar o fluxo de uma requisição, identificar o papel de um model/decorator/permissão, registrar evidências de um problema e propor uma validação coerente. O portal deve continuar simples de abrir, estudar e manter.
