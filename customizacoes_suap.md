# Apendice - Customizacoes Basicas do SUAP

## 1. Objetivo

O SUAP e construido sobre o Django. Portanto, URLs, views, models, forms,
templates, admin e permissoes continuam seguindo o fluxo do framework. Ao
mesmo tempo, o projeto possui uma camada chamada **DJTools**, que acrescenta
atalhos e padroes usados em diversos modulos.

Este apendice apresenta apenas as customizacoes mais frequentes e necessarias
para iniciar o desenvolvimento no SUAP.

```text
Django                         SUAP/DJTools
------                         ------------
Model                          ModelPlus e campos Plus
Form / ModelForm               FormPlus / ModelFormPlus
render()                       @rtr()
HttpResponseRedirect           httprr()
ModelAdmin                     ModelAdminPlus
templates Django               super_template, box e render_form
permissoes Django              permissions.yaml e regras contextuais
HttpResponse com PDF           PDFResponse e @documento
```

> O sufixo `Plus` normalmente significa que o SUAP preservou o recurso do
> Django e acrescentou comportamento. Para entender uma classe `Plus`, primeiro
> identifique de qual classe do Django ela herda.

## 2. DJTools

### 2.1. O que e o DJTools

O **DJTools** e uma aplicacao interna do SUAP que concentra classes, funcoes,
decoradores, campos, widgets, templates e outros recursos reutilizados pelos
modulos do sistema.

Ele nao faz parte do Django e nao substitui o framework. O DJTools e uma camada
construida **sobre o Django** para atender necessidades recorrentes do SUAP.

```text
Python
  |
  v
Django
  |
  v
DJTools: extensoes e padroes compartilhados
  |
  v
Modulos do SUAP: EDU, RH, Patrimonio, Estagios etc.
```

A propria configuracao da aplicacao descreve sua finalidade:

**Arquivo:** `djtools/apps.py`  
**Linhas:** `11-20`

```python
class DjtoolsConfig(SuapAppConfig):
    default = True
    name = 'djtools'
    verbose_name = 'Djtools'
    description = (
        'Gerencia classes e funcoes utilitarias '
        'utilizadas para o desenvolvimento do SUAP.'
    )
    area = 'Tecnologia da Informacao'

    def ready(self):
        import djtools.history
```

O DJTools esta registrado como uma aplicacao instalada em
`suap/settings_base.py:173-183`. Ele aparece antes de
`django.contrib.admin`, permitindo que suas customizacoes participem da
infraestrutura administrativa do projeto:

```python
PRE_INSTALLED_APPS_SUAP = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    # ...
    'djtools',
    'django.contrib.admin',
    # ...
)
```

### 2.2. Por que essa camada foi criada

Um sistema grande possui necessidades que aparecem em varios modulos. Sem uma
camada compartilhada, cada aplicacao precisaria implementar novamente, por
exemplo:

- renderizacao padronizada de telas e formularios;
- campos com widgets e validacoes institucionais;
- autocomplete para grandes cadastros;
- controle de acesso por grupos e permissoes;
- redirecionamentos com mensagens;
- administracao com abas, filtros e exportacao;
- geracao e resposta de documentos PDF;
- componentes visuais e formatacao de dados;
- customizacoes especificas por instalacao.

O DJTools centraliza essas solucoes. Assim, os modulos podem concentrar seu
codigo nas regras de negocio, enquanto a infraestrutura comum fica em um unico
pacote.

Exemplo:

```text
Sem uma camada comum:
EDU cria seu autocomplete
RH cria outro autocomplete
Patrimonio cria outro autocomplete

Com DJTools:
todos reutilizam AutocompleteWidget
```

### 2.3. Como o DJTools funciona

O DJTools atua principalmente de quatro formas.

#### 1. Heranca de classes do Django

Uma classe do DJTools herda de uma classe nativa e acrescenta comportamento:

```text
django.db.models.Model       -> djtools ModelPlus
django.forms.Form            -> djtools FormPlus
django.forms.ModelForm       -> djtools ModelFormPlus
django.contrib.admin.ModelAdmin -> djtools ModelAdminPlus
django.http.HttpResponse     -> djtools PDFResponse
```

Exemplo real de `ModelFormPlus`, em `djtools/forms/__init__.py:65-74`:

```python
class ModelFormPlus(forms.ModelForm, metaclass=MetaModelFormPlus):
    def __init__(self, *args, **kwargs):
        if 'request' in kwargs:
            self.request = kwargs.pop('request')
        super().__init__(*args, **kwargs)
```

O `ModelFormPlus` continua sendo um `ModelForm`. O comportamento nativo de
campos, validacao, `instance` e `save()` vem do Django; o DJTools acrescenta o
`request` opcional e o suporte a LPS.

#### 2. Funcoes e decoradores auxiliares

Alguns recursos envolvem funcoes existentes, reduzindo codigo repetitivo:

```python
from djtools.utils import httprr, permission_required, rtr


@permission_required('edu.view_turma')
@rtr()
def turma(request, pk):
    obj = get_object_or_404(Turma.locals, pk=pk)
    title = str(obj)
    return locals()
```

Nesse exemplo:

- `permission_required` verifica o acesso;
- `rtr` transforma o dicionario retornado em resposta HTML;
- `httprr`, quando usado, redireciona e apresenta uma mensagem.

