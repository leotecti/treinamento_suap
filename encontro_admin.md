# Encontro - Django Admin no SUAP

## A. Identificacao

**Publico-alvo:** novos desenvolvedores do SUAP  
**Duracao sugerida:** 2h30  
**Modulo principal:** `edu`  
**Estudos de caso:** `TurnoAdmin` e `AlunoAdmin`

> Embora o nome deste arquivo tenha sido mantido conforme o roteiro original,
> o conteudo deste encontro trata do **Django Admin** e de sua especializacao
> no SUAP por meio do `ModelAdminPlus`.

## B. Objetivos

Ao final do encontro, o estudante devera ser capaz de:

- explicar o papel do Django Admin e do `ModelAdmin`;
- localizar a rota geral, o registro do model e sua classe administrativa;
- reconhecer o padrao das URLs administrativas;
- diferenciar `ModelAdmin` de `ModelAdminPlus`;
- configurar colunas, links, busca, filtros, ordenacao e paginacao;
- reconhecer recursos exclusivos do DJTools/SUAP;
- decidir quando usar o formulario automatico ou um `ModelForm` personalizado.

## C. Roteiro sugerido

| Etapa | Conteudo | Tempo |
|---|---|---:|
| 1 | Conceito, componentes e CRUD administrativo | 25 min |
| 2 | URLs, fluxo interno e registro de models | 30 min |
| 3 | Exemplo simples com `TurnoAdmin` | 20 min |
| 4 | Configuracoes de listagem com `AlunoAdmin` | 55 min |
| 5 | Recursos do `ModelAdminPlus` | 15 min |
| 6 | Formulario automatico x `AlunoForm` e revisao | 25 min |

---

## Etapa 1 - Fundamentos

### 1. O que e o Django Admin

O **Django Admin** e uma aplicacao administrativa fornecida pelo proprio
Django. Ele usa os metadados dos models e as configuracoes de classes
`ModelAdmin` para gerar telas internas de consulta e manutencao de dados.

No SUAP analisado, a versao do framework esta declarada em
`requirements/base.txt:1-2`:

```text
# Core Django
Django==4.1.5
```

O Admin nao e o banco de dados e tambem nao substitui o model. Ele e uma
interface web que coordena:

```text
model + ModelAdmin + usuario/permissoes
                    |
                    v
       listagem, formularios e operacoes
```

Uma analogia util e pensar no model como a definicao da ficha de cadastro e no
`ModelAdmin` como a configuracao do balcao interno: quais campos aparecem,
quem pode operar, como pesquisar e como organizar os registros.

As classes centrais pertencem ao Django instalado, nao ao repositorio SUAP:

| Classe | Codigo do Django 4.1.5 | Papel |
|---|---|---|
| `AdminSite` | `django/contrib/admin/sites.py:39-318` | Registra models e publica as URLs gerais |
| `ModelAdmin` | `django/contrib/admin/options.py:612-715` | Configura e executa as telas de um model |
| `ChangeList` | `django/contrib/admin/views/main.py` | Processa a listagem, busca, filtros, ordem e paginacao |

O diretorio `django/` normalmente fica no ambiente Python (`site-packages`),
por isso nao aparece como pasta dentro do projeto SUAP.

### 1.1. O que e `ModelAdmin`

`ModelAdmin` e a classe que descreve **como um model sera administrado**. Uma
instancia dela recebe o model e o `AdminSite`, cria as URLs do cadastro e
coordena listagem, inclusao, edicao, exclusao, historico, actions e permissoes.

O metodo nativo `ModelAdmin.get_urls()`, em
`django/contrib/admin/options.py:681-709`, produz rotas equivalentes a:

```python
path('', wrap(self.changelist_view), ...)                 # listagem
path('add/', wrap(self.add_view), ...)                    # inclusao
path('<path:object_id>/history/', wrap(self.history_view), ...)
path('<path:object_id>/delete/', wrap(self.delete_view), ...)
path('<path:object_id>/change/', wrap(self.change_view), ...)
```

#### Exemplo real comentado linha a linha

**Arquivo:** `edu/admin.py`  
**Linhas:** `320-328`

```python
# Define a configuracao administrativa do model Turno.
class TurnoAdmin(ModelAdminPlus):
    # Exibe o identificador e a descricao como colunas da listagem.
    list_display = ('id', 'descricao')

    # Ordena inicialmente os registros pela descricao.
    ordering = ('descricao',)

    # Faz a caixa de busca pesquisar no campo descricao.
    search_fields = ('descricao',)

    # Nao acrescenta a coluna de icones criada pelo SUAP.
    list_display_icons = False

    # Habilita a exportacao da listagem para XLS.
    export_to_xls = True


# Associa o model Turno a configuracao TurnoAdmin no AdminSite padrao.
admin.site.register(Turno, TurnoAdmin)
```

O model correspondente esta em `edu/models/cadastros_gerais.py:345-363`.
Se `TurnoAdmin` herdasse diretamente de `admin.ModelAdmin`, as tres primeiras
opcoes continuariam funcionando; `list_display_icons` e `export_to_xls`,
entretanto, nao existiriam.

### 1.2. `ModelAdmin` x `ModelAdminPlus`

`ModelAdmin` e nativo do Django. `ModelAdminPlus` e implementado pelo DJTools,
a camada de ferramentas do SUAP, em
`djtools/contrib/admin/options/__init__.py:87-146`:

```python
class ModelAdminPlus(admin.ModelAdmin, metaclass=MetaModelAdminPlus):
    change_list_template = 'djtools/templates/adminutils/change_list.html'
    change_form_template = 'djtools/templates/adminutils/change_form.html'
    formfield_overrides = FORMFIELD_OVERRIDES

    list_display_icons = False
    export_to_xls = False
    export_to_sophia = False
    list_filter_autocomplete_form_filters = None
    avoid_short_search = True
    filters_ajax = True
```

A declaracao mostra que o SUAP **especializa**, mas nao substitui, o Admin:

- `admin.ModelAdmin` fornece o CRUD administrativo nativo;
- `MetaModelAdminPlus`, em `djtools/lps.py:44-64`, permite customizacoes LPS;
- os templates do DJTools adaptam a interface;
- novos atributos habilitam icones, exportacoes, tabs e filtros;
- metodos sobrescritos integram `ChangeListPlus`, request e transacoes.

| Recurso | `ModelAdmin` | `ModelAdminPlus` |
|---|---:|---:|
| Listagem, forms, permissoes e historico | Sim | Sim, por heranca |
| `list_display`, `search_fields`, `list_filter` | Sim | Sim, por heranca |
| Templates administrativos do SUAP | Nao | Sim |
| Coluna padrao de icones | Nao | `list_display_icons` |
| Exportacao XLS | Nao | `export_to_xls` |
| Exportacao Sophia desta instalacao | Nao | `export_to_sophia` |
| Filtros relacionados com autocomplete | Nao | Sim |
| Customizacao por LPS | Nao | `MetaModelAdminPlus` |

### 1.3. O que o Admin gera

| Recurso | O que acontece |
|---|---|
| Listagem | O `ChangeList` consulta o model e monta uma tabela paginada |
| Busca e filtros | Parametros GET sao convertidos em operacoes de `QuerySet` |
| Inclusao | Um `ModelForm` vazio e apresentado e salvo apos validacao |
| Edicao | O formulario recebe a instancia localizada pela chave primaria |
| Exclusao | Dependencias sao apresentadas antes da confirmacao |
| Historico | Alteracoes administrativas registradas podem ser consultadas |
| Actions | Uma operacao pode receber varios objetos selecionados |
| Permissoes | Cada fluxo verifica `view`, `add`, `change` ou `delete` |

As permissoes controlam a operacao, mas nao necessariamente o escopo dos
dados. No `AlunoAdmin`, por exemplo, o queryset e restringido com
`Aluno.locals` em `edu/admin.py:1625-1626`.

### 1.4. Django Admin x CRUD comum

CRUD significa criar, consultar, alterar e excluir. O Admin e um CRUD interno
gerado pelo framework; uma tela comum e construida pelo projeto para um fluxo
especifico.

| Aspecto | Django Admin | CRUD comum |
|---|---|---|
| URLs | Geradas por `AdminSite`/`ModelAdmin` | Declaradas em `urls.py` |
| View | Metodos do `ModelAdmin` | Funcao ou classe em `views.py` |
| Form | Inferido do model ou configurado | Escolhido explicitamente pela view |
| Template | Padrao administrativo | Proprio do caso de uso |
| Permissoes | Integracao com permissoes de model | Regra definida no fluxo |
| Publico | Equipe interna autorizada | Pode atender qualquer perfil |
| Melhor uso | Manutencao orientada a dados | Processos e experiencias especificas |

Use o Admin para cadastros internos e operacoes padronizadas. Prefira uma view
propria quando houver etapas, regras de negocio, PDF, API, interface para aluno
ou outro fluxo que nao se ajuste ao cadastro administrativo.

---

## Etapa 2 - URLs e registro

### 2. Onde nasce o prefixo `/admin/`

**Arquivo:** `suap/urls.py`  
**Linha:** `60`

```python
path('admin/', admin.site.urls),
```

- `'admin/'` e o prefixo reconhecido pelo resolvedor principal do Django;
- `admin.site` e a instancia padrao de `AdminSite`;
- `.urls` devolve as rotas administrativas construidas pelo `AdminSite`;
- uma unica linha inclui as URLs de todos os models registrados.

Por isso nao existe em `edu/urls.py` uma rota para cada cadastro do Admin.

#### 2.0.1. E possivel trocar o prefixo `/admin/`?

Sim. O texto informado no primeiro argumento de `path()` determina o prefixo
externo usado para acessar o Admin. Para trocar `/admin/` por `/gestao/`, por
exemplo, altere `suap/urls.py:60`:

```python
# Antes
path('admin/', admin.site.urls),

# Depois
path('gestao/', admin.site.urls),
```

Depois da alteracao, uma URL como:

```text
/admin/edu/aluno/
```

passa a ser acessada em:

```text
/gestao/edu/aluno/
```

Nesta instalacao, tambem existe uma rota explicita para o login administrativo
em `suap/urls.py:59`. Ela deve acompanhar o novo prefixo:

```python
urlpatterns += [
    path('accounts/logout/', views.logout_then_login),
    path('accounts/login/', comum_views.login),
    path('gestao/login/', comum_views.login),
    path('gestao/', admin.site.urls),
]
```

Os nomes usados pelo resolvedor reverso nao precisam ser alterados:

```python
reverse('admin:edu_aluno_changelist')
```

Nesse codigo, `admin` e o **namespace** do `AdminSite`, e nao o prefixo externo.
Depois da mudanca, o `reverse()` passa a produzir `/gestao/edu/aluno/`.

Antes de fazer a troca em uma instalacao existente, procure links escritos
diretamente com o prefixo antigo:

```bash
rg "['\"]\/admin\/" .
```

URLs construidas com `reverse()` ou com a tag `{% url %}` acompanham a nova
configuracao automaticamente. Links fixos como `href="/admin/..."`, testes e
integracoes externas precisam ser revisados manualmente.

> Trocar o prefixo pode atender a uma convencao de navegacao, mas nao substitui
> autenticacao e permissoes. Um endereco menos previsivel nao constitui uma
> barreira de seguranca.

### 2.1. O que e `admin.site.urls`

Ao acessar a propriedade `urls`, o Django chama `AdminSite.get_urls()`. Esse
metodo cria as rotas gerais e percorre o dicionario interno `_registry`, no
qual estao os pares `model -> ModelAdmin`.

Forma reduzida de `django/contrib/admin/sites.py:290-318`:

```python
for model, model_admin in self._registry.items():
    urlpatterns += [
        path(
            f'{model._meta.app_label}/{model._meta.model_name}/',
            include(model_admin.urls),
        )
    ]
```

### 2.2. Fluxo `admin.site.urls -> AdminSite -> ModelAdmin`

```text
GET /admin/edu/turno/
  -> suap/urls.py encontra o prefixo admin/
  -> AdminSite procura edu/turno em _registry
  -> encontra a instancia de TurnoAdmin
  -> TurnoAdmin.changelist_view(request)
  -> get_queryset(), busca, filtros, ordem e paginacao
  -> template administrativo
  -> HttpResponse
```

Antes de chamar as views, `AdminSite.admin_view()` protege o acesso
administrativo. A operacao concreta ainda consulta os metodos de permissao do
`ModelAdmin`, como `has_view_permission()` e `has_change_permission()`.

#### 2.2.1. Onde o Django cria as URLs e views do Admin

As URLs administrativas nao ficam declaradas em `edu/urls.py`, e suas views
nao ficam em `edu/views.py`. O Django as constroi dinamicamente a partir dos
models registrados:

1. `AdminSite.get_urls()`, em `django/contrib/admin/sites.py:290-318`, percorre
   o registro interno e cria `/admin/<app_label>/<model_name>/`;
2. `ModelAdmin.get_urls()`, em `django/contrib/admin/options.py:681-709`, cria
   as rotas de listagem, inclusao, edicao, exclusao e historico;
3. essas rotas apontam para metodos como `changelist_view()`, `add_view()`,
   `change_view()`, `delete_view()` e `history_view()`.

Assim, `/admin/edu/aluno/` executa `AlunoAdmin.changelist_view()`, enquanto
`/admin/edu/aluno/10/change/` executa `AlunoAdmin.change_view()` para a chave
primaria `10`. Como `AlunoAdmin` herda de `ModelAdminPlus`, o fluxo passa pelas
customizacoes de `djtools/contrib/admin/options/__init__.py` e depois pela
implementacao nativa de `ModelAdmin`.

O codigo instalado do Django pode ser localizado e consultado com:

```bash
python -c "import django.contrib.admin.sites as m; print(m.__file__)"
python -c "import django.contrib.admin.options as m; print(m.__file__)"
python manage.py show_urls | grep '/admin/edu/aluno'
```

Tambem e possivel abrir o shell e exibir a implementacao de um metodo:

```python
import inspect
from django.contrib.admin import ModelAdmin

print(inspect.getsource(ModelAdmin.get_urls))
print(inspect.getsource(ModelAdmin.changelist_view))
```

> O diretorio `django/` pertence ao pacote instalado no ambiente virtual ou no
> container. Ele nao e uma pasta do codigo-fonte do SUAP.

### 2.3. Padrao dos enderecos

| Operacao | Padrao |
|---|---|
| Listar | `/admin/<app_label>/<model_name>/` |
| Adicionar | `/admin/<app_label>/<model_name>/add/` |
| Editar | `/admin/<app_label>/<model_name>/<pk>/change/` |
| Excluir | `/admin/<app_label>/<model_name>/<pk>/delete/` |
| Historico | `/admin/<app_label>/<model_name>/<pk>/history/` |

Exemplos para demonstracao:

```text
/admin/edu/turno/
/admin/edu/turno/add/
/admin/edu/turno/3/change/
/admin/edu/aluno/
/admin/edu/aluno/95812/change/
```

`edu` e o `app_label`; `turno` e `aluno` sao os `model_name`; o numero e a
chave primaria, que pode ser diferente da matricula ou de outro codigo de
negocio.

### 2.4. Registro do model

O registro liga um model a uma configuracao administrativa:

```python
admin.site.register(Turno, TurnoAdmin)
```

No exemplo real, ele esta em `edu/admin.py:328`. O registro de `Aluno` esta em
`edu/admin.py:1870`:

```python
admin.site.register(Aluno, AlunoAdmin)
```

Durante a inicializacao, o Django importa os arquivos `admin.py` das
aplicacoes instaladas. `AdminSite.register()` instancia a classe de admin e
guarda a associacao em `_registry`.

Sem o registro:

- o model continua existindo no ORM e no banco;
- migrations, managers, forms e views continuam funcionando;
- ele nao aparece no indice do Admin;
- suas URLs administrativas nao sao criadas;
- acessar `/admin/edu/<model>/` resulta em rota inexistente.

O Django tambem aceita a forma equivalente com decorador:

```python
@admin.register(Turno)
class TurnoAdmin(ModelAdminPlus):
    ...
```

O EDU usa predominantemente a chamada explicita `admin.site.register()`.

### 2.5. O indice do Admin

O **indice do Admin** e a pagina inicial acessada em `/admin/`. Ele funciona
como um catalogo dos models registrados e das operacoes administrativas
disponiveis para o usuario atual.

```text
GET /admin/
  -> admin.site.urls
  -> AdminSite.index(request)
  -> AdminSite.get_app_list(request)
  -> template admin/index.html
```

O Django percorre o registro interno `AdminSite._registry`, agrupa os models
por `app_label` e consulta as permissoes de cada `ModelAdmin`. Assim, um model
so pode aparecer quando foi registrado e o usuario possui uma operacao
permitida, como visualizar, incluir ou alterar.

Exemplo do EDU, em `edu/admin.py:1870`:

```python
admin.site.register(Aluno, AlunoAdmin)
```

Esse registro permite ao `AdminSite` relacionar:

```text
aplicacao: edu
model:     aluno
admin:     AlunoAdmin
endereco:  /admin/edu/aluno/
```

As paginas nao devem ser confundidas:

| URL | Responsabilidade |
|---|---|
| `/admin/` | Indice geral das aplicacoes e models permitidos |
| `/admin/edu/` | Indice dos cadastros da aplicacao EDU |
| `/admin/edu/aluno/` | Listagem produzida por `AlunoAdmin` |

O conteudo padrao do indice vem de
`django/contrib/admin/templates/admin/index.html`, dentro do pacote Django
instalado. O SUAP personaliza a estrutura visual geral em
`comum/templates/admin/base.html` e `comum/templates/admin/base_site.html`.
Em `comum/templates/admin/base.html:152-156`, o menu principal do sistema e
renderizado com `{{ menu_as_html|safe }}`. Portanto, o indice nativo do Admin e
o menu principal do SUAP sao mecanismos relacionados, mas diferentes.

