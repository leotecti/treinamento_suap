# Encontro - Django Admin no SUAP EDU

## A. Identificação

**Título:** Django Admin no SUAP: listagens, formulários, filtros, permissões e customizações do `ModelAdminPlus`.

**Carga horária:** 2 horas.

**Objetivo geral:** compreender como o Django Admin gera interfaces administrativas a partir dos models e como o SUAP amplia esse mecanismo por meio do `ModelAdminPlus`, forms, managers, permissões, abas, ações, exportações e inlines.

**Objetivos específicos:**

- compreender a finalidade e os limites do Django Admin;
- entender como um model é registrado em `admin.site`;
- reconhecer as URLs geradas automaticamente pelo Admin;
- diferenciar `ModelAdmin` do Django e `ModelAdminPlus` do DJTools;
- configurar listagem, busca, filtros, ordenação e paginação;
- criar colunas calculadas com métodos do admin;
- organizar telas de cadastro e edição com `form` e `fieldsets`;
- compreender o ciclo de `changelist`, `add`, `change` e `delete`;
- restringir registros com `get_queryset()` e managers locais;
- aplicar permissões gerais e contextuais no backend;
- conhecer actions, inlines, tabs, exportação e URLs personalizadas;
- identificar riscos de segurança e desempenho no Admin;
- alterar um admin existente de forma controlada e testável.

**Pré-requisitos:** models, managers, `QuerySet`, forms, permissões, fluxo HTTP e leitura básica de templates.

> **Escopo do encontro:** o objetivo não é estudar todos os métodos de `ModelAdmin`. O estudo prioriza os recursos mais usados por novos desenvolvedores no módulo EDU. Recursos complexos podem ser aprofundados conforme a necessidade do projeto.

## B. Ideia central do encontro

O Django Admin é uma interface administrativa gerada a partir dos models. O
desenvolvedor registra um model e configura uma classe de admin; o framework
fornece URLs, listagem, formulario, validacao, persistencia e verificacoes de
permissao.

Uma forma de visualizar a relação entre os componentes:

```text
Model = cadastro e regras da entidade
ModelAdmin = configuracao da mesa de trabalho desse cadastro
AdminSite = setor que recebe e encaminha as operacoes administrativas
Form = ficha usada para cadastrar ou editar
QuerySet = conjunto de registros que o usuario pode consultar
```

Fluxo da listagem:

```text
Usuario acessa /admin/edu/aluno/
        |
AdminSite encontra AlunoAdmin
        |
verifica permissao de visualizacao
        |
AlunoAdmin.get_queryset(request)
        |
aplica busca, filtros, aba e ordenacao
        |
executa a consulta no banco
        |
change_list.html apresenta os resultados
```

Fluxo da edicao:

```text
Usuario acessa /admin/edu/aluno/<pk>/change/
        |
AdminSite encontra AlunoAdmin e o objeto
        |
has_change_permission(request, obj)
        |
get_form() / AlunoForm
        |
GET: apresenta valores atuais
POST: recebe e valida os dados
        |
form.is_valid()
        |
save_model() e save_related()
        |
response_change()
```

Ponto-chave:

```text
admin.py nao cria a tabela e nao substitui o model.
Ele configura a interface administrativa usada para consultar e manipular o model.
```

## C. Mapa de estudo

| Tempo | Etapa | Conteudo | Estrategia | Referencias principais |
|---:|---:|---|---|---|
| 10 min | 1 | Conceito, registro e URLs | Relacionar model, registro e tela | `edu/admin.py:203-232`; `edu/admin.py:320-327` |
| 15 min | 2 | Configurações nativas | Estudar `list_display`, `search_fields`, `list_filter`, `ordering` e `fieldsets` | `edu/admin.py:320-353`; `edu/admin.py:374-390` |
| 15 min | 3 | `ModelAdminPlus` | Comparar Django e DJTools | `djtools/contrib/admin/options/__init__.py:87-154` |
| 25 min | 4 | Estudo integrado de `AlunoAdmin` | Acompanhar listagem, busca, filtros, abas, form e queryset | `edu/admin.py:1601-1870` |
| 15 min | 5 | Permissões e escopo dos dados | Analisar `has_*_permission()`, `objects`, `locals` e acesso direto | `edu/admin.py:1617-1626`; `djtools/contrib/admin/options/__init__.py:295-308` |
| 15 min | 6 | Actions, inlines, hooks e desempenho | Estudar exemplos selecionados da API | `edu/admin.py:356-390`; `edu/admin.py:725-730`; `edu/admin.py:1053-1083` |
| 20 min | 7 | Prática de estudo | Alterar colunas, filtros e queryset em um ambiente de treinamento | `AlunoAdmin` e `TurnoAdmin` |
| 5 min | 8 | Testes, revisão e fechamento | Aplicar o checklist e revisar responsabilidades | Secoes finais |

**Duração prevista:** 2 horas, incluindo atividades e revisão.

> As explicações detalhadas formam o material de estudo. A sequência pode ser
> acompanhada integralmente, com consulta aos exemplos conforme a necessidade.

### Navegação rápida