#### 3. Componentes de template e interface

O DJTools fornece templates, tags e filtros reutilizaveis:

```django
{% extends super_template %}

{% block content %}
    {% box 'Dados Gerais' %}
        {% render_form form %}
    {% endbox %}
{% endblock %}
```

As tags globais sao configuradas em `suap/settings_base.py:141-148` e suas
implementacoes ficam principalmente em `djtools/templatetags/`.

#### 4. Integracao com a configuracao do projeto

Alguns recursos atuam de forma global porque o DJTools esta integrado ao
projeto por meio de:

- `INSTALLED_APPS`;
- templates e arquivos estaticos;
- tags e filtros de template;
- middlewares;
- comandos de gerenciamento;
- storages;
- mecanismos de historico e LPS.

Por isso, nem toda customizacao aparece diretamente no arquivo do modulo. Um
comportamento observado no EDU pode ter sido definido em `djtools/`.

### 2.4. Organizacao basica do pacote

| Local | Responsabilidade principal | Exemplo |
|---|---|---|
| `djtools/db/` | Models, campos e recursos do ORM | `ModelPlus`, `ForeignKeyPlus` |
| `djtools/forms/` | Forms, campos e widgets | `FormPlus`, `FileFieldPlus` |
| `djtools/contrib/admin/` | Extensoes do admin | `ModelAdminPlus` |
| `djtools/utils/` | Decoradores, respostas e utilitarios | `rtr`, `httprr`, `documento` |
| `djtools/templates/` | Templates compartilhados | formulario e admin |
| `djtools/templatetags/` | Tags e filtros | `box`, `render_form`, `format_` |
| `djtools/ui/` | Componentes de interface em Python | `TabelaHorario` |
| `djtools/html/` | Graficos e componentes HTML | `ColumnChart`, `CalendarioPlus` |
| `djtools/management/commands/` | Comandos de administracao | `sync_permissions` |
| `djtools/middleware/` | Processamento global de requisicoes | contexto do usuario |
| `djtools/testutils/` | Apoio aos testes do SUAP | utilitarios de teste |

O iniciante nao precisa conhecer todo o pacote. O importante e saber pesquisar
o simbolo importado e identificar a classe Django da qual ele deriva.

### 2.5. Exemplos de uso no EDU

#### Models

`edu/models/plano_ensino.py:1-18` importa os models do DJTools. Em um trecho
didatico reduzido:

```python
from djtools.db import models


class PlanoEnsino(LogModel):
    diario = models.ForeignKeyPlus('edu.Diario')
    ementa = models.TextField('Ementa', default='', blank=True)
    data_submissao = models.DateFieldPlus(
        'Data da Submissao',
        null=True,
    )
```

O mesmo namespace oferece `TextField`, herdado do Django, e campos adicionais,
como `ForeignKeyPlus` e `DateFieldPlus`.

#### Forms

O EDU importa o namespace em `edu/forms.py:49`:

```python
from djtools import forms


class RelatorioHorarioForm(forms.FormPlus):
    METHOD = 'GET'
    SUBMIT_LABEL = 'Pesquisar'
```

Isso permite usar tanto campos do Django quanto extensoes do DJTools por meio
de `forms`.

#### Views

`edu/views.py:63-78` importa diversos recursos:

```python
from djtools.utils import (
    documento,
    group_required,
    httprr,
    permission_required,
    rtr,
)
from djtools.utils.response import PDFResponse
```

#### Admin

`edu/admin.py:13-17` usa extensoes administrativas e utilitarios:

```python
from djtools.contrib.admin import ModelAdminPlus
from djtools.utils import httprr
```

Esses imports sao um sinal imediato de que o comportamento nao esta apenas no
Django nem apenas no modulo EDU.

### 2.6. Vantagens

#### Padronizacao

Telas, formularios, mensagens e listagens seguem uma experiencia semelhante em
modulos diferentes.

#### Reutilizacao

Uma solucao comum e implementada uma vez e pode ser utilizada pelo sistema
inteiro.

#### Produtividade

Recursos como `@rtr()`, `{% render_form %}` e `ModelAdminPlus` reduzem o codigo
necessario para fluxos administrativos frequentes.

#### Regras centralizadas

Validacoes, campos, formatos e comportamentos compartilhados podem ser
corrigidos em um ponto comum.

#### Integracao com o SUAP

As extensoes conhecem convencoes do projeto, como LPS, managers contextuais,
permissoes, templates e documentos.

#### Evolucao gradual

Como muitas classes herdam das classes do Django, o desenvolvedor continua
usando conceitos conhecidos do framework e aprende apenas os acrescimos.

### 2.7. Cuidados ao usar ou alterar

O fato de o DJTools facilitar o desenvolvimento nao elimina a necessidade de
entender o Django que existe por baixo.

Cuidados principais:

- confirme se o recurso e do Django, do DJTools ou do modulo de negocio;
- leia a implementacao antes de presumir o significado do sufixo `Plus`;
- prefira o padrao ja adotado no modulo;
- nao crie uma nova abstracao se o DJTools ja oferece o recurso;
- uma alteracao em `djtools/` pode afetar muitos modulos;
- teste os principais consumidores ao modificar uma classe compartilhada;
- verifique integracoes implicitas, como request, thread local, LPS e templates;
- nao confunda conveniencia de interface com autorizacao de backend.