> Nao aparecer no indice nao e, isoladamente, uma regra de seguranca. Quando
> uma URL e acessada diretamente, a view administrativa volta a verificar
> `has_view_permission()`, `has_add_permission()`, `has_change_permission()` ou
> `has_delete_permission()`.

Os registros carregados podem ser consultados no shell:

```python
from django.contrib import admin

for model, model_admin in admin.site._registry.items():
    if model._meta.app_label == 'edu':
        print(model._meta.model_name, type(model_admin).__name__)
```

---

## Etapa 3 - Configuracoes essenciais

### 3. Visao geral

A configuracao deve tornar a listagem util sem expor dados indevidos nem criar
consultas excessivamente caras. O exemplo integrado sera `AlunoAdmin`, em
`edu/admin.py:1601-1615`:

```python
class AlunoAdmin(ModelAdminPlus):
    list_display = ('get_foto', 'get_info_principal', 'periodo_letivo',
                    'ano_letivo', 'get_pasta')
    list_filter = (CustomTabListFilter, 'ano_letivo', 'periodo_letivo',
                   'situacao', 'curso_campus__diretoria__setor__uo',
                   'curso_campus', 'polo', 'curso_campus__modalidade')
    list_filter_autocomplete_form_filters = {
        'curso_campus': [
            ('curso_campus__diretoria__setor__uo', 'diretoria__setor__uo')
        ]
    }
    list_display_icons = True
    export_to_xls = True
    export_to_sophia = True
    list_per_page = 15
    ordering = ('-id',)
    form = AlunoForm
    fieldsets = AlunoForm.fieldsets
    search_fields = ('pessoa_fisica__nome_registro',
                     'pessoa_fisica__search_fields_optimized',
                     'registroemissaodiploma__pasta', 'numero_pasta')
```

### 3.1. Tabela das configuracoes

| Opcao | Origem | Funcao | Exemplo no EDU |
|---|---|---|---|
| `list_display` | Django | Define as colunas | `edu/admin.py:1602` |
| `list_display_links` | Django | Escolhe colunas que abrem o objeto | Herdado/calculado pelo Admin |
| `list_filter` | Django | Cria filtros da listagem | `edu/admin.py:1603` |
| `search_fields` | Django | Define os campos da busca | `edu/admin.py:1615` |
| `ordering` | Django | Define a ordem inicial | `edu/admin.py:1611` |
| `list_per_page` | Django | Limita itens por pagina | `edu/admin.py:1610` |
| `fieldsets` | Django | Agrupa e ordena campos do form | `edu/admin.py:1613` |
| `get_queryset()` | Django, estendido pelo DJTools | Define o conjunto inicial e o escopo dos registros | `edu/admin.py:1625-1626` |
| `list_filter_autocomplete_form_filters` | DJTools | Encadeia filtros autocomplete | `edu/admin.py:1604-1606` |
| `list_display_icons` | DJTools | Adiciona icones de visualizar/editar | `edu/admin.py:1607` |
| `export_to_xls` | DJTools | Habilita exportacao XLS | `edu/admin.py:1608` |
| `export_to_sophia` | Customizacao IFG | Gera CSV no formato Sophia | `edu/admin.py:1609` |

### 3.2. `list_display`

Aceita campos do model e metodos calculados do model ou do admin. Cada nome se
torna uma coluna. Em `AlunoAdmin`, `periodo_letivo` e `ano_letivo` sao dados do
objeto; `get_foto`, `get_info_principal` e `get_pasta` sao metodos.

Exemplo real de coluna calculada em `edu/admin.py:1862-1868`:

```python
get_info_principal.short_description = 'Dados Principais'
get_info_principal.admin_order_field = 'pessoa_fisica__nome'

def get_pasta(self, obj):
    return obj.numero_pasta or '-'

get_pasta.short_description = 'Nº Pasta'
```

`short_description` define o cabecalho. `admin_order_field` informa ao Admin
qual campo do ORM deve ordenar uma coluna calculada.

### 3.3. `list_display_links`

Define quais colunas levam para a tela de edicao/visualizacao:

```python
list_display_links = ('descricao',)
```

Se nao for informado, o Django normalmente transforma a primeira coluna de
`list_display` em link. Quando `list_display_icons = True`, o
`ModelAdminPlus.get_list_display()`, em
`djtools/contrib/admin/options/__init__.py:208-220`, insere
`show_list_display_icons` no inicio e pode retirar os links quando o usuario
nao possui permissao.

### 3.4. `list_filter`

Define filtros estruturados. O Django escolhe a interface de acordo com o
tipo do campo; caminhos com `__` atravessam relacionamentos:

```python
list_filter = (
    'ano_letivo',
    'situacao',
    'curso_campus__diretoria__setor__uo',
)
```

Assim, o ultimo item percorre `Aluno -> CursoCampus -> Diretoria -> Setor ->
Unidade Organizacional`. No SUAP, `ChangeListPlus.get_filters()`, em
`djtools/contrib/admin/views/__init__.py:50-117`, detecta relacionamentos e
pode criar um filtro autocomplete com os valores permitidos pelo queryset.

### 3.5. `search_fields`

Define onde a caixa de texto procura. Dois sublinhados tambem atravessam
relacionamentos:

```python
search_fields = (
    'pessoa_fisica__nome_registro',
    'registroemissaodiploma__pasta',
    'numero_pasta',
)
```

Por padrao, o Django usa uma busca semelhante a `icontains`. Prefixos como
`^campo` e `=campo` alteram o lookup. O SUAP sobrescreve
`get_search_results()` em
`djtools/contrib/admin/options/__init__.py:261-293`: normaliza os termos e,
com `avoid_short_search = True`, pode ignorar termos muito curtos.

### 3.6. `ordering`

Define a ordem inicial da listagem:

```python
ordering = ('-id',)
```

O sinal `-` significa ordem decrescente. Em `/admin/edu/aluno/`, os maiores
IDs aparecem primeiro. Uma ordenacao escolhida pelo usuario no cabecalho tem
prioridade; depois vem `ModelAdmin.ordering`; sem ele, vale `Model.Meta.ordering`.

### 3.7. `list_per_page`

E o numero maximo de registros por pagina. `AlunoAdmin` usa `15`. Para uma
demonstracao temporaria em cadastro pequeno, poderia ser alterado para:

```python
list_per_page = 5
```

Isso nao e uma opcao diferente: e o mesmo atributo com outro valor. Ele reduz
os objetos renderizados por pagina, mas a consulta ainda pode realizar
contagens, joins e ordenacoes. Portanto, nao corrige sozinho problemas de
desempenho.

### 3.8. `list_filter_autocomplete_form_filters`

Este nome longo representa uma configuracao especifica do DJTools para criar
**dependencia entre filtros autocomplete**.

Em `AlunoAdmin`, `edu/admin.py:1604-1606`:

```python
list_filter_autocomplete_form_filters = {
    'curso_campus': [
        ('curso_campus__diretoria__setor__uo', 'diretoria__setor__uo')
    ]
}
```

Leitura didatica:

1. o filtro dependente e `curso_campus`;
2. o valor selecionado no filtro de unidade/diretoria e enviado ao
   autocomplete;
3. no queryset de cursos, esse valor corresponde a `diretoria__setor__uo`;
4. o autocomplete passa a oferecer cursos coerentes com a unidade escolhida.

A configuracao e lida em
`djtools/contrib/admin/filters/__init__.py:183-202`. Nas linhas `194-197`, o
filtro procura seu nome no dicionario e atribui os pares a `form_filters`.

### 3.9. `list_display_icons`

Recurso do `ModelAdminPlus`. Quando verdadeiro, acrescenta uma coluna com
icones de visualizar e editar conforme a permissao do usuario.

Implementacao:

- `djtools/contrib/admin/options/__init__.py:163-187`: monta os icones;
- `djtools/contrib/admin/options/__init__.py:208-220`: insere a coluna em
  `list_display`;
- `edu/admin.py:1607`: habilita o recurso para alunos.

Ele modifica a navegacao visual, mas nao concede permissao. Os metodos
`has_view_permission()` e `has_change_permission()` continuam sendo a fonte da
decisao.

### 3.10. `export_to_xls`

Recurso do DJTools. Em `AlunoAdmin`, `export_to_xls = True` habilita o botao.
O fluxo e:

```text
botao -> ?export_to_xls=1
      -> ModelAdminPlus.changelist_view()
      -> get_current_queryset() preserva busca e filtros
      -> tasks.admin_export('xls', ...)
      -> XlsResponse
```

Referencias:

- botao: `djtools/contrib/admin/options/__init__.py:327-334`;
- tratamento da requisicao: linhas `348-366`;
- reconstrucao do queryset atual: linhas `237-259`;
- tarefa e montagem das linhas: `djtools/tasks.py:48-89`.

Por padrao, as colunas exportadas sao `list_xls_display` ou `list_display`.
Um metodo `to_xls()` no admin pode substituir a montagem automatica.

### 3.11. `export_to_sophia`

Esta opcao foi acrescentada nesta instalacao para a Issue 1019 e nao pertence
ao Django. Em `edu/admin.py:1609`, ela habilita um CSV para o Sophia.

O botao e montado em
`djtools/contrib/admin/options/__init__.py:335-343`; a requisicao e desviada
nas linhas `367-373`; e `djtools/tasks.py:82-88` devolve `CsvResponse` com
codificacao `cp1252`, delimitador `|` e campos vazios no lugar de `None`.

### 3.12. `fieldsets`

Recurso nativo do Django que organiza os campos do formulario em grupos e
define sua ordem. Ele nao cria validacao nem campo de banco.

`AlunoAdmin` reutiliza a configuracao do form:

```python
fieldsets = AlunoForm.fieldsets
```

O valor esta em `edu/forms.py:252-287`, com secoes como `Identificacao`,
`Endereco`, `Contato` e `RG`. Exemplo reduzido:

```python
fieldsets = (
    ('Identificacao', {'fields': ('nome', 'nome_social', ('cpf', 'passaporte'))}),
    ('RG', {'fields': ('numero_rg', 'uf_emissao_rg',
                      'orgao_emissao_rg', 'data_emissao_rg')}),
)
```

Uma tupla interna, como `('cpf', 'passaporte')`, orienta o SUAP a apresentar
os campos juntos na mesma linha visual.

### 3.13. `get_queryset()` e escopo dos dados

#### 3.13.1. Conceito

Um `QuerySet` representa uma consulta do ORM. No Admin, `get_queryset()`
define o **conjunto inicial de objetos** sobre o qual serao aplicados busca,
filtros, ordenacao e paginacao.

```text
get_queryset(request)
    -> conjunto inicial permitido
    -> search_fields e termo pesquisado
    -> list_filter e filtros da URL
    -> ordering
    -> paginacao
    -> linhas exibidas
```

Na implementacao nativa, `ModelAdmin.get_queryset()` parte do manager padrao
do model. De forma simplificada:

```python
def get_queryset(self, request):
    qs = self.model._default_manager.get_queryset()
    ordering = self.get_ordering(request)
    if ordering:
        qs = qs.order_by(*ordering)
    return qs
```

O codigo pertence ao pacote instalado em
`django/contrib/admin/options.py:408-418` e e herdado por `ModelAdmin`.
Portanto, quando
uma classe de admin nao sobrescreve esse metodo, a listagem normalmente parte
de todos os registros fornecidos pelo manager padrao e aplica a ordenacao do
Admin.

O argumento `request` permite considerar o usuario autenticado, seus grupos,
campus ou outros dados da requisicao. Isso torna `get_queryset()` um ponto
central para definir **escopo de visualizacao**.

#### 3.13.2. Permissao nao e o mesmo que escopo

As duas verificacoes respondem perguntas diferentes:

| Mecanismo | Pergunta respondida |
|---|---|
| `has_view_permission()` | O usuario pode abrir este cadastro? |
| `get_queryset()` | Quais registros desse cadastro o usuario pode consultar? |

Um usuario pode possuir `edu.view_aluno` e, portanto, ter acesso ao cadastro,
mas ainda precisar visualizar somente os alunos do polo ou da unidade sob sua
responsabilidade.

Essa separacao evita dois erros comuns:

- retirar toda a tela de quem deveria consultar apenas um subconjunto;
- conceder acesso a todos os registros somente porque o usuario pode abrir o
  cadastro.

No Admin, o queryset tambem participa da localizacao do objeto nas telas de
edicao e exclusao. Por isso, restringi-lo ajuda a impedir que um objeto fora do
escopo seja encontrado apenas pela digitacao direta de sua URL. As permissoes
da operacao continuam necessarias; queryset e permissao devem atuar juntos.

#### 3.13.3. Extensao feita pelo `ModelAdminPlus`

O DJTools modifica a assinatura do metodo para aceitar opcionalmente outro
manager.

**Arquivo:** `djtools/contrib/admin/options/__init__.py`  
**Linhas:** `234-235`

```python
def get_queryset(self, request, manager=None, *args, **kwargs):
    return manager or super().get_queryset(request)
```

Leitura do codigo:

- sem `manager`, o metodo chama o `ModelAdmin` do Django;
- com `manager`, usa a fonte de consulta recebida;
- managers do Django encaminham chamadas como `filter()`, `exclude()` e
  `select_related()` para seu `QuerySet`;
- isso permite ao Admin escolher entre `Model.objects`, `Model.locals` ou
  outro manager especializado.

Essa possibilidade de passar o manager como segundo argumento e uma
customizacao do DJTools. Ela nao faz parte da assinatura padrao do
`ModelAdmin.get_queryset()` do Django.

#### 3.13.4. Exemplo principal: `AlunoAdmin`

**Arquivo:** `edu/admin.py`  
**Linhas:** `1625-1626`

```python
def get_queryset(self, request):
    return (
        super()
        .get_queryset(request, Aluno.locals)
        .exclude(turmaminicurso__gerar_matricula=False)
        .select_related('ano_letivo', 'pessoa_fisica', 'situacao')
    )
```

O codigo original esta em uma unica linha; acima ele foi apenas formatado para
facilitar a leitura. Cada etapa possui uma responsabilidade:

1. `super().get_queryset(request, Aluno.locals)` usa o manager local em vez do
   manager geral;
2. `exclude(turmaminicurso__gerar_matricula=False)` retira matriculas de
   minicurso configuradas para nao gerar matricula;
3. `select_related(...)` antecipa os relacionamentos usados pela listagem e
   reduz consultas repetidas ao banco;
4. o resultado ainda sera refinado pela busca, filtros, ordem e paginacao do
   `ChangeListPlus`.

O model declara seus managers em `edu/models/alunos.py:250-256`:

```python
# Manager geral do model.
objects = AlunoManager()

# Manager que pode aplicar restricoes relacionadas ao usuario atual.
locals = AlunoLocalManager()

# Outros recortes de negocio reutilizaveis.
com_matriz = AlunosComMatrizManager()
ativos = AlunosAtivosManager()
caracterizados = AlunosCaracterizadosManager()
nao_fic = AlunosNaoFICManager()
fic = AlunosFICManager()
```

`objects` e `locals` consultam a mesma tabela de alunos. A diferenca esta no
`QuerySet` que cada manager entrega.

#### 3.13.5. Como `Aluno.locals` calcula o escopo

`Aluno.locals` e uma instancia de `AlunoLocalManager`, implementada em
`edu/managers.py:671-682`:

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
                from edu.models import CoordenadorPolo

                ids = CoordenadorPolo.objects.filter(
                    funcionario=user.get_profile()
                ).values_list('polo__id')
                return qs.filter(polo__id__in=ids)

        return qs
```

O `tl.get_user()`, importado em `edu/managers.py:7`, recupera o usuario do
contexto local da requisicao. A regra atual funciona assim:

- parte do queryset geral com `super().get_queryset()`;
- verifica se o usuario pertence ao grupo `Coordenador de Polo EAD`;
- verifica a condicao especifica de possuir apenas uma associacao de grupo com
  a permissao `view_aluno`;
- descobre os polos coordenados pelo funcionario;
- devolve somente alunos cujos polos estejam nessa lista;
- quando a condicao nao se aplica, devolve o queryset sem esse recorte.

> O nome `locals` nao possui um comportamento universal no Django. Ele e uma
> convencao usada em models do SUAP, e cada classe de manager precisa ser lida
> para descobrir sua regra real. No caso atual de `AlunoLocalManager`, a
> restricao implementada e especifica para coordenadores de polo EAD.

#### 3.13.6. Segundo exemplo: escopo por unidade organizacional

`HorarioCampus` mostra um manager local com outra regra.

**Model:** `edu/models/cadastros_gerais.py:526-538`

```python
class HorarioCampus(LogModel):
    descricao = models.CharFieldPlus('Descrição')
    uo = models.ForeignKeyPlus(
        'rh.UnidadeOrganizacional',
        verbose_name='Campus',
        on_delete=models.CASCADE,
    )

    objects = models.Manager()
    locals = FiltroUnidadeOrganizacionalManager('uo')
```

**Admin:** `edu/admin.py:374-385`

```python
class HorarioCampusAdmin(ModelAdminPlus):
    # Configuracoes da listagem omitidas.

    def get_queryset(self, request):
        return super().get_queryset(request, HorarioCampus.locals)
