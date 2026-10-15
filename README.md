# Portal SUAP EDU — Guia do SUAP

Portal estático de estudo para novos desenvolvedores do SUAP, com foco no módulo `edu`.

## Como abrir

Extraia o ZIP e abra `index.html` no navegador. Não é necessário servidor, instalação ou internet.

## Conteúdo

- Página inicial com diagrama Django MTV.
- Plano de curso completo, 6 encontros de 2 horas (`plano_curso.md`).
- Material disponível para os encontros 1, 2 e 3: introdução ao fluxo do SUAP; decoradores do SUAP; permissões do SUAP.
- Biblioteca de trechos reais do model `Turma` e de `djtools/utils/response.py`, além da view `turma()` comentada.
- Checklists, questões de revisão com feedback, anotações locais e exportação Markdown.
- Busca local, tema claro/escuro, cópia de código e impressão.
- Seção de próximos encontros (4, 5 e 6 planejados, Forms e relatórios, Models e Admin, ainda sem material completo).

## Organização

- `index.html`, `style.css`, `chamados.css`, `app.js`, `dados.js`: interface, área reutilizável de chamados e dados.
- `fluxo_django_mtv.png`: diagrama introdutório.
- `plano_curso.md`: documento integral do plano.

## Precisão e segurança

Os trechos de código foram extraídos dos arquivos anexados. Os números de linha referem-se à versão fornecida, e devem ser verificados no repositório antes de cada treinamento.

As questões são formativas e não substituem avaliação prática. O progresso e as anotações ficam no `localStorage` do navegador; não há contas, sincronização ou banco de dados.

Use ambientes isolados e dados fictícios nos exercícios. Não reutilize permissões fixas dos exemplos para acessar dados pessoais, não altere permissões de produção e evite operações de alteração de dados por GET.