Regra pratica:

```text
Alteracao em edu/       -> impacto normalmente concentrado no modulo EDU
Alteracao em djtools/   -> impacto potencial em todo o SUAP
```

### 2.8. Visao geral do fluxo

```text
Navegador
   |
   v
URL do modulo
   |
   v
View + decoradores de acesso
   |
   +-- consulta Model/Manager
   +-- instancia FormPlus/ModelFormPlus
   +-- retorna resposta direta
   |
   v
@rtr() renderiza o template
   |
   v
Template herda super_template e usa tags do DJTools
```

Exemplo real do EDU:

- URL: `edu/urls.py:27`;
- view: `edu/views.py:1556-1599`;
- template parcial: `edu/templates/horarios_turma.html:1-35`;
- model consultado: `Turma`;
- permissao exigida: `edu.view_turma`.

## 3. URLs

### 3.1. O que continua sendo Django

O modulo usa `django.urls.path` e uma lista chamada `urlpatterns`:

```python
from django.urls import path

from edu import views

urlpatterns = [
    path('turma/<int:pk>/', views.turma),
]
```

**Arquivo:** `edu/urls.py`  
**Linhas:** `1-5` e `27`

O conversor `<int:pk>` transforma o trecho da URL em inteiro e o entrega para
a view como argumento nomeado `pk`.

### 3.2. Inclusao automatica das URLs dos modulos

No SUAP, o arquivo geral percorre `settings.INSTALLED_APPS` e inclui
automaticamente o `urls.py` de cada aplicacao existente.

**Arquivo:** `suap/urls.py`  
**Linhas:** `45-54`

```python
for app in settings.INSTALLED_APPS:
    if not app.startswith('django.'):
        if os.path.exists(os.path.join(settings.BASE_DIR, '%s/urls.py' % app)):
            urlpatterns += [
                path('%s/' % app, include('%s.urls' % app))
            ]
```

Consequencia pratica:

```python
# edu/urls.py
path('turma/<int:pk>/', views.turma)
```

torna-se acessivel por:

```text
/edu/turma/123/
```

Normalmente nao e necessario adicionar manualmente `include('edu.urls')` no
arquivo geral.

### 3.3. Cuidados basicos

- coloque a rota no `urls.py` do modulo correto;
- use conversores coerentes, como `<int:pk>` e `<str:matricula>`;
- mantenha a barra final adotada pelo projeto;
- proteja a view: esconder o link no template nao protege a URL;
- verifique rotas parecidas antes de criar uma nova.

## 4. Views

### 4.1. `@rtr()`: renderizacao simplificada

`rtr` pode ser entendido, na pratica, como um atalho para **retornar uma
resposta de template**. E um decorador do DJTools que recebe o retorno da view
como contexto e renderiza um template.

**Implementacao:** `djtools/utils/response.py:148-198`

```python
@rtr()
def minha_tela(request):
    title = 'Minha Tela'
    objetos = MeuModel.objects.all()
    return locals()
```

Sem um nome explicito, `@rtr()` procura um template baseado no nome da funcao.
No exemplo, o nome esperado e normalmente `minha_tela.html`.

Tambem e possivel informar o template:

```python
@rtr('meu_template.html')
def minha_tela(request):
    title = 'Minha Tela'
    return locals()
```

O `return locals()` devolve um dicionario com as variaveis locais da funcao.
Assim, `title` e `objetos` ficam disponiveis no template.

> Use `locals()` com consciencia: todas as variaveis locais entram no contexto.
> Para uma view pequena esse padrao e conveniente; em uma view complexa, confira
> quais objetos estao sendo expostos ao template.

### 4.2. Exemplo real de `@rtr()`

**Arquivo:** `edu/views.py`  
**Linhas:** `1556-1563` e `1596-1599`

Versao didatica equivalente ao trecho real:

```python
@permission_required('edu.view_turma')
@rtr()
def turma(request, pk):
    manager = (
        Turma.objects
        if request.user.has_group_cached('Diretor Academico')
        else Turma.locals
    )
    obj = get_object_or_404(manager, pk=pk)
    title = f'Turma{obj}'

    semestre = request.GET.get('semestre') or '1'
    turnos = obj.get_horarios(semestre)
    return locals()
```

Leitura do fluxo:

1. `permission_required` verifica a permissao geral;
2. o manager limita quais turmas podem ser consultadas;
3. a view prepara as variaveis;
4. `locals()` entrega o contexto;
5. `rtr()` localiza e renderiza o template.

### 4.3. Decoradores de acesso

O EDU importa os decoradores do DJTools em `edu/views.py:63-75`.

#### `@permission_required`

Especializa o decorador de permissoes do Django e aceita uma ou mais permissoes
com logica `or` ou `and`.

**Implementacao:** `djtools/utils/__init__.py:1783-1818`

```python
@permission_required('edu.view_turma')
def turma(request, pk):
    ...
```

#### `@group_required`

Permite o acesso aos usuarios pertencentes aos grupos informados.

**Implementacao:** `djtools/utils/__init__.py:1753-1780`

```python
@group_required(
    'Administrador Academico, Diretor Academico, Secretario Academico'
)
def minha_view(request):
    ...
```