```

`FiltroUnidadeOrganizacionalManager`, em `edu/managers.py:117-137`, identifica
as unidades permitidas para o usuario e, quando existem IDs delimitadores,
aplica dinamicamente:

```python
filtro = {f'{self.key}__id__in': ids}
qs = qs.filter(**filtro)
```

Como o manager foi criado com a chave `'uo'`, o filtro resultante equivale a:

```python
qs.filter(uo__id__in=ids)
```

Esse exemplo comprova por que nao se deve explicar `locals` apenas como
"registros do campus": o nome e uma convencao; a regra concreta pertence ao
manager associado ao model.

#### 3.13.7. Desempenho com `select_related()`

As colunas de `AlunoAdmin` acessam `ano_letivo`, `pessoa_fisica` e `situacao`.
Sem antecipacao, a renderizacao pode provocar novas consultas para cada aluno
da pagina, caracterizando o problema N+1.

```python
.select_related('ano_letivo', 'pessoa_fisica', 'situacao')
```

`select_related()` realiza joins para relacionamentos de valor unico, como
`ForeignKey` e `OneToOneField`. Para relacoes multiplas, a ferramenta usual e
`prefetch_related()`.

Otimizar nao significa ampliar o escopo: `select_related()` muda a forma de
carregamento dos relacionamentos, mas preserva os alunos definidos pelas
etapas anteriores.

#### 3.13.8. Como demonstrar em aula

1. Acesse `/admin/edu/aluno/` com um usuario autorizado.
2. Abra `edu/admin.py:1625-1626` e identifique manager, exclusao e otimizacao.
3. Abra `edu/models/alunos.py:250-256` e compare `objects` com `locals`.
4. Abra `edu/managers.py:671-682` e acompanhe a regra do coordenador de polo.
5. Explique que `list_filter` atua depois do escopo inicial e nao deve ser
   usado como protecao de acesso.
6. Compare com `HorarioCampusAdmin`, em `edu/admin.py:374-385`, para mostrar
   que outro manager `locals` pode implementar outra regra.

Checklist para revisar qualquer `get_queryset()`:

- Qual e o queryset ou manager de origem?
- A regra depende do usuario, grupo, setor, campus ou objeto?
- O usuario sem correspondencia recebe tudo, nada ou um subconjunto?
- A mesma restricao vale para acesso direto a um objeto?
- Existem `select_related()` ou `prefetch_related()` adequados?
- Busca, filtros e exportacao preservam esse queryset?
- Ha teste com usuario autorizado, usuario restrito e superusuario?

### 3.14. Permissoes no `ModelAdmin`

#### 3.14.1. Conceito e finalidade

As permissoes do `ModelAdmin` determinam quais operacoes administrativas o
usuario pode executar. Elas sao verificadas tanto durante a montagem da
interface quanto no atendimento direto das URLs.

O Django trabalha, por padrao, com quatro operacoes de model:

| Operacao | Codename para `Aluno` | Metodo do Admin |
|---|---|---|
| Visualizar | `edu.view_aluno` | `has_view_permission()` |
| Incluir | `edu.add_aluno` | `has_add_permission()` |
| Alterar | `edu.change_aluno` | `has_change_permission()` |
| Excluir | `edu.delete_aluno` | `has_delete_permission()` |

A string segue o formato:

```text
<app_label>.<codename>
```

Exemplo de verificacao direta:

```python
request.user.has_perm('edu.change_aluno')
```

Essas permissoes padrao sao criadas pelo Django para os models concretos
durante o processo de migrations. No banco, a definicao fica em
`auth_permission`, relacionada ao model por `django_content_type`; usuarios e
grupos recebem associacoes com essas permissoes.

O `permissions.yaml` nao cria o mecanismo do Django. No SUAP, ele declara
principalmente quais permissoes devem ser associadas a cada grupo. Por exemplo,
`edu/permissions.yaml:46-57` atribui ao grupo `Administrador Acadêmico`, entre
outras, `view_aluno`, `change_aluno` e `delete_aluno`.

O model tambem pode declarar permissoes adicionais em `class Meta`. O model
`Aluno` faz isso a partir de `edu/models/alunos.py:482-490`, com permissoes de
negocio como `emitir_diploma`, `emitir_boletim` e `emitir_historico`. Essas
permissoes extras podem proteger operacoes especificas, mas nao substituem
automaticamente os quatro metodos do Admin.

#### 3.14.2. Implementacao nativa do Django

Os metodos pertencem a `BaseModelAdmin`/`ModelAdmin`, no pacote instalado
`django/contrib/admin/options.py:536-609` da versao 4.1.5.

Forma reduzida da implementacao:

```python
def has_add_permission(self, request):
    codename = get_permission_codename('add', self.opts)
    return request.user.has_perm(f'{self.opts.app_label}.{codename}')

def has_change_permission(self, request, obj=None):
    codename = get_permission_codename('change', self.opts)
    return request.user.has_perm(f'{self.opts.app_label}.{codename}')

def has_delete_permission(self, request, obj=None):
    codename = get_permission_codename('delete', self.opts)
    return request.user.has_perm(f'{self.opts.app_label}.{codename}')

def has_view_permission(self, request, obj=None):
    view = get_permission_codename('view', self.opts)
    change = get_permission_codename('change', self.opts)
    return request.user.has_perm(
        f'{self.opts.app_label}.{view}'
    ) or request.user.has_perm(
        f'{self.opts.app_label}.{change}'
    )

def has_module_permission(self, request):
    return request.user.has_module_perms(self.opts.app_label)
```

Na implementacao padrao, `obj` e recebido pelos metodos de visualizar,
alterar e excluir, mas nao e analisado. Ele existe para permitir que uma
subclasse implemente regras por objeto.

`has_module_permission()` possui funcao diferente: controla a exibicao da
aplicacao no indice do Admin e o acesso ao indice daquela aplicacao. Ele nao
autoriza, sozinho, inclusao, alteracao ou exclusao. As operacoes continuam
dependendo de seus metodos especificos.

#### 3.14.3. Quando `obj` e `None`

O mesmo metodo e chamado em dois contextos:

```python
has_change_permission(request, obj=None)
has_change_permission(request, obj=aluno)
```

| Valor | Pergunta aproximada |
|---|---|
| `obj=None` | O usuario pode alterar algum objeto deste model? |
| `obj=<instancia>` | O usuario pode alterar especificamente este objeto? |

Essa diferenca e importante para montar botoes gerais, abrir listagens e
validar uma tela de edicao. Uma sobrescrita deve tratar `obj=None` sem tentar
acessar atributos da instancia.

#### 3.14.4. O que o `ModelAdminPlus` modifica

O `ModelAdminPlus` herda `has_add_permission()` e
`has_module_permission()` do Django, mas redefine visualizacao, alteracao e
exclusao em `djtools/contrib/admin/options/__init__.py:295-308`:

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

    perm = utils.has_change_permission(
        model=self.model,
        user=request.user,
    )

    if not perm and obj is None:
        perm = self.has_view_permission(request, obj)
    return perm

def has_delete_permission(self, request, obj=None):
    return utils.has_delete_permission(
        model=self.model,
        obj=obj,
        user=request.user,
    )
```

Principais diferencas:

- a verificacao e delegada aos helpers de `djtools.utils`;
- os helpers do DJTools suportam regras como `can_view(user)`,
  `can_change(user)` e `can_delete(user)` quando recebem a instancia;
- no caminho atual do `ModelAdminPlus`, `can_change()` e consultado
  explicitamente e o objeto e encaminhado para a verificacao de exclusao;
- `has_view_permission()` nao encaminha `obj` ao helper na implementacao atual,
  portanto `can_view()` nao e aplicado por esse caminho;
- sem `change`, uma chamada geral de alteracao com `obj=None` pode aceitar
  `view`, permitindo o fluxo administrativo em modo de consulta;
- a verificacao de uma instancia continua exigindo a autorizacao propria da
  operacao.

#### 3.14.5. Helpers de permissao do DJTools

As strings de permissao sao produzidas em
`djtools/utils/__init__.py:1859-1908`:

```python
def get_change_permission_for_model(model):
    return (
        model._meta.app_label
        + '.'
        + get_permission_codename('change', model._meta)
    )
```

Para `Aluno`, o resultado e `edu.change_aluno`.

As verificacoes estao em `djtools/utils/__init__.py:1911-2003`:

```python
def has_change_permission(model, obj=None, user=None):
    user = user or get_tl().get_user()
    if not user:
        return False

    if not user.has_perm(
        get_change_permission_for_model(model)
    ):
        return False

    if hasattr(obj, 'can_change'):
        return obj.can_change(user=user)
    return True
```

O padrao e uma verificacao em camadas:

```text
permissao global do model
          +
regra opcional da instancia (can_change/can_delete/can_view)
          =
resultado da operacao
```

`has_view_permission()`, em `djtools/utils/__init__.py:1928-1949`, aceita
`view` ou `change` e pode consultar `obj.can_view(user=user)` quando recebe uma
instancia. Como visto acima, o `ModelAdminPlus` atual chama esse helper sem
repassar `obj`; esse comportamento deve ser considerado ao criar uma regra de
visualizacao por objeto.
`has_delete_permission()`, nas linhas `1977-2003`, exige `delete` e pode
consultar `obj.can_delete(user=user)`.

#### 3.14.6. Exemplo 1: regra de alteracao de aluno

**Arquivo:** `edu/admin.py`  
**Linhas:** `1617-1623`

```python
def has_change_permission(self, request, obj=None):
    if (
        request.user.has_perm('edu.change_aluno')
        or request.user.groups.filter(
            name='Auxiliar de Secretaria Acadêmica'
        ).exists()
    ):
        return True

    return super().has_change_permission(request, obj)
```

O codigo real utiliza acento no nome do grupo. A regra permite alteracao
quando:

- o usuario possui diretamente ou por grupo `edu.change_aluno`; ou
- pertence ao grupo `Auxiliar de Secretaria Acadêmica`; ou
- a implementacao herdada do `ModelAdminPlus` autoriza o contexto restante.

Esse metodo responde **se a operacao e permitida**. O conjunto de alunos que
aparece continua sendo definido por `AlunoAdmin.get_queryset()`, em
`edu/admin.py:1625-1626`. Portanto:

```text
has_change_permission() -> pode alterar?
get_queryset()           -> quais alunos consegue localizar?
```

Ao criar uma excecao por grupo, deve-se avaliar se ela tambem precisa respeitar
uma regra por objeto. Um retorno antecipado `True` encerra a verificacao e nao
executa o metodo herdado.

#### 3.14.7. Exemplo 2: impedir inclusao pelo Admin

`ProfessorAdmin` desabilita a inclusao administrativa em
`edu/admin.py:1504-1505`:

```python
def has_add_permission(self, request):
    return False
```

Mesmo que o usuario possua a permissao `edu.add_professor`, esse Admin nao
oferece nem aceita o fluxo padrao de inclusao. O cadastro utiliza uma acao
propria adicionada na barra em `edu/admin.py:1507-1510`.

Esse exemplo mostra que a permissao do banco e uma entrada para a decisao, mas
uma sobrescrita do `ModelAdmin` pode impor uma restricao adicional.

#### 3.14.8. Exemplo 3: exclusao condicionada ao objeto e ao curso

`DiarioAdmin`, em `edu/admin.py:1464-1467`, combina estado do objeto com uma
regra contextual do EDU:

```python
def has_delete_permission(self, request, obj=None):
    if (
        obj
        and obj.pode_ser_excluido()
        and perms.realizar_procedimentos_academicos(
            request.user,
            obj.turma.curso_campus,
        )
    ):
        return True
    return False
```

A exclusao so e permitida quando:

1. existe uma instancia;
2. o diario esta em estado que admite exclusao;
3. o usuario pode realizar procedimentos academicos naquele curso.

Nao basta possuir genericamente `edu.delete_diario`. A regra considera o
objeto e seu contexto academico.

Outro exemplo simples aparece em `RegistroEmissaoDiplomaAdmin`,
`edu/admin.py:2360-2363`: uma emissao so pode ser excluida quando ainda nao
possui `numero_formulario`.

#### 3.14.9. Efeito na interface e protecao da URL

As permissoes influenciam elementos como:

- aparicao do model no indice;
- botao de adicionar;
- links e icones de visualizar ou editar;
- botao e confirmacao de exclusao;
- actions disponiveis;
- aceite ou rejeicao de uma URL acessada diretamente.

No `ModelAdminPlus`, `get_list_display()`, em
`djtools/contrib/admin/options/__init__.py:208-220`, inclui a coluna de icones
somente quando o usuario possui `view` ou `change`. Ja
`show_list_display_icons()`, nas linhas `163-185`, escolhe entre o icone de
visualizacao e o de edicao consultando os metodos de permissao.

Esconder um botao ou link e apenas uma consequencia visual. A seguranca deve
estar na view/metodo administrativo, pois o usuario pode digitar diretamente:

```text
/admin/edu/aluno/95812/change/
```

O Django volta a verificar a permissao durante o processamento dessa rota.

#### 3.14.10. Cuidados ao sobrescrever

Uma implementacao segura deve considerar:

- `obj` pode ser `None`;
- grupos nao substituem automaticamente permissoes nem escopo;
- retornar `True` antes de `super()` pode ignorar regras da classe-base;
- ocultar a interface nao impede acesso direto;
- `get_queryset()` deve limitar os objetos, quando houver escopo;
- regras contextuais devem considerar curso, campus, diretoria ou estado do
  objeto conforme o caso;
- superusuarios, usuarios autorizados e usuarios restritos devem ser testados.

Evite autorizar apenas pela existencia de um parametro enviado pelo navegador:

```python
# Incorreto: o usuario controla o valor recebido.
if request.GET.get('pode_excluir') == '1':
    return True
```

Prefira consultar dados confiaveis do usuario e do objeto:

```python
def has_delete_permission(self, request, obj=None):
    if obj is None:
        return False
    return (
        request.user.has_perm('edu.delete_exemplo')
        and obj.pode_ser_excluido()
    )
```

#### 3.14.11. Como demonstrar em aula

1. Abra `edu/permissions.yaml:46-57` e identifique as permissoes de `Aluno`.
2. Abra `edu/admin.py:1617-1626` e compare permissao com queryset.
3. Mostre `ModelAdminPlus` em
   `djtools/contrib/admin/options/__init__.py:295-308`.
4. Mostre os helpers em `djtools/utils/__init__.py:1859-2003`.
5. Compare dois usuarios na tela `/admin/edu/aluno/`.
6. Tente abrir uma URL de edicao com usuario sem autorizacao.
7. Abra `ProfessorAdmin`, em `edu/admin.py:1504-1510`, e mostre por que o botao
   padrao de adicionar nao aparece.
8. Abra `DiarioAdmin`, em `edu/admin.py:1464-1467`, e destaque a autorizacao
   dependente do objeto.

Checklist para revisar permissoes de um Admin:

- Quais permissoes padrao o usuario ou grupo possui?
- Existe permissao adicional em `Model.Meta.permissions`?
- Algum metodo `has_*_permission()` foi sobrescrito?
- A regra precisa analisar `obj=None` e uma instancia concreta?
- O model implementa `can_view`, `can_change` ou `can_delete`?
- O `get_queryset()` aplica o escopo correspondente?
- O acesso direto a add, change e delete foi testado?
- A regra apenas oculta o botao ou realmente bloqueia a operacao?

### 3.15. Ciclo da listagem: `changelist_view()` e `ChangeListPlus`

#### 3.15.1. Quatro conceitos diferentes

No Admin, a palavra *changelist* significa a tela que lista os objetos de um
model. Quatro elementos participam desse fluxo:

| Elemento | Origem | Responsabilidade |
|---|---|---|
| Changelist | Conceito/tela | Listagem administrativa acessada no navegador |
| `changelist_view()` | `ModelAdmin` | Recebe a requisicao e coordena permissao, actions, contexto e resposta |
| `ChangeList` | Django | Interpreta configuracoes e mantem o estado da listagem |
| `ChangeListPlus` | DJTools/SUAP | Especializa busca, filtros relacionados e ordenacao |

Para alunos, a changelist e:

```text
/admin/edu/aluno/
```

Ela nao e atendida por uma funcao em `edu/views.py`. A URL gerada pelo
`ModelAdmin.get_urls()` aponta para o metodo
`AlunoAdmin.changelist_view()`. Como `AlunoAdmin` herda de `ModelAdminPlus`, a
implementacao passa primeiro pelo DJTools e depois pelo Django.

```text
AlunoAdmin
    -> ModelAdminPlus.changelist_view()
        -> ModelAdmin.changelist_view()
            -> ChangeListPlus
```

#### 3.15.2. Fluxo completo da requisicao

```text
GET /admin/edu/aluno/?q=paloma&tab=tab_suap
  |
  v
AdminSite.admin_view()
  -> valida acesso administrativo
  |
  v
ModelAdminPlus.changelist_view()
  -> guarda request, trata exportacao e prepara contexto do SUAP
  |
  v
ModelAdmin.changelist_view()
  -> verifica view/change e cria a instancia da changelist
  |
  v
ModelAdmin.get_changelist_instance()
  -> reune list_display, filtros, busca, ordem e paginacao
  |
  v
ModelAdminPlus.get_changelist()
  -> devolve a classe ChangeListPlus
  |
  v
ChangeListPlus(...)
  -> parte de AlunoAdmin.get_queryset()
  -> aplica tab, filtros, pesquisa e ordenacao
  -> conta e pagina os resultados
  |
  v
contexto com cl
  -> template change_list.html
  -> tabela HTML
```

O nome `cl`, usado pelo Django e pelos templates, e uma abreviacao de
`ChangeList`. Ele representa a listagem daquela requisicao, nao uma classe de
model nem um registro do banco.

#### 3.15.3. Entrada nativa: `ModelAdmin.changelist_view()`

A implementacao nativa esta em
`django/contrib/admin/options.py:1919-2097`, na versao 4.1.5. O metodo executa,
em linhas gerais:

1. verifica `has_view_or_change_permission()`;
2. cria `cl` por meio de `get_changelist_instance()`;
3. trata `POST` de actions administrativas;
4. trata edicao em massa quando existe `list_editable`;
5. monta formulario de actions e arquivos de midia;
6. cria o contexto do template;
7. retorna `TemplateResponse` com o template de changelist.

Trecho reduzido para estudo:

```python
def changelist_view(self, request, extra_context=None):
    if not self.has_view_or_change_permission(request):
        raise PermissionDenied

    cl = self.get_changelist_instance(request)

    # O codigo real tambem processa actions e list_editable.
    context = {
        **self.admin_site.each_context(request),
        'cl': cl,
        'media': media,
        'has_add_permission': self.has_add_permission(request),
        'action_form': action_form,
        **(extra_context or {}),
    }

    return TemplateResponse(
        request,
        self.change_list_template or 'admin/change_list.html',
        context,
    )
```

O ponto mais importante e `cl`: o template nao recebe apenas uma lista de
objetos. Ele recebe um objeto que conhece resultados, filtros, pagina atual,
colunas, contagens, actions e configuracoes do Admin.

#### 3.15.4. Como nasce a instancia de `ChangeListPlus`

O Django implementa `get_changelist_instance()` em
`django/contrib/admin/options.py:822-849`. O metodo reune:

```text
model
list_display e list_display_links
list_filter e date_hierarchy
search_fields e list_select_related
list_per_page e list_max_show_all
list_editable
ModelAdmin
sortable_by e search_help_text
```

Antes de instanciar, o Django pergunta qual classe deve usar:

```python
ChangeList = self.get_changelist(request)
return ChangeList(request, self.model, ...)
```

No Django puro, `get_changelist()` devolve `ChangeList`, conforme
`django/contrib/admin/options.py:814-820`. O `ModelAdminPlus` troca essa classe
em `djtools/contrib/admin/options/__init__.py:200-206`:

```python
def get_changelist(self, request, **kwargs):
    self.request = request
    return ChangeListPlus
```

Consequentemente:

```text
TurnoAdmin/AlunoAdmin -> ModelAdminPlus -> ChangeListPlus
admin.ModelAdmin puro                    -> ChangeList
```

Guardar `self.request` tambem permite que metodos de coluna e recursos do
`ModelAdminPlus` consultem o usuario e os parametros atuais.

#### 3.15.5. O que o `ChangeList` faz com o queryset

`ChangeList` esta em `django/contrib/admin/views/main.py`. Seu construtor
comeca nas linhas `57-139`; `get_results()` esta nas linhas `274-310`; e
`get_queryset()` comeca na linha `495` da versao 4.1.5.

O processamento conceitual e:

```text
ModelAdmin.get_queryset(request)
    -> root_queryset
    -> get_filters(request)
    -> filtros restantes da query string
    -> ModelAdmin.get_search_results()
    -> select_related(), quando necessario
    -> distinct(), quando joins podem duplicar linhas
    -> get_ordering()
    -> get_results(): count + Paginator
    -> result_list da pagina atual
```

Alguns estados importantes do objeto `cl`:

| Atributo | Conteudo |
|---|---|
| `root_queryset` | Consulta inicial devolvida pelo Admin |
| `queryset` | Consulta depois de busca, filtros e ordem |
| `result_list` | Objetos da pagina atual |
| `result_count` | Quantidade depois dos filtros |
| `full_result_count` | Quantidade antes dos filtros de tela |
| `filter_specs` | Objetos que representam os filtros |
| `page_num` | Pagina solicitada |
| `paginator` | Paginador da consulta |
| `model_admin` | Admin responsavel pela listagem |

O `QuerySet` e avaliado de forma preguiçosa. Os metodos encadeiam a consulta;
a execucao SQL ocorre quando contagens, paginacao ou iteracao exigem os dados.

#### 3.15.6. Customizacao de `ModelAdminPlus.changelist_view()`

O wrapper do SUAP esta em
`djtools/contrib/admin/options/__init__.py:348-385`:

```python
@csrf_protect_m
def changelist_view(self, request, extra_context=None):
    self.request = request
    request.help_key = (
        f'{self.model._meta.app_label}.'
        f'change_{self.model.__name__.lower()}'
    )

    if self.export_to_xls and 'export_to_xls' in request.GET:
        request.GET._mutable = True
        del request.GET['export_to_xls']
        queryset = self.get_current_queryset(request)
        return tasks.admin_export('xls', queryset, request, self)

    more_context = {
        'object_tools_items': self.get_action_bar(request),
        'title': self.model._meta.verbose_name_plural,
        'disable_general_tabs': True,
    }

    retorno = super().changelist_view(request, more_context)

    if is_ajax(request) and hasattr(retorno, 'context_data'):
        return utils.render(
            'djtools/templates/adminutils/content_main_admin.html',
            retorno.context_data,
        )
    return retorno
```

O recorte omite CSV, Sophia e o tratamento de filtro invalido, mas preserva o
fluxo principal. A customizacao:

- disponibiliza o request na instancia do Admin;
- configura a chave de ajuda;
- desvia requisicoes de exportacao antes da resposta HTML;
- acrescenta action bar, titulo e breadcrumbs;
- chama o ciclo nativo com `super()`;
- em AJAX, devolve somente o fragmento principal da listagem.

`@csrf_protect_m` e a versao aplicavel a metodos da protecao CSRF do Django.
Ela e especialmente relevante porque a mesma view tambem recebe `POST` de
actions e de edicao em massa.

#### 3.15.7. O que o `ChangeListPlus` acrescenta

`ChangeListPlus` herda do `ChangeList` nativo em
`djtools/contrib/admin/views/__init__.py:19-170`:

```python
class ChangeListPlus(ChangeList):
    ALL_VAR = 'all'
    ORDER_VAR = 'o'
    PAGE_VAR = 'p'
    SEARCH_VAR = 'q'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Tratamento adicional para SearchField do SUAP.
        ...
        return qs

    def get_filters(self, request):
        # Filtros nativos, relacionados e autocomplete do SUAP.
        ...

    def get_ordering(self, request, queryset):
        ordering = super().get_ordering(request, queryset)
        if len(ordering) > 1 and ordering[-1] == '-pk':
            ordering.pop(-1)
        return ordering
```

As principais adaptacoes sao:

1. **Busca em `SearchField`:** nas linhas `31-48`, normaliza termos para ASCII
   em maiusculas e troca a busca aplicada aos campos preparados pelo SUAP.
2. **Filtros relacionados:** nas linhas `50-117`, identifica relacionamentos,
   limita opcoes ao queryset permitido e pode montar `QuerysetACListFilter`.
3. **Hierarquia de datas:** nas linhas `119-148`, converte ano, mes e dia em
   limites `gte` e `lt`.
4. **Validacao dos lookups:** nas linhas `55-57` e `155-164`, rejeita filtros
   nao permitidos ou campos inexistentes.
5. **Ordenacao:** nas linhas `166-170`, adapta o criterio adicional `-pk` que o
   Django pode acrescentar para desempate.

`ChangeListPlus` nao substitui o ORM. Ele interpreta a requisicao e compoe
novas operacoes sobre o `QuerySet` inicial entregue pelo Admin.

#### 3.15.8. Parametros GET da listagem

Busca, filtros, tabs, ordenacao e pagina ficam na query string. Isso permite
recarregar, compartilhar e exportar o mesmo recorte.

| Parametro | Exemplo | Funcao |
|---|---|---|
| `q` | `q=paloma` | Termo de `search_fields` |
| Campo/lookup | `situacao__id__exact=1` | Filtro aplicado ao ORM |
| `tab` | `tab=tab_suap` | Aba criada por `CustomTabListFilter` |
| `o` | `o=2` ou `o=-2` | Indice da coluna usada na ordenacao |
| `p` | `p=1` | Pagina solicitada pelo Admin |
| `all` | `all=1` | Solicita todos, dentro do limite permitido |
| `export_to_xls` | `export_to_xls=1` | Desvia a resposta para exportacao |

Exemplo didatico:

```text
/admin/edu/aluno/?q=paloma&situacao__id__exact=1&tab=tab_suap&p=0
```

Leitura:

- parte do escopo de `AlunoAdmin.get_queryset()`;
- aplica a aba de alunos matriculados no SUAP;
- restringe a situacao de chave `1`;
- pesquisa `paloma` nos `search_fields`;
- entrega a pagina indicada.

Os nomes exatos dos filtros dependem do tipo de campo e do filtro criado. Os
valores da URL sao entrada do usuario e nao constituem autorizacao. O
`get_queryset()` e as permissoes precisam limitar os dados antes e durante o
processamento.

#### 3.15.9. Exemplo real: tabs de `AlunoAdmin`

`AlunoAdmin` inclui `CustomTabListFilter` em `edu/admin.py:1603` e declara as
tabs em `edu/admin.py:1633-1649`:

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

`CustomTabListFilter`, em
`djtools/contrib/admin/filters/__init__.py:149-171`, transforma os nomes
devolvidos por `get_tabs()` em opcoes da interface. Depois, chama o metodo da
tab selecionada com o queryset que ja percorre o ciclo da listagem.

Assim, uma tab nao e uma nova tabela nem uma permissao: e mais um filtro sobre
o conjunto permitido.

#### 3.15.10. Renderizacao do resultado

`ModelAdminPlus` define em
`djtools/contrib/admin/options/__init__.py:119-121`:

```python
change_list_template = 'djtools/templates/adminutils/change_list.html'
```

Esse template estende o Admin nativo em
`djtools/templates/adminutils/change_list.html:1`:

```django
{% extends "admin/change_list.html" %}
```

Nas linhas `200-203`, ele cria o recipiente da listagem e inclui o fragmento
principal. O fragmento
`djtools/templates/adminutils/content_main_admin.html:13-70` usa `cl` para
renderizar:

- formulario de pesquisa;
- `cl.filter_specs`;
- hierarquia de datas;
- `cl.result_list` pela tag `{% result_list cl %}`;
- actions;
- paginacao.

O JavaScript de `change_list.html:40-162` reconstroi a query string e, quando
`filters_ajax = True`, atualiza somente `#content-main`. No servidor, o retorno
parcial e produzido por `ModelAdminPlus.changelist_view()` nas linhas
`382-383`.

#### 3.15.11. Exportacao preservando o recorte

Ao receber `export_to_xls=1`, o `ModelAdminPlus` remove apenas esse parametro e
chama `get_current_queryset()`. O metodo, em
`djtools/contrib/admin/options/__init__.py:237-259`, instancia novamente o
`ChangeListPlus` com a mesma requisicao e devolve `cl.get_queryset(request)`.

```text
mesmo escopo + mesma busca + mesmos filtros + mesma tab
                         |
                         v
                 queryset exportado
```

Esse fluxo evita exportar indiscriminadamente todos os registros quando a tela
esta filtrada. A tarefa final esta em `djtools/tasks.py:48-89`.

#### 3.15.12. GET, POST e respostas possiveis

| Requisicao | Resultado principal |
|---|---|
| `GET` comum | Pagina completa da listagem |
| `GET` AJAX | Fragmento `content_main_admin.html` |
| `GET` com exportacao | `XlsResponse` ou `CsvResponse` |
| `POST` com action | Executa uma operacao sobre objetos selecionados |
| `POST` com `list_editable` | Valida e salva o formset da listagem |

Por isso `changelist_view()` e mais do que uma view de consulta: ela tambem
coordena operacoes em massa e pode devolver tipos diferentes de resposta.

#### 3.15.13. Como demonstrar em aula

1. Acesse `/admin/edu/aluno/` e abra a aba de rede do navegador.
2. Pesquise um nome e identifique `q` na URL.
3. Aplique situacao e curso e observe os parametros de filtro.
4. Troque de tab e identifique `tab=...`.
5. Clique em um cabecalho ordenavel e observe `o`.
6. Avance uma pagina e observe `p`.
7. Abra `edu/admin.py:1601-1649` e associe cada comportamento a sua
   configuracao ou metodo.
8. Abra `ModelAdminPlus.get_changelist()`, em
   `djtools/contrib/admin/options/__init__.py:200-206`.
9. Abra `ChangeListPlus`, em
   `djtools/contrib/admin/views/__init__.py:19-170`.
10. Abra `content_main_admin.html:13-70` e mostre onde `cl` chega ao template.
11. Exporte a listagem e confirme que os filtros permanecem aplicados.

Checklist para depurar uma listagem:

- A URL chegou ao `ModelAdmin` esperado?
- O usuario passou por `has_view_or_change_permission()`?
- Qual queryset foi devolvido pelo `get_queryset()` do Admin?
- Quais parametros existem em `request.GET`?
- Qual tab ou filtro alterou a consulta?
- `search_fields` aponta para campos validos?
- A ordenacao e a paginacao sao as esperadas?
- `cl.result_count` e `cl.full_result_count` fazem sentido?
- A resposta e pagina completa, fragmento AJAX ou exportacao?
- Alguma coluna esta causando consultas N+1 durante a renderizacao?

### 3.16. Actions administrativas

#### 3.16.1. Conceito

Uma **action administrativa** e uma operacao executada sobre um conjunto de
objetos selecionados na changelist. Ela e apropriada para comandos em massa,
como marcar diarios, aprovar solicitacoes ou enviar registros para uma lixeira.

```text
selecionar linhas
    -> escolher uma action
    -> enviar POST
    -> receber queryset dos objetos selecionados
    -> validar e executar a regra
    -> mensagem, redirecionamento ou outra resposta
```

A assinatura usual de um metodo de action e:

```python
def nome_da_action(self, request, queryset):
    ...
```

| Parametro | Conteudo |
|---|---|
| `self` | Instancia do `ModelAdmin` |
| `request` | Requisicao e usuario autenticado |
| `queryset` | Objetos selecionados, limitados pelo queryset da listagem |

Uma action nao e um metodo do model e nao e uma view declarada em `urls.py`.
Ela e um comando registrado no `ModelAdmin` e executado dentro do fluxo de
`changelist_view()`.

#### 3.16.2. Registro de uma action

O exemplo principal esta em `DiarioAdmin`, no arquivo `edu/admin.py:1053`:

```python
actions = (
    'alternar_primeiro_semestre',
    'alternar_segundo_semestre',
    'registrar_entrega_fisica',
    'cancelar_entrega_fisica',
    'habilitar_integracao_com_moodle',
    'desabilitar_integracao_com_moodle',
)
```

Cada string deve corresponder a um metodo da classe. O Django resolve esses
nomes por meio de `ModelAdmin.get_action()`, implementado em
`django/contrib/admin/options.py:1031-1056` na versao 4.1.5. O resultado e uma
tupla:

```text
(funcao, nome_interno, descricao)
```

A descricao apresentada ao usuario e definida tradicionalmente com
`short_description`:

```python
registrar_entrega_fisica.short_description = (
    'Registrar Entrega Física'
)
```

O Django 4.1.5 tambem oferece a sintaxe nativa moderna:

```python
@admin.action(
    permissions=['change'],
    description='Registrar entrega fisica',
)
def registrar_entrega_fisica(self, request, queryset):
    ...
```

O decorador esta em `django/contrib/admin/decorators.py:1-31`. Ele apenas grava
metadados como `allowed_permissions` e `short_description` na funcao.

#### 3.16.3. Como a action aparece na listagem

Durante a criacao da changelist, o Django chama `get_actions(request)`. A
implementacao nativa esta em `django/contrib/admin/options.py:974-1029`:

1. coleta actions globais do `AdminSite`;
2. coleta os nomes declarados em `ModelAdmin.actions`;
3. resolve cada funcao e sua descricao;
4. filtra actions que declaram `allowed_permissions`;
5. devolve um dicionario indexado pelo nome da action;
6. transforma esse dicionario nas opcoes do formulario.

Quando existe pelo menos uma action, `get_changelist_instance()`, em
`django/contrib/admin/options.py:827-831`, acrescenta `action_checkbox` ao
`list_display`. O template apresenta os checkboxes e o seletor de operacoes.

Se a classe declarar:

```python
actions = None
```

todas as actions sao desabilitadas naquela tela.

#### 3.16.4. Alteracao feita pelo `ModelAdminPlus`

O Django normalmente oferece a action global `delete_selected`. O
`ModelAdminPlus` a remove em
`djtools/contrib/admin/options/__init__.py:148-154`:

```python
def get_actions(self, request):
    actions = super().get_actions(request)
    try:
        del actions['delete_selected']
    except KeyError:
        pass
    return actions
```

Assim, uma classe baseada em `ModelAdminPlus` nao recebe automaticamente a
exclusao em massa padrao. Se o sistema precisar dessa operacao, deve criar uma
action explicita, com regras e permissoes adequadas ao dominio.

Essa escolha reduz o risco de exclusoes administrativas amplas sem uma regra
de negocio especifica.

#### 3.16.5. Fluxo do `POST`

O processamento nativo acontece em dois pontos de
`django/contrib/admin/options.py`:

- `changelist_view()`: linhas `1948-2000`;
- `response_action()`: linhas `1538-1605`.

Fluxo simplificado:

```text
POST da changelist
  -> le a action selecionada
  -> le os PKs em _selected_action
  -> valida o ActionForm
  -> localiza a funcao em get_actions(request)
  -> restringe o queryset aos PKs selecionados
  -> chama func(self, request, queryset)
  -> usa o HttpResponse retornado ou volta para a listagem
```

Trecho essencial de `response_action()`:

```python
selected = request.POST.getlist(
    helpers.ACTION_CHECKBOX_NAME
)

if not select_across:
    queryset = queryset.filter(pk__in=selected)

response = func(self, request, queryset)

if isinstance(response, HttpResponseBase):
    return response
return HttpResponseRedirect(request.get_full_path())
```

