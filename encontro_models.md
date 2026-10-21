# Encontro - Django Models no SUAP EDU

## A. Identificação

**Titulo:** Django Models no SUAP: estrutura, persistencia, consultas e regras de negócio.

**Carga horária sugerida:** 2 horas.

**Objetivo geral:** capacitar o participante a compreender como os models do
SUAP representam o domínio, criam estruturas no banco, aplicam regras e sao
consumidos por forms, views, templates, admins e relatórios.

**Objetivos específicos:**

- compreender o papel do model no padrão MTV do Django;
- diferenciar classe de model, instância, registro, tabela e `QuerySet`;
- conhecer campos, relacionamentos, opções e metadados do Django;
- entender `ModelPlus`, `LogModel` e os campos `Plus` do SUAP;
- compreender `objects`, `locals`, managers e querysets personalizados;
- executar consultas seguras e eficientes com o ORM;
- compreender `save()`, `delete()`, `clean()` e `full_clean()`;
- criar e revisar migrations;
- relacionar models com forms, views, templates, admins e permissões;
- distinguir `save()` de atualizacoes diretas com `update()`;
- implementar e testar um model simples integrado ao modulo EDU.

**Pre-requisitos:** Python orientado a objetos, fluxo URL -> view -> template,
forms, permissões e conceitos básicos de banco de dados relacional.

**Aprofundamento opcional:** transações, concorrência, operações em lote,
signals, diagnóstico de desempenho e detalhes internos do `ModelPlus` podem ser
estudados depois dos conteúdos fundamentais. Esses assuntos não fazem parte da
carga obrigatória deste encontro.

## Índice de estudo

### Visão geral