Prefira uma permissao quando ela representar a capacidade exigida. Use grupo
quando a regra depender realmente de um papel institucional especifico.

### 4.4. `httprr()`: redirecionamento com mensagem

`httprr()` e um atalho do SUAP para redirecionar e registrar uma mensagem para
o usuario.

**Implementacao:** `djtools/utils/response.py:24-80`

```python
if form.is_valid():
    form.save()
    return httprr('..', 'Registro salvo com sucesso.')
```

Argumentos basicos:

| Argumento | Funcao |
|---|---|
| `url` | Destino do redirecionamento |
| `message` | Mensagem apresentada ao usuario |
| `tag` | Tipo da mensagem: `success`, `warning` ou erro |
| `anchor` | Ancora acrescentada ao destino |
| `get_params` | Parametros de consulta adicionais |
| `close_popup` | Fecha a janela de popup quando aplicavel |

Atalhos frequentes:

```python
return httprr('.', 'Atualizado.')       # pagina atual
return httprr('..', 'Salvo.')           # pagina anterior do breadcrumb
return httprr('..', 'Falha.', 'error')  # mensagem de erro
```

## 5. Models

### 5.1. Importacao de models do DJTools

Em muitos models do SUAP aparece:

```python
from djtools.db import models
```

Exemplo: `edu/models/plano_ensino.py:1`.

Esse objeto disponibiliza os campos nativos do Django e os campos adicionais
do DJTools. Por isso e possivel usar no mesmo arquivo:

```python
ementa = models.TextField('Ementa')                # Django
data = models.DateFieldPlus('Data')                # SUAP
diario = models.ForeignKeyPlus('edu.Diario')       # SUAP
```

### 5.2. `ModelPlus`

`ModelPlus` e uma classe abstrata do DJTools que herda de `django.db.models.Model`.

**Implementacao:** `djtools/db/models/__init__.py:449-534`

Ela define ou acrescenta, entre outros comportamentos:

- permissoes padrao `add`, `change`, `delete` e `view`;
- representacao textual padrao quando o model nao define `__str__()`;
- metodo de pesquisa `search()`;
- atualizacao do campo otimizado de busca, quando ele existe.

```text
django.db.models.Model
          |
          v
       ModelPlus
          |
          v
      model do SUAP
```

Nem todo model declara `ModelPlus` diretamente. No EDU, muitos herdam de outra
classe que ja deriva dele, como `LogModel`.

### 5.3. `LogModel`

`LogModel` e uma classe abstrata do EDU que herda de `ModelPlus` e registra
alteracoes quando o log educacional esta habilitado.

**Implementacao:** `edu/models/logs.py:82-125`

Exemplo real:

```python
from djtools.db import models
from edu.models.logs import LogModel


class PlanoEnsino(LogModel):
    diario = models.ForeignKeyPlus('edu.Diario')
    ementa = models.TextField('Ementa', default='', blank=True)
```

**Arquivo:** `edu/models/plano_ensino.py:1-18`

O iniciante deve apenas reconhecer que o model recebe o comportamento da
heranca. Mudancas no mecanismo de log exigem uma analise mais avancada.

### 5.4. Campos `Plus`

Campos `Plus` herdam dos campos do Django e fornecem configuracoes adotadas no
SUAP.

| Campo | Base Django | Acrescimo principal |
|---|---|---|
| `CharFieldPlus` | `CharField` | `max_length=255` padrao e atributos de widget |
| `ForeignKeyPlus` | `ForeignKey` | `CASCADE` padrao e campo de escolha do DJTools |
| `DateFieldPlus` | `DateField` | Integra campo de formulario de data do DJTools |
| `FileFieldPlus` | `FileField` | Tipos, tamanho e outras validacoes de arquivo |

**Implementacoes:**

- `djtools/db/models/__init__.py:68-107`;
- `djtools/db/models/__init__.py:251-287`.

Exemplo real em `edu/models/alunos.py:344-348`:

```python
numero_rg = models.CharFieldPlus(
    max_length=255,
    verbose_name='Numero do RG',
    null=True,
    blank=True,
)
uf_emissao_rg = models.ForeignKeyPlus(
    'edu.Estado',
    verbose_name='Estado Emissor',
    null=True,
    blank=True,
)
data_emissao_rg = models.DateFieldPlus(
    verbose_name='Data de Emissao',
    null=True,
    blank=True,
)
```

### 5.5. `SEARCH_FIELDS`

Alguns models declaram os campos usados pelas pesquisas e widgets de
autocompletar:

```python
class Aluno(LogModel):
    SEARCH_FIELDS = [
        'pessoa_fisica__search_fields_optimized',
        'matricula',
    ]
```

**Arquivo:** `edu/models/alunos.py:107-108`

Uso em um form:

```python
aluno = forms.ModelChoiceFieldPlus(
    Aluno.objects,
    widget=AutocompleteWidget(search_fields=Aluno.SEARCH_FIELDS),
)
```

`SEARCH_FIELDS` e uma convencao do SUAP, nao um atributo padrao de models do
Django.

### 5.6. Managers `objects` e `locals`

#### O que e um manager