O nome real do campo de selecao e `_selected_action`. Quando o usuario escolhe
"selecionar todos", `select_across` faz a action receber todo o queryset
filtrado, e nao apenas os objetos da pagina atual.

Por isso, antes de executar uma action, deve-se observar a quantidade de
registros e lembrar que o queryset pode ser muito maior do que as linhas
visiveis na pagina.

#### 3.16.6. Relacao com escopo, busca e filtros

O queryset entregue a action nasce da mesma `ChangeList` usada na tela:

```text
ModelAdmin.get_queryset()
    -> escopo permitido
    -> tab
    -> filtros
    -> pesquisa
    -> objetos selecionados ou select_across
    -> action
```

Em `changelist_view()`, o Django chama:

```python
self.response_action(
    request,
    queryset=cl.get_queryset(request),
)
```

Portanto, uma action de `AlunoAdmin` deve partir do escopo definido por
`AlunoAdmin.get_queryset()`. Isso nao dispensa a validacao da operacao: escopo
responde quais objetos podem ser localizados; autorizacao responde se o usuario
pode executar aquele comando sobre eles.

#### 3.16.7. Exemplo 1: atualizacao em uma unica consulta

`DiarioAdmin` implementa a action em `edu/admin.py:1101-1105`:

```python
def registrar_entrega_fisica(self, request, queryset):
    queryset.update(entregue_fisicamente=True)
    messages.success(
        request,
        'Entrega física registrada com sucesso.',
    )

registrar_entrega_fisica.short_description = (
    'Registrar Entrega Física'
)
```

Leitura linha a linha:

- `queryset` contem os diarios selecionados;
- `update()` produz uma atualizacao direta no banco;
- `messages.success()` armazena uma mensagem para a proxima resposta;
- como o metodo nao retorna `HttpResponse`, o Django volta para a changelist;
- `short_description` define o texto apresentado no seletor.

Em termos conceituais, o ORM executa algo semelhante a:

```sql
UPDATE edu_diario
SET entregue_fisicamente = TRUE
WHERE id IN (...);
```

`queryset.update()` e eficiente, mas nao chama `save()` de cada model e nao
executa sinais `pre_save`/`post_save`. Ele deve ser usado somente quando a
alteracao nao depende desses efeitos colaterais.

#### 3.16.8. Exemplo 2: iteracao e `save()` por objeto

Em `edu/admin.py:1085-1091`, outra action segue estrategia diferente:

```python
def alternar_primeiro_semestre(self, request, queryset):
    for diario in queryset.filter(
        componente_curricular__segundo_semestre=True
    ):
        diario.segundo_semestre = False
        diario.save()

    messages.success(
        request,
        'Diário alterado com sucesso.',
    )

alternar_primeiro_semestre.short_description = (
    'Alternar para Primeiro Semestre Letivo'
)
```

Nesse caso:

- um filtro adicional evita processar objetos que nao atendem a condicao;
- cada objeto e carregado em Python;
- `save()` executa o ciclo normal de salvamento do model;
- validacoes ou efeitos implementados em `save()` podem ser executados;
- ocorre, em geral, uma operacao de escrita para cada objeto.

Comparacao:

| Estrategia | Vantagem | Cuidado |
|---|---|---|
| `queryset.update()` | Uma atualizacao SQL, adequada a grande volume | Nao chama `save()` nem sinais de salvamento |
| `for obj ...; obj.save()` | Executa comportamento individual do model | Mais consultas e possibilidade de falha no meio do lote |

Se o conjunto precisar ser processado como uma unidade indivisivel, a action
pode utilizar `@transaction.atomic` ou um bloco `with transaction.atomic():`.
A decisao depende da regra: em alguns processos pode ser desejavel preservar
os itens ja concluídos; em outros, qualquer falha deve desfazer todo o lote.

#### 3.16.9. Exemplo 3: actions dependentes da tab

`DiarioAdmin.get_actions()`, em `edu/admin.py:1069-1073`, remove todas as
actions em uma tab especifica:

```python
def get_actions(self, request):
    if request.GET.get('tab') == (
        'tab_semestrais_em_cursos_anuais'
    ):
        return {}
    return super().get_actions(request)
```

Outro exemplo mais seletivo esta em `MaterialAulaAdmin`,
`edu/admin.py:2408-2414`:

```python
def get_actions(self, request):
    actions = super().get_actions(request)

    if request.GET.get('tab') != 'tab_meus_materiais':
        actions.pop('remover_selecionadas', None)

    if request.GET.get('tab') != 'tab_compartilhados':
        actions.pop('clonar_selecionadas', None)

    return actions
```

`get_actions()` controla quais comandos aparecem para aquela requisicao. Ele
pode considerar tab, usuario ou contexto, mas a funcao da action ainda deve
validar a autorizacao antes de modificar os dados.

#### 3.16.10. Permissoes das actions

O Django filtra automaticamente apenas actions que possuem o atributo
`allowed_permissions`. A implementacao esta em
`django/contrib/admin/options.py:992-1006`.

Exemplo moderno:

```python
@admin.action(
    permissions=['change'],
    description='Marcar selecionados como conferidos',
)
def marcar_como_conferidos(self, request, queryset):
    if not request.user.has_perm('edu.change_exemplo'):
        raise PermissionDenied
    queryset.update(conferido=True)
```

O decorador faz o Django consultar `has_change_permission(request)` antes de
mostrar a action. Contudo, no `ModelAdminPlus`, a verificacao geral de
alteracao com `obj=None` pode aceitar `view` como alternativa, conforme
`djtools/contrib/admin/options/__init__.py:298-305`.

Por isso, para uma action que altera dados no SUAP, e prudente validar dentro
da propria funcao:

- a permissao de model necessaria;
- grupos ou papeis contextuais;
- campus, curso ou diretoria;
- estado de cada objeto;
- se todos os itens podem realmente sofrer a operacao.

As actions atuais de `DiarioAdmin`, em `edu/admin.py:1053-1111`, usam o estilo
tradicional e nao declaram `allowed_permissions`. Ao alterar ou criar uma
action semelhante, a autorizacao precisa ser analisada explicitamente; a mera
presenca do comando na interface nao e uma garantia suficiente.

#### 3.16.11. Mensagens e respostas

A API de mensagens informa o resultado depois do redirecionamento:

```python
messages.success(request, 'Operacao realizada com sucesso.')
messages.warning(request, 'Alguns registros foram ignorados.')
messages.error(request, 'Nao foi possivel concluir a operacao.')
```

Se a action nao retornar uma resposta, `response_action()` redireciona para a
mesma changelist. Se retornar um objeto derivado de `HttpResponse`, essa
resposta e utilizada diretamente:

```python
def exportar_selecionados(self, request, queryset):
    rows = [['ID', 'Descricao']]
    rows += [[obj.pk, str(obj)] for obj in queryset]
    return CsvResponse(rows)
```

Isso permite criar confirmacoes intermediarias, downloads ou
redirecionamentos. Quando houver uma tela de confirmacao, ela deve preservar os
IDs selecionados e verificar novamente permissao e estado no `POST` final.

#### 3.16.12. Cuidados de implementacao

- Nao confie somente no fato de a action estar visivel.
- Valide permissao e regra de negocio no servidor.
- Considere que `select_across` pode enviar milhares de registros.
- Filtre os estados permitidos antes da alteracao.
- Informe quantos objetos foram realmente processados.
- Escolha conscientemente entre `update()` e `save()`.
- Use transacao quando o lote precisar ser atomico.
- Evite consultas adicionais dentro do laço; use `select_related()` ou
  `prefetch_related()` quando necessario.
- Nao reutilize dados livres do `POST` sem validacao.
- Registre auditoria quando a operacao for sensivel.

Uma forma mais informativa de mensagem e:

```python
def registrar_entrega_fisica(self, request, queryset):
    if not request.user.has_perm('edu.change_diario'):
        raise PermissionDenied

    alterados = queryset.filter(
        entregue_fisicamente=False
    ).update(entregue_fisicamente=True)

    self.message_user(
        request,
        f'{alterados} diario(s) atualizado(s).',
        level=messages.SUCCESS,
    )
```

Esse e um exemplo didatico de melhoria e nao uma transcricao do codigo atual.

#### 3.16.13. Como demonstrar em aula

1. Acesse `/admin/edu/diario/` com um usuario de teste autorizado.
2. Abra `edu/admin.py:1053` e relacione o seletor da tela a `actions`.
3. Selecione poucos diarios e execute `Registrar Entrega Fisica`.
4. Observe o `POST` e o campo `_selected_action` nas ferramentas do navegador.
5. Abra `edu/admin.py:1101-1105` e acompanhe `queryset.update()`.
6. Compare com `alternar_primeiro_semestre`, em `edu/admin.py:1085-1091`.
7. Mostre a mensagem e o redirecionamento para a mesma listagem.
8. Abra `ModelAdminPlus.get_actions()`, em
   `djtools/contrib/admin/options/__init__.py:148-154`, e mostre a remocao de
   `delete_selected`.
9. Troque para a tab usada em `edu/admin.py:1069-1073` e mostre a retirada
   dinamica das actions.
10. Repita com um usuario sem permissao e teste tambem um `POST` direto.

Checklist para revisar uma action:

- Ela esta registrada em `actions`?
- A descricao apresentada e clara?
- Qual queryset pode chegar ate ela?
- Ela valida permissao dentro da operacao?
- Existe regra contextual por objeto?
- Pode receber `select_across` com grande volume?
- Precisa de `update()`, `save()`, transacao ou tarefa assincrona?
- Informa quantos registros foram processados, ignorados ou rejeitados?
- O retorno sera redirecionamento, download ou confirmacao?
- Ha teste com usuario autorizado, restrito e sem permissao?

### 3.17. Hooks de salvamento e redirecionamento

#### 3.17.1. O que e um hook

Um **hook** e um metodo chamado pelo framework em um ponto previsto do fluxo.
O desenvolvedor pode sobrescreve-lo para acrescentar comportamento sem
reescrever toda a view administrativa.

No formulario do Admin, os hooks podem ser divididos em dois grupos:

| Grupo | Metodos principais | Finalidade |
|---|---|---|
| Persistencia | `save_form()`, `save_model()`, `save_related()`, `save_formset()` | Controlar como o objeto e seus relacionamentos sao salvos |
| Resposta | `response_add()`, `response_change()` | Escolher mensagem e destino depois do salvamento |

Tambem existem hooks equivalentes para exclusao, como `delete_model()` e
`delete_queryset()`. Eles pertencem ao ciclo de remocao, nao ao de inclusao ou
edicao.

#### 3.17.2. Fluxo completo do formulario administrativo

O fluxo nativo de inclusao e edicao esta em
`django/contrib/admin/options.py:1752-1895`. O nucleo do salvamento aparece nas
linhas `1790-1812` da versao 4.1.5:

```python
form = ModelForm(
    request.POST,
    request.FILES,
    instance=obj,
)
formsets, inline_instances = self._create_formsets(...)

form_validated = form.is_valid()

if form_validated:
    new_object = self.save_form(
        request,
        form,
        change=not add,
    )

if all_valid(formsets) and form_validated:
    self.save_model(request, new_object, form, not add)
    self.save_related(request, form, formsets, not add)

    if add:
        self.log_addition(request, new_object, change_message)
        return self.response_add(request, new_object)

    self.log_change(request, new_object, change_message)
    return self.response_change(request, new_object)
```

Sequencia conceitual:

```text
POST
  -> verifica add/change permission
  -> instancia ModelForm e formsets
  -> form.is_valid()
  -> valida todos os formsets
  -> save_form(commit=False)
  -> save_model()
  -> save_related() e save_formset()
  -> registra historico do Admin
  -> response_add() ou response_change()
```

Se o formulario ou algum inline for invalido, os hooks de salvamento nao sao
executados. A pagina e renderizada novamente com os erros.

#### 3.17.3. `save_form()`: preparar sem persistir

A implementacao nativa esta em
`django/contrib/admin/options.py:1214-1219`:

```python
def save_form(self, request, form, change):
    return form.save(commit=False)
```

`commit=False` cria ou atualiza a instancia Python, mas ainda nao executa o
`INSERT` ou `UPDATE`. Isso permite que o proximo hook altere o objeto antes da
persistencia.

Parametros:

| Parametro | Significado |
|---|---|
| `request` | Requisicao e usuario atual |
| `form` | `ModelForm` ja validado |
| `change` | `False` na inclusao e `True` na edicao |

Esse hook pode ser sobrescrito quando for necessario preparar a instancia. Na
maioria dos casos do EDU, entretanto, `save_model()` e o ponto mais claro para
ajustes imediatamente anteriores ao salvamento.

#### 3.17.4. `save_model()`: persistir o objeto principal

No Django, `save_model()` apenas salva a instancia:

**Implementacao:** `django/contrib/admin/options.py:1221-1225`

```python
def save_model(self, request, obj, form, change):
    obj.save()
```

O objeto recebido ja contem os dados validados do form. Esse hook permite:

- preencher informacoes derivadas;
- registrar o usuario responsavel;
- ajustar campos de acordo com inclusao ou edicao;
- executar uma regra administrativa antes ou depois do salvamento.

Se a sobrescrita depender do comportamento padrao, deve chamar:

```python
super().save_model(request, obj, form, change)
```

Sem essa chamada ou um `obj.save()` equivalente, o objeto principal nao sera
persistido.

`save_model()` nao deve ser usado para aceitar dados invalidos. Validacoes que
precisam aparecer no formulario pertencem a `clean()`, `clean_<campo>()`,
validadores ou regras do model.

#### 3.17.5. Exemplo real: `MatrizAdmin.save_model()`

**Arquivo:** `edu/admin.py`  
**Linhas:** `725-730`

```python
def save_model(self, request, obj, form, change):
    if obj.exige_ch:
        obj.ch_componentes_tcc = 0
    else:
        obj.ch_projeto_final = 0

    super().save_model(request, obj, form, change)
```

Leitura linha a linha:

1. o Admin recebe a `Matriz` criada a partir dos dados validados;
2. se `exige_ch` estiver ativo, zera `ch_componentes_tcc`;
3. caso contrario, zera `ch_projeto_final`;
4. chama a implementacao herdada;
5. o `ModelAdmin` executa `obj.save()`.

A regra evita manter valores incompatíveis nos dois campos. O parametro
`change` permitiria diferenciar inclusao e edicao, embora essa implementacao
aplique a mesma regra aos dois casos.

> `save_model()` tambem e chamado por edicao em massa via `list_editable`, mas
> nao e chamado por `queryset.update()` dentro de uma action. Uma action que
> usa `update()` ignora esse hook e o metodo `save()` do model.

#### 3.17.6. `save_related()` e `save_formset()`

O objeto principal precisa ser salvo antes de relacionamentos muitos-para-
muitos e inlines, pois esses registros normalmente dependem de sua chave
primaria.

Implementacao nativa em `django/contrib/admin/options.py:1237-1253`:

```python
def save_formset(self, request, form, formset, change):
    formset.save()

def save_related(self, request, form, formsets, change):
    form.save_m2m()

    for formset in formsets:
        self.save_formset(
            request,
            form,
            formset,
            change=change,
        )
```

Responsabilidades:

- `form.save_m2m()` persiste campos `ManyToManyField` do form principal;
- cada `formset` representa um conjunto de objetos relacionados por inline;
- `save_formset()` permite personalizar o salvamento de cada conjunto;
- `save_related()` coordena todos os relacionamentos depois do objeto pai.

Ao sobrescrever `save_related()` ou `save_formset()`, normalmente deve-se
chamar `super()`. Omitir essa chamada pode fazer relacionamentos ou inlines
desaparecerem silenciosamente do salvamento.

Exemplo didatico para registrar o usuario em objetos de um inline:

```python
def save_formset(self, request, form, formset, change):
    instances = formset.save(commit=False)

    for instance in instances:
        instance.usuario_cadastro = request.user
        instance.save()

    for deleted in formset.deleted_objects:
        deleted.delete()

    formset.save_m2m()
```

Esse exemplo nao foi copiado do EDU; ele demonstra o protocolo completo que
precisa ser preservado ao assumir manualmente o salvamento do formset.

#### 3.17.7. Log administrativo

Depois de salvar o objeto e os relacionamentos, o Django monta uma descricao
das mudancas e registra:

```python
self.log_addition(request, new_object, change_message)
self.log_change(request, new_object, change_message)
```

Essas chamadas aparecem em
`django/contrib/admin/options.py:1804-1812`. Somente depois do log o fluxo chama
`response_add()` ou `response_change()`.

Portanto, os hooks de resposta recebem um objeto que ja foi salvo e registrado
no historico administrativo. Eles nao sao o local adequado para a validacao
principal ou para substituir o salvamento.

#### 3.17.8. `response_add()`: resposta depois da inclusao

A implementacao nativa esta em
`django/contrib/admin/options.py:1320-1408`. Ela examina os botoes enviados no
`POST` e escolhe o destino:

| Botao/condicao | Comportamento padrao |
|---|---|
| Salvar | Volta para a listagem ou pagina permitida |
| `_continue` | Abre a edicao do objeto criado |
| `_addanother` | Abre outro formulario de inclusao |
| Popup | Fecha/atualiza a janela de selecao |

Assinatura:

```python
def response_add(self, request, obj):
    ...
```

O objeto possui chave primaria nesse momento. Assim, ela pode ser usada na URL
de redirecionamento.

#### 3.17.9. Exemplo real: salvar Matriz e abrir seu fluxo proprio

`MatrizAdmin` combina o hook anterior com um redirecionamento customizado.

**Arquivo:** `edu/admin.py`  
**Linhas:** `751-753`

```python
def response_add(self, request, obj):
    self.message_user(
        request,
        'Matriz cadastrada com sucesso. '
        'Por favor, vincule os componentes à matriz.',
    )
    return HttpResponseRedirect(f'/edu/matriz/{obj.pk}/')
```

