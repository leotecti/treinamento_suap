# Encontro 3 — Permissões do SUAP

Objetivo: explicar como o SUAP organiza grupos e permissoes, como o `permissions.yaml` alimenta essas permissoes e onde elas sao checadas nas telas, menus, views, templates e managers.

## I. Conceito de Grupos no SUAP

Comece explicando que grupo e uma forma de atribuir um conjunto de permissoes a varios usuarios.

Frase para usar: em vez de dar permissao usuario por usuario, o SUAP coloca o usuario em um grupo; o grupo carrega as permissoes.

### 1. Mostrar na tela

Na interface administrativa, mostre um usuario e seus grupos.

Pontos para explicar:

- Um usuario pode pertencer a varios grupos.
- Um grupo pode ter varias permissoes.
- A permissao efetiva do usuario e a soma das permissoes dos grupos dele, mais permissoes diretas, se existirem.

Exemplo de grupos no contexto EDU:

- `Administrador Acadêmico`;
- `Secretário Acadêmico`;
- `Coordenador de Curso`;
- `Organizador de Minicurso`;
- `Diretor Acadêmico`.

### 2. Mostrar no `permissions.yaml`

Arquivo: `edu/permissions.yaml`.

Explique que o arquivo declara quais permissoes cada grupo deve receber.

Exemplo em `edu/permissions.yaml:46-52`:

```yaml
Administrador Acadêmico:
  edu:
    aluno:
    - view_aluno
    - view_dados_academicos
    - view_dados_pessoais
```

Leitura:

```text
Grupo: Administrador Acadêmico
App: edu
Modelo: aluno
Permissao: view_aluno
Permissao completa: edu.view_aluno
```

Ponto importante: o YAML declara permissoes para grupos, mas ele nao e consultado diretamente por cada tela em tempo real.

### 3. Explicar grupos e permissoes

Explique a diferenca:

- Grupo: conjunto de usuarios com um papel comum.
- Permissao: capacidade de realizar ou visualizar algo no sistema.
- Codename: nome tecnico da permissao, como `view_aluno`.
- Permissao completa: `app.codename`, como `edu.view_aluno`.

Exemplo:

```python
request.user.has_perm('edu.view_aluno')
```

Essa linha pergunta: o usuario logado possui a permissao `view_aluno` do app `edu`?

### 4. Explicar o `edu/perms.py`

Arquivo: `edu/perms.py`.

Explique que `permissions.yaml` diz quais permissoes o grupo possui. Ja o `perms.py` concentra regras contextuais.

Exemplo: nao basta perguntar "tem permissao?". As vezes a pergunta real e:

- pode atuar neste curso?
- e do mesmo campus?
- e coordenador deste curso?
- pode mexer em ENADE deste aluno?
- e o proprio aluno?

Exemplo em `edu/perms.py:92-106`:

```python
def pode_realizar_procedimentos_enade(user, curso_campus):
    ...
```

Essa funcao decide se o usuario pode realizar procedimentos ENADE naquele curso especifico.

Frase para usar: o `permissions.yaml` entrega o cracha; o `perms.py` decide se aquele cracha vale naquele contexto.

## II. Como o `permissions.yaml` Vira Permissao no Banco

### 1. Comando `sync_permissions`

Depois que o `sync_permissions` roda, os grupos recebem as permissoes declaradas no YAML.

Referencia:

- O comando procura arquivos `permissions.yaml` em `djtools/management/commands/sync_permissions.py:137`.

Trecho importante:

```python
permissionFileName = f'{app}/permissions.yaml'
```

### 2. Funcao `sync_groups_and_permissions`

Implementacao: `djtools/utils/__init__.py:1650`.

Essa funcao:

- cria ou obtem o grupo;
- localiza as permissoes Django;
- associa as permissoes ao grupo.

Trecho conceitual:

```python
group, created = Group.objects.get_or_create(name=group_name)
group.permissions.add(perm)
```

### 3. Fluxo completo

Explique o fluxo nesta ordem:

1. Voce declara a permissao no `permissions.yaml`.
2. O comando `sync_permissions` le esse arquivo.
3. O SUAP cria/atualiza grupos e associa permissoes Django.
4. Quando o usuario acessa uma tela, o sistema checa `user.has_perm(...)`, decorators, templates, menus ou managers.
5. Se o usuario pertence a um grupo que recebeu aquela permissao, a checagem passa.