Um **manager** e a porta de entrada do ORM para consultar os registros de um
model. Ele fica ligado a classe do model e oferece metodos como `all()`,
`filter()`, `exclude()`, `get()` e `create()`.

```python
# Aluno e a classe do model.
# objects e o manager.
# filter() inicia uma consulta.
# O resultado e um QuerySet.
alunos = Aluno.objects.filter(ano_letivo__ano=2026)
```

Uma analogia simples:

```text
Model    -> define que tipo de dado existe
Manager  -> abre a porta para consultar esse tipo de dado
QuerySet -> representa a consulta e seu conjunto de resultados
Instancia -> representa um registro encontrado
```

Exemplo completo:

```python
# Manager
manager = Aluno.objects

# QuerySet: pode conter zero, um ou varios alunos.
alunos = manager.filter(situacao__ativo=True)

# Instancia: representa um aluno especifico.
aluno = manager.get(matricula='20261010001')
```

O manager pertence a classe, e nao a uma instancia:

```python
Aluno.objects.all()  # correto: consulta registros de Aluno
aluno.objects.all()  # incorreto: aluno ja e uma instancia
```

#### Manager x QuerySet

Embora chamadas como `Aluno.objects.filter(...)` parecam uma operacao unica,
existem dois objetos envolvidos:

1. `Aluno.objects` e o manager;
2. `filter(...)` devolve um `QuerySet`.

O `QuerySet` pode continuar sendo refinado sem consultar imediatamente o banco:

```python
alunos = Aluno.objects.filter(situacao__ativo=True)
alunos = alunos.filter(ano_letivo__ano=2026)
alunos = alunos.order_by('pessoa_fisica__nome')
```

Quando o resultado e avaliado, o Django transforma essa composicao em uma
consulta SQL.

#### Manager padrao e manager personalizado

Quando nenhum manager e declarado, o Django cria normalmente um manager chamado
`objects`. No SUAP, e comum declarar managers personalizados para:

- criar metodos de consulta reutilizaveis;
- aplicar um filtro inicial automaticamente;
- otimizar consultas frequentes;
- limitar registros conforme o contexto do usuario.

Um manager personalizado herda normalmente de `django.db.models.Manager` e
pode sobrescrever `get_queryset()`:

```python
class AlunosAtivosManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(situacao__ativo=True)
```

**Arquivo:** `edu/managers.py`  
**Linhas:** `656-658`

Nesse caso, toda consulta iniciada por esse manager ja parte dos alunos ativos:

```python
Aluno.ativos.all()

# Equivale conceitualmente a:
Aluno.objects.filter(situacao__ativo=True)
```

O metodo `get_queryset()` define o conjunto inicial sobre o qual `all()`,
`filter()`, `get()` e outras operacoes trabalharao.

Um manager tambem pode acrescentar metodos sem alterar o conjunto inicial. O
`AlunoManager`, em `edu/managers.py:630-639`, define `autocomplete()`. Em uma
versao reduzida:

```python
class AlunoManager(models.Manager):
    def autocomplete(self):
        qs = super().get_queryset()
        qs = qs.select_related(
            'pessoa_fisica',
            'curso_campus',
            'curso_campus__diretoria__setor__uo',
        )
        return qs
```

Assim, a consulta otimizada pode ser reutilizada por meio de:

```python
Aluno.objects.autocomplete()
```

#### O que significam `objects`, `locals` e `ativos`

Os nomes dos managers sao escolhidos pelo projeto. Eles nao sao palavras
reservadas do Python:

- `objects` costuma representar o acesso geral aos registros;
- `locals` costuma aplicar alguma restricao conforme o usuario corrente;
- `ativos` costuma iniciar a consulta apenas com registros ativos;
- outros nomes podem representar subconjuntos ou consultas especializadas.

> `locals` nesse contexto nao e a funcao Python `locals()` e nao significa que
> os dados estejam em um banco local. E apenas o nome dado a um manager
> contextual do SUAP.

Exemplo em `edu/models/alunos.py:250-259`:

```python
objects = AlunoManager()
locals = AlunoLocalManager()
ativos = AlunosAtivosManager()
locals_uo = FiltroUnidadeOrganizacionalManager(
    'curso_campus__diretoria__setor__uo'
)
```

Cada atributo oferece uma entrada diferente para consultar o mesmo model:

```python
Aluno.objects.all()       # conjunto geral definido por AlunoManager
Aluno.locals.all()        # conjunto permitido pelo AlunoLocalManager
Aluno.ativos.all()        # somente alunos cuja situacao esta ativa
Aluno.com_matriz.all()    # somente alunos vinculados a uma matriz
```

#### Como `Aluno.locals` limita a consulta

`AlunoLocalManager`, em `edu/managers.py:671-682`, consulta o usuario corrente
e, em uma situacao especifica, restringe os alunos ao polo coordenado por ele:

```python
class AlunoLocalManager(models.Manager):
    def get_queryset(self):
        qs = super().get_queryset()
        user = tl.get_user()

        if user and user.groups.filter(
            name='Coordenador de Polo EAD'
        ).exists():
            # ... identifica os polos coordenados pelo usuario ...
            return qs.filter(polo__id__in=ids)

        return qs
```

`tl.get_user()` recupera o usuario associado ao contexto atual do SUAP. Dessa
forma, duas pessoas podem executar `Aluno.locals.all()` e receber conjuntos
diferentes.