Depois que a matriz e salva:

1. uma mensagem de sucesso e adicionada;
2. `obj.pk` identifica a matriz recem-criada;
3. a resposta leva para `/edu/matriz/<pk>/`;
4. o usuario continua o processo vinculando componentes.

Esse fluxo e diferente do Admin padrao: em vez de voltar para
`/admin/edu/matriz/`, ele abre uma tela especifica do EDU.

Como a sobrescrita sempre retorna sua propria resposta, ela substitui o
tratamento nativo de `_continue`, `_addanother` e popup. Se esses comportamentos
precisarem ser preservados, o metodo deve tratar as condicoes ou delegar para:

```python
return super().response_add(request, obj)
```

#### 3.17.10. `response_change()`: resposta depois da edicao

A implementacao nativa esta em
`django/contrib/admin/options.py:1410-1506`. Ela considera popup, “salvar e
continuar”, “salvar como novo”, “salvar e adicionar outro” e o retorno padrao.

Assinatura:

```python
def response_change(self, request, obj):
    ...
```

Exemplo real em `ProfessorAdmin`, `edu/admin.py:1540-1541`:

```python
def response_change(self, request, obj):
    return httprr('..', 'Professor alterado com sucesso.')
```

`'..'` e uma URL relativa: partindo da tela de edicao, retorna ao nivel
anterior. `httprr()` acrescenta a mensagem e cria o redirecionamento.

Outro exemplo aparece em `TurmaMinicursoAdmin`,
`edu/admin.py:631-635`:

```python
def response_add(self, request, obj):
    return httprr(
        f'/edu/minicurso/{obj.minicurso.pk}/',
        'Operação realizada com sucesso.',
    )

def response_change(self, request, obj):
    return self.response_add(request, obj)
```

Inclusao e edicao levam ao mesmo destino porque ambas fazem parte do fluxo de
manutencao do minicurso.

#### 3.17.11. `httprr()` no SUAP

`httprr()` nao e do Django. E um atalho do DJTools implementado em
`djtools/utils/response.py:24-84` e exportado por `djtools.utils`.

```python
def httprr(
    url,
    message='',
    tag='success',
    anchor='',
    get_params='',
    close_popup=False,
):
    ...
```

Ele combina recursos que normalmente exigiriam mais codigo:

- cria `HttpResponseRedirect`;
- registra mensagem `success`, `warning` ou erro;
- pode preservar a tab atual;
- pode acrescentar ancora e parametros GET;
- pode instruir o fechamento de popup.

Comparacao:

```python
# Django
messages.success(request, 'Operacao concluida.')
return HttpResponseRedirect('/destino/')

# DJTools/SUAP
return httprr('/destino/', 'Operacao concluida.')
```

#### 3.17.12. Transacao no `ModelAdminPlus`

O `ModelAdminPlus` envolve inclusao e edicao em transacao:

**Arquivo:** `djtools/contrib/admin/options/__init__.py`  
**Linhas:** `411-439`

```python
@csrf_protect_m
@transaction.atomic
def add_view(self, request, form_url='', extra_context=None):
    ...
    return super().add_view(request, form_url, extra_context)

@csrf_protect_m
@transaction.atomic
def change_view(self, request, object_id, form_url='', extra_context=None):
    ...
    return super().change_view(
        request,
        object_id,
        form_url,
        more_context,
    )
```

Se uma excecao escapar durante `save_model()`, `save_related()` ou a parte
transacional do fluxo, o banco pode desfazer o conjunto de alteracoes. Isso
evita, por exemplo, salvar o objeto principal e deixar seus relacionamentos
pela metade.

O redirecionamento e a mensagem nao significam que a transacao foi ignorada.
Eles sao apenas a resposta HTTP produzida ao fim do fluxo bem-sucedido.

#### 3.17.13. Hooks de exclusao

O Django tambem fornece em `django/contrib/admin/options.py:1227-1235`:

```python
def delete_model(self, request, obj):
    obj.delete()

def delete_queryset(self, request, queryset):
    queryset.delete()
```

- `delete_model()` trata a exclusao individual;
- `delete_queryset()` trata um queryset de exclusao em massa;
- `has_delete_permission()` deve autorizar a operacao;
- regras de integridade e efeitos de `on_delete` continuam valendo.

No `ModelAdminPlus`, a action nativa `delete_selected` e removida, como visto
no topico de Actions. Ainda assim, os hooks sao relevantes para telas de
exclusao individual ou para uma action customizada que decida utiliza-los.

#### 3.17.14. O que pertence a cada camada

| Necessidade | Local mais adequado |
|---|---|
| Validar dados e mostrar erro no form | `clean()` ou `clean_<campo>()` |
| Regra invariavel da entidade | Model/service de dominio |
| Preparar instancia sem salvar | `save_form()` |
| Ajustar e salvar objeto no Admin | `save_model()` |
| Salvar M2M e inlines | `save_related()`/`save_formset()` |
| Registrar alteracao administrativa | `log_addition()`/`log_change()` |
| Escolher pagina depois de incluir | `response_add()` |
| Escolher pagina depois de editar | `response_change()` |
| Excluir objeto individual | `delete_model()` |

Uma regra essencial do dominio nao deve existir apenas em `save_model()`, pois
o mesmo model pode ser alterado por shell, API, tarefa ou view fora do Admin.
O hook administrativo e adequado para comportamento exclusivo daquele fluxo.

#### 3.17.15. Erros frequentes

1. **Nao chamar `super().save_model()`:** o objeto pode nao ser salvo.
2. **Chamar `form.save()` novamente:** pode duplicar ou desorganizar o ciclo.
3. **Salvar M2M antes do objeto possuir PK:** a relacao nao pode ser criada.
4. **Nao chamar `super().save_related()`:** M2M e inlines podem ser ignorados.
5. **Validar somente em `save_model()`:** o usuario recebe uma excecao em vez
   de erro de formulario.
6. **Alterar dados em `response_add()`:** a persistencia e o log ja ocorreram.
7. **Sobrescrever a resposta sem considerar popup e botoes alternativos:**
   recursos nativos deixam de funcionar.
8. **Montar URLs com identificador errado:** `obj.pk` e a referencia segura
   quando a rota espera a chave primaria.

#### 3.17.16. Como demonstrar em aula

1. Abra `django/contrib/admin/options.py:1790-1812` e apresente a ordem dos
   hooks.
2. Abra `edu/admin.py:725-730` e leia `MatrizAdmin.save_model()`.
3. Mostre por que a chamada a `super()` realiza o `obj.save()`.
4. Abra `edu/admin.py:751-753` e acompanhe `MatrizAdmin.response_add()`.
5. Cadastre uma matriz e confirme o redirecionamento para `/edu/matriz/<pk>/`.
6. Compare com `ProfessorAdmin.response_change()`, em
   `edu/admin.py:1540-1541`.
7. Abra `djtools/utils/response.py:24-84` e explique `httprr()`.
8. Mostre `save_related()` em `django/contrib/admin/options.py:1243-1253` e
   relacione-o aos inlines.
9. Mostre `@transaction.atomic` em
   `djtools/contrib/admin/options/__init__.py:411-439`.
10. Teste os botoes Salvar, Salvar e Continuar e Salvar e Adicionar Outro em
    um Admin sem resposta customizada; depois compare com `MatrizAdmin`.

Checklist para revisar hooks:

- Em que ponto do ciclo o hook e chamado?
- O form e os formsets ja foram validados?
- O objeto ja possui chave primaria?
- O metodo precisa chamar `super()`?
- A regra pertence apenas ao Admin ou ao dominio inteiro?
- M2M e inlines continuam sendo salvos?
- O redirecionamento preserva os comportamentos necessarios?
- A mensagem representa o resultado real da transacao?
- Inclusao e edicao precisam de destinos diferentes?
- Ha teste para sucesso, erro de validacao e excecao durante o salvamento?

### 3.18. URLs personalizadas dentro do Admin

#### 3.18.1. Conceito

O `ModelAdmin` ja cria URLs para listar, incluir, editar, excluir e consultar o
historico. Uma **URL personalizada** acrescenta ao mesmo prefixo administrativo
uma operacao que nao pertence ao CRUD padrao.

Exemplos de uso:

- abrir uma listagem com filtros predefinidos;
- executar uma verificacao administrativa;
- gerar uma exportacao ou relatorio especifico;
- iniciar um fluxo de negocio;
- processar um objeto identificado na URL;
- apresentar uma pagina auxiliar mantendo a seguranca e o namespace do Admin.

No caso de `AlunoAdmin`, a rota personalizada:

```text
/admin/edu/aluno/correntes/
```

pertence ao mesmo conjunto de URLs de:

```text
/admin/edu/aluno/
/admin/edu/aluno/add/
/admin/edu/aluno/<pk>/change/
```

Ela nao precisa ser declarada em `edu/urls.py`, pois e acrescentada pelo
proprio `AlunoAdmin.get_urls()`.

#### 3.18.2. Como o Django gera as URLs padrao

A implementacao nativa esta em
`django/contrib/admin/options.py:681-725` na versao 4.1.5:

```python
def get_urls(self):
    def wrap(view):
        def wrapper(*args, **kwargs):
            return self.admin_site.admin_view(view)(
                *args,
                **kwargs,
            )
        wrapper.model_admin = self
        return update_wrapper(wrapper, view)

    info = (
        self.model._meta.app_label,
        self.model._meta.model_name,
    )

    return [
        path('', wrap(self.changelist_view),
             name='%s_%s_changelist' % info),
        path('add/', wrap(self.add_view),
             name='%s_%s_add' % info),
        path('<path:object_id>/history/', wrap(self.history_view), ...),
        path('<path:object_id>/delete/', wrap(self.delete_view), ...),
        path('<path:object_id>/change/', wrap(self.change_view), ...),
        path('<path:object_id>/', ...),
    ]
```

A propriedade `ModelAdmin.urls` apenas devolve `self.get_urls()`. Depois,
`AdminSite.get_urls()`, em `django/contrib/admin/sites.py:252-301`, inclui
essas rotas sob:

```text
<app_label>/<model_name>/
```

Por fim, `suap/urls.py:60` acrescenta o prefixo externo `admin/`:

```text
admin/ + edu/aluno/ + correntes/
```

Resultado:

```text
/admin/edu/aluno/correntes/
```

#### 3.18.3. Estrutura de `get_urls()` personalizado

O padrao encontrado no EDU e:

```python
def get_urls(self):
    # Preserva listagem, inclusao, edicao, exclusao e historico.
    urls = super().get_urls()

    # Declara somente as URLs adicionais deste Admin.
    my_urls = [
        path(
            'correntes/',
            self.admin_site.admin_view(self.correntes),
        )
    ]

    # As URLs especificas precisam vir antes das rotas genericas.
    return my_urls + urls
```

Cada parte possui uma funcao:

| Trecho | Responsabilidade |
|---|---|
| `super().get_urls()` | Recupera as URLs nativas do model |
| `path(...)` | Define o caminho relativo ao prefixo do Admin |
| `self.correntes` | Metodo que atende a requisicao |
| `admin_site.admin_view(...)` | Aplica a protecao administrativa basica |
| `my_urls + urls` | Coloca as rotas especificas antes das genericas |

Se o metodo devolvesse apenas `my_urls`, as telas padrao daquele model
deixariam de ser publicadas.

#### 3.18.4. Por que a ordem `my_urls + urls` importa

A ultima rota nativa, em `django/contrib/admin/options.py:711-720`, possui o
padrao amplo:

```python
path('<path:object_id>/', ...)
```

Esse conversor aceita praticamente qualquer texto. Se as URLs nativas forem
colocadas primeiro:

```python
# Ordem inadequada para este caso.
return urls + my_urls
```

o texto `correntes` pode ser interpretado como `object_id`, e a URL
personalizada nunca sera alcancada.

```text
correto:    my_urls + urls
            correntes/ e testada antes de <object_id>/

incorreto:  urls + my_urls
            <object_id>/ pode capturar "correntes"
```

A ordem das rotas no Django e significativa: o resolvedor utiliza a primeira
correspondencia encontrada.

#### 3.18.5. Exemplo real: `AlunoAdmin.correntes()`

**Arquivo:** `edu/admin.py`  
**Linhas:** `1651-1662`

```python
def correntes(self, request):
    url = '/admin/edu/aluno/'

    if (
        not in_group(request.user, 'Administrador Acadêmico')
        and hasattr(request.user.get_profile(), 'funcionario')
    ):
        sigla_reitoria = get_sigla_reitoria()

        if (
            request.user.get_relacionamento().setor
            and request.user.get_relacionamento().setor.uo.sigla
            != sigla_reitoria
        ):
            uo_id = request.user.get_relacionamento().setor.uo_id
            url = (
                f'{url}?curso_campus__diretoria__setor__uo'
                f'__id__exact={uo_id}'
            )

    return HttpResponseRedirect(url)

def get_urls(self):
    urls = super().get_urls()
    my_urls = [
        path(
            'correntes/',
            self.admin_site.admin_view(self.correntes),
        )
    ]
    return my_urls + urls
```

O codigo foi apenas formatado para leitura. Seu comportamento e:

1. inicia com a listagem completa de alunos;
2. verifica se o usuario nao e Administrador Academico;
3. identifica sua unidade organizacional;
4. acrescenta o filtro de unidade na query string;
5. redireciona para a changelist;
6. a changelist processa o filtro, o queryset e as permissoes normalmente.

Essa URL nao produz sua propria pagina. Ela funciona como um atalho para uma
listagem administrativa filtrada.

#### 3.18.6. O que `admin_site.admin_view()` protege

A implementacao esta em
`django/contrib/admin/sites.py:198-250`.

`AdminSite.has_permission()` considera autorizado ao site administrativo o
usuario que satisfaz:

```python
request.user.is_active and request.user.is_staff
```

`admin_view()` envolve a view e acrescenta:

- verificacao de acesso ao site administrativo;
- redirecionamento para login quando necessario;
- `never_cache`, por padrao;
- protecao CSRF, salvo quando a view foi explicitamente marcada como isenta;
- preservacao dos metadados da funcao com `update_wrapper()`.

Uso correto:

```python
path(
    'correntes/',
    self.admin_site.admin_view(self.correntes),
)
```

Uso perigoso:

```python
# A view fica fora da protecao administrativa fornecida pelo AdminSite.
path('correntes/', self.correntes)
```

O `ModelAdminPlus` tambem oferece `url_wrap()` em
`djtools/contrib/admin/options/__init__.py:194-198`, que chama internamente
`self.admin_site.admin_view(view)`. O codigo do EDU, entretanto, utiliza de
forma explicita `admin_site.admin_view()` nos exemplos analisados.

#### 3.18.7. `admin_view()` nao substitui a permissao da operacao

Ser `is_active` e `is_staff` permite entrar no Admin, mas nao significa poder
executar qualquer operacao do EDU. Uma URL personalizada deve verificar a
permissao correspondente e, quando necessario, o objeto e seu contexto.

Exemplo didatico:

```python
from django.core.exceptions import PermissionDenied

def relatorio_restrito(self, request):
    if not self.has_view_permission(request):
        raise PermissionDenied

    if not request.user.has_perm('edu.gerar_relatorio'):
        raise PermissionDenied

    ...
```

Para alterar um objeto especifico:

```python
def reprocessar(self, request, pk):
    obj = self.get_object(request, str(pk))

    if obj is None:
        return self._get_obj_does_not_exist_redirect(
            request,
            self.model._meta,
            pk,
        )

    if not self.has_change_permission(request, obj):
        raise PermissionDenied

    ...
```

`self.get_object()` e preferivel a uma consulta irrestrita porque utiliza o
`get_queryset(request)` do Admin, conforme
`django/contrib/admin/options.py:851-873`. Dessa forma, o objeto tambem precisa
pertencer ao escopo visivel para o usuario.

#### 3.18.8. Nomear a rota e usar `reverse()`

As URLs reais de `correntes()` nao receberam `name`. Elas funcionam, mas
obrigam o codigo a escrever o endereco diretamente. Para uma nova rota, e
preferivel criar um nome no mesmo padrao do Admin:

```python
from django.urls import path, reverse

def get_urls(self):
    urls = super().get_urls()
    info = (
        self.model._meta.app_label,
        self.model._meta.model_name,
    )

    my_urls = [
        path(
            'correntes/',
            self.admin_site.admin_view(self.correntes),
            name='%s_%s_correntes' % info,
        )
    ]
    return my_urls + urls
```

Depois:

```python
reverse('admin:edu_aluno_correntes')
```

Vantagens:

- acompanha uma eventual troca do prefixo `/admin/`;
- evita repetir `app_label` e `model_name` em varios lugares;
- reduz erros de digitacao;
- facilita testes e refatoracoes.

No codigo atual de `AlunoAdmin`, a string `'/admin/edu/aluno/'` ficaria
invalida se o prefixo externo fosse alterado para `/gestao/`. Uma URL resolvida
por nome acompanharia a configuracao automaticamente.

#### 3.18.9. Parametros na URL

Uma rota personalizada pode receber conversores:

```python
def get_urls(self):
    urls = super().get_urls()
    info = (
        self.model._meta.app_label,
        self.model._meta.model_name,
    )

    my_urls = [
        path(
            '<int:pk>/reprocessar/',
            self.admin_site.admin_view(self.reprocessar),
            name='%s_%s_reprocessar' % info,
        )
    ]
    return my_urls + urls

def reprocessar(self, request, pk):
    obj = self.get_object(request, str(pk))
    ...
```

Endereco resultante:

```text
/admin/edu/<model>/<pk>/reprocessar/
```