Resumo: o YAML alimenta o banco. A tela consulta as permissoes ja sincronizadas no banco.

## III. Como as Telas Checam Permissoes

### 1. Na view com `has_perm`

Exemplo em `edu/views.py:11270-11275`:

```python
if (
    not request.user.has_perm('edu.efetuar_matricula')
    and not request.user.has_perm('edu.gerar_relatorio')
    and not request.user.has_perm('edu.view_aluno')
):
    return httprr('/', 'Você não tem permissão para acessar essa página', 'error')
```

Explicacao:

- A view verifica permissoes diretamente.
- Se o usuario nao tiver nenhuma das permissoes aceitas, ele e bloqueado.

Outro exemplo importante: tela do aluno em `edu/views.py:4703`.

```python
request.user.has_perm('edu.view_aluno')
```

### 2. No template com `perms.edu.view_aluno`

Exemplo em `edu/templates/relatorio.html:159-161`:

```django
{% if perms.edu.view_aluno %}
    <a target="_blank" href="{{ aluno.get_absolute_url }}">{{ aluno.matricula }}</a>
{% else %}
    {{ aluno.matricula }}
{% endif %}
```

Explicacao:

- Se o usuario tem permissao, o template mostra um link.
- Se nao tem, mostra apenas a matricula.
- Isso controla apresentacao, nao substitui a validacao na view de destino.

### 3. No menu

Arquivo: `edu/menu.yaml:8-11`.

```yaml
Ensino::Alunos e Professores::Alunos:
  permissions_required:
  - edu.view_aluno
  url: /admin/edu/aluno/correntes
```

Explicacao:

- A permissao controla se o item de menu aparece.
- Se o usuario nao tem `edu.view_aluno`, o menu nao deve ser exibido.
- Mas esconder menu nao bloqueia URL direta; a view/admin tambem precisa validar.

### 4. Em decorators

Exemplo em `edu/views.py:11837-11839`:

```python
@rtr()
@permission_required('edu.view_convocacaoenade')
def convocados_enade(request, pk, curso_campus_pk):
```

Explicacao:

- O decorator verifica a permissao antes de executar a view.
- Se o usuario nao possuir a permissao, a view nao roda.

### 5. Em managers/querysets

Exemplo em `edu/managers.py:671-681`:

```python
if user.groups.filter(permissions__codename='view_aluno').count() == 1:
    ...
    return qs.filter(polo__id__in=ids)
```

Explicacao:

- A permissao tambem pode influenciar o conjunto de objetos visiveis.
- Aqui, a regra afeta quais alunos aparecem para determinado perfil.

## IV. Como Analisar Demandas de Permissao

Use este checklist:

1. A permissao existe no `permissions.yaml`?
2. O grupo correto recebeu essa permissao?
3. O `sync_permissions` foi executado?
4. A view, template, menu ou manager realmente consulta essa permissao?
5. Existe regra contextual adicional em `views.py`, `perms.py` ou managers?
6. A mudanca envolve dados pessoais ou academicos sensiveis?
7. Esconder botao e suficiente ou a URL tambem precisa ser bloqueada?

Frase para usar: permissao no SUAP raramente esta em um unico lugar; ela pode estar declarada no YAML, aplicada pelo sync, checada na view, filtrada no manager e exibida no template.

## V. Exemplos Praticos

### 1. Remover acesso aos detalhes da tela do aluno

Tela de exemplo:

- `http://localhost:8000/edu/aluno/20262SEN00060024/`

Perfil sugerido:

- `Secretário Acadêmico`.

Roteiro:

1. Mostrar o usuario com permissao.
2. Abrir a tela do aluno e confirmar que o acesso funciona.
3. Localizar o grupo no `edu/permissions.yaml`.
4. Remover temporariamente a permissao relacionada, por exemplo `view_aluno`.
5. Rodar `sync_permissions`.
6. Testar novamente com o mesmo usuario.
7. Explicar se o bloqueio veio da view, do menu, do manager ou de outra regra.

Ponto de cuidado: remover `view_aluno` pode afetar varias telas, links e consultas, nao apenas a tela de detalhe.

### 2. Remover botao `Adicionar Aluno` do admin de aluno

Tela:

- `http://localhost:8000/admin/edu/aluno/`

Perfil sugerido:

- `Secretário Acadêmico`.

Roteiro:

1. Mostrar o usuario com permissao.
2. Abrir o admin de aluno e observar o botao `Adicionar Aluno`.
3. Identificar qual permissao controla adicao de aluno, normalmente `edu.add_aluno`.
4. Remover temporariamente essa permissao do grupo no `permissions.yaml`.
5. Rodar `sync_permissions`.
6. Testar novamente.
7. Explicar que o admin do Django usa permissoes `add`, `change`, `delete` e `view` para controlar botoes e acoes.

Ponto de cuidado: remover `add_aluno` nao deve ser tratado como mudanca visual; e uma alteracao de permissao real no admin.

## VI. Chamados Atendidos

### 1. Issue 1144: permissoes para `Organizador de Minicurso`

Contexto: o grupo `Organizador de Minicurso` precisava visualizar dados de aluno.

Mostrar o diff do merge:

- `400d69076d`

Arquivo:

- `edu/permissions.yaml:2101-2107`

Estado atual:

```yaml
Organizador de Minicurso:
  description: Usuários deste grupo gerenciam os minicursos.
  edu:
    aluno:
    - view_aluno
    - view_dados_academicos
    - view_dados_pessoais
```

Explicar:

- `edu.view_aluno`: permite passar por verificacoes gerais de visualizacao de aluno.
- `edu.view_dados_academicos`: participa da regra `pode_ver_dados_academicos` em `edu/views.py:4666-4672`.
- `edu.view_dados_pessoais`: aparece em condicoes de template, por exemplo `edu/templates/aluno.html:402-407`.

Mostrar no template:

```django
{% if perms.edu.view_dados_pessoais or is_proprio_aluno %}
```

Cuidado: conceder acesso a dados pessoais e academicos amplia acesso a informacoes sensiveis. A analise deve registrar grupo, motivo, telas afetadas e escopo.

### 2. Issue 1168: `Secretário Acadêmico` na aba ENADE

Contexto: a demanda nao foi resolvida apenas no `permissions.yaml`; ela alterou uma regra contextual em `edu/perms.py`.

Mostrar o diff do merge:

- `051aed03cd`

Arquivo:

- `edu/perms.py:92-106`

Ponto central:

```python
autorizado = UsuarioGrupo.objects.filter(
    user=user,
    group__name__in=[
        'Administrador Acadêmico',
        'Diretor de Avaliação e Regulação do Ensino',
        'Operador ENADE',
        'Secretário Acadêmico',
    ],
).exists()
```

Na tela do aluno, mostrar `edu/views.py:5099-5101`:

```python
pode_realizar_procedimentos_enade = perms.pode_realizar_procedimentos_enade(request.user, obj.curso_campus) and not obj.is_concluido()
```

No template da aba ENADE, mostrar `edu/templates/tabs/aluno_convocacoes_enade.html:17-18`:

```django
{% if pode_realizar_procedimentos_enade or is_coordenador %}
    <th class="no-print">Opções</th>
{% endif %}
```

Explicacao:

- `permissions.yaml` diz quais permissoes o grupo tem.
- `pode_realizar_procedimentos_enade` decide se o usuario pode realizar procedimentos ENADE naquele curso.
- O template decide se mostra opcoes de acao.

### 3. Issue 1157: remover opcao `Documentos` para alunos especiais

Contexto: a issue removeu o botao/menu `Documentos` para alunos especiais.

Mostrar o diff do merge:

- `6fae1e80a6`

Arquivo:

- `edu/templates/aluno.html:188-195`

Condicao atual:

```django
{% if not obj.aluno_especial %}
    <a class="btn default" href="#">Documentos</a>
{% endif %}
```

Explicacao:

- Este caso tem relacao com permissao porque muda a experiencia de acesso conforme perfil/situacao do aluno.
- Mas isso e apenas controle visual.
- Os links internos continuam no bloco abaixo, em `urls_documentos`.
- Se a regra precisa impedir acesso direto ao documento, deve existir validacao na view do documento, nao apenas no template.

## VII. Fechamento

Reforce a ideia principal:

- `permissions.yaml` declara permissoes dos grupos.
- `sync_permissions` grava essas permissoes no banco.
- `has_perm`, decorators, templates, menus e managers consultam essas permissoes.
- `perms.py` trata regras contextuais.
- Template pode esconder um botao, mas nao deve ser a unica protecao.

Mensagem final: para resolver chamado de permissao com seguranca, siga o caminho completo: grupo -> YAML -> sync -> checagem -> regra contextual -> tela.