#### Escolha do manager na view

Uso real em `edu/views.py:1558-1560`:

```python
manager = (
    Turma.objects
    if request.user.has_group_cached('Diretor Academico')
    else Turma.locals
)
obj = get_object_or_404(manager, pk=pk)
```

Nesse fluxo:

1. o diretor academico usa `Turma.objects`, com o conjunto geral definido para
   o model;
2. os demais usuarios usam `Turma.locals`, que aplica o recorte contextual;
3. `get_object_or_404()` executa a consulta por `pk` sobre o manager escolhido;
4. se a turma nao fizer parte daquele conjunto, a resposta sera 404.

Resumo:

```text
Turma.objects.get(pk=10)
       |
       +-- procura no conjunto geral

Turma.locals.get(pk=10)
       |
       +-- procura somente no conjunto permitido pelo manager local
```

> O manager ajuda a limitar a consulta, mas nao substitui os decoradores e as
> regras de autorizacao da view. Tambem e necessario escolher o manager
> conscientemente: usar `objects` no lugar de `locals` pode ampliar o conjunto
> de registros acessiveis.

## 6. Forms

### 6.1. `FormPlus`

`FormPlus` herda de `django.forms.Form`. Ele aceita opcionalmente
`request=request` e o disponibiliza como `self.request`.

**Implementacao:** `djtools/forms/__init__.py:54-62`

```python
class MeuFiltroForm(forms.FormPlus):
    campus = forms.ModelChoiceFieldPlus(
        UnidadeOrganizacional.objects,
        required=False,
    )
```

Na view:

```python
form = MeuFiltroForm(
    data=request.GET or None,
    request=request,
)
```

Use para filtros ou operacoes que nao representam diretamente a edicao de um
unico model.

### 6.2. `ModelFormPlus`

`ModelFormPlus` herda de `django.forms.ModelForm`. Portanto, `instance`,
`is_valid()`, `save()`, `commit=False` e `save_m2m()` continuam sendo recursos
do Django. O DJTools acrescenta `self.request` e integracao com LPS.

**Implementacao:** `djtools/forms/__init__.py:65-74`

```python
class PlanoEnsinoForm(forms.ModelFormPlus):
    class Meta:
        model = PlanoEnsino
        fields = ('ementa', 'objetivo_geral')
```

Na view de edicao:

```python
form = PlanoEnsinoForm(
    data=request.POST or None,
    instance=plano,
    request=request,
)

if form.is_valid():
    form.save()
```

### 6.3. Campos e widgets de formulario

O DJTools possui campos como `ModelChoiceFieldPlus`, `DateFieldPlus` e
`FileFieldPlus`, alem do `AutocompleteWidget`.

**Implementacoes:**

- `djtools/forms/fields/__init__.py:77-252`;
- `djtools/forms/widgets/__init__.py:566`.

Exemplo real em `edu/forms.py:4456-4465`:

```python
class RelatorioHorarioForm(forms.FormPlus):
    METHOD = 'GET'
    SUBMIT_LABEL = 'Pesquisar'
    turma = forms.ModelChoiceFieldPlus(
        Turma.objects,
        required=False,
        widget=AutocompleteWidget(search_fields=Turma.SEARCH_FIELDS),
    )
```

`METHOD`, `SUBMIT_LABEL` e `fieldsets` sao lidos pela renderizacao do SUAP para
organizar o formulario. Eles nao substituem a validacao do Django.

## 7. Templates

### 7.1. `super_template`

Os templates do SUAP normalmente iniciam com:

```django
{% extends super_template %}
```

`super_template` e uma variavel adicionada pelo context processor do SUAP:

**Arquivo:** `comum/utils.py`  
**Linhas:** `844-859`

```python
super_template = (
    'admin/base.html'
    if request.user.is_authenticated
    else 'admin/base_anonima.html'
)
```

Esse context processor e registrado em
`suap/settings_base.py:149-158`. Dessa forma, o mesmo template pode escolher a
base autenticada ou anonima conforme a requisicao.

### 7.2. Tags disponibilizadas globalmente

As tags do DJTools sao registradas como `builtins` em
`suap/settings_base.py:141-148`. Por isso, diversos templates podem usar
`{% box %}` e `{% render_form %}` sem declarar `{% load %}`.

#### `{% box %}`

Organiza um bloco visual com titulo:

```django
{% box 'Dados Gerais' %}
    <p>{{ obj }}</p>
{% endbox %}
```

**Implementacao:** `djtools/templatetags/tags/utils.py:304-380`

#### `{% render_form form %}`

Renderiza o formulario respeitando configuracoes como `fieldsets`, metodo,
rotulo do botao e upload de arquivos:

```django
{% render_form form %}
```

**Implementacao da tag:** `djtools/templatetags/tags/utils.py:217-301`  
**Template usado:** `djtools/templates/form.html:1-17`

O template detecta `form.is_multipart`, inclui `multipart/form-data` quando
necessario e adiciona o token CSRF em formularios POST.

### 7.3. Permissoes no template

O context processor de autenticacao do Django disponibiliza `perms`. Assim, um
elemento pode ser exibido conforme uma permissao:

```django
{% if perms.edu.view_dados_pessoais %}
    <a href="#">Dados Pessoais</a>
{% endif %}
```