O conversor `<int:pk>` valida o formato numerico, mas nao verifica existencia,
escopo ou permissao. Essas verificacoes continuam sendo responsabilidade da
view.

#### 3.18.10. GET para consultar, POST para produzir efeitos

Uma URL que apenas redireciona ou apresenta dados pode responder a `GET`. Uma
operacao que altera banco, envia e-mail ou dispara processamento deve, em
regra, exigir `POST`.

Padrao recomendado:

```python
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST

@method_decorator(require_POST)
def reprocessar(self, request, pk):
    obj = self.get_object(request, str(pk))

    if obj is None or not self.has_change_permission(request, obj):
        raise PermissionDenied

    obj.reprocessar()
    return httprr('..', 'Reprocessamento concluido.')
```

Como o metodo sera envolvido por `admin_view()`, o `POST` tambem sera protegido
por CSRF. Um botao ou formulario deve enviar o token CSRF correspondente.

Usar `GET` para produzir efeitos pode causar execucao por pre-carregamento de
links, atualizacao da pagina, robos, historico ou acesso acidental.

#### 3.18.11. Segundo exemplo real: notificacao de estagios

`EstagioDocenteAdmin` registra outra URL em `edu/admin.py:3410-3424`:

```python
def get_urls(self):
    urls = super().get_urls()
    my_urls = [
        path(
            'notificacao/',
            self.admin_site.admin_view(self.notificacao),
        )
    ]
    return my_urls + urls

def notificacao(self, request):
    qs = (
        self.get_queryset(request)
        .exclude(visitaestagiodocente__isnull=False)
        .filter(situacao__in=[
            EstagioDocente.SITUACAO_AGUARDANDO_ENCERRAMENTO,
            EstagioDocente.SITUACAO_EM_ANDAMENTO,
        ])
    )

    contador = 0
    for obj in qs:
        contador += obj.notificar()

    return httprr(
        request.META.get('HTTP_REFERER', '..'),
        f'Foram enviados e-mails referentes à {contador} '
        'prática(s) com pendências.',
    )
```

Aspectos positivos para analisar:

- usa `self.get_queryset(request)`, preservando o escopo do Admin;
- restringe situacoes e objetos ja visitados;
- contabiliza o resultado;
- usa `httprr()` para mensagem e retorno.

Ponto de atencao: enviar e-mails e um efeito colateral. Para uma nova
implementacao, o fluxo mais seguro seria exigir `POST`, validar uma permissao
especifica e, se o volume for alto, considerar uma tarefa assincrona.

#### 3.18.12. Tipos de resposta

O metodo associado a uma URL personalizada e uma view Django e pode retornar:

| Resposta | Uso |
|---|---|
| `HttpResponseRedirect` | Encaminhar para outra tela |
| `httprr()` | Redirecionar com mensagem no SUAP |
| `TemplateResponse`/`render()` | Exibir pagina HTML |
| `CsvResponse`/`XlsResponse` | Gerar arquivo |
| `JsonResponse` | Responder integracao ou chamada assincrona |
| `PDFResponse` | Entregar documento PDF |

O tipo da resposta nao altera a necessidade de autenticar, autorizar e limitar
o escopo dos objetos.

#### 3.18.13. URL do Admin x URL da aplicacao

| URL personalizada no `ModelAdmin` | URL declarada em `edu/urls.py` |
|---|---|
| Fica sob `/admin/edu/<model>/` | Fica sob `/edu/` |
| Natural para operacao interna daquele cadastro | Natural para fluxo geral do modulo |
| Usa namespace e contexto do `AdminSite` | Usa decorators e views da aplicacao |
| Implementada como metodo do Admin | Implementada em `edu/views.py` |
| Deve ser envolvida por `admin_view()` | Deve declarar sua propria protecao |

Use `get_urls()` quando a operacao pertence claramente ao cadastro
administrativo. Para fluxos reutilizados fora do Admin, processos extensos ou
interfaces voltadas a alunos e professores, uma URL da aplicacao costuma ser
mais adequada.

#### 3.18.14. Cuidados de implementacao

- Preserve `super().get_urls()`.
- Coloque rotas especificas antes das genericas.
- Envolva a view com `self.admin_site.admin_view()`.
- Verifique permissao de model e regra contextual dentro da view.
- Use `self.get_object()` ou `self.get_queryset()` para preservar escopo.
- Prefira nomes de rota e `reverse()` a caminhos fixos.
- Use `POST` para alteracao, envio ou processamento.
- Proteja operacoes demoradas contra repeticao e duplo clique.
- Valide parametros mesmo quando ha conversor na URL.
- Teste usuario anonimo, usuario staff sem permissao, autorizado e fora do
  escopo.

#### 3.18.15. Como demonstrar em aula

1. Acesse `/admin/edu/aluno/correntes/`.
2. Observe o redirecionamento e os filtros acrescentados a URL.
3. Abra `edu/admin.py:1651-1662` e leia primeiro a view, depois `get_urls()`.
4. Mostre que o caminho e relativo a `/admin/edu/aluno/`.
5. Inverta apenas conceitualmente `my_urls + urls` e explique o conflito com
   `<path:object_id>/`.
6. Abra `django/contrib/admin/sites.py:198-250` e diferencie acesso ao site de
   permissao da operacao.
7. Compare a string fixa `/admin/edu/aluno/` com uma URL criada por
   `reverse()`.
8. Abra `edu/admin.py:3410-3424` e discuta GET, POST e efeitos colaterais.
9. Teste a rota com usuario autorizado e com usuario staff sem a permissao de
   negocio.
10. Crie, em quadro ou branch de aula, uma rota nomeada que receba `<int:pk>` e
    use `self.get_object()`.

Checklist para revisar uma URL personalizada:

- Ela realmente pertence ao Admin desse model?
- As URLs nativas foram preservadas?
- A rota especifica vem antes de `<path:object_id>/`?
- A view esta envolvida por `admin_view()`?
- Existe verificacao explicita da permissao de negocio?
- O objeto e obtido pelo queryset com escopo?
- A operacao deveria aceitar somente `POST`?
- A rota possui nome e pode ser resolvida com `reverse()`?
- O retorno e adequado: HTML, redirect, arquivo ou JSON?
- Existem testes de rota, permissao, metodo HTTP e objeto fora do escopo?

### 3.19. Inlines e edicao de relacionamentos

#### 3.19.1. Conceito

Um **inline** permite consultar e editar objetos relacionados dentro do
formulario administrativo do objeto principal.

Exemplo do EDU:

```text
HorarioCampus (objeto pai)
    |
    +-- HorarioAula (objeto filho)
    +-- HorarioAula
    +-- HorarioAula
```

Na tela de inclusao ou edicao de `HorarioCampus`, o usuario pode preencher
varios registros de `HorarioAula` sem abrir uma pagina separada para cada um.

O inline nao cria o relacionamento. A ligacao ja precisa existir nos models,
normalmente por uma `ForeignKey` do filho para o pai. O Admin usa essa
informacao para construir um **inline formset**.

#### 3.19.2. Model, inline e formset

| Elemento | Responsabilidade |
|---|---|
| Model pai | Registro principal do formulario |
| Model filho | Registro relacionado ao pai |
| `ForeignKey` | Define o relacionamento no banco e no ORM |
| `InlineModelAdmin` | Configura como os filhos aparecem no Admin |
| `BaseInlineFormSet` | Agrupa, valida e salva os formularios dos filhos |
| `ModelAdmin.inlines` | Liga as classes inline ao Admin do pai |

Fluxo resumido:

```text
relacionamento nos models
    -> classe Inline
    -> atributo inlines do ModelAdmin
    -> Django cria InlineFormSet
    -> template exibe varias linhas
    -> POST valida pai e filhos
    -> salva pai
    -> salva M2M e filhos
```

#### 3.19.3. Relacionamento real: `HorarioCampus` e `HorarioAula`

**Arquivo:** `edu/models/cadastros_gerais.py`  
**Linhas:** `526-578`

```python
class HorarioCampus(LogModel):
    descricao = models.CharFieldPlus('Descrição')
    uo = models.ForeignKeyPlus(
        'rh.UnidadeOrganizacional',
        verbose_name='Campus',
        on_delete=models.CASCADE,
    )
    ativo = models.BooleanField('Ativo', default=True)
    eh_padrao = models.BooleanField(
        'Horário Padrão',
        default=False,
    )


class HorarioAula(LogModel):
    horario_campus = models.ForeignKeyPlus(
        'edu.HorarioCampus',
        on_delete=models.CASCADE,
    )
    numero = models.PositiveIntegerField(
        verbose_name='Número',
        choices=HORARIO_CHOICES,
    )
    turno = models.ForeignKeyPlus(
        'edu.Turno',
        on_delete=models.CASCADE,
    )
    inicio = models.CharFieldPlus(
        verbose_name='Início',
        max_length=5,
    )
    termino = models.CharFieldPlus(
        verbose_name='Término',
        max_length=5,
    )
```

A linha fundamental e:

```python
horario_campus = models.ForeignKeyPlus(
    'edu.HorarioCampus',
    on_delete=models.CASCADE,
)
```

Ela informa que cada `HorarioAula` pertence a um `HorarioCampus`. No sentido
inverso, o Django disponibiliza por padrao:

```python
horario_campus.horarioaula_set.all()
```

`on_delete=models.CASCADE` significa que a exclusao do pai tambem pode excluir
os horarios filhos. Esse comportamento pertence ao relacionamento do model,
nao ao inline.

#### 3.19.4. `TabularInline` e `StackedInline`

As duas classes sao nativas do Django e herdam de `InlineModelAdmin`:

| Classe | Template nativo | Apresentacao |
|---|---|---|
| `admin.TabularInline` | `admin/edit_inline/tabular.html` | Filhos em linhas de tabela |
| `admin.StackedInline` | `admin/edit_inline/stacked.html` | Cada filho em um bloco vertical |

As classes sao declaradas em
`django/contrib/admin/options.py:2501-2506` na versao 4.1.5.

Use `TabularInline` quando cada filho possui poucos campos e a comparacao entre
linhas e importante. Use `StackedInline` quando cada objeto possui muitos
campos ou precisa de uma composicao vertical mais legivel.

#### 3.19.5. Implementacao real de `HorarioAulaInline`

**Arquivo:** `edu/admin.py`  
**Linhas:** `356-382`

```python
class HorarioAulaInline(admin.TabularInline):
    model = HorarioAula
    extra = 3

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == 'turno':
            kwargs['widget'] = forms.Select
        return super().formfield_for_dbfield(
            db_field,
            **kwargs,
        )

    @property
    def media(self):
        _media = super().media
        _media._js.append(
            '/static/djtools/jquery/widgets-core.js'
        )
        _media._js.append(
            '/static/djtools/jquery/jquery.maskedinput.js'
        )
        _media._js.append(
            '/static/edu/js/HorarioAulaInline.js'
        )
        return _media


class HorarioCampusAdmin(ModelAdminPlus):
    # Outras configuracoes omitidas.
    inlines = [HorarioAulaInline]
```

Leitura da configuracao:

- `admin.TabularInline` escolhe a apresentacao em tabela;
- `model = HorarioAula` identifica o model filho;
- `extra = 3` apresenta tres formularios vazios adicionais;
- `formfield_for_dbfield()` troca o widget do campo `turno`;
- `media` acrescenta JavaScript necessario a interface de horarios;
- `inlines = [...]` liga a configuracao ao Admin do pai.

`extra = 3` nao obriga o usuario a cadastrar tres filhos e nao cria tres
registros vazios. Ele apenas controla quantos formularios extras sao
apresentados inicialmente.

#### 3.19.6. Configuracoes principais de um inline

A classe nativa `InlineModelAdmin`, em
`django/contrib/admin/options.py:2290-2335`, declara configuracoes como:

| Opcao | Funcao |
|---|---|
| `model` | Model filho editado pelo inline |
| `fk_name` | Qual `ForeignKey` aponta para o pai |
| `form` | `ModelForm` usado por cada linha |
| `formset` | Classe que coordena o conjunto de linhas |
| `extra` | Quantidade inicial de formularios vazios |
| `min_num` | Quantidade minima configurada |
| `max_num` | Quantidade maxima configurada |
| `fields`/`fieldsets` | Campos e organizacao visual |
| `exclude` | Campos removidos do formulario |
| `readonly_fields` | Campos exibidos sem edicao |
| `can_delete` | Habilita a marcacao de exclusao |
| `show_change_link` | Mostra link para a tela propria do filho |
| `classes` | Classes CSS, como `collapse` |

Quando o model filho possui mais de uma `ForeignKey` para o mesmo pai, o
Django nao consegue escolher sozinho. Nesse caso, `fk_name` e obrigatorio:

```python
class VinculoInline(admin.TabularInline):
    model = Vinculo
    fk_name = 'responsavel'
```

Os hooks `get_extra()`, `get_min_num()` e `get_max_num()`, implementados em
`django/contrib/admin/options.py:2337-2347`, permitem calcular essas quantidades
conforme request e objeto.

#### 3.19.7. Como o Django cria os inlines

O ciclo comeca em `ModelAdmin.get_inline_instances()`, implementado em
`django/contrib/admin/options.py:664-679`:

```python
def get_inline_instances(self, request, obj=None):
    inline_instances = []

    for inline_class in self.get_inlines(request, obj):
        inline = inline_class(self.model, self.admin_site)

        if not (
            inline.has_view_or_change_permission(request, obj)
            or inline.has_add_permission(request, obj)
            or inline.has_delete_permission(request, obj)
        ):
            continue

        if not inline.has_add_permission(request, obj):
            inline.max_num = 0

        inline_instances.append(inline)

    return inline_instances
```

Em seguida, `get_formsets_with_inlines()`, nas linhas `900-905`, pede a cada
inline sua classe de formset:

```python
for inline in self.get_inline_instances(request, obj):
    yield inline.get_formset(request, obj), inline
```

`InlineModelAdmin.get_formset()`, em
`django/contrib/admin/options.py:2349-2401`, combina model, form, formset,
`fk_name`, campos, exclusoes, quantidades e permissao de excluir para chamar a
factory de inline formsets.

#### 3.19.8. O que e um inline formset

Um formset e um conjunto coordenado de formularios semelhantes. No inline, ele
possui informacoes adicionais sobre o pai e a `ForeignKey` que deve ser
preenchida nos filhos.

No `POST`, aparecem campos de controle semelhantes a:

```text
horarioaula_set-TOTAL_FORMS
horarioaula_set-INITIAL_FORMS
horarioaula_set-0-numero
horarioaula_set-0-turno
horarioaula_set-0-inicio
horarioaula_set-0-termino
horarioaula_set-0-DELETE
```

O **management form** informa quantas linhas foram enviadas e quantas ja
existiam. Os indices `0`, `1`, `2` identificam cada formulario do conjunto. O
campo `DELETE` marca uma instancia existente para exclusao, quando permitida.

Nao se deve processar esses campos manualmente. O `BaseInlineFormSet` valida a
estrutura, associa os filhos ao pai e organiza inclusoes, alteracoes e
exclusoes.

#### 3.19.9. Ordem de validacao e salvamento

O fluxo estudado no topico de hooks inclui os inlines:

```text
form principal.is_valid()
    +
all_valid(formsets)
    |
    v
save_form(commit=False)
    -> instancia pai ainda nao persistida
save_model()
    -> salva pai e obtem PK
save_related()
    -> form.save_m2m()
    -> save_formset() para cada inline
```

A implementacao esta em:

- `django/contrib/admin/options.py:1790-1812`: validacao e ordem geral;
- `django/contrib/admin/options.py:1237-1253`: `save_formset()` e
  `save_related()`;
- `django/contrib/admin/options.py:2254-2287`: criacao dos formsets.

O pai e salvo primeiro porque os filhos precisam de sua chave primaria. Na
inclusao, os formularios podem ser exibidos quando `obj=None`, mas a
`ForeignKey` so e persistida depois que o pai existe no banco.

Se qualquer formset for invalido, o objeto e os filhos nao seguem para o ciclo
normal de salvamento. O `ModelAdminPlus` ainda envolve `add_view()` e
`change_view()` em `transaction.atomic`, conforme
`djtools/contrib/admin/options/__init__.py:411-439`.

#### 3.19.10. Validacao conjunta das linhas

Validacoes de um unico filho podem ficar no `ModelForm` daquela linha. Regras
que dependem do conjunto pertencem ao `BaseInlineFormSet.clean()`.

Exemplo real:

**Inline:** `edu/admin.py:3029-3045`

```python
class ItemConfiguracaoAvaliacaoInline(admin.TabularInline):
    formset = ItemConfiguracaoAvaliacaoFormset
    model = ItemConfiguracaoAvaliacao
    extra = 0


class ConfiguracaoAvaliacaoAdmin(ModelAdminPlus):
    inlines = [ItemConfiguracaoAvaliacaoInline]
```

**Formset:** `edu/forms.py:9344-9372`

```python
class ItemConfiguracaoAvaliacaoFormset(
    forms.models.BaseInlineFormSet
):
    def clean(self):
        # Parte do codigo foi resumida para destacar a regra conjunta.
        tem_avaliacao_atitudinal = False

        for item in self.cleaned_data:
            if (
                item.get('tipo')
                == ItemConfiguracaoAvaliacao.TIPO_ATITUDINAL
            ):
                if tem_avaliacao_atitudinal:
                    raise ValidationError(
                        'Não pode existir mais de uma avaliação '
                        'do tipo atitudinal.'
                    )
                tem_avaliacao_atitudinal = True
```

O formset consegue comparar todas as linhas. Um formulario isolado nao saberia
se outra linha tambem foi marcada como avaliacao atitudinal. A implementacao
real ainda valida exclusao, notas ja lancadas e quantidade minima.