1. [Etapa 1 — Fundamentos e registro](#etapa-1)
2. [Etapa 2 — Configurações essenciais](#etapa-2)
3. [Etapa 3 — Recursos do SUAP](#etapa-3)
4. [Etapa 4 — Estudo integrado de AlunoAdmin](#etapa-4)
5. [Etapa 5 — Formulários, permissões e escopo](#etapa-5)
6. [Etapa 6 — Actions, inlines e hooks](#etapa-6)
7. [Etapa 7 — Práticas de estudo](#etapa-7)
8. [Etapa 8 — Testes e fechamento](#etapa-8)

<a id="etapa-1"></a>

## Etapa 1 — Fundamentos e registro

### 1.1. O que é o Django Admin

O Django Admin e uma aplicacao nativa do Django voltada para operacoes internas
de administracao. Ele le os metadados de um model, combina-os com uma classe
`ModelAdmin` e monta uma interface web para pessoas autorizadas consultarem e
manterem os registros.

No projeto, a versao utilizada esta declarada em
`requirements/base.txt:2`:

```text
Django==4.1.5
```

As duas classes centrais do recurso pertencem ao proprio Django:

| Classe | Implementacao no Django 4.1.5 | Responsabilidade |
|---|---|---|
| `AdminSite` | `django/contrib/admin/sites.py:39-318` | Mantem o registro dos models e monta as URLs globais do Admin |
| `ModelAdmin` | `django/contrib/admin/options.py:612-715` | Configura e executa as telas administrativas de um model |

O diretorio `django/` nao faz parte do repositorio do SUAP. Ele pertence ao
pacote Django instalado no ambiente Python. Por isso, esses caminhos devem ser
lidos no ambiente virtual, na IDE ou no codigo-fonte da versao `4.1.5`.

#### 1.1.1. `AdminSite`: o catálogo do Admin

Ao executar `admin.site.register()`, o model e sua classe administrativa sao
armazenados no dicionario `_registry` do `AdminSite`.

**Implementacao do Django:** `django/contrib/admin/sites.py:72-77` e
`django/contrib/admin/sites.py:100-145`

Versao reduzida para estudo:

```python
class AdminSite:
    def __init__(self, name='admin'):
        self._registry = {}

    def register(self, model_or_iterable, admin_class=None, **options):
        admin_class = admin_class or ModelAdmin
        if isinstance(model_or_iterable, ModelBase):
            model_or_iterable = [model_or_iterable]
        for model in model_or_iterable:
            # O codigo real tambem valida o model e o registro duplicado.
            self._registry[model] = admin_class(model, self)
```

O metodo real tambem rejeita models abstratos e lanca
`AlreadyRegistered` quando o mesmo model e registrado novamente. Depois,
`AdminSite.get_urls()` percorre esse registro e cria um prefixo para cada
model.

**Implementacao do Django:** `django/contrib/admin/sites.py:290-318`

```python
for model, model_admin in self._registry.items():
    urlpatterns += [
        path(
            '%s/%s/' % (model._meta.app_label, model._meta.model_name),
            include(model_admin.urls),
        ),
    ]
```

Assim, um model com `app_label = 'edu'` e `model_name = 'turno'` recebe o
prefixo `/admin/edu/turno/`.

#### 1.1.2. `ModelAdmin`: o controlador de um model

`ModelAdmin` concentra as configuracoes e as views que administram um model.
Sua implementacao declara valores padrao como `list_display`,
`list_select_related`, `list_editable`, `search_fields` e `date_hierarchy`.

**Implementacao do Django:** `django/contrib/admin/options.py:612-630`

O metodo `ModelAdmin.get_urls()` cria as operacoes do model:

**Implementacao do Django:** `django/contrib/admin/options.py:681-709`

```python
return [
    path('', wrap(self.changelist_view), name='%s_%s_changelist' % info),
    path('add/', wrap(self.add_view), name='%s_%s_add' % info),
    path('<path:object_id>/history/', wrap(self.history_view), ...),
    path('<path:object_id>/delete/', wrap(self.delete_view), ...),
    path('<path:object_id>/change/', wrap(self.change_view), ...),
]
```

O `wrap()` passa cada view por `AdminSite.admin_view()`. Essa camada verifica,
entre outros pontos, se o usuario esta ativo e possui acesso administrativo.
Cada operacao ainda consulta as permissoes do model, como `view`, `add`,
`change` e `delete`.

A listagem e coordenada por `changelist_view`. O metodo
`get_changelist_instance()` entrega as configuracoes do `ModelAdmin` para um
objeto `ChangeList`.

**Implementacao do Django:** `django/contrib/admin/options.py:822-849`

#### 1.1.3. O que o Admin gera

A partir dessas classes, o Django pode gerar:

- listagem de registros;
- busca e filtros;
- formulario de inclusao;
- formulario de edicao;
- exclusao e historico;
- actions aplicadas a varios registros;
- verificacoes das permissoes `view`, `add`, `change` e `delete`.

#### 1.1.4. Django Admin x CRUD comum

CRUD significa criar, consultar, alterar e excluir dados. Tanto o Admin quanto
uma tela personalizada podem implementar essas operacoes, mas nao sao a mesma
coisa.

| Django Admin | CRUD com URL, view e template proprios |
|---|---|
| As URLs sao geradas por `AdminSite` e `ModelAdmin` | Cada URL e declarada pela aplicacao |
| O formulario pode ser inferido do model | O desenvolvedor escolhe e coordena o form |
| Usa templates administrativos padronizados | A interface e desenhada para o fluxo especifico |
| Integra permissoes de model e historico | A autorizacao e o historico precisam ser definidos pelo fluxo |
| E voltado a usuarios internos autorizados | Pode atender aluno, professor, publico externo ou integracoes |
| E excelente para manutencao orientada a dados | E adequado a processos e regras de negocio especificos |

O Admin e, portanto, uma implementacao pronta de CRUD administrativo, e nao
uma obrigacao para todo CRUD do sistema. Use uma view propria quando o fluxo
exigir, por exemplo:

- uma sequencia de etapas muito especifica;
- uma experiencia destinada ao aluno ou ao publico externo;
- resposta em PDF, planilha ou API com regras proprias;
- operacao que combina varias entidades e confirmacoes;
- layout que nao se adapta ao modelo de listagem e formulario do Admin.

#### 1.1.5. Exemplo completo: cadastro de turnos

O cadastro de `Turno` permite acompanhar o fluxo completo com poucas linhas.

**Model:** `edu/models/cadastros_gerais.py:345-363`

```python
class Turno(LogModel):
    # Campo persistido e apresentado no formulario gerado pelo Admin.
    descricao = models.CharFieldPlus('Descricao', unique=True)

    class Meta:
        verbose_name = 'Turno'
        verbose_name_plural = 'Turnos'
        ordering = ('id',)

    def __str__(self):
        # Representacao usada em selects, mensagens e relacionamentos.
        return self.descricao
```

**Configuracao e registro:** `edu/admin.py:320-328`

```python
class TurnoAdmin(ModelAdminPlus):
    # Colunas exibidas em /admin/edu/turno/.
    list_display = ('id', 'descricao')
    # Ordenacao inicial da listagem.
    ordering = ('descricao',)
    # Campo consultado pela caixa de pesquisa.
    search_fields = ('descricao',)
    # Customizacoes oferecidas pelo DJTools/SUAP.
    list_display_icons = False
    export_to_xls = True


# Associa o model a sua configuracao no AdminSite.
admin.site.register(Turno, TurnoAdmin)
```

`ModelAdminPlus`, implementado em
`djtools/contrib/admin/options/__init__.py:87-146`, herda de
`django.contrib.admin.ModelAdmin`. Portanto, preserva o funcionamento nativo e
acrescenta recursos do SUAP, como exportacao, abas e templates proprios.

**Como acompanhar o exemplo**

1. Acesse `/admin/edu/turno/` para abrir a listagem.
2. Observe as colunas `ID` e `Descricao`, definidas por `list_display`.
3. Pesquise parte de uma descricao para exercitar `search_fields`.
4. Acesse `/admin/edu/turno/add/` e observe que o campo `descricao` foi
   produzido a partir do model.
5. Salve um registro e abra `/admin/edu/turno/<pk>/change/` para edita-lo.
6. Compare o formulario exibido com o model: como `TurnoAdmin` nao declarou
   `form`, o Django cria um `ModelForm` automaticamente.

Essa criacao acontece em `ModelAdmin.get_form()`, implementado em
`django/contrib/admin/options.py:758-812`. Na linha `807`, o Django chama
`modelform_factory(self.model, **defaults)` para produzir a classe do
formulario a partir do model e das opcoes administrativas.

Fluxo resumido da requisicao:

```text
/admin/edu/turno/
        |
        v
suap/urls.py -> admin.site.urls
        |
        v
AdminSite encontra Turno em _registry
        |
        v
TurnoAdmin.changelist_view()
        |
        v
ChangeList consulta Turno e monta a listagem
        |
        v
template administrativo -> resposta HTML
```

Esse exemplo mostra a divisao de responsabilidades: o model descreve os dados,
`TurnoAdmin` configura a interface e `AdminSite` registra e publica as URLs.

### 1.2. Onde nasce o prefixo `/admin/`

O ponto de entrada do Admin esta no arquivo geral de URLs.

**Arquivo:** `suap/urls.py`  
**Linha:** `60`

```python
path('admin/', admin.site.urls),
```

Essa unica linha inclui as URLs produzidas por todos os models registrados no
`AdminSite`. Por isso nao existe uma linha em `edu/urls.py` para cada tela
administrativa.

#### 1.2.1. Fluxo `admin.site.urls` -> `AdminSite` -> `ModelAdmin`

`admin.site` e a instancia padrao de `AdminSite`. Quando o Django avalia
`admin.site.urls`, a propriedade `urls` chama `AdminSite.get_urls()`. Esse
metodo constroi as URLs gerais e percorre o registro interno de models:

```text
suap/urls.py
path('admin/', admin.site.urls)
                |
                v
AdminSite.get_urls()
                |
                +-- /admin/                         -> pagina inicial
                +-- /admin/login/                   -> autenticacao
                +-- /admin/<app>/<model>/           -> ModelAdmin do model
```

Para cada par registrado em `AdminSite._registry`, o Django inclui as URLs da
instancia de `ModelAdmin` correspondente. A forma reduzida do codigo de
`django/contrib/admin/sites.py:290-318` e:

```python
for model, model_admin in self._registry.items():
    urlpatterns += [
        path(
            '%s/%s/' % (
                model._meta.app_label,
                model._meta.model_name,
            ),
            include(model_admin.urls),
        ),
    ]
```

No caso de `Turno`, o registro realizado em `edu/admin.py:327` associa:

```text
model:       Turno
app_label:   edu
model_name:  turno
admin:       TurnoAdmin
prefixo:     /admin/edu/turno/
```

Depois, `ModelAdmin.get_urls()`, em
`django/contrib/admin/options.py:681-709`, acrescenta as operacoes desse
model:

```python
path('', self.changelist_view, ...)                    # listagem
path('add/', self.add_view, ...)                       # inclusao
path('<path:object_id>/change/', self.change_view, ...) # edicao
path('<path:object_id>/delete/', self.delete_view, ...) # exclusao
path('<path:object_id>/history/', self.history_view, ...) # historico
```

As views acima sao metodos da instancia de `TurnoAdmin`; nao sao views
declaradas em `edu/views.py`. Antes de executa-las, `AdminSite.admin_view()`
aplica verificacoes administrativas, protecao contra cache e protecao CSRF.
Em seguida, cada operacao consulta as permissoes especificas do model.

Fluxo completo de uma listagem:

```text
GET /admin/edu/turno/
  -> resolver principal encontra path('admin/', admin.site.urls)
  -> AdminSite encontra edu/turno no _registry
  -> TurnoAdmin.changelist_view(request)
  -> TurnoAdmin.get_queryset(request)
  -> ChangeList aplica busca, filtros, ordenacao e paginacao
  -> template do Admin gera a resposta
```

Os nomes reversos tambem sao gerados automaticamente. Para o exemplo:

```python
reverse('admin:edu_turno_changelist')  # /admin/edu/turno/
reverse('admin:edu_turno_add')         # /admin/edu/turno/add/
reverse('admin:edu_turno_change', args=[3])
```

Isso explica por que registrar um model e suficiente para criar todo o
conjunto basico de URLs administrativas.

Padrao dos enderecos:

| Operacao | URL |
|---|---|
| Listar | `/admin/<app_label>/<model_name>/` |
| Adicionar | `/admin/<app_label>/<model_name>/add/` |
| Editar | `/admin/<app_label>/<model_name>/<pk>/change/` |
| Excluir | `/admin/<app_label>/<model_name>/<pk>/delete/` |
| Historico | `/admin/<app_label>/<model_name>/<pk>/history/` |

Exemplos do EDU:

```text
/admin/edu/turno/
/admin/edu/turno/add/
/admin/edu/turno/3/change/
/admin/edu/aluno/
/admin/edu/aluno/95812/change/
```

`edu` e o `app_label`; `turno` e `aluno` sao os nomes internos dos models em
minusculas. O numero da URL de edicao e a chave primaria, nao necessariamente a
matricula ou outro codigo de negocio.

### 1.3. Registro do model

Para o Admin conhecer um model, ele deve ser registrado. O formato tradicional
usado no EDU e:

```python
admin.site.register(Model, ModelAdmin)
```

Durante a inicializacao, a aplicacao `django.contrib.admin` procura os modulos
`admin.py` das aplicacoes instaladas. Ao importar `edu/admin.py`, as chamadas a
`admin.site.register()` adicionam os models ao `AdminSite`.

O Django tambem oferece a sintaxe com decorador:

```python
@admin.register(Turno)
class TurnoAdmin(ModelAdminPlus):
    ...
```

As duas formas registram a mesma associacao. Neste material sera preservado o
formato predominante no arquivo `edu/admin.py`.

Exemplo real:

**Arquivo:** `edu/admin.py`  
**Linhas:** `320-327`

```python
class TurnoAdmin(ModelAdminPlus):
    list_display = ('id', 'descricao')
    ordering = ('descricao',)
    search_fields = ('descricao',)
    list_display_icons = False
    export_to_xls = True


admin.site.register(Turno, TurnoAdmin)
```

Leitura linha a linha:

- `TurnoAdmin` descreve como o model sera administrado;
- `ModelAdminPlus` e a classe-base do DJTools;
- `list_display` escolhe as colunas da listagem;
- `ordering` define a ordenacao inicial;
- `search_fields` define onde a caixa de pesquisa procura;
- `list_display_icons` e `export_to_xls` sao recursos do SUAP;
- `admin.site.register()` liga o model `Turno` a essa configuracao.

O model correspondente esta em `edu/models/cadastros_gerais.py:345-363`:

```python
class Turno(LogModel):
    descricao = models.CharFieldPlus('Descricao', unique=True)

    class Meta:
        verbose_name = 'Turno'
        verbose_name_plural = 'Turnos'
        ordering = ('id',)

    def __str__(self):
        return self.descricao
```

O Admin usa informacoes do model:

- `verbose_name` e `verbose_name_plural` ajudam a nomear as telas;
- os campos determinam o formulario padrao;
- `__str__()` representa o objeto em selects e mensagens;
- tipos, obrigatoriedade e validadores participam do formulario.

### 1.4. Reutilizacao de uma classe de admin

O EDU registra varios models simples com a mesma configuracao.

**Arquivo:** `edu/admin.py`  
**Linhas:** `203-232`

```python
class SomenteDescricaoModelAdmin(ModelAdminPlus):
    list_display = ('descricao',)
    ordering = ('descricao',)
    search_fields = ('descricao',)
    list_display_icons = True
    export_to_xls = True


for cls in (
    NaturezaParticipacao,
    Convenio,
    Nucleo,
    TipoProfessorDiario,
    # ... outros models com o mesmo formato ...
):
    admin.site.register(cls, SomenteDescricaoModelAdmin)
```

Essa reutilizacao e adequada porque os models possuem uma necessidade
administrativa equivalente. Nao se deve criar uma classe-base generica apenas
para reduzir poucas linhas quando as regras e telas forem diferentes.

#### 1.4.1. Exemplo concreto: `NaturezaParticipacao`

Um dos models registrados no laco e `NaturezaParticipacao`. Sua implementacao
esta em `edu/models/cadastros_gerais.py:330-342`:

```python
class NaturezaParticipacao(LogModel):
    descricao = models.CharFieldPlus('Descrição', unique=True)

    class Meta:
        verbose_name = 'Natureza de Participação'
        verbose_name_plural = 'Naturezas de Participação'
        ordering = ('descricao',)

    def __str__(self):
        return self.descricao
```

Para abrir sua tela:

```text
/admin/edu/naturezaparticipacao/
```

Nessa listagem, a classe compartilhada produz:

- uma coluna `descricao`, por causa de `list_display`;
- pesquisa pelo mesmo campo, por causa de `search_fields`;
- ordenacao alfabetica;
- icones de visualizacao/edicao do `ModelAdminPlus`;
- exportacao para XLS.

Embora a classe Python seja a mesma, `admin.site.register()` cria uma
instancia administrativa para cada model. Assim, a instancia associada a
`NaturezaParticipacao` conhece esse model e gera o prefixo
`/admin/edu/naturezaparticipacao/`; a instancia associada a `Convenio` gera
`/admin/edu/convenio/`.

#### 1.4.2. Limites da reutilizacao

`SomenteDescricaoModelAdmin` pressupoe que todos os models registrados possuam
um campo chamado `descricao`. Ela deixa de ser adequada quando um model
precisa de comportamento proprio, por exemplo:

- coluna que acessa outro campo ou relacionamento;
- filtros especificos;
- form personalizado;
- queryset limitado por campus ou perfil;
- permissao contextual;
- redirect especial depois do salvamento;
- hooks ou inlines proprios.

Registrar nessa classe um model que possua somente o campo `nome`, por exemplo,
faria `list_display`, `ordering` e `search_fields` apontarem para um campo
inexistente. Se as diferencas comecarem a exigir varias condicoes baseadas em
`self.model`, e preferivel criar outra classe de Admin com responsabilidade
clara.

<a id="etapa-2"></a>

## Etapa 2 — Configurações essenciais

### 2.1. Configuracoes da listagem

Os atributos abaixo pertencem ao `ModelAdmin` do Django e tambem funcionam no
`ModelAdminPlus` por heranca. Seus valores padrao podem ser vistos em
`django/contrib/admin/options.py:612-630`, na implementacao do Django 4.1.5.

Quando a listagem e acessada, `ModelAdmin.get_changelist_instance()` reune
essas opcoes e as entrega ao objeto `ChangeList`. Esse encadeamento esta em
`django/contrib/admin/options.py:822-849`.

| Atributo | Valor padrao | Funcao |
|---|---|---|
| `list_display` | `('__str__',)` | Define colunas e metodos apresentados |
| `list_display_links` | `()` | Define quais colunas abrem a edicao |
| `list_filter` | `()` | Adiciona filtros laterais |
| `search_fields` | `()` | Define campos consultados pela busca textual |
| `ordering` | Conforme model | Define ordenacao inicial |
| `list_per_page` | `100` | Define quantidade por pagina |
| `list_select_related` | `False` | Antecipa relacionamentos para reduzir consultas |
| `date_hierarchy` | `None` | Cria navegacao por ano, mes e dia |
| `list_editable` | `()` | Permite editar campos diretamente na listagem |

### 2.2. Ciclo completo: `changelist`, `ChangeList` e `ChangeListPlus`

Os tres nomes representam partes diferentes da mesma listagem:

| Elemento | Origem | Responsabilidade |
|---|---|---|
| `changelist_view()` | Django, sobrescrita pelo `ModelAdminPlus` | recebe a requisicao e coordena permissao, actions, exportacao, contexto e resposta |
| `ChangeList` | Django | interpreta configuracoes do Admin e monta filtros, busca, ordenacao, paginacao e resultados |
| `ChangeListPlus` | DJTools/SUAP | herda `ChangeList` e adapta busca, filtros relacionados e ordenacao |

Em outras palavras, **changelist** e o fluxo/tela de listagem;
`changelist_view()` e a view que o coordena; e `ChangeList` e o objeto que
representa o estado daquela listagem durante uma requisicao.

#### 2.2.1. Ponto de entrada da listagem

Para `AlunoAdmin`, a URL e:

```text
/admin/edu/aluno/
```

`ModelAdmin.get_urls()` associa o caminho vazio do prefixo do model a
`changelist_view()`. O fluxo inicial e:

```text
GET /admin/edu/aluno/
  -> AdminSite encontra AlunoAdmin
  -> AdminSite.admin_view() aplica a protecao administrativa
  -> AlunoAdmin.changelist_view(request)
  -> ModelAdminPlus.changelist_view(request)
  -> ModelAdmin.changelist_view(request)
```

O `AlunoAdmin` nao sobrescreve `changelist_view()`. Por herdar de
`ModelAdminPlus`, usa a implementacao de
`djtools/contrib/admin/options/__init__.py:348-385`.

Essa implementacao:

1. guarda a requisicao em `self.request`;
2. configura a chave de ajuda da pagina;
3. desvia o fluxo para uma tarefa quando ha exportacao;
4. acrescenta action bar, titulo e breadcrumbs ao contexto;
5. chama `super().changelist_view()` para executar o ciclo nativo;
6. trata filtros invalidos;
7. em uma requisicao AJAX, devolve somente o fragmento principal da pagina.

#### 2.2.2. Como nasce o objeto `ChangeListPlus`

No ciclo nativo, `ModelAdmin.get_changelist_instance()` coleta as
configuracoes do Admin, como:

```text
model
list_display e list_display_links
list_filter e date_hierarchy
search_fields
list_select_related
list_per_page e list_max_show_all
list_editable
ordering e sortable_by
```

Antes de instanciar o objeto, o Django pergunta qual classe deve usar por meio
de `get_changelist()`. O `ModelAdminPlus` substitui esse metodo em
`djtools/contrib/admin/options/__init__.py:200-206`:

```python
def get_changelist(self, request, **kwargs):
    self.request = request
    return ChangeListPlus
```

Portanto, numa classe nativa de `ModelAdmin`, o resultado normalmente e
`ChangeList`; numa classe baseada em `ModelAdminPlus`, como `AlunoAdmin`, o
resultado e `ChangeListPlus`.

```text
ModelAdmin.get_changelist_instance()
  -> model_admin.get_changelist(request)
  -> ChangeListPlus(...configuracoes da listagem...)
  -> cl
```

O objeto costuma ser chamado de `cl` no codigo e nos templates.

#### 2.2.3. O que acontece dentro do `ChangeList`

`ChangeListPlus` herda o construtor do `ChangeList`, implementado pelo Django
em `django/contrib/admin/views/main.py`. Durante a criacao do objeto, o ciclo
principal e:

```text
ModelAdmin.get_queryset(request)
  -> queryset raiz do model
  -> leitura dos parametros GET
  -> construcao dos filtros
  -> aplicacao da busca textual
  -> select_related(), quando configurado
  -> ordenacao
  -> eliminacao de duplicidades, quando necessaria
  -> contagem e paginacao
  -> result_list da pagina atual
```

Os principais estados sao:

| Atributo | Significado |
|---|---|
| `cl.root_queryset` | queryset inicial devolvido pelo `ModelAdmin` |
| `cl.queryset` | queryset depois de filtros, busca e ordenacao |
| `cl.result_count` | quantidade de registros no resultado filtrado |
| `cl.full_result_count` | quantidade antes dos filtros da tela, quando calculada |
| `cl.paginator` | paginador da listagem |
| `cl.page_num` | pagina solicitada |
| `cl.result_list` | objetos da pagina que serao renderizados |
| `cl.filter_specs` | objetos responsaveis pelos filtros visiveis |

O queryset continua preguiçoso durante boa parte da composicao. Consultas sao
efetivamente executadas quando o Admin calcula contagens, fatia a pagina ou
percorre `result_list` para renderizar as linhas.

#### 2.2.4. Parametros GET usados por busca, filtros, tabs, paginacao e ordenacao

Os controles da listagem administrativa normalmente nao alteram dados. Eles
fazem uma nova requisicao `GET` para a mesma URL, acrescentando parametros depois
do caractere `?`:

```text
/admin/edu/aluno/?q=Paloma&tab=tab_suap&p=1
                   \________ parametros GET ________/
```

No Python, esses valores ficam disponiveis em `request.GET`, um `QueryDict` do
Django:

```python
termo = request.GET.get('q')
tab = request.GET.get('tab')
```

O `QueryDict` e semelhante a um dicionario, mas aceita mais de um valor para a
mesma chave. Para filtros de multipla escolha, o SUAP usa
`request.GET.getlist(...)`, por exemplo em
`djtools/contrib/admin/filters/__init__.py:15-30`.

Os parametros nao possuem todos a mesma origem:

| Recurso | Parametro comum | Origem | Consumidor principal |
|---|---|---|---|
| Busca | `q` | Django Admin | `get_search_results()` |
| Filtro | nome do lookup, como `situacao__id__exact` | Django Admin/DJTools | `get_filters()` e o filtro correspondente |
| Tab | `tab` | DJTools/SUAP | `CustomTabListFilter` |
| Paginacao | `p` | Django Admin | paginador do `ChangeList` |
| Ordenacao | `o` | Django Admin | `ChangeList.get_ordering()` |

As constantes usadas pelo `ChangeListPlus` podem ser vistas em
`djtools/contrib/admin/views/__init__.py:19-29`:

```python
class ChangeListPlus(ChangeList):
    ALL_VAR = 'all'
    ORDER_VAR = 'o'
    ORDER_TYPE_VAR = 'ot'
    PAGE_VAR = 'p'
    SEARCH_VAR = 'q'
    TO_FIELD_VAR = 't'
    IS_POPUP_VAR = 'pop'
    ERROR_FLAG = 'e'
```

`q`, `o` e `p`, portanto, nao sao nomes de campos do model. Sao comandos da
interface administrativa interpretados pelo `ChangeList`.

Considere uma URL didatica:

```text
/admin/edu/aluno/?tab=tab_suap&ano_letivo__id__exact=<id-do-ano>&q=Paloma&o=2&p=1
```

Cada parte alimenta o `ChangeList`:

| Parametro | Efeito |
|---|---|
| `tab=tab_suap` | seleciona uma tab do `CustomTabListFilter` |
| `ano_letivo__id__exact=<id-do-ano>` | aplica um filtro de campo |
| `q=Paloma` | executa a busca em `search_fields` |
| `o=2` | solicita ordenacao por uma coluna da listagem |
| `p=1` | solicita uma pagina do paginador |

##### A. Busca textual: `q`

O formulario de pesquisa do SUAP esta em
`djtools/templates/adminutils/search_form.html:1-9`. O atributo `name` do campo
recebe `search_var`, cujo valor e `q`:

```django
<input
    type="text"
    name="{{ search_var }}"
    value="{{ cl.query }}"
    id="searchbar"
/>
```

O template tambem preserva os demais parametros em campos ocultos. Assim, fazer
uma busca nao precisa descartar a tab e os filtros ja selecionados.

Exemplo:

```text
/admin/edu/aluno/?q=Paloma
```

O termo e aplicado somente aos campos declarados em `search_fields`. No
`AlunoAdmin`, eles aparecem em `edu/admin.py:1615`:

```python
search_fields = (
    'pessoa_fisica__nome_registro',
    'pessoa_fisica__search_fields_optimized',
    'registroemissaodiploma__pasta',
    'numero_pasta',
)
```

O `ModelAdminPlus.get_search_results()`, em
`djtools/contrib/admin/options/__init__.py:261-293`, separa o texto em termos,
constroi os lookups e acrescenta condicoes ao queryset. Em termos simplificados:

```text
q=Paloma Souza
  -> termos: "Paloma" e "Souza"
  -> cada termo e procurado nos campos de search_fields
  -> o resultado deve atender aos termos normalizados
```

Por padrao, `ModelAdminPlus.avoid_short_search` vale `True`, em
`djtools/contrib/admin/options/__init__.py:136-137`. Por isso, a interface exige
ao menos tres caracteres e o backend pode desconsiderar termos muito curtos.

##### B. Filtros: nomes de campos e lookups do ORM

Filtros nao possuem uma unica chave fixa. O nome do parametro depende do campo e
do lookup produzido pelo `FieldListFilter` ou pelo filtro personalizado.

Exemplos de formato:

```text
?ano_letivo__id__exact=<id-do-ano>
?periodo_letivo__exact=1
?situacao__id__exact=<id-da-situacao>
?curso_campus__diretoria__setor__uo__id__exact=<id-do-campus>
```

As partes separadas por `__` formam o caminho que o ORM deve percorrer:

```text
curso_campus -> diretoria -> setor -> uo -> id -> exact
```

Esses filtros correspondem ao `list_filter` real de `AlunoAdmin`, em
`edu/admin.py:1601-1606`:

```python
list_filter = (
    CustomTabListFilter,
    'ano_letivo',
    'periodo_letivo',
    'situacao',
    'curso_campus__diretoria__setor__uo',
    'curso_campus',
    'polo',
    'curso_campus__modalidade',
)
```

O processamento ocorre em `ChangeListPlus.get_filters()`, localizado em
`djtools/contrib/admin/views/__init__.py:50-164`. O metodo:

1. separa os parametros reservados, como busca e ordenacao;
2. verifica se cada lookup e permitido com `lookup_allowed()`;
3. entrega os parametros aos filtros declarados em `list_filter`;
4. prepara os lookups restantes;
5. identifica se relacionamentos podem produzir registros duplicados.

O filtro escolhido e acrescentado ao queryset; ele nao substitui o queryset
seguro devolvido por `AlunoAdmin.get_queryset()`.

Um valor recebido por `GET` continua sendo entrada do usuario. Nas linhas
`55-57`, o `ChangeListPlus` rejeita lookups nao autorizados. Se o filtro for
invalido, `ModelAdminPlus.changelist_view()` trata a excecao em
`djtools/contrib/admin/options/__init__.py:379-381` e devolve uma mensagem de
erro. Nunca se deve usar um parametro livre para montar SQL manualmente.

##### C. Tabs do SUAP: `tab`

`tab` nao e uma constante padrao do `ChangeList` do Django. No SUAP, ela e
implementada por `TabListFilter`, em
`djtools/contrib/admin/filters/__init__.py:55-58`:

```python
class TabListFilter(admin.SimpleListFilter):
    title = 'tab'
    parameter_name = 'tab'
    template = 'admin/tablistfilter.html'
```

O `AlunoAdmin` declara suas tabs em `edu/admin.py:1633-1649`:

```python
def tab_suap(self, request, queryset):
    return queryset.filter(
        codigo_academico__isnull=True,
        matriz__id__isnull=False,
    )


def get_tabs(self, request):
    return ['tab_suap', 'tab_q_academico', 'tab_integralizados']
```

Ao acessar:

```text
/admin/edu/aluno/?tab=tab_suap
```

`CustomTabListFilter.queryset()`, em
`djtools/contrib/admin/filters/__init__.py:149-171`, localiza o metodo cujo nome
veio no parametro e o chama com o queryset atual:

```python
return getattr(self.model_admin, self.value())(request, queryset)
```

Quando `tab` nao e informado, o filtro aplica a primeira tab devolvida por
`get_all_tabs()`, conforme as linhas `158-162`. Portanto, ausencia do parametro
na URL nao significa necessariamente ausencia de filtro de tab.

O template `djtools/templates/admin/tablistfilter.html:1-10` gera os links das
abas por meio de `cl.get_query_string()`. Isso permite trocar a tab preservando
parametros compativeis da listagem.

##### D. Paginacao: `p`

O parametro `p` identifica a pagina solicitada:

```text
?p=0  -> primeira pagina
?p=1  -> segunda pagina
?p=2  -> terceira pagina
```

Internamente, a numeracao usada pelo `ChangeList` comeca em zero. Esse detalhe e
facil de confundir porque a interface visual apresenta paginas a partir de 1.

No `AlunoAdmin`, `list_per_page = 15`, em `edu/admin.py:1610`. Assim, cada pagina
normalmente exibe ate 15 alunos. O parametro nao altera o conjunto filtrado; ele
define apenas qual fatia desse conjunto sera colocada em `cl.result_list`.

O SUAP gera os links em `djtools/templatetags/tags/utils.py:199-213`:

```python
url = cl.get_query_string({PAGE_VAR: i})
```

`get_query_string()` troca `p` e preserva busca, filtros, tab e ordenacao. Ao
alterar um filtro, a navegacao deve voltar a uma pagina valida; uma pagina que
existia antes da filtragem pode deixar de existir depois dela.

##### E. Ordenacao: `o`

O parametro `o` nao recebe diretamente o nome do campo. Ele usa a posicao
interna da coluna na `list_display` renderizada:

```text
?o=2     -> ordenacao por uma coluna
?o=-2    -> mesma coluna na direcao inversa
?o=2.-3  -> mais de um criterio de ordenacao
```

O sinal `-` indica ordem descendente, e criterios multiplos sao separados por
ponto. Como o indice depende da composicao da listagem, inclusive de colunas
adicionadas pelo Admin, nao se deve construir esse valor supondo que ele seja o
ID de um campo.

Para um campo real, o Django consegue obter a expressao de ordenacao. Para uma
coluna calculada, ele precisa de `admin_order_field` ou de `ordering=` em
`@admin.display`. O exemplo de `AlunoAdmin`, em `edu/admin.py:1862-1863`, liga a
coluna **Dados Principais** ao nome da pessoa:

```python
get_info_principal.short_description = 'Dados Principais'
get_info_principal.admin_order_field = 'pessoa_fisica__nome'
```

O Django traduz o indice recebido em `o` para essa expressao e aplica algo
equivalente a:

```python
queryset.order_by('pessoa_fisica__nome')
```

Depois do processamento nativo, `ChangeListPlus.get_ordering()`, em
`djtools/contrib/admin/views/__init__.py:166-170`, remove um `-pk` adicional em
determinadas ordenacoes compostas.

##### F. Composicao e preservacao dos parametros

Os recursos podem ser combinados na mesma URL:

```text
/admin/edu/aluno/
    ?tab=tab_suap
    &ano_letivo__id__exact=<id-do-ano>
    &situacao__id__exact=<id-da-situacao>
    &q=Paloma
    &o=2
    &p=1
```

Na URL real, tudo aparece em uma unica linha. A separacao acima serve apenas para
facilitar a leitura.

O metodo `cl.get_query_string()` e importante porque gera uma nova query string
alterando ou removendo apenas as chaves indicadas. Sem ele, clicar na pagina 2
poderia apagar a busca, ou trocar uma tab poderia apagar todos os filtros.

Os parametros influenciam a consulta nesta sequencia conceitual:

```text
get_queryset() do ModelAdmin
    -> tab e filtros restringem registros
    -> q aplica a busca textual
    -> o define a ordenacao
    -> contagens sao calculadas
    -> p seleciona a fatia da pagina
    -> result_list e renderizada
```

A URL torna o estado da tela reproduzivel e compartilhavel, mas **nao concede
permissao**. O usuario continua limitado por `has_view_permission()`, pelo
manager usado em `get_queryset()` e pelas regras de escopo do sistema.

Fluxo sobre o exemplo de aluno:

```text
AlunoAdmin.get_queryset()
  -> parte de Aluno.locals
  -> exclui matriculas temporarias de minicurso
  -> antecipa ano_letivo, pessoa_fisica e situacao
  -> tab_suap() restringe a origem academica
  -> filtro restringe o ano letivo
  -> busca procura Paloma
  -> ordering organiza o resultado
  -> paginator seleciona a pagina
```

A ordem exata de composicao e controlada pelo `ChangeList`, mas todas as
operacoes permanecem encadeadas sobre o queryset inicial do Admin. Por isso,
busca e filtros nao devem reconstruir a consulta com `Aluno.objects.all()`.

##### G. Acompanhamento do fluxo

1. Abra `/admin/edu/aluno/` e acompanhe a barra de endereco.
2. Digite um nome com pelo menos tres caracteres e identifique `q`.
3. Selecione ano letivo e situacao; identifique os lookups adicionados.
4. Troque entre as tabs e localize `tab=tab_suap`, `tab=tab_q_academico` ou
   `tab=tab_integralizados`.
5. Clique em um cabecalho ordenavel e observe `o`; clique novamente e veja a
   inversao da direcao.
6. Avance uma pagina e observe que a segunda pagina usa `p=1`.
7. Remova um parametro por vez diretamente da URL e compare o resultado.
8. No depurador, inspecione `request.GET`, `cl.params`, `cl.queryset.query` e
   `cl.page_num`.

> **Resumo didatico:** `GET` descreve o estado atual da listagem. `q`, `o` e `p`
> controlam recursos gerais do `ChangeList`; os lookups controlam filtros; e
> `tab` seleciona uma filtragem adicional implementada pelo DJTools. Todos eles
> refinam o queryset que o usuario ja tem permissao para consultar.

#### 2.2.5. O que o `ChangeListPlus` modifica

`ChangeListPlus` esta em `djtools/contrib/admin/views/__init__.py:19-170` e
sobrescreve tres pontos principais.

**1. `get_queryset()` - busca adaptada ao SUAP**

Nas linhas `31-48`, primeiro chama o comportamento nativo:

```python
qs = super().get_queryset(request)
```

Quando o model possui um campo de busca otimizado reconhecido por
`get_search_field()`, normaliza os termos, converte-os para ASCII em maiusculas
e reaplica a busca com `contains`. Isso atende a convencao dos campos
`search_fields_optimized` usados pelo SUAP.

**2. `get_filters()` - filtros relacionados e datas**

Nas linhas `50-164`, valida se cada lookup e permitido, cria os filtros e
detecta consultas que podem produzir duplicidades. Para determinados campos
relacionados, monta `QuerysetACListFilter`, oferecendo autocomplete limitado
ao queryset acessivel pelo Admin. Tambem converte `date_hierarchy` em limites
`gte` e `lt` para o periodo escolhido.

**3. `get_ordering()` - ajuste da ordenacao**

Nas linhas `166-170`, parte da ordenacao nativa e remove um `-pk` adicional
quando ja existe mais de um criterio:

```python
def get_ordering(self, request, queryset):
    ordering = super().get_ordering(request, queryset)
    if len(ordering) > 1 and ordering[-1] == '-pk':
        ordering.pop(-1)
    return ordering
```

O objetivo e preservar a ordenacao solicitada sem manter esse desempate
automatico especifico no final da lista.

#### 2.2.6. GET, POST e exportacao

O mesmo `changelist_view()` atende fluxos diferentes:

| Requisicao | Caminho principal |
|---|---|
| `GET` comum | monta `ChangeListPlus`, contexto e pagina HTML |
| `GET` com filtros | monta o mesmo objeto com queryset restringido |
| `GET` com `export_to_xls=1` | reconstrói o queryset atual e inicia a tarefa de exportacao |
| `POST` de action | monta o queryset, limita a selecao e executa a action |
| `POST` de `list_editable` | valida o formset da listagem e salva as linhas alteradas |

Na exportacao, `ModelAdminPlus.get_current_queryset()`, em
`djtools/contrib/admin/options/__init__.py:237-259`, instancia um
`ChangeListPlus` e devolve `cl.get_queryset(request)`. Assim, busca, filtros e
ordenacao podem ser reutilizados sem limitar a exportacao a pagina visivel.

#### 2.2.7. Contexto e template final

Depois de montar resultados, actions e formularios editaveis, a view coloca o
objeto no contexto como `cl`. O `ModelAdminPlus` define em
`djtools/contrib/admin/options/__init__.py:119-121`:

```python
change_list_template = 'djtools/templates/adminutils/change_list.html'
```

Esse template estende `admin/change_list.html` na linha 1. Entre outras
customizacoes, ele:

- renderiza a action bar do SUAP;
- integra tabs, busca e filtros;
- atualiza o conteudo por AJAX quando `filters_ajax` esta ativo;
- preserva os filtros no link de exportacao.

Em requisicoes AJAX, `ModelAdminPlus.changelist_view()` renderiza apenas
`djtools/templates/adminutils/content_main_admin.html`, nas linhas `382-383`,
e o JavaScript substitui `#content-main` sem recarregar a pagina inteira.

Fluxo completo resumido:

```text
URL da listagem
  -> AdminSite.admin_view()
  -> ModelAdminPlus.changelist_view()
  -> ModelAdmin.changelist_view()
  -> get_changelist_instance()
  -> get_changelist() retorna ChangeListPlus
  -> ChangeListPlus monta queryset, filtros, busca e ordering
  -> ChangeList calcula contagens, pagina e result_list
  -> contexto recebe cl
  -> change_list.html ou fragmento AJAX
  -> resposta HTML
```

#### 2.2.8. Como acompanhar o fluxo

1. Abra `/admin/edu/aluno/` sem filtros.
2. Coloque um breakpoint em `AlunoAdmin.get_queryset()` e identifique o
   queryset raiz.
3. Continue ate `ModelAdminPlus.get_changelist()` e confirme que a classe
   devolvida e `ChangeListPlus`.
4. Depois da chamada a `super().changelist_view()`, obtenha
   `cl = retorno.context_data['cl']` e observe `cl.root_queryset`,
   `cl.queryset`, `cl.result_count` e `cl.result_list`.
5. Aplique uma tab, um filtro e uma busca; compare `request.GET` e
   `cl.queryset.query`.
6. Troque a ordenacao clicando em uma coluna e localize o parametro `o`.
7. Mude de pagina e localize o parametro `p`.
8. Observe no navegador que filtros AJAX alteram a URL e substituem apenas o
   conteudo principal.

> **Resumo didatico:** o `ModelAdmin` declara como a listagem deve funcionar;
> o `ChangeListPlus` transforma declaracoes e parametros HTTP em um queryset;
> e `changelist_view()` coordena permissao, actions, exportacao, template e
> resposta.

### 2.3. `list_display`

`list_display` aceita nomes de campos do model e nomes de metodos do admin:

```python
list_display = ('id', 'descricao', 'get_situacao')
```

Campo do model:

```python
'descricao'
```

Coluna calculada:

```python
def get_situacao(self, obj):
    return 'Ativo' if obj.ativo else 'Inativo'

get_situacao.short_description = 'Situacao'
get_situacao.admin_order_field = 'ativo'
```

O metodo recebe `obj`, o registro da linha atual. `short_description` define o
cabecalho e `admin_order_field` informa qual campo deve ser usado ao ordenar.

Exemplo real em `AlunoAdmin`, `edu/admin.py:1843-1863`:

```python
def get_info_principal(self, obj):
    # Monta um resumo com nome, matricula, curso e situacao.
    ...
    return mark_safe(out)


get_info_principal.short_description = 'Dados Principais'
get_info_principal.admin_order_field = 'pessoa_fisica__nome'
```

`mark_safe()` impede que o HTML seja escapado. Ele deve ser usado somente com
conteudo controlado ou devidamente escapado. Dados livres inseridos diretamente
em HTML podem abrir uma vulnerabilidade de XSS. Quando possivel, prefira
`format_html()`.

#### 2.3.1. Metadados de colunas: `short_description`, `admin_order_field`, `boolean` e `@admin.display`

Quando um nome colocado em `list_display` aponta para um metodo, o valor da
coluna e calculado em Python. Por isso, o Django nao consegue descobrir sozinho:

- qual titulo deve aparecer no cabecalho;
- por qual campo do banco a coluna pode ser ordenada;
- se o retorno deve ser apresentado como um indicador booleano.

Essas informacoes sao fornecidas por **metadados anexados ao metodo**. Eles nao
criam campos no model e nao salvam valores no banco: apenas orientam a forma como
o Django Admin apresenta e ordena a coluna.

| Sintaxe tradicional | `@admin.display` | Funcao |
|---|---|---|
| `metodo.short_description` | `description=` | Define o titulo da coluna |
| `metodo.admin_order_field` | `ordering=` | Define a expressao usada na ordenacao |
| `metodo.boolean = True` | `boolean=True` | Usa os icones de verdadeiro, falso e desconhecido |
| `metodo.empty_value_display` | `empty_value=` | Define como um valor vazio sera exibido |

O SUAP utiliza o Django `4.1.5`, conforme `requirements/base.txt:2`. Nessa
versao, `@admin.display` e um decorador **nativo do Django**, implementado em
`django/contrib/admin/decorators.py`. O decorador somente registra esses mesmos
atributos na funcao; ele nao executa consultas e nao chama o metodo.

##### A. `short_description`: titulo legivel para a coluna

Sem uma descricao explicita, o Django tenta produzir um titulo a partir do nome
do campo ou metodo. Em nomes tecnicos como `get_info_principal`, o resultado nao
costuma ser adequado para o usuario.

Exemplo real em `AlunoAdmin`, `edu/admin.py:1843-1863`:

```python
def get_info_principal(self, obj):
    # Calcula o conteudo exibido para cada aluno da listagem.
    ...
    return mark_safe(out)


# O cabecalho da coluna sera "Dados Principais".
get_info_principal.short_description = 'Dados Principais'
```

Neste exemplo:

1. `list_display` solicita a coluna `get_info_principal`;
2. para cada linha, o Admin chama `get_info_principal(self, obj)`;
3. `obj` e o `Aluno` correspondente aquela linha;
4. `short_description` define apenas o texto do cabecalho.

##### B. `admin_order_field`: ordenacao de uma coluna calculada

O retorno de `get_info_principal()` e um trecho de HTML. Ordenar por esse HTML
em Python seria incorreto e ineficiente. Em `edu/admin.py:1863`, o codigo informa
ao Django qual campo real deve ser enviado ao ORM:

```python
get_info_principal.admin_order_field = 'pessoa_fisica__nome'
```

Assim, quando o usuario clica no cabecalho **Dados Principais**, o fluxo e:

```text
Clique no cabecalho
        |
        v
parametro "o" na query string
        |
        v
ChangeList resolve admin_order_field
        |
        v
QuerySet.order_by('pessoa_fisica__nome')
        |
        v
ORDER BY no banco de dados
```

Os dois sublinhados atravessam o relacionamento de `Aluno` com
`PessoaFisica`. Portanto, a coluna mostra um resumo, mas e ordenada pelo nome da
pessoa. Tambem seria possivel usar `'-pessoa_fisica__nome'` para declarar a
ordem descendente inicial da coluna.

Pontos importantes:

- o atributo nao ordena pelo valor retornado pelo metodo;
- o caminho precisa ser valido para `QuerySet.order_by()`;
- campos relacionados podem adicionar `JOIN` a consulta;
- o metadado habilita a ordenacao, mas nao cria indice no banco;
- se `admin_order_field` nao for definido, o cabecalho da coluna calculada nao
  sera ordenavel.

##### C. `boolean`: icones no lugar de texto

Quando um metodo retorna `True`, `False` ou `None`, o metadado `boolean = True`
faz o Admin usar os icones padrao de sim, nao e desconhecido.

Exemplo real em
`licenca_capacitacao/admin.py:856-859`:

```python
def get_solicitou_desistencia(self, obj):
    # Converte a existencia da data em um booleano verdadeiro ou falso.
    return True if obj.data_solicitacao_desistencia else False


get_solicitou_desistencia.short_description = 'Solicitou Desistencia'
get_solicitou_desistencia.boolean = True
```

O metodo verifica se existe uma data de solicitacao. Com `boolean = True`, a
listagem nao imprime literalmente `True` ou `False`; ela apresenta o indicador
visual padrao do Admin.

O retorno deve ser realmente booleano ou `None`:

| Retorno | Apresentacao esperada |
|---|---|
| `True` | icone positivo |
| `False` | icone negativo |
| `None` | icone de valor desconhecido |

Nao se deve retornar `'Sim'` ou `'Nao'` quando `boolean = True`. Esse metadado
tambem nao cria um filtro lateral e nao constitui uma regra de permissao; ele
altera somente a representacao do valor.

##### D. `@admin.display`: forma moderna e declarativa

O decorador concentra os metadados junto da assinatura do metodo. Para utiliza-lo,
o modulo precisa importar o admin do Django:

```python
from django.contrib import admin
```

Exemplo real em `siads/admin.py:328-342`:

```python
class MaterialPermanenteAdmin(ModelAdminPlus):
    list_display = ('uo', 'grupo', 'get_entrada_descricao', 'get_extras', 'get_ajuste')

    @admin.display(ordering='entrada__descricao')
    def get_entrada_descricao(self, obj):
        ...
        return safe(''.join(ret))

    get_entrada_descricao.short_description = 'Entrada'
```

Esse trecho e um exemplo de transicao: `ordering` ja usa o decorador moderno,
enquanto a descricao ainda utiliza o atributo tradicional. As duas formas podem
coexistir porque o decorador grava metadados na propria funcao.

Um exemplo de `description` com a sintaxe moderna aparece em
`pgd2/models.py:1385-1395`:

```python
@admin.display(description='Data inicio')
def get_data_inicio(self):
    return self.periodo_pes.data_inicio
```

Nesse caso, o metodo pertence ao model e recebe apenas `self`, que e a propria
instancia exibida. Em um metodo definido no `ModelAdmin`, os parametros usuais
sao `self` e `obj`.

O uso moderno equivalente ao exemplo do aluno seria:

```python
@admin.display(
    description='Dados Principais',
    ordering='pessoa_fisica__nome',
)
def get_info_principal(self, obj):
    ...
    return mark_safe(out)
```

Isso e apenas uma reescrita didatica: o codigo atual de `AlunoAdmin` continua
usando `short_description` e `admin_order_field` depois da definicao do metodo.

##### E. Exemplo moderno com `boolean=True`

O model de PGD apresenta um uso real em `pgd/models.py:915-924`:

```python
@admin.display(boolean=True)
def estah_vigente(self):
    if not self.cancelado:
        hoje = datetime.date.today()
        if self.data_inicio > hoje:
            return False
        return not self.data_fim or self.data_fim >= hoje
    return False


estah_vigente.short_description = 'Esta vigente'
```

A versao totalmente concentrada no decorador seria:

```python
@admin.display(description='Esta vigente', boolean=True)
def estah_vigente(self):
    ...
```

`boolean=True` e `empty_value=` nao devem ser usados simultaneamente: uma coluna
booleana ja reserva `None` para representar o estado desconhecido.

##### F. Como estudar o trecho

Ao encontrar uma coluna calculada, siga esta ordem:

1. Localize o nome da coluna em `list_display`.
2. Descubra se o nome corresponde a um campo, metodo do model ou metodo do
   `ModelAdmin`.
3. Leia o retorno do metodo para entender o conteudo de cada linha.
4. Procure `short_description` ou `description=` para identificar o cabecalho.
5. Procure `admin_order_field` ou `ordering=` para saber se a coluna e
   ordenavel e qual campo chega ao ORM.
6. Procure `boolean = True` ou `boolean=True` para saber se o valor sera
   representado por icones.

> **Resumo didatico:** o metodo calcula o valor; os metadados explicam ao Admin
> como apresentar e ordenar esse valor. A sintaxe tradicional e
> `metodo.atributo = valor`; `@admin.display(...)` e a forma nativa moderna de
> declarar as mesmas informacoes perto do metodo.

### 2.4. `search_fields`

Exemplo de `AlunoAdmin`, em `edu/admin.py:1615`:

```python
search_fields = (
    'pessoa_fisica__nome_registro',
    'pessoa_fisica__search_fields_optimized',
    'registroemissaodiploma__pasta',
    'numero_pasta',
)
```

Os dois sublinhados atravessam relacionamentos:

```text
Aluno -> pessoa_fisica -> nome_registro
Aluno -> registroemissaodiploma -> pasta
```

No Django, prefixos podem alterar a busca:

| Sintaxe | Comportamento aproximado |
|---|---|
| `'nome'` | `icontains` |
| `'^nome'` | `istartswith` |
| `'=matricula'` | correspondencia exata |
| `'@texto'` | busca textual, conforme backend |

O `ModelAdminPlus` sobrescreve `get_search_results()` em
`djtools/contrib/admin/options/__init__.py:261-293`. Alem de construir os
lookups, ele normaliza os termos e pode ignorar termos muito curtos por meio de
`avoid_short_search = True`.

Cuidados:

- busca em muitos relacionamentos pode gerar joins caros;
- relacoes de muitos valores podem produzir duplicidades;
- campos numericos podem exigir correspondencia exata;
- nunca presuma que a busca substitui um filtro estruturado.

### 2.5. `list_filter`

O `AlunoAdmin` apresenta filtros reais em `edu/admin.py:1603-1606`:

```python
list_filter = (
    CustomTabListFilter,
    'ano_letivo',
    'periodo_letivo',
    'situacao',
    'curso_campus__diretoria__setor__uo',
    'curso_campus',
    'polo',
    'curso_campus__modalidade',
)
```

Os filtros simples sao interpretados pelo Django a partir do tipo do campo. Os
caminhos com `__` filtram por models relacionados. `CustomTabListFilter` e uma
extensao do SUAP, explicada na Etapa 3.

Todo filtro recebido na URL deve ser tratado como entrada do usuario. O Admin
valida os valores e monta o `QuerySet`; ainda assim, regras de autorizacao nao
devem depender apenas da presenca ou ausencia de um filtro na interface.

### 2.6. `ordering` e `list_per_page`

Os dois atributos afetam a consulta da listagem, mas possuem responsabilidades
diferentes:

- `ordering` define a ordem inicial dos registros;
- `list_per_page` define quantos registros dessa ordem aparecem em cada pagina.

Ambos sao recursos nativos do Django. `ordering = None` esta em
`django/contrib/admin/options.py:117-132`; `list_per_page = 100` esta em
`django/contrib/admin/options.py:612-624`.

#### 2.6.1. Exemplo real do EDU

**Arquivo:** `edu/admin.py`  
**Linhas:** `1601-1613`

```python
class AlunoAdmin(ModelAdminPlus):
    # ... list_display e filtros omitidos ...
    list_per_page = 15
    ordering = ('-id',)
    form = AlunoForm
```

Na tela `/admin/edu/aluno/`, o Admin apresenta inicialmente os alunos do maior
`id` para o menor, em grupos de 15 registros.

Em termos de SQL, a primeira pagina produz uma consulta equivalente a:

```sql
SELECT ...
FROM edu_aluno
ORDER BY id DESC
LIMIT 15;
```

A segunda pagina usa um deslocamento equivalente a `LIMIT 15 OFFSET 15`. O SQL
real contem os joins, filtros e restricoes definidos pelo queryset do Admin e
pode variar conforme o banco utilizado.

#### 2.6.2. Interacao com `Meta.ordering`

O model `Aluno` possui uma ordenacao padrao diferente.

**Arquivo:** `edu/models/alunos.py`  
**Linhas:** `482-485`

```python
class Meta:
    ordering = ('pessoa_fisica__nome',)
    verbose_name = 'Aluno'
    verbose_name_plural = 'Alunos'
```

A prioridade da listagem administrativa e:

1. uma ordenacao escolhida pelo usuario ao clicar no cabecalho de uma coluna;
2. `ModelAdmin.ordering`, quando declarado;
3. `Model.Meta.ordering`, quando o Admin nao declara sua propria ordenacao.

Portanto, `AlunoAdmin.ordering = ('-id',)` substitui, nessa listagem, a ordem
alfabetica definida pelo model. Ela nao altera `Aluno.Meta` nem outras consultas
do sistema.

O Django implementa essa escolha em
`django/contrib/admin/views/main.py:311-317` e
`django/contrib/admin/views/main.py:343-388`. Depois, aplica ao queryset:

```python
ordering = self.get_ordering(request, qs)
qs = qs.order_by(*ordering)
```

Esse trecho esta em `django/contrib/admin/views/main.py:545-547`. Para manter
uma ordem deterministica entre paginas, o Django pode acrescentar a chave
primaria quando os campos escolhidos admitem empates.

#### 2.6.3. Como a paginacao e executada

`ModelAdmin.get_paginator()`, em
`django/contrib/admin/options.py:907-910`, cria o paginator com o queryset e o
valor de `list_per_page`. O `ChangeList` conta os resultados e seleciona apenas
os objetos da pagina solicitada em
`django/contrib/admin/views/main.py:274-309`.

Fluxo resumido:

```text
queryset filtrado
    -> ORDER BY definido pelo ChangeList
    -> contagem dos resultados
    -> pagina solicitada
    -> recorte de 15 registros
    -> renderizacao da tabela
```

`list_per_page` reduz a quantidade de objetos renderizados, mas nao torna uma
consulta cara automaticamente barata. Ainda podem existir:

- consulta de contagem para calcular o numero de paginas;
- uma segunda contagem do queryset sem filtros, conforme a configuracao;
- joins, filtros e ordenacoes custosos;
- consultas N+1 causadas por colunas que acessam relacionamentos;
- custo alto de `OFFSET` em paginas muito distantes.

Por isso, a escolha deve equilibrar leitura e desempenho. Diminuir de 100 para
15 registros reduz HTML e processamento por pagina, mas indices, queryset e
`select_related()` continuam relevantes.

**Demonstracao sugerida**

1. Acesse `/admin/edu/aluno/` e confirme que aparecem ate 15 registros.
2. Observe que a ordem inicial segue `-id`, e nao `Aluno.Meta.ordering`.
3. Clique em uma coluna ordenavel, como `Dados Principais`.
4. Mostre o parametro de ordenacao inserido na URL pelo Admin.
5. Avance uma pagina e mostre o parametro de pagina sem perder os filtros.

### 2.7. Formulario administrativo

Sem configuracao explicita, o Django cria um `ModelForm` a partir do model. O
admin pode alterar esse comportamento com:

| Atributo | Funcao |
|---|---|
| `fields` | Escolhe e ordena campos |
| `exclude` | Exclui campos |
| `fieldsets` | Agrupa e organiza campos |
| `readonly_fields` | Exibe valores sem permitir alteracao |
| `form` | Indica um `ModelForm` personalizado |
| `add_form` | Form especifico para inclusao no `ModelAdminPlus` |
| `change_form` | Form especifico para edicao no `ModelAdminPlus` |

Exemplo de `AlunoAdmin`, `edu/admin.py:1612-1613`:

```python
form = AlunoForm
fieldsets = AlunoForm.fieldsets
```

`AlunoForm` comeca em `edu/forms.py:215`. O admin reutiliza suas validacoes,
campos e organizacao visual. A classe `fieldsets` do form inicia em
`edu/forms.py:252`.

Exemplo de `fieldsets` declarado diretamente no admin, em
`edu/admin.py:259-263`:

```python
fieldsets = (
    ('Dados Gerais', {'fields': ('tipo',)}),
    ('Dados do Ato', {
        'fields': (('tipo_ato', 'numero_ato', 'data_ato'),)
    }),
)
```

Uma string representa uma linha com um campo. Uma tupla interna agrupa varios
campos na mesma linha visual.

### 2.8. `list_display_links`

`list_display_links` escolhe quais colunas de `list_display` funcionam como
links para a tela de alteracao do registro.

**Origem:** recurso nativo do Django.  
**Declaracao padrao:** `django/contrib/admin/options.py:615-618`.  
**Escolha da coluna:** `django/contrib/admin/options.py:1065-1079`.  
**Aplicacao na listagem:** `django/contrib/admin/options.py:822-839`.

Exemplo real do SUAP:

**Arquivo:** `comum/admin.py`  
**Linhas:** `1613-1619`

```python
class ContatoEmergenciaAdmin(ModelAdminPlus):
    list_display = ('pessoa_fisica', 'nome_contato', 'telefone')
    list_display_links = ('nome_contato',)
    search_fields = ('pessoa_fisica__nome', 'nome_contato', 'telefone')
    ordering = ('pessoa_fisica__nome', 'nome_contato', 'telefone')
    fields = ('nome_contato', 'telefone')
    form = ContatoEmergenciaForm
```

Na tela `/admin/comum/contatoemergencia/`, as tres informacoes aparecem como
colunas, mas somente `nome_contato` e o link textual para a edicao.

Regras importantes:

- os nomes devem pertencer a `list_display`;
- sem configuracao explicita, o Django usa a primeira coluna apropriada como
  link;
- `list_display_links = None` remove os links textuais de edicao;
- uma mesma coluna nao pode estar em `list_display_links` e `list_editable`.

No `ModelAdminPlus`, os icones de visualizacao, edicao e exclusao tambem podem
ser controlados por `list_display_icons`. Esse recurso adicional nao elimina a
funcao nativa de `list_display_links`.

### 2.9. `list_select_related`

`list_select_related` e uma configuracao de desempenho. Ela pede ao ORM que
traga relacionamentos `ForeignKey` e `OneToOneField` na mesma consulta SQL da
listagem, evitando uma nova consulta para cada linha apresentada.

**Origem:** recurso nativo do Django.  
**Declaracao padrao:** `django/contrib/admin/options.py:618`.  
**Implementacao:** `django/contrib/admin/views/main.py:554-564`.

Valores aceitos:

```python
# O Django decide se deve aplicar select_related ao analisar list_display.
list_select_related = False

# Segue todos os relacionamentos adequados encontrados pelo ORM.
list_select_related = True

# Segue somente os caminhos informados.
list_select_related = ('pessoa_fisica', 'situacao')
```

O codigo nativo executa, conforme o valor, `qs.select_related()` ou
`qs.select_related(*self.list_select_related)`.

Nao ha declaracao explicita de `list_select_related` nos admins atuais do EDU.
O modulo aplica o mesmo recurso diretamente em `get_queryset()`, pois nesse
ponto tambem consegue escolher o manager e acrescentar outras restricoes.

Exemplo real:

**Arquivo:** `edu/admin.py`  
**Linhas:** `1625-1626`

```python
def get_queryset(self, request):
    return super().get_queryset(request, Aluno.locals).exclude(
        turmaminicurso__gerar_matricula=False
    ).select_related('ano_letivo', 'pessoa_fisica', 'situacao')
```

Quando a listagem usa `obj.pessoa_fisica.nome`, `obj.ano_letivo` ou
`obj.situacao`, esses objetos ja foram carregados. Sem a antecipacao, a pagina
pode produzir o problema N+1: uma consulta para os alunos e varias consultas
adicionais para seus relacionamentos.

Nesse exemplo, `Aluno.locals` tambem limita o conjunto conforme o escopo local
do usuario, e `exclude()` retira determinados alunos de minicurso. Por isso, o
metodo completo nao deve ser substituido apenas pelo atributo abaixo.

Para um admin simples, a alternativa declarativa seria:

```python
class AlunoAdmin(ModelAdminPlus):
    list_select_related = ('ano_letivo', 'pessoa_fisica', 'situacao')
```

Essa forma nao substitui o `get_queryset()` quando ele contem escolha de
manager, filtros de escopo ou outras regras. Para `ManyToManyField` e relacoes
reversas, o recurso adequado costuma ser `prefetch_related()`, nao
`list_select_related`.

### 2.10. `date_hierarchy`

`date_hierarchy` adiciona, acima da listagem, uma navegacao temporal por ano,
mes e dia. O valor deve ser o nome de um `DateField` ou `DateTimeField` do
model. O recurso apenas filtra a listagem; ele nao altera as datas gravadas.

**Origem:** recurso nativo do Django.  
**Declaracao padrao:** `django/contrib/admin/options.py:624`.  
**Envio ao `ChangeList`:** `django/contrib/admin/options.py:822-845`.

Exemplo real do EDU:

**Arquivo:** `edu/admin.py`  
**Linhas:** `2369-2383`

```python
class HistoricoImportacaoAdmin(ModelAdminPlus):
    list_display = (
        'id', 'data', 'total_alunos_criados', 'total_alunos_atualizados',
        'total_matriculas_periodo_criadas',
        'total_matriculas_periodo_atualizadas',
    )
    list_display_icons = True
    list_per_page = 15
    form = HistoricoImportacaoForm
    date_hierarchy = 'data'
    export_to_xls = True
```

**Para acompanhar:** acesse `/admin/edu/historicoimportacao/` e utilize os
atalhos de ano, mes e dia exibidos acima da tabela. Outro exemplo esta em
`edu/admin.py:2398-2405`: `MaterialAulaAdmin` usa
`date_hierarchy = 'data_cadastro'`.

Em tabelas grandes, vale conferir os indices do campo e o custo das consultas
por periodo. `date_hierarchy` melhora a navegacao, mas nao substitui a analise
de desempenho do banco.

### 2.11. `list_editable`

`list_editable` transforma determinadas colunas em campos de formulario dentro
da propria listagem. O usuario altera uma ou mais linhas e envia todas pelo
botao de salvamento da pagina.

**Origem:** recurso nativo do Django.  
**Declaracao padrao:** `django/contrib/admin/options.py:621`.  
**Processamento:** `ModelAdmin.changelist_view()` em
`django/contrib/admin/options.py:2002-2045` cria, valida e salva um formset com os
registros modificados.

O EDU nao possui atualmente um uso explicito desse atributo. Um exemplo real
e simples do SUAP esta no cadastro de paises:

**Admin:** `comum/admin.py:219-225`  
**Model:** `comum/models.py:1370-1381`

```python
class PaisAdmin(ModelAdminPlus):
    list_display = ('nome', 'codigo', 'codigo_censup', 'excluido')
    ordering = ('excluido', 'nome', 'codigo', 'codigo_censup')
    list_filter = [CustomTabListFilter, 'excluido', 'codigo_censup']
    list_editable = ['codigo_censup']
    search_fields = ('nome', 'codigo')
```

Na tela `/admin/comum/pais/`, `codigo_censup` pode ser alterado sem abrir cada
registro. O campo esta simultaneamente em `list_display`, para existir como
coluna, e em `list_editable`, para receber um controle editavel.

Regras importantes:

- o campo precisa estar em `list_display`;
- o campo nao pode estar tambem em `list_display_links`;
- o campo do model precisa permitir edicao;
- todas as linhas enviadas passam por validacao antes do salvamento;
- a edicao em massa merece teste cuidadoso, pois modifica dados reais.

Use esse recurso para alteracoes simples e independentes. Quando a mudanca
exigir confirmacoes, efeitos em outros objetos ou uma sequencia de negocio,
prefira um formulario ou uma action especifica.

### 2.12. Diferenca entre inclusao e edicao: `add_form`, `change_form` e `add_fieldsets`

Incluir e editar usam a mesma infraestrutura do Django Admin, mas representam
estados diferentes:

| Inclusao | Edicao |
|---|---|
| URL termina em `/add/` | URL termina em `/<pk>/change/` |
| ainda nao existe objeto salvo | o objeto e carregado do banco |
| `get_form(request, obj=None)` | `get_form(request, obj=objeto)` |
| form recebe uma instancia nova | form recebe `instance=objeto` |
| exige permissao `add` | exige permissao `change` |
| `change=False` nos hooks de salvamento | `change=True` nos hooks |
| termina em `response_add()` | termina em `response_change()` |

No momento em que `get_form()` e chamado, o criterio principal e `obj`:

```text
obj is None     -> tela de inclusao
obj possui pk   -> tela de edicao
```

#### 2.12.1. O que pertence ao Django e o que pertence ao SUAP

O `ModelAdmin` nativo possui `form`, `fieldsets`, `get_form()` e
`get_fieldsets()`. Por padrao, `form` atende tanto a inclusao quanto a edicao.

O comportamento generico de escolher automaticamente `add_form`,
`change_form` e `add_fieldsets` e uma extensao do `ModelAdminPlus`, declarada
em `djtools/contrib/admin/options/__init__.py:143-146`:

```python
add_form = None
change_form = None
add_fieldsets = None
```

Esses atributos permitem separar os dois fluxos sem sobrescrever integralmente
`add_view()`, `change_view()` ou `get_form()`.

> O `UserAdmin` do proprio Django tambem usa nomes como `add_form` e
> `add_fieldsets`, mas isso e uma customizacao daquela classe. No SUAP, o
> `ModelAdminPlus` oferece esse comportamento de forma generica aos admins que
> herdam dele.

#### 2.12.2. Como `ModelAdminPlus.get_form()` escolhe a classe

A implementacao esta em
`djtools/contrib/admin/options/__init__.py:392-409`:

```python
def get_form(self, request, obj=None, **kwargs):
    defaults = {}

    if obj is None and self.add_form:
        defaults['form'] = self.add_form

    if obj and self.change_form:
        defaults['form'] = self.change_form

    defaults.update(kwargs)
    FormClass = super().get_form(request, obj, **defaults)
    FormClass.request = request
    return FormClass
```

Ordem de escolha:

| Operacao | Primeira opcao | Fallback |
|---|---|---|
| inclusao | `add_form`, quando definido | `form` do Admin |
| edicao | `change_form`, quando definido | `form` do Admin |
| nenhuma classe personalizada | `form` padrao | `ModelForm` gerado pelo Django |

Depois da escolha, `super().get_form()` preserva a construcao nativa do
`ModelForm`. Por fim, o DJTools torna `request` disponivel na classe escolhida,
permitindo que o form consulte usuario, grupos e parametros da requisicao.

#### 2.12.3. Funcao de cada atributo

**`form`**

E a classe principal do formulario administrativo. Funciona nos dois fluxos e
serve como fallback quando nao ha uma classe mais especifica.

```python
form = DemandaChangeForm
```

**`add_form`**

Seleciona um `ModelForm` apenas quando `obj is None`. E apropriado quando a
criacao deve:

- expor menos campos;
- solicitar confirmacao ou dados iniciais;
- preencher estado, autor ou setor automaticamente;
- possuir validacoes diferentes da edicao.

```python
add_form = DemandaAddForm
```

**`change_form`**

Seleciona um `ModelForm` apenas quando ja existe um objeto. E apropriado para
proteger campos imutaveis depois da criacao ou oferecer operacoes exclusivas
do registro salvo.

```python
change_form = ProcessoEditarForm
```

**`add_fieldsets`**

Define os grupos e a ordem dos campos somente na inclusao. Ele nao e uma
classe de formulario e nao possui `clean()` nem `save()`:

```python
add_fieldsets = (
    ('Dados Gerais', {'fields': ('area', 'titulo', 'descricao')}),
)
```

O `ModelAdminPlus.get_fieldsets()`, em
`djtools/contrib/admin/options/__init__.py:387-390`, faz a selecao:

```python
def get_fieldsets(self, request, obj=None):
    if not obj and self.add_fieldsets:
        return self.add_fieldsets
    return super().get_fieldsets(request, obj)
```

Na edicao, o fluxo volta para `fieldsets`, `fields` ou para os campos inferidos
pelo Django.

#### 2.12.4. Formulario e fieldset nao sao a mesma coisa

```text
add_form/change_form -> campos, widgets, validacao, cleaned_data e save()
add_fieldsets         -> grupos, ordem e campos apresentados na inclusao
fieldsets             -> grupos, ordem e campos apresentados na edicao/fallback
```

As duas configuracoes precisam ser compativeis. Um nome presente em
`add_fieldsets` deve existir no model ou no `add_form`; caso contrario, o
Django pode gerar `FieldError`. Um campo existente no form, mas ausente do
fieldset selecionado, nao sera apresentado nessa tela administrativa.

`fieldsets` ajuda a limitar a superficie do form criado pelo Admin, mas nao
deve ser usado isoladamente como regra de seguranca. Permissoes, campos do
`ModelForm`, `readonly_fields` e validacoes de backend continuam necessarios.

#### 2.12.5. Exemplo completo: `DemandaAdmin`

O exemplo real esta em `demandas/admin.py:228-265`:

```python
class DemandaAdmin(ModelAdminPlus, CompareVersionAdminPlus):
    add_form = DemandaAddForm
    form = DemandaChangeForm

    fieldsets = (
        ('Dados Gerais', {
            'fields': (
                'area', 'tipo', 'titulo', 'descricao', 'prazo_legal',
                'tags', 'privada', 'consolidacao_sempre_visivel',
                'dependencia',
            )
        }),
        ('Interessados', {
            'fields': ('demandantes', 'interessados', 'observadores')
        }),
        ('Atendimento', {
            'fields': ('analistas', 'desenvolvedores')
        }),
        ('Dados de Homologacao', {
            'fields': (
                'ambiente_homologacao', 'id_repositorio',
                'url_validacao', 'senha_homologacao',
            )
        }),
        ('Dados de Implantacao', {'fields': ('id_merge_request',)}),
    )

    add_fieldsets = (
        ('Dados Gerais', {
            'fields': ('area', 'titulo', 'descricao', 'privada', 'dependencia')
        }),
        ('Interessados', {
            'fields': ('demandantes', 'interessados', 'observadores')
        }),
    )
```

Na inclusao:

```text
GET /admin/demandas/demanda/add/
  -> obj=None
  -> get_form() escolhe DemandaAddForm
  -> get_fieldsets() escolhe add_fieldsets
  -> tela mostra apenas Dados Gerais e Interessados
```

`DemandaAddForm`, em `demandas/forms.py:204-251`, limita os campos de criacao,
restringe as areas conforme `self.request.user` e pode remover
`consolidacao_sempre_visivel` para quem nao e analista.

Na edicao:

```text
GET /admin/demandas/demanda/<pk>/change/
  -> obj=demanda existente
  -> change_form nao foi definido
  -> get_form() usa o fallback form = DemandaChangeForm
  -> get_fieldsets() usa fieldsets completo
  -> tela inclui Atendimento, Homologacao e Implantacao
```

`DemandaChangeForm`, iniciado em `demandas/forms.py:254`, acrescenta campos
operacionais, como `analistas` e `desenvolvedores`, que so fazem sentido depois
que a demanda existe.

Esse exemplo usa `form` como formulario de edicao. Ele poderia declarar
`change_form = DemandaChangeForm`; o resultado da selecao seria equivalente,
mas `form` continua sendo um fallback explicito para outros contextos do Admin.

#### 2.12.6. Exemplo explicito de `change_form`: `ProcessoAdmin`

`ProcessoAdmin`, em `processo_eletronico/admin.py:223-225`, declara:

```python
form = ProcessoForm
change_form = ProcessoEditarForm
```

O resultado e:

```text
Inclusao, obj=None
  -> nao ha add_form
  -> usa form = ProcessoForm

Edicao, obj existente
  -> ha change_form
  -> usa ProcessoEditarForm
```

`ProcessoForm`, em `processo_eletronico/forms.py:173-258`, possui os dados
necessarios para criar o processo, incluindo interessados, assunto, nivel de
acesso e hipotese legal. `ProcessoEditarForm`, nas linhas `261-307`, reduz seu
`Meta.fields` a `tipo_processo` e `setor_criacao` e especializa a validacao da
edicao. A tela final ainda combina essa classe com `get_fieldsets()` e
`get_readonly_fields()` de `ProcessoAdmin`, em
`processo_eletronico/admin.py:241-265`. Portanto, a classe escolhida e o layout
administrativo devem ser analisados em conjunto.

Esse e o principal motivo para formularios separados: um campo necessario na
criacao pode se tornar imutavel ou exigir outro procedimento depois que o
objeto passa a existir.

#### 2.12.7. Ciclo completo dos dois fluxos

```text
INCLUSAO
/add/
  -> has_add_permission()
  -> add_view()
  -> get_form(request, obj=None)
  -> add_form ou form
  -> get_fieldsets(request, obj=None)
  -> add_fieldsets ou fieldsets inferidos
  -> form.is_valid()
  -> save_model(..., change=False)
  -> save_related(..., change=False)
  -> response_add()

EDICAO
/<pk>/change/
  -> get_object() dentro do queryset permitido
  -> has_change_permission(request, obj)
  -> change_view()
  -> get_form(request, obj)
  -> change_form ou form
  -> get_fieldsets(request, obj)
  -> fieldsets ou campos inferidos
  -> form.is_valid()
  -> save_model(..., change=True)
  -> save_related(..., change=True)
  -> response_change()
```

Tanto `add_view()` quanto `change_view()` do `ModelAdminPlus` executam em
`transaction.atomic`, em
`djtools/contrib/admin/options/__init__.py:411-439`. Isso mantem o salvamento do
objeto principal e das relacoes no mesmo limite transacional do fluxo.

#### 2.12.8. Como acompanhar o fluxo

1. Abra `demandas/admin.py:228-265` e identifique `add_form`, `form`,
   `add_fieldsets` e `fieldsets`.
2. Acesse `/admin/demandas/demanda/add/` sem salvar e anote as secoes
   apresentadas.
3. Abra uma demanda existente em
   `/admin/demandas/demanda/<pk>/change/` e compare as secoes adicionais.
4. Coloque um breakpoint em
   `djtools/contrib/admin/options/__init__.py:398-406`.
5. Na inclusao, confirme `obj is None` e
   `FormClass.__name__ == 'DemandaAddForm'`.
6. Na edicao, confirme que existe `obj` e que o fallback selecionado e
   `DemandaChangeForm`.
7. Abra `ProcessoAdmin` para comparar um caso que declara explicitamente
   `change_form`.

Erros comuns:

- colocar validacao dentro de `add_fieldsets`, que apenas descreve layout;
- declarar `add_form` e esperar que ele seja usado na edicao;
- declarar `change_form` e esquecer o formulario de inclusao;
- listar no fieldset um campo ausente do form;
- usar somente a ausencia visual de um campo como protecao;
- sobrescrever `get_form()` sem chamar `super()` e perder a selecao feita pelo
  `ModelAdminPlus`.

### 2.13. Admin x formulario personalizado

Os dois podem usar `ModelForm` e alterar o mesmo model, mas distribuem as
responsabilidades de maneiras diferentes. O cadastro de aluno oferece dois
fluxos reais para comparar.

| Admin | View personalizada |
|---|---|
| URLs geradas pelo `AdminSite` | URL declarada pela aplicacao |
| Templates administrativos padrao | Template escolhido pela view |
| Permissoes de model integradas | View deve declarar sua autorizacao |
| `ModelAdmin` coordena o fluxo | Funcao ou classe de view coordena o fluxo |
| Bom para CRUD interno | Bom para processo de negocio especifico |
| Actions, filtros e inlines prontos | Interface totalmente controlada |

#### 2.13.1. Fluxo real A: `AlunoAdmin` com `AlunoForm`

**Objetivo:** oferecer o CRUD administrativo amplo do aluno.  
**Listagem:** `/admin/edu/aluno/`  
**Edicao:** `/admin/edu/aluno/<pk>/change/`

Nao existe uma entrada correspondente em `edu/urls.py`. A URL e gerada porque
o model foi registrado no `AdminSite`.

**Admin:** `edu/admin.py:1601-1626`  
**Registro:** `edu/admin.py:1870`

```python
class AlunoAdmin(ModelAdminPlus):
    # ... configuracoes da listagem omitidas ...
    form = AlunoForm
    fieldsets = AlunoForm.fieldsets

    def get_queryset(self, request):
        return super().get_queryset(request, Aluno.locals).exclude(
            turmaminicurso__gerar_matricula=False
        ).select_related('ano_letivo', 'pessoa_fisica', 'situacao')


admin.site.register(Aluno, AlunoAdmin)
```

`form` escolhe a classe que valida e salva. `fieldsets` reutiliza a organizacao
visual declarada no proprio formulario. `get_queryset()` delimita quais alunos
podem participar da tela e antecipa relacionamentos usados na listagem.

**Form:** `edu/forms.py:215-314`

```python
class AlunoForm(forms.ModelFormPlus):
    # Campos complementares e fieldsets omitidos neste recorte.

    class Meta:
        model = Aluno
        exclude = ()

    def save(self, *args, **kwargs):
        self.instance.pessoa_fisica.nome_registro = self.cleaned_data['nome']
        # ... demais dados da pessoa fisica ...
        self.instance.pessoa_fisica.save()
        return super().save(*args, **kwargs)
```

O `save()` personalizado e importante: alguns campos apresentados pelo form
pertencem a `PessoaFisica`, embora a instancia principal seja `Aluno`.

Fluxo da requisicao:

```text
GET /admin/edu/aluno/<pk>/change/
    -> AdminSite encontra AlunoAdmin
    -> AlunoAdmin.change_view() verifica acesso e carrega o objeto
    -> get_form() seleciona AlunoForm
    -> template administrativo exibe o formulario

POST /admin/edu/aluno/<pk>/change/
    -> AlunoForm recebe POST e FILES com instance=aluno
    -> validacao do formulario
    -> AlunoForm.save()
    -> salvamento e registro administrativo da alteracao
    -> resposta definida pelo fluxo do Admin
```

O `ModelAdminPlus` ainda envolve `change_view()` em transacao e acrescenta
breadcrumbs, titulo e request ao form em
`djtools/contrib/admin/options/__init__.py:392-439`.

#### 2.13.2. Fluxo real B: view personalizada para editar o RG

**Objetivo:** alterar somente tres dados do RG do aluno em uma tela orientada a
essa tarefa.  
**URL:** `/edu/editar_rg_aluno/<pk>/`

**Rota:** `edu/urls.py:580-582`

```python
path(
    'editar_rg_aluno/<int:pk>/',
    views.editar_rg_aluno,
),
```

Aqui a aplicacao declara explicitamente o endereco e a view. Nao ha
`AdminSite` nem `ModelAdmin` no encaminhamento.

**View:** `edu/views.py:15306-15333`

```python
@permission_required('edu.change_aluno')
@rtr('editar_rg_aluno.html')
def editar_rg_aluno(request, pk):
    title = 'Editar Documento RG'
    aluno = get_object_or_404(
        Aluno.locals.select_related('curso_campus'),
        pk=pk,
    )

    if not perms.tem_permissao_realizar_procedimentos(request.user, aluno):
        raise PermissionDenied()

    form = EditarRgAlunoForm(
        data=request.POST or None,
        instance=aluno,
    )

    if request.method == 'POST' and form.is_valid():
        form.save()
        return httprr(
            f'/edu/aluno/{aluno.matricula}/?tab=dados_pessoais',
            'Dados do RG atualizados com sucesso.',
        )

    return locals()
```

A view torna explicitas as decisoes que o Admin normalmente coordena:

- exige `edu.change_aluno` no decorador;
- busca pelo manager contextual `Aluno.locals`;
- aplica uma autorizacao relacionada ao aluno encontrado;
- diferencia GET de POST;
- fornece `instance=aluno` para editar, em vez de criar;
- chama `is_valid()` e `save()`;
- escolhe a mensagem e o destino apos o sucesso.

**Form:** `edu/forms.py:14817-14843`

```python
class EditarRgAlunoForm(forms.ModelFormPlus):
    SUBMIT_LABEL = 'Salvar'

    class Meta:
        model = Aluno
        fields = ('numero_rg', 'uf_emissao_rg', 'orgao_emissao_rg')

    def clean_numero_rg(self):
        numero_rg = self.cleaned_data.get('numero_rg')
        return numero_rg.strip() if numero_rg else None
```

Ao usar `fields`, o formulario limita deliberadamente a superficie de edicao.
`clean_numero_rg()` normaliza o valor antes do salvamento.

**Template:** `edu/templates/editar_rg_aluno.html:1-20`

```django
{% extends super_template %}
{% block content %}
    {% box 'Aluno' %}
        <!-- Identificacao resumida do aluno. -->
    {% endbox %}

    {% box 'Documento RG' %}
        {% render_form form %}
    {% endbox %}
{% endblock %}
```

O template decide o contexto visual da tarefa e usa `{% render_form form %}`
para renderizar o `ModelFormPlus`.

#### 2.13.3. O que a comparacao ensina

```text
Admin:
model + ModelAdmin + ModelForm -> CRUD padronizado e abrangente

View personalizada:
URL + view + ModelForm + template -> tarefa delimitada e fluxo explicito
```

O primeiro fluxo e adequado para manutencao interna ampla. O segundo reduz os
campos, aplica uma regra contextual e devolve o usuario para a aba correta do
aluno. Nao duplique no Admin uma operacao complexa que ja possui view segura e
bem testada; quando fizer sentido, o Admin pode apenas oferecer um link para a
view especializada.

<a id="etapa-3"></a>

## Etapa 3 — Recursos do SUAP

### 3.1. `ModelAdmin` x `ModelAdminPlus`

`ModelAdmin` pertence ao Django. `ModelAdminPlus` pertence ao DJTools/SUAP e
especializa o Admin nativo. Ele nao recria o CRUD: herda sua base e acrescenta
convencoes usadas pelo SUAP.

Forma resumida:

```text
ModelAdminPlus
    = ModelAdmin do Django
    + metaclasse de customizacao LPS
    + templates administrativos do DJTools
    + campos de data/hora padronizados
    + ChangeListPlus
    + request disponivel no admin e no form
    + icones, tabs, exportacao e action bar
```

**Arquivo:** `djtools/contrib/admin/options/__init__.py`  
**Linhas:** `87-146`

```python
class ModelAdminPlus(admin.ModelAdmin, metaclass=MetaModelAdminPlus):
    change_list_template = 'djtools/templates/adminutils/change_list.html'
    change_form_template = 'djtools/templates/adminutils/change_form.html'
    formfield_overrides = FORMFIELD_OVERRIDES

    list_display_icons = False
    show_count_on_tabs = False
    export_to_xls = False
    list_xls_display = None
    preserve_filters = True
    avoid_short_search = True
    filters_ajax = True

    add_form = None
    change_form = None
    add_fieldsets = None
```

#### 3.1.1. Heranca: a base continua sendo o Django

A declaracao possui duas informacoes diferentes:

```python
class ModelAdminPlus(admin.ModelAdmin, metaclass=MetaModelAdminPlus):
```

- `admin.ModelAdmin` e a **classe-base**: fornece URLs, listagem, forms,
  permissoes, inclusao, alteracao, exclusao, actions e historico;
- `MetaModelAdminPlus` e a **metaclasse**: participa da criacao da propria
  classe e permite aplicar customizacoes LPS.

Nao confunda metaclasse com `class Meta`. A metaclasse controla como uma classe
Python e construida; uma `class Meta` interna apenas fornece opcoes para APIs
como models e forms.

No Django 4.1.5, `BaseModelAdmin` usa a metaclasse
`forms.MediaDefiningClass`, em
`django/contrib/admin/options.py:117-132`. `MetaModelAdminPlus` herda dessa
mesma metaclasse, mantendo o mecanismo que combina arquivos CSS e JavaScript
declarados pelas classes e formularios.

Consequencia pratica: tudo que funciona em `ModelAdmin`, como `list_display`,
`search_fields`, `list_filter`, `ordering` e `readonly_fields`, continua
disponivel. O desenvolvedor so precisa sobrescrever um metodo quando a
configuracao declarativa nao for suficiente.

#### 3.1.2. `MetaModelAdminPlus` e LPS

LPS significa **Linha de Produto de Software**. E um mecanismo proprio do SUAP
para permitir variacoes de uma instalacao sem copiar integralmente o arquivo
principal.

**Implementacao:** `djtools/lps.py:14-18`, `djtools/lps.py:44-64` e
`djtools/lps.py:112-117`  
**Configuracao padrao:** `suap/settings_base.py:738`

```python
LPS = ''
```

Com o valor vazio, nao ha variante ativa. Quando `settings.LPS` possui um nome,
a metaclasse executa este fluxo durante a criacao de cada classe de admin:

```text
classe encontrada em <app>/admin.py
    -> verifica settings.LPS e INSTALLED_APPS
    -> procura <app>/lps/<LPS>/admin.py
    -> procura nesse modulo uma classe com o mesmo nome
    -> copia seus atributos para a classe principal
    -> conclui a criacao da classe
```

Trecho essencial de `djtools/lps.py:44-64`:

```python
class MetaModelAdminPlus(forms.MediaDefiningClass):
    def __new__(mcs, name, bases, attrs):
        if is_lps(attrs):
            app = '.'.join(attrs['__module__'].split('.')[:-1])
            module = __import__(
                f'{app}.lps.{settings.LPS}.admin',
                fromlist=['admin'],
            )
            if hasattr(module, name):
                custom_class = getattr(module, name)
                set_attrs_klass(attrs, custom_class.__dict__.items())

        return super().__new__(mcs, name, bases, attrs)
```

O recorte foi reorganizado para leitura; o codigo real envolve a importacao em
`try/except`. `set_attrs_klass()` copia os atributos, exceto metadados internos
como `__module__` e `__dict__`. Como a implementacao real captura
`Exception` e segue sem propagar o erro, a ausencia da customizacao nao impede
a inicializacao; durante uma depuracao, porem, tambem e necessario verificar se
houve erro de importacao dentro do arquivo LPS.

Exemplo real disponivel no projeto:

**Arquivo:** `rh/lps/demo_lps/admin.py`  
**Linhas:** `11-25`

```python
class ServidorAdmin:
    list_filter = get_uo_setor_listfilter() + (
        'excluido',
        'cargo_emprego_area',
    )


class CargoEmpregoAdmin:
    readonly_fields = []
    form = CargoEmpregoForm
```

Se `settings.LPS = 'demo_lps'`, esses atributos sao copiados para as classes de
mesmo nome criadas pelo admin principal de RH. Os demais atributos e metodos
permanecem os originais.

Ao investigar uma diferenca entre instalacoes, verifique sempre:

1. o valor de `settings.LPS`;
2. se existe `<app>/lps/<LPS>/admin.py`;
3. se ha nele uma classe com o mesmo nome do admin investigado.

#### 3.1.3. Templates administrativos

O `ModelAdminPlus` substitui os nomes dos templates usados pelo Django:

```python
change_list_template = 'djtools/templates/adminutils/change_list.html'
change_form_template = 'djtools/templates/adminutils/change_form.html'
```

As declaracoes estao em
`djtools/contrib/admin/options/__init__.py:119-122`. Esses arquivos nao
descartam o Admin nativo; eles o estendem:

- `djtools/templates/adminutils/change_list.html:1-100` estende
  `admin/change_list.html` e acrescenta comportamento para filtros, tabs,
  actions e atualizacao por AJAX;
- `djtools/templates/adminutils/change_form.html:1-36` estende
  `admin/change_form.html`, inclui o JavaScript de formsets e adapta action bar,
  botoes e modo somente leitura.

Assim, a logica principal ainda vem do Django, enquanto o DJTools altera a
apresentacao e os pontos de interacao usados pelo SUAP.

#### 3.1.4. `formfield_overrides`

`formfield_overrides` e um atributo nativo de `ModelAdmin`; no Django, seu
valor padrao e `{}` em `django/contrib/admin/options.py:117-132`. Ele permite
trocar o campo de formulario e o widget gerados para um tipo de campo do model.

O DJTools define o mapeamento em
`djtools/contrib/admin/options/__init__.py:52-56`:

```python
FORMFIELD_OVERRIDES = {
    models.DateTimeField: {
        'form_class': DateTimeFieldPlus,
        'widget': RegionalDateTimeWidget,
    },
    models.DateField: {
        'form_class': DateFieldPlus,
        'widget': RegionalDateWidget,
    },
    models.TimeField: {
        'form_class': TimeFieldPlus,
        'widget': RegionalTimeWidget,
    },
}
```

`ModelAdminPlus.formfield_overrides = FORMFIELD_OVERRIDES`, na linha `122`, faz
com que forms gerados pelo Admin usem os campos e widgets regionais do SUAP.
Por exemplo, `DateFieldPlus`, implementado em
`djtools/forms/fields/__init__.py:204-219`, aceita os formatos previstos pelo
projeto e rejeita anos anteriores a 1900. Os widgets estao em
`djtools/forms/widgets/__init__.py:76-106`.

Essa configuracao funciona como padrao. Um form personalizado ainda pode
declarar explicitamente outro campo ou widget para uma necessidade especifica.

#### 3.1.5. Ciclo de inicializacao

O Admin passa por duas fases que nao devem ser confundidas.

**Fase 1 - inicializacao da aplicacao**

1. Django importa `edu/admin.py`.
2. Python encontra `class AlunoAdmin(ModelAdminPlus)`.
3. `MetaModelAdminPlus.__new__()` verifica uma possivel customizacao LPS.
4. `admin.site.register(Aluno, AlunoAdmin)` registra a associacao.
5. `AdminSite.register()` instancia `AlunoAdmin(Aluno, admin.site)` e guarda a
   instancia em `_registry`.

O passo 5 esta na implementacao nativa
`django/contrib/admin/sites.py:136-149`. O construtor de `ModelAdmin`, em
`django/contrib/admin/options.py:649-653`, armazena `model`, `model._meta` e
`admin_site`.

Depois, `ModelAdminPlus.__init__()`, em
`djtools/contrib/admin/options/__init__.py:189-192`, chama o construtor do
Django e, quando o admin nao declarou `search_fields`, procura um campo de
busca padrao no model.

**Fase 2 - atendimento de cada requisicao**

```text
URL do Admin
    -> AdminSite localiza a instancia registrada
    -> ModelAdminPlus recebe a requisicao
    -> escolhe ChangeListPlus ou form de inclusao/edicao
    -> aplica queryset, permissoes e validacao
    -> renderiza o template do DJTools
    -> devolve HttpResponse
```

Na listagem, `get_changelist()`, em
`djtools/contrib/admin/options/__init__.py:200-206`, salva o request em
`self.request` e devolve `ChangeListPlus`. Essa classe herda do `ChangeList` do
Django e customiza buscas e filtros em
`djtools/contrib/admin/views/__init__.py:19-125`.

Na inclusao ou edicao, `get_form()`, em
`djtools/contrib/admin/options/__init__.py:392-409`, escolhe `add_form` ou
`change_form`, chama a implementacao nativa e disponibiliza o request na classe
do formulario. `add_view()` e `change_view()`, nas linhas `411-439`, tambem
acrescentam breadcrumbs e executam dentro de `transaction.atomic`.

Comparacao resumida:

| Recurso | `ModelAdmin` | `ModelAdminPlus` |
|---|---|---|
| CRUD administrativo | Sim | Sim, por heranca |
| `list_display`, filtros e busca | Sim | Sim, por heranca |
| Forms e inlines | Sim | Sim, com integracoes adicionais |
| Templates de listagem do SUAP | Nao | Sim |
| Icones de visualizar/editar | Nao | `list_display_icons` |
| Tabs padronizadas | Nao | `get_tabs()` e `CustomTabListFilter` |
| Exportacao XLS integrada | Nao | `export_to_xls` |
| Action bar do SUAP | Nao | `get_action_bar()` |
| Customizacao por LPS | Nao | `MetaModelAdminPlus` |
| Confirmacao de exclusao por senha | Nao | Implementada em `delete_view()` |

### 3.2. Icones da listagem

`list_display_icons` e um recurso do `ModelAdminPlus`, nao do `ModelAdmin`
nativo. Ele troca o uso de uma coluna textual como link por uma primeira
coluna de acoes, identificada pelo cabecalho `#`.

Exemplo real em `AlunoAdmin`, `edu/admin.py:1601-1608`:

```python
class AlunoAdmin(ModelAdminPlus):
    list_display = (
        'get_foto',
        'get_info_principal',
        'periodo_letivo',
        'ano_letivo',
        'get_pasta',
    )
    list_display_icons = True
```

Ao abrir `/admin/edu/aluno/`, o resultado conceitual e:

```text
+---+------+----------------------+---------+-----+
| # | Foto | Informacoes do aluno | Periodo | Ano |
+---+------+----------------------+---------+-----+
| ver/editar | ... | ...              | ...     | ... |
+---+------+----------------------+---------+-----+
```

Os simbolos acima representam os links de visualizar e editar; os icones reais
sao renderizados pelo conjunto visual do DJTools.

#### 3.2.1. Como a coluna e acrescentada

`ModelAdminPlus.get_list_display()`, em
`djtools/contrib/admin/options/__init__.py:208-220`, nao modifica a tupla
declarada permanentemente. Ele produz a lista efetiva para a requisicao:

```python
def get_list_display(self, request):
    list_display = tuple(self.list_display[:])
    if self.list_display_icons:
        if (
            request.user.has_perm(view_permission)
            or request.user.has_perm(change_permission)
        ):
            list_display = ('show_list_display_icons',) + list_display
        else:
            self.list_display_links = None
    return list_display
```

Assim, `show_list_display_icons` passa a ser a primeira coluna somente quando
o usuario possui permissao de visualizacao ou alteracao do model.

#### 3.2.2. O que faz `show_list_display_icons()`

A implementacao completa esta em
`djtools/contrib/admin/options/__init__.py:163-187`. Para cada objeto da
pagina, o metodo:

1. identifica a tab atual, quando houver;
2. verifica `has_change_permission(request, obj)`;
3. adiciona o icone de visualizacao e o de edicao quando pode alterar;
4. quando nao pode alterar, verifica `has_view_permission(request, obj)` e
   adiciona apenas a visualizacao;
5. junta os links em HTML seguro.

Trecho central:

```python
if self.has_change_permission(self.request, obj):
    icons_html.append(view_object_icon(obj, view_object_url_complement))
    icons_html.append(edit_object_icon(obj))
elif self.has_view_permission(self.request, obj):
    icons_html.append(view_object_icon(obj, view_object_url_complement))
```

Os helpers estao em `djtools/templatetags/tags/utils.py:123-160`:

- `view_object_icon()` usa `obj.get_absolute_url()` quando disponivel; caso
  contrario, usa a visualizacao administrativa criada pelo DJTools;
- `edit_object_icon()` monta a URL administrativa de alteracao.

Como `self.request` e necessario, `ModelAdminPlus.get_changelist()` o armazena
antes de montar as colunas, em
`djtools/contrib/admin/options/__init__.py:200-206`.

#### 3.2.3. Customizacao por objeto

O metodo pode ser sobrescrito quando a exibicao do icone depende do proprio
registro. Exemplo real em `enquete/admin.py:84-89`:

```python
def show_list_display_icons(self, obj):
    if not obj.eh_responsavel(self.request.user):
        return mark_safe('')
    return super().show_list_display_icons(obj)

show_list_display_icons.short_description = '#'
```

Nesse caso, os icones desaparecem para enquetes das quais o usuario nao e
responsavel. Isso melhora a interface, mas a seguranca da URL ainda deve ser
garantida por `has_view_permission()`, `has_change_permission()` e pelo escopo
do queryset.

### 3.3. Exportacao

`export_to_xls` tambem pertence ao `ModelAdminPlus`. O exemplo principal deste
encontro e o `AlunoAdmin`, que ativa o recurso em `edu/admin.py:1608`:

```python
export_to_xls = True
```

#### 3.3.1. Do botao ao queryset filtrado

`get_action_bar()`, em
`djtools/contrib/admin/options/__init__.py:310-346`, parte de
`request.get_full_path()` e acrescenta `export_to_xls=1`. Os parametros atuais
nao sao descartados.

Exemplo: se a tela estiver filtrada por ano, situacao e busca:

```text
/admin/edu/aluno/?ano_letivo__id__exact=2026&situacao__id__exact=1&q=Paloma
```

o botao aponta para algo equivalente a:

```text
/admin/edu/aluno/?ano_letivo__id__exact=2026&situacao__id__exact=1&q=Paloma&export_to_xls=1
```

O template do DJTools ainda atualiza esse link quando os filtros da listagem
mudam por AJAX, em `djtools/templates/adminutils/change_list.html:140-141`.

Ao receber a requisicao, `ModelAdminPlus.changelist_view()`, em
`djtools/contrib/admin/options/__init__.py:348-366`:

1. detecta `export_to_xls`;
2. remove apenas esse parametro de `request.GET`;
3. chama `get_current_queryset(request)`;
4. envia o queryset para `tasks.admin_export()`.

A remocao e importante: os demais parametros continuam disponiveis para que
`get_current_queryset()`, implementado nas linhas `237-259`, reconstrua um
`ChangeList` com a mesma busca, filtros, tab e ordenacao da tela.

#### 3.3.2. A tarefa de exportacao

`admin_export()` esta em `djtools/tasks.py:48-89` e recebe quatro dados
principais:

```python
tasks.admin_export('xls', queryset, request, self)
```

- `'xls'`: formato solicitado;
- `queryset`: registros resultantes da listagem filtrada;
- `request`: contexto da requisicao;
- `self`: instancia do `AlunoAdmin`.

A funcao possui o decorador `@task('Exportar para XLS/CSV Admin')`. O mecanismo
de `djtools/assincrono/__init__.py:39-118` cria um registro de tarefa e executa
o processamento em thread ou Celery, conforme a configuracao. A resposta
inicial redireciona para:

```text
/djtools/process2/<uuid-da-tarefa>/
```

Essa tela acompanha o progresso sem manter a requisicao original bloqueada.

#### 3.3.3. `to_xls()` personalizado

Dentro da tarefa, `admin_export()` procura dinamicamente um metodo chamado
`to_xls`. O `AlunoAdmin` o implementa em `edu/admin.py:1664-1681`:

```python
def to_xls(self, request, queryset, processo):
    header = [
        '#', 'Nome', 'Matricula', 'Curso', 'Campus', 'Polo',
        'Situacao', 'E-mail Academico', 'E-mail Pessoal',
        'Ano/Periodo Letivo',
    ]
    rows = [header]
    for idx, obj in enumerate(processo.iterate(queryset)):
        rows.append([
            idx + 1,
            obj.get_nome_social_composto(),
            obj.matricula,
            obj.curso_campus,
            obj.curso_campus.diretoria.setor.uo,
            format(obj.polo),
            obj.situacao,
            format(obj.pessoa_fisica.email),
            obj.pessoa_fisica.email_secundario,
            f'{obj.ano_letivo.ano}.{obj.periodo_letivo:d}',
        ])
    return rows
```

`processo.iterate(queryset)` atualiza o progresso durante a iteracao. Se o
Admin nao possuir `to_xls()`, `admin_export()` usa `list_xls_display` ou
`list_display` para montar cabecalho e linhas automaticamente.

#### 3.3.4. Geracao e resposta final

As linhas sao entregues a `XlsResponse(rows, processo=task)`. Em
`djtools/utils/__init__.py:545-658`, essa funcao:

- valida a matriz de linhas;
- cria a planilha com `xlwt`;
- grava um arquivo temporario quando existe uma tarefa;
- finaliza o processo com a mensagem `Arquivo gerado com sucesso` e o caminho
  do arquivo.

Fluxo completo:

```text
botao Exportar para XLS
  -> URL atual + export_to_xls=1
  -> changelist_view()
  -> get_current_queryset() preserva filtros e busca
  -> task admin_export()
  -> AlunoAdmin.to_xls()
  -> XlsResponse()
  -> arquivo disponivel na tela de acompanhamento
```

> A exportacao usa o queryset filtrado, mas nao necessariamente apenas os 15
> itens da pagina atual. Por isso, desempenho, escopo de `locals` e permissoes
> devem ser revisados com o mesmo cuidado aplicado a listagem.

### 3.4. Tabs

Para usar tabs, o admin inclui `CustomTabListFilter` em `list_filter`, retorna
os nomes em `get_tabs()` e implementa um metodo para cada aba.

Exemplo de `AlunoAdmin`, `edu/admin.py:1633-1649`:

```python
def tab_suap(self, request, queryset):
    return queryset.filter(
        codigo_academico__isnull=True,
        matriz__id__isnull=False,
    )

tab_suap.short_description = 'Matriculados no Suap'


def get_tabs(self, request):
    return ['tab_suap', 'tab_q_academico', 'tab_integralizados']
```

`CustomTabListFilter`, implementado em
`djtools/contrib/admin/filters/__init__.py:149-171`, transforma os nomes
retornados por `get_tabs()` em opcoes e executa o metodo da aba sobre o queryset.

Regra didatica:

```text
get_tabs() informa quais abas existem.
tab_xxx() informa quais registros pertencem a cada aba.
short_description informa o texto exibido.
```

### 3.5. Request disponivel no admin e no form

O `request` identifica a requisicao atual. Por meio de `request.user`, o codigo
conhece o usuario autenticado; por `request.GET` e `request.POST`, conhece os
parametros enviados. O Django Admin entrega o request aos metodos do
`ModelAdmin`, mas nao o coloca automaticamente dentro do `ModelForm`.

O `ModelAdminPlus` cria essa integracao em dois pontos:

- `get_changelist()`, em
  `djtools/contrib/admin/options/__init__.py:200-206`, armazena o request em
  `self.request` para uso nas colunas, tabs e demais metodos da listagem;
- `get_form()`, em
  `djtools/contrib/admin/options/__init__.py:392-409`, coloca o request na
  classe de formulario retornada pelo Django.

Trecho do segundo ponto:

```python
FormClass = super().get_form(request, obj, **defaults)
FormClass.request = request
return FormClass
```

Depois, quando o Admin instancia `FormClass`, o form consegue acessar
`self.request`. Esse comportamento e proprio do DJTools. No Django puro, um
`ModelForm` administrativo nao recebe o request automaticamente.

#### 3.5.1. Exemplo real: `AulaCampoAdmin` e `AulaCampoForm`

**Tela:** `/admin/edu/aulacampo/<pk>/change/`

O admin seleciona explicitamente o formulario.

**Arquivo:** `edu/admin.py`  
**Linhas:** `2842-2860`  
**Registro:** `edu/admin.py:2894`

```python
class AulaCampoAdmin(ModelAdminPlus):
    # ... configuracoes da listagem omitidas ...
    ordering = ('data_partida',)
    list_display_icons = True
    form = AulaCampoForm
    date_hierarchy = 'data_partida'


admin.site.register(AulaCampo, AulaCampoAdmin)
```

Ao abrir a tela, `ModelAdminPlus.get_form()` devolve `AulaCampoForm` com o
request atual associado. O construtor do form usa o usuario desse request.

**Arquivo:** `edu/forms.py`  
**Linhas:** `7956-7981`

```python
class AulaCampoForm(forms.ModelFormPlus):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not in_group(self.request.user, 'Administrador Acadêmico'):
            if self.instance.situacao != AulaCampo.SITUACAO_AGENDADA:
                self.fields['configuracao_seguro'].widget.attrs[
                    'disabled'
                ] = 'disabled'
                self.fields['uo'].widget.attrs['disabled'] = 'disabled'
                self.fields['descricao'].widget.attrs[
                    'readonly'
                ] = 'readonly'
                self.fields['finalidade'].widget.attrs[
                    'readonly'
                ] = 'readonly'
                self.fields['roteiro'].widget.attrs['readonly'] = 'readonly'
                self.fields['data_partida'].widget.attrs[
                    'readonly'
                ] = 'readonly'
                self.fields['data_chegada'].widget.attrs[
                    'readonly'
                ] = 'readonly'
                self.fields['responsaveis'].widget.attrs[
                    'disabled'
                ] = 'disabled'
                self.fields['arquivo'].widget.attrs['disabled'] = 'disabled'
```

A decisao combina dois dados:

```text
self.request.user                     -> quem esta usando a tela
self.instance.situacao                -> estado atual da aula de campo
```

Resultado:

| Usuario e situacao | Efeito no formulario |
|---|---|
| Administrador Academico | A restricao desse bloco nao e aplicada |
| Outro usuario e aula agendada | A restricao desse bloco nao e aplicada |
| Outro usuario e aula em outra situacao | Campos ficam desabilitados ou somente leitura |

Os campos afetados incluem campus, descricao, finalidade, roteiro, datas,
responsaveis, seguro e arquivo. Portanto, o request nao e apenas armazenado:
ele efetivamente modifica o formulario apresentado ao usuario.

Fluxo completo:

```text
usuario abre /admin/edu/aulacampo/<pk>/change/
    -> AulaCampoAdmin recebe request
    -> ModelAdminPlus.get_form() escolhe AulaCampoForm
    -> FormClass.request recebe o request
    -> AulaCampoForm.__init__() consulta self.request.user
    -> widgets sao adaptados ao grupo e a situacao
    -> change_form.html renderiza o formulario resultante
```

`readonly` e `disabled` orientam a interface, mas nao devem ser a unica defesa
de uma regra sensivel. A permissao da operacao deve ser conferida no Admin ou
no backend, e valores importantes devem ser validados no form ou no model.

### 3.6. Templates administrativos do SUAP

O `ModelAdminPlus` aponta suas telas para templates do DJTools em
`djtools/contrib/admin/options/__init__.py:119-122`:

```python
change_list_template = 'djtools/templates/adminutils/change_list.html'
change_form_template = 'djtools/templates/adminutils/change_form.html'
```

Eles nao reescrevem o Admin inteiro. Ambos usam heranca de templates para
preservar a estrutura nativa e substituir apenas blocos determinados.

#### 3.6.1. Template de listagem: `change_list.html`

**Arquivo:** `djtools/templates/adminutils/change_list.html`  
**Linhas:** `1-204`

A primeira linha revela a heranca:

```django
{% extends "admin/change_list.html" %}
```

`admin/change_list.html` pertence ao Django instalado. O template do DJTools
recebe seus blocos e redefine os pontos necessários.

**Bloco `extrahead`, linhas `5-164`**

```django
{% block extrahead %}
    <script src="/static/comum/js/pace.min.js"></script>
    {{ block.super }}
    {{ media.js }}
    <!-- JavaScript de actions, filtros, tabs e atualizacao AJAX. -->
{% endblock %}
```

- `{{ block.super }}` preserva o conteudo definido pelo template pai;
- `{{ media.js }}` inclui os scripts exigidos pelos forms e widgets;
- `cl.has_filters` e `cl.search_fields` controlam o codigo dos filtros;
- `cl.model_admin.filters_ajax` decide entre atualizar a pagina por AJAX ou
  navegar normalmente.

**Bloco `action-bar`, linhas `166-198`**

```django
{% block action-bar %}
    <ul class="action-bar">
        {% block object-tools-items %}
            {% for i in object_tools_items %}
                <a href="{{ i.url }}" class="btn {{ i.css_class }}">
                    {{ i.label }}
                </a>
            {% endfor %}
        {% endblock %}
        {% help_button %}
    </ul>
{% endblock %}
```

O codigo real tambem trata botoes com subitens. A variavel
`object_tools_items` nao nasce no template: ela e enviada pelo
`ModelAdminPlus.changelist_view()`.

**Bloco `content`, linhas `200-204`**

```django
{% block content %}
    <div id="content-main">
        {% include 'content_main_admin.html' %}
    </div>
{% endblock %}
```

O conteudo principal fica isolado em `#content-main`, permitindo substituir
somente essa regiao quando busca, filtros ou tabs usam AJAX.

#### 3.6.2. Como o contexto da listagem e montado

**Arquivo:** `djtools/contrib/admin/options/__init__.py`  
**Linhas:** `310-385`

`get_action_bar()` produz uma lista de dicionarios com `url`, `label` e
`css_class`. Depois, `changelist_view()` acrescenta essa lista ao contexto:

```python
more_context = dict(
    object_tools_items=self.get_action_bar(request),
    title=self.model._meta.verbose_name_plural,
    disable_general_tabs=True,
)
more_context.update(extra_context or {})
utils.breadcrumbs_add(request, more_context)
retorno = super().changelist_view(request, more_context)
```

O `super()` chama o fluxo nativo do Django, que acrescenta variaveis como:

| Variavel | Conteudo |
|---|---|
| `cl` | Objeto `ChangeListPlus` com resultados, filtros e configuracao |
| `media` | CSS e JavaScript dos forms e widgets |
| `action_form` | Formulario das actions, quando elas existem |
| `opts` | Metadados do model |
| `has_add_permission` | Resultado da permissao de inclusao |

Em uma requisicao AJAX, as linhas `382-383` renderizam apenas
`djtools/templates/adminutils/content_main_admin.html`, usando o mesmo
`context_data`. Por isso a tabela pode ser atualizada sem renderizar novamente
toda a pagina.

#### 3.6.3. Template de inclusao e edicao: `change_form.html`

**Arquivo:** `djtools/templates/adminutils/change_form.html`  
**Linhas:** `1-37`

Tambem existe heranca do template nativo:

```django
{% extends "admin/change_form.html" %}
{% load admin_modify %}
```

Blocos principais:

| Bloco | Linhas | Funcao no SUAP |
|---|---:|---|
| `admin_change_form_document_ready` | `6-9` | Preserva `block.super` e inclui `formset_handlers.js` |
| `action-bar` | `11-15` | Exibe a barra com o botao de ajuda |
| `object-tools` | `17` | Esvazia a barra padrao do Django |
| `form_top` | `19-23` | Exibe `info_extra`, quando fornecido |
| `bodyclass` | `25` | Adiciona a classe `readonly` ao corpo |
| `submit_buttons_top` | `27-31` | Oculta botoes superiores no modo somente leitura |
| `submit_buttons_bottom` | `33-37` | Oculta botoes inferiores no modo somente leitura |

Exemplo:

```django
{% block submit_buttons_bottom %}
    {% if not readonly %}
        {% submit_row %}
    {% endif %}
{% endblock %}
```

#### 3.6.4. Como o contexto do formulario e montado

`ModelAdminPlus.change_view()`, em
`djtools/contrib/admin/options/__init__.py:419-439`, carrega o objeto, verifica
`has_change_permission()`, define o titulo, inclui breadcrumbs e repassa o
contexto para o `change_view()` nativo:

```python
readonly = extra_context and extra_context.get('readonly', False)
more_context = dict(
    title='Visualizar %s' % obj if readonly else 'Editar %s' % obj
)
utils.breadcrumbs_add(request, more_context)
more_context.update(extra_context or {})
return super().change_view(
    request, object_id, form_url, more_context
)
```

O Django acrescenta o form, os inlines, `media`, `opts`, dados do objeto e
permissoes. Finalmente, `change_form_template` escolhe o template do DJTools.

Fluxo resumido:

```text
ModelAdminPlus.change_view()
    -> contexto adicional do SUAP
    -> ModelAdmin.change_view() do Django
    -> form + inlines + permissoes + media
    -> djtools/.../change_form.html
    -> admin/change_form.html como template pai
```

Como esses templates sao globais para todo `ModelAdminPlus`, uma mudanca neles
possui impacto amplo. Para uma necessidade isolada, prefira metodos como
`get_action_bar()` ou configure `change_list_template` e
`change_form_template` apenas no admin interessado.

<a id="etapa-4"></a>

## Etapa 4 — Estudo integrado de `AlunoAdmin`

### 4.1. Como acessar

1. Entrar com um usuario que possua acesso aos alunos.
2. Abrir **Ensino > Alunos** ou acessar `/admin/edu/aluno/`.
3. Realizar uma busca por nome ou pasta.
4. Aplicar filtros de ano, periodo, situacao ou campus.
5. Alternar entre as tabs.
6. Abrir um registro pelos icones da primeira coluna.

Use dados de teste ou homologacao se a demonstracao incluir alteracao. A
listagem pode ser estudada sem gravar nenhuma mudanca.

### 4.2. Mapa dos arquivos

| Responsabilidade | Arquivo e linhas |
|---|---|
| Model `Aluno` | `edu/models/alunos.py:107` em diante |
| Form administrativo | `edu/forms.py:215` em diante |
| Configuracao do admin | `edu/admin.py:1601-1870` |
| Registro no `AdminSite` | `edu/admin.py:1870` |
| Implementacao de `ModelAdminPlus` | `djtools/contrib/admin/options/__init__.py:87-625` |
| Teste que acessa a listagem | `edu/tests.py:1246-1249` |
| Teste que acessa a edicao | `edu/tests.py:3662-3668` |

### 4.3. Configuracao inicial comentada

**Arquivo:** `edu/admin.py`  
**Linhas:** `1601-1626`

```python
class AlunoAdmin(ModelAdminPlus):
    # Colunas apresentadas em /admin/edu/aluno/.
    list_display = (
        'get_foto',
        'get_info_principal',
        'periodo_letivo',
        'ano_letivo',
        'get_pasta',
    )

    # CustomTabListFilter cria as abas; os demais itens sao filtros de campo.
    list_filter = (
        CustomTabListFilter,
        'ano_letivo',
        'periodo_letivo',
        'situacao',
        'curso_campus__diretoria__setor__uo',
        'curso_campus',
        'polo',
        'curso_campus__modalidade',
    )

    # Recursos do ModelAdminPlus.
    list_display_icons = True
    export_to_xls = True

    # Recursos herdados do Django.
    list_per_page = 15
    ordering = ('-id',)

    # Form e layout usados na inclusao/edicao.
    form = AlunoForm
    fieldsets = AlunoForm.fieldsets

    search_fields = (
        'pessoa_fisica__nome_registro',
        'pessoa_fisica__search_fields_optimized',
        'registroemissaodiploma__pasta',
        'numero_pasta',
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request, Aluno.locals)
            .exclude(turmaminicurso__gerar_matricula=False)
            .select_related('ano_letivo', 'pessoa_fisica', 'situacao')
        )
```

### 4.4. Leitura do `get_queryset()`

`get_queryset()` determina o conjunto inicial de registros que o admin pode
usar. Busca, filtros, tabs, ordenacao e paginacao atuam depois sobre esse
conjunto.

No exemplo:

```python
super().get_queryset(request, Aluno.locals)
```

passa explicitamente um manager ao `ModelAdminPlus`. Sua implementacao de
`get_queryset()`, em `djtools/contrib/admin/options/__init__.py:234-235`,
devolve esse manager quando ele e informado:

```python
def get_queryset(self, request, manager=None, *args, **kwargs):
    return manager or super().get_queryset(request)
```

#### 4.4.1. Onde `Aluno.locals` e definido

Os managers do model estao declarados em `edu/models/alunos.py:250-258`:

```python
objects = AlunoManager()
locals = AlunoLocalManager()
com_matriz = AlunosComMatrizManager()
ativos = AlunosAtivosManager()
caracterizados = AlunosCaracterizadosManager()
nao_fic = AlunosNaoFICManager()
fic = AlunosFICManager()
locals_uo = FiltroUnidadeOrganizacionalManager(
    'curso_campus__diretoria__setor__uo'
)
```

`objects` e `locals` acessam o mesmo model e a mesma tabela. A diferenca e o
`QuerySet` inicial produzido por cada manager.

`AlunoLocalManager` esta implementado em `edu/managers.py:671-682`:

```python
class AlunoLocalManager(models.Manager):
    def get_queryset(self):
        qs = super().get_queryset()
        user = tl.get_user()
        if user and user.groups.filter(
            name='Coordenador de Polo EAD'
        ).exists():
            if user.groups.filter(
                permissions__codename='view_aluno'
            ).count() == 1:
                ids = CoordenadorPolo.objects.filter(
                    funcionario=user.get_profile()
                ).values_list('polo__id')
                return qs.filter(polo__id__in=ids)
        return qs
```

Leitura da regra atual:

- o usuario e obtido do contexto local da requisicao por `tl.get_user()`;
- para um **Coordenador de Polo EAD** cujo acesso a `view_aluno` venha apenas
  desse perfil, o manager local devolve somente alunos dos polos coordenados;
- nos demais casos, essa implementacao especifica devolve o queryset geral.

Portanto, e importante nao generalizar: `Aluno.locals` nao aplica atualmente
um filtro de campus ou diretoria para todos os perfis. Outros models do EDU
possuem managers `locals` com regras diferentes. O comportamento deve sempre
ser conferido na classe de manager concreta.

#### 4.4.2. Consulta resultante

Para o coordenador de polo descrito pela regra, o queryset inicial equivale a:

```python
ids = CoordenadorPolo.objects.filter(
    funcionario=request.user.get_profile()
).values_list('polo__id')

qs = Aluno.objects.filter(polo__id__in=ids)
```

Depois, `AlunoAdmin.get_queryset()` encadeia as demais operacoes:

```python
qs = (
    Aluno.locals
    .exclude(turmaminicurso__gerar_matricula=False)
    .select_related('ano_letivo', 'pessoa_fisica', 'situacao')
)
```

Em SQL conceitual, a parte de escopo corresponde a:

```sql
SELECT ...
FROM edu_aluno
WHERE edu_aluno.polo_id IN (
    SELECT polo_id
    FROM edu_coordenadorpolo
    WHERE funcionario_id = <perfil-do-usuario>
)
AND NOT (<condicao do minicurso temporario>)
```

Para observar o SQL real durante uma requisicao, coloque temporariamente um
breakpoint depois da construcao do queryset e execute:

```python
print(qs.query)
```

O SQL exato inclui aliases, `JOIN`s do `exclude()` e os relacionamentos de
`select_related()`, por isso sera mais extenso que a representacao conceitual.

```python
.exclude(turmaminicurso__gerar_matricula=False)
```

remove alunos temporarios de minicurso que nao devem aparecer nessa listagem.

```python
.select_related('ano_letivo', 'pessoa_fisica', 'situacao')
```

antecipa relacionamentos usados nas colunas. Sem isso, cada linha poderia
executar consultas adicionais, produzindo o problema N+1.

### 4.5. Colunas calculadas

`get_foto()`, em `edu/admin.py:1628-1631`, devolve a imagem do aluno:

```python
def get_foto(self, obj):
    return mark_safe(
        f'<img class="img-inside-container" '
        f'src="{obj.get_foto_75x100_url()}"/>'
    )

get_foto.short_description = 'Foto'
```

`get_info_principal()`, em `edu/admin.py:1843-1863`, monta uma coluna composta.
O metodo consulta `self.request.user` para mostrar CPF apenas a grupos
autorizados.

Esse exemplo une tres responsabilidades:

```text
obj             -> dados da linha
self.request    -> usuario e contexto da requisicao
retorno HTML    -> apresentacao da coluna
```

Uma coluna nao deve executar consultas repetidas sem necessidade. Antes de
acessar relacionamentos dentro dela, avalie `select_related()` ou
`prefetch_related()` no queryset.

### 4.6. URL personalizada no Admin

`AlunoAdmin` adiciona `/admin/edu/aluno/correntes/` em
`edu/admin.py:1651-1662`:

```python
def get_urls(self):
    urls = super().get_urls()
    my_urls = [
        path('correntes/', self.admin_site.admin_view(self.correntes))
    ]
    return my_urls + urls
```

`self.admin_site.admin_view()` envolve a view com as protecoes do Admin. Uma URL
administrativa personalizada nao deve ser ligada diretamente sem essa camada.

#### 4.6.1. O que `get_urls()` esta fazendo

```python
urls = super().get_urls()
```

recupera primeiro todas as rotas herdadas. No caso do `AlunoAdmin`, elas
incluem:

- a rota de visualizacao do `ModelAdminPlus`, como `<obj_pk>/view/`;
- listagem, inclusao, edicao, exclusao e historico do Django.

Depois:

```python
my_urls = [
    path('correntes/', self.admin_site.admin_view(self.correntes))
]
```

cria uma rota adicional cuja view e o metodo `AlunoAdmin.correntes()`. O
prefixo `/admin/edu/aluno/` ja foi criado por `AdminSite`; por isso o caminho
final e:

```text
/admin/edu/aluno/correntes/
```

#### 4.6.2. Por que `my_urls + urls`

A ordem das rotas importa. O retorno atual e:

```python
return my_urls + urls
```

Assim, `correntes/` e testada antes das rotas dinamicas que recebem um
identificador de objeto. Se fosse adicionada depois, uma rota generica poderia
interpretar a palavra `correntes` como `object_id`. Como regra pratica, URLs
especificas devem aparecer antes das rotas variaveis ou abrangentes.

#### 4.6.3. O que `admin_view()` protege

`AdminSite.admin_view()` envolve a callable antes de ela entrar no resolvedor.
Essa camada aplica o acesso administrativo do site, redireciona usuarios nao
autorizados para o login e acrescenta protecoes como `never_cache` e CSRF.

Entretanto, `admin_view()` nao substitui automaticamente uma verificacao
especifica do model dentro de toda view personalizada. Para uma view que
exponha ou altere dados, o padrao seguro e verificar explicitamente a operacao:

```python
def minha_view(self, request):
    if not self.has_view_permission(request):
        raise PermissionDenied()
    ...
```

No exemplo atual, `correntes()` apenas calcula filtros e redireciona para a
listagem normal de alunos. A `changelist_view` de destino volta a aplicar as
permissoes e o queryset do `AlunoAdmin`. Se a view passasse a devolver dados
diretamente ou executar uma alteracao, ela precisaria de autorizacao propria.

#### 4.6.4. Fluxo completo de `correntes()`

O metodo esta em `edu/admin.py:1651-1657`:

```text
GET /admin/edu/aluno/correntes/
  -> AdminSite seleciona AlunoAdmin
  -> get_urls() encontra correntes/ antes das rotas com object_id
  -> admin_view() verifica acesso ao site administrativo
  -> correntes() identifica o campus do usuario
  -> HttpResponseRedirect para /admin/edu/aluno/?<filtro>
  -> changelist_view() verifica permissao e monta o queryset
```

Para um usuario de campus diferente da Reitoria, o destino inclui:

```text
?curso_campus__diretoria__setor__uo__id__exact=<id-da-uo>
```

Esse parametro inicia a listagem com o campus selecionado. Ele e um filtro de
interface; o escopo de seguranca continua sendo responsabilidade das
permissoes e de `get_queryset()`.

<a id="etapa-5"></a>

## Etapa 5 — Formulários, permissões e escopo

### 5.1. Permissoes padrao do Django

Para cada model, o Django cria normalmente quatro permissoes de model:

```text
edu.view_aluno
edu.add_aluno
edu.change_aluno
edu.delete_aluno
```

Essas strings sao usadas pelo codigo Python, mas a permissao e armazenada no
banco como um registro relacionado a um `ContentType`.

#### 5.1.1. De onde surgem `add`, `change`, `delete` e `view`

Cada model possui a opcao `_meta.default_permissions`. O Django 4.1 cria por
padrao `add`, `change`, `delete` e `view`. O SUAP torna essa convencao explicita
na metaclasse dos models.

**Arquivo:** `djtools/db/models/__init__.py`  
**Linhas:** `449-452`

```python
class SUAPMetaModel(MetaModelPlus):
    def __new__(cls, name, *args, **kwargs):
        my_meta = super().__new__(cls, name, *args, **kwargs)
        my_meta._meta.default_permissions = (
            'add', 'change', 'delete', 'view'
        )
        return my_meta
```

Ao executar migrations, o Django emite o sinal `post_migrate`. A aplicacao de
autenticacao conecta esse sinal a `create_permissions()` em
`django/contrib/auth/apps.py:18-22`.

`create_permissions()`, implementada em
`django/contrib/auth/management/__init__.py:37-106`, executa este fluxo:

1. garante que o `ContentType` de cada model exista;
2. le `_meta.default_permissions` e `_meta.permissions`;
3. forma os codenames, como `view_aluno`;
4. consulta as permissoes que ja existem;
5. cria em lote apenas as ausentes.

Trecho essencial da implementacao nativa:

```python
for klass in app_config.get_models():
    content_type = ContentType.objects.get_for_model(
        klass,
        for_concrete_model=False,
    )
    for codename, name in _get_all_permissions(klass._meta):
        searched_perms.append((content_type, (codename, name)))

Permission.objects.bulk_create(perms)
```

`_get_all_permissions()` combina as quatro permissoes padrao com permissoes
adicionais declaradas em `class Meta`. O model `Aluno`, por exemplo, declara
permissoes de negocio em `edu/models/alunos.py:482-495`, como
`emitir_diploma`, `emitir_boletim` e `gerar_relatorio`.

Portanto:

```text
default_permissions -> permissoes CRUD criadas para todos os models
Meta.permissions     -> permissoes adicionais daquele model
```

#### 5.1.2. Onde as permissoes ficam no banco

As tabelas principais sao:

| Tabela | Informacao armazenada |
|---|---|
| `django_content_type` | Aplicacao e model: `app_label='edu'`, `model='aluno'` |
| `auth_permission` | Nome, codename e FK para `django_content_type` |
| `auth_group` | Grupos de usuarios |
| `auth_group_permissions` | Relacao entre grupo e permissao |
| `auth_user` | Usuarios do SUAP |
| `auth_user_groups` | Relacao entre usuario e grupo |
| `auth_user_user_permissions` | Permissoes atribuidas diretamente ao usuario |

`ContentType` e implementado em
`django/contrib/contenttypes/models.py:137-146`. Sua tabela e explicitamente
definida como `django_content_type` e o par `app_label/model` e unico.

`Permission` esta em `django/contrib/auth/models.py:38-84`:

```python
class Permission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey(ContentType, models.CASCADE)
    codename = models.CharField(max_length=100)

    class Meta:
        unique_together = [['content_type', 'codename']]
```

Para `edu.view_aluno`, o banco representa a identidade desta forma:

```text
django_content_type
    id: <id do ContentType>
    app_label: edu
    model: aluno

auth_permission
    id: <id da permissao>
    content_type_id: <id do ContentType>
    codename: view_aluno
    name: Can view Aluno
```

O numero dos IDs depende do banco. O texto completo `edu.view_aluno` nao
precisa estar em uma unica coluna: ele e reconstruido com
`content_type.app_label + '.' + permission.codename`.

Consulta equivalente no shell:

```python
from django.contrib.auth.models import Permission

permissao = Permission.objects.get(
    content_type__app_label='edu',
    content_type__model='aluno',
    codename='view_aluno',
)
```

O SUAP usa `AUTH_USER_MODEL = 'comum.User'` em
`suap/settings_base.py:565`. Esse model herda de `AbstractUser` e preserva a
tabela `auth_user`, conforme `comum/models.py:207-240`.

#### 5.1.3. Relacao com `permissions.yaml`

O `permissions.yaml` nao substitui a criacao das permissoes pelo Django. Sua
principal funcao e declarar **quais permissoes devem ser associadas a quais
grupos** no SUAP.

Exemplo real:

**Arquivo:** `edu/permissions.yaml`  
**Linhas:** `2101-2107`

```yaml
Organizador de Minicurso:
  description: Usuários deste grupo gerenciam os minicursos.
  edu:
    aluno:
    - view_aluno
    - view_dados_academicos
    - view_dados_pessoais
```

Leitura da hierarquia:

```text
grupo: Organizador de Minicurso
app: edu
model vinculado ao ContentType: aluno
codename: view_aluno
```

O comando `sync_permissions` le os arquivos em
`djtools/management/commands/sync_permissions.py:69-80` e
`djtools/management/commands/sync_permissions.py:134-146`. O parser YAML esta
em `djtools/management/permission.py:93-126`.

```bash
python manage.py sync_permissions
```

Internamente, o parser monta a identificacao em tres partes:

```text
edu.aluno.view_aluno
```

Esse formato auxilia a localizar o registro no banco. A verificacao Django
utilizada pela aplicacao continua sendo:

```text
edu.view_aluno
```

`sync_groups_and_permissions()`, em
`djtools/utils/__init__.py:1650-1729`, separa as tres partes e procura:

```python
Permission.objects.get(
    content_type__app_label='edu',
    content_type__model='aluno',
    codename='view_aluno',
)
```

Depois cria ou recupera o grupo e executa, conceitualmente:

```python
grupo.permissions.add(permissao)
```

Essa relacao e gravada em `auth_group_permissions`. Os usuarios vinculados ao
grupo, por `auth_user_groups`, passam a receber a permissao indiretamente.

Antes de reconstruir as associacoes, o comando limpa as permissoes dos grupos
processados em `sync_permissions.py:119-122` e
`sync_permissions.py:178-186`. Por isso, o YAML deve ser tratado como fonte de
sincronizacao, e nao apenas como uma lista de permissoes incrementais.

Fluxo completo:

```text
model e suas opcoes Meta
    -> migrate/post_migrate
    -> django_content_type + auth_permission

permissions.yaml
    -> sync_permissions
    -> auth_group + auth_group_permissions

usuario pertence ao grupo
    -> auth_user_groups
    -> user.has_perm('edu.view_aluno') == True
```

O comando tambem consegue recriar uma permissao CRUD padrao ausente, conforme
`djtools/utils/__init__.py:1691-1703`. Permissoes personalizadas, entretanto,
devem existir nos metadados do model; caso contrario, a sincronizacao informa
que a permissao nao existe.

#### 5.1.4. Como `user.has_perm()` encontra a permissao

O `User` do SUAP sobrescreve `has_perm()` em `comum/models.py:234-240`, mas no
fluxo comum delega ao Django com `super().has_perm()`.

O backend padrao combina:

- permissoes diretas de `auth_user_user_permissions`;
- permissoes dos grupos, por `auth_user_groups` e
  `auth_group_permissions`;
- acesso total para superusuarios ativos.

A implementacao pode ser vista em
`django/contrib/auth/backends.py:63-114`. O resultado e convertido em strings
`<app_label>.<codename>`, como `edu.view_aluno`, e armazenado em cache no
objeto do usuario durante aquela execucao.

#### 5.1.5. Como o Admin consulta as permissoes

No `ModelAdmin` nativo, os metodos de permissao montam o codename a partir dos
metadados do model e chamam `request.user.has_perm()`.

**Implementacao do Django:**
`django/contrib/admin/options.py:536-609`

Exemplo equivalente ao codigo de `has_change_permission()`:

```python
opts = self.opts
codename = get_permission_codename('change', opts)
return request.user.has_perm(
    f'{opts.app_label}.{codename}'
)
```

Para `Aluno`, o resultado e `edu.change_aluno`.

Na verificacao de visualizacao, o Django aceita `view_aluno` **ou**
`change_aluno`: quem pode alterar tambem pode abrir o registro. Essa regra esta
em `django/contrib/admin/options.py:575-591` e foi preservada pelo helper do
DJTools em `djtools/utils/__init__.py:1928-1949`.

O `ModelAdminPlus` adapta esse fluxo em
`djtools/contrib/admin/options/__init__.py:295-308`:

```python
def has_view_permission(self, request, obj=None):
    return utils.has_view_permission(
        model=self.model,
        user=request.user,
    )

def has_change_permission(self, request, obj=None):
    if obj and hasattr(obj, 'can_change'):
        if not obj.can_change(request.user):
            return False
    return utils.has_change_permission(
        model=self.model,
        user=request.user,
    )
```

Os helpers do DJTools estao em `djtools/utils/__init__.py:1859-2003`. Alem da
permissao global, eles podem consultar `can_view()`, `can_change()` e
`can_delete()` do objeto.

Assim, a decisao pode possuir duas camadas:

```text
user.has_perm('edu.change_aluno')  -> permissao global do model
obj.can_change(user)               -> regra contextual daquele objeto
```

O Admin usa o resultado para permitir ou negar URLs, exibir botoes e autorizar
o salvamento. Fluxos adicionais do SUAP tambem podem fornecer `readonly` ao
template para uma apresentacao sem edicao. Ocultar um botao no template nao
substitui essas verificacoes de backend.

### 5.2. Metodos de permissao

Metodos principais:

```python
has_view_permission(self, request, obj=None)
has_add_permission(self, request)
has_change_permission(self, request, obj=None)
has_delete_permission(self, request, obj=None)
```

O parametro `obj` permite uma decisao contextual sobre um registro especifico.

O `ModelAdminPlus` implementa verificacoes adicionais em
`djtools/contrib/admin/options/__init__.py:295-308`. Em especial,
`has_change_permission()` chama `obj.can_change(request.user)` quando o objeto
possui esse metodo.

Exemplo de regra local em `AlunoAdmin`, `edu/admin.py:1617-1623`:

```python
def has_change_permission(self, request, obj=None):
    if (
        request.user.has_perm('edu.change_aluno')
        or request.user.groups.filter(
            name='Auxiliar de Secretaria Academica'
        ).exists()
    ):
        return True
    return super().has_change_permission(request, obj)
```

Uma verificacao no template ou a ausencia de um botao nao protege a URL. A
autorizacao deve ser validada no backend por esses metodos, pela view ou pela
regra contextual correspondente.

### 5.3. Permissao nao substitui escopo

Permissao e escopo respondem a perguntas diferentes. As duas verificacoes sao
necessarias:

```text
O usuario pode abrir o cadastro de Turma?       -> has_view_permission()
Quais turmas ele pode consultar?                -> get_queryset()/manager
Ele pode alterar esta turma e estes campos?     -> regra do objeto/form
```

#### 5.3.1. Primeira barreira: `has_view_permission()`

O `TurmaAdmin` herda de `ModelAdminPlus`. A implementacao herdada esta em
`djtools/contrib/admin/options/__init__.py:295-296`:

```python
def has_view_permission(self, request, obj=None):
    return utils.has_view_permission(model=self.model, user=request.user)
```

O helper chamado por esse metodo esta em `djtools/utils/__init__.py:1928-1949`.
Ele autoriza a visualizacao quando o usuario possui a permissao `view` ou
`change` do model. O helper tambem suporta receber um objeto e, nesse caso,
chamar `obj.can_view(user)`. Observe, porem, que a implementacao de
`ModelAdminPlus.has_view_permission()` reproduzida acima passa somente
`model` e `user`; uma regra por objeto precisa ser encaminhada pelo ponto do
fluxo que efetivamente forneca `obj`.

Em termos simplificados:

```python
request.user.has_perm('edu.view_turma')
# ou
request.user.has_perm('edu.change_turma')
```

Essa verificacao responde **se o usuario pode acessar o recurso Turma**. Ela
nao define, sozinha, quais linhas da tabela `edu_turma` poderao ser vistas.

#### 5.3.2. Segunda barreira: `get_queryset()`

O escopo da listagem e definido pelo queryset devolvido pelo Admin. O exemplo
real esta em `edu/admin.py:972-977`:

```python
def get_queryset(self, request):
    if request.user.has_group_cached('Diretor Acadêmico'):
        manager = Turma.objects
    else:
        manager = Turma.locals
    return (
        super().get_queryset(request, manager)
        .select_related('curso_campus__diretoria__setor__uo')
    )
```

O metodo escolhe o manager antes de construir a consulta:

| Situacao | Permissao | Manager escolhido | Resultado |
|---|---|---|---|
| Sem `view_turma` e sem `change_turma` | negada | nao importa | o Admin deve negar o acesso |
| Com permissao e no grupo `Diretor Acadêmico` | concedida | `Turma.objects` | consulta geral de turmas |
| Com permissao e fora desse grupo | concedida | `Turma.locals` | consulta limitada pelo contexto local |

`Turma.objects` e `Turma.locals` sao declarados em
`edu/models/turmas.py:23-24`. O primeiro usa `TurmaManager`, enquanto o segundo
usa `TurmaLocalManager`. A implementacao de `TurmaLocalManager` comeca em
`edu/managers.py:416`; ela combina os filtros de diretoria com regras locais,
como as aplicadas a coordenadores de polo.

#### 5.3.3. O que muda nas URLs do Admin

O queryset nao protege apenas a tabela exibida em
`/admin/edu/turma/`. O Django Admin tambem procura o objeto da tela de edicao a
partir do queryset do proprio `ModelAdmin`. Por isso, uma turma fora do escopo
nao deve se tornar acessivel apenas porque alguem digitou diretamente uma URL
como:

```text
/admin/edu/turma/123/change/
```

O fluxo esperado e:

```text
requisicao
   -> has_view_permission()/has_change_permission()
   -> TurmaAdmin.get_queryset(request)
   -> procura do objeto dentro do queryset permitido
   -> exibicao ou negacao
```

Trocar `Turma.locals` por `Turma.objects` nao concede a permissao Django, mas
amplia o conjunto de registros encontrado pela listagem, busca, exportacao e
acesso por identificador. Portanto, esta troca tambem e uma alteracao de
seguranca.

> **Regra pratica:** `has_view_permission()` controla a porta de entrada;
> `get_queryset()` controla quais registros existem depois dessa porta. Uma
> camada nao substitui a outra.

### 5.4. `objects` x `locals` no Admin

```python
Aluno.objects  # manager geral
Aluno.locals   # manager com restricao contextual/local do SUAP
```

Antes de trocar `locals` por `objects`, analise o impacto de seguranca. Uma
mudanca aparentemente pequena pode ampliar a listagem, busca, exportacao e
autocomplete para dados de outros campi.

Exemplo contextual em `TurmaAdmin`, `edu/admin.py:972-977`:

```python
def get_queryset(self, request):
    if request.user.has_group_cached('Diretor Acadêmico'):
        manager = Turma.objects
    else:
        manager = Turma.locals
    return (
        super().get_queryset(request, manager)
        .select_related('curso_campus__diretoria__setor__uo')
    )
```

### 5.5. Form do Admin e seguranca dos campos

Ocultar um campo com CSS ou colocar apenas o atributo HTML `readonly` altera a
interface, mas nao constitui uma autorizacao de backend. Um usuario pode montar
manualmente outra requisicao `POST`. A protecao deve determinar quais campos
fazem parte do form processado pelo servidor e validar as regras antes do
salvamento.

#### 5.5.1. Exemplo real de `get_readonly_fields()`

O `ProcessoAdmin`, em `processo_eletronico/admin.py:241-247`, muda os campos
somente leitura de acordo com o estado do objeto:

```python
def get_readonly_fields(self, request, obj=None):
    readonly_fields = []
    if obj and obj.tem_tramite():
        readonly_fields += [
            'assunto',
            'interessados',
            'tipo_processo',
            'setor_criacao',
        ]
    if obj and obj.pk:
        readonly_fields += ['nivel_acesso', 'hipotese_legal']
    return readonly_fields
```

Leitura do metodo:

- `obj is None`: e uma inclusao; ainda nao existe processo salvo;
- `obj and obj.pk`: e uma edicao; nivel de acesso e hipotese legal deixam de
  ser editaveis;
- `obj.tem_tramite()`: o processo ja possui tramitacao; dados estruturais
  adicionais tambem ficam protegidos;
- a lista devolvida pode variar para cada objeto e requisicao.

O Django usa `readonly_fields` tanto para apresentar os valores como leitura
quanto para exclui-los do `ModelForm` editavel. Assim, eles nao entram em
`cleaned_data` e nao sao atualizados pelo `form.save()`.

#### 5.5.2. Remocao dinamica de campos

O mesmo `ProcessoAdmin` altera os `fieldsets` em
`processo_eletronico/admin.py:249-265`. Ao editar um processo salvo que ainda
nao possui tramite, o formulario passa a mostrar somente tres campos:

```python
def get_fieldsets(self, request, obj=None):
    # fieldset completo omitido aqui
    if obj and obj.pk and not obj.tem_tramite():
        self.fieldsets = (
            ('Dados do Processo', {
                'fields': ('tipo_processo', 'setor_criacao', 'classificacao')
            }),
        )
    return self.fieldsets
```

Neste caso, `get_fieldsets()` determina quais campos participam da tela e da
classe de formulario montada pelo Admin. A decisao usa o proprio objeto, mas
poderia tambem consultar `request.user` para variar conforme a permissao ou o
grupo do usuario.

O SUAP possui ainda o padrao de remover campos diretamente no construtor do
form. Um exemplo didatico esta em `edu/forms.py:4585-4599`: o
`AtualizarDadosPessoaisForm` remove os telefones quando
`pode_realizar_procedimentos` e falso. Esse form e usado por uma view
personalizada, nao pelo Admin, mas o efeito no processamento e o mesmo:

```python
if not self.pode_realizar_procedimentos:
    del self.fields['telefone_principal']
    del self.fields['telefone_secundario']
else:
    del self.fields['esconde_telefone']
```

Remover `self.fields['campo']` e diferente de apenas esconder o elemento com
JavaScript: o campo deixa de participar da validacao e de `cleaned_data`.

#### 5.5.3. O que acontece em um `POST` direto

Considere uma requisicao adulterada que inclua um campo protegido:

```text
POST /admin/processo_eletronico/processo/123/change/
assunto=Valor alterado manualmente
nivel_acesso=PUBLICO
```

O resultado depende de como o campo foi protegido:

| Implementacao | O campo integra o form no servidor? | Efeito do `POST` manual |
|---|---:|---|
| `get_readonly_fields()` | nao, como campo editavel | valor enviado nao deve ser salvo pelo `ModelForm` |
| campo fora de `get_fieldsets()`/`fields` | nao | chave adicional nao integra `cleaned_data` |
| `del self.fields['campo']` | nao | chave adicional nao integra `cleaned_data` |
| somente CSS, JavaScript ou atributo no widget | sim | valor pode ser aceito; nao e protecao suficiente |

No `AlunoAdmin`, por exemplo, o form efetivamente usado e declarado em
`edu/admin.py:1612-1613`, e o `AlunoForm` esta em `edu/forms.py:215-314`.
Qualquer customizacao de seguranca precisa considerar essa classe real, seu
`clean()`, seu `save()` e as regras do model, e nao apenas o HTML gerado.

Para estudar o comportamento sem alterar dados importantes:

1. Abra a tela de edicao e identifique um campo somente leitura.
2. Inspecione o HTML e observe que ele nao e um campo editavel normal.
3. Explique que uma requisicao pode ser forjada mesmo sem o controle visual.
4. Mostre no debugger que o campo protegido nao aparece em
   `form.cleaned_data`.
5. Confirme no banco que o valor anterior foi preservado.

> **Cuidado:** um campo ausente do form fica protegido contra a atualizacao
> automatica daquele `ModelForm`, mas regras criticas ainda devem ser
> verificadas no form, model ou servico de dominio, principalmente quando o
> mesmo model pode ser alterado fora do Admin.

<a id="etapa-6"></a>

## Etapa 6 — Actions, inlines e hooks

### 6.1. Actions administrativas

Actions executam uma operacao sobre os registros selecionados na listagem. A
assinatura basica recebe a requisicao e um queryset ja limitado aos objetos
marcados pelo usuario:

```python
def minha_action(self, request, queryset):
    ...
```

Exemplo de `DiarioAdmin`, `edu/admin.py:1053-1083`:

```python
actions = (
    'habilitar_integracao_com_moodle',
    'desabilitar_integracao_com_moodle',
)


def habilitar_integracao_com_moodle(self, request, queryset):
    queryset.update(integracao_com_moodle=True)
    messages.success(request, 'Habilitacao realizada com sucesso.')


habilitar_integracao_com_moodle.short_description = (
    'Habilitar Integracao com Moodle'
)
```

`actions`, na linha `1053`, registra os nomes dos metodos que aparecerao no
seletor. `short_description` fornece o texto exibido para o usuario.

#### 6.1.1. Da selecao ate a execucao

O fluxo de uma action comum e:

```text
usuario marca linhas na listagem
  -> escolhe uma opcao no seletor de actions
  -> formulario envia POST para a propria changelist
  -> POST contem action, _selected_action e select_across
  -> Django encontra o metodo em get_actions()
  -> restringe o queryset aos IDs selecionados
  -> chama metodo(self, request, queryset)
  -> action altera dados e registra mensagem
  -> changelist e recarregada
```

O queryset de entrada parte do `get_queryset()` do Admin e ainda recebe busca,
filtros e tabs. Em seguida, o Django aplica os identificadores selecionados.
Uma action nao deve reconstruir a operacao com `Model.objects.all()`, pois isso
pode abandonar tanto a selecao quanto o escopo de seguranca.

O campo `select_across` diferencia duas situacoes:

- falso: processar somente as caixas marcadas na pagina;
- verdadeiro: processar todos os registros do resultado filtrado, quando a
  interface oferece essa opcao.

#### 6.1.2. Mensagem e resposta

No exemplo, a alteracao e seguida por:

```python
messages.success(request, 'Habilitacao realizada com sucesso.')
```

A mensagem e armazenada pelo framework de mensagens e exibida depois que o
Admin recarrega a listagem. Uma action pode retornar `None`; nesse caso, o
Django volta para a changelist. Ela tambem pode devolver uma `HttpResponse`,
por exemplo um arquivo, um redirecionamento ou uma pagina intermediaria.

Para uma mensagem mais informativa, pode-se usar a quantidade realmente
afetada:

```python
total = queryset.update(integracao_com_moodle=True)
messages.success(
    request,
    f'{total} diario(s) habilitado(s) para integracao.',
)
```

#### 6.1.3. Actions que exigem confirmacao

O Django nao cria uma confirmacao intermediaria para toda action. Quando a
operacao for destrutiva ou exigir parametros adicionais, o metodo pode:

1. receber a primeira submissao com os objetos selecionados;
2. devolver um template de confirmacao contendo os IDs em campos ocultos;
3. na confirmacao, validar novamente permissao e estado dos objetos;
4. executar a operacao e redirecionar com uma mensagem.

Estrutura reduzida:

```python
def arquivar(self, request, queryset):
    if 'confirmar' not in request.POST:
        return TemplateResponse(
            request,
            'admin/confirmar_arquivamento.html',
            {
                'queryset': queryset,
                'action': 'arquivar',
            },
        )

    # Revalidar antes de alterar; o estado pode ter mudado.
    total = queryset.filter(pode_arquivar=True).update(arquivado=True)
    self.message_user(request, f'{total} registro(s) arquivado(s).')
```

Esse e um molde didatico. O template precisa reenviar `action` e cada
`_selected_action`; caso contrario, o Admin perde a selecao na segunda
requisicao.

#### 6.1.4. `queryset.update()` x `obj.save()`

O proprio `DiarioAdmin` permite comparar as duas abordagens. A action de
integracao usa `update()` em `edu/admin.py:1075-1077`:

```python
queryset.update(integracao_com_moodle=True)
```

Ja `alternar_primeiro_semestre()`, em `edu/admin.py:1085-1089`, percorre os
objetos:

```python
for diario in queryset.filter(componente_curricular__segundo_semestre=True):
    diario.segundo_semestre = False
    diario.save()
```

| Aspecto | `queryset.update()` | `obj.save()` em loop |
|---|---|---|
| SQL | normalmente um unico `UPDATE` | um `UPDATE` por objeto |
| desempenho em lote | melhor | menor para grandes conjuntos |
| `Model.save()` sobrescrito | nao executa | executa |
| signals `pre_save`/`post_save` | nao executa | executa |
| decisao diferente por objeto | limitada a expressoes SQL | simples de implementar |
| retorno | quantidade de linhas afetadas | retorno usual de `save()` |

Nenhuma das duas opcoes chama automaticamente `full_clean()` do model. A
action deve validar explicitamente as regras necessarias. Use `update()` quando
a alteracao puder ser feita diretamente no banco sem efeitos de `save()`;
use o loop quando cada objeto precisar passar por comportamento individual.

Cuidados com actions:

- verificar permissao para a operacao, nao apenas para listar;
- validar o estado de cada objeto;
- usar transacao quando a operacao precisar ser atomica;
- compreender que `queryset.update()` nao chama `save()` nem signals de save;
- apresentar confirmacao para operacoes destrutivas;
- informar claramente sucesso, falha parcial ou quantidade processada.

O `ModelAdminPlus` remove a action padrao `delete_selected` em
`djtools/contrib/admin/options/__init__.py:148-154`.

### 6.2. Inlines

Inline permite editar objetos filhos relacionados dentro do formulario do
objeto pai. O Django constroi um **formset**: um conjunto de formularios do
mesmo model, acompanhado de dados de controle sobre quantos formularios foram
enviados, criados ou removidos.

#### 6.2.1. Exemplo real: horarios de um campus

Exemplo em `edu/admin.py:356-382`:

```python
class HorarioAulaInline(admin.TabularInline):
    model = HorarioAula
    extra = 3


class HorarioCampusAdmin(ModelAdminPlus):
    inlines = [HorarioAulaInline]
```

O relacionamento que permite o inline esta no model. Em
`edu/models/cadastros_gerais.py:526-533`, `HorarioCampus` e o pai. Em
`edu/models/cadastros_gerais.py:560-573`, cada `HorarioAula` possui a chave
estrangeira para ele:

```python
class HorarioAula(LogModel):
    horario_campus = models.ForeignKeyPlus(
        'edu.HorarioCampus',
        on_delete=models.CASCADE,
    )
    numero = models.PositiveIntegerField(choices=HORARIO_CHOICES)
    turno = models.ForeignKeyPlus('edu.Turno', on_delete=models.CASCADE)
    inicio = models.CharFieldPlus(max_length=5)
    termino = models.CharFieldPlus(max_length=5)
```

Na tela de alteracao de `HorarioCampus`, o Admin identifica automaticamente a
`ForeignKey` e associa cada linha do inline ao objeto pai. A tela pode ser
aberta pela listagem:

```text
/admin/edu/horariocampus/
```

Depois, selecione um horario de campus para acessar sua tela de edicao.

#### 6.2.2. O papel de cada elemento

| Elemento | Neste exemplo | Funcao |
|---|---|---|
| objeto pai | `HorarioCampus` | registro principal salvo pelo Admin |
| objetos filhos | `HorarioAula` | horarios pertencentes ao campus |
| inline | `HorarioAulaInline` | configuracao visual e funcional dos filhos |
| formset | conjunto de forms de `HorarioAula` | valida e salva varias linhas juntas |
| `extra = 3` | tres formularios vazios | oferece espaco inicial para novas linhas |

`extra = 3` nao cria tres registros automaticamente. Formularios extras
completamente vazios sao ignorados; um novo `HorarioAula` so e criado quando a
linha e preenchida e validada.

O formset tambem envia um *management form*, com campos internos semelhantes a:

```text
horarioaula_set-TOTAL_FORMS
horarioaula_set-INITIAL_FORMS
```

Esses valores permitem ao Django distinguir filhos existentes, novas linhas e
linhas marcadas para exclusao. Eles devem estar presentes no `POST`; alterar
esses contadores manualmente nao evita a validacao dos formularios.

Por padrao, o inline tambem pode apresentar a opcao de exclusao dos filhos
existentes. O Admin somente processa essa marcacao quando a exclusao e
permitida. Separadamente, o `on_delete=models.CASCADE` da `ForeignKey`, em
`edu/models/cadastros_gerais.py:569`, determina que a exclusao do proprio
`HorarioCampus` tambem exclua seus `HorarioAula`. Sao dois fluxos diferentes:
excluir uma linha pelo formset e excluir o objeto pai.

#### 6.2.3. Validacao e salvamento

O fluxo conceitual e:

```text
POST da tela
   -> valida o ModelForm de HorarioCampus
   -> valida o formset de HorarioAula
   -> salva o objeto pai
   -> atribui o pai aos novos filhos pela ForeignKey
   -> salva inclusoes, alteracoes e exclusoes do formset
   -> salva relacoes many-to-many, quando existirem
```

O pai precisa ser salvo antes dos novos filhos porque sua chave primaria sera
usada em `HorarioAula.horario_campus_id`. Se qualquer parte nao for valida, a
tela e reapresentada com os erros e o conjunto nao deve ser parcialmente
confirmado pelo fluxo normal do Admin.

O `HorarioAulaInline` tambem customiza o widget de `turno` e inclui JavaScript
em `edu/admin.py:360-371`. Essas alteracoes afetam a interface; a relacao e o
salvamento continuam sendo responsabilidade do inline formset.

#### 6.2.4. `TabularInline` x `TabularInlinePlus`

`admin.TabularInline` pertence ao Django e mostra cada filho como uma linha de
tabela. O `TabularInlinePlus` e uma extensao do DJTools, implementada em
`djtools/contrib/admin/options/__init__.py:52-68`:

```python
class TabularInlinePlus(admin.TabularInline):
    formfield_overrides = FORMFIELD_OVERRIDES

    def get_formset(self, request, obj=None, **kwargs):
        FormSetClass = super().get_formset(request, obj, **kwargs)
        FormSetClass.form.request = request
        return FormSetClass
```

Comparacao:

| Recurso | `TabularInline` | `TabularInlinePlus` |
|---|---:|---:|
| formset inline padrao | sim | sim, por heranca |
| exibicao tabular | sim | sim |
| widgets regionais para data e hora do SUAP | nao automaticamente | sim |
| `request` disponivel na classe do form | nao automaticamente | sim |

Um uso real do `TabularInlinePlus` aparece em `edu/admin.py:3645-3660`.
`AutorizacaoInline` e `ReconhecimentoInline` sao filhos de `MatrizCursoAdmin`;
a chave estrangeira de `Autorizacao` para `MatrizCurso` pode ser vista em
`edu/models/cursos.py:1286-1289`.

Use inline quando a relacao for clara e o volume relacionado for pequeno. Um
inline com centenas de registros pode tornar a tela lenta e dificil de usar.
Para volumes grandes, uma listagem separada com filtros e uma tela propria de
edicao costuma ser mais adequada.

### 6.3. Hooks de salvamento

Hooks sao pontos de extensao chamados pelo Django durante ou depois de uma
operacao administrativa. Eles permitem acrescentar comportamento sem
reescrever toda a view de inclusao, alteracao ou exclusao.

Os principais deste encontro sao:

```python
save_model(request, obj, form, change)
save_related(request, form, formsets, change)
delete_model(request, obj)
response_add(request, obj)
response_change(request, obj)
```

Eles nao sao equivalentes. O fluxo simplificado de uma inclusao ou alteracao e:

```text
form.is_valid() e formsets validos
    -> save_form() prepara o objeto
    -> save_model() salva o objeto principal
    -> save_related() salva M2M e inlines
    -> response_add() ou response_change() escolhe a resposta HTTP
```

O fluxo de exclusao passa por `delete_model()` e termina na resposta propria
de exclusao. Os hooks `response_add()` e `response_change()` acontecem depois
do salvamento; sua responsabilidade principal e decidir para onde o navegador
vai e qual mensagem sera apresentada.

#### 6.3.1. `save_model()`

Assinatura:

```python
def save_model(self, request, obj, form, change):
    ...
```

Parametros:

- `request`: requisicao e usuario atual;
- `obj`: instancia principal preenchida pelo form;
- `form`: `ModelForm` ja validado;
- `change`: `False` na inclusao e `True` na alteracao.

O exemplo real esta em `MatrizAdmin`, `edu/admin.py:725-730`:

```python
def save_model(self, request, obj, form, change):
    if obj.exige_ch:
        obj.ch_componentes_tcc = 0
    else:
        obj.ch_projeto_final = 0
    super().save_model(request, obj, form, change)
```

Antes de persistir a matriz, o hook torna mutuamente coerentes dois modos de
informar a carga horaria do TCC. A chamada a `super()` executa o salvamento
normal de `obj`. Omiti-la sem realizar `obj.save()` por outro caminho pode
impedir a persistencia.

Use `save_model()` para uma informacao que depende do contexto administrativo,
como registrar o usuario da requisicao. Se a regra deve valer em importacoes,
scripts, APIs e outras views, ela provavelmente pertence ao model ou a um
servico de dominio.

#### 6.3.2. `save_related()`

Assinatura:

```python
def save_related(self, request, form, formsets, change):
    ...
```

Esse hook e chamado depois de o objeto principal possuir chave primaria. Nesse
momento, o Django pode salvar:

- campos `ManyToManyField` do form;
- objetos filhos enviados por inlines;
- ajustes que dependem dessas relacoes ja persistidas.

Exemplo real em `enquete/admin.py:134-137`:

```python
def save_related(self, request, form, formsets, change):
    super().save_related(request, form, formsets, change)
    enquete = form.instance
    enquete.vinculos_publico.set(enquete.get_publicos())
```

Primeiro, `super().save_related()` confirma as relacoes enviadas pelo form e
os formsets. Depois, o codigo recalcula `vinculos_publico` a partir dos
publicos configurados na enquete. A ordem importa: executar esse calculo antes
do `super()` poderia usar relacoes antigas ou ainda nao salvas.

#### 6.3.3. `delete_model()`

Assinatura:

```python
def delete_model(self, request, obj):
    ...
```

O hook executa a exclusao de um unico objeto pela tela administrativa. A
permissao deve ser tratada por `has_delete_permission()`; `delete_model()` e o
ponto para validar o estado final, excluir e executar efeitos relacionados.

Exemplo real, reduzido aos pontos principais, em
`plano_trabalho_docente/admin.py:805-818`, dentro de `ItemAtividadeAdmin`:

```python
def delete_model(self, request, obj):
    if obj.plano_relatorio.is_travado:
        raise ValidationError(
            'O item nao pode ser excluido porque o relatorio foi homologado.'
        )
    super().delete_model(request, obj)
    if obj.importada_suap:
        ItemImportadoRemovido.objects.create(
            plano_relatorio=obj.plano_relatorio,
            id_importacao=obj.id_importacao,
            atividade=obj.atividade,
            model_importacao=obj.model_importacao,
        )
    obj.notificar_remocao()
```

O codigo real preserva os dados de uma atividade importada em
`ItemImportadoRemovido` e envia a notificacao depois da exclusao. Os valores
necessarios precisam estar carregados em `obj`, pois `super().delete_model()`
remove o registro principal.

> `delete_model()` nao substitui automaticamente o fluxo de exclusao em lote.
> Uma action que chama `queryset.delete()` pode nao passar por esse hook para
> cada objeto. Operacoes em lote precisam declarar explicitamente seus efeitos.

#### 6.3.4. `response_add()`

Assinatura usual:

```python
def response_add(self, request, obj, post_url_continue=None):
    ...
```

Ele recebe o objeto ja criado e deve devolver uma resposta HTTP. O Django usa
o hook para respeitar botoes como "Salvar e continuar editando"; uma
sobrescrita pode direcionar o usuario para um fluxo proprio.

Exemplo real em `MatrizAdmin`, `edu/admin.py:751-753`:

```python
def response_add(self, request, obj):
    self.message_user(
        request,
        'Matriz cadastrada com sucesso. '
        'Por favor, vincule os componentes a matriz.',
    )
    return HttpResponseRedirect(f'/edu/matriz/{obj.pk}/')
```

Depois de cadastrar a matriz, o usuario nao volta para a listagem padrao do
Admin. Ele e encaminhado para a tela propria em que os componentes podem ser
vinculados. `response_add()` nao salva novamente o objeto.

#### 6.3.5. `response_change()`

Assinatura:

```python
def response_change(self, request, obj):
    ...
```

Esse hook e o equivalente de resposta para uma edicao concluida. Exemplo real
em `ProfessorAdmin`, `edu/admin.py:1540-1541`:

```python
def response_change(self, request, obj):
    return httprr('..', 'Professor alterado com sucesso.')
```

`httprr()` e um helper do DJTools que cria o redirecionamento e registra a
mensagem para a requisicao seguinte. O caminho `..` leva da URL de alteracao
para o nivel anterior. Assim como `response_add()`, esse hook escolhe a
resposta; a alteracao ja foi salva.

#### 6.3.6. Quando chamar `super()`

| Hook | Papel do `super()` |
|---|---|
| `save_model()` | salva o objeto principal |
| `save_related()` | salva M2M e formsets/inlines |
| `delete_model()` | exclui o objeto principal |
| `response_add()` | produz a resposta padrao depois da inclusao |
| `response_change()` | produz a resposta padrao depois da alteracao |

Nos tres primeiros, omitir `super()` exige implementar conscientemente a
operacao que ele realizaria. Nos hooks de resposta, e valido devolver uma
resposta propria em vez de chamar `super()`, como fazem os exemplos do EDU.

Antes de colocar uma regra em `save_model()`, pergunte se ela tambem deve valer
fora do Admin. Se a resposta for sim, provavelmente a regra pertence ao model,
form ou servico de dominio.

### 6.4. `get_form()` dinamico

Exemplo em `HorarioCampusAdmin`, `edu/admin.py:387-390`:

```python
def get_form(self, request, *args, **kwargs):
    form = super().get_form(request, *args, **kwargs)
    form.base_fields['uo'].queryset = UnidadeOrganizacional.objects.campi()
    return form
```

O metodo restringe as opcoes do campo `uo`. Alteracoes em `base_fields` afetam
a classe retornada; em formularios comuns, costuma ser mais seguro personalizar
`self.fields` no `__init__()` da instancia.

### 6.5. Desempenho no Admin

Uma listagem pode parecer simples e ainda executar dezenas de consultas. Isso
acontece porque cada item de `list_display` e avaliado para cada objeto da
pagina.

#### 6.5.1. N+1 com `ForeignKey`: exemplo de `TurmaAdmin`

O `TurmaAdmin` apresenta o campus por meio do metodo em
`edu/admin.py:941-943`:

```python
def get_campus(self, obj):
    return obj.curso_campus.diretoria.setor.uo
```

Esse acesso atravessa quatro relacionamentos. Sem otimizacao, o fluxo pode ser:

```text
1 consulta para buscar as turmas
+ consultas para curso_campus de cada turma
+ consultas para diretoria de cada curso
+ consultas para setor de cada diretoria
+ consultas para uo de cada setor
```

Para uma pagina com 15 turmas, o limite teorico desse trecho seria uma
consulta principal mais ate 60 consultas relacionadas. O numero observado pode
variar por cache, filtros e outros componentes do Admin, mas cresce conforme a
quantidade de linhas: esse e o padrao N+1.

O codigo real evita esse problema em `edu/admin.py:972-977`:

```python
def get_queryset(self, request):
    if request.user.has_group_cached('Diretor Acadêmico'):
        manager = Turma.objects
    else:
        manager = Turma.locals
    return super().get_queryset(request, manager).select_related(
        'curso_campus__diretoria__setor__uo'
    )
```

`select_related()` cria `JOIN`s SQL e carrega os objetos de `ForeignKey` na
mesma consulta das turmas:

| Versao isolada | Consultas para listar e acessar o campus de N turmas |
|---|---:|
| sem `select_related()` | `1 + ate 4 x N` |
| com `select_related()` | `1` para esse conjunto de dados |

Ele e indicado para relacionamentos de objeto unico, especialmente
`ForeignKey` e `OneToOneField`.

#### 6.5.2. `.count()` por linha: um segundo N+1

O mesmo `TurmaAdmin` possui duas colunas calculadas em
`edu/admin.py:949-957`:

```python
def get_qtd_diarios(self, obj):
    return obj.diario_set.order_by(
        'componente_curricular__componente'
    ).count()

def get_qtd_alunos(self, obj):
    return obj.get_alunos_matriculados().count()
```

Cada chamada a `.count()` normalmente produz um `SELECT COUNT(...)`. Como os
metodos sao chamados uma vez para cada turma, uma pagina de 15 registros pode
acrescentar aproximadamente 30 consultas apenas para essas duas colunas.

O `select_related()` existente nao resolve esse caso, pois diarios e alunos
sao colecoes. As alternativas principais sao:

- `annotate(Count(...))`, quando basta exibir a quantidade;
- `prefetch_related()`, quando os proprios objetos relacionados serao usados;
- retirar uma coluna cara, quando ela nao for essencial para a listagem.

Um exemplo menor e ainda mais direto aparece em `AulaCampoAdmin`,
`edu/admin.py:2875-2883`:

```python
def get_qtd_servidores_participantes(self, obj):
    return obj.responsaveis.count()

def get_qtd_alunos_participantes(self, obj):
    return obj.alunos.count()
```

Uma forma de otimizar esse caso com anotacoes seria:

```python
from django.db.models import Count

def get_queryset(self, request):
    return (
        super().get_queryset(request, AulaCampo.locals)
        .annotate(
            qtd_responsaveis=Count('responsaveis', distinct=True),
            qtd_alunos=Count('alunos', distinct=True),
        )
    )

def get_qtd_servidores_participantes(self, obj):
    return obj.qtd_responsaveis

def get_qtd_alunos_participantes(self, obj):
    return obj.qtd_alunos
```

Esse trecho e uma **proposta didatica de otimizacao**, nao o estado atual do
arquivo. O uso de `distinct=True` evita multiplicacao das contagens quando as
duas relacoes muitos-para-muitos participam do mesmo `JOIN`.

#### 6.5.3. Como comparar os resultados

Com o Django Debug Toolbar habilitado no ambiente de desenvolvimento:

1. Abra `/admin/edu/turma/` e filtre uma pagina pequena e repetivel.
2. Anote a quantidade de consultas e localize as repetidas.
3. Remova temporariamente o `select_related()` apenas para demonstracao.
4. Recarregue a mesma pagina e compare as consultas de curso, diretoria, setor
   e campus.
5. Restaure o codigo original.
6. Identifique separadamente os `COUNT` gerados por `get_qtd_diarios()` e
   `get_qtd_alunos()`.

Os totais completos do Admin incluem consultas de permissao, filtros,
paginacao e contagem geral. A comparacao deve procurar principalmente o padrao
de SQL repetido para cada linha, e nao apenas um numero absoluto.

Checklist para uma listagem:

- cada coluna acessa quais relacionamentos?
- ha `select_related()` para ForeignKey e OneToOne?
- ha `prefetch_related()` para colecoes?
- algum metodo executa `.count()` ou `.exists()` para cada linha?
- busca e filtros usam campos adequados e indexados?
- a exportacao usa o mesmo queryset e pode processar muitos registros?
- `list_per_page` esta compativel com o custo de cada linha?

O Admin mascara facilmente um N+1: uma pagina com 15 linhas pode executar
dezenas de consultas sem que o problema seja visualmente obvio.

<a id="etapa-7"></a>

## Etapa 7 — Práticas de estudo

### 7.1. Ler um admin pequeno de ponta a ponta

**Objetivo:** compreender o fluxo sem a complexidade de `AlunoAdmin`.

1. Abrir `/admin/edu/turno/`.
2. Abrir `edu/models/cadastros_gerais.py:345-363`.
3. Identificar campo, `Meta`, `__str__()` e `get_absolute_url()`.
4. Abrir `edu/admin.py:320-327`.
5. Relacionar cada atributo com a tela.
6. Mostrar `admin.site.register(Turno, TurnoAdmin)`.
7. Realizar uma busca por descricao.
8. Observar a ordenacao e o botao de exportacao.
9. Abrir `/admin/edu/turno/<pk>/change/` sem salvar alteracoes.

Perguntas para os estudantes:

- de onde vieram os campos do formulario?
- por que a URL nao esta em `edu/urls.py`?
- qual parte cria a caixa de pesquisa?
- qual recurso pertence ao SUAP e nao ao Django?

### 7.2. Adicionar e-mail a listagem de alunos

**Objetivo:** criar uma coluna calculada sem alterar o model.

**Arquivo:** `edu/admin.py`  
**Classe:** `AlunoAdmin`, iniciada na linha `1601`  
**Linhas originais afetadas:** `1602` e apos `1631`  
**URL de teste:** `/admin/edu/aluno/`

#### 7.2.1. Passo 1 - Alterar `list_display`

Na linha `1602`, substitua a declaracao atual:

```python
list_display = (
    'get_foto', 'get_info_principal', 'periodo_letivo',
    'ano_letivo', 'get_pasta',
)
```

pela versao com `get_email`:

```python
list_display = (
    'get_foto',
    'get_info_principal',
    'get_email',
    'periodo_letivo',
    'ano_letivo',
    'get_pasta',
)
```

O nome informado em `list_display` deve corresponder a um campo do model ou a
um metodo acessivel no Admin/model.

#### 7.2.2. Passo 2 - Criar a coluna

Logo depois de `get_foto.short_description = 'Foto'`, atualmente na linha
`1631`, insira:

```python
def get_email(self, obj):
    return obj.pessoa_fisica.email or '-'


get_email.short_description = 'E-mail Academico'
get_email.admin_order_field = 'pessoa_fisica__email'
```

Leitura do codigo:

- `obj` e o aluno da linha atual;
- `or '-'` evita uma celula vazia;
- `short_description` define o cabecalho;
- `admin_order_field` permite ordenar usando o campo relacionado real.

Por que esse exemplo nao cria N+1 adicional?

```python
.select_related('ano_letivo', 'pessoa_fisica', 'situacao')
```

O relacionamento `pessoa_fisica` ja e carregado antecipadamente por
`get_queryset()`.

#### 7.2.3. Resultado esperado e validacao

1. Recarregue `/admin/edu/aluno/`.
2. Confirmar o cabecalho da coluna.
3. Verificar aluno com e sem e-mail.
4. Clicar no cabecalho e verificar a ordenacao.
5. Conferir se busca, filtros e tabs continuam funcionando.

O resultado esperado e uma coluna `E-mail Academico` entre as informacoes
principais e o periodo letivo, mostrando `-` quando nao houver valor.

#### 7.2.4. Como desfazer

1. Remova `'get_email'` de `list_display`.
2. Exclua o metodo `get_email()` e suas duas configuracoes.
3. Recarregue `/admin/edu/aluno/` e confirme que a listagem voltou ao formato
   original.

Essa demonstracao nao altera model, migration nem dados do banco.

### 7.3. Adicionar e remover um filtro

**Objetivo:** compreender que `list_filter` controla interface e consulta, nao
permissao.

**Arquivo:** `edu/admin.py`  
**Classe:** `AlunoAdmin`  
**Linha original afetada:** `1603`  
**URL de teste:** `/admin/edu/aluno/`

O campo usado na demonstracao existe em `edu/models/alunos.py:377`:

```python
data_matricula = models.DateTimeFieldPlus(
    verbose_name='Data da Matrícula',
    auto_now_add=True,
)
```

#### 7.3.1. Passo 1 - Adicionar o filtro

Substitua a tupla de `list_filter` da linha `1603` pela versao formatada
abaixo, acrescentando `data_matricula`:

```python
list_filter = (
    CustomTabListFilter,
    'ano_letivo',
    'periodo_letivo',
    'situacao',
    'data_matricula',
    'curso_campus__diretoria__setor__uo',
    'curso_campus',
    'polo',
    'curso_campus__modalidade',
)
```

Ao recarregar a tela, o Django reconhece o campo de data e oferece atalhos de
periodo. Selecione uma opcao e observe a query string adicionada a URL. O
resultado esperado e a listagem conter somente alunos cuja data de matricula
atenda ao periodo escolhido.

#### 7.3.2. Passo 2 - Remover o filtro temporariamente

Na mesma tupla, remova temporariamente:

```python
'polo',
```

Recarregue `/admin/edu/aluno/`. O filtro de polo deve desaparecer, enquanto o
campo do model, os polos gravados e as permissoes permanecem inalterados.
Remover o controle visual nao e uma regra de autorizacao; o escopo continua
sendo definido no backend.

#### 7.3.3. Resultado esperado e validacao

1. `Data da Matricula` aparece entre os filtros.
2. A escolha de periodo altera os resultados e a query string.
3. `Polo` deixa de aparecer depois da remocao.
4. Busca, tabs e paginacao continuam funcionando em conjunto com o novo
   filtro.

#### 7.3.4. Como desfazer

Restaure exatamente a declaracao original de `edu/admin.py:1603`:

```python
list_filter = (
    CustomTabListFilter,
    'ano_letivo',
    'periodo_letivo',
    'situacao',
    'curso_campus__diretoria__setor__uo',
    'curso_campus',
    'polo',
    'curso_campus__modalidade',
)
```

Antes de manter a mudanca, avaliar:

- o filtro e realmente usado?
- sua consulta e adequada ao volume da tabela?
- a remocao prejudica algum fluxo operacional?
- existe teste ou documentacao que dependa dele?

### 7.4. Criar uma tab simples

**Objetivo:** praticar recurso exclusivo do `ModelAdminPlus`.

**Arquivo:** `edu/admin.py`  
**Classe:** `AlunoAdmin`  
**Linhas originais afetadas:** inserir apos `1646` e alterar `1648-1649`  
**URL de teste:** `/admin/edu/aluno/?tab=tab_sem_email_academico`

`Q` ja esta importado em `edu/admin.py:3`; portanto, esta pratica nao exige
novo import.

#### 7.4.1. Passo 1 - Criar o metodo da tab

Depois de `tab_integralizados.short_description = 'Migrados'`, atualmente na
linha `1646`, insira:

```python
def tab_sem_email_academico(self, request, queryset):
    return queryset.filter(
        Q(pessoa_fisica__email__isnull=True)
        | Q(pessoa_fisica__email='')
    )


tab_sem_email_academico.short_description = 'Sem E-mail Academico'
```

O metodo recebe o queryset ja limitado por `AlunoAdmin.get_queryset()` e
devolve uma versao mais restrita. As duas condicoes contemplam bancos que
representem ausencia como `NULL` ou string vazia.

#### 7.4.2. Passo 2 - Registrar a tab

Substitua `get_tabs()`, atualmente nas linhas `1648-1649`, por:

```python
def get_tabs(self, request):
    return [
        'tab_suap',
        'tab_q_academico',
        'tab_integralizados',
        'tab_sem_email_academico',
    ]
```

`CustomTabListFilter` ja esta na primeira posicao de `list_filter`, na linha
`1603`. Ele usa os nomes devolvidos por `get_tabs()` para construir as opcoes e
chamar o metodo correspondente.

#### 7.4.3. Resultado esperado e validacao

1. Recarregue `/admin/edu/aluno/`.
2. Localize a nova tab `Sem E-mail Academico`.
3. Clique nela e confirme `tab=tab_sem_email_academico` na URL.
4. Verifique alguns resultados: todos devem possuir e-mail nulo ou vazio.
5. Combine a tab com ano letivo ou situacao e confirme que os filtros atuam
   sobre o mesmo queryset.
6. Acesse diretamente
   `/admin/edu/aluno/?tab=tab_sem_email_academico` para repetir o teste.

#### 7.4.4. Como desfazer

1. Remova `tab_sem_email_academico()` e seu `short_description`.
2. Restaure o metodo original:

```python
def get_tabs(self, request):
    return ['tab_suap', 'tab_q_academico', 'tab_integralizados']
```

3. Recarregue a listagem e confirme que a tab deixou de existir.

Essa pratica altera somente a composicao do queryset; nenhum aluno e salvo ou
modificado.

### 7.5. Analisar uma permissao contextual

Sem alterar o codigo:

1. Abrir `edu/admin.py:1617-1623`.
2. Identificar a permissao `edu.change_aluno`.
3. Identificar a excecao para **Auxiliar de Secretaria Academica**.
4. Abrir `AlunoAdmin.get_queryset()` nas linhas `1625-1626`.
5. Explicar por que poder editar e poder enxergar todos os registros sao regras
   diferentes.
6. Comparar `Aluno.locals` com `Aluno.objects`.
7. Tentar narrar o que aconteceria com listagem e exportacao se o manager fosse
   trocado sem analise.

<a id="etapa-8"></a>

## Etapa 8 — Testes e fechamento

### 8.1. Testes existentes para observar

O arquivo `edu/tests.py` ja acessa telas administrativas reais.

Listagem, `edu/tests.py:1246-1249`:

```python
url = '/admin/edu/aluno/'
response = self.client.get(url)
self.assertContains(
    response,
    aluno.pessoa_fisica.nome,
    status_code=200,
)
```

Edicao, `edu/tests.py:3662-3668`:

```python
url = f'/admin/edu/aluno/{aluno.pk}/change/'
response = self.client.get(url)
self.assertContains(response, 'Editar ', status_code=200)
```

Para uma alteracao de coluna ou filtro, testes focados podem verificar:

- status HTTP para usuario autorizado;
- bloqueio para usuario sem permissao;
- presenca do cabecalho ou valor esperado;
- funcionamento da busca;
- resultado de um filtro ou tab;
- quantidade de consultas quando houver risco de N+1.

### 8.2. Testes especificos de Admin com usuarios autorizados e nao autorizados

Um teste do Admin nao deve confirmar apenas que a pagina abriu. Ele deve provar
que cada perfil consegue executar somente as operacoes e visualizar somente os
registros previstos pela regra de negocio.

Ha duas perguntas diferentes:

1. **Permissao:** o usuario pode acessar a operacao administrativa?
2. **Escopo:** entre os objetos do model, quais ele pode visualizar ou alterar?

Um usuario pode possuir `edu.view_aluno` e, ainda assim, enxergar apenas alunos
de determinado polo ou unidade. Por isso, testar somente `has_perm()` nao testa
completamente o comportamento de `get_queryset()`.

#### 8.2.1. Ferramentas usadas nos testes do SUAP

Os testes do SUAP usam a infraestrutura do Django e a classe
`SuapTestCase`, definida em `comum/tests/tests_base.py:73-81`:

```python
@override_settings(DEBUG=True)
class SuapTestCase(TestCase):
    """
    Classe base para os testes do SUAP, que ja executa o sync_permissions e
    cria objetos basicos.
    """

    fixtures = ['initial_data']
```

Ela herda de `django.test.TestCase`, carrega os dados iniciais e prepara as
permissoes e objetos basicos do projeto. Cada teste continua isolado: alteracoes
feitas no banco durante um metodo de teste nao devem permanecer no metodo
seguinte.

O cliente utilizado e `SuapClient`, em
`comum/tests/tests_base.py:36-60`. Alem do comportamento de
`django.test.Client`, ele aceita o usuario diretamente:

```python
self.client.login(user=usuario)
response = self.client.get('/admin/edu/aluno/')
```

O cliente simula requisicoes HTTP sem abrir um navegador. Assim, o teste passa
por URL, `AdminSite`, permissoes, `ModelAdmin`, `ChangeList`, template e resposta.

#### 8.2.2. Exemplo real existente no SUAP

O teste de Chaves apresenta o padrao mais direto em
`chaves/tests/tests.py:16-36`:

```python
class UrlsTest(SuapTestCase):
    def setUp(self):
        super().setUp()
        self.client.login(
            username=self.servidor_a.user.username,
            password='123',
        )
        self.grupo = Group.objects.get(name='Operador de Chaves')

    def test_get_chaves(self):
        # O usuario esta autenticado, mas ainda nao pertence ao grupo.
        response = self.client.get('/admin/chaves/chave/')
        self.assertEqual(response.status_code, 403)

        # O mesmo usuario passa a receber as permissoes do grupo.
        self.servidor_a.user.groups.add(self.grupo)
        response = self.client.get('/admin/chaves/chave/')
        self.assertEqual(response.status_code, 200)
```

O valor didatico desse teste esta em manter o usuario e a URL iguais. A unica
mudanca e sua participacao no grupo; portanto, a diferenca entre `403` e `200`
e atribuida a autorizacao.

> O nome segue o padrão `test_*` do Django, portanto o método é descoberto e executado automaticamente.

#### 8.2.3. Respostas esperadas

| Situacao | Resultado comum | O que testar |
|---|---|---|
| Usuario anonimo | `302` para o login | `Location` contem o destino de login e `next` |
| Usuario autenticado sem `view` nem `change` | `403` | a listagem permanece bloqueada |
| Usuario com `view` | `200` | a listagem e o queryset correto sao apresentados |
| Usuario com `view`, mas sem `change` | tela de consulta ou bloqueio da alteracao | nao pode salvar mudancas |
| Usuario com `change` | `200` no formulario e, em geral, `302` apos POST valido | o objeto foi efetivamente alterado |
| Usuario sem `delete` | `403` ou ausencia da operacao | o objeto continua no banco |

O comportamento da tela de edicao merece atencao: nas versoes atuais do Django,
um usuario com permissao de visualizacao pode receber `200` numa pagina de
detalhes somente para leitura. Portanto, **`GET 200` nao prova que ele pode
alterar o objeto**. O teste de seguranca deve fazer um `POST` e conferir que o
banco permaneceu inalterado.

Tambem nao use `follow=True` no primeiro teste de acesso anonimo. Seguir o
redirecionamento pode transformar o `302` original em um `200` da pagina de
login e esconder o comportamento que se desejava verificar.

#### 8.2.4. Teste focado da listagem de alunos

O exemplo abaixo pode ser acrescentado ao final de `edu/tests.py`. Ele usa os
usuarios basicos de `SuapTestCase` e a configuracao real de grupos criada pelo
`sync_permissions`.

```python
from django.contrib.auth.models import Group
from django.urls import reverse

from comum.tests import SuapTestCase


class AlunoAdminPermissionTest(SuapTestCase):
    def setUp(self):
        super().setUp()

        # reverse() evita repetir manualmente /admin/edu/aluno/.
        self.url = reverse('admin:edu_aluno_changelist')

        self.usuario_autorizado = self.servidor_a.user
        self.usuario_nao_autorizado = self.servidor_b.user

        # O grupo recebe as permissoes definidas em edu/permissions.yaml.
        grupo = Group.objects.get(name='Administrador Acadêmico')
        self.usuario_autorizado.groups.add(grupo)

        # Remove permissoes que poderiam vir da fixture e garante que o segundo
        # usuario continue autenticavel, mas sem acesso ao model Aluno.
        self.usuario_nao_autorizado.groups.clear()
        self.usuario_nao_autorizado.user_permissions.clear()
        self.usuario_nao_autorizado.is_superuser = False
        self.usuario_nao_autorizado.is_staff = True
        self.usuario_nao_autorizado.save()

    def test_usuario_anonimo_e_redirecionado_para_login(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertIn('next=', response['Location'])

    def test_usuario_sem_permissao_recebe_403(self):
        self.client.login(user=self.usuario_nao_autorizado)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 403)

    def test_usuario_autorizado_acessa_a_listagem(self):
        self.client.login(user=self.usuario_autorizado)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.context_data['cl'])
```

O grupo e sua permissao sobre `Aluno` podem ser conferidos em
`edu/permissions.yaml:1-6` e `edu/permissions.yaml:46-57`. A verificacao chega
a `ModelAdminPlus.has_view_permission()`, em
`djtools/contrib/admin/options/__init__.py:295-305`, que delega para
`djtools.utils.has_view_permission()`. Esta funcao, em
`djtools/utils/__init__.py:1928-1949`, aceita `view` ou `change` para a
visualizacao do model.

#### 8.2.5. Versao mais curta usando permissoes diretamente

Quando o objetivo do teste e exclusivamente o comportamento de uma permissao,
e nao a composicao de um grupo do `permissions.yaml`, pode-se atribuir a
permissao diretamente:

```python
from django.contrib.auth.models import Permission


permissao = Permission.objects.get(
    content_type__app_label='edu',
    codename='view_aluno',
)
usuario.user_permissions.add(permissao)
```

Escolha a estrategia conforme o que esta sendo testado:

| Objetivo | Preparacao recomendada |
|---|---|
| Provar que o grupo configurado no YAML funciona | adicionar o usuario ao `Group` |
| Provar o comportamento de `view_aluno` isoladamente | adicionar `Permission` diretamente |
| Provar uma regra contextual do Admin | preparar grupo, objeto e contexto exigidos pela regra |

Depois de consultar permissoes, o Django pode guarda-las em cache na instancia
do usuario. Se o teste adicionar ou remover permissoes **depois** de uma chamada
a `has_perm()`, recarregue o usuario do banco ou limpe os caches antes da nova
verificacao:

```python
usuario.refresh_from_db()
for atributo in ('_perm_cache', '_user_perm_cache', '_group_perm_cache'):
    usuario.__dict__.pop(atributo, None)
```

Uma alternativa ainda mais clara e usar um usuario diferente para cada cenario.

#### 8.2.6. Testar permissao de visualizacao e alteracao separadamente

Os codenames `view_aluno` e `change_aluno` representam capacidades diferentes.
Um teste unitario dos hooks pode usar a instancia de Admin registrada no site:

```python
from django.contrib import admin
from django.test import RequestFactory

from edu.models import Aluno


model_admin = admin.site._registry[Aluno]
request = RequestFactory().get('/admin/edu/aluno/')
request.user = usuario

self.assertTrue(model_admin.has_view_permission(request))
self.assertFalse(model_admin.has_change_permission(request, aluno))
```

Esse teste e rapido e identifica qual hook negou a operacao. Entretanto, ele nao
substitui o teste HTTP, pois nao percorre `AdminSite.admin_view()`, URL, template
e resposta.

Para proteger a edicao, acrescente um teste de `POST` no contexto em que o aluno
de teste ja foi criado:

```python
url = reverse('admin:edu_aluno_change', args=[aluno.pk])
valor_original = aluno.numero_pasta

self.client.login(user=usuario_apenas_visualizacao)
response = self.client.post(url, {'numero_pasta': '999999'})

self.assertEqual(response.status_code, 403)
aluno.refresh_from_db()
self.assertEqual(aluno.numero_pasta, valor_original)
```

O dicionario de um `POST` autorizado precisa conter todos os campos obrigatorios
do `AlunoForm`; o trecho reduzido acima e intencionalmente usado para o cenario
negado, no qual a verificacao de permissao deve ocorrer antes da validacao do
formulario.

#### 8.2.7. Testar escopo pelo queryset, nao apenas pelo HTML

Para regras baseadas em `objects`, `locals`, campus, polo ou diretoria, crie dois
registros:

- um aluno dentro do escopo do usuario;
- outro aluno fora do escopo.

Depois do `GET`, inspecione o `ChangeList` devolvido no contexto:

```python
response = self.client.get(reverse('admin:edu_aluno_changelist'))
self.assertEqual(response.status_code, 200)

cl = response.context_data['cl']
ids_visiveis = set(cl.queryset.values_list('pk', flat=True))

self.assertIn(aluno_do_escopo.pk, ids_visiveis)
self.assertNotIn(aluno_de_outro_escopo.pk, ids_visiveis)
```

Comparar chaves primarias e mais confiavel do que procurar nomes no HTML: nomes
podem se repetir, aparecer em filtros ou estar fora da pagina atual. O uso de
`cl.queryset` tambem evita que `list_per_page` esconda um objeto que pertence ao
resultado, mas caiu em outra pagina.

No `AlunoAdmin`, o conjunto inicial e definido em `edu/admin.py:1625-1626` a
partir de `Aluno.locals`. O manager esta declarado em
`edu/models/alunos.py:250-258` e implementado em
`edu/managers.py:671-682`. Atualmente, ele restringe especialmente o perfil
`Coordenador de Polo EAD` quando essa e sua unica origem de `view_aluno`.

#### 8.2.8. Matriz minima recomendada

Para uma alteracao relevante em um Admin, cubra pelo menos:

| Teste | Garantia |
|---|---|
| anonimo acessa a URL | autenticacao continua obrigatoria |
| autenticado sem permissao acessa a URL | autorizacao esta no backend |
| usuario com `view` abre a listagem | permissao positiva funciona |
| usuario com `view` consulta somente seu escopo | `get_queryset()` nao vaza dados |
| usuario sem `change` envia `POST` direto | esconder botoes nao permite contornar a regra |
| usuario com `change` envia formulario valido | fluxo autorizado continua funcionando |
| usuario sem `delete` tenta excluir | registro permanece no banco |

Sempre confira o estado final do banco nos testes de escrita. O status HTTP
sozinho nao prova que o objeto foi ou nao foi alterado.

#### 8.2.9. Execucao focada

Para executar somente a classe didatica adicionada a `edu/tests.py`:

```bash
python manage.py test edu.tests.AlunoAdminPermissionTest --keepdb
```

Durante a investigacao de um erro, um metodo pode ser executado isoladamente:

```bash
python manage.py test \
    edu.tests.AlunoAdminPermissionTest.test_usuario_sem_permissao_recebe_403 \
    --keepdb
```

`--keepdb` reaproveita o banco de teste entre execucoes e reduz o tempo de
preparacao. Ele nao deve ser usado para esconder dependencia indevida entre
testes: cada metodo ainda precisa preparar explicitamente seu proprio cenario.

> **Resumo didatico:** teste o mesmo endpoint com perfis diferentes, valide
> permissao e escopo separadamente e, nas operacoes de escrita, confirme o valor
> persistido. Uma interface sem botao nao e uma barreira de seguranca; o `POST`
> direto tambem precisa ser recusado.

### 8.3. Checklist de revisao

Antes de concluir uma alteracao em `admin.py`, verificar:

- o model correto foi registrado uma unica vez?
- a mudanca usa `ModelAdminPlus` quando o modulo segue esse padrao?
- campos de `list_display`, `search_fields` e `list_filter` existem?
- caminhos com `__` atravessam relacionamentos validos?
- o queryset preserva o escopo de `locals` quando necessario?
- permissoes foram verificadas no backend?
- colunas calculadas evitam HTML inseguro?
- relacionamentos usados nas colunas foram otimizados?
- actions validam estado e permissao dos objetos?
- `super()` foi chamado nos hooks que dependem do comportamento padrao?
- inclusao e edicao foram testadas separadamente?
- busca, filtros, tabs, paginacao e exportacao continuam funcionando?
- a alteracao foi testada com usuario autorizado e nao autorizado?

Comandos iniciais de verificacao:

```bash
python manage.py check
python manage.py test edu
```

O teste completo do EDU pode ser demorado. Durante o desenvolvimento, execute o
teste mais especifico disponivel e, antes da entrega, amplie a validacao de
acordo com o impacto da mudanca.

### 8.4. Erros comuns

1. Usar `objects` e ampliar dados que deveriam ser locais.
2. Ocultar um botao sem proteger a operacao no backend.
3. Criar uma coluna que consulta o banco para cada linha.
4. Colocar regra de dominio apenas em `save_model()`.
5. Esquecer `super()` em `get_queryset()`, `get_form()` ou `save_model()`.
6. Inserir HTML com `mark_safe()` usando texto nao confiavel.
7. Adicionar muitos filtros relacionais em uma tabela grande.
8. Usar action em lote sem validar objetos em estados diferentes.
9. Confundir `Aluno.pk` com a matricula na URL administrativa.
10. Alterar templates globais quando a necessidade pertence a um unico admin.

### 8.5. Quadro de responsabilidades

| Necessidade | Local preferencial |
|---|---|
| Estrutura e relacionamento dos dados | `models.py` |
| Validacao de entrada da tela | `forms.py` |
| Regra valida em qualquer interface | model ou servico de dominio |
| Colunas, filtros e ordenacao administrativa | `admin.py` |
| Restricao dos registros listados | manager e `get_queryset()` |
| Autorizacao administrativa | permissoes e `has_*_permission()` |
| Processo web especifico | `urls.py`, `views.py` e template proprio |
| Aparencia global do Admin SUAP | templates e recursos do DJTools |

### 8.6. Fechamento conceitual

Ao final do encontro, o estudante deve conseguir explicar o seguinte fluxo:

```text
O model define a entidade.
admin.site.register() publica a entidade no AdminSite.
ModelAdminPlus configura listagem e formulario.
get_queryset() define o universo de dados permitido.
busca, filtros e tabs refinam esse universo.
permissoes decidem quais operacoes podem ser executadas.
o form valida os dados de inclusao ou edicao.
hooks coordenam comportamentos administrativos especificos.
o ORM consulta ou grava no banco.
```

Conclusao principal:

> O Django Admin acelera interfaces internas, mas continua sujeito as mesmas
> exigencias de seguranca, integridade, desempenho e separacao de
> responsabilidades do restante do sistema.

## D. Referencia rapida

### Atributos mais usados

```python
class ExemploAdmin(ModelAdminPlus):
    list_display = ('id', 'descricao')
    list_filter = ('ativo',)
    search_fields = ('descricao',)
    ordering = ('descricao',)
    list_per_page = 20
    list_display_icons = True
    export_to_xls = True
    form = ExemploForm
    fieldsets = ExemploForm.fieldsets
```

### Metodos mais usados

```python
def get_queryset(self, request):
    return super().get_queryset(request).select_related('relacao')


def has_change_permission(self, request, obj=None):
    return super().has_change_permission(request, obj)


def get_form(self, request, obj=None, **kwargs):
    return super().get_form(request, obj, **kwargs)


def save_model(self, request, obj, form, change):
    super().save_model(request, obj, form, change)
```

### Caminhos principais para consulta

- `edu/admin.py`
- `edu/forms.py`
- `edu/models/`
- `edu/permissions.yaml`
- `edu/tests.py`
- `djtools/contrib/admin/options/__init__.py`
- `djtools/contrib/admin/filters/__init__.py`
- `djtools/templates/adminutils/`
- `suap/urls.py`