Essa verificacao melhora a interface, mas nao protege a URL. A view de destino
tambem precisa validar a permissao.

## 8. Admin

### 8.1. `ModelAdminPlus`

`ModelAdminPlus` herda de `django.contrib.admin.ModelAdmin` e acrescenta
recursos usados pelo admin do SUAP, como:

- icones na lista;
- abas;
- exportacao;
- filtros multiplos e autocomplete;
- barra de acoes;
- templates administrativos proprios.

**Implementacao:** `djtools/contrib/admin/options/__init__.py:87-145`

Exemplo resumido de `edu/admin.py:1601-1615`:

```python
class AlunoAdmin(ModelAdminPlus):
    list_display = (
        'get_foto',
        'get_info_principal',
        'periodo_letivo',
        'ano_letivo',
        'get_pasta',
    )
    list_filter = (
        'ano_letivo',
        'periodo_letivo',
        'situacao',
        'curso_campus',
    )
    list_display_icons = True
    export_to_xls = True
    form = AlunoForm
```

Registro do model em `edu/admin.py:1870`:

```python
admin.site.register(Aluno, AlunoAdmin)
```

Os atributos nativos, como `list_display`, `list_filter` e `search_fields`,
continuam seguindo o Django. Recursos como `list_display_icons`, abas e algumas
exportacoes pertencem ao `ModelAdminPlus`.

## 9. Permissoes

### 9.1. O que e `permissions.yaml`

`permissions.yaml` e uma convencao do SUAP. Nao e um arquivo padrao do Django.
Ele declara quais permissoes devem ser atribuidas aos grupos.

Exemplo em `edu/permissions.yaml:2101-2107`:

```yaml
Organizador de Minicurso:
  description: Usuarios deste grupo gerenciam os minicursos.
  edu:
    aluno:
    - view_aluno
    - view_dados_academicos
    - view_dados_pessoais
```

Estrutura:

```text
grupo
  aplicacao
    model
      permissao
```

O comando `sync_permissions` le os arquivos e sincroniza grupos e permissoes no
banco.

**Implementacao:**

- `djtools/management/commands/sync_permissions.py:134-146`;
- `djtools/management/commands/sync_permissions.py:119-122`.

Depois da sincronizacao, a verificacao usa o sistema de autenticacao do Django:

```python
request.user.has_perm('edu.view_aluno')
```

ou o decorador do DJTools:

```python
@permission_required('edu.view_aluno')
def aluno(request, matricula):
    ...
```

### 9.2. `edu/perms.py`: regras contextuais

Uma permissao geral nem sempre e suficiente. Algumas decisoes dependem do
curso, campus, aluno, setor ou situacao do registro. O arquivo `edu/perms.py`
centraliza varias dessas regras.

Exemplo em `edu/perms.py:5-27`:

```python
def realizar_procedimentos_academicos(user, curso_campus=None):
    autorizado = user.is_superuser

    # Verifica grupos sistemicos, setor, coordenacao e outros contextos.
    ...

    return autorizado
```

Uso em `edu/views.py:1563`:

```python
pode_realizar_procedimentos = (
    perms.realizar_procedimentos_academicos(
        request.user,
        obj.curso_campus,
    )
)
```

Resumo:

```text
permissions.yaml -> quais permissoes o grupo recebe
has_perm()        -> checagem de uma permissao geral
edu/perms.py      -> regra contextual de negocio e acesso
manager locals    -> limita os objetos consultados
template          -> decide o que deve ser exibido
```

Uma autorizacao importante deve ser aplicada no backend, mesmo quando o botao
tambem estiver oculto no template.

## 10. Menus

### 10.1. `menu.yaml`

Os itens do menu de cada modulo podem ser declarados no arquivo `menu.yaml`.
Essa e uma convencao do SUAP, nao um recurso padrao do Django.

Exemplo em `edu/menu.yaml:6-15`:

```yaml
Ensino::Alunos e Professores:
  order: 2

Ensino::Alunos e Professores::Alunos:
  permissions_required:
  - edu.view_aluno
  url: /admin/edu/aluno/correntes

Ensino::Alunos e Professores::Professores:
  permissions_required:
  - edu.view_professor
  url: /admin/edu/professor/
```

Elementos basicos:

| Chave | Funcao |
|---|---|
| caminho com `::` | Define a hierarquia do menu |
| `url` | Informa o destino do item |
| `order` | Ajuda a ordenar os itens |
| `permissions_required` | Exibe o item conforme permissoes |
| `groups_required` | Exibe o item conforme grupos |

O carregamento do arquivo esta em `comum/utils.py:357-379`. A montagem do menu
considera grupos e permissoes em `comum/utils.py:483-524`.

> Ocultar um item no `menu.yaml` nao bloqueia sua URL. A view de destino ainda
> deve usar `permission_required`, `group_required` ou outra regra de backend.

## 11. Respostas e documentos PDF

### 11.1. `PDFResponse`

`PDFResponse` herda de `HttpResponse` e configura o tipo
`application/pdf`. Pode abrir o arquivo no navegador ou forcar download.

**Implementacao:** `djtools/utils/response.py:272-290`

```python
return PDFResponse(
    conteudo_pdf,
    nome='relatorio.pdf',
    anexo=False,
)
```

