# Plano de Curso — Desenvolvimento SUAP com foco no EDU

## Justificativa

O SUAP analisado é um projeto Django grande, modular e com componentes próprios. O módulo `edu` concentra regras acadêmicas, cadastros, diários, horários, histórico, relatórios, documentos, permissões por setor e rotinas de gestão. Novos desenvolvedores precisam aprender menos “Django genérico” e mais como localizar, investigar, alterar e validar comportamentos neste código real.

## Público-alvo

Novos desenvolvedores que atuarão na manutenção e evolução do SUAP.

## Carga horária

12 horas, em 6 encontros de 2 horas.

## Objetivo geral

Preparar os participantes para localizar funcionalidades, compreender fluxos web, investigar chamados, alterar regras de negócio e validar correções no SUAP, priorizando exemplos do módulo `edu`.

## Objetivos específicos

- Reconhecer a organização do projeto e do módulo `edu`.
- Mapear uma URL até view, model, form, template e admin.
- Entender managers locais, filtros por diretoria e verificações de permissão.
- Ler consultas ORM e relacionamentos acadêmicos.
- Investigar problemas por evidências: tela, URL, queryset, traceback, dados e testes.
- Planejar correções pequenas e seguras.
- Criar ou adaptar testes de regressão.

## Versões e tecnologias confirmadas no repositório analisado

- Django `4.1.5`: `requirements.txt:38`.
- DRF `3.14.0`: `requirements.txt:66`.
- Celery `5.2.7`: `requirements.txt:19`.
- behave `1.2.6`: `requirements.txt:12`.
- PostgreSQL no compose de desenvolvimento: `docker/docker-compose.dev.yml:97-104`.
- Servidor de desenvolvimento: `python manage.py runserver 0.0.0.0:8000`, em `docker/docker-compose.dev.yml:17`.

## Particularidades do SUAP observadas

- Models do `edu` distribuídos em `edu/models/*.py` e reexportados por `edu/models/__init__.py:1-31`.
- Decorators próprios: `@rtr`, `@documento`, `@permission_required` e `@group_required`.
- Managers `locals` com filtros por usuário, setor, diretoria ou UO; exemplo `FiltroDiretoriaManager` em `edu/managers.py:13-69`.
- Admin com `ModelAdminPlus`, abas personalizadas e exportações.
- Testes em `edu/tests.py` e cenários BDD em `edu/features/*.feature`.
- Comentários IFG e referências a issues como estudos de caso.

## Resumo da investigação do repositório

Arquitetura: Django 4.1.5, settings em `suap/settings.py` e `suap/settings_base.py`, apps por domínio e componentes `djtools`. No `edu`, URLs em `edu/urls.py`, views em `edu/views.py`, forms em `edu/forms.py`, admin em `edu/admin.py`, permissões em `edu/perms.py`, managers em `edu/managers.py` e models em `edu/models/*.py`.

Casos: horários de turma/aluno; definição de horário de diário com conflito de sala; permissões por grupo/setor; pendências por diretoria; Conselho de Classe; documentos acadêmicos PDF; histórico e carga horária; boletins; diário pendente com PCC e `nao_exige_nota`.

## Metodologia

Conhecer → Localizar → Compreender → Investigar → Corrigir → Validar.

- Tipo A — Exploração: localizar e explicar uma funcionalidade existente.
- Tipo B — Diagnóstico: investigar a causa provável de um problema.
- Tipo C — Implementação: propor ou codificar uma correção em ambiente isolado e validar.

## Cronograma

Os seis encontros seguem os temas apresentados no menu do portal. Cada encontro tem duração de duas horas.

| Encontro | Tema do menu | Caso principal | Tipo de atividade | Duração |
|---|---|---|---|---|
| 1 | Introdução ao fluxo do SUAP | URL → view → template na tela da turma | A — Exploração | 2 horas |
| 2 | Decoradores do SUAP | Decoradores, respostas e documentos PDF | A/C — Exploração e implementação | 2 horas |
| 3 | Permissões do SUAP | Grupos, sincronização e regras contextuais | A/B — Exploração e diagnóstico | 2 horas |
| 4 | Forms e relatórios | Formulários, validações e filtros de relatórios | A/C — Exploração e implementação | 2 horas |
| 5 | Models do SUAP | Turma, relacionamentos, managers e métodos de negócio | A/B — Exploração e diagnóstico | 2 horas |
| 6 | Admin do SUAP | Listagens, filtros, buscas, ações e permissões administrativas | A/C — Exploração e implementação | 2 horas |

## Avaliação

- Participação nas investigações orientadas.
- Entregáveis das atividades.
- Capacidade de justificar evidências com arquivo e linha.
- Clareza na formulação de causa raiz.
- Qualidade da proposta de teste de regressão.

## Bibliografia e referências

- Código SUAP do repositório analisado.
- Documentação Django 4.1: URL dispatcher, views, forms, models, admin, testing.
- Documentação Python 3: exceções, depuração, `decimal.Decimal`.
- Documentação behave 1.2.6: cenários BDD.

## Observações de precisão

As linhas do plano foram verificadas no workspace em 2026-10-11. O repositório tinha alterações locais em `docker/Dockerfile`, `docker/dev/sources.list` e `ifg_instalador_cliente_oracle_linux`. As linhas podem mudar com futuras edições. Os números apresentados nos exemplos extraídos dos dois arquivos anexados correspondem à versão enviada nesta conversa e devem ser conferidos no checkout de trabalho.