1. [Fluxo central do encontro](#fluxo-central)
2. [Organização do estudo](#organizacao-do-estudo)

### Conteúdo principal

3. [Etapa 1 — Papel do model e organização do EDU](#etapa-1)
4. [Etapa 2 — Campos, opções, relacionamentos e `Meta`](#etapa-2)
5. [Etapa 3 — Recursos exclusivos do SUAP e managers](#etapa-3)
6. [Etapa 4 — Métodos, regras, validação e ciclo da instância](#etapa-4)
7. [Etapa 5 — ORM, consultas e desempenho](#etapa-5)
8. [Etapa 6 — Integração com forms, views e templates](#etapa-6)
9. [Etapa 7 — Migrations e comandos essenciais](#etapa-7)

### Prática e revisão

10. [Etapa 8 — Práticas integradas](#etapa-8)
11. [Etapa 9 — Testes, revisão e fechamento](#etapa-9)

<a id="fluxo-central"></a>
## B. Fluxo central do encontro

```text
Regra do dominio
        |
Classe de model
        |
makemigrations
        |
Arquivo de migration
        |
sqlmigrate / revisao do SQL
        |
migrate
        |
Tabela, colunas, indices e restricoes
        |
Manager / QuerySet / ORM
        |
Form ou View
        |
Template, API, admin ou relatorio
```

Fluxo de alteração de dados:

```text
request
-> form.is_valid()
-> cleaned_data
-> instancia do model
-> model.clean() quando full_clean() e executado
-> save()
-> SQL INSERT ou UPDATE
-> auditoria aplicavel no SUAP
-> redirect ou resposta
```

Alerta conceitual para reforcar desde o inicio:

```text
model.save() nao chama full_clean() automaticamente.
```

Um `ModelForm` executa validações do model durante `is_valid()`, mas uma
instância criada manualmente em uma view, task, shell ou command precisa de
tratamento explicito quando a regra depender de `full_clean()`.

<a id="organizacao-do-estudo"></a>
## C. Organização do estudo

| Tempo | Etapa | Conteúdo | Atividade de estudo | Referências principais |
|---|---:|---|---|---|
| 10 min | 1 | Papel do model e organização do EDU | Ler a estrutura dos arquivos e identificar models | `edu/models/__init__.py`; `edu/models/alunos.py` |
| 15 min | 2 | Campos, opções, relacionamentos e `Meta` | Comparar models reais e seus metadados | `edu/models/plano_ensino.py:6-34`; `edu/models/historico.py:24-48` |
| 10 min | 3 | Recursos exclusivos do SUAP e managers | Relacionar Django, `ModelPlus`, `LogModel`, campos `Plus`, `objects` e `locals` | `djtools/db/models/__init__.py`; `edu/models/logs.py`; `edu/managers.py` |
| 15 min | 4 | Métodos, regras, validação e ciclo da instância | Acompanhar criação, validação, gravação e exclusão | `edu/models/plano_ensino.py:25-57`; `edu/models/cursos.py`; `edu/models/historico.py` |
| 10 min | 5 | ORM, consultas e desempenho | Executar consultas de leitura no shell | `edu/models/`; exemplos de `QuerySet`, `select_related` e agregação |
| 10 min | 6 | Integração com forms, views e templates | Seguir um dado do banco até a interface | `edu/forms.py`; `edu/views.py`; templates do EDU |
| 10 min | 7 | Migrations e comandos | Revisar comandos e migrations antes de aplicar | `edu/migrations/`; comandos desta seção |
| 25 min | 8 | Práticas integradas | Ler um model real e executar consultas no shell | Atividades da Etapa 8 |
| 15 min | 9 | Testes, revisão e fechamento | Conferir segurança, integridade e desempenho | Seções finais do encontro |

**Duração prevista:** 2 horas, incluindo prática e revisão.

### Navegação rápida pelas etapas

1. [Etapa 1 - Papel do model e organização do EDU](#etapa-1)
2. [Etapa 2 - Campos, opções, relacionamentos e Meta](#etapa-2)
3. [Etapa 3 - Recursos exclusivos do SUAP e managers](#etapa-3)
4. [Etapa 4 - Métodos, regras, validação e ciclo da instância](#etapa-4)
5. [Etapa 5 - ORM, consultas e desempenho](#etapa-5)
6. [Etapa 6 - Integração com forms, views e templates](#etapa-6)
7. [Etapa 7 - Migrations e comandos](#etapa-7)
8. [Etapa 8 - Práticas integradas](#etapa-8)
9. [Etapa 9 - Testes, revisão e fechamento](#etapa-9)

<a id="etapa-1"></a>

## Etapa 1 - Papel do model e organização do EDU

Esta etapa apresenta o model como o ponto de partida para representar dados e
regras de negócio. A leitura começa pela classe Python, passa pela tabela criada
no banco e termina nas consultas que alimentam as outras camadas do SUAP.

### 1. O que é um model no Django

Um **model** é uma classe Python que representa uma entidade do domínio da
aplicação e permite consultar e persistir seus dados por meio do ORM do Django.
Em vez de escrever SQL diretamente para cada operação, o desenvolvedor trabalha
com classes, objetos, atributos e métodos Python.

No EDU, entidades como aluno, turma, diário e plano de ensino são representadas
por models. Eles descrevem:

- quais dados a entidade possui;
- quais dados são obrigatórios ou opcionais;
- como ela se relaciona com outras entidades;
- quais restrições devem existir;
- como o objeto é apresentado;
- quais comportamentos e regras pertencem ao domínio.

O model não é apenas uma cópia da tabela. Ele é a representação da entidade no
código e pode reunir estrutura, consultas, validações e comportamentos.

#### 1.1. ORM: ligação entre objetos Python e banco de dados

ORM significa *Object-Relational Mapping*, ou mapeamento objeto-relacional. O
Django traduz operações com objetos e `QuerySets` em comandos SQL executados no
banco.

Correspondencia inicial:

| No código Python | No banco de dados | Exemplo |
| --- | --- | --- |
| Classe de model | Tabela | `PlanoEnsino` |
| Campo do model | Coluna | `ementa` |
| Instância | Registro ou linha | um plano de ensino específico |
| `pk` | Chave primaria | identificador do plano |
| `ForeignKey` | Coluna de chave estrangeira | `diario_id` |
| `Manager` | Entrada para consultas | `PlanoEnsino.objects` |
| `QuerySet` | Consulta componivel | `PlanoEnsino.objects.filter(...)` |

Exemplo de consulta com ORM:

```python
planos = PlanoEnsino.objects.filter(
    data_homologacao__isnull=False,
)
```

Conceitualmente, o Django transforma essa expressao em uma consulta SQL com uma
condição equivalente a `data_homologacao IS NOT NULL`. O desenvolvedor continua
trabalhando com um `QuerySet` de objetos `PlanoEnsino`.

> O ORM reduz a necessidade de SQL manual, mas não elimina a necessidade de
> compreender tabelas, chaves, índices, joins e custo das consultas.

#### 1.2. Herança do model no Django e no SUAP

Um model Django comum herda de `django.db.models.Model`:

```python
from django.db import models

class Exemplo(models.Model):
    nome = models.CharField(max_length=100)
```

No SUAP, a herança costuma ser indireta:

```text
django.db.models.Model
        -> djtools.db.models.ModelPlus
        -> edu.models.logs.LogModel
        -> PlanoEnsino
```

Referências no código:

- `ModelPlus`: `djtools/db/models/__init__.py:462-534`;
- `LogModel`: `edu/models/logs.py:82-149`;
- `PlanoEnsino`: `edu/models/plano_ensino.py:6-57`.

Assim, `PlanoEnsino` continua sendo um model Django, embora declare:

```python
class PlanoEnsino(LogModel):
    ...
```

`ModelPlus` e `LogModel` acrescentam comportamentos do SUAP, mas a persistencia,
os campos, as migrations, os managers e os `QuerySets` continuam baseados no
ORM do Django. Essas classes serao detalhadas na Etapa 3.

#### 1.3. Exemplo real: estrutura de `PlanoEnsino`

**Arquivo:** `edu/models/plano_ensino.py`  
**Linhas:** `6-18`

O trecho abaixo foi formatado em várias linhas e recebeu comentarios didaticos.
No arquivo original, os campos aparecem de forma mais compacta e sem esses
comentarios.

```python
# Define a entidade PlanoEnsino. A heranca de LogModel acrescenta os recursos
# de ModelPlus e a auditoria academica implementada pelo modulo EDU.
class PlanoEnsino(LogModel):
    # Relaciona o plano a um Diario. ForeignKeyPlus e a extensao de
    # ForeignKey criada pelo SUAP. CASCADE determina que a exclusao do diario
    # tambem exclua os planos de ensino dependentes.
    diario = models.ForeignKeyPlus(
        'edu.Diario',
        on_delete=models.CASCADE,
    )

    # TextField armazena texto sem um limite curto predefinido. default=''
    # fornece uma string vazia quando o valor nao e informado, enquanto
    # blank=True permite que o campo fique vazio na validacao dos forms.
    ementa = models.TextField(
        'Ementa',
        default='',
        blank=True,
    )

    # Registra a justificativa do plano. Possui as mesmas regras de
    # preenchimento adotadas para ementa.
    justificativa = models.TextField(
        'Justificativa',
        default='',
        blank=True,
    )

    # Armazena o objetivo geral do plano de ensino.
    objetivo_geral = models.TextField(
        'Objetivo Geral',
        default='',
        blank=True,
    )

    # Armazena os objetivos especificos do componente.
    objetivos_especificos = models.TextField(
        'Objetivos Especificos',
        default='',
        blank=True,
    )

    # Armazena os conteudos que serao trabalhados no componente.
    conteudo_programatico = models.TextField(
        'Conteudo Programatico',
        default='',
        blank=True,
    )

    # Descreve os procedimentos metodologicos adotados no plano.
    metodologia = models.TextField(
        'Metodologia',
        default='',
        blank=True,
    )

    # Permite registrar dados complementares que nao pertencem aos campos
    # anteriores.
    informacoes_adicionais = models.TextField(
        'Informacoes Adicionais',
        default='',
        blank=True,
    )

    # Relaciona o plano ao funcionario que coordena o curso. null=True permite
    # NULL no banco. Como on_delete nao foi informado, ForeignKeyPlus aplica
    # CASCADE por padrao nesta versao do SUAP.
    coordenador_curso = models.ForeignKeyPlus(
        'rh.Funcionario',
        verbose_name='Coordenador do Curso',
        null=True,
    )

    # As tres datas representam etapas diferentes do fluxo do plano. O campo
    # DateFieldPlus e uma extensao do SUAP para datas. null=True permite que a
    # etapa ainda nao realizada seja armazenada como NULL.
    data_submissao = models.DateFieldPlus(
        'Data da Submissao',
        null=True,
    )
    data_aprovacao = models.DateFieldPlus(
        'Data da Aprovacao',
        null=True,
    )
    data_homologacao = models.DateFieldPlus(
        'Data da Homologacao',
        null=True,
    )
```

Leitura do exemplo:

1. `PlanoEnsino` e a classe que representa a entidade.
2. `LogModel` e sua classe-base no EDU.
3. Os atributos declarados com `models.*Field` sao campos do model.
4. `diario` relaciona cada plano a um `Diario`.
5. `ementa` armazena texto e aceita valor vazio no formulário.
6. Os campos de objetivo, conteúdo e metodologia registram a parte pedagogica.
7. `coordenador_curso` relaciona o plano a um funcionario e aceita `NULL`.
8. As datas representam submissao, aprovacao e homologação do plano.
9. Cada instância de `PlanoEnsino` representa um plano específico.

O atributo Python e a coluna do banco não possuem sempre o mesmo nome. Para a
chave estrangeira `diario`, por exemplo:

```text
obj.diario     -> objeto Diario relacionado
obj.diario_id  -> valor da chave estrangeira armazenada no banco
```

#### 1.4. Campos, opções e metadados

Cada objeto de campo informa ao Django o tipo de dado e parte de suas regras.
Algumas opções frequentes no exemplo sao:

| Opcao | Função |
| --- | --- |
| `default=''` | valor usado quando nenhum valor for fornecido |
| `blank=True` | permite valor vazio na validação de formulários |
| `null=True` | permite `NULL` na coluna do banco |
| `verbose_name` | nome humano apresentado em forms e admins |
| `on_delete` | comportamento ao excluir o objeto relacionado |

O bloco `Meta`, em `edu/models/plano_ensino.py:20-23`, configura o model como um
todo:

```python
class Meta:
    verbose_name = 'Plano de Ensino'
    verbose_name_plural = 'Planos de Ensino'
    ordering = ('id',)
```

Nesse caso, `Meta` define os nomes de exibicao e a ordenacao padrão. Campos e
`Meta` serao aprofundados na Etapa 2.

#### 1.5. Da classe Python para a tabela: migrations

Alterar uma classe de model não modifica o banco automaticamente. O fluxo
normal e:

```text
model alterado
-> makemigrations
-> arquivo de migration
-> revisao da migration e do SQL
-> migrate
-> estrutura aplicada ao banco
```

A criação de `PlanoEnsino` esta registrada em
`edu/migrations/0054_auto_20211005_1050.py:15-38`:

```python
operations = [
    migrations.CreateModel(
        name='PlanoEnsino',
        fields=[
            (
                'id',
                models.AutoField(
                    auto_created=True,
                    primary_key=True,
                    serialize=False,
                    verbose_name='ID',
                ),
            ),
            ('ementa', models.TextField(blank=True, default='')),
            (
                'diario',
                djtools.db.models.ForeignKeyPlus(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='edu.diario',
                ),
            ),
        ],
        options={
            'ordering': ('id',),
        },
    ),
]
```

O trecho foi reduzido para destacar os elementos principais. A migration
mostra algo que não aparece explicitamente na classe atual: o campo `id` foi
criado automaticamente como chave primaria.

Sem `Meta.db_table`, o Django forma o nome da tabela a partir do aplicativo e
do model. Para esse caso, o nome convencional e `edu_planoensino`. O nome
efetivo pode ser confirmado no shell:

```python
PlanoEnsino._meta.db_table
```

O arquivo de migration representa a estrutura no momento em que foi criado. A
classe em `models` representa o estado atual esperado pelo código. Migrations
posteriores podem alterar essa estrutura ao longo do tempo.

#### 1.6. Classe, instância e estado de persistência

A classe representa o conjunto de planos; uma instância representa um plano:

```python
# Instancia nova: existe apenas na memoria.
plano = PlanoEnsino(
    diario_id=25,
    ementa='Introducao ao componente',
)

plano.pk is None
# True

# Executa INSERT e persiste o objeto.
plano.save()

plano.pk is None
# False
```

Antes do primeiro `save()`, o objeto esta no estado de inclusão e normalmente
possui `pk=None`. Depois da insercao, o banco atribui a chave primaria e o Django
a coloca em `plano.pk`.

Para uma instância existente:

```python
plano = PlanoEnsino.objects.get(pk=10)
plano.ementa = 'Nova ementa'
plano.save()
```

Alterar `plano.ementa` modifica primeiro o objeto em memoria. A alteração chega
ao banco quando `save()` e executado. O ciclo de vida sera detalhado na Etapa 4.

#### 1.7. Manager e `QuerySet`

Manager e `QuerySet` trabalham juntos, mas possuem responsabilidades
diferentes:

- o **Manager** e o ponto de entrada para consultar ou criar objetos de um
  model;
- o **QuerySet** representa uma consulta e o conjunto de objetos que ela pode
  devolver.

Fluxo simplificado:

```text
Model
  -> Manager
      -> QuerySet
          -> SQL
              -> registros do banco
                  -> instancias do model
```

No exemplo abaixo:

```python
planos = PlanoEnsino.objects.filter(
    data_homologacao__isnull=False,
)
```

- `PlanoEnsino` e a classe do model;
- `objects` e o manager;
- `filter()` solicita ao manager um `QuerySet` filtrado;
- `planos` e o `QuerySet` resultante;
- quando a consulta for avaliada, cada linha retornada sera convertida em uma
  instância de `PlanoEnsino`.

##### 1.7.1. O Manager

O manager pertence a classe do model, e não a uma instância especifica:

```python
# Correto: consulta o conjunto de planos.
PlanoEnsino.objects.all()

# Incorreto: objects nao e acessado por uma instancia.
plano.objects.all()
```

`PlanoEnsino` não declara um manager em
`edu/models/plano_ensino.py:6-57`. Por isso, o Django disponibiliza o manager
padrão chamado `objects`.

O manager oferece métodos para iniciar operações, por exemplo:

```python
PlanoEnsino.objects.all()
PlanoEnsino.objects.filter(data_submissao__isnull=True)
PlanoEnsino.objects.get(pk=10)
PlanoEnsino.objects.create(diario_id=25)
```

Uma analogia util:

- o model define o tipo de documento existente no acervo;
- o manager e o balcao pelo qual se solicita acesso ao acervo;
- o `QuerySet` e a selecao de documentos resultante dos criterios informados.

##### 1.7.2. O `QuerySet`

Um `QuerySet` e uma representacao de uma consulta. Ele pode conter zero, um ou
vários objetos e pode receber novas operações:

```python
planos = PlanoEnsino.objects.all()

planos_submetidos = planos.filter(
    data_submissao__isnull=False,
)

planos_aprovados = planos_submetidos.filter(
    data_aprovacao__isnull=False,
)

planos_ordenados = planos_aprovados.order_by(
    'diario__turma__ano_letivo__ano',
)
```

Cada chamada devolve um novo `QuerySet`. O objeto anterior não e alterado:

```text
planos             -> todos os planos
planos_submetidos  -> somente os submetidos
planos_aprovados   -> submetidos e aprovados
planos_ordenados   -> aprovados em uma ordenacao especifica
```

Essa caracteristica permite construir consultas progressivamente sem perder a
consulta-base.

##### 1.7.3. Tipo de retorno das operações

Nem todo metodo chamado pelo manager ou pelo `QuerySet` devolve o mesmo tipo de
resultado:

| Operacao | Retorno | Comportamento quando não encontra |
| --- | --- | --- |
| `all()` | `QuerySet` | `QuerySet` vazio |
| `filter()` | `QuerySet` | `QuerySet` vazio |
| `exclude()` | `QuerySet` | `QuerySet` vazio |
| `order_by()` | `QuerySet` | mantem a consulta vazia |
| `get()` | uma instância | levanta `DoesNotExist` |
| `first()` | uma instância ou `None` | retorna `None` |
| `exists()` | `bool` | retorna `False` |
| `count()` | `int` | retorna `0` |
| `create()` | uma instância salva | cria o registro ou levanta erro |

Comparacao importante:

```python
# Pode representar nenhum, um ou muitos planos.
planos = PlanoEnsino.objects.filter(pk=10)

# Deve encontrar exatamente um plano.
plano = PlanoEnsino.objects.get(pk=10)

# Retorna a primeira instancia ou None.
plano = PlanoEnsino.objects.filter(pk=10).first()
```

`get()` também levanta `MultipleObjectsReturned` quando encontra mais de um
registro. Por isso, ele deve ser usado quando o criterio identifica um único
objeto, normalmente pela chave primaria ou por uma restricao única.

##### 1.7.4. Avaliação preguiçosa

Na maior parte das operações de leitura, construir um `QuerySet` não executa
imediatamente a consulta. O Django guarda a descrição da consulta até que o
resultado seja necessário:

```python
# Normalmente ainda nao consulta o banco.
planos = PlanoEnsino.objects.filter(
    data_homologacao__isnull=False,
)

# Continua compondo a consulta.
planos = planos.order_by('id')

# A iteracao precisa dos objetos e avalia a consulta.
for plano in planos:
    print(plano)
```

Exemplos de operações que normalmente provocam avaliação ou uma consulta ao
banco:

- iterar com `for`;
- converter com `list()`;
- usar `get()`, `first()` ou `last()`;
- chamar `exists()` ou `count()`;
- acessar uma fatia que precisa ser consumida;
- renderizar os objetos em diversos contextos de template.

Durante o desenvolvimento, a consulta SQL construida pode ser inspecionada:

```python
print(planos.query)
```

Isso ajuda a estudar joins e filtros, mas não substitui a analise do plano de
execução e do volume de dados. Avaliacao preguicosa e desempenho serao
aprofundadas na Etapa 5.

##### 1.7.5. Exemplo real: filtros progressivos

**Arquivo:** `edu/forms.py`  
**Linhas:** `5142-5161`  
**Classe:** `PlanoEnsinoPublicForm`

O metodo `processar()` inicia uma consulta e acrescenta filtros somente quando
o usuário informou os respectivos valores:

```python
def processar(self):
    qs = PlanoEnsino.objects.filter(
        data_homologacao__isnull=False,
    )

    ano_letivo = self.cleaned_data['ano_letivo']
    periodo_letivo = self.cleaned_data['periodo_letivo']
    campus = self.cleaned_data['campus']
    curso = self.cleaned_data['curso']
    componente = self.cleaned_data['componente']

    if ano_letivo:
        qs = qs.filter(diario__ano_letivo=ano_letivo)
    if periodo_letivo:
        qs = qs.filter(diario__periodo_letivo=periodo_letivo)
    if campus:
        qs = qs.filter(
            diario__turma__curso_campus__diretoria__setor__uo=campus
        )
    if curso:
        qs = qs.filter(diario__turma__curso_campus=curso)
    if componente:
        qs = qs.filter(
            diario__componente_curricular__componente=componente
        )

    return qs
```

Leitura do fluxo:

1. `PlanoEnsino.objects` acessa o manager.
2. O primeiro `filter()` cria o `QuerySet` base.
3. Cada condição pode substituir `qs` por um novo `QuerySet` mais restrito.
4. Os dois sublinhados atravessam relacionamentos, como
   `diario -> turma -> curso_campus`.
5. O metodo devolve a consulta pronta para ser consumida por outra camada.
6. Não e necessário escrever uma consulta SQL diferente para cada combinação
   de filtros.

##### 1.7.6. Exemplo real: `exists()` e `count()`

**Arquivo:** `edu/views.py`  
**Linhas:** `986-997`

```python
qs = PlanoEnsino.objects.filter(
    diario__professordiario__professor__vinculo=(
        request.user.get_vinculo()
    ),
    data_submissao__isnull=True,
)

if qs.exists():
    quantidade = qs.count()
```

- `exists()` pergunta se existe pelo menos um resultado e devolve `True` ou
  `False`;
- `count()` solicita ao banco a quantidade de resultados;
- os dois métodos sao operações terminais e podem produzir duas consultas
  distintas;
- se os objetos também forem usados depois, deve-se avaliar o custo total do
  fluxo, e não apenas cada chamada isolada.

No código real, a quantidade e entregue ao item contador da interface. O
exemplo foi reduzido para destacar o comportamento do `QuerySet`.

##### 1.7.7. Exemplo real: criação pelo manager

**Arquivo:** `edu/models/diarios.py`  
**Linhas:** `1198-1200`

Ao salvar um diario cujo curso exige plano de ensino, o sistema cria o plano:

```python
super().save(*args, **kwargs)
if (
    self.turma.curso_campus.plano_ensino
    and not self.planoensino_set.exists()
):
    PlanoEnsino.objects.create(
        diario=self,
        coordenador_curso=self.turma.curso_campus.coordenador,
        ementa=self.componente_curricular.ementa or '',
    )
```

`objects.create()` equivale, de forma simplificada, a:

```python
plano = PlanoEnsino(
    diario=self,
    coordenador_curso=self.turma.curso_campus.coordenador,
    ementa=self.componente_curricular.ementa or '',
)
plano.save()
```

O retorno de `create()` e a instância já persistida, com `pk` preenchida. Como
o metodo `PlanoEnsino.save()` foi sobrescrito, ele participa dessa gravação.

##### 1.7.8. Managers personalizados no SUAP

O manager e a **porta de entrada das consultas de um model**. `objects` e o
nome usado por padrão pelo Django, mas não e uma palavra reservada: o model
pode declarar vários managers, cada um iniciando a consulta com regras
diferentes.

Em `edu/models/alunos.py:250-259`, por exemplo, o mesmo model oferece consultas
com significados distintos:

```python
objects = AlunoManager()                    # consulta geral
locals = AlunoLocalManager()                # considera o usuario atual
ativos = AlunosAtivosManager()              # inicia com situacao__ativo=True
caracterizados = AlunosCaracterizadosManager()  # exige caracterizacao
```

Assim, estes acessos partem da mesma tabela, mas não necessariamente produzem
o mesmo conjunto:

```python
Aluno.objects.all()          # consulta definida por AlunoManager
Aluno.ativos.all()           # somente alunos em situacao ativa
Aluno.caracterizados.all()   # somente alunos com caracterizacao
```

O nome `ativos` apenas comunica a intencao. O filtro real esta no
`get_queryset()` de `AlunosAtivosManager`, em `edu/managers.py:656-658`.

###### Manager e `QuerySet` trabalhando juntos

`Turma` declara `objects` e `locals` em `edu/models/turmas.py:22-24`. O manager
geral usa um `QuerySet` personalizado (`edu/managers.py:393-413`):

```python
class TurmaQuery(models.QuerySet):
    def pendentes(self):
        return self.filter(
            diario__in=Diario.locals.pendentes()
        ).order_by('id').distinct()


class TurmaManager(models.Manager):
    def get_queryset(self):
        # Toda consulta iniciada por este manager sera um TurmaQuery.
        return TurmaQuery(self.model, using=self._db)

    def pendentes(self):
        # O manager delega a regra ao QuerySet personalizado.
        return self.get_queryset().pendentes()
```

Essa separacao tem uma finalidade importante:

- o **manager** inicia a consulta a partir da classe, como em
  `Turma.objects.pendentes()`;
- o **QuerySet** mantem a operação encadeavel, permitindo continuar com
  `.filter()`, `.exclude()` ou `.order_by()`.

Exemplo real em `edu/models/diretorias.py:264`:

```python
qs_turmas_pendentes = Turma.locals.pendentes().filter(...)
```

Leitura passo a passo dessa expressao:

1. `Turma.locals` seleciona o `TurmaLocalManager`;
2. `get_queryset()` monta um `TurmaQuery` e limita as turmas conforme o usuário
   atual (`edu/managers.py:416-446`);
3. `pendentes()` acrescenta a regra de turmas com diarios pendentes;
4. o `filter(...)` final acrescenta a condição especifica daquele caso de uso;
5. o resultado continua sendo um `QuerySet`, e a consulta normalmente so sera
   executada quando seus dados forem consumidos.

###### `objects` e `locals` não sao equivalentes

Em `Turma`, `objects` oferece a consulta geral e `locals` aplica regras por
grupo, diretoria, curso ou polo usando o usuário retornado por `tl.get_user()`
(`edu/managers.py:420-446`). Trocar um pelo outro pode ampliar ou reduzir os
registros retornados.

O manager, entretanto, não substitui a permissao da view. Ele controla o
**escopo da consulta**; decorators e verificacoes de backend controlam se o
usuário pode executar a operação. Ao ler código do SUAP, sempre identificar
qual manager inicia a consulta antes de interpretar o resultado.

##### 1.7.9. Resumo para o estudante

```text
Manager
-> inicia consultas e operacoes do model
-> normalmente e acessado pela classe
-> pode possuir regras e metodos personalizados

QuerySet
-> representa uma consulta e um conjunto potencial de objetos
-> pode ser filtrado, excluido e ordenado
-> normalmente e avaliado somente quando o resultado e necessario
-> pode ser reutilizado e composto antes da execucao
```

Perguntas práticas ao ler uma consulta no SUAP:

1. Qual model esta sendo consultado?
2. Qual manager inicia a consulta: `objects`, `locals`, `ativos` ou outro?
3. A operação devolve `QuerySet`, instância, número ou booleano?
4. Em que momento a consulta sera avaliada?
5. Os filtros atravessam quais relacionamentos?
6. O manager aplica algum recorte de permissao ou unidade organizacional?
7. A consulta pode gerar N+1 quando os objetos forem utilizados?

#### 1.8. O model também representa comportamento

O model pode possuir métodos que expressem comportamentos da entidade. Em
`edu/models/plano_ensino.py:25-57`, `PlanoEnsino` implementa:

- `__str__()`: representacao textual;
- `get_absolute_url()`: URL principal do objeto;
- `save()`: ajuste realizado antes da persistencia;
- `notificar_devolucao()`: notificacao relacionada a devolucao;
- `devolver_para_professor()`: altera o estado e salva;
- `devolver_para_coordenador()`: altera o estado e salva;
- `can_change()`: responde se determinado usuário pode alterar o plano.

Exemplo em `edu/models/plano_ensino.py:31-34`:

```python
def save(self, *args, **kwargs):
    if self.coordenador_curso is None:
        self.coordenador_curso = (
            self.diario.turma.curso_campus.coordenador
        )
    super().save(*args, **kwargs)
```

O metodo garante um coordenador antes de chamar o `save()` herdado. Isso
demonstra que o model pode proteger comportamentos reutilizados por views,
forms, admins, tasks e commands. Os cuidados ao sobrescrever `save()` serao
tratados na Etapa 4.

#### 1.9. Relação entre model, form, view e template

Cada camada possui uma responsabilidade diferente:

| Camada | Responsabilidade principal |
| --- | --- |
| Model | representar dados, relacionamentos e comportamento do domínio |
| Form | receber, converter e validar dados enviados pelo usuário |
| View | coordenar a requisição, permissao, consulta e resposta |
| Template | apresentar os dados ao usuário |
| Banco | armazenar dados e aplicar restrições persistentes |

Exemplo real de edicao do coordenador:

1. O model declara `coordenador_curso` em
   `edu/models/plano_ensino.py:15`.
2. O `AlterarCoordenadorPlanoEnsinoForm`, em
   `edu/forms.py:14168-14171`, escolhe o model e o campo editavel.
3. A view `alterar_coordenador_plano_ensino`, em
   `edu/views.py:14730-14737`, busca a instância, entrega-a ao form e chama
   `form.save()` quando os dados sao válidos.

```python
class AlterarCoordenadorPlanoEnsinoForm(forms.ModelFormPlus):
    class Meta:
        model = PlanoEnsino
        fields = 'coordenador_curso',
```

```python
obj = get_object_or_404(
    PlanoEnsino,
    pk=pk,
    diario__turma__curso_campus__diretoria__setor__uo=(
        request.user.get_vinculo().setor.uo
    ),
)
form = AlterarCoordenadorPlanoEnsinoForm(
    data=request.POST or None,
    instance=obj,
)
if form.is_valid():
    form.save()
```

O form não substitui o model: ele edita uma instância do model. A view não
substitui o model: ela coordena o caso de uso. O banco também não substitui o
model: ele persiste e protege os dados, enquanto a classe oferece a interface
Python usada pela aplicação.

#### 1.10. Analogia para fixacao

Uma analogia simples e pensar no model como a planta e as regras de uso de um
cadastro:

- a classe define a estrutura comum;
- os campos definem quais informações existem;
- cada instância e um cadastro específico;
- a tabela armazena todos os cadastros;
- a chave primaria identifica um cadastro;
- o manager localiza conjuntos de cadastros;
- os métodos expressam comportamentos permitidos.

Resumo para o estudante:

```text
Model = estrutura + relacionamentos + metadados + comportamento
Instancia = um objeto, salvo ou ainda apenas em memoria
Manager/QuerySet = caminho para consultar conjuntos de objetos
Migration = historico versionado das alteracoes estruturais
Banco = persistencia e integridade dos dados
```

### 2. Organização dos models no módulo EDU

O módulo EDU organiza seus models por área do domínio. Essa divisão mantém cada
arquivo legível e facilita encontrar a entidade responsável por uma regra. O
pacote `edu.models` funciona como uma porta de entrada: os arquivos ficam
separados fisicamente, mas suas classes podem ser importadas de forma uniforme.

```text
edu/models/
   ├── alunos.py       → Aluno e dados acadêmicos do aluno
   ├── turmas.py       → Turma e relações com o período letivo
   ├── diarios.py      → Diário, aulas e atividades
   ├── historico.py    → Matrículas e histórico
   └── __init__.py     → Reexporta as classes do pacote
```

Ao investigar uma funcionalidade, comece pelo domínio do dado. Por exemplo, uma
regra sobre matrícula tende a estar em `historico.py`; uma regra sobre horários
de uma turma tende a estar em `turmas.py` ou `diarios.py`. Depois confirme a
localização pesquisando o nome da classe, porque uma entidade pode ser usada em
mais de uma área.

Em uma aplicação Django pequena, os models normalmente ficam em um único
arquivo:

```text
minha_app/
    models.py
```

O modulo EDU possui muitas entidades e regras academicas. Para evitar um único
arquivo excessivamente grande, ele usa um **pacote de models**:

```text
edu/
    models/
        __init__.py
        alunos.py
        cursos.py
        diarios.py
        historico.py
        professores.py
        turmas.py
        plano_ensino.py
        ...
```

Para o Python, uma pasta com `__init__.py` e um pacote importavel. Assim,
`edu.models` corresponde ao pacote `edu/models/`, e não a um único arquivo
`edu/models.py`.

#### 2.1. O aplicativo `edu`

O aplicativo e identificado em `edu/apps.py:4-13`:

```python
from djtools.apps import SuapAppConfig as AppConfig


class EduConfig(AppConfig):
    default = True
    name = 'edu'
    verbose_name = 'Ensino'
    area = 'Ensino'
    description = 'Realiza o controle academico.'
```

O valor `name = 'edu'` identifica o aplicativo. Os models carregados pelo
pacote pertencem a esse app e, salvo configuracao diferente em `Meta`, suas
tabelas usam o prefixo `edu_`.

Exemplos aproximados:

```text
Aluno         -> edu_aluno
Turma         -> edu_turma
PlanoEnsino   -> edu_planoensino
```

O nome efetivo pode ser consultado no shell:

```python
Aluno._meta.app_label
Aluno._meta.db_table
```

#### 2.2. Função de `edu/models/__init__.py`

O arquivo `edu/models/__init__.py:1-34` importa os arquivos internos do pacote:

```python
# pylint: skip-file
# flake8: noqa

from .arquivos import *
from .alunos import *
from .atividades import *
from .cadastros_gerais import *
from .plano_ensino import *
from .cursos import *
from .diarios import *
from .diplomas import *
from .professores import *
from .logs import *
from .historico import *
from .turmas import *
```

O trecho foi reduzido; o arquivo atual possui imports para todos os grupos de
models do EDU.

Cada instrucao possui duas funcoes importantes:

1. importa o modulo e executa as declaracoes das classes;
2. expoe essas classes pelo namespace público `edu.models`.

Por isso, outras partes do sistema podem usar:

```python
from edu.models import Aluno, Diario, Turma
```

em vez de:

```python
from edu.models.alunos import Aluno
from edu.models.diarios import Diario
from edu.models.turmas import Turma
```

Um exemplo real esta em `edu/views.py:332-350`, onde a view importa `Aluno`,
`Cidade`, `Componente` e outras classes diretamente de `edu.models`.

As diretivas `# pylint: skip-file` e `# flake8: noqa`, nas linhas 1-2, evitam
que as ferramentas de analise apontem como erro o grande conjunto de imports
com `*`. Esse formato e uma decisão arquitetural existente no SUAP e deve ser
respeitado ao trabalhar no modulo.

#### 2.3. Como o Django encontra as classes

Durante a inicialização, o Django carrega o modulo de models do aplicativo. No
caso do EDU, esse modulo e o pacote `edu.models`. Ao executar seu `__init__.py`,
os arquivos listados sao importados e as classes concretas sao registradas no
registro de aplicativos do Django.

Fluxo simplificado:

```text
Django carrega o app edu
-> importa edu.models
-> executa edu/models/__init__.py
-> importa alunos.py, cursos.py, diarios.py, ...
-> cria as classes Python
-> registra os models concretos do app edu
```

Consequencia prática: ao criar um novo arquivo dentro de `edu/models/`, e
necessário garantir que ele seja importado pelo pacote. Apenas criar
`edu/models/meu_model.py` não garante que o Django carregara suas classes.

Exemplo:

```python
# edu/models/__init__.py
from .meu_model import *
```

Sem o carregamento da classe, comandos como `makemigrations` podem não detectar
o novo model.

#### 2.4. Mapa dos principais arquivos

Os arquivos são separados por áreas do domínio, não por tipo de campo ou de
operação. A tabela abaixo serve como ponto de partida para localizar uma classe;
ela não substitui a busca pelo nome do model e a leitura de suas relações.

| Arquivo | Responsabilidade predominante | Exemplo real |
| --- | --- | --- |
| `edu/models/alunos.py` | cadastro e regras do aluno | `Aluno`, linha 107 |
| `edu/models/cursos.py` | cursos, matrizes e componentes | `CursoCampus`, linha 500; `Matriz`, linha 714 |
| `edu/models/diarios.py` | diario, aulas e atividades letivas | `Diario`, linha 42 |
| `edu/models/historico.py` | matriculas e histórico acadêmico | `MatriculaPeriodo`, linha 24 |
| `edu/models/professores.py` | dados e regras do professor | `Professor`, linha 22 |
| `edu/models/turmas.py` | turmas e operações de matrícula | `Turma`, linha 19 |
| `edu/models/plano_ensino.py` | planos e referências bibliograficas | `PlanoEnsino`, linha 6 |
| `edu/models/diplomas.py` | emissao e registro de diplomas | `RegistroEmissaoDiploma`, linha 36 |
| `edu/models/diretorias.py` | diretorias academicas | `Diretoria`, linha 22 |
| `edu/models/polos.py` | polos de educacao a distancia | `Polo`, linha 16 |
| `edu/models/procedimentos.py` | procedimentos e requerimentos | `Requerimento`, linha 677 |
| `edu/models/cadastros_gerais.py` | cadastros compartilhados pelo domínio | `Pais`, linha 24; `Estado`, linha 37 |
| `edu/models/logs.py` | auditoria acadêmica | `Log`, linha 14; `LogModel`, linha 82 |

### Como usar o mapa durante uma investigação

Use a tabela para escolher o primeiro arquivo, não para encerrar a busca. Um
fluxo de investigação pode seguir estas etapas:

1. **Identifique o vocabulário da demanda.** Termos como “turma”, “matrícula”,
   “diário” e “plano de ensino” indicam o domínio provável.
2. **Escolha o arquivo correspondente na tabela.** Para uma regra sobre uma
   turma, comece por `edu/models/turmas.py`; para uma matrícula, consulte
   `edu/models/historico.py`.
3. **Localize a classe pelo nome.** Confirme a declaração e leia a classe-base,
   os campos, a classe `Meta`, os managers e os métodos relacionados.
4. **Siga os relacionamentos.** Um `ForeignKey` ou método chamado pelo model
   pode levar a outro arquivo, como `Turma` levando a `Diario` ou `CursoCampus`.
5. **Procure os pontos de uso.** Depois de entender o model, pesquise forms,
   views, templates, admin e migrations que importam ou consultam a classe.

### Exemplo de aplicação

Suponha uma demanda sobre os horários exibidos em uma turma. O mapa sugere
começar em `edu/models/turmas.py`, mas a investigação não termina ali:

```text
demanda sobre horários da turma
        ↓
edu/models/turmas.py → Turma
        ↓ relacionamento ou método
edu/models/diarios.py → Diário e horários
        ↓ consulta usada pela tela
edu/views.py → preparação do contexto
        ↓
edu/templates/turma.html → apresentação
```

Esse percurso evita procurar aleatoriamente no projeto. A cada arquivo, confirme
se ele participa do fluxo e registre a classe, o método ou o relacionamento que
levou ao próximo ponto.

Exemplo de localização de uma classe:

```bash
rg -n '^class Turma\\b' edu/models
```

Depois de encontrar `edu/models/turmas.py`, confirme como a classe é exposta:

```python
from edu.models import Turma

print(Turma._meta.app_label)  # edu
print(Turma._meta.model_name) # turma
```

Esse percurso conecta três nomes que aparecem em pontos diferentes do projeto:
o arquivo físico (`turmas.py`), a classe Python (`Turma`) e o identificador do
Django (`edu.turma`).

Esse mapa e um ponto de partida. Um arquivo pode conter várias classes
relacionadas e utilizar classes declaradas em outros arquivos.

#### 2.5. Imports internos e risco de dependencia circular

Uma dependência circular acontece quando o módulo A precisa importar o módulo B
e, durante essa importação, o módulo B tenta importar novamente o módulo A. O
Python ainda não terminou de criar as classes do primeiro módulo, então uma
classe esperada pode não existir naquele momento.

Exemplo mínimo:

```python
# turmas.py
from .historico import MatriculaPeriodo

class Turma:
    matriculas = MatriculaPeriodo
```

```python
# historico.py
from .turmas import Turma

class MatriculaPeriodo:
    turma = Turma
```

O carregamento forma este ciclo:

```text
turmas.py
   ↓ importa
historico.py
   ↓ importa
turmas.py ainda incompleto
   ↓
ImportError ou classe ausente
```

No Django, esse problema costuma aparecer antes da primeira requisição, quando o
aplicativo carrega `edu.models`. A correção depende do caso:

- usar uma referência em string no relacionamento, como
  `models.ForeignKeyPlus('edu.Turma')`;
- mover um import para dentro do método que realmente precisa dele;
- reorganizar uma regra compartilhada em um módulo independente;
- evitar importar um model apenas para consultar sua classe durante a definição
  de outro model.

As referências em string adiam a resolução do model até o momento adequado do
Django. Imports locais adiam o carregamento até a execução do método. Nenhuma
das duas técnicas deve esconder uma dependência mal organizada; elas servem para
expressar relacionamentos legítimos sem criar um ciclo de inicialização.

Os models do EDU possuem muitos relacionamentos entre si. Por exemplo:

```text
Turma usa MatriculaPeriodo
MatriculaPeriodo se relaciona com Turma
Diario pertence a Turma
Turma consulta Diario
```

Se dois modulos tentarem importar um ao outro durante o carregamento, pode
ocorrer um **import circular**:

```text
turmas.py importa historico.py
-> historico.py importa turmas.py
-> uma das classes ainda nao terminou de ser criada
```

Sintomas comuns:

- `ImportError` informando modulo parcialmente inicializado;
- classe indisponivel durante a importacao;
- erro que depende da ordem dos imports no `__init__.py`;
- aplicativo que falha antes mesmo de atender uma requisição.

O EDU utiliza principalmente referências em string e imports locais para
reduzir esse risco.

#### 2.6. Referências em string nos relacionamentos

Quando o model relacionado ainda pode não estar carregado, o relacionamento
pode usar a forma `'<app_label>.<NomeDoModel>'`.

Exemplo em `edu/models/plano_ensino.py:6-7`:

```python
class PlanoEnsino(LogModel):
    diario = models.ForeignKeyPlus(
        'edu.Diario',
        on_delete=models.CASCADE,
    )
```

O texto `'edu.Diario'` informa:

- `edu`: identificador do aplicativo;
- `Diario`: nome da classe relacionada.

O Django resolve essa referencia por meio do registro de aplicativos depois
que os models forem carregados. Isso evita importar `Diario` no topo de
`plano_ensino.py` apenas para declarar a chave estrangeira.

Outro exemplo aparece em `edu/models/historico.py:24-32`:

```python
class MatriculaPeriodo(LogModel):
    aluno = models.ForeignKeyPlus('edu.Aluno')
    turma = models.ForeignKeyPlus(
        'edu.Turma',
        null=True,
        on_delete=models.SET_NULL,
    )
```

Quando o model esta no mesmo aplicativo, também e possível encontrar apenas o
nome da classe em alguns codigos. A forma com app label e mais explicita e
deve seguir o padrão já adotado ao redor da alteração.

#### 2.7. Imports locais dentro dos métodos

Um import local é um `import` escrito dentro de uma função ou método, em vez de
ficar no início do arquivo. Ele é útil quando a classe importada só é necessária
para executar uma operação específica.

No import do topo, a dependência é carregada durante a inicialização do módulo:

```python
# turmas.py
from edu.models import MatriculaDiario  # executado ao importar o arquivo
```

No import local, o arquivo pode terminar de carregar antes de buscar a outra
classe:

```python
def transferir(self, matriculas_periodo):
    from edu.models import MatriculaDiario  # executado ao chamar o método
    return MatriculaDiario.objects.filter(
        matricula_periodo__in=matriculas_periodo,
    )
```

O momento de execução fica assim:

```text
Importação do módulo
        ↓
Classe é criada sem carregar a dependência secundária
        ↓
Aplicação termina de inicializar os models
        ↓
O método é chamado
        ↓
Import local é resolvido e a consulta é executada
```

Essa técnica pode evitar uma dependência circular entre dois arquivos de models.
Ela também reduz o trabalho feito durante a inicialização quando a operação é
raramente usada. Em contrapartida, o import fica menos visível para quem lê o
topo do arquivo e um erro de importação só aparece quando o método for chamado.

Exemplo em `edu/models/turmas.py:50-69`:

```python
def transferir(self, matriculas_periodo, turma_destino, commit=False):
    from edu.models import MatriculaDiario

    diarios = []
    # ...
    if commit:
        for matricula_periodo in MatriculaPeriodo.objects.filter(
            id__in=matriculas_periodo
        ):
            for matricula_diario in MatriculaDiario.objects.filter(
                matricula_periodo=matricula_periodo,
            ):
                # Executa a transferencia somente quando o metodo e chamado.
                ...
```

Outro exemplo esta em `edu/models/turmas.py:123-132`:

```python
@transaction.atomic
def matricular_alunos(self, matriculas_periodo):
    from edu.models import MatriculaDiario

    # A classe importada e usada durante a operacao.
    MatriculaDiario.objects.get_or_create(
        matricula_periodo=matricula_periodo,
        diario=diario,
    )
```

O import local não deve ser usado sem motivo em todo método. Ele é apropriado
quando evita dependência circular, reduz uma dependência de carregamento ou
segue um padrão já necessário naquele arquivo. Se a classe é usada por vários
métodos e não há risco de ciclo, um import no topo costuma ser mais claro.

#### 2.8. `apps.get_model()` em migrations

Migrations precisam trabalhar com a versao historica do model correspondente
ao ponto em que a migration sera executada. Importar diretamente a classe atual
pode quebrar uma migration antiga depois que o model evoluir.

Por isso, uma data migration recebe o registro histórico `apps` e usa
`apps.get_model()`.

Exemplo em
`edu/migrations/0056_alter_alunoarquivo_tipo_origem_cadastro.py:6-14`:

```python
def definir_valor_tipo_origem_cadastro(apps, schema_editor):
    AlunoArquivo = apps.get_model('edu', 'AlunoArquivo')
    AlunoArquivo.objects.filter(
        observacao__icontains='Documento fornecido pelo aluno'
    ).update(
        tipo_origem_cadastro='MATRICULA_ONLINE'
    )


def remover_valor_tipo_origem_cadastro(apps, schema_editor):
    AlunoArquivo = apps.get_model('edu', 'AlunoArquivo')
    AlunoArquivo.objects.all().update(
        tipo_origem_cadastro=None
    )
```

Nesse contexto:

- `'edu'` e o app label;
- `'AlunoArquivo'` e o nome do model;
- a classe retornada representa o estado histórico conhecido pela migration;
- métodos personalizados da classe atual podem não estar disponiveis;
- a função reversa permite desfazer a transformacao de dados.

Regra prática:

```text
Codigo normal da aplicacao
-> from edu.models import Aluno

Codigo de RunPython em migration
-> apps.get_model('edu', 'Aluno')
```

#### 2.9. Como localizar um model no EDU

Quando uma view, form ou template utiliza uma classe e não se sabe onde ela foi
declarada, siga estes passos:

1. procurar a declaracao da classe:

   ```bash
   rg -n '^class Aluno\\b' edu/models
   ```

2. abrir o arquivo encontrado e identificar a classe-base;
3. verificar campos, `Meta`, managers e métodos;
4. procurar usos relevantes:

   ```bash
   rg -n 'Aluno\.objects|Aluno\.locals' edu
   ```

5. procurar forms e views que importam o model;
6. verificar migrations quando a alteração envolver estrutura ou dados;
7. verificar customizacoes LPS quando o comportamento da instalacao divergir.

### Exemplo completo: localizar `Aluno`

Suponha que uma view use `Aluno`, mas o arquivo de origem ainda não seja
conhecido. A busca começa pela declaração da classe:

```bash
rg -n '^class Aluno\\b' edu/models
```

Um resultado possível é:

```text
edu/models/alunos.py:107:class Aluno(LogModel):
```

A leitura desse resultado informa três coisas:

| Parte do resultado | Interpretação |
| --- | --- |
| `edu/models/alunos.py` | arquivo que contém a declaração |
| `107` | linha em que a classe começa |
| `class Aluno(LogModel)` | nome da classe e sua classe-base |

Depois, abra algumas linhas ao redor da declaração e confira a estrutura:

```bash
Get-Content edu/models/alunos.py | Select-Object -Skip 106 -First 35
```

Em seguida, procure como o model é consultado e importado:

```bash
rg -n 'Aluno\\.objects|Aluno\\.locals|from edu\\.models import Aluno' edu
```

A interpretação deve responder:

1. qual manager inicia a consulta;
2. se existe um manager contextual, como `locals`;
3. quais forms e views utilizam a classe;
4. quais templates recebem os dados;
5. quais migrations e regras LPS podem alterar o comportamento.

O objetivo não é apenas descobrir o arquivo. É reconstruir o caminho da classe
desde a declaração até os pontos em que ela é consultada, alterada e apresentada.

Para `PlanoEnsino`, por exemplo:

```text
declaracao
-> edu/models/plano_ensino.py:6

exportacao pelo pacote
-> edu/models/__init__.py:10

form de edicao
-> edu/forms.py:14168-14171

view de edicao
-> edu/views.py:14730-14737

migration de criacao
-> edu/migrations/0054_auto_20211005_1050.py:15-38
```

#### 2.10. Cuidados ao adicionar ou mover models

Antes de criar um model ou mover uma classe entre arquivos:

1. confirme em qual arquivo aquele domínio já esta organizado;
2. preserve o `app_label` e o nome do model para evitar mudancas indevidas de
   tabela e `ContentType`;
3. adicione o novo modulo ao `edu/models/__init__.py`, quando necessário;
4. prefira referências em string nos relacionamentos sujeitos a ciclo;
5. use imports locais somente quando houver justificativa;
6. não altere a ordem dos imports do pacote sem analisar dependencias;
7. gere e revise a migration;
8. execute `python manage.py check` e testes focados;
9. verifique forms, views, admins, permissões, templates e relatórios afetados.

Resumo:

```text
edu.models e a interface publica dos models do EDU.
edu/models/__init__.py carrega e expoe os modulos internos.
Cada arquivo agrupa uma parte do dominio academico.
Strings e imports locais ajudam a controlar dependencias circulares.
Migrations usam apps.get_model() para acessar models historicos.
```

<a id="etapa-2"></a>

## Etapa 2 - Campos, opções, relacionamentos e Meta

Depois de compreender o model, o próximo passo é entender como ele descreve seus
dados. Campos representam valores, relacionamentos conectam entidades e a classe
`Meta` reúne configurações que orientam o comportamento do Django e do banco.

Nesta etapa, o estudante parte dos tipos de campo e chega aos relacionamentos,
metadados e restrições que definem a estrutura persistida.

### 1. Campos nativos do Django

Um campo define o tipo de dado que o model aceita, como esse dado sera
representado no banco e parte de sua validação. Quando um `ModelForm` e criado,
o Django também usa a definicao do campo para escolher o campo e o widget do
formulário.

> **Atencao:** no EDU e comum encontrar campos como `CharFieldPlus`,
> `DateFieldPlus`, `ForeignKeyPlus` e `FileFieldPlus`. Eles sao extensoes do
> SUAP, importadas por `from djtools.db import models`. Os campos nativos
> continuam sendo os do Django; as variantes `Plus` acrescentam comportamentos
> utilizados pelo SUAP e serao detalhados na Etapa 3 deste encontro.

#### 1.1. Principais campos encontrados no EDU

Os campos podem ser organizados por categoria, sem esgotar todas as classes do Django:

| Categoria | Campos principais | Exemplos reais |
| --- | --- | --- |
| Texto | `CharField`, `TextField`, `CharFieldPlus` | `Turma.codigo` e `Turma.descricao`, em `edu/models/turmas.py:26-27` |
| Numérico | `IntegerField`, `PositiveIntegerField`, `DecimalField` | `Turma.periodo_matriz` e `Turma.quantidade_vagas`, em `edu/models/turmas.py:30-36` |
| Booleano | `BooleanField` | `MatriculaPeriodo.excluida`, em `edu/models/historico.py:33` |
| Data e hora | `DateField`, `DateTimeField` e versoes `Plus` | utilizados em calendarios, historicos e procedimentos |
| Arquivo e imagem | `FileField`, `ImageField` e campos do DJTools | `Aluno.foto`, em `edu/models/alunos.py:265` |
| Relacionamento | `ForeignKey`, `OneToOneField`, `ManyToManyField` e versoes `Plus` | `Aluno.pessoa_fisica`, em `edu/models/alunos.py:266` |

Exemplo para leitura:

```python
# edu/models/alunos.py:261-268
codigo_academico = models.IntegerField(null=True, db_index=True)
matricula = models.CharFieldPlus('Matricula', max_length=255, db_index=True)
foto = ImageWithThumbsField(..., null=True, blank=True)
pessoa_fisica = models.ForeignKeyPlus(
    'rh.PessoaFisica',
    verbose_name='Pessoa Fisica',
    related_name='aluno_edu_set',
)
estado_civil = models.CharFieldPlus(
    choices=ESTADO_CIVIL_CHOICES,
    null=True,
)
```

O tipo define o dado aceito e influencia banco, formulário, validação e
serializacao. As opções alteram o comportamento desse campo.

#### 1.2. Principais opções dos campos

As opções abaixo aparecem repetidamente nos models do EDU:

| Opcao | Função | Exemplo real |
| --- | --- | --- |
| `verbose_name` | Define o nome legível usado em formulários, admin e mensagens. Também pode ser passado como primeiro argumento posicional. | `Turma.codigo`, em `edu/models/turmas.py:26`. |
| `null=True` | Permite armazenar `NULL` na coluna do banco. | `Turma.matriz`, em `edu/models/turmas.py:33`. |
| `blank=True` | Permite que o valor fique vazio durante a validação de forms e models. | `Turma.polo`, em `edu/models/turmas.py:37`. |
| `default` | Fornece um valor quando o objeto e criado sem informar o campo. Pode receber um valor ou uma função chamavel. | `Turma.quantidade_vagas`, em `edu/models/turmas.py:36`. |
| `max_length` | Limita o tamanho do texto e participa da validação e da definicao da coluna. | `Aluno.numero_rg`, em `edu/models/alunos.py:345`. |
| `choices` | Restringe os valores aceitos e associa cada valor armazenado a um rótulo legível. | `Turma.periodo_letivo`, em `edu/models/turmas.py:29`. |
| `unique=True` | Cria uma regra de unicidade para o campo. | `FormaIngresso.descricao`, em `edu/models/cadastros_gerais.py:212`. |
| `db_index=True` | Cria um índice para acelerar filtros e ordenações, com custo adicional de armazenamento e escrita. | `Aluno.codigo_academico`, em `edu/models/alunos.py:262`. |
| `editable=False` | Retira o campo dos `ModelForm` gerados automaticamente e indica que ele não deve ser editado diretamente. | `Arquivo.tipo_origem_cadastro`, em `edu/models/arquivos.py:106`. |
| `help_text` | Exibe uma orientação junto ao campo em formulários gerados a partir do model. | `AtividadeComplementar.descricao`, em `edu/models/atividades_complementares.py:109`. |
| `primary_key=True` | Define a chave primaria do model. | `ConfiguracaoAtividadeAprofundamento.id`, em `edu/models/atividades_complementares.py:15`. |
| `upload_to` | Define onde o arquivo sera armazenado dentro do storage configurado. | `MaterialAula.arquivo`, em `edu/models/diarios.py:1782`. |

### Comparando opções em um campo

Considere este campo de exemplo:

```python
codigo = models.CharFieldPlus(
    'Código da turma',
    max_length=20,
    null=True,
    blank=True,
    default='PENDENTE',
    db_index=True,
    verbose_name='Código exibido',
)
```

Cada opção atua em uma parte diferente do sistema:

| Opção | Pergunta que responde | Efeito no exemplo |
| --- | --- | --- |
| `null=True` | A coluna pode armazenar `NULL`? | Sim, o banco aceita ausência de valor. |
| `blank=True` | O formulário pode ser enviado vazio? | Sim, a validação de entrada permite o vazio. |
| `default='PENDENTE'` | Que valor usar quando nada for informado? | A nova instância recebe `PENDENTE`. |
| `db_index=True` | Esse campo é filtrado com frequência? | O banco cria um índice para acelerar buscas. |
| `verbose_name='Código exibido'` | Qual rótulo aparece para o usuário? | Forms e admin apresentam esse texto. |

Observe que `null` e `blank` não são equivalentes. `null` pertence ao
armazenamento no banco; `blank` pertence à validação. `default` fornece um valor
inicial, mas não impede que o campo seja alterado depois. `db_index` pode melhorar
leituras frequentes, porém aumenta o custo de escrita e ocupa espaço. Já
`verbose_name` altera a apresentação, não o nome da coluna.

Exemplo de comparação:

```python
observacao = models.CharFieldPlus(
    'Observação',
    max_length=255,
    blank=True,
)

quantidade = models.PositiveIntegerField(
    default=0,
    db_index=True,
    verbose_name='Quantidade de vagas',
)
```

No primeiro campo, o formulário pode aceitar texto vazio e o banco normalmente
recebe `''`. No segundo, uma nova instância começa com zero, e as consultas por
quantidade podem usar o índice. A combinação adequada depende do significado do
dado e do padrão já adotado pelo módulo.

##### `null` não e a mesma coisa que `blank`

```text
null=True
-> e uma configuracao de armazenamento: aceita NULL no banco.

blank=True
-> e uma configuracao de validacao: aceita valor vazio em forms e em
   chamadas a full_clean().
```

Por isso, `null=False, blank=True` e uma combinação possível: o formulário pode
aceitar o campo vazio, mas o Django o salva como string vazia em um campo
textual. Também e possível encontrar `null=True, blank=False`: o banco aceita
`NULL`, mas um formulário gerado a partir do model exige que o usuário informe
o valor.

Evitar recomendar `null=True` para campos textuais sem verificar o padrão do
projeto, pois isso pode criar dois estados para ausencia de texto: `NULL` e
string vazia.

#### 1.3. Como funciona `choices`

O recurso `choices` define um conjunto de alternativas permitidas para um
campo. Cada alternativa possui dois elementos:

```python
[valor_salvo_no_banco, rotulo_mostrado_ao_usuario]
```

Um exemplo completo esta no model `EstagioDocente`, em
`edu/models/estagio_docente.py:14-27`:

```python
class EstagioDocente(LogModel):
    # Valores efetivamente armazenados no banco.
    NIVEL_FUNDAMENTAL = 1
    NIVEL_MEDIO = 2
    NIVEL_FUNDAMENTAL_E_MEDIO = 3

    # Pares formados por valor interno e descricao apresentada ao usuario.
    NIVEL_CHOICES = [
        [NIVEL_FUNDAMENTAL, 'Fundamental'],
        [NIVEL_MEDIO, 'Medio'],
        [NIVEL_FUNDAMENTAL_E_MEDIO, 'Fundamental e Medio'],
    ]

    # O banco recebe um inteiro, mas forms e telas podem usar os rotulos acima.
    nivel = models.IntegerField(
        'Nivel de Ensino',
        null=True,
        blank=False,
        choices=NIVEL_CHOICES,
    )
```

Neste caso:

| Valor em Python/banco | Texto apresentado |
| --- | --- |
| `1` | `Fundamental` |
| `2` | `Medio` |
| `3` | `Fundamental e Medio` |

O valor deve ter tipo compativel com o campo. Como `nivel` e um
`IntegerField`, os valores internos sao inteiros. O rótulo e apenas a
representacao legível; ele não substitui o valor salvo no banco.

##### Efeito no formulário

Quando `nivel` participa de um `ModelForm`, o Django normalmente cria um campo
de selecao. O HTML envia `1`, `2` ou `3`; durante `form.is_valid()`, o valor e
convertido para o tipo do campo e conferido contra `NIVEL_CHOICES`. Um valor
fora da lista produz erro de validação.

Isso acontece no formulário real `EstagioDocenteForm`, em
`edu/forms.py:12572-12583`. O formulário aponta para `EstagioDocente` e inclui
`nivel` no primeiro grupo de campos:

```python
class EstagioDocenteForm(forms.ModelFormPlus):
    class Meta:
        model = EstagioDocente
        exclude = ('matricula_diario',)

    fieldsets = (
        (
            'Dados Gerais',
            {
                'fields': (
                    'turno',
                    'convenio',
                    'escola',
                    'nivel',
                    'professor_coordenador',
                    'professor_orientador',
                )
            },
        ),
        # Demais grupos omitidos para concentrar o exemplo no campo nivel.
    )
```

Como o formulário não redeclara `nivel`, o `ModelFormPlus` o constroi a partir
do campo do model e respeita seus `choices`. O formulário exibira os rótulos ao
usuário, mas `form.cleaned_data['nivel']` contera o valor interno
correspondente.

##### Como obter o rótulo de uma instância

Para todo campo que possui `choices`, o Django cria automaticamente o metodo
`get_<nome_do_campo>_display()`:

```python
estagio = EstagioDocente.objects.get(pk=10)

estagio.nivel
# 2

estagio.get_nivel_display()
# 'Medio'
```

O próprio EDU usa esse recurso em `edu/models/estagio_docente.py:126-127`. O
metodo `get_escola()` combina o nome da escola com o rótulo do nivel:

```python
def get_escola(self):
    return f'{format_(self.escola)} ({format_(self.get_nivel_display())})'
```

Outro exemplo e `Turma.periodo_letivo`, definido com
`PERIODO_LETIVO_CHOICES` em `edu/models/turmas.py:29`. A constante e importada
de `edu/models/cadastros_gerais.py:9`, que, nesta instalacao, obtem as opções de
`settings.PERIODO_LETIVO_CHOICES`. Isso permite que uma configuracao comum seja
reutilizada por vários models do EDU.

##### Validação e limite de segurança

`choices` participa da validação do campo, mas não deve ser confundido com uma
restricao de banco. Uma chamada direta a `save()` não executa `full_clean()`
automaticamente:

```python
estagio = EstagioDocente(nivel=99)
estagio.full_clean()  # Gera ValidationError: 99 nao e uma escolha valida.
```

Um `ModelForm` executa essa validação no fluxo de `is_valid()`. Entretanto,
atribuir um valor invalido e chamar apenas `save()` pode contornar a validação,
caso não exista outra regra no banco ou no model. Por isso:

- entradas do usuário devem passar por forms ou validação equivalente;
- regras criticas de integridade podem exigir também `CheckConstraint`;
- alterar valores já utilizados em `choices` exige avaliar os registros
  existentes e, quando necessário, criar uma migration de dados;
- o código deve comparar o valor com a constante, como
  `EstagioDocente.NIVEL_MEDIO`, e não com o rótulo `'Medio'`.

### 2. Relacionamentos

Relacionamentos permitem que um model se conecte a outro sem duplicar seus
dados. No banco, eles sao representados por chaves estrangeiras ou por uma
tabela intermediaria. No Python, o ORM permite navegar entre os objetos e
realizar filtros atravessando essas relacoes.

Os três relacionamentos principais sao:

| Relacionamento | Cardinalidade | Exemplo |
| --- | --- | --- |
| `ForeignKey` | muitos para um | vários planos de ensino podem apontar para um diario |
| `OneToOneField` | um para um | um ano possui no máximo uma configuracao de certificado ENEM |
| `ManyToManyField` | muitos para muitos | um diario pode ter várias salas secundarias e uma sala pode aparecer em vários diarios |

#### 2.1. `ForeignKey` e `ForeignKeyPlus`

Uma `ForeignKey` fica no model que representa o lado "muitos" da relação. O
campo guarda a chave primaria do objeto relacionado.

**Exemplo 1 - `ForeignKeyPlus` em um model do EDU**

- arquivo: `edu/models/plano_ensino.py`;
- linhas: `6-15`;
- campos observados: `diario` e `coordenador_curso`.

O exemplo mais simples deste encontro e `PlanoEnsino.diario`:

```python
class PlanoEnsino(LogModel):
    diario = models.ForeignKeyPlus(
        'edu.Diario',
        on_delete=models.CASCADE,
    )

    ementa = models.TextField('Ementa', default='', blank=True)
    coordenador_curso = models.ForeignKeyPlus(
        'rh.Funcionario',
        verbose_name='Coordenador do Curso',
        null=True,
    )
```

**Exemplo 2 - `ForeignKey` nativa e `ForeignKeyPlus` lado a lado**

- arquivo: `edu/models/cadastros_gerais.py`;
- linhas: `104-112`;
- model observado: `Cidade`.

```python
class Cidade(models.ModelPlus):
    nome = models.UnaccentField(
        verbose_name='Nome',
        db_index=True,
        max_length=255,
    )
    estado = models.ForeignKey(
        'edu.Estado',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    pais = models.ForeignKeyPlus(
        'edu.Pais',
        verbose_name='Pais',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
```

`estado` usa a classe nativa do Django, enquanto `pais` usa a extensao do
SUAP. Para o ORM, os dois representam uma chave estrangeira. A diferença esta
nas conveniencias acrescentadas pelo `ForeignKeyPlus`, especialmente sua
integração com os formulários do SUAP.

Observe cada parte:

- `'edu.Diario'` informa o model relacionado usando a forma
  `'<app_label>.<Model>'`;
- a referencia em string adia a resolucao do model e ajuda a evitar imports
  circulares;
- `on_delete=models.CASCADE` define o comportamento quando o diario for
  excluido;
- `null=True` em `coordenador_curso` permite que a chave estrangeira seja
  `NULL` no banco;
- sem `null=True`, o relacionamento e obrigatorio no banco.

**Implementacao do `ForeignKeyPlus`:**

- arquivo: `djtools/db/models/__init__.py`;
- linhas: `96-107`.

`ForeignKeyPlus` não e nativo do Django. Ele herda de `models.ForeignKey`,
define `CASCADE` como comportamento padrão quando `on_delete` não e informado
e usa o `ModelChoiceFieldPlus` nos formulários:

```python
class ForeignKeyPlus(models.ForeignKey):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('on_delete', models.CASCADE)
        super().__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        kwargs.setdefault('form_class', formfields.ModelChoiceFieldPlus)
        return super(self.__class__, self).formfield(**kwargs)
```

Assim, o relacionamento continua sendo uma `ForeignKey` para o ORM e para o
banco. A diferença aparece principalmente no valor padrão de `on_delete` e na
integração com os formulários do SUAP.

#### 2.2. Objeto relacionado e atributo `<campo>_id`

O relacionamento usado nos primeiros exemplos e declarado em:

- arquivo: `edu/models/plano_ensino.py`;
- linhas: `6-7`;
- campo: `PlanoEnsino.diario`.

Para cada chave estrangeira, o Django disponibiliza dois atributos:

```python
plano = PlanoEnsino.objects.get(pk=10)

plano.diario
# Retorna a instancia de Diario. Pode executar uma nova consulta ao banco.

plano.diario_id
# Retorna somente a chave primaria armazenada, sem buscar o objeto Diario.
```

O sufixo `_id` também pode ser usado ao criar, alterar e filtrar registros:

```python
plano = PlanoEnsino(diario_id=25, ementa='Ementa da disciplina')
plano.save()

planos = PlanoEnsino.objects.filter(diario_id=25)
```

Isso e util quando o código já possui o identificador e não precisa carregar o
objeto relacionado.

**Exemplo real 1 - filtro utilizando atributos `_id`:**

- arquivo: `edu/models/alunos.py`;
- linhas: `627-630`;
- metodo: `Aluno.is_periodo_solicitacao_trancamento_voluntario()`.

```python
mp = self.get_ultima_matricula_periodo()
diario = Diario.objects.filter(
    componente_curricular__matriz_id=self.matriz.id,
    matriculadiario__matricula_periodo__aluno_id=self.id,
    ano_letivo_id=mp.ano_letivo.id,
    periodo_letivo=mp.periodo_letivo,
).first()
```

Nesse filtro, `matriz_id`, `aluno_id` e `ano_letivo_id` fazem a comparacao
pelas chaves primarias armazenadas nas respectivas chaves estrangeiras.

**Exemplo real 2 - filtro direto pelo ID da pessoa física:**

- arquivo: `edu/views.py`;
- linhas: `492-494`.

```python
professor = Professor.objects.filter(
    vinculo__pessoa_id=vinculo.pessoa.id
).first()
alunos = Aluno.objects.filter(pessoa_fisica_id=vinculo.pessoa.id)
```

O campo `Aluno.pessoa_fisica` que origina `pessoa_fisica_id` esta declarado em
`edu/models/alunos.py:266`. No lado de `Aluno`, o filtro compara diretamente a
coluna da chave estrangeira. Observe, contudo, que `vinculo.pessoa.id` pode
carregar `pessoa`; quando apenas a chave for necessária e estiver disponivel,
`vinculo.pessoa_id` evita esse acesso ao objeto relacionado.

Ao atribuir uma instância, usa-se o nome normal do campo:

```python
plano.diario = diario
plano.save()
```

Ao atribuir somente a chave primaria, usa-se o atributo com `_id`:

```python
plano.diario_id = diario.pk
plano.save()
```

#### 2.3. Relacionamento reverso

Uma `ForeignKey` cria uma ligação em dois sentidos. No lado do objeto filho,
lemos o objeto relacionado; no lado do objeto pai, o Django cria um acesso
reverso para consultar todos os filhos que apontam para ele.

Pense em uma seta saindo de `PlanoEnsino` e chegando a `Diario`:

```text
PlanoEnsino.diario  ───────────────▶  Diario
       ▲                               │
       └── diario.planoensino_set ◀────┘
           todos os planos deste diário
```

Como `PlanoEnsino.diario`, em `edu/models/plano_ensino.py:7`, não declara
`related_name`, o Django cria automaticamente o nome reverso
`<model>_set`:

```python
diario = Diario.objects.get(pk=25)

planos = diario.planoensino_set.all()
```

`diario.planoensino_set` não é uma lista pronta: é um manager relacionado que
monta consultas para aquele diário. Por isso, podemos usar operações de
`QuerySet`, como `all()`, `filter()`, `exclude()`, `exists()` e `count()`:

```python
planos_submetidos = diario.planoensino_set.filter(
    data_submissao__isnull=False,
)

if diario.planoensino_set.exists():
    quantidade = diario.planoensino_set.count()
```

O filtro é aplicado no banco. Assim, em vez de carregar todos os planos para
depois filtrá-los em Python, a consulta já pede somente os registros ligados
ao objeto atual:

```text
diario (pk=25)
    │
    └── planoensino_set
            ├── PlanoEnsino(pk=41, diario_id=25)
            ├── PlanoEnsino(pk=58, diario_id=25)
            └── PlanoEnsino(pk=73, diario_id=25)

diario.planoensino_set.filter(data_submissao__isnull=False)
    └── retorna apenas os planos do pk=25 que foram submetidos
```

O acesso reverso é útil quando a tela começa pelo objeto pai e precisa mostrar
seus registros relacionados: os planos de um diário, as turmas de um ano ou
os avisos de uma turma. Para confirmar o nome disponível, consulte o campo
que declara a `ForeignKey` e verifique se ele usa `related_name`.

Quando o nome automático não comunica bem a relação, defina um nome explícito:

```python
class Aviso(models.Model):
    turma = models.ForeignKey(
        'Turma',
        on_delete=models.CASCADE,
        related_name='avisos',
    )

turma.avisos.filter(ativo=True)
```

#### 2.4. Personalizacao com `related_name`

`related_name` define o nome do acesso reverso criado pelo Django. Ele não
altera a coluna da chave estrangeira nem o relacionamento no banco: apenas
torna mais claro como o objeto relacionado será acessado no código.

### Nome padrão e nome personalizado

Considere este campo sem `related_name`:

```python
class Turma(models.Model):
    ano_letivo = models.ForeignKey('comum.Ano', on_delete=models.CASCADE)
```

O Django cria automaticamente o acesso reverso `ano.turma_set`:

```python
ano = Ano.objects.get(ano=2026)
turmas = ano.turma_set.all()
```

O sufixo `_set` funciona, mas não informa qual campo criou a relação. Quando
o model possui mais de uma `ForeignKey` para `Ano`, nomes automáticos também
podem ficar ambíguos ou entrar em conflito.

Com `related_name`, escolhemos um nome que descreve a relação:

```python
class Turma(LogModel):
    ano_letivo = models.ForeignKeyPlus(
        'comum.Ano',
        verbose_name='Ano Letivo',
        related_name='turma_por_ano_letivo_set',
        on_delete=models.CASCADE,
    )
```

Com isso, a consulta a partir de `Ano` usa o nome escolhido pelo model:

```python
ano = Ano.objects.get(ano=2026)
turmas = ano.turma_por_ano_letivo_set.all()
```

O efeito pode ser visualizado assim:

```text
Sem related_name                         Com related_name
Ano ──▶ Turma                            Ano ──▶ Turma
  └── turma_set                             └── turma_por_ano_letivo_set

ano.turma_set.all()                      ano.turma_por_ano_letivo_set.all()
```

Portanto, depois que um nome personalizado é definido, o nome padrão deixa de
existir para aquele campo. O código deve usar somente o nome escolhido.

Um nome explícito também ajuda a distinguir relações diferentes com o mesmo
model. Em `edu/models/alunos.py:339-341`, por exemplo, o campo que representa
o ano de conclusão usa `related_name='aluno_ano_conclusao_set'`. Dessa forma,
fica evidente que a consulta representa alunos pelo ano em que concluíram o
curso, e não qualquer outra relação com `Ano`.

Ao escolher um `related_name`, prefira um nome no plural, estável e relacionado
ao significado do campo. Antes de alterar um nome já utilizado, procure suas
ocorrências no projeto, porque views, forms, templates e consultas podem usar
esse atributo reverso.

#### 2.5. Consultas atravessando relacionamentos

Nas consultas ORM, dois sublinhados (`__`) atravessam relacionamentos. O metodo
`Turma.get_alunos_matriculados()`, em `edu/models/turmas.py:76-77`, apresenta um
exemplo real:

```python
def get_alunos_matriculados(self):
    return (
        MatriculaPeriodo.objects
        .filter(turma=self)
        .order_by('aluno__pessoa_fisica__nome', 'aluno__pk')
        .select_related('aluno__pessoa_fisica')
    )
```

Neste código:

- `filter(turma=self)` compara a chave estrangeira com a turma atual;
- `aluno__pessoa_fisica__nome` atravessa `MatriculaPeriodo -> Aluno ->
  PessoaFisica`;
- `aluno__pk` acessa a chave primaria do aluno;
- `select_related('aluno__pessoa_fisica')` antecipa o carregamento das chaves
  estrangeiras e reduz consultas repetidas.

#### 2.6. `ManyToManyField` e `ManyToManyFieldPlus`

Uma relação muitos para muitos precisa de uma tabela intermediaria. Essa tabela
guarda, pelo menos, as chaves dos dois models relacionados.

Em `edu/models/diarios.py:64-82`, um diario possui uma sala principal e pode
possuir várias salas secundarias:

```python
class Diario(LogModel):
    local_aula = models.ForeignKeyPlus(
        'comum.Sala',
        verbose_name='Local de Aula',
        null=True,
    )
    locais_aula_secundarios = models.ManyToManyFieldPlus(
        'comum.Sala',
        verbose_name='Locais de Aula Secundarios',
        blank=True,
        related_name='locais_aula_secundarios',
    )
```

Operacoes comuns:

```python
diario.locais_aula_secundarios.all()          # Lista as salas.
diario.locais_aula_secundarios.add(sala)      # Acrescenta uma sala.
diario.locais_aula_secundarios.remove(sala)   # Remove uma sala.
diario.locais_aula_secundarios.set(salas)     # Substitui o conjunto.
diario.locais_aula_secundarios.clear()        # Remove todas as associacoes.
```

Um uso real de `set()` esta em `edu/forms.py:1579-1582`:

```python
self.diario.local_aula = sala
self.diario.locais_aula_secundarios.set(salas_secundarias)
self.diario.save()
```

Outro exemplo real aparece em `edu/models/turmas.py:385-392`, onde o aluno e
salvo antes de ser adicionado aos participantes de uma turma de minicurso:

```python
aluno.save()
self.participantes.add(aluno)
```

Esse ordenamento e necessário porque os dois objetos precisam possuir chave
primaria antes da criação da linha na tabela intermediaria.

`ManyToManyFieldPlus` esta implementado em
`djtools/db/models/__init__.py:124-131`. Ele herda do campo nativo e troca o
campo de formulário padrão por `MultipleModelChoiceFieldPlus`:

```python
class ManyToManyFieldPlus(models.ManyToManyField):
    def formfield(self, **kwargs):
        kwargs.setdefault(
            'form_class',
            formfields.MultipleModelChoiceFieldPlus,
        )
        return super(self.__class__, self).formfield(**kwargs)
```

#### 2.7. Comportamento de `on_delete`

`on_delete` define o que o Django deve fazer com os registros dependentes
quando o objeto referenciado e excluido. Ele e obrigatorio nos campos nativos
`ForeignKey` e `OneToOneField`. No `ForeignKeyPlus`, o SUAP usa `CASCADE` como
padrão quando a opcao e omitida.

Exemplos que serao usados nesta seção:

| Comportamento | Campo | Arquivo e linhas |
| --- | --- | --- |
| `CASCADE` | `PlanoEnsino.diario` | `edu/models/plano_ensino.py:6-7` |
| `SET_NULL` | `MatriculaPeriodo.turma` | `edu/models/historico.py:24-32` |
| `SET_NULL` | `Log.user`, `Log.aluno` e `Log.diario` | `edu/models/logs.py:22-24` |
| `PROTECT` | `PDP.ano` | `pdp_ifrn/models.py:9-10` |
| `RESTRICT` | sem uso localizado nesta instalacao | recurso nativo do Django |

##### `CASCADE`

Exclui também os objetos dependentes. Em `PlanoEnsino.diario`, definido em
`edu/models/plano_ensino.py:7`, excluir um diario provoca a exclusão dos planos
de ensino relacionados:

```python
diario = models.ForeignKeyPlus(
    'edu.Diario',
    on_delete=models.CASCADE,
)
```

Esse comportamento deve ser analisado com cuidado em models centrais. Uma
exclusão pode percorrer várias relacoes e remover muitos registros.

##### `SET_NULL`

Preserva o registro dependente e troca sua chave estrangeira por `NULL`. Por
isso, exige `null=True`.

`MatriculaPeriodo.turma`, em `edu/models/historico.py:31`, preserva a matrícula
quando a turma e removida:

```python
turma = models.ForeignKeyPlus(
    'edu.Turma',
    null=True,
    on_delete=models.SET_NULL,
)
```

O mesmo padrão e usado nos registros de log em `edu/models/logs.py:22-24`. A
exclusão de usuário, aluno ou diario não exclui necessariamente o log; a
referencia correspondente e definida como `NULL`.

##### `PROTECT`

Impede a exclusão do objeto enquanto existirem registros que apontem para ele,
levantando `ProtectedError`. Não ha um exemplo de `PROTECT` nos models do EDU
consultados, mas o recurso e usado em outros modulos do mesmo SUAP. Em
`pdp_ifrn/models.py:10`, um ano não pode ser excluido enquanto estiver ligado a
um plano:

```python
ano = models.OneToOneField(
    Ano,
    verbose_name='Ano',
    related_name='+',
    on_delete=models.PROTECT,
)
```

`PROTECT` e indicado quando apagar o cadastro de referencia invalidaria um
registro histórico ou de negócio que precisa ser preservado.

Nesse exemplo, `related_name='+'` desativa o acesso reverso a partir de `Ano`.
Essa opcao e util quando o sistema não precisa navegar do objeto referenciado
para os objetos que possuem a chave estrangeira.

##### `RESTRICT`

Também impede a exclusão quando existem dependencias, mas permite alguns casos
em que o dependente esta sendo excluido pela mesma operação em cascata. Esse
comportamento pertence ao Django, mas não foi localizado um uso de
`models.RESTRICT` nesta instalacao do SUAP. Antes de usa-lo, deve-se conferir a
versao do Django adotada pelo projeto e o comportamento esperado para a cadeia
de exclusão.

#### 2.8. Estudo integrado: `MatriculaPeriodo`

O model `MatriculaPeriodo`, em `edu/models/historico.py:24-48`, reúne vários dos
conceitos anteriores:

```python
class MatriculaPeriodo(LogModel):
    # Campos usados pelo mecanismo de busca textual do SUAP. A pesquisa pode
    # atravessar relacionamentos por meio da notacao com dois sublinhados.
    SEARCH_FIELDS = [
        'aluno__pessoa_fisica__nome_registro',
        'aluno__pessoa_fisica__nome_social',
        'aluno__matricula',
    ]

    # Relaciona o registro ao aluno. Como ForeignKeyPlus define CASCADE como
    # padrao, excluir o aluno tambem exclui suas matriculas-periodo.
    aluno = models.ForeignKeyPlus('edu.Aluno')

    # Registra o ano letivo. A referencia em string evita a importacao direta
    # de Ano e ajuda a reduzir dependencias circulares entre aplicativos.
    ano_letivo = models.ForeignKeyPlus(
        'comum.Ano',
        verbose_name='Ano Letivo',
        on_delete=models.CASCADE,
    )

    # Identifica o semestre ou periodo letivo dentro do ano. O indice melhora
    # consultas que filtram ou ordenam frequentemente por esse campo.
    periodo_letivo = models.PositiveIntegerField(
        'Periodo Letivo',
        db_index=True,
    )

    # Informa o periodo da matriz curricular em que o aluno se encontra. Pode
    # ficar vazio porque nem toda matricula possui esse dado definido.
    periodo_matriz = models.PositiveIntegerField(
        'Periodo Matriz',
        null=True,
    )

    # A turma e opcional. SET_NULL preserva a matricula-periodo quando a turma
    # e excluida, preenchendo apenas esta chave estrangeira com NULL.
    turma = models.ForeignKeyPlus(
        'edu.Turma',
        null=True,
        on_delete=models.SET_NULL,
    )

    # Representa a situacao academica do aluno naquele periodo. A exclusao da
    # situacao provoca a exclusao dos registros associados por CASCADE.
    situacao = models.ForeignKeyPlus(
        'edu.SituacaoMatriculaPeriodo',
        verbose_name='Situacao',
        on_delete=models.CASCADE,
    )

    # Campos de controle usados na integracao com o antigo Q-Academico.
    excluida = models.BooleanField(
        'Excluida do Q-Academico',
        default=False,
    )
    codigo_turma_qacademico = models.CharField(
        'Codigo da Turma do Q-Academico',
        max_length=255,
        null=True,
    )
    cursou_acc_qacademico = models.BooleanField(
        verbose_name='Cursou Atividade Complementar no Q-Academico',
        default=False,
    )

    # Indica se o registro foi criado pelo proprio SUAP, em vez de importado.
    gerada_suap = models.BooleanField(
        'Matricula-Periodo Gerada pelo SUAP',
        default=False,
    )

    # Codigo usado na integracao com o EDUCACENSO. null permite NULL no banco;
    # blank permite deixar o campo vazio em formularios.
    codigo_educacenso = models.CharFieldPlus(
        'Codigo EDUCACENSO',
        null=True,
        blank=True,
    )

    # Armazena o percentual de carga horaria cumprida. O campo pode ficar sem
    # valor enquanto o percentual ainda nao tiver sido calculado.
    percentual_ch_cumprida = models.DecimalFieldPlus(
        'C.H. Cumprida (%)',
        null=True,
    )

    class Meta:
        # Impede duas matriculas-periodo do mesmo aluno no mesmo ano e periodo.
        unique_together = (
            ('ano_letivo', 'periodo_letivo', 'aluno'),
        )

        # Define a ordenacao aplicada quando a consulta nao informa order_by().
        ordering = ('ano_letivo__ano', 'periodo_letivo')

        # Nomes exibidos pelo Django e pelo SUAP para um ou varios registros.
        verbose_name = 'Matricula em Periodo'
        verbose_name_plural = 'Matriculas em Periodo'
```

Leitura do model:

- cada matrícula-período pertence a um aluno, ano e situação;
- `SEARCH_FIELDS` orienta a busca por nome de registro, nome social ou
  matrícula do aluno;
- `periodo_matriz` e opcional e informa a etapa da matriz curricular;
- a turma e opcional e pode ser anulada sem excluir a matrícula-período;
- `aluno` omite `on_delete`, portanto recebe o `CASCADE` padrão definido por
  `ForeignKeyPlus`;
- a exclusão do ano ou da situação usa cascata;
- os campos relacionados ao Q-Academico e ao EDUCACENSO registram dados de
  integração e origem;
- `ordering` estabelece a ordem cronologica padrão das consultas;
- `verbose_name` e `verbose_name_plural` fornecem os nomes legiveis exibidos
  nas interfaces;
- o mesmo aluno não pode possuir duas matriculas para o mesmo ano e período;
- `unique_together` transforma a regra em restricao de banco, diferentemente de
  uma validação mantida somente em form ou view.

#### 2.9. Cuidados ao alterar relacionamentos

Antes de criar ou modificar um relacionamento, verificar:

1. qual model deve possuir a chave estrangeira;
2. se a relação e obrigatoria (`null=False`) ou opcional (`null=True`);
3. qual deve ser o comportamento de exclusão;
4. se o acesso reverso precisa de `related_name`;
5. se uma relação muitos para muitos precisa guardar dados adicionais com
   `through`;
6. se a combinação de chaves precisa de `UniqueConstraint`;
7. se a consulta exige `select_related()` ou `prefetch_related()`;
8. quais registros existentes precisam ser tratados pela migration;
9. quais forms, views, admins, relatórios e permissões utilizam a relação;
10. qual e o impacto de uma exclusão em cascata.

### O que acontece com os dados que já existem?

Uma alteração no model também precisa funcionar para as linhas que já estão
no banco. Por exemplo, tornar obrigatório um campo que antes aceitava vazio
exige definir um valor para os registros antigos. O Django não consegue
adivinhar esse valor com segurança:

```python
# Antes: a turma podia não ter coordenador.
coordenador = models.ForeignKey(
    'comum.Funcionario',
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
)

# Depois: toda turma deve ter coordenador.
coordenador = models.ForeignKey(
    'comum.Funcionario',
    null=False,
    on_delete=models.PROTECT,
)
```

Antes de aplicar a segunda versão, é necessário localizar as turmas sem
coordenador, decidir quem será associado a cada uma e só então remover o
`null=True`. Caso contrário, a migration poderá falhar ou forçar uma escolha
incorreta para os dados históricos.

### Migration de estrutura e migration de dados

Uma migration pode alterar a estrutura, mas às vezes também precisamos
transformar os dados existentes. Uma sequência segura é:

```text
1. adicionar o novo campo como opcional;
2. migrar ou revisar os dados antigos;
3. conferir a quantidade de registros sem relação;
4. tornar o campo obrigatório, se a regra exigir;
5. atualizar forms, views, admin e relatórios.
```

Quando a transformação puder ser automatizada, use uma migration de dados:

```python
from django.db import migrations


def preencher_diario(apps, schema_editor):
    PlanoEnsino = apps.get_model('edu', 'PlanoEnsino')
    Diario = apps.get_model('edu', 'Diario')
    diario_padrao = Diario.objects.order_by('pk').first()

    if diario_padrao:
        PlanoEnsino.objects.filter(diario__isnull=True).update(
            diario=diario_padrao,
        )


class Migration(migrations.Migration):
    dependencies = [('edu', '0008_ultima_migration')]
    operations = [
        migrations.RunPython(
            preencher_diario,
            migrations.RunPython.noop,
        ),
    ]
```

Em uma migration, `apps.get_model()` recupera a versão histórica do model.
Isso evita importar diretamente a classe atual, que pode ter mudado depois que
a migration foi criada. A função reversa (`noop`) informa que não haverá uma
desfazer automática; quando possível, defina também uma operação reversível.

### Alterar `on_delete` também muda o comportamento

Trocar `SET_NULL` por `CASCADE` não é apenas uma mudança de configuração. A
partir da migration, excluir o objeto pai poderá apagar todos os filhos. Antes
de fazer essa alteração, simule a exclusão em dados de teste e liste quais
registros seriam afetados. Em informações acadêmicas e históricas, `PROTECT`
ou `RESTRICT` pode ser mais adequado para impedir uma exclusão acidental.

Depois de gerar a migration, revise o arquivo antes de executá-lo e confira:

```bash
python manage.py makemigrations edu
python manage.py sqlmigrate edu 0009
python manage.py migrate
```

O `sqlmigrate` permite visualizar o SQL que será executado. Após a aplicação,
verifique contagens, valores nulos e telas que usam a relação. Alterar um
relacionamento é alterar a estrutura e o significado dos dados, portanto a
validação precisa incluir banco, código e comportamento da interface.

### 3. `class Meta`

`Meta` e uma classe interna usada para configurar o comportamento do model. Ela
não representa um campo e não cria uma coluna chamada `Meta`. Suas opções
informam ao Django como nomear, ordenar, autorizar, validar e mapear o model no
banco de dados.

Estrutura basica:

```python
class MeuModel(models.ModelPlus):
    descricao = models.CharFieldPlus('Descricao')

    class Meta:
        verbose_name = 'Meu registro'
        verbose_name_plural = 'Meus registros'
        ordering = ('descricao',)
```

As configuracoes podem ser consultadas em tempo de execução pelo atributo
`_meta`:

```python
MeuModel._meta.verbose_name
MeuModel._meta.verbose_name_plural
MeuModel._meta.ordering
MeuModel._meta.db_table
MeuModel._meta.app_label
MeuModel._meta.model_name
```

#### 3.1. Exemplo integrado: `Turma.Meta`

O model `Turma`, em `edu/models/turmas.py:19-48`, concentra várias opções uteis
para iniciar a explicação:

```python
class Turma(LogModel):
    codigo = models.CharFieldPlus(verbose_name='Codigo')
    descricao = models.CharFieldPlus(verbose_name='Descricao')

    class Meta:
        verbose_name = 'Turma'
        verbose_name_plural = 'Turmas'
        permissions = (
            ('gerar_turmas', 'Gerar Turmas'),
        )
        ordering = ('descricao',)
```

Leitura do bloco:

- o singular apresentado pelo sistema e `Turma`;
- o plural e `Turmas`;
- as consultas sem `order_by()` explicito usam `descricao`;
- alem das permissões padrão, o model declara `gerar_turmas`.

#### 3.2. `unique_together` e integridade no banco

`unique_together` impede a repeticao de uma combinação de campos. A regra não
exige que cada campo seja único isoladamente; e o conjunto que não pode se
repetir.

Em `MatriculaPeriodo.Meta`, localizado em
`edu/models/historico.py:24-45`, a combinação de ano, período e aluno deve ser
única:

```python
class Meta:
    ordering = ('ano_letivo__ano', 'periodo_letivo')
    verbose_name = 'Matricula em Periodo'
    verbose_name_plural = 'Matriculas em Periodo'
    unique_together = (
        ('ano_letivo', 'periodo_letivo', 'aluno'),
    )
```

Na prática, os seguintes registros não podem coexistir:

```text
Aluno 100 | Ano 2026 | Periodo 1
Aluno 100 | Ano 2026 | Periodo 1
```

O mesmo aluno pode aparecer em outro período ou ano, e outros alunos podem
aparecer na mesma combinação de ano e período.

Outro exemplo e `MatrizCurso.Meta`, em `edu/models/cursos.py:1208-1211`:

```python
class Meta:
    verbose_name = 'Vinculo de Matriz em Curso'
    verbose_name_plural = 'Vinculos de Matriz em Curso'
    unique_together = ('matriz', 'curso_campus')
```

Esse formato ainda e usado pelo EDU. Em código Django mais moderno, a forma
preferida e `UniqueConstraint`, dentro de `constraints`:

```python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=('ano_letivo', 'periodo_letivo', 'aluno'),
            name='edu_matricula_periodo_unica',
        ),
    ]
```

O bloco com `UniqueConstraint` acima mostra a equivalencia moderna; ele não e o
código atual desta instalacao. Não foi localizado uso de `UniqueConstraint` nos
models do EDU consultados. Uma troca de `unique_together` por
`UniqueConstraint` deve ser feita por migration e testada no banco suportado
pelo projeto.

Por que a restricao deve existir no banco:

- validação de form melhora a mensagem apresentada ao usuário;
- verificacao em view pode detectar casos antes de salvar;
- somente a restricao de banco protege também contra concorrência, scripts,
  tasks e outros pontos de gravação.

#### 3.3. `indexes`

`indexes` declara índices adicionais no banco. Indices podem acelerar filtros,
ordenações e juncoes, mas ocupam espaco e aumentam o custo de insercoes e
alterações.

O model `MatriculaDiario`, em `edu/models/historico.py:979-985`, declara um
índice e uma permissao personalizada no mesmo bloco:

```python
class Meta:
    verbose_name = 'Matricula em Diario'
    verbose_name_plural = 'Matriculas em Diario'
    ordering = (
        'matricula_periodo__aluno__pessoa_fisica__nome',
    )
    indexes = [
        models.Index(fields=['matricula_periodo']),
    ]
    permissions = (
        (
            'delete_matriculadiario_cancelada_trancada',
            'Pode excluir do diario aluno com matricula periodo cancelada ou trancada',
        ),
    )
```

A permissao desse exemplo e verificada em
`edu/models/historico.py:1021` por meio de:

```python
user.has_perm('edu.delete_matriculadiario_cancelada_trancada')
```

Cuidados com índices:

- não criar um índice apenas porque um campo aparece em uma tela;
- observar as consultas reais, volume da tabela e plano de execução;
- chaves estrangeiras normalmente já recebem índice do Django;
- restrições `unique` também costumam criar estrutura de índice;
- índices compostos dependem da ordem dos campos;
- conferir o SQL com `sqlmigrate` antes de aplicar a migration.

No caso específico de `matricula_periodo`, vale verificar o SQL gerado e o
banco atual, pois o campo e uma chave estrangeira e pode já possuir índice. Um
índice explicito equivalente pode ser redundante.

#### 3.4. Models abstratos com `abstract = True`

Um model abstrato é uma classe-base reutilizável. Ele fornece campos, métodos
e regras para seus filhos, mas não representa registros próprios no banco. A
opção `abstract = True` informa ao Django que a classe será usada somente na
herança.

Compare os dois casos:

```python
class Identificado(models.Model):
    codigo = models.CharField(max_length=20)

    class Meta:
        abstract = True


class Aluno(Identificado):
    nome = models.CharField(max_length=120)


class Documento(models.Model):
    titulo = models.CharField(max_length=120)
```

O efeito no banco é:

```text
Identificado (abstrato)  ── não cria tabela
       │
       └── Aluno          ── cria tabela edu_aluno
           codigo e nome ficam na mesma tabela

Documento (concreto)     ── cria tabela edu_documento
```

Assim, `Aluno` recebe o campo `codigo` diretamente em sua tabela. Não existe
uma tabela intermediária `identificado` nem uma consulta a
`Identificado.objects.all()`. Já `Documento`, por ser concreto, possui tabela,
manager e registros próprios.

`LogModel`, em `edu/models/logs.py:82-99`, e a principal base abstrata dos
models do EDU:

```python
class LogModel(models.ModelPlus):
    class Meta:
        abstract = True

    def format(self, value):
        if value in (None, ''):
            return '-'
        return str(value)
```

Assim, classes como `Turma(LogModel)` e `PlanoEnsino(LogModel)` recebem os
comportamentos de log sem criar uma tabela `edu_logmodel`.

`ModelPlus`, implementado em `djtools/db/models/__init__.py:462-477`, também e
abstrato:

```python
class ModelPlus(models.Model, metaclass=SUAPMetaModel):
    class Meta:
        abstract = True
```

Consequencias:

- não existe `LogModel.objects.all()`;
- cada classe concreta possui sua própria tabela;
- campos herdados de uma base abstrata sao incorporados a cada tabela concreta;
- métodos da base ficam disponiveis nas instancias filhas;
- alterações na base abstrata podem gerar migrations para vários models filhos.

Na prática, use uma base abstrata quando vários models realmente compartilham
estrutura ou comportamento. Se a classe precisa ter registros próprios, ser
consultada diretamente ou ser referenciada por uma `ForeignKey`, ela deve ser
um model concreto. Essa escolha muda as migrations, as tabelas e a forma de
consultar os objetos.

<a id="etapa-3"></a>

## Etapa 3 - Recursos exclusivos do SUAP e managers

O SUAP mantém a base do Django e acrescenta recursos compartilhados pelo
DJTools. Nesta etapa, o participante identifica o que vem do Django e o que é
uma extensão do SUAP, depois aplica essa distinção aos managers e às consultas.

Depois da base do Django, esta etapa apresenta o que foi acrescentado pelo
DJTools/SUAP e encerra com um estudo integrado dos managers de `Turma`.

### 1. `ModelPlus`

`ModelPlus` **não e uma classe nativa do Django**. Ela e uma classe abstrata do
DJTools, a infraestrutura compartilhada pelo SUAP, e estende
`django.db.models.Model` com convencoes e atalhos usados pelo projeto.

Implementacao principal: `djtools/db/models/__init__.py:449-534`.

Importacao mais comum nos modulos do SUAP:

```python
from djtools.db import models


class MeuModel(models.ModelPlus):
    nome = models.CharFieldPlus('Nome')
```

Também e possível importar a classe diretamente, como acontece em
`edu/models/alunos.py:56-63`:

```python
from djtools.db.models import ModelPlus


class SequencialMatricula(ModelPlus):
    prefixo = models.CharFieldPlus(max_length=255)
    contador = models.PositiveIntegerField()
```

#### 1.1. Cadeia de herança

A relação principal e:

```text
django.db.models.Model
          ^
          |
djtools.db.models.ModelPlus
          ^
          |
edu.models.logs.LogModel
          ^
          |
Aluno, Professor, Turma, Diario, CursoCampus...
```

Isso significa que um model baseado em `ModelPlus` continua sendo um model
Django. Ele mantem campos, managers, `QuerySet`, migrations, `save()`,
`delete()`, validações e relacionamentos do ORM. O `ModelPlus` acrescenta
comportamentos; ele não substitui o ORM.

Exemplos de herança direta no EDU:

- `SequencialMatricula`, em `edu/models/alunos.py:63-84`;
- `OrgaoEmissorRg`, em `edu/models/cadastros_gerais.py:12-21`;
- `PlanoEstudo`, em `edu/models/planos_estudos.py:7-29`;
- `Requerimento`, em `edu/models/procedimentos.py:677-707`.

Exemplos de herança indireta por `LogModel`:

- `Aluno`, em `edu/models/alunos.py:107`;
- `Professor`, em `edu/models/professores.py:22`;
- `Turma`, em `edu/models/turmas.py:19`;
- `Diario`, em `edu/models/diarios.py:42`;
- `CursoCampus`, em `edu/models/cursos.py:500`;
- `MatriculaPeriodo`, em `edu/models/historico.py:24`.

`LogModel`, definido em `edu/models/logs.py:82-84`, também e abstrato e herda
de `models.ModelPlus`:

```python
class LogModel(models.ModelPlus):
    class Meta:
        abstract = True
```

Portanto, `Aluno` recebe as facilidades de `ModelPlus` e acrescenta a camada de
auditoria acadêmica de `LogModel`.

#### 1.2. Por que `ModelPlus` e abstrato

Em `djtools/db/models/__init__.py:465-466`:

```python
class Meta:
    abstract = True
```

Um model abstrato:

- não possui tabela própria;
- não deve ser instanciado como entidade do domínio;
- fornece campos e métodos para as subclasses;
- não gera registros de `ContentType` e permissões para si como um model
  concreto;
- permite que cada model filho tenha sua própria tabela.

Assim, existe tabela de `Aluno`, `Turma` ou `PlanoEstudo`, mas não uma tabela de
`ModelPlus`.

#### 1.3. Permissões padrão

A linha `djtools/db/models/__init__.py:452` define:

```python
my_meta._meta.default_permissions = ('add', 'change', 'delete', 'view')
```

Para um model concreto chamado `Aluno`, os codenames seguem o padrão:

```text
add_aluno
change_aluno
delete_aluno
view_aluno
```

Essas permissões sao materializadas nas tabelas de autenticacao durante o fluxo
de migrations/permissões do Django e podem ser atribuidas aos grupos pelo
`permissions.yaml` do SUAP.

Cuidados:

- a existencia de `view_aluno` não concede a permissao a todos os usuários;
- o usuário ou um de seus grupos precisa receber a permissao;
- `permission_required('edu.view_aluno')` verifica a permissao na view;
- managers como `Aluno.locals` podem restringir ainda mais os registros;
- condições no template controlam exibicao, mas não substituem autorizacao no
  backend.

#### 1.4. `__str__()` padrão

O metodo de `djtools/db/models/__init__.py:471-477` percorre os campos na ordem
do model e devolve o primeiro `CharField` ou `TextField` preenchido:

```python
def __str__(self):
    for f in self.__class__._meta.fields:
        if f.get_internal_type() in ['CharField', 'TextField']:
            value = getattr(self, f.name)
            if value:
                return value
    return f'{self.__class__._meta.verbose_name} {self.pk}'
```

Esse fallback evita representacoes vazias, mas não conhece o significado dos
campos. O primeiro texto pode não ser a melhor identificacao de negócio.

Por isso, models do EDU frequentemente sobrescrevem `__str__()`. Exemplo em
`edu/models/cadastros_gerais.py:12-21`:

```python
class OrgaoEmissorRg(models.ModelPlus):
    SEARCH_FIELDS = ['nome']
    nome = models.CharFieldPlus(verbose_name='Nome')

    def __str__(self):
        return self.nome
```

Outro exemplo em `edu/models/planos_estudos.py:21-29`:

```python
def __str__(self):
    return 'Plano de estudo #{}'.format(self.id)

def get_absolute_url(self):
    return '/edu/planoestudo/{}/'.format(self.pk)
```

Recomendacao: sobrescrever `__str__()` quando o domínio possuir uma
identificacao clara. O resultado aparece em selects, logs, admin, shell e
mensagens do sistema.

Um campo adiado com `only()` ou `defer()` pode provocar consulta quando
`__str__()` tentar acessa-lo. A representacao textual também deve ser observada
em analises de N+1.

#### 1.5. Busca genérica com `search()`

`ModelPlus.search()`, em `djtools/db/models/__init__.py:479-481`, e um
`classmethod`:

```python
@classmethod
def search(cls, q, fields=None, max_fields=5):
    return _search(cls, q, fields=fields, max_fields=max_fields)
```

Pode ser chamado sem criar uma instância:

```python
resultados = OrgaoEmissorRg.search('ssp')
```

A função `_search()`, em `djtools/db/models/__init__.py:400-442`:

1. procura um campo do tipo `SearchField` no model;
2. se ele existir e `fields` não for informado, prepara o termo e pesquisa
   nesse campo;
3. caso contrario, usa os campos fornecidos;
4. sem `fields`, usa no máximo os primeiros campos `CharField` e `TextField`,
   conforme `max_fields`;
5. divide a expressao em palavras;
6. combina os campos de cada palavra com `OR`;
7. aplica cada palavra sucessivamente, produzindo comportamento de `AND` entre
   palavras;
8. devolve um `QuerySet` iniciado por `cls.objects.all()`.

Trecho central:

```python
qs = cls.objects.all()

for word in q.split(' '):
    or_queries = [
        models.Q(**{f'{field_name}__icontains': word})
        for field_name in fields
    ]
    qs = qs.filter(reduce(or_, or_queries))

return qs
```

Exemplo com campos explicitos:

```python
resultados = Pais.search(
    'brasil br',
    fields=['nome', 'sigla'],
)
```

Conceitualmente, cada palavra deve aparecer em pelo menos um dos campos:

```text
(nome contem "brasil" OR sigla contem "brasil")
AND
(nome contem "br" OR sigla contem "br")
```

Cuidados:

- o retorno e preguicoso e ainda pode receber `.filter()` ou `.order_by()`;
- a busca usa `cls.objects`, não `cls.locals`;
- `search()` não representa, por si so, verificacao de permissao ou escopo;
- buscas com `icontains` em várias colunas podem ser caras;
- `SEARCH_FIELDS` e uma convencao usada por outros componentes do SUAP, mas
  não e lida diretamente por essa implementacao de `_search()`.

#### 1.6. Comparação entre as classes-base

| Classe-base | Origem | Acrescenta |
| --- | --- | --- |
| `django.db.models.Model` | Django | ORM, campos, managers, persistencia e metadados básicos. |
| `djtools.db.models.ModelPlus` | DJTools/SUAP | Metaclasse SUAP, representacao padrão, busca, atalho de criação e suporte ao campo otimizado. |
| `edu.models.logs.LogModel` | Modulo EDU | Auditoria acadêmica sobre os recursos de `ModelPlus`. |

Escolha prática:

- em código SUAP, seguir a classe-base já usada pelo modulo;
- usar `LogModel` quando a entidade acadêmica precisar participar da auditoria
  implementada pelo EDU;
- usar `ModelPlus` quando forem desejadas as facilidades gerais sem a auditoria
  especifica do `LogModel`;
- não trocar a herança de models existentes sem analisar migrations,
  metaclasses, sinais e efeitos de auditoria.

#### 1.7. O que `ModelPlus` não faz

`ModelPlus` não:

- concede permissões automaticamente a usuários ou grupos;
- filtra registros pelo campus ou pela diretoria;
- transforma `objects` em `locals`;
- chama `full_clean()` automaticamente antes de todo `save()`;
- substitui `forms.ModelForm` ou `ModelFormPlus`;
- implementa auditoria do EDU por conta própria;
- impede acesso direto a views;
- corrige N+1 automaticamente;
- torna `QuerySet.update()` equivalente a `save()`;
- define `get_absolute_url()` para todos os models.

Essas responsabilidades pertencem a outras camadas: permissions, managers,
forms, views, decorators, `LogModel`, templates e regras especificas do model.

#### 1.8. Resumo para o estudante

Ao encontrar um model SUAP, verificar:

1. ele herda de `ModelPlus` diretamente ou por `LogModel`?
2. `__str__()` foi sobrescrito?
3. existe busca generica ou `SEARCH_FIELDS`?
4. o model sobrescreve `save()` e chama `super().save()`?
5. qual manager inicia a consulta e qual escopo ele aplica?
6. permissões e acesso estao protegidos no backend?

O `ModelPlus` preserva o ORM do Django e acrescenta convencoes do SUAP.
Managers, auditoria e permissões continuam sendo camadas distintas.

### 2. Campos `Plus`

Os campos `Plus` **não pertencem ao Django**. Eles sao extensoes criadas pelo
DJTools/SUAP sobre campos nativos do ORM. Continuam criando colunas e
relacionamentos Django, mas acrescentam valores padrão, validações e campos de
formulário adaptados ao sistema.

As implementacoes ficam em `djtools/db/models/__init__.py`. Os principais sao:

| Campo | Implementacao | Acrescenta ao campo Django |
| --- | --- | --- |
| `CharFieldPlus` | linhas `68-93` | `max_length=255` por padrão, atributos do widget e validação opcional de caracteres. |
| `ForeignKeyPlus` | linhas `96-107` | `CASCADE` por padrão e `ModelChoiceFieldPlus` nos formulários. |
| `OneToOneFieldPlus` | linhas `110-121` | `CASCADE` por padrão e campo de escolha adaptado ao SUAP. |
| `ManyToManyFieldPlus` | linhas `124-131` | `MultipleModelChoiceFieldPlus` para selecionar vários objetos. |
| `DecimalFieldPlus` | linhas `198-206` | padrões de 12 digitos e duas casas decimais. |
| `DateFieldPlus` | linhas `251-255` | `DateFieldPlus` do DJTools como campo de formulário. |
| `CurrentUserField` | linhas `134-148` | registra por padrão o usuário do contexto atual e não aparece para edicao. |
| `SearchField` | linhas `151-180` | prepara e armazena texto normalizado para buscas otimizadas. |

Também existem campos voltados a dados brasileiros: `BrCpfField`,
`BrCnpjField`, `BrCepField` e `BrTelefoneField`, implementados em
`djtools/db/models/__init__.py:209-248`. Eles definem tamanhos e campos de
formulário apropriados para cada tipo de dado.

#### Exemplo real no EDU

Em `edu/models/historico.py:27-39`, `MatriculaPeriodo` emprega quatro campos
`Plus`:

```python
# Relacionamento com Aluno; recebe CASCADE por padrao.
aluno = models.ForeignKeyPlus('edu.Aluno')

# Se a turma for excluida, somente a referencia e anulada.
turma = models.ForeignKeyPlus(
    'edu.Turma',
    null=True,
    on_delete=models.SET_NULL,
)

# Texto opcional com max_length=255 fornecido pelo CharFieldPlus.
codigo_educacenso = models.CharFieldPlus(
    'Codigo EDUCACENSO',
    null=True,
    blank=True,
)

# Numero decimal com 12 digitos e duas casas como valores padrao.
percentual_ch_cumprida = models.DecimalFieldPlus(
    'C.H. Cumprida (%)',
    null=True,
)
```

O sufixo `Plus` traz conveniencias, mas não muda a responsabilidade do
desenvolvedor: ainda e necessário decidir conscientemente `null`, `blank`,
`on_delete`, precisao numerica e impacto das alterações no banco e nos forms.

### 3. `LogModel`

Antes dos detalhes técnicos, imagine uma alteração simples em uma matrícula:

```text
Antes:  situação = "Ativa"
Alteração: situação = "Concluída"
          │
          ▼
Log: EDICAO, objeto MatriculaPeriodo, usuário e data
          │
          ▼
RegistroDiferenca:
  campo: situacao
  valor anterior: Ativa
  valor atual: Concluída
```

O objetivo da auditoria é preservar esse contexto. Assim, mais tarde é
possível responder quem alterou o registro, quando a alteração ocorreu e qual
valor foi substituído. O `Log` identifica a operação; o
`RegistroDiferenca` guarda cada campo que mudou.

```python
matricula.situacao = 'Concluída'
matricula.save()

# Resultado conceitual:
# Log(operacao='EDICAO', objeto='MatriculaPeriodo')
# RegistroDiferenca(
#     campo='situacao',
#     valor_anterior='Ativa',
#     valor_atual='Concluída',
# )
```

`LogModel` **não e uma classe do Django**. Ele e um model abstrato próprio do
modulo EDU, implementado em `edu/models/logs.py:82-149`, que herda de
`ModelPlus` e acrescenta auditoria automatica aos models descendentes.

```python
class LogModel(models.ModelPlus):
    class Meta:
        # Nao cria uma tabela chamada edu_logmodel.
        abstract = True
```

Por ser abstrato, seus recursos sao herdados, mas cada classe concreta mantem
sua própria tabela. Um exemplo e `MatriculaPeriodo`, declarado com
`class MatriculaPeriodo(LogModel)` em `edu/models/historico.py:24`.

#### Como a auditoria funciona

Quando `settings.USE_EDU_LOG` esta ativo, o construtor de `LogModel` conecta
três sinais do Django ao model concreto (`edu/models/logs.py:97-149`):

| Sinal | Linhas | Acao registrada |
| --- | --- | --- |
| `pre_save` | `101-120` | Compara o objeto existente com os novos valores e registra os campos alterados. |
| `post_save` | `122-130` | Registra o cadastro de uma nova instância. |
| `pre_delete` | `132-145` | Registra a exclusão e os valores anteriores, exceto conteudos de arquivos. |

O usuário responsavel e obtido com `tl.get_user()` nas linhas `103`, `125` e
`134`. Esse recurso do SUAP recupera o usuário guardado no contexto da
requisição; fora de uma requisição autenticada, o log pode ficar sem usuário.

Os dados sao divididos em dois models:

- `Log`, em `edu/models/logs.py:14-69`, guarda usuário, operação, data, model e
  identificador do objeto;
- `RegistroDiferenca`, em `edu/models/logs.py:72-79`, guarda campo, valor
  anterior e valor atual de cada alteração.

#### Exemplo real

Ao alterar e salvar uma `MatriculaPeriodo`, o sinal `pre_save` recupera a
versao atual do banco e compara seus campos (`edu/models/logs.py:105-120`):

```python
matricula_periodo.situacao = nova_situacao
matricula_periodo.save()
```

Se a situação mudou, o SUAP cria um `Log` do tipo `EDICAO` e um
`RegistroDiferenca` contendo o valor anterior e o atual. O model de negócio não
precisa chamar o logger diretamente, pois herdou esse comportamento de
`LogModel`.

> **Atencao:** `QuerySet.update()` atualiza diretamente o banco e não executa
> `save()` nem os sinais `pre_save` e `post_save`. Portanto, uma operação como
> `MatriculaPeriodo.objects.filter(...).update(...)` não produz esse log de
> edicao. `LogModel` fornece auditoria tecnica, mas não substitui permissões,
> validações nem registros obrigatorios definidos pelas regras de negócio.

### 4. `SEARCH_FIELDS`

`SEARCH_FIELDS` **não e uma configuracao nativa do Django**. Trata-se de uma
convencao do SUAP: uma lista de campos em que determinado objeto pode ser
pesquisado. Os nomes seguem a sintaxe do ORM e podem atravessar relacionamentos
com dois sublinhados (`__`).

Exemplos no EDU:

```python
# edu/models/alunos.py:107-108
class Aluno(LogModel):
    SEARCH_FIELDS = [
        'pessoa_fisica__search_fields_optimized',
        'matricula',
    ]

# edu/models/turmas.py:19-20
class Turma(LogModel):
    SEARCH_FIELDS = ['codigo', 'descricao']

# edu/models/diarios.py:42-43
class Diario(LogModel):
    SEARCH_FIELDS = [
        'componente_curricular__componente__sigla',
        'id',
        'componente_curricular__componente__descricao',
    ]
```

No primeiro caso, uma busca de aluno pode usar a matrícula ou um campo
otimizado da pessoa física. Em `Diario`, a consulta atravessa os
relacionamentos até chegar a sigla e a descrição do componente.

#### Uso em formulários

Em `edu/forms.py:1120-1124`, o autocomplete de turma recebe a lista
explicitamente:

```python
turma_destino = forms.ModelChoiceFieldPlus(
    None,
    label='Turma de Destino',
    widget=AutocompleteWidget(search_fields=Turma.SEARCH_FIELDS),
)
```

O mecanismo de autocomplete procura primeiro um `SearchField`, depois
`SEARCH_FIELDS` e, por ultimo, campos de texto do model
(`djtools/utils/__init__.py:842-869`). O metodo `ModelPlus.search()`, por sua
vez, esta em `djtools/db/models/__init__.py:479-481` e permite fornecer a lista
explicitamente:

```python
alunos = Aluno.search('20261001', fields=Aluno.SEARCH_FIELDS)
```

> Declarar `SEARCH_FIELDS` não cria índice no banco e não altera sozinho todas
> as consultas. O componente de busca precisa utilizar essa lista, e campos
> muito amplos ou relacionamentos profundos podem aumentar o custo da consulta.

### 5. `objects`, `locals` e managers especializados

Um manager é a porta de entrada para as consultas de um model. O manager
padrão costuma ser `objects`; um manager contextual, como `locals`, pode
acrescentar filtros baseados no usuário, na unidade ou em outras regras do
SUAP.

Compare a mesma consulta pelos dois caminhos:

```python
# Manager padrão: começa com todos os registros permitidos pelo model.
turmas = Turma.objects.filter(ano_letivo=ano)

# Manager contextual: aplica o escopo definido pelo próprio manager.
turmas_locais = Turma.locals.filter(ano_letivo=ano)
```

O resultado não precisa ser igual:

```text
Turma.objects                         Turma.locals
       │                                      │
       ▼                                      ▼
registros do model                 registros do model
                                    + filtro contextual
                                    (usuário, diretoria, unidade...)
```

Em termos práticos:

| Manager | Ponto de partida | Quando usar |
| --- | --- | --- |
| `objects` | conjunto geral do model | rotinas administrativas, relatórios globais e regras que já fazem o filtro explicitamente |
| `locals` | conjunto definido pelo contexto | telas que devem respeitar o escopo do usuário ou da unidade |
| manager especializado | regra própria da classe | consultas reutilizadas, como `AlunoLocalManager` ou filtros por diretoria |

O nome `locals` não tem comportamento automático no Django. Ele só é
contextual porque sua implementação define filtros adicionais. Por isso, a
forma correta de entender uma consulta é abrir a classe do manager e conferir
qual `QuerySet` ela retorna, em vez de deduzir o filtro pelo nome.

Também é possível encadear os dois tipos com clareza:

```python
# A regra abaixo usa o escopo local e acrescenta um filtro da tela.
alunos = Aluno.locals.filter(
    situacao__ativo=True,
).order_by('pessoa_fisica__nome')
```

Se a rotina precisa consultar todos os registros, `objects` pode ser adequado.
Se a tela apresenta somente dados do usuário atual, prefira o manager
contextual já previsto pelo model. Em qualquer caso, managers não substituem
permissões: a view e as regras de autorização continuam sendo necessárias.

O ponto principal é que o nome do manager não possui significado mágico para o Django. O
comportamento depende da implementacao de cada classe.

Exemplos:

- `Turma.objects` e `Turma.locals`, em `edu/models/turmas.py:22-24`;
- `Diario.objects` e `Diario.locals`, em `edu/models/diarios.py:60-62`;
- managers de `Aluno`, em `edu/models/alunos.py:250-259`;
- `FiltroDiretoriaManager`, em `edu/managers.py:13-69`;
- `FiltroUnidadeOrganizacionalManager`, em `edu/managers.py:117-162`;
- `AlunoLocalManager`, em `edu/managers.py:671-682`.

Ponto obrigatorio:

```text
.locals nao significa automaticamente "filtrado por campus".
```

Cada manager deve ser lido. Nesta versao, `Aluno.locals` possui uma regra
especifica para coordenador de polo EAD, enquanto outros managers aplicam
recortes por diretoria ou unidade organizacional.

### 6. Thread-local e usuário atual

`comum.utils.tl` mantém informações associadas ao contexto de execução atual.
O helper `tl.get_user()` é usado por managers, auditoria e
`CurrentUserField` para descobrir quem está executando uma operação. Esse
valor não é passado como argumento em cada consulta; ele é recuperado do
contexto guardado durante a execução.

Compare três situações:

| Situação | Usuário no contexto | Efeito em `tl.get_user()` |
| --- | --- | --- |
| requisição web autenticada | definido pelo middleware da requisição | retorna o usuário autenticado; um manager contextual pode filtrar seus dados |
| comando de gerenciamento | normalmente ausente, salvo configuração explícita | pode retornar `None` ou usuário anônimo; a rotina deve tratar esse caso |
| consulta no shell | depende de como o contexto foi configurado | em geral não há usuário; a mesma consulta pode produzir escopo diferente |

O mesmo código pode, portanto, ter resultados diferentes:

```python
usuario = tl.get_user()
alunos = Aluno.locals.all()

if usuario:
    print(f'Consulta executada por {usuario.username}')
else:
    print('Consulta sem usuário associado ao contexto')
```

Visualmente, o fluxo é:

```text
Requisição web ── middleware ──► tl.user ──► tl.get_user() ──► manager contextual
Comando/shell  ── sem middleware ──────────► None           ──► regra alternativa
```

Em uma view, o usuário autenticado costuma estar disponível:

```python
def listar_alunos(request):
    # O middleware já associou request.user ao contexto thread-local.
    usuario = tl.get_user()
    return Aluno.locals.filter(responsavel=usuario)
```

Em um comando ou no shell, não se deve presumir que esse valor exista:

```python
usuario = tl.get_user()
if usuario is None:
    # Escolha explicitamente o escopo da rotina automatizada.
    alunos = Aluno.objects.filter(ativo=True)
else:
    alunos = Aluno.locals.filter(ativo=True)
```

Cuidados:

- em requisições HTTP existe um usuário associado ao contexto;
- em shell, command, migration e task o usuário pode ser ausente;
- consulta dependente de usuário pode produzir resultado diferente fora da
  requisição;
- testes devem configurar o contexto quando a regra depender de `tl`;
- operações automáticas devem definir explicitamente o escopo e não reutilizar
  uma regra contextual sem verificar seu comportamento sem usuário.

### 7. LPS aplicado aos models

LPS significa **Linha de Produto de Software**. Não e um recurso do Django: e
um mecanismo do DJTools/SUAP para uma instalacao substituir ou acrescentar
comportamentos sem editar diretamente o arquivo principal do modulo.

A variante ativa e indicada por `settings.LPS`, cujo valor padrão e vazio em
`suap/settings_base.py:738`. Quando existe uma variante, o `ModelPlus` participa
do mecanismo por esta cadeia:

```text
ModelPlus -> SUAPMetaModel -> MetaModelPlus
```

- `ModelPlus` usa `SUAPMetaModel` em
  `djtools/db/models/__init__.py:449-466`;
- `SUAPMetaModel` herda de `MetaModelPlus`;
- `MetaModelPlus`, em `djtools/lps.py:21-41`, procura um arquivo no formato
  `<app>/lps/<settings.LPS>/models.py`;
- se encontrar nesse arquivo uma classe com o mesmo nome, copia seus atributos
  e métodos para o model que esta sendo criado.

#### Exemplo real da instalacao

O arquivo `rh/lps/demo_lps/models.py:4-19` personaliza o model `Servidor`:

```python
class Servidor:
    # Substitui o metodo de mesmo nome existente no model principal.
    def get_titulacao(self):
        return 'LPS Titulacao'

    # Substitui tambem a representacao textual do servidor.
    def __str__(self):
        return f'{self.nome} - {self.matricula}'
```

Com `settings.LPS = 'demo_lps'`, ao criar a classe `Servidor` declarada em
`rh/models.py:1973`, `MetaModelPlus` importa `rh.lps.demo_lps.models`, encontra
outra classe chamada `Servidor` e copia esses métodos para a classe efetiva.
Sem uma LPS ativa, prevalece o comportamento do model principal.

### Comportamento padrão e comportamento substituído

Considere o método `get_titulacao()` do model principal:

```python
# rh/models.py
class Servidor(ModelPlus):
    def get_titulacao(self):
        return self.titulacao.nome
```

Sem uma LPS ativa, uma chamada usa essa implementação:

```python
servidor.get_titulacao()
# resultado: nome da titulação cadastrada
```

Com `settings.LPS = 'demo_lps'`, a classe de mesmo nome em
`rh/lps/demo_lps/models.py` pode substituir somente esse comportamento:

```python
class Servidor:
    def get_titulacao(self):
        return 'LPS Titulacao'
```

O fluxo fica:

```text
Servidor em rh/models.py
          │
          ├── LPS vazia ───────────────► usa get_titulacao() padrão
          │
          └── LPS = demo_lps ──────────► substitui pelo método da LPS
```

O restante do model continua sendo o model principal. A LPS pode acrescentar
ou substituir métodos e atributos, mas não deve ser tratada como uma nova
tabela. Para descobrir o comportamento efetivo, confira `settings.LPS`, o
arquivo da variante e o model original.

Esse recurso exige cuidado: ao analisar um model, a implementacao executada
pode estar no arquivo principal **ou** na LPS ativa. Alteracoes estruturais de
campos continuam exigindo analise de migrations e do banco; a LPS não elimina
o ciclo normal de alteração do schema.

### 8. Estudo integrado - Managers e QuerySets de `Turma`

Managers e QuerySets são analisados juntos porque cumprem responsabilidades
complementares. O manager é a porta de entrada da consulta e escolhe o
`QuerySet` inicial; o QuerySet organiza filtros, ordenação e otimizações que
podem ser encadeados até a avaliação da consulta.

```text
Turma.objects ou Turma.locals
             │
             ▼
      TurmaManager
             │ escolhe o escopo inicial
             ▼
        TurmaQuery
             │ filtros, métodos e select_related()
             ▼
      consulta avaliada
             │
             ▼
          registros
```

Por exemplo, uma view pode escolher `Turma.locals`, enquanto o manager aplica
o escopo do usuário e o `TurmaQuery` acrescenta métodos reutilizáveis, como a
busca de alunos matriculados. Ler apenas a view mostra o ponto de entrada, mas
não revela todos os filtros; ler apenas o QuerySet não mostra quem escolheu o
escopo. A análise conjunta reconstrói a consulta completa.

#### 8.1. Exemplo principal: `Turma`

Arquivos:

- model: `edu/models/turmas.py:19-89`;
- managers: `edu/managers.py:393-445`;
- view: função `turma` em `edu/views.py`;
- template: `edu/templates/turma.html`.

Sequencia sugerida:

1. Mostrar `objects = TurmaManager()`.
2. Mostrar `locals = TurmaLocalManager()`.
3. Abrir `TurmaQuery` e identificar métodos reutilizaveis.
4. Abrir `TurmaLocalManager.get_queryset()` e seguir as regras por perfil.
5. Comparar resultados para Diretor Academico e outro perfil.
6. Mostrar por que permissao da view e filtro do manager sao camadas distintas.
7. O encadeamento de QuerySets não executa SQL imediatamente.
8. Mostrar `select_related()` em um metodo que retorna alunos.

Siga o fluxo completo sem reproduzir todas as
classes no material:

1. localizar os managers na classe `Turma`;
2. abrir as implementacoes em `edu/managers.py`;
3. executar consultas equivalentes no shell;
4. seguir o manager escolhido pela view;
5. observar os dados consumidos pelo template.

<a id="etapa-4"></a>

## Etapa 4 - Métodos, regras, validação e ciclo da instância

Esta etapa mostra o que acontece com uma instância desde a criação até a
persistência ou exclusão. O ponto central é distinguir o estado do objeto em
memória das operações que realmente alteram o banco de dados.

### Visão geral do ciclo de vida

```text
Dados de entrada
        ↓
Instância em memória
        ↓
clean() / full_clean()
        ↓
save()
        ↓
INSERT ou UPDATE no banco
        ↓
Auditoria e efeitos do SUAP
        ↓
Consulta, alteração ou delete()
```

Nem toda mudança passa por todas as etapas. Um `QuerySet.update()` altera o
banco diretamente e não executa os métodos da instância. Por isso, escolher a
operação correta é parte da regra de negócio.

| Operação | Efeito principal | Métodos da instância |
| --- | --- | --- |
| `obj.save()` | Insere ou atualiza um objeto | Executa o `save()` sobrescrito |
| `qs.update(...)` | Atualiza várias linhas diretamente | Não executa o `save()` de cada objeto |
| `obj.delete()` | Exclui uma instância | Executa o `delete()` sobrescrito |
| `qs.delete()` | Exclui o conjunto consultado | Não deve ser tratado como várias chamadas a `obj.delete()` |

Esta etapa acompanha o comportamento da entidade: seus métodos fundamentais,
regras de negócio, camadas de validação e estados antes e depois da gravação.

### 1. Métodos fundamentais de um model

Um model não e apenas uma descrição da tabela. Cada instância representa um
registro e pode concentrar representacao, validação, persistencia e regras de
negócio. Isso permite que forms, views, admins, tasks e comandos reutilizem o
mesmo comportamento.

Resumo inicial:

| Metodo | Finalidade | Chamada automatica? |
| --- | --- | --- |
| `__str__()` | Representacao humana da instância | Sim, quando Python/Django converte o objeto para texto |
| `get_absolute_url()` | URL principal do objeto | Somente por componentes que seguem essa convencao ou por chamada explicita |
| `clean()` | Regras de validação entre campos e regras do objeto | Não por `save()`; e executado dentro de `full_clean()` |
| `full_clean()` | Executa as etapas de validação do model | Não por `save()`; o código deve chamar ou usar um `ModelForm` |
| `save()` | Insere ou atualiza o registro | Somente quando chamado explicitamente ou por APIs que o utilizam |
| `delete()` | Exclui a instância e processa relacoes | Somente quando chamado explicitamente |
| `refresh_from_db()` | Recarrega valores persistidos | Somente quando chamado explicitamente |

#### 1.1. Métodos de instância, `self`, `pk` e estado

Os métodos mais comuns de um model sao métodos de instância. O primeiro
parametro, convencionalmente chamado `self`, e o objeto atual:

```python
plano = PlanoEnsino.objects.get(pk=10)

plano.__str__()
# Dentro de __str__, self e o objeto plano.
```

Alguns atributos importantes:

- `self.pk`: valor da chave primaria, qualquer que seja o nome do campo;
- `self.id`: funciona quando a chave primaria se chama `id`;
- `self._state.adding`: indica se o Django considera a instância ainda não
  inserida;
- `self._state.db`: informa de qual alias de banco a instância foi carregada.

Uma instância nova normalmente ainda não possui chave primaria:

```python
plano = PlanoEnsino(diario=diario)
plano.pk
# None

plano.save()
plano.pk
# Chave gerada pelo banco.
```

Não usar somente `if self.pk` para todas as decisões de persistencia sem avaliar
o caso. Uma chave primaria pode ser atribuida antes do primeiro `save()`. Quando
a distincao entre inclusão e alteração for essencial, `self._state.adding` pode
expressar melhor a intencao.

#### 1.2. `__str__()`: representação humana

`__str__()` deve retornar uma string que identifique a instância para uma
pessoa. Essa representacao aparece em selects de formulários, admin, logs,
mensagens, shell e em qualquer chamada a `str(obj)`.

`PlanoEnsino`, em `edu/models/plano_ensino.py:25-26`, usa o diario relacionado:

```python
def __str__(self):
    return f'Plano de Ensino - {self.diario}'
```

Uso:

```python
plano = PlanoEnsino.objects.get(pk=10)
str(plano)
# 'Plano de Ensino - <representacao do diario>'
```

Um exemplo mais detalhado esta em `edu/models/estagio_docente.py:108-115`:

```python
def __str__(self):
    return '({}) Estagio de {} ({}), no periodo {}.{}'.format(
        self.pk,
        self.matricula_diario.matricula_periodo.aluno.get_nome_social_composto(),
        self.matricula_diario.matricula_periodo.aluno.matricula,
        self.matricula_diario.matricula_periodo.ano_letivo.ano,
        self.matricula_diario.matricula_periodo.periodo_letivo,
    )
```

Cuidados:

- sempre retornar uma string;
- evitar uma representacao generica como apenas `Objeto 10` quando houver uma
  identificacao melhor;
- evitar regras com efeitos colaterais;
- evitar consultas caras, pois uma listagem pode chamar `str()` muitas vezes;
- tratar campos opcionais para não gerar excecao;
- lembrar que acessar relacoes dentro de `__str__()` pode produzir N+1
  consultas em listas e campos de selecao.

O `ModelPlus` possui uma representacao de reserva em
`djtools/db/models/__init__.py:471-477`: ele procura o primeiro campo textual
preenchido e, se não encontrar, retorna o nome legível e a chave. Mesmo assim,
models importantes devem declarar um `__str__()` que represente seu domínio.

#### 1.3. `get_absolute_url()`: URL principal do objeto

`get_absolute_url()` e uma convencao do Django para o objeto informar sua URL
principal. O metodo não redireciona sozinho; ele apenas retorna uma string de
URL.

Em `PlanoEnsino`, nas linhas `edu/models/plano_ensino.py:28-29`, a URL principal
e o PDF do plano:

```python
def get_absolute_url(self):
    return f'/edu/plano_ensino_pdf/{self.pk:d}/'
```

Uso:

```python
plano.get_absolute_url()
# '/edu/plano_ensino_pdf/10/'
```

O metodo também pode devolver uma URL externa ou de arquivo. `MaterialAula`, em
`edu/models/diarios.py:1791-1800`, faz isso:

```python
def __str__(self):
    return self.descricao

def get_absolute_url(self):
    if self.arquivo:
        return self.arquivo.url
    if (
        self.url.startswith('http://')
        or self.url.startswith('https://')
        or self.url.startswith('ftp://')
    ):
        return self.url
    return f'http://{self.url}'
```

A view usa esse metodo de forma real em `edu/views.py:7951-7964`:

```python
materialaula = get_object_or_404(MaterialAula, pk=pk_materialaula)
# Registra o acesso...
return HttpResponseRedirect(materialaula.get_absolute_url())
```

Vantagem: a view não precisa conhecer como a URL do material e formada. Se a
regra mudar, o comportamento fica concentrado no model.

Nesta base existem muitas URLs montadas com strings, mas em código novo deve-se
avaliar o uso de `reverse()` e nomes de URL para reduzir acoplamento com o
endereço literal.

#### 1.4. `clean()`: validação da instância

`clean()` e adequado para regras que dependem de mais de um campo ou do estado
geral da entidade. Ele deve levantar `ValidationError` quando a instância for
invalida.

O model `Componente`, em `edu/models/cursos.py:53-61`, impede duplicidade por
descrição e exige que a sigla seja única sem diferenciar maiúsculas de
minúsculas. O trecho abaixo foi apenas reformatado para facilitar a leitura em
aula; a regra corresponde ao código dessas linhas:

```python
def clean(self):
    if hasattr(self, 'nivel_ensino'):
        qs = Componente.objects.filter(
            descricao=self.descricao,
            ch_hora_relogio=self.ch_hora_relogio,
            ch_hora_aula=self.ch_hora_aula,
            nivel_ensino=self.nivel_ensino,
            observacao=self.observacao,
        ).exclude(id=self.id)

        if qs.exists():
            raise ValidationError(
                'Ja existe um componente cadastrado com os mesmos dados.'
            )

    if (
        Componente.objects
        .filter(sigla__iexact=self.sigla)
        .exclude(id=self.id)
        .exists()
    ):
        raise ValidationError('A sigla do componente deve ser unica.')
```

O `.exclude(id=self.id)` e importante durante a edicao: o registro atual não
deve ser interpretado como duplicidade dele mesmo.

Uma validação associada a um campo específico pode usar um dicionario. O model
`EstagioDocente`, em `edu/models/estagio_docente.py:135-151`, possui este padrão:

```python
raise ValidationError(
    {
        'ch_final': (
            f'A carga horaria deve ser igual a '
            f'{carga_horaria_total_componente}.'
        )
    }
)
```

O erro pode, assim, aparecer junto ao campo `ch_final` em um `ModelForm`. Uma
mensagem simples, sem dicionario, normalmente vira erro geral do formulário.

Quando o model herda validações de outra classe, deve preservar a cadeia com
`super().clean()`. `CursoCampus.clean()`, em `edu/models/cursos.py:616-621`, faz
isso depois de suas regras:

```python
def clean(self):
    if CursoCampus.objects.filter(
        codigo__iexact=self.codigo,
    ).exclude(id=self.id).exists():
        raise ValidationError(
            'Ja existe um curso com este mesmo codigo.'
        )
    if self.ativo and self.data_fim:
        raise ValidationError('Um curso ativo nao pode ter data de fim')
    super().clean()
```

`clean()` não substitui uma restricao de banco quando a regra precisa resistir
a concorrência. Validacoes de unicidade relevantes devem ter suporte de
`unique=True`, `unique_together` ou `UniqueConstraint` sempre que possível.

#### 1.5. `save()`: inclusão e alteração

`save()` persiste a instância. Em geral, uma instância nova produz `INSERT` e
uma instância existente produz `UPDATE`.

```python
plano = PlanoEnsino(diario=diario)
plano.save()  # INSERT

plano.ementa = 'Nova ementa'
plano.save()  # UPDATE
```

O exemplo mais direto esta em `PlanoEnsino.save()`, localizado em
`edu/models/plano_ensino.py:31-34`:

```python
def save(self, *args, **kwargs):
    if self.coordenador_curso is None:
        self.coordenador_curso = (
            self.diario.turma.curso_campus.coordenador
        )
    super().save(*args, **kwargs)
```

Fluxo desse metodo:

1. recebe os argumentos aceitos pelo `save()` original;
2. verifica se o coordenador ainda não foi definido;
3. obtem o coordenador pelo caminho diario, turma e curso;
4. atribui o valor antes da persistencia;
5. chama a implementacao da classe pai.

Sem `super().save(*args, **kwargs)`, a instância não seria persistida pelo
Django. Aceitar e repassar `*args` e `**kwargs` preserva opções como `using`,
`force_insert`, `force_update` e `update_fields`.

Existe também uma camada própria do SUAP. `ModelPlus.save()`, em
`djtools/db/models/__init__.py:530-534`, atualiza o conteúdo otimizado de busca
quando o model possui esse atributo e depois chama o Django:

```python
def save(self, *args, **kwargs):
    if hasattr(self, 'search_fields_optimized'):
        self.search_fields_optimized = (
            self._get_search_fields_optimized_content_to_save()
        )
    return super().save(*args, **kwargs)
```

Portanto, ao chamar `super().save()` em um model derivado de `ModelPlus`, o
fluxo ainda passa pelas customizacoes compartilhadas do SUAP antes de chegar ao
`models.Model` do Django.

`save()` persiste campos concretos do próprio model, mas não substitui as
operações de uma relação muitos para muitos. O objeto precisa ser salvo para
obter uma chave primaria e, depois, a relação deve ser tratada com `add()`,
`set()` ou pelo `save_m2m()` de um `ModelForm` salvo com `commit=False`.

#### 1.6. Cuidados ao sobrescrever `save()`

O erro mais comum é substituir o `save()` e esquecer de chamar a classe-pai:

```python
class Turma(models.Model):
    codigo = models.CharField(max_length=20)

    def save(self, *args, **kwargs):
        self.codigo = self.codigo.upper()
        # Esquecido: super().save(*args, **kwargs)
```

Nesse caso, `turma.save()` altera o objeto apenas em memória. Nenhum `INSERT`
ou `UPDATE` é enviado ao banco: depois de uma nova consulta, o valor antigo
continua lá e, se for um objeto novo, ele nem recebe `pk`.

A versão correta preserva a persistência do Django e acrescenta a regra:

```python
def save(self, *args, **kwargs):
    self.codigo = self.codigo.upper()
    super().save(*args, **kwargs)
```

```text
save() sem super()       objeto muda em memória ──X──► banco
save() com super()       regra personalizada ───────► INSERT/UPDATE
```

Checklist de implementacao:

1. aceitar `*args` e `**kwargs`;
2. chamar `super().save(*args, **kwargs)`;
3. definir se a regra acontece antes ou depois da persistencia;
4. considerar `update_fields`;
5. evitar consultas e efeitos externos desnecessarios;
6. evitar chamar `self.save()` dentro de `save()` e provocar recursao;
7. verificar se várias escritas dependentes podem deixar dados parciais;
8. evitar envio de e-mail ou chamada externa em uma transação que ainda pode
   falhar;
9. lembrar que `QuerySet.update()` não chama o `save()` do model;
10. criar testes para inclusão, edicao e salvamento parcial.

Um exemplo de efeito posterior ao salvamento esta em
`ComponenteCurricular.save()`, em `edu/models/cursos.py:230-234`:

```python
def save(self, *args, **kwargs):
    super().save(*args, **kwargs)

    self.matriz.verificar_inconsistencias()
    self.matriz.save()
```

Depois de persistir o componente curricular, o metodo recalcula e salva o
estado de sua matriz. Isso mostra por que um `save()` customizado pode ter um
custo e um alcance maiores do que um único `UPDATE`.

#### 1.7. `delete()`: exclusão da instância

`delete()` remove a instância e processa as relacoes conforme `on_delete`.

```python
componente_curricular.delete()
```

O `delete()` original do Django retorna uma tupla com a quantidade total
excluida e a distribuicao por model. Uma sobrescrita que não retorna o resultado
de `super().delete()` pode descartar essa informacao, como ocorre em alguns
métodos antigos desta base.

O model `ComponenteCurricular`, em `edu/models/cursos.py:236-240`, executa uma
regra depois da exclusão:

```python
def delete(self, *args, **kwargs):
    super().delete(*args, **kwargs)

    self.matriz.verificar_inconsistencias()
    self.matriz.save()
```

Outro exemplo esta em `ParticipacaoColacaoGrau`, nas linhas
`edu/models/eventos.py:58-68`:

```python
def delete(self, *args, **kwargs):
    super(ParticipacaoColacaoGrau, self).delete(*args, **kwargs)
    self.aluno.atualizar_situacao(
        'Exclusao da Participacao em Colacao de Grau'
    )
```

Nesse caso, excluir uma participacao exige recalcular a situação do aluno.

Cuidados:

- analisar `CASCADE`, `SET_NULL` e `PROTECT` antes da exclusão;
- decidir se o efeito adicional ocorre antes ou depois de `super().delete()`;
- preservar dados relacionados que ainda serao usados depois da exclusão;
- usar transação quando exclusão e atualizacoes posteriores formarem uma única
  operação de negócio;
- lembrar que arquivos em storage podem exigir tratamento separado;
- testar tanto `obj.delete()` quanto exclusoes em massa.

Uma diferença importante:

```python
obj.delete()
```

chama o `delete()` sobrescrito na classe. Ja:

```python
MeuModel.objects.filter(...).delete()
```

executa a exclusão pelo `QuerySet` e não chama o metodo `delete()` individual
sobrescrito de cada instância. Os sinais de exclusão seguem regras próprias do
Django, mas a logica escrita somente no metodo pode ser ignorada. Isso e
relevante no EDU, que possui vários `delete()` customizados e também exclusoes
por `QuerySet` em views.

#### 1.8. Métodos de domínio

Métodos de domínio expressam acoes e perguntas da entidade com nomes próximos
da regra de negócio. Eles evitam repetir logica em views, forms e tasks.

`PlanoEnsino`, em `edu/models/plano_ensino.py:36-57`, possui três exemplos:

```python
def devolver_para_professor(self, user, justificativa):
    self.data_submissao = None
    self.notificar_devolucao(user, justificativa)
    self.save()

def devolver_para_coordenador(self, user, justificativa):
    self.data_aprovacao = None
    self.notificar_devolucao(user, justificativa)
    self.save()

def can_change(self, user):
    return (
        self.data_submissao is None
        and self.diario.professordiario_set.filter(
            professor__vinculo_id=user.get_vinculo().pk,
        ).exists()
    )
```

Os dois primeiros sao comandos: alteram estado, notificam e salvam. O terceiro
e uma consulta: responde se o usuário pode alterar o plano.

A view `devolver_plano_ensino`, em `edu/views.py:14740-14752`, reutiliza esses
métodos:

```python
if destino == 'professor' and request.user.has_group_cached(
    'Coordenador de Curso'
):
    plano.devolver_para_professor(
        request.user,
        form.cleaned_data['justificativa'],
    )
elif destino == 'coordenador' and request.user.has_group_cached(
    'Diretor Academico'
):
    plano.devolver_para_coordenador(
        request.user,
        form.cleaned_data['justificativa'],
    )
```

A view decide qual acao HTTP esta autorizada, enquanto o model executa a acao
do plano. Essa divisao reduz duplicacao e permite chamar a mesma regra por outro
ponto do sistema.

Cuidados para métodos de domínio:

- usar nomes que representem a acao, como `fechar()`, `transferir()` ou
  `devolver_para_professor()`;
- deixar claro se o metodo apenas calcula ou também salva;
- documentar efeitos externos, como notificacoes;
- receber dependencias necessárias, como `user`, sem depender silenciosamente
  de estado global quando isso puder ser evitado;
- proteger operações com várias escritas por transação quando forem atomicas;
- manter verificacoes de permissao de requisição também na camada apropriada.

### 2. Regras de negócio no model

Uma **regra de negócio** representa uma condição ou comportamento necessário
para o funcionamento correto do domínio. No EDU, sao exemplos de regras de
negócio:

- um curso ativo não pode possuir data de fim;
- somente a última via de um diploma pode ser cancelada;
- uma turma não pode ser excluida se possuir alunos matriculados;
- um plano de ensino devolvido ao professor deixa de estar submetido;
- um usuário somente pode realizar determinado procedimento se possuir o papel
  e o escopo institucional exigidos.

O objetivo não e colocar toda a logica no `models.py`. O objetivo e deixar cada
regra no nivel que consegue garanti-la com maior segurança e reutilização.

#### 2.1. Como escolher onde implementar a regra

Usar como referencia a seguinte divisao:

| Tipo de regra | Local mais adequado | Exemplo |
| --- | --- | --- |
| Restricao simples de um campo | declaracao do campo | `unique=True`, `null=False`, `PositiveIntegerField` |
| Restricao que deve ser garantida pelo banco | `Meta.constraints` ou `unique_together` | uma matrícula por aluno, ano e período |
| Validação da entidade envolvendo vários campos | `Model.clean()` | curso ativo não pode ter data de fim |
| Ajuste obrigatorio antes de persistir | `Model.save()` | preencher o coordenador do plano quando estiver vazio |
| Acao própria da entidade | metodo de domínio | cancelar diploma ou devolver plano de ensino |
| Validação exclusiva de uma tela | `Form.clean_<campo>()` ou `Form.clean()` | conferir intervalo de datas informado no formulário |
| Consulta reutilizavel | `QuerySet` ou `Manager` | turmas pendentes ou em andamento |
| Autorizacao dependente de usuário e escopo | `edu/perms.py` e view | procedimentos acadêmicos em determinado curso |
| Coordenacao HTTP | view | ler requisição, validar form, chamar o model e redirecionar |
| Processamento demorado ou em lote | task | fechar o período de várias matriculas e diarios |

### Um exemplo curto para cada tipo de regra

Os exemplos abaixo mostram a responsabilidade de cada camada:

```python
# Campo: regra simples declarada no próprio campo.
quantidade = models.PositiveIntegerField(default=0)

# Banco: combinação que não pode se repetir.
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['aluno', 'periodo'],
            name='unico_aluno_periodo',
        ),
    ]

# Model.clean(): regra entre campos da entidade.
def clean(self):
    if self.data_fim and self.ativo:
        raise ValidationError('Um registro ativo não pode ter data de fim.')

# Model.save(): ajuste obrigatório antes de persistir.
def save(self, *args, **kwargs):
    if not self.codigo:
        self.codigo = gerar_codigo()
    super().save(*args, **kwargs)

# Método de domínio: ação com significado no negócio.
def cancelar(self, motivo):
    self.cancelado = True
    self.motivo_cancelamento = motivo
    self.save()

# Form: validação exclusiva dos dados enviados pela tela.
def clean_data_fim(self):
    data_fim = self.cleaned_data['data_fim']
    if data_fim and data_fim < self.cleaned_data['data_inicio']:
        raise ValidationError('A data final deve ser posterior à inicial.')

# QuerySet/Manager: consulta reutilizável.
class TurmaQuerySet(models.QuerySet):
    def pendentes(self):
        return self.filter(data_submissao__isnull=True)

# View: coordenação da requisição HTTP.
def editar(request, pk):
    obj = get_object_or_404(Modelo, pk=pk)
    form = Form(request.POST or None, instance=obj)
    if form.is_valid():
        form.save()
        return redirect(obj)

# Task: processamento demorado ou em lote.
def fechar_periodos():
    MatriculaPeriodo.objects.filter(encerrado=False).update(encerrado=True)
```

A regra deve ficar na camada que consegue reaplicá-la em todos os caminhos de
entrada. Se a mesma validação precisa valer no admin, em uma view e em uma
task, ela não deve existir somente no formulário de uma tela.

Regra prática:

```text
Regra estrutural e reutilizavel da entidade
-> campo, restricao do banco, clean() ou metodo do model.

Regra de entrada de uma tela especifica
-> form.

Coordenacao da requisicao e da resposta HTTP
-> view.

Consulta reutilizavel e combinavel
-> QuerySet ou manager.

Processamento demorado ou em lote
-> task, reutilizando os metodos dos models.
```

#### 2.2. Métodos de domínio: o model como comportamento

Um model não precisa ser apenas um conjunto de campos. Ele pode oferecer
métodos com nomes que representem as acoes do negócio.

Em `edu/models/plano_ensino.py:36-57`, `PlanoEnsino` concentra as operações de
devolucao e a verificacao de alteração:

```python
def notificar_devolucao(self, user, justificativa):
    mensagem = '''Caro professor(a),
    O plano de ensino do diario {} foi devolvido por {} pelo seguindo motivo:
    {}
    '''.format(self.diario, user, justificativa)
    emails = set()
    for professor_diario in self.diario.professordiario_set.all():
        emails.add(professor_diario.professor.get_vinculo().pessoa.email)
    send_mail('Devolucao de Plano de Ensino', mensagem, None, list(emails))

def devolver_para_professor(self, user, justificativa):
    self.data_submissao = None
    self.notificar_devolucao(user, justificativa)
    self.save()

def devolver_para_coordenador(self, user, justificativa):
    self.data_aprovacao = None
    self.notificar_devolucao(user, justificativa)
    self.save()

def can_change(self, user):
    return self.data_submissao is None and self.diario.professordiario_set.filter(
        professor__vinculo_id=user.get_vinculo().pk
    ).exists()
```

Responsabilidade de cada metodo:

- `notificar_devolucao()` monta a mensagem, localiza os e-mails dos professores
  vinculados ao diario e envia a notificacao;
- `devolver_para_professor()` desfaz a submissao, notifica e salva;
- `devolver_para_coordenador()` desfaz a aprovacao, notifica e salva;
- `can_change()` responde se o plano ainda não foi submetido e se o vinculo do
  usuário pertence a um professor daquele diario.

Os nomes expressam intencao. Para quem chama, e mais claro escrever
`plano.devolver_para_professor(user, justificativa)` do que repetir em várias
views quais campos devem ser limpos e quando salvar.

#### 2.3. Como a view utiliza a regra do model

Em `edu/views.py:14740-14752`, a view coordena a requisição, mas delega a acao
principal ao model:

```python
@login_required()
@rtr()
def devolver_plano_ensino(request, destino, pks):
    title = 'Devolver Plano de Ensino'
    form = DevolverPlanoEnsino(data=request.POST or None)
    if form.is_valid():
        for plano in PlanoEnsino.objects.filter(pk__in=pks.split('__')):
            if destino == 'professor' and request.user.has_group_cached('Coordenador de Curso'):
                plano.devolver_para_professor(
                    request.user, form.cleaned_data['justificativa']
                )
            elif destino == 'coordenador' and request.user.has_group_cached('Diretor Acadêmico'):
                plano.devolver_para_coordenador(
                    request.user, form.cleaned_data['justificativa']
                )
        return httprr('..', 'Acao realizada com sucesso.')
    return locals()
```

Divisao das responsabilidades:

- a view recebe `request`, `destino` e os identificadores;
- instância e valida o formulário;
- identifica os objetos que participam da operação;
- verifica o grupo do usuário;
- chama o metodo de domínio adequado;
- produz a resposta HTTP com `httprr()`.

O model, por sua vez, conhece quais campos mudam, qual notificacao deve ser
enviada e quando o plano precisa ser salvo.

#### 2.4. Cuidados ao implementar regras no model

1. **Evitar duplicacao:** se a regra vale para todas as entradas, centraliza-la
   no model ou no banco.
2. **Não depender apenas do template:** condições visuais melhoram a interface,
   mas não protegem a operação.
3. **Manter `save()` previsivel:** efeitos grandes devem aparecer em métodos com
   nomes explicitos.
4. **Usar transação em operações compostas:** principalmente quando vários
   registros precisam mudar juntos.
5. **Separar consulta de comando:** quem chama deve saber se o metodo apenas
   responde ou se grava dados.
6. **Não duplicar regra em task:** a task coordena; o model executa a regra de
   cada entidade.
7. **Cobrir caminhos alternativos:** testar criação pelo form, model, admin,
   importacao ou task conforme a importancia da regra.
8. **Tratar efeitos externos:** banco pode sofrer rollback, mas e-mail e API
   externa exigem estratégia própria.

### 3. Validação e integridade

Validação e integridade possuem objetivos relacionados, mas não identicos:

- **validação** verifica se um valor ou um objeto atende as regras da aplicação
  e procura apresentar uma mensagem compreensivel ao usuário;
- **integridade** impede que o banco permaneça em um estado impossivel, mesmo
  quando os dados chegam por shell, task, importador ou requisições concorrentes.

Uma aplicação robusta normalmente utiliza mais de uma camada. O form oferece
retorno amigável, o model centraliza regras reutilizáveis e o banco representa a
última barreira de proteção.

| Camada | Responsabilidade | Quando é usada |
| --- | --- | --- |
| Campo do model | Restringir tipo, formato e valores básicos | Na definição da estrutura |
| `Model.clean()` | Validar regras que dependem da instância ou de vários campos | Durante `full_clean()` ou `ModelForm.is_valid()` |
| `Meta.constraints` | Proteger unicidade e relações no banco | Em qualquer origem de escrita |
| Form | Validar os dados específicos de uma tela | Antes de criar ou alterar a instância |
| View ou serviço | Coordenar a requisição e verificar contexto | Durante o fluxo da aplicação |

O fluxo esperado para uma alteração é:

```text
Entrada do usuário
        ↓
Form.is_valid()
        ↓
ModelForm cria ou atualiza a instância
        ↓
Regras do model e restrições do banco
        ↓
save()
        ↓
Resposta ou redirecionamento
```

#### 3.1. Fluxo de validação de um model

Ao executar `obj.full_clean()`, o Django percorre, conceitualmente, as seguintes
etapas:

```text
Valor bruto atribuido ao campo
        |
        v
model.clean_fields()
  -> conversao e validacao de cada campo
  -> Field.to_python()
  -> Field.validate()
  -> Field.run_validators()
        |
        v
model.clean()
  -> regras que envolvem o estado completo do objeto
        |
        v
model.validate_unique()
  -> unique=True e unique_together
        |
        v
model.validate_constraints()
  -> restricoes declaradas em Meta.constraints
        |
        v
objeto validado em Python
        |
        v
save()
        |
        v
restricoes e integridade referencial do banco
```

Essas etapas podem acumular erros de vários campos em uma única
`ValidationError`. O fluxo também aceita `exclude`, permitindo ignorar campos
que não participam de determinado formulário.

Exemplo de chamada explicita:

```python
obj.full_clean()  # valida, mas nao grava
obj.save()        # grava, mas nao chama full_clean() automaticamente
```

Essa diferença e essencial: **validar não e salvar, e salvar não significa que
o model foi integralmente validado em Python**.

#### 3.2. O `save()` do SUAP chama `full_clean()`?

Não. O `ModelPlus`, classe-base utilizada por muitos models do SUAP, sobrescreve
`save()` em `djtools/db/models/__init__.py:530-534` apenas para atualizar o campo
de busca otimizada, quando ele existe, e depois chama o `save()` do Django:

```python
def save(self, *args, **kwargs):
    if hasattr(self, 'search_fields_optimized'):
        self.search_fields_optimized = (
            self._get_search_fields_optimized_content_to_save()
        )
    return super().save(*args, **kwargs)
```

Não ha uma chamada a `self.full_clean()` nesse metodo. Portanto, o código abaixo
pode chegar ao banco sem executar `clean_fields()` e `clean()`:

```python
obj = MeuModel(campo=valor)
obj.save()
```

Quando a operação não passa por um `ModelForm`, avaliar a chamada explicita:

```python
obj = MeuModel(campo=valor)
obj.full_clean()
obj.save()
```

Mesmo com `full_clean()`, regras criticas devem ser representadas no banco
quando isso for possível. Existe um intervalo entre a validação e a gravação no
qual outra requisição pode inserir um registro conflitante.

#### 3.3. Validação do objeto em `Model.clean()`

O `clean()` e utilizado quando a regra depende de mais de um campo ou do estado
relacionado ao objeto. Em `edu/models/cursos.py:187-219`, o
`ComponenteCurricular.clean()` verifica várias regras:

```python
def clean(self):
    from edu.models import MatrizCurso, EstruturaCurso

    if self.matriz.estrutura.tipo_avaliacao \
            == EstruturaCurso.TIPO_AVALIACAO_MODULAR \
            and not self.tipo_modulo:
        raise ValidationError(
            'A estrutura modular exige o tipo de modulo do componente.'
        )

    if self.tipo == self.TIPO_TRABALHO_CONCLUSAO_CURSO \
            and self.qtd_avaliacoes != 1:
        raise ValidationError(
            'Componentes de TCC devem possuir 1 avaliacao.'
        )

    if hasattr(self, 'componente') \
            and self.ch_presencial >= 0 and self.ch_pratica >= 0:
        soma = (
            self.ch_presencial + self.ch_pratica + self.ch_extensao
            + self.ch_pcc + self.ch_visita_tecnica
        )
        if soma != self.componente.ch_hora_relogio:
            raise ValidationError(
                f'A soma das cargas horarias deve ser '
                f'{self.componente.ch_hora_relogio}'
            )

    if self.periodo_letivo \
            and self.periodo_letivo > self.matriz.qtd_periodos_letivos:
        raise ValidationError(
            'O periodo letivo excede a quantidade de periodos da matriz.'
        )
```

O trecho foi reduzido apenas para destacar quatro validações reais:

- estrutura modular exige `tipo_modulo`;
- componente de TCC possui exatamente uma avaliação;
- a soma das cargas horarias deve coincidir com a carga do componente;
- período letivo não pode ultrapassar a duração da matriz.

Quando `ValidationError` recebe apenas uma string, o erro aparece como erro
geral do objeto, normalmente em `NON_FIELD_ERRORS`. Quando recebe um dicionario,
o erro pode ser associado a um campo específico.

Exemplo real em `edu/models/turmas.py:356-364`:

```python
def clean(self):
    if self.data_fim and self.data_inicio > self.data_fim:
        raise ValidationError({
            'data_inicio':
                'A data de inicio deve ser maior ou igual a data de fim.'
        })

    ch_total = 0
    if self.pk:
        for professor_minicurso in self.professorminicurso_set.all():
            ch_total += professor_minicurso.carga_horaria or 0
        if ch_total > self.minicurso.ch_total:
            raise ValidationError(
                'A soma das cargas-horarias dos professores nao pode '
                f'ultrapassar {self.minicurso.ch_total}h.'
            )
```

O dicionario associa o primeiro erro a `data_inicio`; o segundo e um erro geral,
pois representa a soma de vários registros relacionados.

#### 3.4. `validate_unique()`: validação amigavel e garantia no banco

Em `edu/models/cursos.py:18-31`, `Componente.sigla` possui `unique=True`:

```python
class Componente(LogModel):
    sigla = models.CharFieldPlus(max_length=255, unique=True)
```

Essa opcao atua em duas frentes:

- `validate_unique()` consulta o banco antes da gravação e pode produzir uma
  `ValidationError` amigavel;
- a migration cria uma restricao única no banco, que impede a duplicacao mesmo
  quando a validação Python não e executada.

Observe a diferença em dois caminhos de gravação:

```python
# Caminho com validação amigável.
obj = Componente(sigla='MAT')
obj.full_clean()       # pode levantar ValidationError com mensagem de campo
obj.save()

# Caminho direto, sem full_clean().
Componente.objects.create(sigla='MAT')
# Se já existir "MAT", o banco rejeita a operação pela restrição UNIQUE.
```

`validate_unique()` melhora a experiência porque aponta o problema antes da
gravação, permitindo que um form mostre a mensagem junto ao campo. A
restrição do banco é a garantia final: protege os dados mesmo em comandos,
tasks, integrações ou operações que não chamaram a validação Python.

```text
full_clean()/ModelForm ──► mensagem amigável
                              │
                              ▼
                         save no banco
                              │
                     restrição UNIQUE ──► garantia contra duplicidade
```

Para unicidade composta, o EDU ainda utiliza bastante `unique_together`. Em
`edu/models/historico.py:24-45`, `MatriculaPeriodo` declara:

```python
class Meta:
    ordering = ('ano_letivo__ano', 'periodo_letivo')
    verbose_name = 'Matricula em Periodo'
    verbose_name_plural = 'Matriculas em Periodo'
    unique_together = (('ano_letivo', 'periodo_letivo', 'aluno'),)
```

A regra significa que um aluno não pode ter duas matriculas para a mesma
combinação de ano e período letivo.

A implementacao no banco pode ser observada na migration
`edu/migrations/0002_auto_20190814_1454.py:1344-1350`:

```python
migrations.AlterUniqueTogether(
    name='matriculaperiodo',
    unique_together=set([
        ('ano_letivo', 'periodo_letivo', 'aluno')
    ]),
)
```

Isso mostra o caminho completo:

```text
declaracao no class Meta
-> makemigrations gera AlterUniqueTogether
-> migrate cria a restricao no banco
-> o banco rejeita combinacoes duplicadas
```

### 4. Ciclo de vida e estado da instância

Uma instância de model existe primeiro como um objeto Python. Durante seu ciclo
de vida, ela pode estar sem persistencia, ser inserida, atualizada, recarregada
ou excluida. Entender esse estado evita erros como:

- tentar alterar uma relação muitos-para-muitos antes de existir uma chave
  primaria;
- imaginar que atribuir um valor ao atributo já atualizou o banco;
- continuar usando valores antigos depois de um `QuerySet.update()`;
- executar novamente uma rotina de criação durante uma edicao;
- sobrescrever uma alteração concorrente com uma instância desatualizada;
- esperar que `QuerySet.update()` execute `save()` e sinais do model.

#### 4.1. Visao geral do ciclo de vida

```text
Model(**kwargs)
-> instancia apenas em memoria
-> pk normalmente e None
-> _state.adding e True

save() ou objects.create()
-> INSERT no banco
-> pk recebe o valor gerado
-> _state.adding passa a False

alteracao de atributos
-> muda somente a instancia em memoria

save() ou save(update_fields=[...])
-> UPDATE no banco

refresh_from_db()
-> substitui valores locais pelos valores atuais do banco

delete()
-> remove o registro
-> a chave primaria da instancia normalmente volta a None
```

O estado pode ser acompanhado em um exemplo curto:

```python
aluno = Aluno(nome='Ana')
# novo: aluno.pk is None e aluno._state.adding is True

aluno.save()
# persistido: recebeu pk e _state.adding passou a False

aluno.nome = 'Ana Souza'
# alterado: somente o objeto em memória mudou

aluno.save()
# atualizado: o novo nome foi gravado com UPDATE

aluno.refresh_from_db()
# carregado novamente: valores locais vêm do banco
```

Em resumo:

```text
novo ──save()──► persistido ──atribuição──► alterado em memória
  ▲                                      │
  └──────────── refresh_from_db() ◄──────┘
                         │
                         └──save()──► persistido novamente
```

Esse fluxo descreve o comportamento usual de models com chave primaria
automatica. Sobrescritas de `save()`, `delete()`, sinais e operações em lote
podem acrescentar comportamentos.

#### 4.2. Construtor: `Model(**kwargs)`

Instanciar um model cria um objeto Python, mas não grava nada. Em
`edu/models/atividades_complementares.py:25-35`, a replicacao de uma configuracao
cria explicitamente novos objetos:

```python
def replicar(self, descricao):
    configuracao_replicada = ConfiguracaoAtividadeAprofundamento()
    configuracao_replicada.descricao = descricao
    configuracao_replicada.save()

    for atividade_academica in self.itemconfiguracaoatividadeaprofundamento_set.all():
        nova_atividade_academica = ItemConfiguracaoAtividadeAprofundamento()
        nova_atividade_academica.configuracao = configuracao_replicada
        nova_atividade_academica.tipo = atividade_academica.tipo
        nova_atividade_academica.carga_horaria = atividade_academica.carga_horaria
        nova_atividade_academica.obs_carga_horaria = atividade_academica.obs_carga_horaria
        nova_atividade_academica.save()

    return configuracao_replicada
```

Passo a passo:

1. `ConfiguracaoAtividadeAprofundamento()` chama o construtor;
2. `descricao` e alterada apenas em memoria;
3. o primeiro `save()` insere a configuracao e preenche sua chave primaria;
4. cada item e instanciado sem persistencia;
5. a nova configuracao salva pode ser atribuida a sua `ForeignKey`;
6. `nova_atividade_academica.save()` insere cada item.

Os argumentos também podem ser enviados ao construtor:

```python
configuracao_replicada = ConfiguracaoAtividadeAprofundamento(
    descricao=descricao
)
```

Os dois formatos produzem o mesmo estado inicial. O construtor aplica defaults
dos campos e configura os valores na instância, mas não chama `full_clean()` nem
executa `INSERT`.

#### 4.3. `pk`, `id` e `_state.adding`

`pk` e o alias generico do campo definido como chave primaria. Quando o model
usa o `id` automatico do Django, `obj.pk` e `obj.id` representam o mesmo valor.

```python
obj = ConfiguracaoAtividadeAprofundamento(descricao='Exemplo')

obj.pk              # normalmente None
obj.id              # normalmente None
obj._state.adding   # True

obj.save()

obj.pk              # chave gerada pelo banco
obj.id              # o mesmo valor
obj._state.adding   # False
```

`_state` e uma estrutura interna do Django. O EDU não a consulta diretamente
nos arquivos analisados; em seu lugar, o código geralmente testa `self.pk`.

Em `edu/models/historico.py:1082-1091`, `MatriculaDiario.save()` guarda o valor
da chave antes de salvar para saber se o objeto acabou de ser criado:

```python
def save(self, *args, **kwargs):
    pk = self.pk
    super().save(*args, **kwargs)
    if not pk:
        self.criar_registros_notas()
    if self.diario.componente_curricular.is_seminario_estagio_docente \
            and not self.estagiodocente_set.exists():
        EstagioDocente.objects.create(matricula_diario=self)
```

O valor local `pk` representa o estado **antes** do `save()`. Depois do
`super().save()`, `self.pk` já existe, por isso o código precisa conservar o
valor anterior para executar `criar_registros_notas()` somente na insercao.

Uma alternativa mais explicita para distinguir os estados e:

```python
criando = self._state.adding
super().save(*args, **kwargs)
if criando:
    ...
```

O teste com `_state.adding` e mais preciso quando uma chave primaria e atribuida
manualmente antes do primeiro `save()`: nesse caso, `pk` pode ter valor enquanto
a instância ainda esta no estado de inclusão.

#### 4.4. Alterar a instância não altera imediatamente o banco

Considere uma matrícula carregada:

```python
matricula = MatriculaDiario.objects.get(pk=10)
matricula.nota_conselho = 80
```

Nesse ponto, `80` existe apenas no objeto `matrícula` do processo atual. Outra
consulta ao banco ainda recupera o valor anterior. A persistencia ocorre no
`save()`:

```python
matricula.save()
```

Também e possível ter duas instancias Python representando a mesma linha:

```python
primeira = MatriculaDiario.objects.get(pk=10)
segunda = MatriculaDiario.objects.get(pk=10)

primeira.situacao = MatriculaDiario.SITUACAO_APROVADO
primeira.save(update_fields=['situacao'])

segunda.situacao  # ainda pode conter o valor antigo
segunda.refresh_from_db(fields=['situacao'])
```

O ORM não sincroniza automaticamente objetos já carregados em memoria.

#### 4.5. `refresh_from_db()`

`refresh_from_db()` recarrega valores persistidos e substitui alterações locais
dos campos recarregados.

Em `edu/views.py:15097-15102`, ele e utilizado entre a gravação da nota e o
calculo da nova situação:

```python
matriculadiario.nota_conselho = nova_nota
matriculadiario.save(update_fields=['nota_conselho'])
matriculadiario.refresh_from_db()
nova_situacao = matriculadiario.get_situacao_diario()['constant']
```

Em `edu/management/commands/edu_fechar_diario.py:30-34`, o comando confirma o
estado que ficou no banco antes de exibi-lo:

```python
for diario in diarios:
    diario.fechar()
    diario.refresh_from_db()
    self.stdout.write(
        self.style.SUCCESS(
            f'Diario {diario.pk} fechado (situacao={diario.situacao})'
        )
    )
```

E possível limitar os campos:

```python
obj.refresh_from_db(fields=['situacao'])
```

Usar `fields` evita recarregar colunas desnecessarias. Entretanto, qualquer
alteração local não salva nesses campos sera descartada.

<a id="etapa-5"></a>

## Etapa 5 - ORM, consultas e desempenho

Esta etapa apresenta a leitura e alteração de dados com o ORM, a avaliação dos
`QuerySets` e os principais cuidados de desempenho.

Uma consulta ORM passa por três momentos: composição, avaliação e uso do
resultado. Separar esses momentos ajuda a prever quando o banco será acessado e
a escolher a quantidade de dados que precisa ser carregada.

```text
Manager
   ↓
QuerySet composto
   ↓  filter(), exclude(), order_by()
Consulta avaliada
   ↓  for, list, get, first, count ou exists
SQL executado
   ↓
Objetos ou valores retornados
```

### 1. QuerySet e avaliação preguiçosa

Um `QuerySet` e um objeto do ORM do Django que representa uma consulta ao banco.
Ele pode receber filtros, exclusoes, ordenações e outras operações antes de a
consulta ser realmente executada.

Na maior parte dos casos, criar ou encadear um `QuerySet` **não consulta o
banco imediatamente**. O Django guarda a descrição da consulta e adia sua
execução até o momento em que o programa realmente precisa do resultado. Esse
comportamento e chamado de **avaliação preguicosa**, **avaliação tardia** ou
*lazy evaluation*.

Para visualizar esse comportamento:

- o `QuerySet` e a lista de instrucoes de um pedido;
- `filter()`, `exclude()` e `order_by()` acrescentam instrucoes ao pedido;
- a avaliação e o momento em que o pedido e enviado ao banco;
- os objetos retornados sao o resultado entregue pelo banco.

| Tipo de operação | Exemplos | Consulta ao banco |
| --- | --- | --- |
| Componível | `filter()`, `exclude()`, `order_by()` | Normalmente não imediatamente |
| Avaliadora | `for`, `list()`, `len()` | Sim |
| Busca única | `get()`, `first()` | Sim |
| Contagem ou existência | `count()`, `exists()` | Sim, com consulta específica |

#### 1.1. Construir a consulta não significa executá-la

Considere o exemplo abaixo:

```python
qs = Aluno.objects.all()
qs = qs.filter(situacao__ativo=True)
qs = qs.filter(curso_campus__diretoria__setor__uo__sigla='CNAT')
qs = qs.order_by('pessoa_fisica__nome')
```

Cada chamada devolve um novo `QuerySet`. Até esse ponto, normalmente nenhuma
consulta foi executada. Isso permite montar a consulta gradualmente e executar
somente a versao final.

E importante observar que os métodos não alteram o `QuerySet` anterior:

```python
todos = Aluno.objects.all()
ativos = todos.filter(situacao__ativo=True)

# "todos" continua representando todos os alunos.
# "ativos" representa uma nova consulta, com o filtro adicional.
```

Essa caracteristica e chamada de **encadeamento** (*chaining*). Ela permite
criar uma consulta-base e gerar variacoes a partir dela.

#### 1.2. Exemplo real: composicao progressiva em um model

O metodo `get_componentes_curriculares()`, em
`edu/models/cursos.py:1010-1023`, constroi o `QuerySet` de acordo com os
argumentos recebidos:

```python
def get_componentes_curriculares(self, periodos=[], apenas_obrigatorio=False, apenas_optativas=False):
    qs = ComponenteCurricular.objects.filter(matriz_id=self.pk)
    if periodos:
        if type(periodos) == list:
            qs = qs.filter(periodo_letivo__in=periodos)
        else:
            qs = qs.filter(periodo_letivo=periodos)
    if apenas_obrigatorio:
        qs = qs.exclude(optativo=True)

    if apenas_optativas:
        qs = qs.exclude(optativo=False)

    return qs
```

Leitura do fluxo:

1. a linha 1011 cria a consulta-base dos componentes da matriz atual;
2. as linhas 1012-1016 acrescentam um filtro de período quando necessário;
3. as linhas 1017-1021 acrescentam exclusoes para componentes obrigatorios ou
   optativos;
4. a linha 1023 devolve o `QuerySet`, sem obrigar o metodo a carregar os
   registros;
5. quem chamou o metodo ainda pode acrescentar outros filtros antes da
   execução.

Esse ultimo ponto aparece em `edu/models/cursos.py:1025-1029`:

```python
def get_componentes_curriculares_regulares_obrigatorios(self):
    return self.get_componentes_curriculares(apenas_obrigatorio=True).filter(
        tipo=ComponenteCurricular.TIPO_REGULAR
    )

def get_componentes_curriculares_optativos(self):
    return self.get_componentes_curriculares().filter(
        tipo=ComponenteCurricular.TIPO_REGULAR,
        optativo=True,
    )
```

O metodo mais geral devolve uma consulta ainda componivel. Os métodos
especializados aproveitam essa base e acrescentam suas próprias regras.

> Observação: o argumento `periodos=[]` e mutavel. Neste metodo ele
> não e alterado, mas a forma mais segura para novos codigos seria usar
> `periodos=None` e inicializar a lista dentro da função.

#### 1.3. O que provoca a avaliação

Um `QuerySet` e avaliado quando o Python ou o Django precisa conhecer seus
resultados. Os casos mais importantes sao:

| Operacao | O que acontece |
| --- | --- |
| `for obj in qs` | Executa a consulta para iterar sobre os objetos. |
| `list(qs)` | Executa a consulta e cria uma lista Python. |
| `len(qs)` | Carrega os objetos e calcula o tamanho da lista em memoria. |
| `bool(qs)` ou `if qs` | Executa a consulta para determinar se ha resultados. |
| `repr(qs)` | Pode executar a consulta para montar a representacao interativa. |
| serializacao | Normalmente itera sobre o `QuerySet` e, por isso, o avalia. |
| `qs[0]` | Executa uma consulta limitada para buscar o primeiro índice. |
| `qs[inicio:fim]` | Acrescenta limites SQL; a execução ocorre quando o recorte e consumido. |
| `qs[inicio:fim:passo]` | O uso de passo pode forcar a avaliação e devolver uma lista. |

Métodos como `get()`, `first()`, `last()`, `exists()`, `count()`, `aggregate()`,
`create()`, `update()` e `delete()` também executam SQL imediatamente. Eles sao
operações terminais: devolvem um objeto, um valor ou o resultado de uma escrita,
e não apenas mais uma consulta componivel.

#### 1.4. Exemplo real: fatiamento e iteracao

Em `edu/views.py:6052-6055`, uma view limita a busca aos primeiros vinte alunos
e depois percorre o resultado:

```python
campus_sigla = request.GET.get('campus', '')
alunos_qs = Aluno.objects.filter(
    situacao__ativo=True,
    curso_campus__diretoria__setor__uo__sigla__iexact=campus_sigla,
)[0:20]
alunos = [aluno_to_dict(a) for a in alunos_qs]
response = JsonResponse(alunos)
```

Passo a passo:

1. `filter()` monta as condições da consulta;
2. `[0:20]` representa um recorte que sera convertido em `LIMIT 20` no SQL;
3. a compreensao da linha 6054 itera sobre `alunos_qs` e dispara a consulta;
4. o resultado e convertido em uma lista de dicionarios para o JSON.

O fatiamento e especialmente importante em telas, APIs e autocompletes, pois
evita carregar todos os registros quando apenas uma pequena pagina e
necessária.

#### 1.5. `get()`, `filter()` e `first()` não sao equivalentes

Comparar:

```python
Aluno.objects.get(pk=10)
# Executa imediatamente.
# Retorna um Aluno.
# Levanta Aluno.DoesNotExist se nao encontrar.
# Levanta Aluno.MultipleObjectsReturned se encontrar mais de um.

Aluno.objects.filter(pk=10)
# Nao executa imediatamente.
# Retorna um QuerySet, possivelmente vazio.

Aluno.objects.filter(pk=10).first()
# Executa imediatamente.
# Retorna o primeiro Aluno ou None.

get_object_or_404(Aluno, pk=10)
# Executa a busca e transforma DoesNotExist em resposta HTTP 404.
# E apropriado quando a ausencia do objeto significa recurso inexistente.
```

| Método | Retorno | Quando não encontra | Quando encontra vários | Uso adequado |
| --- | --- | --- | --- | --- |
| `get()` | uma instância | `DoesNotExist` | `MultipleObjectsReturned` | quando exatamente um registro deve existir |
| `filter()` | `QuerySet` | queryset vazio | retorna todos os resultados | quando zero, um ou vários são válidos ou a consulta ainda será composta |
| `first()` | primeira instância ou `None` | `None` | escolhe o primeiro conforme a ordenação | quando a ausência é normal e basta um resultado |

Exemplos de decisão:

```python
# A matrícula identificada pelo pk deve existir.
matricula = MatriculaPeriodo.objects.get(pk=10)

# Uma lista pode estar vazia e receber mais filtros.
alunos = Aluno.objects.filter(curso=curso).order_by('nome')

# Um registro principal é opcional.
coordenador = Professor.objects.filter(turma=turma).first()
```

Regra prática:

- use `get()` quando deve existir exatamente um registro e a camada atual sabe
  tratar as excecoes;
- use `filter()` quando a consulta pode retornar zero, um ou vários registros
  ou ainda precisa ser composta;
- use `first()` quando zero resultados e uma situação normal;
- use `get_object_or_404()` em views quando a ausencia deve produzir HTTP 404.

#### 1.6. `exists()`, `count()`, `len()` e `bool()`

Essas operações respondem perguntas diferentes:

```python
qs = Aluno.objects.filter(situacao__ativo=True)

qs.exists()  # Ha pelo menos um? Executa uma consulta otimizada.
qs.count()   # Quantos existem? Executa SELECT COUNT(...).
len(qs)      # Carrega os objetos e conta o resultado em memoria.
bool(qs)     # Carrega o QuerySet para decidir se esta vazio.
```

Escolha recomendada:

- se precisa apenas saber se existe algum registro, use `exists()`;
- se precisa apenas da quantidade, use `count()`;
- se também vai usar todos os objetos logo depois, avaliar uma vez e usar
  `len()` na colecao já carregada pode evitar uma consulta adicional;
- não use `count() > 0` quando `exists()` expressa melhor a intencao.

Exemplo real de `count()`: em `edu/views.py:1048-1050`, a consulta-base de
turmas recebe filtros diferentes, e cada chamada de `count()` executa sua
própria contagem no banco:

```python
qtd_anual = qs_turma.filter(
    ano_letivo=ano_letivo_corrente,
    curso_campus__periodicidade=CursoCampus.PERIODICIDADE_ANUAL,
).count()

qtd_outros = qs_turma.filter(
    ano_letivo=ano_letivo_corrente,
    periodo_letivo=periodo_letivo_corrente,
).exclude(
    curso_campus__periodicidade=CursoCampus.PERIODICIDADE_ANUAL,
).count()
```

Exemplo real de `exists()`: em `edu/q_academico.py:509-511`, o importador
verifica a existencia de alunos sem carregar seus campos:

```python
qs1 = Aluno.objects.filter(matricula=matricula, matriz__isnull=False)
qs2 = Aluno.objects.filter(
    matricula=matricula,
    registroemissaodiploma__sistema='SUAP',
    registroemissaodiploma__cancelado=False,
)
if (not qs1.exists() and not qs2.exists()) or forcar_importacao:
    # continua a importacao
```

#### 1.7. Resumo para o estudante

Ao ler um trecho com ORM, responder nesta ordem:

1. qual model e qual manager iniciam o `QuerySet`?
2. quais filtros, exclusoes e ordenações compoem a consulta?
3. qual linha realmente provoca a avaliação?
4. o código precisa de objetos, apenas da existencia ou apenas da quantidade?
5. o mesmo `QuerySet` sera consumido mais de uma vez?
6. os relacionamentos acessados foram preparados com `select_related()` ou
   `prefetch_related()`?
7. ha limite ou paginacao para impedir a carga de um conjunto muito grande?
8. quantas consultas o fluxo completo executa?

Ideia central: **o `QuerySet` permite compor a consulta antes de executa-la,
mas cabe ao desenvolvedor reconhecer cada ponto de avaliação e controlar o
número e o tamanho das consultas ao banco.**

### 2. Operacoes principais do ORM

O ORM (*Object-Relational Mapper*) permite manipular tabelas e registros por
meio de classes e objetos Python. No Django:

- a classe do model representa uma tabela;
- uma instância do model representa, em geral, uma linha;
- o `Manager`, como `objects` ou `locals`, e a porta de entrada das consultas;
- o `QuerySet` representa um conjunto de resultados;
- os lookups descrevem as condições que serao traduzidas para SQL.

No SUAP, e importante verificar qual manager esta sendo usado. `objects`
normalmente parte do conjunto geral, enquanto managers como `locals` podem
restringir os registros ao escopo do usuário. Trocar um pelo outro pode alterar
tanto o resultado quanto a regra de acesso.

#### 2.1. Operacoes componiveis e operações terminais

Antes de estudar cada comando, separar os métodos em dois grupos:

| Grupo | Exemplos | Resultado |
| --- | --- | --- |
| Componiveis | `all()`, `filter()`, `exclude()`, `order_by()`, `values()` | Devolvem outro `QuerySet` e normalmente permanecem preguicosos. |
| Terminais de leitura | `get()`, `first()`, `last()`, `count()`, `exists()`, `aggregate()` | Executam SQL e devolvem objeto, valor ou dicionario. |
| Terminais de escrita | `create()`, `update()`, `delete()`, `get_or_create()` | Executam SQL e alteram o banco. |

Uma cadeia pode conter vários métodos componiveis e terminar com apenas uma
operação que executa a consulta:

```python
quantidade = (
    Aluno.objects
    .filter(situacao__ativo=True)
    .exclude(matriz__isnull=True)
    .count()
)
```

`filter()` e `exclude()` montam a consulta; `count()` solicita o resultado ao
banco.

#### 2.2. Criação direta com `create()`

`Manager.create()` instância o model, salva imediatamente e devolve o objeto
criado:

```python
obj = Modelo.objects.create(campo=valor)
```

Exemplo real: durante a importacao de cursos, em
`edu/q_academico.py:266-277`, o sistema atualiza o registro encontrado ou cria
um novo `CursoCampus`:

```python
if qs.exists():
    if not qs[0].ativo:
        qs.update(**d)
else:
    diretoria_curso = Diretoria.objects.filter(
        codigo_academico=curso_campus['instituicao']
    )
    if diretoria_curso.exists():
        d.update({'diretoria': diretoria_curso[0]})
    CursoCampus.objects.create(**d)
```

O operador `**d` desempacota o dicionario: cada chave se torna o nome de um
campo e cada valor se torna o valor enviado ao model. Em termos conceituais,
`create(**d)` equivale a instanciar `CursoCampus(**d)` e chamar `save()`.

Como `create()` passa pelo `save()` do model, uma sobrescrita de `save()` e os
sinais correspondentes podem ser executados. Isso e diferente de
`QuerySet.update()`, apresentado adiante.

Outro exemplo real esta em `edu/views.py:3792-3800`: cada horario recebido da
tela gera um registro de `HorarioAulaDiario`:

```python
for h in horarios:
    pk_ha, dia = h.split(';')
    ha = get_object_or_404(HorarioAula, pk=pk_ha)
    HorarioAulaDiario.objects.create(
        diario=obj,
        dia_semana=int(dia),
        horario_aula=ha,
        sala=sala,
    )
```

#### 2.3. Leitura com `all()`, `filter()` e `get()`

Os três métodos atendem necessidades diferentes:

```python
Modelo.objects.all()                 # QuerySet com o conjunto inicial
Modelo.objects.filter(campo=valor)   # QuerySet com zero, um ou varios objetos
Modelo.objects.get(campo=valor)      # uma instancia; executa imediatamente
```

`get()` exige exatamente um resultado. Ele pode levantar:

- `Modelo.DoesNotExist`, se nenhum registro for encontrado;
- `Modelo.MultipleObjectsReturned`, se mais de um registro corresponder.

Exemplo real de `all()` e `filter()` em `edu/models/turmas.py:71-77`:

```python
def get_alunos_relacionados(self):
    qs = MatriculaPeriodo.objects.all()
    qs = qs.filter(matriculadiario__diario__turma=self) | qs.filter(turma=self)
    return qs.distinct().order_by(
        'aluno__pessoa_fisica__nome', 'aluno__pk'
    ).select_related('aluno__pessoa_fisica')

def get_alunos_matriculados(self):
    return MatriculaPeriodo.objects.filter(turma=self).order_by(
        'aluno__pessoa_fisica__nome', 'aluno__pk'
    ).select_related('aluno__pessoa_fisica')
```

No primeiro metodo, o operador `|` faz a uniao logica de dois `QuerySets` do
mesmo model. `distinct()` evita repeticao quando um aluno satisfaz as duas
condições.

Exemplo real de `get()` em `edu/models/cursos.py:655-660`:

```python
def save(self, *args, **kwargs):
    curso_campus_antigo = None
    if self.pk:
        curso_campus_antigo = CursoCampus.objects.only(
            'coordenador', 'coordenador_2'
        ).get(pk=self.pk)

    super().save(*args, **kwargs)
```

Como `self.pk` identifica um registro já salvo, o código busca a versao antiga
para comparar coordenadores antes e depois da alteração. O `only()` limita os
campos inicialmente carregados, e o `get()` executa a consulta.

Em uma view, quando a ausencia deve virar resposta HTTP 404, o padrão usual e:

```python
obj = get_object_or_404(CursoCampus, pk=pk)
```

#### 2.4. Restricao com `filter()`, `exclude()` e lookups

`filter()` inclui os registros que atendem as condições. `exclude()` remove os
que atendem as condições informadas:

```python
Aluno.objects.filter(situacao__ativo=True)
Aluno.objects.exclude(matriz__isnull=True)
```

Exemplo real em `edu/models/turmas.py:79-88`:

```python
return (
    MatriculaPeriodo.objects
    .filter(matriculadiario__diario__turma=self)
    .exclude(turma=self)
    .exclude(
        matriculadiario__situacao=MatriculaDiario.SITUACAO_TRANSFERIDO
    )
    .order_by('aluno__pessoa_fisica__nome', 'aluno__pk')
    .select_related('aluno__pessoa_fisica')
    .distinct()
)
```

O separador `__` possui dois usos principais:

1. **atravessar relacionamentos**, como
   `matriculadiario__diario__turma`;
2. **aplicar um lookup**, como `data__gte`, `campo__in` ou
   `campo__isnull`.

Principais lookups:

| Lookup | Significado | Exemplo |
| --- | --- | --- |
| exato | Igualdade | `matricula='2026001'` |
| `__iexact` | Igualdade textual sem diferenciar maiúsculas | `sigla__iexact='cnat'` |
| `__contains` / `__icontains` | Contem trecho, com ou sem distincao de caixa | `nome__icontains='silva'` |
| `__in` | Pertence a uma colecao ou subconsulta | `pk__in=ids` |
| `__isnull` | E nulo ou não e nulo | `matriz__isnull=False` |
| `__gt` / `__gte` | Maior / maior ou igual | `resultado_data__gte=inicio` |
| `__lt` / `__lte` | Menor / menor ou igual | `resultado_data__lte=fim` |
| `__range` | Esta dentro de um intervalo | `data__range=(inicio, fim)` |

Um exemplo real de filtros de intervalo aparece em
`edu/models/professores.py:360-370`: `resultado_data__gte` aplica o limite
inicial, e `resultado_data__lte`, o limite final.

Quando vários argumentos sao passados na mesma chamada de `filter()`, eles sao
combinados por `AND`:

```python
Aluno.objects.filter(
    situacao__ativo=True,
    matriz__isnull=False,
)
```

#### 2.5. Ordenacao e eliminacao de repeticoes

`order_by()` define a ordenacao do resultado:

```python
qs.order_by('nome')       # crescente
qs.order_by('-data')      # decrescente
qs.order_by('curso', 'nome')
```

`distinct()` solicita resultados distintos. Ele e frequente quando joins com
relacoes reversas ou `ManyToManyField` podem repetir o objeto principal.

Exemplo real em `edu/views.py:11341-11349`:

```python
ids_uos = (
    qs.filter(
        aluno__curso_campus__diretoria__setor__uo__isnull=False
    )
    .order_by('aluno__curso_campus__diretoria__setor__uo')
    .values_list(
        'aluno__curso_campus__diretoria__setor__uo',
        flat=True,
    )
    .distinct()
)
```

O resultado representa IDs de unidades organizacionais, ordenados e sem
repeticao. A interação entre `order_by()` e `distinct()` depende do banco e das
colunas selecionadas; por isso, alterações nesse tipo de consulta devem ser
testadas com o SGBD utilizado pelo projeto.

#### 2.6. Projecao com `values()` e `values_list()`

Por padrão, um `QuerySet` devolve instancias do model. As projecoes permitem
pedir apenas determinados valores:

```python
Modelo.objects.values('id', 'nome')
# QuerySet de dicionarios: {'id': 1, 'nome': '...'}

Modelo.objects.values_list('id', 'nome')
# QuerySet de tuplas: (1, '...')

Modelo.objects.values_list('id', flat=True)
# QuerySet de valores simples: 1, 2, 3...
```

No exemplo de `edu/views.py:11345-11348`, `values_list(..., flat=True)` evita
criar objetos completos quando o código precisa apenas das chaves das UOs.

Outro exemplo esta em `edu/models/diplomas.py:160-161`:

```python
def eh_ultima_via(self):
    return self.via == (
        RegistroEmissaoDiploma.objects
        .filter(aluno=self.aluno)
        .filter(cancelado=False)
        .values_list('via', flat=True)
        .order_by('-via')
        .first()
    )
```

A consulta seleciona somente `via`, ordena da maior para a menor e devolve o
primeiro valor. Como foi usado `flat=True`, `first()` retorna o valor do campo,
não uma tupla nem um `RegistroEmissaoDiploma`.

#### 2.7. Condicoes complexas com objetos `Q`

Argumentos normais de `filter()` sao combinados por `AND`. O objeto `Q` permite
representar `OR`, `AND` e `NOT` explicitamente:

```python
from django.db.models import Q

Aluno.objects.filter(
    Q(pessoa_fisica__nome__icontains=termo)
    | Q(matricula__icontains=termo)
)

Aluno.objects.filter(~Q(situacao__ativo=False))
```

Operadores:

- `Q(a) | Q(b)`: `a OR b`;
- `Q(a) & Q(b)`: `a AND b`;
- `~Q(a)`: `NOT a`;
- parenteses devem deixar clara a precedencia das condições.

Exemplo real em `edu/models/professores.py:373-379`: o projeto e considerado
examinado quando o professor ocupa qualquer uma das três posicoes:

```python
projetos_examinados = qs.filter(
    models.Q(examinador_interno__pk=self.vinculo.pessoa.pk)
    | models.Q(examinador_externo__pk=self.vinculo.pessoa.pk)
    | models.Q(terceiro_examinador__pk=self.vinculo.pessoa.pk)
).order_by(ordenar_por)
```

#### 2.8. Alteração direta com `QuerySet.update()`

`update()` gera um `UPDATE` direto e devolve a quantidade de linhas atingidas:

```python
quantidade = Modelo.objects.filter(...).update(campo=novo_valor)
```

Exemplo real em `edu/q_academico.py:703-713`: a importacao atualiza a data de
colacao de grau pela matrícula:

```python
c1 = Aluno.objects.filter(data_colacao_grau__isnull=True).count()

for row in cur.fetchall():
    Aluno.objects.filter(
        matricula=row['matricula']
    ).update(
        data_colacao_grau=row['dt_colacao_grau']
    )

c2 = Aluno.objects.filter(data_colacao_grau__isnull=True).count()
print(f'{c1 - c2} alunos atualizados')
```

`update()` e eficiente porque não precisa carregar e salvar cada instância.
Em contrapartida:

- não chama o metodo `save()` de cada model;
- não chama `full_clean()`;
- não emite os sinais `pre_save` e `post_save`;
- pode ignorar auditoria ou efeitos colaterais implementados em `save()`;
- não atualiza automaticamente objetos que já estejam carregados em memoria.

Um exemplo da importancia dessa diferença esta em
`edu/models/cursos.py:655-677`: o `save()` de `CursoCampus` compara
coordenadores e atualiza grupos e planos de ensino. Uma atualizacao direta com
`CursoCampus.objects.filter(...).update(coordenador=...)` não executaria esse
metodo. Antes de usar `update()`, verifique o model e seus sinais.

#### 2.9. Exclusão por `QuerySet`

Também e possível apagar todos os registros selecionados:

```python
quantidade, detalhes = Modelo.objects.filter(...).delete()
```

Exemplo real em `edu/views.py:10533-10545`: a marcacao de horario e criada ou
excluida conforme o estado do checkbox:

```python
if not checked:
    HorarioTutorPolo.objects.filter(
        tutor=tutor,
        dia_semana=dia_semana_numero,
        horario_funcionamento=horario_funcionamento,
    ).delete()
else:
    HorarioTutorPolo.objects.create(
        tutor=tutor,
        dia_semana=dia_semana_numero,
        horario_funcionamento=horario_funcionamento,
    )
```

Cuidados com `QuerySet.delete()`:

- a exclusão e executada imediatamente;
- o metodo `delete()` sobrescrito em cada instância **não e chamado**;
- os sinais `pre_delete` e `post_delete` ainda podem ser enviados para os
  objetos envolvidos;
- regras `on_delete`, como `CASCADE`, `PROTECT`, `SET_NULL` e `RESTRICT`, podem
  afetar ou impedir a operação;
- o retorno informa a quantidade total removida e sua distribuicao por model.

Se a regra de negócio estiver em `Model.delete()`, a exclusão coletiva pode
ignora-la. Avalie se deve iterar sobre as instancias, mover a regra para outro
servico ou sinal, ou impedir a exclusão em lote.

No fluxo de horarios de `edu/views.py:3787-3800`, o sistema primeiro executa
`QuerySet.delete()` no escopo da sala e depois recria as marcacoes com
`create()`. Uma operação de apagar e recriar deve ser analisada quanto a
transação: uma falha entre as duas etapas não pode deixar os dados em estado
inconsistente.

#### 2.10. Tabela de decisão

Use esta tabela começando pela intenção da operação. A pergunta não é apenas
“qual método existe?”, mas “preciso ler, criar, alterar ou excluir?” e “as
regras do model precisam ser executadas?”. Essa distinção evita usar uma
operação em lote quando uma instância precisa passar por `save()` ou `delete()`.

Alguns cenários comuns:

```python
# Tela de listagem: pode retornar zero ou muitos registros.
alunos = Aluno.objects.filter(curso=curso)

# Tela de detalhe: o aluno precisa existir.
aluno = Aluno.objects.get(pk=pk)

# Importação: criar uma instância e executar o save do model.
matricula = MatriculaPeriodo.objects.create(
    aluno=aluno,
    periodo_letivo=periodo,
)

# Atualização em lote: rápida, mas sem save() e sem sinais por instância.
Aluno.objects.filter(situacao__ativo=False).update(arquivado=True)
```

Se a atualização em lote precisar executar uma regra personalizada, carregue
as instâncias e chame `save()` individualmente, ou mova a regra para um serviço
adequado. A tabela resume esse critério:

| Necessidade | Operacao indicada | Retorno | Passa pelo `save()`/`delete()` do model? |
| --- | --- | --- | --- |
| Iniciar uma consulta | `all()` | `QuerySet` | Não se aplica |
| Buscar vários | `filter()` / `exclude()` | `QuerySet` | Não se aplica |
| Buscar exatamente um | `get()` | Instância | Não se aplica |
| Buscar um ou `None` | `first()` | Instância ou `None` | Não se aplica |
| Criar e obter objeto | `create()` | Instância | Sim, passa por `save()` |
| Obter ou criar | `get_or_create()` | `(instância, created)` | Na criação, passa por `save()` |
| Alterar uma instância | `obj.save()` | `None` | Sim |
| Alterar várias linhas | `qs.update()` | Quantidade | Não passa por `save()` |
| Excluir uma instância | `obj.delete()` | `(quantidade, detalhes)` | Sim |
| Excluir um conjunto | `qs.delete()` | `(quantidade, detalhes)` | Não passa pelo `delete()` sobrescrito |
| Contar | `count()` | Inteiro | Não se aplica |
| Testar existencia | `exists()` | Booleano | Não se aplica |
| Resumir conjunto | `aggregate()` | Dicionario | Não se aplica |

### 3. Performance e problema N+1

Uma consulta correta do ponto de vista funcional ainda pode ser inadequada do
ponto de vista de desempenho. No SUAP, telas administrativas, relatórios e
rotinas academicas podem trabalhar com milhares de alunos, diarios e
matriculas. Por isso, alem de verificar **se o resultado esta correto**, o
desenvolvedor precisa verificar:

- quantas consultas foram executadas;
- quantas linhas e colunas foram carregadas;
- quais relacionamentos foram acessados;
- quanto resultado ficou simultaneamente em memoria;
- se filtros, ordenações e joins possuem apoio adequado do banco;
- se a consulta e executada uma vez ou repetidamente.

O objetivo da otimização não é aplicar um método específico em toda consulta.
Primeiro identifique quais objetos e campos serão usados; depois escolha a
estratégia que reduz consultas e dados desnecessários.

```text
O que a tela precisa?
        ↓
Um objeto relacionado por registro?
        ├─ Sim → select_related()
        └─ Não, vários objetos → prefetch_related()
        ↓
Limitar campos e quantidade de registros
        ↓
Medir as consultas e revisar o plano
```

#### 3.1. O que é o problema N+1

O problema N+1 acontece quando o sistema executa:

1. uma consulta para obter uma lista com `N` objetos;
2. uma consulta adicional para cada objeto ao acessar um relacionamento ainda
   não carregado.

Exemplo conceitual:

```python
alunos = Aluno.objects.all()  # 1 consulta

for aluno in alunos:
    print(aluno.pessoa_fisica.nome)  # pode executar N consultas
```

Com 100 alunos, o fluxo pode gerar 101 consultas. Se, dentro do mesmo loop, o
código acessar `aluno.curso_campus.diretoria.setor.uo`, o número pode crescer
ainda mais, pois existe uma cadeia de chaves estrangeiras.

O problema não esta no `for` isoladamente. Ele surge da combinação entre:

- iterar por vários objetos;
- acessar dentro da iteracao uma relação não carregada;
- repetir a consulta relacionada para cada item.

#### 3.2. Exemplo real do EDU com risco de N+1

Em `edu/views.py:6043-6054`, a API monta um dicionario para cada aluno:

```python
def aluno_to_dict(aluno):
    return dict(
        nome=aluno.get_nome_social_composto(),
        email=aluno.pessoa_fisica.email_secundario,
        matricula=aluno.matricula,
        curso=str(aluno.curso_campus),
        campus=str(aluno.curso_campus.diretoria.setor.uo.sigla),
    )

campus_sigla = request.GET.get('campus', '')
alunos_qs = Aluno.objects.filter(
    situacao__ativo=True,
    curso_campus__diretoria__setor__uo__sigla__iexact=campus_sigla,
)[0:20]
alunos = [aluno_to_dict(a) for a in alunos_qs]
```

A consulta possui joins para aplicar o filtro por campus, mas isso, por si so,
não garante que o Django preencherá o cache dos objetos relacionados. Durante
a compreensao da última linha, os acessos abaixo podem gerar consultas extras:

- `aluno.pessoa_fisica`;
- `aluno.curso_campus`;
- `aluno.curso_campus.diretoria`;
- `diretoria.setor`;
- `setor.uo`.

Uma versao a ser avaliada para esse fluxo seria:

```python
alunos_qs = (
    Aluno.objects
    .filter(
        situacao__ativo=True,
        curso_campus__diretoria__setor__uo__sigla__iexact=campus_sigla,
    )
    .select_related(
        'pessoa_fisica',
        'curso_campus',
        'curso_campus__diretoria__setor__uo',
    )[:20]
)
```

Essa e uma proposta didatica baseada nos campos acessados; antes de alterar o
código real, a equipe deve medir as consultas e verificar o comportamento dos
métodos chamados, especialmente `get_nome_social_composto()` e `__str__()`.

#### 3.3. `select_related()`: chaves estrangeiras e OneToOne

`select_related()` instrui o Django a buscar o objeto principal e determinadas
relacoes de valor único na mesma consulta SQL, normalmente com `JOIN`.

Usar principalmente para:

- `ForeignKey`;
- `OneToOneField`;
- cadeias dessas relacoes.

Exemplo:

```python
alunos = Aluno.objects.select_related(
    'pessoa_fisica',
    'curso_campus__diretoria__setor__uo',
)

for aluno in alunos:
    print(aluno.pessoa_fisica.nome)
    print(aluno.curso_campus.diretoria.setor.uo.sigla)
```

O banco devolve uma linha mais larga, contendo também as colunas das relacoes,
e o Django monta os objetos relacionados sem uma nova consulta para cada aluno.

`select_related()` não e indicado para relacoes que podem possuir vários
objetos, como `ManyToManyField` e relacionamentos reversos de um-para-muitos.

#### 3.4. Exemplo real: autocomplete de alunos

Em `edu/managers.py:630-639`, o `AlunoManager` prepara o `QuerySet` usado no
autocomplete:

```python
class AlunoManager(models.Manager):
    def autocomplete(self):
        qs = super().get_queryset()
        qs = qs.select_related(
            'pessoa_fisica',
            'pessoa_fisica__pessoa_ptr',
            'curso_campus',
            'curso_campus__diretoria__setor__uo',
        )
        qs = qs.only(
            'foto',
            'matricula',
            'pessoa_fisica__pessoa_ptr__search_fields_optimized',
            'pessoa_fisica__nome',
            'pessoa_fisica__nome_registro',
            'pessoa_fisica__nome_social',
            'curso_campus__codigo',
            'curso_campus__descricao',
            'curso_campus__diretoria__setor__uo__nome',
        )
        return qs
```

O trecho combina duas estrategias:

1. `select_related()` evita consultas extras ao acessar pessoa, curso e campus;
2. `only()` reduz as colunas inicialmente carregadas para as usadas pelo
   autocomplete.

O resultado continua sendo um `QuerySet`, portanto filtros e limites ainda
podem ser acrescentados antes da avaliação.

#### 3.5. `prefetch_related()`: relacoes de vários objetos

`prefetch_related()` e indicado principalmente para:

- `ManyToManyField`;
- relacoes reversas de `ForeignKey`;
- relacoes genericas ou colecoes que não podem ser resolvidas por um único
  `JOIN` de valor único.

Em vez de produzir uma única consulta larga, ele normalmente:

1. consulta os objetos principais;
2. consulta os objetos relacionados;
3. associa os resultados em memoria.

Exemplo conceitual:

```python
alunos = Aluno.objects.prefetch_related('inscricao_set')

for aluno in alunos:
    for inscricao in aluno.inscricao_set.all():
        print(inscricao)
```

Sem o prefetch, o acesso ao conjunto de inscricoes pode executar uma consulta
por aluno. Com o prefetch, o padrão tende a usar uma consulta para alunos e
outra para as inscricoes.

Na versao analisada, não foi localizado uso de `prefetch_related()` dentro de
`edu/`. Entretanto, existe um exemplo real no modulo de Assistencia Estudantil,
que consulta o model `Aluno` do EDU. Em `ae/views.py:3524-3537`:

```python
pagina = 100 * (page - 1)

alunos = (
    Aluno.objects
    .filter(participacao__isnull=False)
    .prefetch_related('inscricao_set')
    .only('id', 'matricula', 'curso_campus', 'pessoa_fisica__nome')
    .distinct()
)
```

Esse exemplo e real do SUAP e demonstra o prefetch de uma relação reversa. O
fato de o EDU ainda não utilizar essa operação diretamente não significa que
ela deva ser inserida indiscriminadamente: primeiro deve existir um acesso
repetido a uma relação multipla que justifique a carga antecipada.

#### 3.6. Como escolher entre `select_related()` e `prefetch_related()`

| Situação | Estratégia preferencial | Motivo |
| --- | --- | --- |
| `ForeignKey` ou `OneToOneField` usado em cada objeto | `select_related()` | Usa `JOIN` e traz a relação na consulta principal |
| Relação reversa ou `ManyToManyField` | `prefetch_related()` | Executa consultas separadas e associa os resultados em memória |
| Apenas alguns campos são necessários | `values()` ou `values_list()` | Evita carregar instâncias completas |
| Muitos resultados serão exibidos | Fatiamento ou paginação | Reduz a quantidade de linhas retornadas |

| Relação acessada | Estratégia usual | Consultas |
| --- | --- | --- |
| `ForeignKey` | `select_related()` | Normalmente uma com `JOIN` |
| `OneToOneField` | `select_related()` | Normalmente uma com `JOIN` |
| `ManyToManyField` | `prefetch_related()` | Normalmente duas ou mais |
| `ForeignKey` reversa | `prefetch_related()` | Normalmente duas ou mais |
| Cadeia de FKs | `select_related('a__b__c')` | Normalmente uma consulta larga |
| FK seguida de conjunto multiplo | combinar as duas estrategias | Depende da cadeia |

Carregar tudo preventivamente também pode piorar a desempenho. Um
`select_related()` muito profundo aumenta a largura da linha e o custo dos
joins; um `prefetch_related()` desnecessario carrega colecoes que talvez nunca
sejam usadas. A escolha deve acompanhar o caminho realmente acessado pela view,
template, serializer ou metodo.

#### 3.7. Limites e paginação

Uma consulta otimizada ainda pode ser cara se devolver registros demais.

Exemplos reais:

- `edu/views.py:6052-6054` limita a API a 20 alunos com `[0:20]`;
- `edu/views.py:11245` limita uma exibicao estatistica a 25 alunos;
- `edu/views.py:11266` limita uma lista de indicador a 100 alunos;
- `edu/admin.py:1601-1610` define `list_per_page = 15` para o admin de alunos.

O fatiamento sem passo normalmente e convertido em `LIMIT` e `OFFSET`:

```python
pagina = Aluno.objects.order_by('pk')[0:100]
```

Para navegação real entre paginas, prefira o mecanismo de paginacao do Django
ou o componente já adotado pelo SUAP, pois ele também organiza pagina atual,
total e links de navegação.

Em conjuntos muito grandes, offsets profundos podem ficar caros. Nesses casos,
vale avaliar paginacao por cursor ou pela última chave processada, conforme os
recursos e padrões disponiveis no projeto.

#### 3.8. Armadilhas frequentes

As armadilhas aparecem quando a consulta parece correta, mas carrega dados
demais ou executa SQL repetidamente. Compare o problema e a correção:

#### 1. Carregar relações que não serão usadas

```python
# Problema: traz a relação sem que a tela precise dela.
alunos = Aluno.objects.select_related('pessoa_fisica')

# Correção: carregue somente o que será exibido.
alunos = Aluno.objects.all()
```

#### 2. Consultar relacionamentos dentro de loops

```python
# Problema: uma consulta para cada aluno (N+1).
for aluno in alunos:
    print(aluno.pessoa_fisica.nome)

# Correção: uma consulta com select_related().
alunos = Aluno.objects.select_related('pessoa_fisica')
for aluno in alunos:
    print(aluno.pessoa_fisica.nome)
```

#### 3. Confundir filtro com carregamento da relação

```python
# O filtro encontra alunos com matrícula, mas não preenche
# automaticamente o cache de matriculas do objeto.
alunos = Aluno.objects.filter(matriculaperiodo__isnull=False)

# Se a tela também percorre as matrículas, use prefetch_related().
alunos = Aluno.objects.filter(
    matriculaperiodo__isnull=False,
).prefetch_related('matriculaperiodo_set')
```

#### 4. Remover limites em bases grandes

```python
# Problema: carrega todos os registros para uma tela paginada.
alunos = list(Aluno.objects.order_by('pk'))

# Correção: limite a consulta à página ou use a paginação do projeto.
alunos = Aluno.objects.order_by('pk')[:50]
```

#### 5. Medir apenas a quantidade de consultas

Uma consulta pode ser numericamente pequena e ainda trazer milhares de linhas
ou colunas desnecessárias. Verifique também volume, memória e campos usados:

```python
# Melhor: seleciona apenas os campos necessários para uma lista.
nomes = Aluno.objects.values('pk', 'pessoa_fisica__nome')[:100]
```

<a id="etapa-6"></a>

## Etapa 6 - Integração com forms, views e templates

O model raramente funciona isolado. No SUAP, ele fornece dados e regras para
forms, views, templates, admin e relatórios. Cada camada tem uma responsabilidade
específica, e o fluxo fica mais seguro quando uma camada não assume o trabalho
das outras.

```text
URL ou ação do usuário
          ↓
View recebe a requisição
          ↓
Form valida os dados ─────┐
          ↓               │
Manager / QuerySet        │
          ↓               │
Model aplica regras       │
          ↓               │
Banco de dados            │
          ↓               │
View prepara o contexto ←─┘
          ↓
Template, admin ou relatório
```

| Camada | Responsabilidade principal | Evite colocar nela |
| --- | --- | --- |
| Model | Estrutura, relações e regras reutilizáveis | Controle da requisição HTTP |
| Form | Entrada, conversão e validação da tela | Consultas complexas e permissões gerais |
| View | Orquestração da requisição e da resposta | Repetição de regras do model |
| Template | Apresentação dos dados | Consultas e regras de negócio |
| Admin | Operações administrativas e configurações de listagem | Bypasses de segurança |
| Relatório | Organização e exportação dos dados | Reimplementar regras da entidade |

### 1. Models x Forms

Um `ModelFormPlus` usa a definição do model para montar parte do formulário,
mas continua sendo uma camada própria. O model representa a entidade; o form
decide como os dados serão recebidos, convertidos e validados naquela tela.

#### 1.1. Conceitos

`ModelFormPlus.Meta.model` liga o formulário ao model que ele edita. A partir
dessa ligação, o Django pode gerar campos e widgets com base nos campos do
model. Por exemplo, `CharField` vira um campo de texto e `ForeignKey` vira uma
escolha de objetos.

`Meta.fields` define explicitamente o que a tela pode alterar:

```python
class AlunoForm(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = ['matricula', 'pessoa_fisica']
```

`instance` indica o registro em edição; sem ele, `form.save()` cria outro
objeto. `commit=False` cria a instância em memória para que um valor seja
completado antes da gravação; depois, `save_m2m()` salva relações muitas para
muitas:

```python
obj = form.save(commit=False)
obj.atualizado_por = request.user
obj.save()
form.save_m2m()
```

O `ModelForm` executa validações do model e também pode ter regras próprias.
`model.clean()` protege a entidade em diferentes caminhos de entrada; já
`form.clean()` trata a combinação de campos daquela tela. Opções como
`blank`, `choices`, `verbose_name` e `help_text` influenciam validação,
opções exibidas e textos do formulário. Usar `fields = '__all__'` expõe todos
os campos atuais e pode liberar alterações que a tela não deveria oferecer.

#### 1.2. Exemplo real recomendado

Reutilizar `PlanoEnsino` e `AlterarCoordenadorPlanoEnsinoForm`:

- model: `edu/models/plano_ensino.py:6-34`;
- form: `edu/forms.py:14168-14171`;
- view: `edu/views.py:14730-14737`.

Um fluxo integrado pode ser lido assim (trecho reduzido para destacar a
ligação entre as camadas):

```python
# Model: representa o registro persistido.
class PlanoEnsino(models.Model):
    coordenador = models.ForeignKey(
        'comum.Funcionario',
        null=True,
        on_delete=models.SET_NULL,
    )


# Form: escolhe o campo editável e valida a entrada da tela.
class AlterarCoordenadorPlanoEnsinoForm(forms.ModelForm):
    class Meta:
        model = PlanoEnsino
        fields = ['coordenador']


# View: busca a instância, recebe o POST e redireciona depois de salvar.
def alterar_coordenador(request, pk):
    plano = get_object_or_404(PlanoEnsino, pk=pk)
    form = AlterarCoordenadorPlanoEnsinoForm(
        request.POST or None,
        instance=plano,
    )
    if form.is_valid():
        form.save()  # atualiza o plano indicado por instance
        return redirect('plano_ensino', pk=plano.pk)
    return render(request, 'alterar_coordenador.html', {'form': form})
```

O model define o dado, o form limita o campo que será editado e a view
coordena a requisição. O `instance=plano` é o que transforma o formulário em
edição; sem ele, o mesmo `form.save()` criaria um novo plano.

Perguntas de revisão:

1. De onde vem o tipo do campo do formulário?
2. Como `instance` identifica o registro?
3. Quais regras pertencem ao model?
4. O que `form.save()` chama?
5. O que aconteceria sem `instance`?

### 2. Models x Views x Templates

O fluxo de leitura começa na view, passa pelo manager e pelo model e termina no
template. O template recebe valores já preparados e não deve descobrir regras
de negócio por conta própria.

#### 2.1. Conceitos

`get_object_or_404()` transforma a ausência do registro em uma resposta HTTP
404, adequada para uma tela de detalhe:

```python
turma = get_object_or_404(Turma.locals, pk=pk)
```

O manager escolhido define o escopo da consulta. A permissão da view responde
se o usuário pode acessar a operação; o queryset decide quais registros entram
no resultado. São camadas diferentes:

```python
@permission_required('edu.view_turma')
def detalhes(request, pk):
    turma = get_object_or_404(Turma.locals, pk=pk)
```

A view também coordena consulta, alteração e exclusão, enquanto o model mantém
regras da entidade. Antes de renderizar uma lista, `select_related()` pode
carregar relações de valor único que o template exibirá:

```python
turmas = Turma.locals.select_related('ano_letivo').all()
return render(request, 'turmas.html', {'turmas': turmas})
```

O template recebe uma instância ou um queryset já preparado e apresenta os
dados. Ele não deve abrir consultas complexas nem implementar regras de
negócio.

Em formulários, o padrão POST/Redirect/GET separa o envio da confirmação:

```text
GET  → exibe o formulário
POST → valida e salva
302  → redireciona
GET  → mostra a tela atualizada
```

Use `DoesNotExist` quando a busca exigir tratamento específico, evite capturar
`MultipleObjectsReturned` como se fosse ausência e trate `IntegrityError` para
restrições de banco. Quando várias alterações precisam ser concluídas juntas,
use uma transação:

```python
with transaction.atomic():
    plano.save()
    Diario.objects.filter(pk=plano.diario_id).update(atualizado=True)
```

#### 2.2. Exemplo real recomendado

Seguir a tela de turma:

```text
edu/urls.py
-> edu/views.py:turma
-> Turma.objects ou Turma.locals
-> metodos e relacionamentos do model
-> edu/templates/turma.html
```

Cada ponto representa uma responsabilidade diferente:

- `edu/urls.py` reconhece o endereço e encaminha a requisição para uma view;
- `edu/views.py:turma` coordena a busca, aplica permissões e prepara o contexto;
- `Turma.objects` ou `Turma.locals` define o conjunto de dados consultado;
- os métodos e relacionamentos do model fornecem os dados derivados;
- `edu/templates/turma.html` apresenta o contexto em HTML, sem montar regras
  de negócio.

Ao seguir esse caminho, procure a decisão em cada camada: quem autoriza, quem
filtra, quem calcula e quem apenas exibe. Assim, uma alteração na tela pode
ser feita no arquivo correto sem duplicar a regra.

Ao analisar o fluxo, observe:

- URL e decoradores;
- selecao do manager;
- `get_object_or_404()`;
- métodos chamados no model;
- variáveis entregues ao template;
- consultas potencialmente executadas durante a renderizacao.

### 3. Models x Admin x Relatórios

O admin e os relatórios também consomem models, mas possuem objetivos diferentes:
o admin oferece operações administrativas configuradas pela classe `ModelAdmin`,
enquanto o relatório organiza dados para leitura, impressão ou exportação.

```text
Model e QuerySet
       ├─ Admin → list_display, filtros, busca e ações
       └─ Relatório → consulta, agrupamento, template e arquivo final
```

No admin, a configuração organiza a operação para usuários administrativos:

```python
@admin.register(AvisoTurma)
class AvisoTurmaAdmin(ModelAdminPlus):
    list_display = ('titulo', 'turma', 'autor', 'cadastrado_em')
    list_filter = ('turma',)
    search_fields = ('titulo', 'mensagem')
```

Um relatório, por outro lado, prepara uma consulta para leitura ou exportação:

```python
avisos = (
    AvisoTurma.objects
    .select_related('turma', 'autor')
    .filter(turma__ano_letivo=ano)
    .values('titulo', 'turma__descricao', 'autor__username')
    .order_by('-cadastrado_em')
)
```

O admin configura a interface e as ações disponíveis; o relatório define
campos, filtros, agrupamentos e formato final. Ambos reutilizam o model, mas
não devem substituir as regras de autorização ou duplicar regras da entidade.

Ao investigar uma tela administrativa ou um relatório, confira:

1. qual model é a fonte dos dados;
2. qual manager ou `QuerySet` inicia a consulta;
3. quais filtros e relacionamentos são aplicados;
4. se há limites, paginação ou otimizações;
5. quais permissões controlam a operação;
6. se o resultado é exibido em HTML, PDF, planilha ou outro formato.

<a id="etapa-7"></a>

## Etapa 7 - Migrations e comandos essenciais

Migrations são o mecanismo que registra e aplica a evolução da estrutura do
banco. Quando um model muda, a migration transforma essa mudança em operações
reproduzíveis, revisáveis e ordenadas.

```text
Alteração no model
        ↓
makemigrations
        ↓
Arquivo de migration
        ↓
Revisão do código e do SQL
        ↓
migrate
        ↓
Schema atualizado
        ↓
Testes e validação da aplicação
```

### 1. Conceito de migration

Uma migration é código versionado que descreve a evolução do schema. Ela não é
apenas um arquivo gerado para satisfazer o Django: registra dependências,
operações e, quando necessário, transformações dos dados.

Existem dois tipos de mudança:

| Tipo | O que altera | Exemplos |
| --- | --- | --- |
| Schema migration | Estrutura do banco | Criar model, adicionar campo ou índice |
| Data migration | Dados já existentes | Preencher um novo campo ou converter valores |

Pontos importantes:

- dependencias entre migrations;
- operações `CreateModel`, `AddField`, `AlterField`, `RemoveField` e
  `AddConstraint`;
- schema migration e data migration;
- `RunPython` e função reversa;
- models historicos obtidos por `apps.get_model()`;
- migrations irreversiveis;
- impacto de defaults e colunas `NOT NULL` em tabelas grandes;
- revisão do SQL antes de produção;
- conflitos de numeracao em branches.

### 2. Comandos principais

Executar apenas em ambiente de desenvolvimento ou homologação apropriado:

```bash
python manage.py check
python manage.py makemigrations edu --name nome_da_alteracao
python manage.py showmigrations edu
python manage.py sqlmigrate edu NUMERO_DA_MIGRATION
python manage.py migrate edu
python manage.py migrate --plan
```

Para consultas de aprendizagem:

```bash
python manage.py shell
```

Para testes focados:

```bash
python manage.py test edu
```

### 3. Para que serve cada comando

| Comando | Finalidade |
| --- | --- |
| `check` | Verificar problemas de configuração e dos models |
| `makemigrations` | Comparar os models com o estado registrado e gerar migration |
| `showmigrations` | Listar migrations e indicar quais já foram aplicadas |
| `sqlmigrate` | Exibir o SQL produzido por uma migration |
| `migrate --plan` | Mostrar o plano de aplicação sem executar as mudanças |
| `migrate` | Aplicar as migrations pendentes |
| `shell` | Inspecionar models e dados em um ambiente autorizado |
| `test` | Executar os testes do aplicativo |

Uma sequência de revisão pode ser representada assim:

```text
check
  ↓
makemigrations
  ↓
showmigrations + leitura do arquivo
  ↓
sqlmigrate / migrate --plan
  ↓
migrate
  ↓
test e verificação funcional
```

### 4. Reversão e cuidados

Antes de aplicar uma migration, verifique as dependências, o impacto sobre
colunas obrigatórias e o tamanho das tabelas. Para retornar a um estado anterior,
identifique a migration de destino e avalie se a operação é reversível:

```bash
python manage.py showmigrations edu
python manage.py migrate edu NUMERO_ANTERIOR
```

Uma reversão pode perder dados quando a migration remove colunas, transforma
valores ou executa uma operação sem função reversa. Em produção, a decisão deve
considerar backup, janela de manutenção e plano de recuperação.

Orientacoes de segurança:

- não gerar migration sem revisar arquivos alterados;
- não editar migrations já aplicadas em ambientes compartilhados sem estratégia;
- não executar `migrate` em produção sem autorização e planejamento;
- não usar shell de produção para experimentar escrita;
- preparar backup e plano de rollback para alterações de risco;

<a id="etapa-8"></a>

## Etapa 8 - Práticas integradas

As práticas consolidam a leitura de models, o uso do ORM e a integração com as
demais camadas do módulo EDU.

### Como realizar as práticas

Cada prática parte de um objetivo concreto e termina com uma verificação. Leia
o contexto, localize os arquivos indicados, execute ou simule cada etapa e
registre o que foi observado. O foco é compreender o caminho dos dados e as
decisões do código, não apenas copiar os exemplos.

| Prática | Objetivo | Resultado esperado |
| --- | --- | --- |
| 1. Ler um model existente | Reconstruir o caminho de uma entidade real | Mapa dos arquivos e das regras de `PlanoEnsino` |
| 2. Criar um model integrado | Criar uma funcionalidade simples de ponta a ponta | Model, migration, form, view, URL e template funcionando juntos |
| 3. Alterar um model com segurança | Avaliar impacto e evitar regressões | Mudança revisada, validada e protegida por testes |
| 4. Consultar com o ORM | Compor consultas eficientes e medir seus efeitos | QuerySets corretos, limitados e sem N+1 desnecessário |

### Checklist comum

Antes de concluir qualquer prática, confirme:

- o model e a classe-base foram identificados;
- os campos e relacionamentos envolvidos foram compreendidos;
- os arquivos dependentes foram localizados;
- a alteração ou consulta foi executada em ambiente apropriado;
- validações, permissões e limites foram verificados;
- o resultado foi testado e pode ser explicado com suas próprias palavras.

### Prática 1 - Ler um model existente de ponta a ponta

**Model estudado:** `PlanoEnsino`  
**Duração sugerida:** 35 a 45 minutos  
**Objetivo:** aprender um metodo de leitura que possa ser repetido em qualquer
model do SUAP, partindo da declaracao da entidade até os pontos em que ela e
criada, editada e apresentada.

#### 1. Mapa inicial dos arquivos

Antes de interpretar o código, localizar as partes do fluxo:

| Papel | Arquivo e linhas |
| --- | --- |
| Model | `edu/models/plano_ensino.py:6-57` |
| Importacao pelo pacote de models | `edu/models/__init__.py:10` |
| Criação automatica | `edu/models/diarios.py:1198-1200` |
| Form principal | `edu/forms.py:14175-14199` |
| Form do coordenador | `edu/forms.py:14168-14171` |
| Configuracao do admin | `edu/admin.py:4357-4364` |
| URLs | `edu/urls.py:529-531` |
| Views | `edu/views.py:14714-14752` |
| Template PDF | `edu/templates/plano_ensino_pdf.html:1-76` |
| Link na tela do diario | `edu/templates/diario.html:64-70` |

Esse levantamento evita ler o model isoladamente. A pergunta orientadora e:
**quem cria, consulta, altera e apresenta esta entidade?**

#### 2. Identificar a classe e sua herança

Abrir `edu/models/plano_ensino.py:6`:

```python
class PlanoEnsino(LogModel):
```

A classe representa uma entidade persistida. Como herda de `LogModel`, recebe:

- os recursos de `ModelPlus` e do ORM do Django;
- uma chave primaria `id` criada implicitamente;
- auditoria de cadastro, edicao e exclusão quando o log do EDU esta ativo;
- os managers herdados, entre eles `objects`.

`PlanoEnsino` não precisa ser importado diretamente do arquivo. A linha 10 de
`edu/models/__init__.py` permite o uso habitual:

```python
from edu.models import PlanoEnsino
```

#### 3. Ler os campos por grupos

Em vez de memorizar cada declaracao, classificar os campos de
`edu/models/plano_ensino.py:7-18`:

| Grupo | Campos | Leitura |
| --- | --- | --- |
| Relacionamentos | `diario`, `coordenador_curso` | Ligam o plano a `Diario` e `Funcionario`; no banco sao armazenadas chaves estrangeiras. |
| Conteúdo textual | `ementa`, `justificativa`, `objetivo_geral`, `objetivos_especificos`, `conteudo_programatico`, `metodologia`, `informacoes_adicionais` | Usam `TextField`; aceitam texto vazio no form e armazenam `''` por padrão. |
| Estado do fluxo | `data_submissao`, `data_aprovacao`, `data_homologacao` | Datas opcionais que indicam em qual etapa o plano se encontra. |

Exemplo comentado:

```python
# Cada plano pertence a um diario. A coluna no banco sera diario_id.
# CASCADE remove o plano se o diario for excluido.
diario = models.ForeignKeyPlus(
    'edu.Diario',
    on_delete=models.CASCADE,
)

# blank=True permite texto vazio no formulario; default='' fornece o valor
# usado quando nenhuma ementa for informada.
ementa = models.TextField(
    'Ementa',
    default='',
    blank=True,
)

# null=True permite NULL no banco enquanto a submissao nao ocorreu.
data_submissao = models.DateFieldPlus(
    'Data da Submissao',
    null=True,
)
```

Pontos para observar:

1. `diario_id` acessa diretamente a chave estrangeira sem carregar o diario;
2. `plano.diario` devolve o objeto relacionado;
3. `diario.planoensino_set` e o relacionamento reverso criado pelo Django;
4. `coordenador_curso` não informa `on_delete` e, nesta versao, recebe o
   `CASCADE` padrão de `ForeignKeyPlus`;
5. as três datas não sao apenas informações: juntas representam o estado do
   processo de submissao, aprovacao e homologação.

#### 4. Interpretar `Meta`

Em `edu/models/plano_ensino.py:20-23`:

```python
class Meta:
    verbose_name = 'Plano de Ensino'
    verbose_name_plural = 'Planos de Ensino'
    ordering = ('id',)
```

- `verbose_name` e `verbose_name_plural` definem nomes legiveis para as
  interfaces;
- `ordering` faz consultas sem `order_by()` usarem `id` em ordem crescente;
- como não existe `db_table`, o Django adota por convencao a tabela
  `edu_planoensino`.

#### 5. Ler os métodos da classe

Percorrer `edu/models/plano_ensino.py:25-57` e separar os métodos por papel:

| Metodo | Papel no model |
| --- | --- |
| `__str__()` | Produz a representacao humana usando o diario. |
| `get_absolute_url()` | Informa a URL principal do objeto, neste caso o PDF. |
| `save()` | Preenche o coordenador antes de persistir. |
| `notificar_devolucao()` | Monta e envia a notificacao aos professores. |
| `devolver_para_professor()` | Reabre a etapa de submissao e salva. |
| `devolver_para_coordenador()` | Remove a aprovacao e salva. |
| `can_change()` | Verifica se o plano ainda pode ser alterado pelo professor. |

Leitura linha a linha do `save()`, em `edu/models/plano_ensino.py:31-34`:

```python
def save(self, *args, **kwargs):
    # Somente define um coordenador quando o campo ainda esta vazio.
    if self.coordenador_curso is None:
        # Percorre Diario -> Turma -> CursoCampus para obter o coordenador.
        self.coordenador_curso = (
            self.diario.turma.curso_campus.coordenador
        )

    # Executa a persistencia do Django e preserva argumentos como
    # update_fields, force_insert e using.
    super().save(*args, **kwargs)
```

Pergunta para a turma: **o que aconteceria se `super().save()` fosse
removido?** O objeto seria preparado em memoria, mas esse metodo não executaria
a insercao ou atualizacao no banco.

#### 6. Descobrir onde o objeto nasce

Em `edu/models/diarios.py:1198-1200`, o próprio `Diario.save()` cria o plano
quando o curso utiliza esse recurso e ainda não existe plano relacionado:

```python
super().save(*args, **kwargs)
if (
    self.turma.curso_campus.plano_ensino
    and not self.planoensino_set.exists()
):
    PlanoEnsino.objects.create(
        diario=self,
        coordenador_curso=self.turma.curso_campus.coordenador,
        ementa=self.componente_curricular.ementa or '',
    )
```

Leitura do fluxo:

1. o diario e salvo primeiro;
2. o curso informa se utiliza plano de ensino;
3. o relacionamento reverso verifica se já existe um plano;
4. `objects.create()` instância e salva `PlanoEnsino`;
5. o `PlanoEnsino.save()` também participa dessa gravação.

Isso mostra por que a leitura de um model deve incluir pesquisas por seu nome e
pelos relacionamentos reversos. Nem todo objeto e criado diretamente por uma
view.

#### 7. Seguir os fluxos até as outras camadas

##### Fluxo A - Edicao principal pelo admin

Este caminho mostra a edição completa feita por um usuário administrativo. Ele
é útil para identificar como o admin, o form e o `save()` do model trabalham
juntos antes da gravação.

```text
PlanoEnsinoAdmin
-> usa PlanoEnsinoForm
-> valida os campos
-> chama form.save()
-> executa PlanoEnsino.save()
-> grava no banco e, quando habilitada, gera auditoria do LogModel
```

- `PlanoEnsinoAdmin.form`, em `edu/admin.py:4357-4364`, aponta para o form;
- `PlanoEnsinoForm`, em `edu/forms.py:14175-14199`, define os campos, torna
  parte deles obrigatoria e preenche a ementa a partir do componente;
- `blank=True` no model permite que o form original aceite vazio, mas o form
  pode aplicar uma regra mais restritiva naquela interface.

##### Fluxo B - Alteração do coordenador

Este caminho representa uma tela especializada que altera apenas um campo de
um objeto existente. Ele ajuda a perceber por que o `ModelFormPlus` usa
`instance` e por que a view continua controlando o escopo do objeto.

```text
URL -> view -> ModelFormPlus -> model -> banco
```

1. `edu/urls.py:530` recebe o `pk`;
2. `edu/views.py:14730-14737` busca o plano dentro da unidade do usuário;
3. `AlterarCoordenadorPlanoEnsinoForm`, em `edu/forms.py:14168-14171`, expoe
   somente `coordenador_curso`;
4. `form.is_valid()` valida a entrada;
5. `form.save()` atualiza a instância e passa por `PlanoEnsino.save()`.

##### Fluxo C - Geracao do PDF

Este caminho acompanha a leitura de um objeto até a geração do documento. Ele
serve para localizar onde a view busca o model, onde o template monta o
conteúdo e onde o decorator transforma a resposta em PDF.

```text
/edu/plano_ensino_pdf/<pk>/
-> plano_ensino_pdf()
-> busca PlanoEnsino
-> plano_ensino_pdf.html
-> documento PDF
```

- URL em `edu/urls.py:529`;
- view e decoradores em `edu/views.py:14714-14725`;
- template em `edu/templates/plano_ensino_pdf.html:1-76`;
- link de acesso em `edu/templates/diario.html:64-70`.

O template percorre novamente os relacionamentos do model, por exemplo
`obj.diario.turma.curso_campus`, e usa os relacionamentos reversos das
referências bibliograficas nas linhas `66-72`.

##### Fluxo D - Devolucao

A URL `edu/urls.py:531` chama a view `devolver_plano_ensino`, em
`edu/views.py:14742-14752`. A view verifica o destino e delega a mudanca aos
métodos do model:

```python
plano.devolver_para_professor(request.user, justificativa)
# ou
plano.devolver_para_coordenador(request.user, justificativa)
```

O model altera a data adequada, envia a notificacao e salva. Esse fluxo e um
exemplo de regra reutilizavel mantida no model, em vez de repetida na view.

#### 8. Inspecao segura no shell

Executar apenas consultas de leitura em uma base de desenvolvimento:

```python
from edu.models import PlanoEnsino

qs = PlanoEnsino.objects.select_related(
    'diario__turma__curso_campus',
    'coordenador_curso',
)

# Visualiza o SQL que sera produzido sem alterar dados.
print(qs.query)

plano = qs.first()

if plano:
    print(plano.pk)
    print(plano)                         # chama __str__()
    print(plano.diario_id)               # chave estrangeira
    print(plano.diario)                  # objeto relacionado
    print(plano.diario.turma)
    print(plano.diario.turma.curso_campus)
    print(plano.get_absolute_url())
    print(plano._meta.db_table)
    print(plano._meta.ordering)
```

Para inspecionar campos sem escrever no banco:

```python
for campo in PlanoEnsino._meta.fields:
    print(
        campo.name,
        campo.get_internal_type(),
        campo.null,
        campo.blank,
    )
```

Não chamar `save()`, `delete()`, `update()` ou `create()` durante essa parte da
atividade.

#### 9. Tarefa do participante

Sem consultar o resumo abaixo, responder:

1. Qual e a tabela e qual e a chave primaria do model?
2. Quais campos representam relacionamentos?
3. O que acontece com o plano quando seu diario e excluido?
4. Como o coordenador e preenchido quando não foi informado?
5. Qual metodo devolve a URL principal do objeto?
6. Onde ocorre a validação da edicao principal?
7. Onde o PDF recebe o objeto que sera exibido?
8. Por que `planoensino_set` existe se não foi declarado em `Diario`?
9. Qual regra esta no model e qual regra permanece na view?
10. Que acessos poderiam produzir consultas adicionais sem `select_related()`?

#### 10. Respostas esperadas e fechamento

1. Tabela `edu_planoensino`; chave primaria implicita `id`.
2. `diario` e `coordenador_curso`.
3. O `CASCADE` de `diario` remove também o plano.
4. `PlanoEnsino.save()` percorre diario, turma e curso para obter o
   coordenador.
5. `get_absolute_url()`.
6. No `PlanoEnsinoForm`, complementada pelas regras do model e do campo.
7. A view busca `obj`; `@rtr()` o entrega ao template.
8. E o acesso reverso criado pelo Django para a `ForeignKey` sem
   `related_name`.
9. O model executa a devolucao e notificacao; a view coordena requisição,
   perfil, destino e resposta HTTP.
10. `diario`, `turma`, `curso_campus` e `coordenador_curso` podem exigir
    consultas relacionadas.

Ao concluir a prática, o participante deve conseguir repetir este percurso:

```text
localizar -> classificar campos -> ler Meta -> ler metodos
-> descobrir criacao e alteracao -> seguir forms/views/templates
-> confirmar o comportamento com consultas de leitura
```

### Prática 2 - Criar um model simples integrado ao EDU

**Funcionalidade:** avisos vinculados a uma turma  
**Model:** `AvisoTurma`  
**Duração sugerida:** 45 a 55 minutos  
**Objetivo:** criar uma entidade simples e acompanhar sua integração com banco,
permissao, form, view, URL e template.

Ao final, a tela de turma exibira seus avisos e usuários autorizados poderao
adicionar um novo aviso.

#### 1. Desenhar a entidade antes de programar

Antes de escrever Python, transforme cada requisito em uma decisão de modelo:
identifique quais informações viram campos, quais frases indicam relações e
quais regras precisam de validação ou restrição no banco. Essa tradução evita
criar uma tabela que armazena dados, mas não representa o comportamento da
entidade.

```text
requisito escrito
      ↓
campo, relação ou regra
      ↓
model e restrições
      ↓
forms, views e consultas coerentes
```

Requisitos:

- cada aviso pertence a uma única turma;
- uma turma pode possuir vários avisos;
- o aviso possui titulo e mensagem;
- o sistema registra autor e data de cadastro;
- excluir uma turma também exclui seus avisos;
- excluir o usuário autor não deve excluir o aviso;
- somente usuários autorizados podem cadastrar;
- quem pode visualizar a turma pode visualizar seus avisos.

Traducao inicial para o model:

| Requisito | Recurso |
| --- | --- |
| Aviso pertence a uma turma | `ForeignKeyPlus` para `Turma` |
| Autor pode ser removido | `ForeignKeyPlus` com `SET_NULL` |
| Texto curto | `CharFieldPlus` |
| Texto livre | `TextField` |
| Data automatica | `DateTimeFieldPlus(auto_now_add=True)` |
| Auditoria do EDU | Herança de `LogModel` |
| Mais recentes primeiro | `Meta.ordering` |

#### 2. Criar o arquivo do model

O arquivo do model é responsável por declarar a entidade persistida: seus
campos, relações, opções de consulta e comportamentos básicos. Antes do código,
separe as partes: imports fornecem a base, a classe representa o aviso, os
campos descrevem os dados, `Meta` configura a tabela e os métodos definem a
representação e a URL do objeto.

Criar `edu/models/avisos.py`:

```python
from djtools.db import models

from edu.models.logs import LogModel


class AvisoTurma(LogModel):
    # Cada aviso pertence a uma turma. related_name define o acesso reverso:
    # turma.avisos.all(). CASCADE remove os avisos se a turma for excluida.
    turma = models.ForeignKeyPlus(
        'edu.Turma',
        verbose_name='Turma',
        related_name='avisos',
        on_delete=models.CASCADE,
    )

    # CharFieldPlus fornece max_length=255 quando ele nao e informado.
    titulo = models.CharFieldPlus('Titulo')

    # TextField e apropriado para conteudo sem tamanho curto predefinido.
    mensagem = models.TextField('Mensagem')

    # O autor nao sera escolhido no form: a view usara request.user.
    # SET_NULL preserva o aviso se o usuario for excluido.
    autor = models.ForeignKeyPlus(
        'comum.User',
        verbose_name='Autor',
        related_name='avisos_turma_criados',
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
    )

    # auto_now_add preenche a data somente na primeira gravacao.
    cadastrado_em = models.DateTimeFieldPlus(
        'Cadastrado em',
        auto_now_add=True,
    )

    class Meta:
        verbose_name = 'Aviso de Turma'
        verbose_name_plural = 'Avisos de Turma'
        ordering = ('-cadastrado_em',)

    def __str__(self):
        return f'{self.turma} - {self.titulo}'

    def get_absolute_url(self):
        return f'/edu/turma/{self.turma_id}/'
```

Leitura das principais decisões:

1. `LogModel` torna o model concreto auditavel e fornece os recursos de
   `ModelPlus`;
2. no banco, as chaves estrangeiras serao `turma_id` e `autor_id`;
3. `related_name='avisos'` substitui o nome padrão
   `avisoturma_set` por `turma.avisos`;
4. `editable=False` impede que `autor` seja exposto automaticamente em forms;
5. não foi sobrescrito `save()`, pois não existe regra de persistencia que
   justifique isso;
6. `get_absolute_url()` devolve a tela para a qual o usuário sera redirecionado
   depois do cadastro.

#### 3. Tornar o model conhecido pelo aplicativo

Como o EDU organiza os models em um pacote, incluir o novo arquivo em
`edu/models/__init__.py`, próximo aos demais imports:

```python
from .avisos import *
```

Sem esse import, `from edu.models import AvisoTurma` não encontrara a classe e
o carregamento adotado por esta versao do projeto ficara incompleto.

Confirmar no shell, antes de continuar:

```python
from edu.models import AvisoTurma

print(AvisoTurma._meta.app_label)   # edu
print(AvisoTurma._meta.db_table)    # edu_avisoturma
```

#### 4. Gerar e revisar a migration

Executar no ambiente de desenvolvimento:

```bash
python manage.py check
python manage.py makemigrations edu --name cria_aviso_turma
python manage.py showmigrations edu
```

Abrir a migration criada e localizar:

- dependencia da migration anterior do EDU;
- operação `migrations.CreateModel`;
- campos `id`, `titulo`, `mensagem`, `cadastrado_em`, `turma` e `autor`;
- `on_delete=CASCADE` em `turma`;
- `on_delete=SET_NULL` em `autor`;
- opções de `Meta`.

Antes de aplicar, substituir `NNNN` pelo número gerado e inspecionar o SQL:

```bash
python manage.py sqlmigrate edu NNNN
python manage.py migrate edu
```

Resultado esperado: criação da tabela `edu_avisoturma`, das duas chaves
estrangeiras e dos índices associados. Não editar manualmente a tabela no
banco.

#### 5. Criar o `ModelFormPlus`

Adicionar `AvisoTurma` ao bloco de imports de `edu/forms.py` e criar o form
próximo aos forms relacionados a turma:

```python
class AvisoTurmaForm(forms.ModelFormPlus):
    class Meta:
        model = AvisoTurma
        fields = ('titulo', 'mensagem')
```

O form expoe somente dados informados pelo usuário:

- `turma` vem da URL e sera definida pela view;
- `autor` vem de `request.user`;
- `cadastrado_em` e preenchido automaticamente;
- `titulo` e `mensagem` passam pelas conversoes e validações dos campos do
  model;
- `form.save()` criara e persistira uma instância de `AvisoTurma`.

Essa separacao evita que o usuário altere no POST a turma ou o autor do aviso.

#### 6. Criar a view

A view coordena o fluxo de criação do aviso. Ela identifica a turma, verifica
o acesso, cria o formulário com os dados controlados pelo backend, processa o
GET ou POST e escolhe a resposta final. O navegador informa apenas título e
mensagem; turma e autor devem ser definidos pela view.

Adicionar `AvisoTurma` aos imports de models e `AvisoTurmaForm` aos imports de
forms em `edu/views.py`. Depois, criar a view perto da função `turma`,
localizada atualmente em `edu/views.py:1556-1599`:

```python
@permission_required('edu.add_avisoturma')
@rtr()
def adicionar_aviso_turma(request, turma_pk):
    # Turma.locals respeita o escopo academico do usuario atual.
    turma = get_object_or_404(Turma.locals, pk=turma_pk)
    title = f'Adicionar Aviso - {turma}'

    # Os campos que nao pertencem ao formulario sao definidos pelo backend.
    aviso = AvisoTurma(
        turma=turma,
        autor=request.user,
    )
    form = AvisoTurmaForm(
        data=request.POST or None,
        instance=aviso,
    )

    if form.is_valid():
        aviso = form.save()
        return httprr(
            aviso.get_absolute_url(),
            'Aviso cadastrado com sucesso.',
        )

    return locals()
```

Leitura do fluxo:

1. `permission_required` bloqueia quem não possui a permissao de inclusão;
2. `Turma.locals` impede escolher uma turma fora do escopo retornado pelo
   manager contextual;
3. a view define `turma` e `autor`, que não vieram do navegador;
4. em GET, o form esta unbound e e apenas exibido;
5. em POST, `is_valid()` converte e valida os dados;
6. `form.save()` grava a instância e aciona a auditoria de `LogModel`, quando
   habilitada;
7. `httprr()` redireciona para a turma com uma mensagem de sucesso.

> Ocultar `turma` e `autor` no form melhora a interface, mas a protecao real
> esta na view: ela ignora valores externos para esses campos e busca a turma
> por um manager com escopo.

#### 7. Criar a URL

A URL transforma um endereço legível em uma chamada para a view. O parâmetro
`turma_pk` identifica a turma à qual o novo aviso será associado; ele vem do
trecho numérico da rota e é recebido pela view como argumento nomeado.

No grupo de rotas de turma, próximo a `edu/urls.py:27-34`, adicionar:

```python
path(
    'adicionar_aviso_turma/<int:turma_pk>/',
    views.adicionar_aviso_turma,
),
```

Fluxo da rota:

```text
/edu/adicionar_aviso_turma/25/
-> turma_pk = 25
-> adicionar_aviso_turma(request, turma_pk=25)
```

#### 8. Criar o template do formulário

O template define a estrutura visual da tela e reutiliza o layout padrão do
SUAP. `super_template` aponta para esse layout-base; `{% block content %}`
indica onde o conteúdo específico entra; `{% box %}` agrupa a área em um
bloco visual do sistema; e `{% render_form form %}` transforma o form preparado
pela view em campos, rótulos e mensagens de validação.

Criar `edu/templates/adicionar_aviso_turma.html`:

```django
{% extends super_template %}

{% block content %}
    {% box title %}
        {% render_form form %}
    {% endbox %}
{% endblock %}
```

Como `@rtr()` foi usado sem nome explicito, ele utiliza o nome da view para
localizar `adicionar_aviso_turma.html`. O `return locals()` entrega `title`,
`turma`, `aviso` e `form` ao contexto; neste template, `title` e `form` sao os
dados efetivamente consumidos.

#### 9. Exibir os avisos na tela da turma

Na view `turma`, antes do `return locals()` de `edu/views.py:1599`, preparar o
`QuerySet`:

```python
avisos = obj.avisos.select_related('autor')
```

- `obj.avisos` existe por causa do `related_name`;
- `Meta.ordering` coloca os avisos mais recentes primeiro;
- `select_related('autor')` evita uma consulta adicional por autor durante a
  renderizacao.

Na barra de acoes de `edu/templates/turma.html:8-17`, adicionar o botao:

```django
{% if perms.edu.add_avisoturma %}
    <li>
        <a class="btn success popup"
           href="/edu/adicionar_aviso_turma/{{ obj.pk }}/">
            {% icone "plus" %} Adicionar Aviso
        </a>
    </li>
{% endif %}
```

Depois do bloco de dados gerais, exibir a lista:

```django
{% box "Avisos da Turma" %}
    {% if avisos %}
        <table>
            <thead>
                <tr>
                    <th>Titulo</th>
                    <th>Mensagem</th>
                    <th>Autor</th>
                    <th>Cadastrado em</th>
                </tr>
            </thead>
            <tbody>
                {% for aviso in avisos %}
                    <tr>
                        <td>{{ aviso.titulo }}</td>
                        <td>{{ aviso.mensagem|linebreaksbr }}</td>
                        <td>{{ aviso.autor|format }}</td>
                        <td>{{ aviso.cadastrado_em|format }}</td>
                    </tr>
                {% endfor %}
            </tbody>
        </table>
    {% else %}
        <p class="msg alert">Nenhum aviso cadastrado para esta turma.</p>
    {% endif %}
{% endbox %}
```

A condição do template controla apenas a exibicao do botao. Mesmo conhecendo a
URL, um usuário sem `edu.add_avisoturma` continuara bloqueado pelo decorator da
view.

#### 10. Associar permissões a um grupo

Há três etapas diferentes no controle de acesso:

1. **Declarar:** listar `add_avisoturma` no `permissions.yaml` informa qual
   grupo deve receber a permissão do app `edu`.
2. **Sincronizar:** `sync_permissions` lê o YAML e grava a associação entre
   grupo e permissão nas tabelas do Django.
3. **Verificar:** o decorator da view consulta essa permissão no momento da
   requisição e bloqueia quem não a possui.

Declarar não altera o banco sozinho, e sincronizar não substitui a verificação
na view:

```text
permissions.yaml
      ↓ sync_permissions
grupo recebe edu.add_avisoturma
      ↓ permission_required()
view permite ou bloqueia o cadastro
```

Depois da migration, o Django cria as permissões padrão do model:

```text
edu.add_avisoturma
edu.change_avisoturma
edu.delete_avisoturma
edu.view_avisoturma
```

Para o exercicio, conceder a inclusão ao grupo usado pelos participantes.
Exemplo em `edu/permissions.yaml`, dentro de `Administrador Acadêmico`:

```yaml
    avisoturma:
    - add_avisoturma
```

Manter a indentacao do grupo existente e executar o comando de sincronizacao
adotado pelo projeto:

```bash
python manage.py sync_permissions
```

A migration cria o model e suas permissões padrão; o `permissions.yaml` e o
`sync_permissions` associam essas permissões aos grupos do SUAP. Sao etapas
relacionadas, mas diferentes. Nesta proposta, a listagem faz parte da tela já
protegida por `edu.view_turma`; `edu.add_avisoturma` controla apenas o cadastro.

#### 11. Validar o fluxo completo

Executar:

```bash
python manage.py check
python manage.py makemigrations edu --check
```

Depois, validar pelo navegador:

1. entrar com usuário que possua `edu.view_turma` e `edu.add_avisoturma`;
2. abrir `/edu/turma/<pk>/` com uma turma acessivel;
3. confirmar que o botao **Adicionar Aviso** aparece;
4. enviar o form vazio e observar as mensagens de campo obrigatorio;
5. cadastrar titulo e mensagem válidos;
6. confirmar o redirecionamento para a turma;
7. verificar titulo, mensagem, autor e data na lista;
8. entrar com usuário sem `add_avisoturma` e confirmar que o botao desaparece;
9. tentar a URL diretamente com esse usuário e confirmar que a view bloqueia;
10. verificar que uma turma fora do escopo de `Turma.locals` retorna 404.

Inspecao somente de leitura no shell:

```python
from edu.models import AvisoTurma

aviso = (
    AvisoTurma.objects
    .select_related('turma', 'autor')
    .first()
)

if aviso:
    print(aviso.pk, aviso.titulo)
    print(aviso.turma_id, aviso.turma)
    print(aviso.autor_id, aviso.autor)
    print(aviso.get_absolute_url())
```

#### 12. Fluxo final da funcionalidade

```text
Botao na turma
-> URL com turma_pk
-> decorator verifica permissao
-> view busca Turma.locals
-> ModelFormPlus valida titulo e mensagem
-> form.save() persiste AvisoTurma
-> LogModel registra auditoria, quando habilitada
-> httprr() retorna para a turma
-> view carrega obj.avisos com autor
-> template apresenta a lista
```

Conceitos consolidados nesta prática:

- organização dos models do EDU;
- `LogModel` e campos `Plus`;
- `ForeignKey`, `related_name`, `CASCADE` e `SET_NULL`;
- `Meta`, `__str__()` e `get_absolute_url()`;
- migrations e tabela no banco;
- relação model, form, view e template;
- managers contextuais e permissões;
- `select_related()` e prevencao de N+1;
- diferença entre esconder uma acao e bloquear seu backend.

### Prática 3 - Alterar um model existente com segurança

**Alteração:** adicionar validade aos avisos de turma  
**Model:** `AvisoTurma`, criado na prática anterior  
**Duração sugerida:** 35 a 45 minutos  
**Objetivo:** modificar schema e comportamento sem perder dados, quebrar
registros antigos ou deixar as demais camadas inconsistentes.

Nova regra:

- um aviso pode possuir uma data de expiracao;
- sem data de expiracao, permanece visivel por tempo indeterminado;
- na data informada, ainda permanece visivel;
- depois dessa data, deixa de aparecer na tela da turma;
- registros criados antes da alteração devem continuar visiveis.

#### 1. Analisar o impacto antes de editar

Comecar localizando todas as referências ao model e aos dados que serao
alterados:

```bash
rg -n "AvisoTurma|obj\.avisos|avisos" edu
git status --short
```

Revisar pelo menos:

| Camada | Pergunta |
| --- | --- |
| Model | O campo aceita os registros que já existem? |
| Banco | A migration bloqueia, reescreve ou perde dados? |
| Form | O usuário podera informar o novo valor? |
| View/QuerySet | A regra de visibilidade sera aplicada? |
| Template | O novo dado precisa ser apresentado? |
| Permissões | A mudanca amplia acesso a informações? |
| Testes | Quais comportamentos antigos e novos devem continuar válidos? |

Antes da alteração, registrar uma linha de base:

```bash
python manage.py check
python manage.py makemigrations edu --check
```

Se o segundo comando apontar migrations pendentes que não pertencem ao
exercicio, identifica-las antes de gerar uma nova migration. Isso evita
misturar mudancas independentes no mesmo arquivo.

#### 2. Escolher um contrato compativel com os dados existentes

A opcao escolhida sera:

```python
data_expiracao = models.DateFieldPlus(
    'Data de Expiracao',
    null=True,
    blank=True,
)
```

Por que `null=True` e `blank=True`?

- `null=True`: linhas antigas podem receber `NULL` no banco;
- `blank=True`: o campo pode ficar vazio no formulário;
- `NULL` tera um significado definido: aviso sem prazo de expiracao;
- não e necessário inventar uma data para registros antigos;
- a migration não precisa executar uma atualizacao massiva para preencher o
  campo.

Não adicionar uma data atual como `default`, pois isso faria avisos antigos
expirarem de acordo com a data da migration, contrariando a regra definida.
Também não sera criado um índice neste primeiro momento: as consultas já partem
de uma turma e o volume de avisos por turma tende a ser pequeno. Indices devem
responder a uma necessidade medida, pois também possuem custo de escrita e
migration.

#### 3. Alterar o model

Uma alteração compatível com dados existentes começa preservando registros
antigos. O campo novo deve aceitar o estado que já existe, a migration deve
ser revisada e somente depois uma regra mais rígida pode ser aplicada. Neste
caso, `null=True` e `blank=True` permitem que avisos anteriores continuem sem
data de expiração.

No inicio de `edu/models/avisos.py`, importar o utilitario de fuso horario do
Django:

```python
from django.utils import timezone
```

Adicionar o campo depois de `cadastrado_em`:

```python
data_expiracao = models.DateFieldPlus(
    'Data de Expiracao',
    null=True,
    blank=True,
)
```

Adicionar um metodo de domínio abaixo de `get_absolute_url()`:

```python
def esta_expirado(self, hoje=None):
    # Receber hoje como argumento torna a regra previsivel nos testes.
    hoje = hoje or timezone.localdate()
    return (
        self.data_expiracao is not None
        and self.data_expiracao < hoje
    )
```

Leitura da regra:

| `data_expiracao` | Data atual | `esta_expirado()` |
| --- | --- | --- |
| `None` | qualquer data | `False` |
| anterior a hoje | hoje | `True` |
| igual a hoje | hoje | `False` |
| posterior a hoje | hoje | `False` |

O uso de `<`, e não `<=`, implementa a decisão de manter o aviso visivel
durante todo o dia informado.

#### 4. Gerar uma migration pequena e revisavel

Executar:

```bash
python manage.py makemigrations edu --name adiciona_expiracao_aviso_turma
python manage.py showmigrations edu
python manage.py migrate --plan
```

A migration deve conter essencialmente uma operação `AddField`:

```python
migrations.AddField(
    model_name='avisoturma',
    name='data_expiracao',
    field=djtools.db.models.DateFieldPlus(
        blank=True,
        null=True,
        verbose_name='Data de Expiracao',
    ),
)
```

Esse formato segue migrations reais do EDU, por exemplo
`edu/migrations/0065_auto_20220111_1502.py:14-18`. O importante e conferir:

- model e campo corretos;
- `null=True` e `blank=True` preservados;
- ausencia de remocao ou renomeacao inesperada;
- dependencia apontando para a migration anterior;
- nenhuma outra alteração misturada no arquivo.

Inspecionar o SQL antes de aplicar:

```bash
python manage.py sqlmigrate edu NNNN
python manage.py migrate edu
```

Depois, confirmar:

```bash
python manage.py showmigrations edu
python manage.py makemigrations edu --check
```

Registros existentes passam a ter `data_expiracao = NULL` e, pela regra
definida, continuam visiveis.

#### 5. Atualizar o form sem expor campos indevidos

Adicionar `from django.utils import timezone` aos imports e alterar
`AvisoTurmaForm` em `edu/forms.py`:

```python
class AvisoTurmaForm(forms.ModelFormPlus):
    class Meta:
        model = AvisoTurma
        fields = (
            'titulo',
            'mensagem',
            'data_expiracao',
        )

    def clean_data_expiracao(self):
        data_expiracao = self.cleaned_data.get('data_expiracao')
        if data_expiracao and data_expiracao < timezone.localdate():
            raise forms.ValidationError(
                'A data de expiracao nao pode estar no passado.'
            )
        return data_expiracao
```

O `DateFieldPlus` converte a entrada para `date` antes de
`clean_data_expiracao()` ser executado. O metodo aceita campo vazio e rejeita
somente novas datas no passado.

`turma`, `autor` e `cadastrado_em` continuam fora de `fields`; a mudanca não
deve reabrir campos controlados pelo backend.

#### 6. Atualizar a consulta que define visibilidade

Adicionar `from django.utils import timezone` aos imports de `edu/views.py`. Na
view `turma`, substituir:

```python
avisos = obj.avisos.select_related('autor')
```

por:

```python
hoje = timezone.localdate()
avisos = (
    obj.avisos
    .filter(
        Q(data_expiracao__isnull=True)
        | Q(data_expiracao__gte=hoje)
    )
    .select_related('autor')
)
```

Essa consulta traduz a regra para SQL:

```text
data_expiracao IS NULL
OR data_expiracao >= hoje
```

Os parenteses em torno dos objetos `Q` tornam explicito o `OR`. O filtro e
aplicado no banco, portanto avisos expirados não sao carregados para depois
serem descartados em Python.

O metodo `esta_expirado()` e a consulta representam a mesma regra em contextos
diferentes:

- o metodo responde sobre uma instância já carregada;
- o `QuerySet` seleciona eficientemente várias instancias no banco.

#### 7. Atualizar a apresentacao

Uma alteração no model chega ao template por um caminho completo: a migration
cria a coluna, a view seleciona os registros e monta o contexto, e o template
apresenta o novo atributo. O template não deve recalcular a regra de expiração
nem acessar o banco diretamente.

```text
model + migration
       ↓
view filtra e entrega aviso.data_expiracao
       ↓
template formata e exibe a data
```

No cabecalho da tabela de avisos em `edu/templates/turma.html`, adicionar:

```django
<th>Valido ate</th>
```

Na linha de cada aviso, adicionar:

```django
<td>{{ aviso.data_expiracao|format }}</td>
```

O filtro `format` apresenta a data conforme o padrão do SUAP e trata o valor
ausente. Não e necessário repetir no template a verificacao de expiracao: a
view já entregou apenas os registros visiveis.

#### 8. Testar a regra de negócio isoladamente

Adicionar um teste focado. Como `esta_expirado()` não consulta o banco, as
instancias podem permanecer sem salvar:

```python
from datetime import date
from django.test import SimpleTestCase

from edu.models import AvisoTurma


class AvisoTurmaTestCase(SimpleTestCase):
    def test_aviso_sem_expiracao_permanece_valido(self):
        aviso = AvisoTurma(data_expiracao=None)
        self.assertFalse(aviso.esta_expirado(date(2026, 10, 19)))

    def test_aviso_expira_somente_depois_da_data(self):
        aviso = AvisoTurma(data_expiracao=date(2026, 10, 19))

        self.assertFalse(aviso.esta_expirado(date(2026, 10, 18)))
        self.assertFalse(aviso.esta_expirado(date(2026, 10, 19)))
        self.assertTrue(aviso.esta_expirado(date(2026, 10, 20)))
```

As datas sao fixas e passadas ao metodo. O teste não depende do relogio da
maquina e documenta claramente o comportamento na vespera, no dia e depois da
expiracao.

Executar o teste pelo caminho correspondente ao arquivo em que a classe foi
adicionada. Se for colocada em `edu/tests.py`:

```bash
python manage.py test edu.tests.AvisoTurmaTestCase
```

#### 9. Fazer a verificacao de regressao

Validar quatro registros em ambiente de desenvolvimento:

| Cenario | Deve aparecer na turma? |
| --- | --- |
| Registro antigo com `NULL` | Sim |
| Expiracao futura | Sim |
| Expiracao igual a hoje | Sim |
| Expiracao anterior a hoje | Não |

Checklist tecnico:

```bash
python manage.py check
python manage.py makemigrations edu --check
python manage.py test edu.tests.AvisoTurmaTestCase
```

Checklist de interface:

1. cadastrar aviso sem expiracao;
2. cadastrar aviso com data futura;
3. tentar cadastrar com data passada e conferir o erro do form;
4. abrir uma turma que já possuia avisos antes da migration;
5. conferir a formatacao da nova coluna;
6. confirmar que permissões, botao e acesso direto continuam funcionando;
7. revisar se a listagem executa a consulta com `select_related('autor')`.

#### 10. Saber como corrigir uma migration

Antes de compartilhar ou aplicar a migration em outro ambiente:

- se ela ainda não foi aplicada, corrigir o model, remover apenas a migration
  local do exercicio e gera-la novamente;
- confirmar que nenhuma outra pessoa depende daquele arquivo;
- nunca remover migrations alheias ou alterações não relacionadas.

Depois que a migration foi aplicada ou compartilhada:

- não editar o arquivo antigo para fingir que o estado anterior nunca existiu;
- criar uma nova migration que corrija o schema ou os dados;
- avaliar backup, tempo de bloqueio e plano de reversao antes de produção;
- para renomear ou remover campos, preferir mudancas em etapas quando código
  antigo e novo puderem executar simultaneamente.

Se futuramente `data_expiracao` se tornar obrigatoria, a mudanca segura sera em
etapas:

```text
1. adicionar o campo como opcional
2. preencher os registros existentes com uma data migration
3. validar que nao restou NULL
4. alterar o campo para null=False
```

#### 11. Fluxo final da alteração

```text
definir regra e impacto
-> escolher campo compativel com dados existentes
-> alterar model
-> gerar e revisar AddField
-> inspecionar SQL e aplicar migration
-> atualizar form
-> atualizar QuerySet
-> atualizar template
-> testar limites da data
-> validar regressao e permissoes
```

Resultado esperado: uma alteração pequena, rastreavel e reversivel por nova
migration, com comportamento consistente no model, banco, form, view e
template.

### Prática 4 - Consultas ORM no shell

**Duração sugerida:** 35 a 45 minutos  
**Objetivo:** construir e inspecionar consultas do EDU sem alterar dados,
compreendendo managers, `QuerySet`, relacionamentos, SQL e desempenho.

Models utilizados:

- `Aluno`, iniciado em `edu/models/alunos.py:107`;
- `Turma`, em `edu/models/turmas.py:19-330`;
- `Diario`, em `edu/models/diarios.py:42-1416`.

Os campos centrais desta prática podem ser conferidos em:

- `Aluno.pessoa_fisica`, `curso_campus` e `situação`:
  `edu/models/alunos.py:266`, `386` e `389`;
- `Turma.ano_letivo` e `curso_campus`: `edu/models/turmas.py:28-32`;
- `Diario.turma` e `local_aula`: `edu/models/diarios.py:65-76`.

#### 1. Preparar um ambiente somente de leitura

Executar em uma base de desenvolvimento ou homologação autorizada:

```bash
python manage.py shell
```

Importar os recursos da atividade:

```python
from django.db import connection
from django.db.models import Count, Q
from django.test.utils import CaptureQueriesContext

from edu.models import Aluno, Diario, Turma
```

Durante esta prática, não executar:

```python
# NAO executar durante o exercicio de leitura:
Modelo.objects.create(...)
Modelo.objects.filter(...).update(...)
Modelo.objects.filter(...).delete()
obj.save()
obj.delete()
```

Evitar também bases de produção: uma consulta sem limite pode consumir muitos
recursos mesmo sem modificar registros.

#### 2. Confirmar model, tabela e manager

Usar `_meta` para conferir o model antes da primeira consulta:

```python
print(Aluno._meta.label)       # edu.Aluno
print(Aluno._meta.db_table)    # edu_aluno
print(Turma._meta.db_table)    # edu_turma
print(Diario._meta.db_table)   # edu_diario
```

Conferir os managers declarados:

```python
print([manager.name for manager in Aluno._meta.managers])
print([manager.name for manager in Turma._meta.managers])
```

`Aluno` declara vários managers em `edu/models/alunos.py:250-259`; `Turma`
declara `objects` e `locals` em `edu/models/turmas.py:22-24`.

No shell, não existe automaticamente o usuário da requisição HTTP.
`Turma.locals` depende de `tl.get_user()` e pode devolver um conjunto vazio ou
diferente do esperado. Para estudar dados gerais em uma base autorizada, os
exemplos abaixo usam `objects`. Isso não significa que uma view possa trocar
`locals` por `objects`: na aplicação, essa troca pode ampliar o escopo de dados.

#### 3. Observar a avaliação preguicosa

O objetivo do exercício é separar a montagem da consulta de sua avaliação e
observar quantas consultas cada operação dispara. Criar e encadear filtros não
deve consultar o banco; `count()`, `exists()`, `first()`, `list()` e a iteração
normalmente executam SQL.

Montar uma consulta sem consumi-la:

```python
qs = Aluno.objects.filter(situacao__ativo=True)
```

Nesse ponto, `qs` descreve a consulta. Para ver o SQL sem buscar as linhas:

```python
print(qs.query)
```

Operacoes como estas normalmente devolvem outro `QuerySet` ainda preguicoso:

```python
qs = (
    qs
    .exclude(matricula='')
    .order_by('pessoa_fisica__nome')
    .select_related('pessoa_fisica')
)
```

A consulta e avaliada por operações como:

```python
qs.count()
qs.exists()
qs.first()
list(qs[:10])
for aluno in qs[:10]:
    print(aluno.matricula)
```

Observe a diferença no contador de consultas:

```python
from django.db import connection

qs = Aluno.objects.filter(situacao__ativo=True)
antes = len(connection.queries)
qs = qs.select_related('pessoa_fisica')  # ainda não consulta
depois_da_montagem = len(connection.queries)

list(qs[:10])                         # primeira avaliação
depois_da_lista = len(connection.queries)
qs.count()                            # nova operação terminal
depois_da_contagem = len(connection.queries)
```

O esperado é que `antes` e `depois_da_montagem` sejam iguais. A diferença
entre `depois_da_lista` e `depois_da_contagem` mostra que cada operação
terminal pode executar uma consulta própria. Repetir a iteração sobre um
QuerySet já avaliado pode usar o cache; criar outro QuerySet ou acessar uma
relação não pré-carregada pode gerar SQL adicional.

No shell interativo, digitar apenas `qs` pode chamar sua representacao
(`repr`) e executar uma consulta limitada para mostrar resultados. Para
inspecionar a estrutura sem esse efeito, usar `print(qs.query)`.

#### 4. Filtrar por campos simples

Contar alunos ativos:

```python
ativos = Aluno.objects.filter(situacao__ativo=True)
print(ativos.count())
```

Pesquisar parte de uma matrícula sem depender de uma matrícula fixa:

```python
amostra = (
    Aluno.objects
    .exclude(matricula='')
    .values_list('matricula', flat=True)
    .first()
)

if amostra:
    trecho = amostra[:4]
    alunos = Aluno.objects.filter(matricula__icontains=trecho)
    print(alunos.count())
```

Lookups utilizados:

- `situacao__ativo=True`: atravessa uma `ForeignKey`;
- `matricula__icontains=trecho`: busca textual sem diferenciar maiúsculas e
  minúsculas;
- `exclude(matrícula='')`: remove valores vazios;
- `values_list(..., flat=True)`: devolve somente valores, e não instancias.

#### 5. Atravessar relacionamentos

Descobrir um ano existente e consultar suas turmas:

```python
ano = (
    Turma.objects
    .order_by('-ano_letivo__ano')
    .values_list('ano_letivo__ano', flat=True)
    .first()
)

turmas = Turma.objects.filter(ano_letivo__ano=ano)
print(turmas.count())
```

Selecionar turmas de um curso cujo texto contenha um termo obtido da própria
base:

```python
curso = (
    Turma.objects
    .exclude(curso_campus__descricao='')
    .values_list('curso_campus__descricao', flat=True)
    .first()
)

if curso:
    termo = curso.split()[0]
    turmas_curso = Turma.objects.filter(
        curso_campus__descricao__icontains=termo,
    )
    print(turmas_curso.count())
```

Cada `__` pode representar uma travessia ou um lookup:

```text
curso_campus__descricao__icontains
relacionamento -> campo -> operacao
```

#### 6. Escolher entre `get()`, `first()` e `filter()`

Obter uma instância sem presumir um `pk`:

```python
primeiro = Aluno.objects.order_by('pk').first()
```

- `first()` retorna uma instância ou `None`;
- `filter()` sempre retorna `QuerySet`, mesmo vazio;
- `get()` exige exatamente um resultado e pode levantar excecao.

Use `get()` somente depois de obter uma chave válida:

```python
if primeiro:
    mesmo_aluno = Aluno.objects.get(pk=primeiro.pk)
    print(mesmo_aluno.matricula)
```

As excecoes especificas podem ser tratadas assim:

```python
try:
    aluno = Aluno.objects.get(matricula='matricula-inexistente')
except Aluno.DoesNotExist:
    aluno = None
```

Não usar `get()` quando a ausencia for uma situação normal e apenas a primeira
ocorrencia for suficiente.

#### 7. Projetar somente as colunas necessárias

Listar até dez diarios sem local de aula:

```python
diarios_sem_local = (
    Diario.objects
    .filter(local_aula__isnull=True)
    .values(
        'pk',
        'turma__codigo',
        'componente_curricular__componente__descricao',
    )
    .order_by('turma__codigo')[:10]
)

for item in diarios_sem_local:
    print(item)
```

`values()` devolve dicionarios. Para tuplas, usar `values_list()`:

```python
pares = (
    Turma.objects
    .values_list('codigo', 'curso_campus__descricao')
    .order_by('codigo')[:10]
)

for codigo, curso in pares:
    print(codigo, curso)
```

Essas operações sao adequadas quando não e necessário chamar métodos do model
nem navegar pela instância completa.

#### 8. Combinar condições com `Q`

Pesquisar uma turma pelo código **ou** pela descrição:

```python
termo = '2026'

resultado = Turma.objects.filter(
    Q(codigo__icontains=termo)
    | Q(descricao__icontains=termo)
)

print(resultado.query)
print(resultado.count())
```

Comparacao:

```python
# AND implicito: as duas condicoes precisam ser verdadeiras.
Turma.objects.filter(
    codigo__icontains=termo,
    descricao__icontains=termo,
)

# OR explicito: pelo menos uma condicao precisa ser verdadeira.
Turma.objects.filter(
    Q(codigo__icontains=termo)
    | Q(descricao__icontains=termo)
)
```

Usar parenteses quando vários `Q` combinarem `&`, `|` e `~`, deixando a
precedencia legível.

#### 9. Agrupar e contar no banco

Contar turmas por ano letivo:

```python
turmas_por_ano = (
    Turma.objects
    .values('ano_letivo__ano')
    .annotate(total=Count('pk'))
    .order_by('-ano_letivo__ano')[:10]
)

for item in turmas_por_ano:
    print(item['ano_letivo__ano'], item['total'])
```

Leitura:

1. `values('ano_letivo__ano')` define o agrupamento;
2. `annotate(total=Count('pk'))` calcula uma quantidade para cada grupo;
3. o banco realiza o `GROUP BY`;
4. a aplicação recebe somente ano e total.

Para uma única resposta global, usar `aggregate()`:

```python
resumo = Turma.objects.aggregate(total=Count('pk'))
print(resumo)  # {'total': ...}
```

#### 10. Problema N+1

O problema aparece quando uma consulta inicial traz vários alunos e cada acesso
ao relacionamento abre outra consulta. Compare o código sem otimização com o
código que usa `select_related()`:

Primeiro, carregar alunos sem otimizar as chaves estrangeiras:

```python
sem_otimizacao = Aluno.objects.order_by('pk')[:10]

with CaptureQueriesContext(connection) as consultas:
    linhas = [
        (
            aluno.matricula,
            aluno.pessoa_fisica.nome,
            str(aluno.curso_campus),
        )
        for aluno in sem_otimizacao
    ]

print(len(consultas))
```

Em seguida, repetir com `select_related()`:

```python
com_otimizacao = (
    Aluno.objects
    .select_related('pessoa_fisica', 'curso_campus')
    .order_by('pk')[:10]
)

with CaptureQueriesContext(connection) as consultas:
    linhas = [
        (
            aluno.matricula,
            aluno.pessoa_fisica.nome,
            str(aluno.curso_campus),
        )
        for aluno in com_otimizacao
    ]

print(len(consultas))
```

O número exato da primeira versao depende dos dados, especialmente de
`curso_campus` poder ser nulo. A segunda deve concentrar as chaves estrangeiras
em uma consulta com joins.

Para relacionamentos reversos, comparar o uso de `prefetch_related()`:

```python
turmas = (
    Turma.objects
    .prefetch_related('diario_set')
    .order_by('pk')[:5]
)

with CaptureQueriesContext(connection) as consultas:
    resultado = [
        (turma.codigo, list(turma.diario_set.all()))
        for turma in turmas
    ]

print(len(consultas))
```

O esperado e uma consulta para turmas e outra para os diarios relacionados,
em vez de uma consulta de diarios para cada turma.

`select_related()` é adequado para relações de valor único, como
`ForeignKey`; `prefetch_related()` é adequado para relações reversas e
`ManyToMany`, que podem trazer vários objetos.

#### 11. Limitar resultados e inspecionar o plano

Aplicar limite antes de materializar uma consulta exploratoria:

```python
qs = (
    Aluno.objects
    .filter(situacao__ativo=True)
    .order_by('matricula')[:20]
)

print(qs.query)
```

Quando o banco configurado oferecer suporte, examinar o plano:

```python
print(qs.explain())
```

`explain()` ajuda a observar varreduras, índices e joins. Não usar opções de
analise que executem consultas pesadas em ambientes compartilhados sem antes
entender seu efeito.

Regras para consultas exploratorias:

- filtrar antes de iterar;
- usar `[:N]` para limitar amostras;
- evitar `list(Modelo.objects.all())` em tabelas grandes;
- preferir `count()` a carregar objetos somente para conta-los;
- preferir `exists()` quando a pergunta for apenas sim ou não;
- selecionar apenas as colunas necessárias quando instancias não forem usadas.

#### 12. Exercicios para o participante

Construir consultas somente de leitura para responder:

1. Quantos alunos estao em situação ativa?
2. Quantas turmas existem no ano letivo mais recente da base?
3. Quais sao os dez primeiros diarios sem local de aula?
4. Quais cursos aparecem nas turmas desse ano, sem repeticao?
5. Existe algum aluno cuja matrícula contenha um trecho escolhido?
6. Quantos diarios cada uma de cinco turmas possui?
7. Quantas consultas sao executadas ao listar alunos com pessoa física e
   curso, antes e depois de `select_related()`?

Uma possível consulta para o item 4:

```python
cursos = (
    Turma.objects
    .filter(ano_letivo__ano=ano)
    .values_list('curso_campus__descricao', flat=True)
    .order_by('curso_campus__descricao')
    .distinct()
)

for curso in cursos[:20]:
    print(curso)
```

#### 13. Fechamento da prática

Antes de sair, identificar o tipo devolvido por cada operação:

| Operacao | Retorno principal |
| --- | --- |
| `filter()`, `exclude()`, `order_by()` | `QuerySet` |
| `select_related()`, `prefetch_related()` | `QuerySet` |
| `values()` | `QuerySet` de dicionarios |
| `values_list()` | `QuerySet` de tuplas ou valores |
| `first()` | Instância ou `None` |
| `get()` | Uma instância ou excecao |
| `exists()` | Booleano |
| `count()` | Inteiro |
| `aggregate()` | Dicionario |

Encerrar o shell sem gravar nada:

```python
exit()
```

Fluxo mental recomendado:

```text
model -> manager -> QuerySet -> filtros e relacionamentos
-> SQL -> avaliacao -> quantidade de consultas -> resultado
```

O objetivo não e decorar todos os métodos do ORM, mas conseguir ler uma
consulta, prever seu retorno, reconhecer quando ela sera executada e avaliar
se o custo e o escopo estao adequados.

<a id="etapa-9"></a>

## Etapa 9 - Testes, revisão e fechamento

### 1. Testes que devem ser abordados

Cada tipo de teste responde a uma pergunta diferente: o model aceita os dados,
preserva suas regras e continua integrado às camadas que o utilizam?

| Tipo | O que verifica | Exemplo |
| --- | --- | --- |
| valor default | estado inicial do objeto | `assertEqual(obj.status, 'PENDENTE')` |
| `choices` | valores aceitos e rejeitados | `full_clean()` com situação inválida |
| representação | texto e URL do objeto | `str(obj)` e `get_absolute_url()` |
| validação | regras entre campos | `clean()` levanta `ValidationError` |
| integridade | unicidade no model e no banco | `full_clean()` e `IntegrityError` |
| persistência | efeitos de `save()` e `delete()` | campo calculado, auditoria e cascata |
| domínio | ações da entidade | `obj.cancelar()` muda o estado correto |

#### 1.1. Testes de model

Exemplos focados:

```python
class AvisoTurmaTest(TestCase):
    def test_clean_rejeita_data_anterior(self):
        aviso = AvisoTurma(data_expiracao=date(2026, 1, 1))
        with self.assertRaises(ValidationError):
            aviso.full_clean()

    def test_unicidade_do_codigo(self):
        Componente.objects.create(sigla='MAT')
        outro = Componente(sigla='MAT')
        with self.assertRaises(ValidationError):
            outro.validate_unique()

    def test_save_preenche_valor_calculado(self):
        obj = Modelo(nome='Ana')
        obj.save()
        self.assertIsNotNone(obj.pk)

    def test_exclusao_respeita_relacao(self):
        turma = TurmaFactory()
        aviso = AvisoTurmaFactory(turma=turma)
        turma.delete()
        self.assertFalse(AvisoTurma.objects.filter(pk=aviso.pk).exists())

    def test_metodo_de_dominio(self):
        aviso = AvisoTurmaFactory()
        aviso.cancelar('Encerrado')
        self.assertTrue(aviso.cancelado)
```

O teste deve verificar o efeito observável da regra, e não apenas repetir o
código do método. Para unicidade, teste tanto a mensagem de validação quanto a
restrição do banco quando o caminho de gravação não chama `full_clean()`.

### 2. Erros comuns para discutir

| Erro | Exemplo incorreto | Forma correta |
| --- | --- | --- |
| confundir `null` e `blank` | usar `blank=True` esperando aceitar `NULL` no banco | definir `null=True` para armazenamento e `blank=True` para formulário |
| usar `CASCADE` sem análise | excluir o pai e apagar histórico | avaliar `PROTECT`, `RESTRICT` ou a cascata necessária |
| esquecer `super().save()` | sobrescrever `save()` sem persistir | chamar `super().save(*args, **kwargs)` |
| esperar validação automática | `obj.save()` esperando `full_clean()` | chamar `full_clean()` ou usar `ModelForm` |
| regra somente no form | impedir duplicidade em uma única tela | usar regra no model e restrição no banco |
| escopo incorreto | `Aluno.objects.all()` em tela contextual | usar `Aluno.locals` quando previsto |
| N+1 | acessar relação dentro de loop sem preload | usar `select_related()` ou `prefetch_related()` |
| `get()` para ausência normal | não tratar `DoesNotExist` | usar `filter().first()` ou `get_object_or_404()` |
| `update()` esperando sinais | esperar auditoria em `qs.update()` | carregar e salvar instâncias quando necessário |
| migration sem análise | tornar campo obrigatório com dados nulos | migrar em etapas e revisar registros |

Exemplo de correção de uma regra que estava somente no formulário:

```python
# Incorreto: a regra só protege esta tela.
if form.cleaned_data['codigo'] == '':
    ...

# Correto: a restrição também protege admin, shell e tasks.
class Meta:
    constraints = [
        models.UniqueConstraint(fields=['codigo'], name='codigo_unico'),
    ]
```

### 3. Checklist para revisão de alterações em models

Durante uma revisão real, aplique as perguntas a uma alteração concreta, por
exemplo, a inclusão de `data_expiracao` em `AvisoTurma`:

1. **O campo pertence ao model?** Ele descreve o aviso e é usado por mais de
   uma tela? Então não deve ficar apenas no form.
2. **Os valores antigos continuam válidos?** `NULL` representa aviso sem prazo
   e evita quebrar a migration?
3. **Há unicidade, índice ou data migration?** A consulta parte da turma e o
   volume justifica um índice?
4. **O manager preserva o escopo?** A listagem continua usando `Turma.locals`?
5. **`save()`, validação e auditoria permanecem?** O novo campo passa pelo
   `ModelForm` e pelo `LogModel` sem alterar regras anteriores?
6. **As camadas foram verificadas?** Form, view, admin, template, API e PDF
   exibem ou filtram o campo corretamente?
7. **Há risco de N+1 ou ausência de limite?** A nova coluna exige relações
   extras durante a renderização?
8. **As verificações passaram?** Execute `check`, revise a migration, rode o
   teste focado e confira uma tela com dados antigos.

### 4. Resultado esperado do encontro

Ao final, o participante deve conseguir:

1. localizar e interpretar um model do EDU;
2. diferenciar recursos do Django e extensoes do SUAP;
3. compreender campos, relacionamentos e metadados;
4. implementar e localizar regras e validações;
5. consultar dados com o ORM e reconhecer N+1;
6. distinguir `objects` de managers contextuais;
7. criar e revisar uma migration simples;
8. revisar uma alteração de model antes de integra-la ao sistema.