- `anexo=False`: abre em linha no navegador;
- `anexo=True`: envia como anexo para download.

Ela recebe um PDF ja produzido; nao converte automaticamente um template HTML.

### 11.2. `@documento`

`@documento` e um decorador do DJTools que transforma a resposta HTML de uma
view em documento PDF e pode integrar a emissao com autenticacao e registro.

**Implementacao:** `djtools/utils/__init__.py:1360-1425` e linhas seguintes.

```python
@documento(
    'Plano de Ensino',
    enumerar_paginas=False,
    modelo='edu.planoensino',
)
@rtr()
def plano_ensino_pdf(request, pk):
    obj = get_object_or_404(PlanoEnsino, pk=pk)
    return locals()
```

Use `@documento` quando o fluxo precisa da infraestrutura documental do SUAP.
Use `PDFResponse` quando o codigo ja possui os bytes de um PDF e precisa apenas
devolver a resposta HTTP apropriada.

## 12. LPS

LPS e o mecanismo de customizacao por instalacao do SUAP. Ele permite que uma
instalacao altere determinados forms, URLs e templates sem modificar
diretamente todo o codigo principal.

Pontos basicos:

- `FormPlus` e `ModelFormPlus` usam metaclasses com suporte a LPS;
- `@rtr()` procura primeiro um template da LPS quando ela esta ativa;
- o carregamento geral inclui um `urls.py` da LPS quando ele existe;
- `sync_permissions` pode usar um `permissions.yaml` da LPS.

Referencias:

- forms: `djtools/lps.py:49-109`;
- templates: `djtools/utils/response.py:185-194`;
- URLs: `suap/urls.py:45-52`;
- permissoes: `djtools/management/commands/sync_permissions.py:137-145`.

Para o nivel inicial, basta reconhecer o mecanismo e verificar se existe uma
customizacao ativa antes de concluir que o comportamento esta somente no
arquivo principal.

## 13. O que e Django e o que e SUAP

| Elemento | Origem | Observacao |
|---|---|---|
| `path()` | Django | Define uma rota |
| inclusao automatica por app | SUAP | Prefixa a rota com o nome da aplicacao |
| view como funcao Python | Django | Recebe `request` e retorna resposta |
| `@rtr()` | SUAP/DJTools | Renderiza o retorno da view |
| `permission_required` usado no EDU | SUAP/DJTools | Especializa a verificacao do Django |
| `group_required` | SUAP/DJTools | Verifica grupos do usuario |
| `httprr()` | SUAP/DJTools | Redireciona com mensagem |
| `models.Model` | Django | Base nativa dos models |
| `ModelPlus` | SUAP/DJTools | Model abstrato com facilidades adicionais |
| campos `Plus` | SUAP/DJTools | Extensoes de campos do Django |
| `Form` e `ModelForm` | Django | Formularios nativos |
| `FormPlus` e `ModelFormPlus` | SUAP/DJTools | Request opcional e suporte a LPS |
| `ModelAdmin` | Django | Admin nativo |
| `ModelAdminPlus` | SUAP/DJTools | Admin com recursos adicionais |
| `{% extends %}` | Django | Heranca de template |
| `super_template` | SUAP | Variavel escolhida pelo context processor |
| `{% box %}` | SUAP/DJTools | Componente visual |
| `{% render_form %}` | SUAP/DJTools | Renderizacao padronizada de forms |
| `menu.yaml` | SUAP | Monta o menu e controla sua exibicao |
| `permissions.yaml` | SUAP | Distribui permissoes para grupos |
| `user.has_perm()` | Django/SUAP | Usa o backend de autenticacao |
| `@documento` | SUAP/DJTools | Gera documento a partir da view |
| `PDFResponse` | SUAP/DJTools | Resposta HTTP pronta para bytes PDF |

## 14. Checklist para ler uma funcionalidade

Ao estudar uma tela do SUAP, siga esta ordem:

1. localize a rota no `urls.py` do modulo;
2. abra a view apontada pela rota;
3. identifique os decoradores de autenticacao e permissao;
4. verifique se a view usa `objects`, `locals` ou outro manager;
5. localize o form e confira se e `Form`, `FormPlus`, `ModelForm` ou
   `ModelFormPlus`;
6. identifique o model e os campos `Plus` envolvidos;
7. acompanhe `is_valid()`, `cleaned_data`, `save()` ou `processar()`;
8. veja qual template e escolhido por `@rtr()`;
9. procure tags como `box`, `render_form` e condicoes com `perms`;
10. confira se o acesso aparece no `menu.yaml`;
11. confira se existe customizacao LPS;
12. verifique a resposta final: template, `httprr()`, `PDFResponse` ou
    `@documento`.

## 15. Regra de ouro

Ao encontrar um recurso desconhecido, descubra primeiro sua origem:

```text
E importado de django.*?   -> comportamento do Django
E importado de djtools.*?  -> extensao do SUAP/DJTools
E importado de edu.*?      -> regra especifica do modulo EDU
Esta em lps/<nome>/...?    -> customizacao da instalacao
```

Essa verificacao simples evita atribuir ao Django um comportamento criado pelo
SUAP e ajuda a localizar rapidamente onde uma funcionalidade deve ser alterada.