Ao sobrescrever `clean()`, e recomendavel iniciar com:

```python
def clean(self):
    super().clean()

    if any(self.errors):
        return

    ...
```

Isso preserva validacoes da classe-base e evita executar regras conjuntas
sobre formularios individuais que ja possuem erros. O exemplo real analisado
possui tratamento proprio e deve ser lido integralmente antes de altera-lo.

#### 3.19.11. Permissoes do pai e dos filhos

O Django considera dois niveis:

1. permissao para incluir ou alterar o objeto pai;
2. permissoes de visualizar, incluir, alterar ou excluir o model filho.

`get_inline_instances()`, em `django/contrib/admin/options.py:664-679`, ignora
um inline quando o usuario nao possui nenhuma operacao permitida. Se nao puder
incluir filhos, `max_num` e ajustado para zero.

`get_inline_formsets()`, em
`django/contrib/admin/options.py:1681-1717`, tambem verifica se o pai pode ser
editado. Sem permissao de alteracao no pai, desabilita inclusao, alteracao e
exclusao dos filhos e apresenta o que for permitido em modo de consulta.

Os metodos podem ser sobrescritos no inline:

```python
def has_add_permission(self, request, obj):
    ...

def has_change_permission(self, request, obj=None):
    ...

def has_delete_permission(self, request, obj=None):
    ...
```

Ocultar o campo `DELETE` nao substitui a verificacao de permissao no servidor.

#### 3.19.12. `TabularInlinePlus`: extensao do SUAP

`TabularInlinePlus` nao pertence ao Django. Ele e implementado pelo DJTools em
`djtools/contrib/admin/options/__init__.py:59-68`:

```python
class TabularInlinePlus(admin.TabularInline):
    formfield_overrides = FORMFIELD_OVERRIDES

    def get_formset(self, request, obj=None, **kwargs):
        FormSetClass = super().get_formset(
            request,
            obj,
            **kwargs,
        )
        FormSetClass.form.request = request
        return FormSetClass
```

Ele preserva todo o comportamento do `TabularInline` e acrescenta:

- widgets padronizados do SUAP para data, data/hora e hora;
- disponibilizacao de `request` na classe de form usada por cada linha.

Existe tambem `StackedInlinePlus`, em
`djtools/contrib/admin/options/__init__.py:71-84`, com a mesma integracao de
request e campos regionais, mas usando a apresentacao empilhada.

Comparacao:

| Recurso | `TabularInline` | `TabularInlinePlus` |
|---|---:|---:|
| Edicao tabular de filhos | Sim | Sim, por heranca |
| Formset e management form | Sim | Sim |
| Permissoes dos filhos | Sim | Sim |
| Widgets regionais do DJTools | Nao | Sim |
| `request` disponivel no form | Nao por esse mecanismo | Sim |

#### 3.19.13. Exemplo real com `TabularInlinePlus`

`MatrizCursoAdmin`, em `edu/admin.py:3645-3661`, edita dois tipos de filho:

```python
class AutorizacaoInline(TabularInlinePlus):
    model = Autorizacao
    extra = 1


class ReconhecimentoInline(TabularInlinePlus):
    model = Reconhecimento
    extra = 1


class MatrizCursoAdmin(ModelAdminPlus):
    inlines = AutorizacaoInline, ReconhecimentoInline
    fields = 'curso_campus', 'matriz'
```

Os models filhos apontam para `MatrizCurso` em
`edu/models/cursos.py:1286-1343`:

```python
class Autorizacao(models.ModelPlus):
    matriz_curso = models.ForeignKeyPlus(
        MatrizCurso,
        verbose_name='Matriz Curso',
        on_delete=models.CASCADE,
    )


class Reconhecimento(models.ModelPlus):
    matriz_curso = models.ForeignKeyPlus(
        MatrizCurso,
        verbose_name='Matriz Curso',
        on_delete=models.CASCADE,
    )
```

Na mesma tela, o pai possui seus campos e cada classe inline produz um formset
independente. Cada formset recebe prefixo proprio para que os dados nao se
misturem no `POST`.

#### 3.19.14. Inline com formset personalizado

`ConteudoMiniCursoInline`, em `edu/admin.py:599-615`, demonstra a associacao
explicita de uma classe de formset:

```python
class ConteudoMiniCursoInline(admin.TabularInline):
    formset = ConteudoMinicursoFormset
    model = ConteudoMinicurso
    extra = 0


class MinicursoAdmin(ModelAdminPlus):
    form = MinicursoForm
    inlines = [ConteudoMiniCursoInline]
```

O relacionamento esta em `edu/models/cursos.py:1432-1439`:

```python
class ConteudoMinicurso(LogModel):
    descricao = models.CharFieldPlus('Descrição')
    ch = models.PositiveIntegerField('Carga Horária')
    minicurso = models.ForeignKeyPlus(
        'edu.Minicurso',
        on_delete=models.CASCADE,
    )
```

`extra = 0` evita linhas vazias iniciais; novas linhas podem ser acrescentadas
pelo mecanismo JavaScript do inline. O formset personalizado comeca em
`edu/forms.py:11857` e deve ser consultado quando a regra envolver a soma ou a
combinacao dos conteudos.

#### 3.19.15. Personalizacao de campos e arquivos de midia

O `HorarioAulaInline` sobrescreve `formfield_for_dbfield()` para substituir o
widget de `turno`:

```python
def formfield_for_dbfield(self, db_field, **kwargs):
    if db_field.name == 'turno':
        kwargs['widget'] = forms.Select
    return super().formfield_for_dbfield(db_field, **kwargs)
```

Esse hook recebe cada campo do model durante a construcao do form. A chamada a
`super()` precisa ser preservada para que o Django efetivamente produza o
campo.

A propriedade `media` combina os arquivos JS do inline nativo com scripts do
SUAP. O uso de `super().media` e importante: substitui-lo por uma midia vazia
pode remover `admin/js/inlines.js`, responsavel por adicionar e remover linhas
dinamicamente.

#### 3.19.16. Desempenho e volume

Inlines carregam varios formularios, escolhas e relacionamentos na mesma
pagina. Um numero grande de filhos pode tornar a tela lenta e o `POST` muito
pesado.

Cuidados:

- evite `extra` excessivo;
- limite opcoes de `ModelChoiceField` quando necessario;
- use autocomplete para relacionamentos com muitos registros;
- otimize querysets de campos relacionados;
- considere uma tela/listagem separada quando houver centenas de filhos;
- nao execute consultas repetidas em cada formulario do formset;
- avalie `max_num` como regra de interface e valide tambem a regra de negocio.

Inline e adequado quando os filhos fazem parte da manutencao natural do pai.
Ele nao e uma boa escolha para qualquer relacionamento apenas porque existe
uma `ForeignKey`.

#### 3.19.17. Erros frequentes

1. Definir o inline sem uma `ForeignKey` valida para o pai.
2. Esquecer `fk_name` quando existem duas FKs para o mesmo model.
3. Confundir `extra` com quantidade minima obrigatoria.
4. Validar uma regra conjunta em apenas um formulario filho.
5. Sobrescrever `save_related()` sem chamar `super()`.
6. Permitir exclusao visual sem verificar `has_delete_permission()`.
7. Remover a midia nativa e quebrar a adicao dinamica de linhas.
8. Carregar milhares de opcoes ou centenas de filhos na mesma pagina.
9. Colocar no inline uma regra essencial que outras entradas do sistema podem
   ignorar.
10. Testar apenas edicao e esquecer o caso de inclusao, no qual `obj=None`.

#### 3.19.18. Como demonstrar em aula

1. Abra `edu/models/cadastros_gerais.py:526-578` e identifique pai, filho e
   `ForeignKey`.
2. Abra `edu/admin.py:356-382` e leia `HorarioAulaInline` linha a linha.
3. Acesse `/admin/edu/horariocampus/` e abra um registro para edicao.
4. Relacione as linhas existentes a `horarioaula_set`.
5. Mostre os tres formularios vazios produzidos por `extra = 3`.
6. Adicione, altere e marque uma linha para exclusao antes de salvar.
7. No navegador, mostre `TOTAL_FORMS`, `INITIAL_FORMS` e os prefixos.
8. Provoque um erro em uma linha e confirme que pai e filhos nao concluem o
   ciclo normal de salvamento.
9. Abra `edu/forms.py:9344-9372` e mostre uma validacao conjunta real.
10. Compare `admin.TabularInline` com `TabularInlinePlus`, implementado em
    `djtools/contrib/admin/options/__init__.py:59-68`.
11. Abra `MatrizCursoAdmin`, em `edu/admin.py:3645-3661`, e mostre dois
    formsets independentes na mesma tela.

Checklist para revisar um inline:

- Qual e o model pai e qual e o filho?
- Qual `ForeignKey` liga os dois?
- E necessario declarar `fk_name`?
- A apresentacao deve ser tabular ou empilhada?
- Quantas linhas extras fazem sentido?
- Ha limites minimo e maximo de negocio?
- A validacao pertence ao form individual ou ao formset?
- As permissoes do pai e do filho estao corretas?
- O `save_related()` continua sendo executado?
- O request precisa estar disponivel no form, justificando `InlinePlus`?
- O volume de filhos e adequado para uma unica pagina?
- Inclusao, edicao e exclusao foram testadas?

### 3.20. Resumo para consulta

- `list_display`: colunas;
- `list_display_links`: colunas clicaveis;
- `list_filter`: filtros estruturados;
- `search_fields`: busca textual;
- `ordering`: ordem inicial;
- `list_per_page`: tamanho da pagina;
- `fieldsets`: grupos e ordem dos campos do form;
- `get_queryset()`: conjunto inicial, escopo e otimizacao da consulta;
- `has_*_permission()`: autorizacao das operacoes administrativas;
- `changelist_view()`: coordena permissao, actions, contexto e resposta;
- `ChangeListPlus`: interpreta busca, filtros, tabs, ordem e paginacao;
- `actions`: comandos executados sobre o queryset selecionado na listagem;
- hooks de salvamento: personalizam a persistencia do form administrativo;
- hooks de resposta: escolhem mensagem e destino depois do salvamento;
- `get_urls()`: acrescenta operacoes ao conjunto de rotas do `ModelAdmin`;
- `admin_view()`: protege o acesso administrativo basico da URL personalizada;
- inline: edita objetos filhos dentro do formulario administrativo do pai;
- inline formset: valida e salva conjuntamente os formularios relacionados;
- `list_filter_autocomplete_form_filters`: dependencia entre filtros do SUAP;
- `list_display_icons`: icones de visualizar/editar do SUAP;
- `export_to_xls`: exportacao XLS do DJTools;
- `export_to_sophia`: CSV especifico desta instalacao.

---

## Etapa 4 - Por que declarar `form = AlunoForm`?

Sem `form`, o Django usa `ModelAdmin.get_form()` para chamar
`modelform_factory()` e gerar um `ModelForm` a partir dos campos do model. Isso
e suficiente para um cadastro simples, como `Turno`.

O aluno nao e um cadastro simples. `AlunoAdmin` declara em
`edu/admin.py:1612-1613`:

```python
form = AlunoForm
fieldsets = AlunoForm.fieldsets
```

`AlunoForm`, em `edu/forms.py:215-294`, acrescenta comportamentos que o form
automatico nao poderia deduzir apenas do model:

- campos que representam dados de `PessoaFisica`, como nome, nascimento e CPF;
- campos e widgets Plus, inclusive autocomplete de cartorio e cidade;
- filtros encadeados entre estado e cidade;
- labels, ajuda, obrigatoriedade e escolhas especificas;
- organizacao visual em `fieldsets`;
- JavaScript proprio em `class Media`.

O construtor, iniciado em `edu/forms.py:296`, carrega valores relacionados na
edicao. Os metodos de validacao e salvamento da classe sincronizam dados que
nao pertencem somente a uma tabela. Portanto:

```text
form automatico
  = bom quando campos do model e validacoes padrao bastam

form personalizado
  = necessario quando existem campos extras, widgets, regras, relacoes,
    inicializacao ou salvamento especializado
```

O `ModelAdminPlus.get_form()`, em
`djtools/contrib/admin/options/__init__.py:392-409`, ainda disponibiliza o
`request` na classe selecionada. Assim, um form administrativo do SUAP pode
adaptar campos e validacoes ao usuario atual.

---

## Etapa 5 - Demonstracao guiada

### 5.1. Exemplo simples: Turnos

1. Abra `edu/models/cadastros_gerais.py:345-363` e identifique o model.
2. Abra `edu/admin.py:320-328` e leia cada configuracao.
3. Acesse `/admin/edu/turno/`.
4. Observe `id` e `descricao` definidos em `list_display`.
5. Pesquise parte de uma descricao.
6. Acesse `/admin/edu/turno/add/` e mostre o form gerado automaticamente.
7. Edite um item em `/admin/edu/turno/<pk>/change/`.
8. Mostre o botao de XLS habilitado pelo `ModelAdminPlus`.

### 5.2. Exemplo integrado: Alunos

1. Abra `edu/admin.py:1601-1615`.
2. Acesse `/admin/edu/aluno/`.
3. Relacione cada coluna da tela a `list_display`.
4. Use a busca e acompanhe os campos de `search_fields`.
5. Aplique unidade, curso, situacao e ano como filtros.
6. Mostre que os cursos do autocomplete dependem da unidade selecionada.
7. Confirme a paginacao de 15 registros e a ordem decrescente por ID.
8. Mostre os icones e explique que dependem das permissoes.
9. Exporte a listagem filtrada para XLS.
10. Abra um aluno e relacione as secoes da tela a `AlunoForm.fieldsets`.

### 5.3. Fluxo completo para leitura de qualquer Admin

```text
1. localizar o model
2. localizar class <Model>Admin
3. localizar admin.site.register(...)
4. identificar app_label e model_name
5. montar /admin/<app>/<model>/
6. ler list_display, busca, filtros, ordem e paginacao
7. verificar get_queryset() e permissoes
8. verificar se ha form personalizado
9. identificar recursos do Django e extensoes do DJTools
```

## F. Perguntas de revisao

1. Por que nao existe uma URL de `TurnoAdmin` em `edu/urls.py`?
2. O que muda no sistema se `admin.site.register(Turno, TurnoAdmin)` for
   removido?
3. Qual e a diferenca entre `list_filter` e `search_fields`?
4. `list_display_icons = True` concede permissao de edicao?
5. Por que `AlunoAdmin` precisa de `AlunoForm`, mas `TurnoAdmin` nao?
6. Qual parte de `AlunoAdmin` limita os alunos visiveis ao usuario?
7. Quais atributos pertencem ao Django e quais sao extensoes do DJTools?

## G. Referencias principais

| Assunto | Arquivo e linhas |
|---|---|
| Versao do Django | `requirements/base.txt:1-2` |
| Prefixo geral do Admin | `suap/urls.py:56-62` |
| Model `Turno` | `edu/models/cadastros_gerais.py:345-363` |
| `TurnoAdmin` e registro | `edu/admin.py:320-328` |
| `AlunoAdmin` | `edu/admin.py:1601-1870` |
| `AlunoForm` | `edu/forms.py:215-408` |
| Escopo de `AlunoAdmin` | `edu/admin.py:1625-1626` |
| Managers de `Aluno` | `edu/models/alunos.py:250-256` e `edu/managers.py:630-682` |
| Permissoes de `AlunoAdmin` | `edu/admin.py:1617-1623` |
| Permissoes no `ModelAdminPlus` | `djtools/contrib/admin/options/__init__.py:295-308` |
| Helpers de permissao | `djtools/utils/__init__.py:1859-2003` |
| `changelist_view()` do SUAP | `djtools/contrib/admin/options/__init__.py:348-385` |
| Criacao do `ChangeListPlus` | `djtools/contrib/admin/options/__init__.py:200-206` |
| Actions de `DiarioAdmin` | `edu/admin.py:1053-1111` |
| Actions dinamicas de `MaterialAulaAdmin` | `edu/admin.py:2406-2428` |
| Actions no `ModelAdminPlus` | `djtools/contrib/admin/options/__init__.py:148-154` |
| Hooks de `MatrizAdmin` | `edu/admin.py:725-753` |
| Resposta de `ProfessorAdmin` | `edu/admin.py:1540-1541` |
| Transacoes do Admin | `djtools/contrib/admin/options/__init__.py:411-443` |
| Redirecionamento `httprr()` | `djtools/utils/response.py:24-84` |
| URL personalizada de `AlunoAdmin` | `edu/admin.py:1651-1662` |
| URL de notificacao de estagios | `edu/admin.py:3410-3424` |
| Wrapper `admin_view()` | `django/contrib/admin/sites.py:198-250` |
| URLs nativas do `ModelAdmin` | `django/contrib/admin/options.py:681-725` |
| `HorarioAulaInline` | `edu/admin.py:356-382` |
| Models de horarios | `edu/models/cadastros_gerais.py:526-578` |
| Formset de itens de avaliacao | `edu/forms.py:9344-9372` |
| `TabularInlinePlus` e `StackedInlinePlus` | `djtools/contrib/admin/options/__init__.py:59-84` |
| Inlines de `MatrizCursoAdmin` | `edu/admin.py:3645-3661` |
| `ModelAdminPlus` | `djtools/contrib/admin/options/__init__.py:87-445` |
| `ChangeListPlus` | `djtools/contrib/admin/views/__init__.py:19-170` |
| Template e fragmento da listagem | `djtools/templates/adminutils/change_list.html:1-203` e `djtools/templates/adminutils/content_main_admin.html:13-70` |
| Filtro autocomplete | `djtools/contrib/admin/filters/__init__.py:174-215` |
| Metaclasse LPS | `djtools/lps.py:44-64` |
| Tarefa de exportacao | `djtools/tasks.py:48-89` |

