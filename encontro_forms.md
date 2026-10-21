# Encontro - Django Forms no SUAP EDU

## A. Identificacao

**Título:** Formulários Django no SUAP: entrada, validação, persistência e PDF.

**Carga horaria:** 2 horas.

**Objetivo geral:** capacitar o participante a compreender e implementar o fluxo completo de Formulários no SUAP, relacionando `forms.py`, `views.py`, `models.py`, templates e geração de PDF.

**Objetivos específicos:**

- diferenciar `FormPlus` de `ModelFormPlus`;
- entender formulário não vinculado e formulário vinculado;
- utilizar `request.GET`, `request.POST` e `request.FILES` corretamente;
- compreender `is_valid()`, `cleaned_data`, `clean_<campo>()`, `clean()` e `ValidationError`;
- organizar campos com `fieldsets` e renderizar com `{% render_form form %}`;
- entender como `instance`, `Meta.model`, `Meta.fields` e `save()` ligam form e model;
- restringir querysets e campos dinamicamente no `__init__`;
- criar um formulário real que busca um aluno e gera um PDF autenticável;
- criar um relatório consultivo com filtros relacionados e listagem de alunos;
- editar campos de um model existente com `ModelFormPlus`, `instance` e `save()`;
- coordenar dados de models diferentes com `FormPlus`, transação e reutilização
  de fluxos existentes.

**Pré-requisitos:** fluxo URL -> view -> template, consultas com ORM, decorators, permissões e introdução ao `@documento`.

## B. Ideia central do encontro

O formulário e a fronteira entre os dados enviados pelo navegador e a lógica da aplicação. Ele não serve apenas para desenhar caixas de texto: recebe os dados, converte tipos, valida regras e entrega valores confiáveis para a view.

Uma forma de visualizar o fluxo:

```text
Template = ficha apresentada ao usuario.
Form = atendente que confere e organiza a ficha.
View = responsavel que decide o que fazer com a ficha validada.
Model = registro oficial salvo no banco.
```

Fluxo básico:

```text
Usuario abre a URL
        |
View cria um form vazio
        |
Template renderiza o form
        |
Usuario envia os dados
        |
View cria um form vinculado a GET ou POST
        |
form.is_valid()
        |
Campos e regras sao validados
        |
form.cleaned_data
        |
Processar consulta, salvar model ou gerar PDF
        |
Redirect ou resposta final
```

## C. Sequência e mapa do encontro

Esta seção apresenta a sequência de estudo e mostra como os tópicos se conectam. Comece pelos fundamentos, acompanhe os três fluxos completos e depois avance para os recursos específicos, as atividades e a revisão.

Cada exemplo segue a mesma ordem de leitura: primeiro o conceito e a responsabilidade de cada arquivo; depois, o código completo com comentários; em seguida, a análise do fluxo entre form, view, model e template; por fim, os cuidados e as possibilidades de adaptação. Essa organização permite consultar o código sem perder a relação com o comportamento da tela.


| Tempo | Etapa | Conteúdo | Estrategia | Referências |
|---|---:|---|---|---|
| 25 min | 1 | Conceito e fluxo web | Revisar fundamentos de Python, decoradores, tipos de form, LPS, validação e persistência | Este documento; `djtools/forms/__init__.py:54-74` |
| 20 min | 2 | Form e view | Leitura detalhada de `ReplicacaoMatrizForm` e `replicar_matriz` | `edu/forms.py:662-673`; `edu/views.py:1473-1485` |
| 15 min | 3 | Form e model | Leitura de `AlterarCoordenadorPlanoEnsinoForm`, `PlanoEnsino` e view | `edu/forms.py:14168-14171`; `edu/models/plano_ensino.py:6-34`; `edu/views.py:14724-14733` |
| 15 min | 4 | Form, view e template | Seguir `RelatorioHorarioForm`, `TabelaHorario` e o template | `edu/forms.py:4456-4503`; `edu/views.py:6330-6369`; `edu/templates/relatorio_horario.html:1-36` |
| 10 min | 5 | Recursos essenciais do SUAP | Autocomplete, querysets dinamicos e upload | `djtools/forms/widgets/__init__.py:566-723`; `edu/forms.py:5889-5959` |
| 30 min | 6 | Atividades práticas | Executar uma atividade e comparar consulta, PDF e edição | `edu/forms.py`, `edu/urls.py`, `edu/views.py` e templates novos |
| 5 min | 7 | Testes e fechamento | Executar checklist e revisar responsabilidades | Seção K |

## D. Fundamentos de Forms

Esta seção apresenta os conceitos necessários para acompanhar um formulário no SUAP, desde a definição dos campos até a validação e a persistência dos dados. A leitura segue uma progressão: primeiro os recursos da linguagem Python, depois as classes de formulário do Django e do SUAP, os dados da requisição, a validação e, por fim, as operações de gravação.

| Etapa | O que você vai compreender |
|---|---|
| 1. Python | `self`, `*args`, `**kwargs`, `__init__()` e `super()` |
| 2. Classes de formulário | Diferenças entre `Form`, `FormPlus`, `ModelForm` e `ModelFormPlus` |
| 3. Contexto da requisição | Estados `bound`/`unbound`, `prefix`, `GET`, `POST` e `FILES` |
| 4. Validação | `is_valid()`, `cleaned_data`, `clean_<campo>()` e `clean()` |
| 5. Persistência | `instance`, `save()`, `commit=False`, `save_m2m()` e `processar()` |

Ao terminar, você conseguirá identificar qual classe usar, acompanhar os dados entre view e formulário e localizar o ponto em que cada regra é aplicada.

### 1. Python necessário para ler um formulário

Antes de estudar o Django, e importante compreender a assinatura encontrada em
diversos Formulários do SUAP:

```python
def __init__(self, matriz, *args, **kwargs):
    super().__init__(*args, **kwargs)
```

Cada termo desse trecho possui uma função diferente.

#### Argumentos posicionais

São valores associados aos parâmetros pela posicao em que aparecem na chamada.
No exemplo real de `edu/views.py:1478`:

```python
form = ReplicacaoMatrizForm(matriz, data=request.POST or None)
```

`matriz` e um argumento posicional. Ele ocupa o primeiro parâmetro declarado
depois de `self` em `edu/forms.py:666`:

```python
def __init__(self, matriz, *args, **kwargs):
```

A ordem importa. Em uma função `f(a, b)`, a chamada `f(10, 20)` associa `10` a
`a` e `20` a `b`.

#### Argumentos nomeados

São valores enviados no formato `nome=valor`. No mesmo exemplo:

```python
data=request.POST or None
```

`data` e um argumento nomeado. A ordem entre argumentos nomeados normalmente não
importa, e o nome deixa explicita a finalidade do valor:

```python
form = MeuForm(
    data=request.POST or None,
    files=request.FILES or None,
    request=request,
    prefix='aluno',
)
```

#### `*args`

Na declaração de uma função, `*args` recebe argumentos posicionais adicionais e
os agrupa em uma tupla. O nome `args` e uma convenção; o asterisco e que produz
esse comportamento.

```python
def exemplo(*args):
    return args

exemplo(10, 20)  # (10, 20)
```

Nos forms do SUAP, seu uso mais comum e encaminhar para a classe-pai argumentos
que a classe atual não precisa interpretar. Em `edu/forms.py:666-667`:

```python
def __init__(self, matriz, *args, **kwargs):
    super().__init__(*args, **kwargs)
```

O formulário retira `matriz` para uso próprio e repassa os demais argumentos
posicionais ao construtor herdado do Django.

#### `**kwargs`

Na declaração, `**kwargs` recebe argumentos nomeados adicionais e os agrupa em um
dicionario. Novamente, `kwargs` e apenas o nome convencional; os dois asteriscos
definem o comportamento.

```python
def exemplo(**kwargs):
    return kwargs

exemplo(data='valor', prefix='aluno')
# {'data': 'valor', 'prefix': 'aluno'}
```

Na implementação real de `FormPlus`, em
`djtools/forms/__init__.py:59-62`, o SUAP consulta e remove um argumento antes de
repassar os demais ao Django:

```python
def __init__(self, *args, **kwargs):
    if 'request' in kwargs:
        self.request = kwargs.pop('request')
    super().__init__(*args, **kwargs)
```

`kwargs.pop('request')` tem duas funções: recupera o `request` e o remove do
dicionario, pois o construtor original de `django.forms.Form` não conhece esse
parâmetro.

#### `self`

`self` representa a instância atual da classe. Ele permite acessar dados e
métodos pertencentes especificamente ao formulário que está sendo processado.
Python fornece esse argumento automaticamente ao chamar um método:

```python
form.processar()
```

e equivalente, conceitualmente, a:

```python
ReplicacaoMatrizForm.processar(form)
```

No exemplo de `edu/forms.py:666-672`:

```python
self.matriz = matriz
self.fields['descricao'].initial = f'{self.matriz.descricao} [DUPLICADO]'
self.matriz.replicar(self.cleaned_data['descricao'])
```

- `self.matriz` guarda a matriz naquele formulário;
- `self.fields` contém os campos daquela instância;
- `self.cleaned_data` contém seus dados validados;
- `self.matriz.replicar(...)` chama a regra de negocio usando esses dados.

`self` não e palavra reservada, mas e a convenção universal do Python e deve ser
mantida.

#### Construtor e `__init__()`

Na linguagem cotidiana, `__init__()` e chamado de construtor. Tecnicamente,
`__new__()` cria o objeto e `__init__()` inicializa o objeto já criado. Para os
forms, o ponto importante e: `__init__()` e executado toda vez que a view cria
uma instância da classe.

Exemplo real em `edu/forms.py:513-516`:

```python
def __init__(self, aluno_id, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.instance.aluno_id = aluno_id
    self.fields['periodo_letivo'].choices = [['', '----']] + PERIODO_LETIVO_CHOICES
```

O construtor de `CadastrarMatriculaPeriodo` recebe um dado adicional,
inicializa o `ModelFormPlus`, associa o aluno a `self.instance` e altera as
opcoes de um campo. Esse e o local adequado para configurar campos dinamicamente
antes de o formulário ser exibido ou validado.

#### `super()`

`super()` permite chamar a implementação da classe pai (superclasse) a partir da classe filha. Em formulários, isso é importante porque a classe especializada precisa preservar a inicialização que o Django ou o SUAP já realizam antes de acrescentar regras próprias.

Neste exemplo, `CadastrarMatriculaPeriodo` herda de `forms.ModelFormPlus`:

```python
def __init__(self, aluno_id, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.instance.aluno_id = aluno_id
    self.fields['periodo_letivo'].choices = [['', '----']] + PERIODO_LETIVO_CHOICES
```

A chamada `super().__init__(*args, **kwargs)` executa o construtor da classe pai. Nesse momento, o formulário prepara seus campos, recebe os dados enviados, configura o estado `bound` ou `unbound` e inicializa a instância do model.

Depois dessa preparação, `self.instance.aluno_id = aluno_id` associa o formulário ao aluno recebido pela view. A classe filha pode então personalizar o campo `periodo_letivo` sem perder o comportamento padrão do `ModelFormPlus`.

A ordem das operações é importante:

1. `super().__init__()` prepara o formulário herdado;
2. `self.instance.aluno_id = aluno_id` define o aluno relacionado;
3. `self.fields[...]` ajusta as opções específicas da tela.

Em resumo, `super()` reaproveita a inicialização e os comportamentos da classe pai. A classe filha acrescenta apenas o que é específico da funcionalidade.

Sem essa chamada, `FormPlus` e `django.forms.Form` não preparariam corretamente
`fields`, `data`, `errors`, `initial`, `prefix` e o estado vinculado do form.

`super()` também e importante ao sobrescrever `clean()` ou `save()`:

```python
def clean(self):
    cleaned_data = super().clean()
    # validacoes adicionais
    return cleaned_data

def save(self, *args, **kwargs):
    # preparacao adicional
    return super().save(*args, **kwargs)
```

A chamada preserva o comportamento do Django e acrescenta apenas a regra
específica do SUAP.

Resumo da assinatura:

| Elemento | Significado |
|---|---|
| `self` | Instância atual do formulário |
| `matriz` | Argumento posicional exigido por essa classe |
| `*args` | Tupla com outros argumentos posicionais |
| `**kwargs` | Dicionario com outros argumentos nomeados |
| `__init__()` | Inicializa cada nova instância |
| `super()` | Continua a execução na hierarquia de herança |

### 2. Decoradores usados em formulários

Um decorador envolve uma classe ou função para alterar seu comportamento sem
reescrever seu corpo. Em Python, este código:

```python
@meu_decorador
def executar():
    pass
```

equivale conceitualmente a:

```python
def executar():
    pass

executar = meu_decorador(executar)
```

O decorador recebe a função original e devolve o objeto que ficara associado ao
mesmo nome. Alguns decoradores apenas mudam a forma de acesso ao método; outros
executam lógica antes e depois da função.

No `edu/forms.py`, dois exemplos importantes são `@staticmethod` e
`@transaction.atomic`.

#### `@staticmethod`

`staticmethod` pertence ao próprio Python. Não e do Django nem do SUAP. Ele
transforma uma função declarada dentro da classe em um método que não recebe
automaticamente `self` nem `cls`.

Comparação:

```python
class Exemplo:
    def metodo_instancia(self, valor):
        # recebe a instancia em self
        return self.ajustar(valor)

    @classmethod
    def metodo_classe(cls, valor):
        # recebe a classe em cls
        return cls(valor)

    @staticmethod
    def metodo_estatico(valor):
        # recebe somente os argumentos informados na chamada
        return valor.strip()
```

Um método estatico e adequado quando a operação:

- está conceitualmente relacionada a classe;
- não consulta nem altera dados de uma instância (`self`);
- não precisa consultar nem criar a classe por meio de `cls`;
- poderia ser uma função isolada, mas fica mais organizada dentro da classe.

##### Exemplo real: normalizacao de CPF

O código está em `edu/forms.py:13218-13251`. A classe `ExportarDadosPNP` possui o método:

```python
@staticmethod
def _cpf_to_digits(cpf_raw):
    cpf = (cpf_raw or '').strip()
    cpf = cpf.replace('.', '').replace('-', '').replace(' ', '')
    if not cpf:
        return None
    if len(cpf) < 11:
        cpf = cpf.zfill(11)
    if len(cpf) != 11 or not cpf.isdigit():
        raise forms.ValidationError(f'O CPF "{cpf_raw}" e invalido')
    return cpf
```

O método recebe somente `cpf_raw`. Ele não usa `self.fields`,
`self.cleaned_data`, `self.request` nem qualquer atributo da classe. Por isso,
`@staticmethod` comunica que a função e uma rotina auxiliar sem estado.

Ele pode ser chamado pela classe:

```python
cpf = ExportarDadosPNP._cpf_to_digits('057.740.865-85')
```

ou por uma instância:

```python
cpf = form._cpf_to_digits('057.740.865-85')
```

Em ambos os casos, Python não insere um primeiro argumento automaticamente. Sem
`@staticmethod`, uma chamada pela instância tentaria enviar `form` como primeiro
argumento e a assinatura deixaria de corresponder.

Outro exemplo está em `edu/forms.py:10196-10197`, no método
`processar_variaveis()`. Ele recebe todos os dados necessários como parâmetros e
não depende da instância do formulário.

#### `@transaction.atomic` e `@transaction.atomic()`

`transaction.atomic` pertence ao Django. Ele e importado em
`edu/forms.py:25`:

```python
from django.db import transaction
```

Seu objetivo e executar operações de banco dentro de uma transação atomica:

```text
todas as alteracoes terminam com sucesso -> COMMIT
alguma operacao levanta uma excecao      -> ROLLBACK
```

Sem a transação, uma rotina que salva cinco objetos poderia falhar no quarto e
deixar os tres primeiros gravados. Com `atomic`, o conjunto e tratado como uma
única unidade de trabalho.

O decorador funciona, de maneira conceitual, assim:

```python
def atomic(funcao):
    def envoltorio(*args, **kwargs):
        iniciar_transacao_ou_savepoint()
        try:
            resultado = funcao(*args, **kwargs)
            confirmar_transacao_ou_savepoint()
            return resultado
        except Exception:
            desfazer_transacao_ou_savepoint()
            raise
    return envoltorio
```

Essa e uma simplificacao didática. A implementação real do Django usa a classe
`Atomic`, conexoes de banco e savepoints para permitir inclusive transações
aninhadas.

As duas formas encontradas no EDU são validas:

```python
@transaction.atomic
def processar(self):
    ...

@transaction.atomic()
def save(self, *args, **kwargs):
    ...
```

- sem parenteses, a função decorada e entregue diretamente a `atomic`;
- com parenteses, `atomic()` cria primeiro o decorador e permite configurar
  argumentos como a conexão de banco;
- sem configuração adicional, o efeito prático das duas formas e o mesmo.

##### Exemplo real: `TurmaForm.save()`

O código está em `edu/forms.py:1091-1113`:

```python
class TurmaForm(forms.ModelFormPlus):
    @transaction.atomic()
    def save(self, *args, **kwargs):
        turma = super().save(*args, **kwargs)
        for diario in turma.diario_set.all():
            if diario.quantidade_vagas != turma.quantidade_vagas:
                diario.quantidade_vagas = turma.quantidade_vagas
                diario.save()
        return turma
```

O método realiza várias escritas:

1. salva a turma com `super().save()`;
2. percorre os diarios relacionados;
3. atualiza a quantidade de vagas de cada diario;
4. salva cada diario.

Se o terceiro diario falhar, o Django desfaz também o salvamento da turma e dos
diarios anteriores. Isso evita uma turma com quantidades de vagas divergentes.

##### Exemplo real: matricula de aluno

Em `edu/forms.py:2652-2664`, `EfetuarMatriculaForm.processar()` usa a outra
notacao:

```python
@transaction.atomic
def processar(self):
    pessoa_fisica = PessoaFisica()
    pessoa_fisica.cpf = self.cleaned_data['cpf']
    pessoa_fisica.nome_registro = self.cleaned_data['nome']
    pessoa_fisica.save()

    aluno = Aluno()
    aluno.pessoa_fisica = pessoa_fisica
    # preenchimento e salvamento de outros dados...
```

O fluxo cria uma pessoa fisica, um aluno e outros registros associados. Se a
criação do aluno falhar depois de a pessoa ter sido salva, a transação remove
também a pessoa criada, evitando um cadastro parcial.

Cuidados ao usar `atomic`:

- use-o quando várias escritas precisam formar uma única operação;
- não o adicione a consultas simples sem necessidade;
- mantenha o bloco curto para não prolongar bloqueios no banco;
- deixe a exceção sair do bloco atomico para o Django realizar o rollback;
- operações externas, como envio de e-mail ou gravação em outro servico, não são
  desfeitas pelo rollback do banco;
- `atomic` protege consistencia transacional, mas não substitui validação nem
  controle de permissão.

#### Decoradores empilhados

Quando ha mais de um decorador, a aplicação acontece de baixo para cima:

```python
@decorador_a
@decorador_b
def executar():
    pass
```

equivale a:

```python
executar = decorador_a(decorador_b(executar))
```

Essa ordem e importante em views com `@permission_required`, `@rtr` ou
`@documento`. Nos forms analisados aqui, `@transaction.atomic` envolve a
execução completa do método `save()` ou `processar()`.

### 3. `Form` x `FormPlus`

As duas classes representam Formulários **não vinculados automaticamente a um
model**. A diferença principal e a origem:

- `Form` pertence ao Django;
- `FormPlus` pertence ao DJTools/SUAP e herda de `Form`;
- portanto, `FormPlus` conserva o ciclo normal do Django e acrescenta apenas
  comportamentos específicos desta instalacao.

`requirements/base.txt:2`. No EDU, as duas classes aparecem no mesmo namespace
porque `edu/forms.py:49` importa:

```python
from djtools import forms
```

O modulo `djtools.forms`, em `djtools/forms/__init__.py:10-16`, importa e
reexporta os recursos do Django, alem de declarar os recursos `Plus`. Por isso:

```python
forms.Form       # django.forms.Form, reexportado pelo DJTools
forms.FormPlus   # djtools.forms.FormPlus
```

#### 3.1. O que é `Form`

`django.forms.Form` e a classe nativa para receber, converter, validar e
apresentar um conjunto de dados que o desenvolvedor declara explicitamente.
Ela nao depende de um model nem representa necessariamente uma tabela.

O exemplo desta seção pertence ao EDU, usa turmas e diários já existentes e
pode ser acessado pela própria tela de uma turma. Ele é um bom ponto de partida
porque não edita um registro nem possui `save()`: recebe opções, valida os
dados e gera estatísticas.

**Form real:** `edu/forms.py:13693-13703`

```python
class EstatisticaTurmaForm(forms.Form):
    SUBMIT_LABEL = 'Exibir Estatística'

    etapas = forms.MultipleChoiceField(
        choices=[
            [1, '1ª Etapa'],
            [2, '2ª Etapa'],
            [3, '3ª Etapa'],
            [4, '4ª Etapa'],
            [5, 'Final'],
        ],
        label='',
        widget=forms.CheckboxSelectMultiplePlus(),
    )

    diarios = forms.MultipleModelChoiceField(
        Diario.objects.none(),
        label='',
        widget=forms.CheckboxSelectMultiplePlus(),
    )

    abreviar = forms.BooleanField(
        label='Abreviar',
        help_text='Exibir a sigla do componente ao invés da descrição completa do diário.',
        required=False,
    )

    fieldsets = (
        ('Etapas', {'fields': ('etapas',)}),
        ('Diários', {'fields': ('diarios',)}),
        ('Exibição', {'fields': ('abreviar',)}),
    )
```

O form possui três campos:

- `etapas`: permite selecionar uma ou mais etapas;
- `diarios`: permite selecionar um ou mais diários da turma;
- `abreviar`: representa uma opção booleana de exibição.

Esse exemplo permite observar, em uma única classe, `MultipleChoiceField`,
`MultipleModelChoiceField`, `BooleanField`, widgets, `fieldsets` e o uso de
`cleaned_data` depois da validação.

### Como o form chega à tela

Para abrir a funcionalidade, acesse `/admin/edu/turma/`, escolha uma turma
regular que possua matriz e diários e clique em **Estatística da Turma** na
tela da turma. O acesso direto também é possível:

```text
/edu/turma_estatistica/<pk_da_turma>/
```

A rota está em `edu/urls.py:28`:

```python
path(
    'turma_estatistica/<str:turma_pk>/',
    views.turma_estatistica,
)
```

A view está em `edu/views.py:13166-13186`:

```python
@rtr()
@login_required()
def turma_estatistica(request, turma_pk):
    turma = get_object_or_404(Turma, pk=turma_pk)
    title = f'Estatística da Turma {turma.codigo}'

    form = EstatisticaTurmaForm(data=request.POST or None)

    # O campo começa vazio e recebe os diários da turma.
    form.fields['diarios'].queryset = turma.diario_set.all()

    if form.is_valid():
        etapas = form.cleaned_data['etapas']
        diarios = form.cleaned_data['diarios']
        abreviar = form.cleaned_data['abreviar']

        # Geração das estatísticas e dos gráficos.

    return locals()
```

O template `edu/templates/turma_estatistica.html:11-16` renderiza o form e só
exibe os gráficos depois que existem etapas selecionadas:

```django
{% block content %}
    {% render_form form %}

    {% if etapas %}
        ...
    {% endif %}
{% endblock %}
```

### Como testar

1. Abra `/admin/edu/turma/`.
2. Escolha uma turma com matriz e diários.
3. Clique em **Estatística da Turma**.
4. Selecione uma etapa e um ou mais diários.
5. Clique em **Exibir Estatística**.

A tela deverá gerar os gráficos com os dados da turma. Mesmo sem notas
registradas, o formulário e o fluxo completo podem ser observados.

##### 3.1.1. Exemplo real: Estatistica da Turma

O primeiro exemplo é o `EstatisticaTurmaForm`. Ele foi escolhido porque:

- pertence ao modulo EDU;
- herda diretamente de `forms.Form`;
- possui poucos campos e nao esta ligado automaticamente a um model;
- usa turmas e diarios, dados centrais do modulo;
- pode ser aberto a partir da propria tela de uma turma;
- apenas consulta dados e gera graficos, sem salvar alteracoes no banco.

O fluxo que sera acompanhado e:

```text
Tela da turma
    |
    v
Botao Estatistica da Turma
    |
    v
URL /edu/turma_estatistica/<turma_pk>/
    |
    v
View turma_estatistica
    |
    v
EstatisticaTurmaForm
    |
    v
Template turma_estatistica.html
    |
    v
Graficos calculados com os diarios selecionados
```

###### Etapa 1 - Abrir uma turma com dados

O ponto de partida é a listagem administrativa de turmas:

```text
/admin/edu/turma/
```

Escolha uma turma regular que possua:

- matriz vinculada;
- pelo menos um diario;
- alunos matriculados nos diarios;
- preferencialmente notas registradas, para tornar os graficos mais visiveis.

Ao abrir a turma, o endereco tera este formato:

```text
/edu/turma/<pk>/
```

Na parte superior da tela existe o botao **Estatistica da Turma**. Ele e
declarado em `edu/templates/turma.html:8-15`:

```django
<ul class="action-bar">
    <li>
        <a class="btn default"
           href="/edu/turma_estatistica/{{ obj.pk }}/">
            Estatistica da Turma
        </a>
    </li>
</ul>
```

O template usa `obj.pk` para incluir a chave primaria da turma no endereco.
Por exemplo, para uma turma de chave `120`, o link produzido sera:

```text
/edu/turma_estatistica/120/
```

###### Etapa 2 - Identificar a URL

A rota da tela esta em `edu/urls.py:28`:

```python
path(
    'turma_estatistica/<str:turma_pk>/',
    views.turma_estatistica,
)
```

Leitura da rota:

| Trecho | Funcao |
|---|---|
| `turma_estatistica/` | Parte fixa do endereco |
| `<str:turma_pk>` | Captura a identificacao da turma como string |
| `views.turma_estatistica` | Funcao executada quando a URL e acessada |

O prefixo `/edu/` e acrescentado pelo carregamento das URLs do modulo. Portanto,
o endereco completo e:

```text
/edu/turma_estatistica/<turma_pk>/
```

###### Etapa 3 - Abrir o form

**Arquivo:** `edu/forms.py`  
**Linhas:** `13693-13703`

```python
class EstatisticaTurmaForm(forms.Form):

    SUBMIT_LABEL = 'Exibir Estatistica'

    etapas = forms.MultipleChoiceField(
        choices=[
            [1, '1a Etapa'],
            [2, '2a Etapa'],
            [3, '3a Etapa'],
            [4, '4a Etapa'],
            [5, 'Final'],
        ],
        label='',
        widget=forms.CheckboxSelectMultiplePlus(),
    )

    diarios = forms.MultipleModelChoiceField(
        Diario.objects.none(),
        label='',
        widget=forms.CheckboxSelectMultiplePlus(),
    )

    abreviar = forms.BooleanField(
        label='Abreviar',
        help_text=(
            'Exibir "sigla" do componente ao inves da descricao '
            'completa do diario.'
        ),
        required=False,
    )

    fieldsets = (
        ('Etapas', {'fields': ('etapas',)}),
        ('Diarios', {'fields': ('diarios',)}),
        ('Exibicao', {'fields': ('abreviar',)}),
    )
```

O trecho foi reorganizado em varias linhas para facilitar a leitura, mas
preserva o comportamento encontrado no codigo.

###### Etapa 4 - Entender a classe-base

```python
class EstatisticaTurmaForm(forms.Form):
```

`forms.Form` e a classe nativa do Django reexportada por `djtools.forms`. Isso
significa que:

- os campos precisam ser declarados explicitamente;
- o formulario nao esta vinculado automaticamente ao model `Turma`;
- ele nao recebe `instance`;
- ele nao possui `save()` para gravar um model;
- depois da validacao, os valores ficam em `cleaned_data`;
- a view decide como utilizar os valores selecionados.

O objetivo desse form nao e editar a turma. Ele apenas recebe as opcoes usadas
para calcular uma estatistica.

###### Etapa 5 - Entender os tres campos

| Campo | Classe | Origem | Resultado validado |
|---|---|---|---|
| `etapas` | `MultipleChoiceField` | Django | Lista das etapas selecionadas |
| `diarios` | `MultipleModelChoiceField` | Django | `QuerySet` com os diarios selecionados |
| `abreviar` | `BooleanField` | Django | `True` ou `False` |

**Campo `etapas`**

```python
etapas = forms.MultipleChoiceField(
    choices=[
        [1, '1a Etapa'],
        [2, '2a Etapa'],
        [3, '3a Etapa'],
        [4, '4a Etapa'],
        [5, 'Final'],
    ],
    label='',
    widget=forms.CheckboxSelectMultiplePlus(),
)
```

`MultipleChoiceField` permite selecionar varias opcoes. Cada item de `choices`
possui o formato:

```python
[valor_enviado, texto_apresentado]
```

O widget `CheckboxSelectMultiplePlus` pertence ao DJTools e apresenta as opcoes
como caixas de selecao seguindo a interface do SUAP.

**Campo `diarios`**

```python
diarios = forms.MultipleModelChoiceField(
    Diario.objects.none(),
    label='',
    widget=forms.CheckboxSelectMultiplePlus(),
)
```

`MultipleModelChoiceField` recebe chaves de registros e, durante a validacao,
transforma a selecao em objetos `Diario`.

O queryset inicial e `Diario.objects.none()`, ou seja, comeca vazio. Essa e uma
medida importante: o form nao deve listar todos os diarios do sistema. A view
substitui esse queryset apenas pelos diarios da turma acessada.

**Campo `abreviar`**

```python
abreviar = forms.BooleanField(
    label='Abreviar',
    required=False,
)
```

Esse campo controla somente a apresentacao dos nomes dos componentes nos
graficos:

- marcado: utiliza a sigla;
- desmarcado: utiliza sigla e descricao;
- `required=False`: o formulario continua valido quando ele nao e marcado.

###### Etapa 6 - Entender as customizacoes visuais

```python
SUBMIT_LABEL = 'Exibir Estatistica'
```

`SUBMIT_LABEL` nao pertence ao `Form` nativo. A camada de renderizacao do SUAP
usa esse atributo como texto do botao de submissao.

```python
fieldsets = (
    ('Etapas', {'fields': ('etapas',)}),
    ('Diarios', {'fields': ('diarios',)}),
    ('Exibicao', {'fields': ('abreviar',)}),
)
```

`fieldsets` tambem e uma convencao utilizada pelo DJTools. Ele organiza os tres
campos em grupos visuais, mas nao altera sua validacao.

Esse exemplo mostra que uma classe pode herdar do `Form` nativo e, ao mesmo
tempo, usar widgets e convencoes visuais do SUAP:

```text
Classe-base                 -> Django Form
Campos                      -> Django
CheckboxSelectMultiplePlus  -> DJTools
SUBMIT_LABEL e fieldsets    -> convencoes do SUAP/DJTools
```

###### Etapa 7 - Ler a view

**Arquivo:** `edu/views.py`  
**Inicio da view:** `13166`

O trecho inicial, responsavel pelo formulario, esta em
`edu/views.py:13166-13186`:

```python
@rtr()
@login_required()
def turma_estatistica(request, turma_pk):
    turma = get_object_or_404(Turma, pk=turma_pk)
    title = f'Estatistica da Turma {turma.codigo}'

    media = turma.matriz.estrutura.media_aprovacao_sem_prova_final
    media_final = (
        50
        if turma.pertence_ao_plano_retomada
        else turma.matriz.estrutura.media_aprovacao_avaliacao_final
    )

    # Dicionarios utilizados posteriormente na geracao dos graficos.
    etapa_acima = {1: [], 2: [], 3: [], 4: [], 5: []}
    etapa_abaixo = {1: [], 2: [], 3: [], 4: [], 5: []}

    form = EstatisticaTurmaForm(data=request.POST or None)

    form.fields['diarios'].queryset = turma.diario_set.all()

    if form.is_valid():
        etapas = form.cleaned_data['etapas']
        diarios = form.cleaned_data['diarios']
        abreviar = form.cleaned_data['abreviar']

        # A view calcula os dados dos graficos para cada diario.
        for diario in diarios:
            ...

    return locals()
```

O exemplo acima e uma versao reduzida e comentada da view. O processamento
completo dos graficos continua nas linhas seguintes de `edu/views.py`.

###### Etapa 8 - Compreender a view linha a linha

```python
@rtr()
```

Renderiza automaticamente `turma_estatistica.html`, pois a view devolve
`locals()`.

```python
@login_required()
```

Exige um usuario autenticado. A view nao pode ser acessada anonimamente.

```python
def turma_estatistica(request, turma_pk):
```

Recebe o `request` e o valor capturado por `<str:turma_pk>` na URL.

```python
turma = get_object_or_404(Turma, pk=turma_pk)
```

Busca a turma. Se a chave nao existir, o Django devolve a resposta 404.

```python
form = EstatisticaTurmaForm(data=request.POST or None)
```

Cria o formulario em dois estados:

- primeiro acesso por GET: `request.POST` esta vazio, `data=None` e o form fica
  `unbound`;
- envio do formulario por POST: o form recebe os dados e fica `bound`.

```python
form.fields['diarios'].queryset = turma.diario_set.all()
```

Substitui o queryset vazio declarado no form pelos diarios pertencentes aquela
turma. Essa linha precisa ser executada antes de `is_valid()`, pois o Django
somente aceita escolhas presentes no queryset do campo.

```python
if form.is_valid():
```

Converte e valida os tres campos. Como o formulario nao e um `ModelForm`, essa
validacao nao cria nem altera objetos automaticamente.

```python
etapas = form.cleaned_data['etapas']
diarios = form.cleaned_data['diarios']
abreviar = form.cleaned_data['abreviar']
```

Le os valores convertidos e validados. A view usa esses dados para calcular as
estatisticas e preparar os graficos.

###### Etapa 9 - Abrir o template

**Arquivo:** `edu/templates/turma_estatistica.html`  
**Linhas iniciais:** `1-16`

```django
{% extends super_template %}

{% block extrahead %}
    <script src="/static/djtools/graficos/highcharts.js"></script>
    <script src="/static/djtools/graficos/exporting.js"></script>
{% endblock %}

{% block content %}
    {% render_form form %}

    {% if etapas %}
        <div id="containeralunos"></div>
        <div id="containermedia"></div>
        {# Configuracao dos graficos... #}
    {% endif %}
{% endblock %}
```

Leitura do template:

- `{% extends super_template %}` herda a estrutura visual do SUAP;
- `extrahead` carrega a biblioteca usada nos graficos;
- `{% render_form form %}` apresenta os campos conforme `fieldsets`;
- `{% if etapas %}` impede a exibicao dos graficos antes da submissao valida;
- os dados preparados pela view alimentam os graficos nas linhas seguintes.

###### Etapa 10 - Testar o fluxo

1. Abra `/admin/edu/turma/`.
2. Escolha uma turma com matriz e diarios.
3. Na tela `/edu/turma/<pk>/`, clique em **Estatistica da Turma**.
4. Confira os grupos `Etapas`, `Diarios` e `Exibicao`.
5. Selecione pelo menos uma etapa.
6. Selecione pelo menos um diario.
7. Marque e desmarque `Abreviar` para comparar os rotulos.
8. Clique em **Exibir Estatistica**.
9. Confira que a pagina continua na mesma URL e apresenta os graficos.
10. Retorne ao codigo e relacione cada escolha com `cleaned_data`.

Se os graficos aparecerem sem valores relevantes, escolha uma turma que possua
notas lancadas. Isso nao impede o acompanhamento do form, mas torna o resultado
visual mais claro.

###### Sintese do exemplo

```text
O form declara e valida as opcoes.
A view escolhe os diarios permitidos e calcula os dados.
O template renderiza o form e apresenta os graficos.
Nenhum registro e salvo pelo formulario.
```

Cada atributo que e uma instancia de `Field` transforma-se em um campo do
formulario. Ao receber dados, o form:

1. guarda os valores enviados em `data` e `files`;
2. converte cada entrada para o tipo Python adequado;
3. executa validadores e metodos `clean_<campo>()`;
4. executa `clean()` para validacoes entre campos;
5. disponibiliza valores validos em `cleaned_data`;
6. disponibiliza falhas em `errors`.

`Form` nao implementa persistencia automatica. Se os dados precisarem gerar
uma consulta, arquivo, e-mail ou gravacao, o codigo deve executar essa acao
explicitamente depois de `is_valid()`.

#### 3.2. Exemplo real de `Form` no EDU

`ListarDiarioMatriculaAlunoForm`, em `edu/forms.py:7097-7131`, herda diretamente
de `forms.Form`. Trecho reduzido para destacar a estrutura:

```python
class ListarDiarioMatriculaAlunoForm(forms.Form):
    METHOD = 'GET'
    SUBMIT_LABEL = 'Listar Diarios'

    diretoria = forms.ModelChoiceField(
        Diretoria.objects.none(),
        required=True,
    )
    componente = forms.ModelChoiceFieldPlus(
        Componente.objects,
        required=False,
    )
    # O codigo real tambem declara outros_componentes, outras_matrizes
    # e ignorar_futuros nas linhas 7105-7109.

    def __init__(self, matricula_periodo, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.matricula_periodo = matricula_periodo
        self.fields['diretoria'].queryset = Diretoria.objects.filter(
            setor__uo_id=(
                matricula_periodo.aluno.curso_campus.diretoria.setor.uo.pk
            )
        )

    def clean(self):
        if self.matricula_periodo.situacao.pk not in [
            SituacaoMatriculaPeriodo.MATRICULADO,
            SituacaoMatriculaPeriodo.EM_ABERTO,
        ]:
            raise forms.ValidationError(
                'A situacao do aluno no periodo deve permitir matricula.'
            )
        return self.cleaned_data

    def processar(self):
        return self.matricula_periodo.aluno.get_diarios_disponiveis_matricular_por_diretoria(
            self.cleaned_data.get('diretoria'),
            self.cleaned_data.get('outros_componentes'),
            self.cleaned_data.get('outras_matrizes'),
            self.cleaned_data.get('ignorar_futuros'),
            self.cleaned_data.get('componente'),
        )
```

A view utiliza esse form em `edu/views.py:8710-8715`:

```python
form = ListarDiarioMatriculaAlunoForm(
    matricula_periodo,
    request.GET or None,
)

if form.is_valid():
    diarios = form.processar()
```

Leitura do exemplo:

- `matricula_periodo` e um argumento adicional criado pelo próprio form;
- `super().__init__()` entrega `request.GET` ao construtor do Django;
- `clean()` aplica uma regra entre o estado da matricula e a operação;
- `processar()` não e um método nativo do Django: e uma convenção criada nessa
  classe para executar o caso de uso depois da validação;
- o campo `ModelChoiceFieldPlus` pode ser usado em um `Form` comum. Campo
  `Plus` e classe `FormPlus` são recursos independentes.

OUTRO EXEMPLO
#### 3.4. O que ? `FormPlus`

`FormPlus` e a especializacao criada pelo **DJTools/SUAP** para formularios
comuns do Django. Ele nao pertence ao Django. Sua classe-base continua sendo
`django.forms.Form`, portanto ele preserva todo o ciclo normal de declaracao de
campos, estado bound/unbound, conversao, validacao e `cleaned_data`.

Sua composicao pode ser resumida assim:

```text
django.forms.Form
        +
request opcional em self.request
        +
MetaFormPlus para customizacao por LPS
        =
djtools.forms.FormPlus
```

O `FormPlus` e indicado quando o formulario nao representa diretamente um
model, mas precisa participar das convencoes do SUAP e, principalmente, quando
precisa conhecer a requisicao atual. Com `self.request`, o form pode consultar
o usuario autenticado, suas permissoes, a sessao ou outros dados da requisicao.

Ele **nao ganha `save()` automaticamente**. Assim como `forms.Form`, um
`FormPlus` somente tera `save()` se o proprio desenvolvedor implementar esse
metodo. Para formularios ligados automaticamente a um model, a classe adequada
e `ModelFormPlus`, estudada na proxima secao.

##### 3.4.1. Onde o `FormPlus` e implementado

**Arquivo:** `djtools/forms/__init__.py`  
**Linhas:** `54-62`

Esta e a implementacao completa da classe:

```python
class FormPlus(forms.Form, metaclass=MetaFormPlus):
    """
    Torna o ``request`` disponível no ``FormPlus`` através de
    ``self.request`` quando passado como parêmetro no inicialização.
    """

    def __init__(self, *args, **kwargs):
        if 'request' in kwargs:
            self.request = kwargs.pop('request')
        super().__init__(*args, **kwargs)
```

Embora a classe tenha poucas linhas, ela combina o comportamento do Django com
dois pontos de extensao do SUAP. A mesma implementacao, agora comentada:

```python
# Continua sendo um Form do Django. MetaFormPlus substitui a metaclasse
# padrao para acrescentar a possibilidade de customizacao por LPS.
class FormPlus(forms.Form, metaclass=MetaFormPlus):

    def __init__(self, *args, **kwargs):
        # request nao e aceito pelo construtor de django.forms.Form.
        if 'request' in kwargs:
            # pop() remove o argumento de kwargs e guarda a requisicao
            # na instancia atual do formulario.
            self.request = kwargs.pop('request')

        # O Django recebe somente os argumentos que conhece, como
        # data, files, initial e prefix.
        super().__init__(*args, **kwargs)
```

Passo a passo de uma instanciacao:

```python
form = MeuFiltroForm(
    data=request.GET or None,
    request=request,
)
```

```text
1. request chega dentro de kwargs
2. FormPlus remove request com pop()
3. a requisicao fica disponivel em self.request
4. super().__init__() entrega data ao Form do Django
5. o Django configura campos, initial e estado bound/unbound
```

O `pop()` e necessario porque o construtor do `Form` do Django nao possui um
parametro chamado `request`. Se esse valor fosse repassado ao Django, seria
gerado um `TypeError`. A chamada a `super()` tambem e indispensavel, pois e ela
que prepara os campos e o ciclo de validacao.

Atencao: se a view nao passar `request`, essa implementacao nao cria
`self.request`. Um form que acessa esse atributo deve ser sempre instanciado com
`request=request` ou tratar sua ausencia com `getattr()`/`hasattr()`.

##### 3.4.2. O que continua vindo do Django

O `FormPlus` herda de `forms.Form` os principais recursos usados no dia a dia:

| Recurso | Origem | Funcao |
|---|---|---|
| `fields` | Django | Dicionario com os campos da instancia do form |
| `data` e `files` | Django | Dados brutos recebidos da requisicao |
| `initial` | Django | Valores iniciais apresentados na tela |
| `is_bound` | Django | Informa se o form recebeu dados |
| `is_valid()` | Django | Dispara conversao e validacao e informa o resultado |
| `errors` | Django | Armazena os erros encontrados |
| `cleaned_data` | Django | Armazena os valores convertidos e validados |
| `clean_<campo>()` | Django | Ponto de validacao de um campo especifico |
| `clean()` | Django | Ponto de validacao conjunta dos campos |
| `self.request` | DJTools/SUAP | Disponibiliza a requisicao, se ela for passada pela view |
| `MetaFormPlus` | DJTools/SUAP | Permite sobreposicao da classe por LPS |

Por isso, a validacao de um `FormPlus` segue exatamente a ordem estudada para
`Form`:

```text
valor bruto
-> to_python()
-> validate()
-> run_validators()
-> clean_<campo>()
-> clean()
-> cleaned_data ou errors
```

##### 3.4.3. Como funciona `MetaFormPlus`

`MetaFormPlus` esta em `djtools/lps.py:67-86` e herda da propria
`DeclarativeFieldsMetaclass` do Django. Quando `settings.LPS` esta configurado,
ela procura uma classe de mesmo nome em:

```text
<aplicativo>/lps/<LPS_ATIVA>/forms.py
```

Se encontrar, copia seus atributos para a classe criada. A verificacao da LPS
ativa esta em `djtools/lps.py:112-117`. Sem LPS ativa ou sem classe
correspondente, o form conserva sua implementacao principal.

Isso ocorre na criacao da **classe**, e nao a cada chamada de `is_valid()`.

##### 3.4.4. Exemplo real 1: `RelatorioHorarioForm`

O primeiro exemplo mostra um `FormPlus` usado como filtro de consulta. Ele e
adequado para uma leitura inicial porque pode ser aberto diretamente pelo
menu, utiliza dados comuns do EDU e nao altera registros no banco.

O fluxo e:

```text
Ensino > Relatorios > Listagem de Horarios
    -> /edu/relatorio_horario/
    -> view relatorio_horario
    -> RelatorioHorarioForm
    -> template relatorio_horario.html
    -> tabela de horarios
```

###### Etapa 1 - Acessar a tela

1. Entrar com um usuario que possua `edu.view_horarioauladiario`.
2. Abrir **Ensino > Relatorios > Listagem de Horarios**.
3. Como alternativa, acessar diretamente `/edu/relatorio_horario/`.

O item de menu esta em `edu/menu.yaml:554-557`. Alem de informar o endereco,
ele declara a permissao exigida para apresentar a opcao no menu:

```yaml
Ensino::Relatorios::Listagem de Horarios:
  permissions_required:
  - edu.view_horarioauladiario
  url: /edu/relatorio_horario/
```

###### Etapa 2 - Encontrar a URL

**Arquivo:** `edu/urls.py`  
**Linha:** `134`

```python
path('relatorio_horario/', views.relatorio_horario)
```

A rota nao recebe identificador. Os filtros sao enviados depois de `?` e ficam
disponiveis em `request.GET`, por exemplo:

```text
/edu/relatorio_horario/ano_letivo=2026&periodo_letivo=1&turma=120
```

###### Etapa 3 - Abrir e entender o form

**Arquivo:** `edu/forms.py`  
**Linhas:** `4456-4503`

Trecho reorganizado e comentado para leitura:

```python
class RelatorioHorarioForm(forms.FormPlus):
    # O renderizador do SUAP enviara os filtros pela query string.
    METHOD = 'GET'
    SUBMIT_LABEL = 'Pesquisar'

    turma = forms.ModelChoiceFieldPlus(
        Turma.objects,
        label='Turma',
        required=False,
    )
    professor = forms.ModelChoiceFieldPlus(
        Professor.objects,
        label='Professor',
        required=False,
    )
    sala = forms.ModelChoiceFieldPlus(Sala.ativas, required=False)
    ano_letivo = forms.ModelChoiceField(
        Ano.objects.ultimos(),
        label='Ano Letivo',
        required=True,
    )
    periodo_letivo = forms.ChoiceField(
        choices=PERIODO_LETIVO_CHOICES,
        label='Periodo Letivo',
        required=True,
    )

    def __init__(self, user, *args, **kwargs):
        # Inicializa o FormPlus e, por heranca, o Form do Django.
        super().__init__(*args, **kwargs)

        # Restringe as salas ao campus do usuario recebido da view.
        self.fields['sala'].queryset = (
            self.fields['sala'].queryset
            .filter(ativa=True, predio__uo=get_uo(user))
        )

    def clean(self):
        professor = self.cleaned_data['professor']
        turma = self.cleaned_data['turma']
        sala = self.cleaned_data['sala']

        # Exige pelo menos um criterio principal de pesquisa.
        if not (professor or turma or sala):
            raise forms.ValidationError(
                'Informe turma, professor ou sala.'
            )

        # O codigo real, nas linhas 4481-4499, monta o QuerySet de
        # HorarioAulaDiario e registra os filtros usados na pesquisa.
        self.qs = HorarioAulaDiario.objects.all()
        # ... aplicacao dos filtros ...

        return self.cleaned_data

    def processar(self):
        # Metodo criado pela classe; nao pertence ao Django nem ao FormPlus.
        return self.qs
```

Pontos importantes:

- a classe herda de `FormPlus`, mas nao utiliza `self.request`;
- ela declara `user` como parametro personalizado e a view o fornece como
  argumento nomeado, porque o autor escolheu passar apenas o usuario necessario
  para restringir as salas;
- `user` nao e um parametro nativo do Django nem do `FormPlus`;
- `super().__init__(*args, **kwargs)` repassa os dados para o ciclo normal;
- `clean()` valida os filtros e prepara `self.qs`;
- `processar()` devolve o `QuerySet` somente depois de `is_valid()`.

Esse exemplo mostra que `FormPlus` pode ser usado como um `Form` comum. O
argumento `request=request` e um recurso disponivel, mas nao obrigatorio.

###### Etapa 4 - Acompanhar a view

**Arquivo:** `edu/views.py`  
**Linhas:** `6334-6373`

```python
@rtr()
@permission_required('edu.view_horarioauladiario')
def relatorio_horario(request):
    title = 'Listagem de Horarios'

    form = RelatorioHorarioForm(
        data=request.GET or None,
        user=request.user,
    )

    if form.is_valid():
        horarios = form.processar()

        # A view transforma os horarios em uma TabelaHorario.
        tabelas = TabelasHorario(request=request)
        tabela = TabelaHorario(export_to_pdf=True, request=request)
        # ... montagem da tabela ...

        if request.GET.get('pdf'):
            return tabelas.as_pdf()

    return locals()
```

No primeiro acesso, `request.GET` esta vazio e `request.GET or None` entrega
`None`; o form fica unbound. Depois da pesquisa, o form fica bound, executa a
validacao e produz a listagem.

###### Etapa 5 - Relacionar com o template

**Arquivo:** `edu/templates/relatorio_horario.html`  
**Linhas:** `1-36`

```django
{% extends super_template %}
{% block content %}
    <div id="formbox">
        {% render_form form %}
    </div>

    {% if form.is_valid %}
        {% box "Resultado da Pesquisa ({{ horarios.count }} horarios)" %}
            {% if horarios %}
                {{ tabela }}
            {% else %}
                <p class="msg alert">Nenhum horario encontrado.</p>
            {% endif %}
        {% endbox %}
    {% endif %}
{% endblock %}
```

`{% render_form form %}` interpreta os campos e as convencoes do SUAP. Quando o
form e valido, `horarios` e `tabela`, criados pela view, ficam disponiveis no
template por causa de `return locals()`.

##### 3.4.5. Exemplo real 2: `AtualizarEmailAlunoForm`

O segundo exemplo evidencia o principal diferencial do `FormPlus`: o acesso a
`self.request`. A classe usa o usuario autenticado para decidir dinamicamente
quais campos de e-mail podem ser editados.

O fluxo completo e:

```text
Tela do aluno
    -> Editar > E-mail
    -> /edu/atualizar_email_secundario/<aluno_pk>/
    -> view atualizar_email
    -> AtualizarEmailAlunoForm
    -> template padrao do @rtr
    -> validacao e save() proprio
```

###### Etapa 1 - Acessar a tela

1. Abrir `/admin/edu/aluno/` e escolher um aluno.
2. Na tela `/edu/aluno/<matricula>/`, abrir o menu **Editar**.
3. Clicar em **E-mail**.

Como esse fluxo grava dados, durante o estudo, deve-se apenas inspecionar a tela ou
utilizar um aluno de teste em ambiente de desenvolvimento/homologacao.

O link esta em `edu/templates/aluno.html:39-47`:

```django
{% if pode_alterar_email or eh_auxiliar_secretaria_academica %}
    <li>
        <a class="popup"
           href="/edu/atualizar_email_secundario/{{ obj.pk }}/">
            E-mail
        </a>
    </li>
{% endif %}
```

O valor usado na URL e `obj.pk`, a chave primaria de `Aluno`, e nao o texto da
matricula. O item somente aparece para quem satisfaz a regra
`pode_alterar_email` ou pertence ao grupo **Auxiliar de Secretaria Academica**.
A view repete a verificacao, portanto ocultar o link nao e a unica protecao.

###### Etapa 2 - Encontrar a URL e a view

**Arquivo:** `edu/urls.py`  
**Linha:** `459`

```python
path('atualizar_email_secundario/<int:pk>/', views.atualizar_email)
```

**Arquivo:** `edu/views.py`  
**Linhas:** `14091-14103`

```python
@rtr()
@login_required()
def atualizar_email(request, pk):
    title = 'Atualizacao do E-mail'

    # pk veio da URL e identifica o Aluno.
    aluno = Aluno.locals.filter(pk=pk).first()

    eh_auxiliar_secretaria_academica = request.user.has_group_cached(
        'Auxiliar de Secretaria Academica'
    )

    # Protecao de backend para impedir acesso direto sem autorizacao.
    if (
        not eh_auxiliar_secretaria_academica
        and not perms.pode_alterar_email(request, aluno)
    ):
        raise PermissionDenied()

    # data e argumento do Django; request e tratado pelo FormPlus;
    # aluno e argumento criado pelo formulario concreto.
    form = AtualizarEmailAlunoForm(
        request.POST or None,
        request=request,
        aluno=aluno,
    )

    if form.is_valid():
        # Este save() foi implementado em AtualizarEmailAlunoForm.
        form.save()
        return httprr('..', 'E-mail atualizado com sucesso.')

    return locals()
```

Aqui existem tres origens de argumentos:

| Argumento | Quem trata | Finalidade |
|---|---|---|
| `request.POST or None` | `django.forms.Form` | Dados enviados e estado bound/unbound |
| `request=request` | `FormPlus` | Cria `self.request` |
| `aluno=aluno` | `AtualizarEmailAlunoForm` | Cria `self.aluno` |

###### Etapa 3 - Entender o construtor e os campos dinamicos

**Arquivo:** `edu/forms.py`  
**Linhas:** `13128-13152`

```python
class AtualizarEmailAlunoForm(forms.FormPlus):
    email_secundario = forms.EmailField(
        max_length=255,
        required=False,
        label='E-mail Secundario',
    )
    email_academico = forms.EmailField(
        max_length=255,
        required=False,
        label='E-mail Academico',
    )
    email_google_classroom = forms.EmailField(
        max_length=255,
        required=False,
        label='E-mail Google ClassRoom',
    )

    def __init__(self, *args, **kwargs):
        # aluno e um argumento exclusivo desta classe.
        self.aluno = kwargs.pop('aluno')

        # FormPlus retira request de kwargs, cria self.request e chama
        # o construtor do Form do Django.
        super().__init__(*args, **kwargs)

        # O codigo real garante que o aluno tenha um vinculo antes de
        # acessar a pessoa relacionada ao e-mail secundario.
        if self.aluno.get_vinculo() is None:
            self.aluno.save()

        # Preenche os valores iniciais com os dados atuais do aluno.
        self.fields['email_secundario'].initial = (
            self.aluno.get_vinculo().pessoa.email_secundario
        )
        self.fields['email_academico'].initial = self.aluno.email_academico
        self.fields['email_google_classroom'].initial = (
            self.aluno.email_google_classroom
        )

        # Usa self.request.user, fornecido pelo FormPlus, para consultar
        # grupo e permissoes do usuario atual.
        cra = UsuarioGrupo.objects.filter(
            user=self.request.user,
            group__name='Coordenador de Registros Academicos',
            setores__uo=self.aluno.curso_campus.diretoria.setor.uo_id,
        ).exists()

        # A instancia do formulario e personalizada para o usuario atual.
        if (
            not self.request.user.has_perm(
                'rh.pode_editar_email_secundario_aluno'
            )
            and not cra
        ):
            del self.fields['email_secundario']

        if not self.request.user.has_perm('rh.pode_editar_email_academico'):
            del self.fields['email_academico']

        if not self.request.user.has_perm(
            'rh.pode_editar_email_google_classroom'
        ):
            del self.fields['email_google_classroom']
```

O ponto central e que `self.fields` pertence a instancia atual do form. Remover
um campo nesse dicionario altera somente o formulario criado para aquela
requisicao. Assim, dois usuarios com permissoes diferentes podem abrir a mesma
URL e receber conjuntos de campos diferentes.

> Ocultar o campo e importante para a interface, mas a autorizacao principal
> continua na view. Formulario dinamico e verificacao de acesso cumprem papeis
> complementares.

###### Etapa 4 - Validacao e `save()` proprio

As validacoes estao em `edu/forms.py:13154-13188`. A classe implementa um
`clean_<campo>()` para cada tipo de e-mail. Entre as regras aplicadas estao:

- impedir e-mail institucional onde a configuracao exige e-mail pessoal;
- impedir e-mail academico ja usado por outro aluno ou servidor;
- consultar a lista de e-mails bloqueados;
- verificar duplicidade no LDAP quando a integracao esta ativa;
- impedir duplicidade do e-mail do Google Classroom.

Depois da validacao, a view chama `form.save()`. Esse metodo existe porque foi
criado pela propria classe em `edu/forms.py:13190-13197`:

```python
def save(self):
    if 'email_academico' in self.cleaned_data:
        self.aluno.email_academico = self.cleaned_data.get(
            'email_academico'
        )

    if 'email_google_classroom' in self.cleaned_data:
        self.aluno.email_google_classroom = self.cleaned_data.get(
            'email_google_classroom'
        )

    self.aluno.save()

    if 'email_secundario' in self.cleaned_data:
        Pessoa.objects.filter(
            pk=self.aluno.get_vinculo().pessoa.id
        ).update(
            email_secundario=self.cleaned_data.get('email_secundario')
        )
```

O teste `'campo' in self.cleaned_data` e necessario porque campos sem permissao
foram removidos em `__init__()` e, portanto, nao participam da validacao. O
metodo atualiza dados em dois locais: e-mails academicos em `Aluno` e o e-mail
secundario na pessoa relacionada.

Este `save()` nao e o `save()` automatico de um `ModelForm`. Trata-se de um
metodo comum, escrito especificamente para coordenar essa operacao.

###### Etapa 5 - Descobrir o template usado

Nao existe `edu/templates/atualizar_email.html`. Como `@rtr()` nao recebeu um
template e nao encontrou o arquivo deduzido pelo nome da view, o DJTools usa o
template generico `djtools/templates/default.html`, conforme
`djtools/utils/response.py:115-145`.

O trecho responsavel por apresentar o formulario esta em
`djtools/templates/default.html:12-18`:

```django
{% if h1 or form.TITLE %}
    <h2>{{ h1 }}{{ form.TITLE }}</h2>
{% endif %}

{% if form %}
    {% render_form form %}
{% endif %}
```

Essa convencao permite que uma tela simples use apenas URL, view e form. Um
template especifico continua sendo necessario quando a pagina precisa exibir
informacoes ou organizacao alem do formulario padrao.

###### Etapa 6 - Fluxo do `request` neste exemplo

```text
view recebe HttpRequest
-> passa request=request ao AtualizarEmailAlunoForm
-> AtualizarEmailAlunoForm remove aluno de kwargs
-> super() entra em FormPlus
-> FormPlus remove request de kwargs
-> request fica disponivel em self.request
-> super() entra no Form do Django com request.POST
-> __init__ consulta self.request.user e remove campos sem permissao
-> is_valid() valida somente os campos presentes
-> save() grava somente valores existentes em cleaned_data
```

##### 3.4.6. Diferencas principais entre `Form` e `FormPlus`

| Aspecto | `Form` | `FormPlus` |
|---|---|---|
| Origem | Django | DJTools/SUAP |
| Classe-base | `BaseForm` | `django.forms.Form` |
| Declaracao manual de campos | Sim | Sim, por heranca |
| Estado bound/unbound | Sim | Sim, por heranca |
| `is_valid()`, `errors` e `cleaned_data` | Sim | Sim, por heranca |
| `clean_<campo>()` e `clean()` | Sim | Sim, por heranca |
| Recebe `request=request` diretamente | Nao | Sim |
| Disponibiliza `self.request` | Nao | Sim, se o argumento for passado |
| Suporte a customizacao LPS | Nao | Sim, por `MetaFormPlus` |
| `save()` automatico | Nao | Nao |
| Ligacao automatica com model | Nao | Nao |

##### 3.4.7. O que nao e exclusivo de `FormPlus`

Na base do SUAP aparecem atributos e metodos como:

```python
METHOD = 'GET'
SUBMIT_LABEL = 'Pesquisar'
fieldsets = (...)

def processar(self):
    ...
```

Eles nao estao implementados nas oito linhas de `FormPlus`:

- `METHOD`, `SUBMIT_LABEL` e `fieldsets` sao convencoes consumidas pela camada
  de renderizacao do SUAP;
- `processar()` e um metodo definido por cada form ou classe-base especifica;
- campos como `CharFieldPlus`, `ModelChoiceFieldPlus` e widgets do DJTools
  podem ser usados tanto em `Form` quanto em `FormPlus`.

Portanto, a presenca da palavra `Plus` em um campo nao exige que a classe seja
`FormPlus`.

##### 3.4.8. Qual classe escolher

Usar `Form` quando:

- o formulario e independente de model;
- os recursos padrao do Django sao suficientes;
- nao sera necessario passar `request` nem aplicar customizacao LPS.

Usar `FormPlus` quando:

- o formulario e independente de um unico model;
- precisa acessar usuario, sessao ou dados da requisicao por `self.request`;
- precisa participar do mecanismo de LPS;
- o padrao local do fluxo ja utiliza `FormPlus`.

Usar `ModelFormPlus`, e nao uma dessas duas classes, quando o objetivo principal
for criar ou editar uma instancia de model com `instance` e `form.save()`.

Resumo:

```text
FormPlus = Form do Django + request opcional + metaclasse de LPS
```

Ele nao substitui o Django; ele reutiliza o Django e acrescenta dois pontos de
integracao necessarios ao SUAP.

#### 3.5. Como funciona `MetaFormPlus`

Uma **metaclasse** é uma classe responsável por criar outras classes. Enquanto o método `__init__()` prepara uma instância de formulário, a metaclasse atua antes disso: ela participa da criação da própria classe, quando o Python executa a declaração `class`.

No SUAP, `MetaFormPlus` é a metaclasse usada por `FormPlus` para permitir customizações por LPS. Sua implementação está em `djtools/lps.py:67-86`; a verificação da LPS ativa ocorre em `djtools/lps.py:112-117`.

Quando o Python encontra uma classe como:

```python
class MeuFiltroForm(forms.FormPlus):
    nome = forms.CharField()
```

o processo pode ser entendido assim:

```text
Python começa a criar MeuFiltroForm
        |
MetaFormPlus.__new__() é executada
        |
settings.LPS está preenchido?
        |
Não -> a classe original continua sem alteração
        |
Sim -> procura <app>/lps/<LPS_ATIVA>/forms.py
        |
Existe uma classe com o mesmo nome?
        |
Não -> mantém MeuFiltroForm original
        |
Sim -> copia atributos e métodos da variante LPS
        |
Django conclui a criação da classe e coleta os campos declarados
```

A procura usa o módulo da classe original. Se `MeuFiltroForm` estiver em `edu/forms.py` e a configuração for:

```python
LPS = 'campus_demo'
```

o SUAP poderá procurar uma variante em:

```text
edu/lps/campus_demo/forms.py
```

Essa variante precisa declarar uma classe com o mesmo nome:

```python
# edu/forms.py
class MeuFiltroForm(forms.FormPlus):
    nome = forms.CharField(label='Nome')
```

```python
# edu/lps/campus_demo/forms.py
class MeuFiltroForm:
    nome = forms.CharField(label='Nome completo')
    campo_extra = forms.CharField(required=False)
```

Com a LPS `campus_demo` ativa, os atributos da segunda classe são incorporados durante a criação de `MeuFiltroForm`. O formulário final passa a usar o rótulo `Nome completo` e pode receber `campo_extra`, sem que o arquivo principal precise conhecer essa instalação específica.

O ponto mais importante é o momento em que isso acontece:

- a metaclasse atua quando a classe do formulário é criada, normalmente durante a importação do módulo;
- ela não é executada a cada instanciação do formulário;
- ela não é chamada por `is_valid()`;
- depois da criação, o formulário continua seguindo o ciclo normal do Django: `__init__()`, campos, validação e, quando aplicável, `save()`.

Sem LPS ativa, sem o arquivo da variante ou sem uma classe com o mesmo nome, o formulário original é mantido. A customização deve conter apenas a diferença necessária, porque uma alteração de assinatura ou a remoção de atributos esperados pode afetar as views que instanciam o formulário.

Resumo do mecanismo:

```text
FormPlus + MetaFormPlus
        |
criação da classe do formulário
        |
consulta da configuração settings.LPS
        |
possível carregamento da classe equivalente na pasta lps
        |
classe final usada pelas views e pelo admin
```

#### 3.6. Exemplo real de `FormPlus` com `request`

`IniciarSessaoAssinaturaSenhaForm`, em `edu/forms.py:13761-13768`, usa o
usuário autenticado para validar a senha:

```python
class IniciarSessaoAssinaturaSenhaForm(forms.FormPlus):
    senha = forms.CharField(
        label='Senha do SUAP',
        widget=forms.PasswordInput,
        required=True,
    )

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data and not auth.authenticate(
            username=self.request.user.username,
            password=cleaned_data['senha'],
        ):
            raise forms.ValidationError('A senha nao confere.')
        return cleaned_data
```

A view passa a requisição em `edu/views.py:14508-14518`:

```python
form = IniciarSessaoAssinaturaSenhaForm(
    data=request.POST or None,
    request=request,
)

if form.is_valid():
    assinatura.assinar()
```

Fluxo do `request`:

```text
view possui request
-> passa request=request ao FormPlus
-> FormPlus remove request de kwargs
-> grava o objeto em self.request
-> clean() consulta self.request.user
-> super().__init__() recebe somente argumentos aceitos pelo Django
```

#### 3.7. Diferenças principais

| Aspecto | `Form` | `FormPlus` |
|---|---|---|
| Origem | Django | DJTools/SUAP |
| Classe-base | `BaseForm` | `django.forms.Form` |
| Declaração manual de campos | Sim | Sim, por herança |
| Estado bound/unbound | Sim | Sim, por herança |
| `is_valid()`, `errors` e `cleaned_data` | Sim | Sim, por herança |
| `clean_<campo>()` e `clean()` | Sim | Sim, por herança |
| Recebe `request=request` diretamente | Não | Sim |
| Disponibiliza `self.request` | Não | Sim, se o argumento for passado |
| Suporte a customizacao LPS | Não | Sim, por `MetaFormPlus` |
| `save()` automático | Não | Não |
| Ligacao automática com model | Não | Não |

#### 3.8. O que não e exclusivo de `FormPlus`

Na base do SUAP aparecem atributos e métodos como:

```python
METHOD = 'GET'
SUBMIT_LABEL = 'Pesquisar'
fieldsets = (...)

def processar(self):
    ...
```

Eles não estão implementados nas oito linhas de `FormPlus`:

- `METHOD`, `SUBMIT_LABEL` e `fieldsets` são convencoes consumidas pela camada
  de renderizacao do SUAP;
- `processar()` e um método definido por cada form ou classe-base específica;
- campos como `CharFieldPlus`, `ModelChoiceFieldPlus` e widgets do DJTools
  podem ser usados tanto em `Form` quanto em `FormPlus`.

Portanto, a presenca da palavra `Plus` em um campo não exige que a classe seja
`FormPlus`.

#### 3.9. Qual classe escolher

Usar `Form` quando:

- o formulário e independente de model;
- os recursos padrão do Django são suficientes;
- não será necessário passar `request` nem aplicar customizacao LPS.

Usar `FormPlus` quando:

- o formulário e independente de um único model;
- precisa acessar usuário, sessao ou dados da requisição por `self.request`;
- precisa participar do mecanismo de LPS;
- o padrão local do fluxo já utiliza `FormPlus`.

Usar `ModelFormPlus`, e não uma dessas duas classes, quando o objetivo principal
for criar ou editar uma instância de model com `instance` e `form.save()`.

Resumo:

```text
FormPlus = Form do Django + request opcional + metaclasse de LPS
```

Ele não substitui o Django; ele reutiliza o Django e acrescenta dois pontos de
integracao necessários ao SUAP.

### 4. `ModelForm` x `ModelFormPlus`

Os dois tipos representam Formulários ligados a um model. Eles podem gerar
campos a partir do model, validar os dados e criar ou alterar uma instância no
banco. A diferença principal e a origem:

```text
ModelForm     = recurso nativo do Django
ModelFormPlus = ModelForm do Django + request opcional + suporte a LPS
```

> Ponto-chave: `instance`, `is_valid()`, `save()`, `commit=False` e
> `save_m2m()` não foram criados pelo SUAP. Esses recursos já pertencem ao
> `ModelForm` do Django e são herdados pelo `ModelFormPlus`.

#### 4.1. O que e `ModelForm`

`ModelForm` e uma classe nativa do Django destinada a Formulários que criam ou
alteram registros de um model. Em vez de declarar manualmente todos os campos,
o desenvolvedor informa o model e os campos permitidos na classe interna
`Meta`:

```python
from django import forms


class AlunoForm(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = ('numero_rg', 'uf_emissao_rg', 'orgao_emissao_rg')
```

Nesse exemplo, o Django consulta os campos de `Aluno` e cria os campos do
formulário com tipo, rotulo, obrigatoriedade e validadores compativeis.

O `ModelForm` e apropriado quando:

- os dados do formulário representam campos de um model;
- o resultado deve criar ou atualizar uma instância;
- as validacoes declaradas no model também devem participar do fluxo;
- o salvamento pode ser feito diretamente com `form.save()`.

Ele não elimina a necessidade da view. A view continua responsável por obter a
instância correta, verificar permissões, passar os dados recebidos e decidir o
que acontece depois do salvamento.

#### 4.2. Onde o `ModelForm` e implementado

O SUAP desta instalacao usa Django 4.1.5, conforme
`requirements/base.txt:2`. Na implementação dessa versao:

- `django/forms/models.py:258-336`: `ModelFormMetaclass` interpreta `Meta` e
  gera os campos do formulário;
- `django/forms/models.py:339-557`: `BaseModelForm` implementa `instance`,
  validação relacionada ao model e salvamento;
- `django/forms/models.py:559-560`: `ModelForm` combina `BaseModelForm` com
  `ModelFormMetaclass`.

A declaração original de `ModelForm` e pequena porque o comportamento está na
classe-base e na metaclasse:

```python
class ModelForm(BaseModelForm, metaclass=ModelFormMetaclass):
    pass
```

Fluxo simplificado:

```text
class Meta
   |
   v
ModelFormMetaclass cria os campos
   |
   v
BaseModelForm recebe data e instance
   |
   v
is_valid() valida form e model
   |
   v
save() persiste a instance
```

#### 4.3. O papel da classe `Meta`

Em um `ModelFormPlus`, a classe interna `Meta` funciona como a configuração do formulário. Ela informa ao Django qual model está relacionado ao form e quais partes desse model poderão aparecer na tela ou ser alteradas.

A classe `Meta` não representa um registro do banco e não cria uma nova tabela. Ela é lida durante a criação da classe do formulário. A partir dessas configurações, o Django monta os campos, associa cada campo ao atributo correspondente do model e aplica opções de apresentação e validação.

Pense na relação desta forma:

- o model define todos os dados possíveis da entidade;
- a classe `Meta` escolhe quais desses dados participarão deste formulário;
- o `ModelFormPlus` transforma essa escolha em campos, regras e comportamento de edição.

Exemplo básico:

```python
class AlterarPlanoEnsinoForm(forms.ModelFormPlus):
    class Meta:
        model = PlanoEnsino
        fields = ('coordenador_curso', 'ementa')
```

Nesse exemplo, o formulário está ligado ao model `PlanoEnsino`, mas expõe apenas `coordenador_curso` e `ementa`. Outros atributos do model, como identificadores, datas ou campos de controle, não serão criados automaticamente no formulário.

A configuração também pode personalizar a apresentação dos campos:

```python
class AlunoForm(forms.ModelFormPlus):
    class Meta:
        model = Aluno
        fields = ('nome', 'data_nascimento')
        labels = {
            'nome': 'Nome completo',
            'data_nascimento': 'Data de nascimento',
        }
        help_texts = {
            'nome': 'Informe o nome exatamente como consta no documento.',
        }
```

Aqui, `labels` altera o texto exibido ao participante e `help_texts` acrescenta uma orientação ao campo. Essas opções mudam a apresentação sem alterar os campos do model.

Os atributos mais usados são:

| Atributo | Função |
|---|---|
| `model` | Informa qual classe de model será criada ou alterada |
| `fields` | Define explicitamente quais campos podem ser enviados pelo form |
| `exclude` | Exclui determinados campos; deve ser usado com cuidado |
| `widgets` | Substitui os widgets padrão gerados para campos do model |
| `labels` | Personaliza os rotulos |
| `help_texts` | Personaliza os textos de ajuda |
| `error_messages` | Personaliza mensagens de erro |

Prefira `fields` com uma lista ou tupla explicita. Isso deixa claro quais dados
podem ser alterados e evita expor, por engano, um novo campo sensivel que venha
a ser adicionado ao model.

```python
# Tupla com um item: a virgula e obrigatoria.
fields = ('coordenador_curso',)
```

No código real, `edu/forms.py:14168-14171` usa a forma equivalente
`fields = 'coordenador_curso',`. A virgula transforma o valor em uma tupla;
sem ela, o valor seria apenas uma string.

#### 4.4. Como funciona `instance`

Em um `ModelFormPlus`, `instance` é o objeto do model que o formulário representa. Ele informa ao Django qual registro deve ser editado. O mesmo formulário pode ser usado para criar um registro novo ou alterar um registro existente.

A decisão depende da presença de `instance`:

- sem `instance`, o formulário prepara uma nova instância do model e `save()` normalmente executa um `INSERT`;
- com `instance`, o formulário mantém a identidade do objeto recebido e `save()` normalmente executa um `UPDATE`;
- o valor de `pk` da instância permite ao Django localizar o registro que será atualizado.

#### Criando um novo registro

Quando a tela cadastra um objeto, o formulário recebe os dados enviados, mas não recebe uma instância existente:

```python
form = PlanoEnsinoForm(data=request.POST or None)

if form.is_valid():
    plano = form.save()  # cria um novo registro (INSERT)
```

Nesse caso, `form.instance` começa como uma instância nova de `PlanoEnsino`, ainda sem `pk`. Depois de `save()`, o banco cria a linha e o Django atualiza a instância com o identificador gerado.

#### Editando um registro existente

Na edição, a view primeiro busca o objeto e depois o entrega ao formulário:

```python
plano = get_object_or_404(PlanoEnsino, pk=pk)
form = PlanoEnsinoForm(
    data=request.POST or None,
    instance=plano,
)

if form.is_valid():
    plano = form.save()  # altera o registro existente (UPDATE)
```

Como o formulário conhece a instância e seu `pk`, ele altera os campos permitidos de `plano`. Ele não cria outro Plano de Ensino para a mesma operação.

O fluxo completo de uma edição:

```text
URL recebe o pk
        |
view busca o objeto com get_object_or_404()
        |
form recebe instance=objeto
        |
form.is_valid() valida os dados
        |
form.save() atualiza a mesma linha
```

#### `instance` não é o mesmo que `initial`

`instance` define o objeto que será alterado e mantém sua identidade no banco. Já `initial` apenas fornece valores iniciais para a apresentação do formulário; ele não vincula o form a um registro e não determina um `UPDATE`.

```python
form = AlunoForm(
    initial={'nome': 'Nome sugerido'},
)

# O formulário ainda não está editando um objeto específico.
```

Para editar um aluno, é necessário fornecer a instância:

```python
aluno = get_object_or_404(Aluno, pk=pk)
form = AlunoForm(instance=aluno)
```

Na implementação do Django, isso ocorre em
`django/forms/models.py:340-384`: se `instance` for `None`, o formulário cria
`opts.model()`; caso contrário, armazena a instância recebida em
`self.instance`.
#### 4.5. O que `is_valid()` faz em um `ModelForm`

Em um `ModelForm`, `is_valid()` executa as validacoes comuns de um form e uma
etapa adicional ligada ao model:

1. converte o valor de cada campo com `to_python()`;
2. executa `validate()` e os validadores do campo;
3. executa os métodos `clean_<campo>()` existentes;
4. executa `clean()` do formulário;
5. transfere os valores validados para `self.instance`;
6. executa `self.instance.full_clean()`, respeitando as exclusões calculadas;
7. valida restricoes de unicidade do model.

As etapas ligadas ao model aparecem em
`django/forms/models.py:431-509`, especialmente em `_post_clean()` e
`validate_unique()`.

Somente depois de `is_valid()` retornar `True` deve-se usar:

```python
form.cleaned_data
form.save()
```

`save()` não substitui a validação. Se houver erros, o Django impede o
salvamento e levanta `ValueError`.

#### 4.6. `save()`, `save(commit=False)` e `save_m2m()`

Esses tres recursos são implementados pelo Django em
`django/forms/models.py:511-554`.

##### `form.save()`

Salva a instância imediatamente e, depois, salva os relacionamentos
many-to-many do formulário:

```python
if form.is_valid():
    obj = form.save()
```

##### `form.save(commit=False)`

Monta e devolve a instância, mas ainda não executa `obj.save()`. Serve para
preencher dados que não vieram do formulário ou executar uma regra antes de
persistir:

```python
if form.is_valid():
    obj = form.save(commit=False)
    obj.usuario = request.user
    obj.save()
```

##### `form.save_m2m()`

Com `commit=False`, o Django não pode salvar imediatamente campos
many-to-many, porque a instância precisa primeiro possuir uma chave primaria.
Quando o formulário tem campos desse tipo, o fluxo completo e:

```python
if form.is_valid():
    obj = form.save(commit=False)
    obj.usuario = request.user
    obj.save()
    form.save_m2m()
```

> Não chame `save_m2m()` antes de `obj.save()`: uma relação many-to-many
> precisa da chave primaria do objeto salvo.

#### 4.7. Exemplo real de `ModelForm` no EDU

O formulário `RequisitosComponenteCurricularForm`, em
`edu/forms.py:807-842`, herda diretamente do `ModelForm` nativo:

```python
class RequisitosComponenteCurricularForm(forms.ModelForm):
    SUBMIT_LABEL = 'Salvar'

    pre_requisitos = forms.MultipleModelChoiceField(
        ComponenteCurricular.objects,
        required=False,
    )
    co_requisitos = forms.MultipleModelChoiceField(
        ComponenteCurricular.objects,
        required=False,
    )

    class Meta:
        model = ComponenteCurricular
        fields = (
            'pre_requisitos',
            'co_requisitos',
            'componente_curricular_associado',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance.periodo_letivo:
            self.fields['pre_requisitos'].queryset = (
                ComponenteCurricular.objects.filter(
                    periodo_letivo__lt=self.instance.periodo_letivo,
                    matriz=self.instance.matriz,
                )
            )
```

Leitura do exemplo:

- `forms.ModelForm` confirma que a classe usa o recurso nativo do Django;
- `Meta.model` liga o formulário a `ComponenteCurricular`;
- `Meta.fields` limita quais relacionamentos podem ser alterados;
- os campos foram redeclarados para personalizar widget, rotulo e queryset;
- `self.instance` permite filtrar os componentes conforme o objeto editado;
- `super().__init__()` precisa ser chamado antes de acessar `self.fields` e
  `self.instance`.

A view correspondente está em `edu/views.py:1518-1527`:

```python
@permission_required('edu.add_componentecurricular')
@rtr()
def definir_requisitos(request, pk):
    title = 'Definir Pre e Co-requisitos'

    # Busca a instancia que sera editada.
    instance = get_object_or_404(ComponenteCurricular, pk=pk)

    # GET: formulario unbound. POST: formulario bound.
    # instance informa que se trata de uma alteracao.
    form = RequisitosComponenteCurricularForm(
        request.POST or None,
        instance=instance,
    )

    # Converte e valida campos, form e model.
    if form.is_valid():
        # Atualiza a instancia e os relacionamentos do formulario.
        form.save()
        return httprr('..', 'Requisitos definidos com sucesso.')

    return locals()
```

Esse exemplo também mostra que atributos utilizados pela camada visual do
SUAP, como `SUBMIT_LABEL` e `fieldsets`, podem existir em um `ModelForm`
comum. Eles não são, por si sos, recursos exclusivos de `ModelFormPlus`.

#### 4.8. O que e `ModelFormPlus`

`ModelFormPlus` não e nativo do Django. Ele e implementado pelo DJTools, a
camada de ferramentas do SUAP, e herda de `django.forms.ModelForm`.

Ele preserva todo o comportamento explicado anteriormente e acrescenta:

1. recebimento opcional de `request=request`;
2. acesso ao request por `self.request` dentro do formulário;
3. metaclasse `MetaModelFormPlus`, usada nas customizacoes LPS.

Portanto:

```text
ModelFormPlus
   |
   +-- tudo que ModelForm ja faz
   +-- self.request, quando a view enviar request=request
   +-- integracao com o mecanismo LPS do SUAP
```

#### 4.9. Implementação completa do `ModelFormPlus`

**Arquivo:** `djtools/forms/__init__.py`  
**Linhas:** `65-74`

A implementação abaixo mostra cada parte do código e sua responsabilidade.

A mesma implementação, comentada linha a linha:

```python
# Herda o ModelForm do Django e troca sua metaclasse pela extensao do SUAP.
class ModelFormPlus(forms.ModelForm, metaclass=MetaModelFormPlus):

    # Aceita os mesmos argumentos posicionais e nomeados do ModelForm.
    def __init__(self, *args, **kwargs):

        # O request e uma extensao opcional do DJTools.
        if 'request' in kwargs:

            # Remove request de kwargs, pois o ModelForm nativo nao reconhece
            # esse argumento, e o disponibiliza para os metodos desta classe.
            self.request = kwargs.pop('request')

        # Entrega os demais argumentos ao ModelForm do Django.
        # Aqui sao preparados data, files, instance, initial e os campos.
        super().__init__(*args, **kwargs)
```

| Trecho | Responsabilidade |
|---|---|
| `forms.ModelForm` | Campos do model, validação, `instance` e salvamento |
| `MetaModelFormPlus` | Mantem a metaclasse do Django e aplica extensoes LPS |
| `*args` | Recebe argumentos posicionais, como `data` |
| `**kwargs` | Recebe argumentos nomeados, como `instance` e `request` |
| `kwargs.pop('request')` | Retira o argumento desconhecido pelo Django |
| `self.request` | Disponibiliza usuário, sessao e outros dados da requisição |
| `super().__init__()` | Inicializa efetivamente o `ModelForm` nativo |

O uso de `request` e opcional. Se a view não enviar `request=request`, a classe
base não cria `self.request`; portanto, um formulário que dependa desse atributo
deve sempre ser instanciado corretamente pela view.

#### 4.10. Como funciona `MetaModelFormPlus`

**Arquivo:** `djtools/lps.py`  
**Linhas:** `89-109`

`MetaModelFormPlus` herda de `ModelFormMetaclass`, a metaclasse nativa do
Django. Isso e importante porque a geração automática dos campos continua
funcionando. Antes de concluir a criação da classe, ela verifica se existe uma
customizacao LPS ativa e procura uma classe de mesmo nome em:

```text
<aplicacao>.lps.<LPS>.forms
```

Fluxo resumido:

```text
SUAP carrega uma classe ModelFormPlus
   |
   v
MetaModelFormPlus verifica settings.LPS
   |
   +-- sem LPS: cria a classe normalmente
   |
   +-- com LPS: procura uma classe de mesmo nome no pacote LPS
                    |
                    v
             incorpora seus atributos
   |
   v
ModelFormMetaclass gera os campos ligados ao model
```

Essa extensao permite adaptar determinados Formulários para uma instalacao sem
alterar diretamente a classe principal. O desenvolvedor não precisa chamar a
metaclasse: basta herdar de `forms.ModelFormPlus`.

#### 4.11. Exemplo real de `ModelFormPlus` usando `request`

`AulaForm`, em `edu/forms.py:1270-1306`, usa `ModelFormPlus` porque sua
configuração depende do usuário autenticado:

```python
class AulaForm(forms.ModelFormPlus):
    professor_diario = forms.ModelChoiceField(
        queryset=ProfessorDiario.objects,
        label='Professor',
        required=True,
    )

    class Meta:
        model = Aula
        exclude = ()

    def __init__(self, diario, etapa, *args, **kwargs):
        # ModelFormPlus captura request e depois inicializa o ModelForm.
        super().__init__(*args, **kwargs)

        self.diario = diario
        self.etapa = etapa

        # self.request foi disponibilizado pelo ModelFormPlus.
        outro_professor_editando = (
            self.instance.pk
            and self.instance.professor_diario.professor.vinculo.user
            != self.request.user
        )

        if outro_professor_editando:
            outros_professores_qs = self.diario.professordiario_set.exclude(
                professor=self.instance.professor_diario.professor,
            )
        else:
            outros_professores_qs = self.diario.professordiario_set.exclude(
                professor__vinculo__user=self.request.user,
            )
```

Nesse caso, `self.request.user` participa da definicao das opcoes que o usuário
pode selecionar. Um `ModelForm` nativo não aceitaria `request` sem que o próprio
formulário implementasse essa captura.

A view envia o argumento em `edu/views.py:3934-3954`. Abaixo está um trecho
reduzido, preservando as partes necessárias para estudar o formulário:

```python
@permission_required('edu.add_aula')
@rtr()
def adicionar_aula_diario(request, diario_pk, etapa, aula_pk=None):
    diario = get_object_or_404(Diario.locals, pk=diario_pk)

    if aula_pk:
        aula = get_object_or_404(Aula, pk=aula_pk)

    form = AulaForm(
        diario,
        etapa,
        data=request.POST or None,
        instance=aula_pk and aula or None,
        request=request,
    )

    if form.is_valid():
        obj = form.save(False)
        obj.save()
        return httprr('..', 'Aula cadastrada/atualizada com sucesso.')

    return locals()
```

Observe os papeis dos argumentos:

- `diario` e `etapa` são argumentos posicionais definidos por `AulaForm`;
- `data`, `instance` e `request` são argumentos nomeados;
- `request` e retirado pelo `ModelFormPlus` e vira `self.request`;
- `data` e `instance` seguem para o `ModelForm` nativo;
- `form.save(False)` equivale a `form.save(commit=False)`.

O exemplo manipula manualmente o relacionamento
`outros_professor_diario` depois de salvar a aula. Em um fluxo genérico com
campos many-to-many administrados diretamente pelo `ModelForm`, seria
necessário chamar `form.save_m2m()` após `obj.save()`.

#### 4.12. Exemplo real simples de edição

Em `edu/forms.py:14168-14171`, o formulário declara apenas o model e o campo:

A implementação comentada apresenta cada parte do código.

Em `edu/views.py:14728-14737`, a view fornece a instância existente. O trecho
abaixo simplifica apenas o filtro de busca do objeto para destacar o fluxo do
formulário:

```python
@login_required()
@rtr()
def alterar_coordenador_plano_ensino(request, pk):
    title = 'Alterar Coordenador de Curso'
    obj = get_object_or_404(PlanoEnsino, pk=pk)

    form = AlterarCoordenadorPlanoEnsinoForm(
        data=request.POST or None,
        instance=obj,
    )

    if form.is_valid():
        form.save()
        return httprr('..', 'Acao realizada com sucesso.')

    return locals()
```

Embora a classe herde de `ModelFormPlus`, essa view não envia `request` porque
o formulário não precisa de `self.request`. Os recursos usados nesse caso -
campos gerados do model, `instance`, validação e `save()` - são todos herdados
do `ModelForm` do Django.

#### 4.13. Comparação direta

| Aspecto | `ModelForm` | `ModelFormPlus` |
|---|---|---|
| Origem | Django | DJTools/SUAP |
| Ligacao com model | Sim | Sim, por herança |
| Campos gerados por `Meta` | Sim | Sim, por herança |
| Validação do model | Sim | Sim, por herança |
| `instance` | Sim | Sim, por herança |
| `save()` | Sim | Sim, por herança |
| `commit=False` e `save_m2m()` | Sim | Sim, por herança |
| Aceita `request=request` | Não diretamente | Sim |
| Disponibiliza `self.request` | Não diretamente | Sim, se enviado |
| Integracao com LPS | Não | Sim |
| Exige template específico | Não | Não |

#### 4.14. Qual deles usar

Use `ModelForm` quando quiser apenas o comportamento padrão do Django e o
formulário não depender de `request` nem de customizacao LPS.

Use `ModelFormPlus` quando o formulário ligado a model:

- precisar consultar `request.user` ou outro dado da requisição;
- puder receber customizacoes por LPS;
- estiver em uma area do SUAP que adota `ModelFormPlus` como padrão local.

Antes de escolher, observe os Formulários próximos no mesmo modulo. No SUAP, a
consistencia com o fluxo existente costuma ser mais importante do que trocar
uma classe apenas por ela ter o sufixo `Plus`.

Resumo final:

```text
ModelFormPlus = ModelForm do Django + request opcional + metaclasse de LPS
```

### 5. Admin e fluxos personalizados

Não existem duas familias obrigatoriamente separadas chamadas "AdminForm" e
"Form personalizado". A principal diferença está em **quem coordena o
formulário**:

- no admin, `ModelAdmin` ou `ModelAdminPlus` cria a URL, instância o form,
  verifica permissões, renderiza a página e executa o salvamento;
- em um fluxo personalizado, o desenvolvedor declara URL, view, template,
  permissões, validação, processamento e resposta.

Tanto o admin quanto uma view personalizada podem usar `ModelForm`,
`ModelFormPlus` ou, em alguns cenarios, outros tipos de form. Portanto, o tipo da
classe não determina sozinho onde ela será utilizada.

#### O admin do Django e o `ModelAdminPlus`

O Django fornece `django.contrib.admin.ModelAdmin`. O SUAP acrescenta
`djtools.contrib.admin.ModelAdminPlus`, definido em
`djtools/contrib/admin/options/__init__.py:87-90`:

```python
class ModelAdminPlus(admin.ModelAdmin, metaclass=MetaModelAdminPlus):
    """
    O ModelAdminPlus foi criado para dar mais funcionalidades ao ModelAdmin.
    """
```

Além do comportamento normal do admin, o `ModelAdminPlus` oferece recursos do
SUAP, como icones de listagem, abas, exportacoes e integracao com LPS. Em
`djtools/contrib/admin/options/__init__.py:392-409`, seu `get_form()` também
disponibiliza o `request` na classe do formulário:

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

Isso permite que um form utilizado pelo admin consulte usuário e contexto sem a
view precisar instância-lo manualmente.

#### Exemplo de form administrado: `MatrizForm`

O código está em `edu/forms.py:7762-7789`:

```python
class MatrizForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['configuracao_creditos_especiais'].queryset = (
            ConfiguracaoCreditosEspeciais.objects.filter(ativo=True)
        )

    class Meta:
        model = Matriz
        exclude = ()

    def clean(self):
        try:
            ch_complementares = int(
                self.cleaned_data.get('ch_atividades_complementares', 0)
            )
            ch_aprofundamento = int(
                self.cleaned_data.get('ch_atividades_aprofundamento', 0)
            )
        except Exception:
            raise forms.ValidationError('Cargas horarias invalidas.')

        configuracao_academica = self.cleaned_data.get(
            'configuracao_atividade_academica'
        )
        configuracao_aprofundamento = self.cleaned_data.get(
            'configuracao_atividade_aprofundamento'
        )

        if ch_complementares > 0 and not configuracao_academica:
            raise forms.ValidationError(
                'Selecione a configuracao de AACC.'
            )
        if ch_aprofundamento > 0 and not configuracao_aprofundamento:
            raise forms.ValidationError(
                'Selecione a configuracao de ATPA.'
            )

        return self.cleaned_data
```

Explicação:

- herda de `forms.ModelForm`, a classe nativa do Django;
- `Meta.model = Matriz` informa qual model será criado ou alterado;
- `exclude = ()` não exclui campos editaveis do model;
- `__init__()` limita uma lista a configuracoes de creditos ativas;
- `clean()` valida a coerencia entre cargas horarias e configuracoes;
- o `save()` herdado do `ModelForm` realiza a persistência.

O form e conectado ao admin em `edu/admin.py:692-705`:

```python
class MatrizAdmin(ModelAdminPlus):
    list_display = ('id', 'descricao', 'nivel_ensino', 'ativo', 'get_diretorias')
    list_filter = (
        CustomTabListFilter,
        'ano_criacao',
        'ativo',
        'nivel_ensino',
        'estrutura',
    )
    search_fields = ('id', 'descricao')
    list_per_page = 15
    form = MatrizForm

    fieldsets = (
        ('Dados Gerais', {'fields': ('descricao', 'nivel_ensino', 'ativo')}),
        # demais grupos de campos...
    )
```

Cada atributo cuida de uma parte da interface administrativa:

| Atributo | Função |
|---|---|
| `form` | Define a classe usada para adicionar e alterar matrizes |
| `list_display` | Define as colunas da listagem |
| `list_filter` | Cria filtros laterais ou abas de filtragem |
| `search_fields` | Define os campos pesquisados pela caixa de busca |
| `list_per_page` | Controla a paginacao |
| `fieldsets` | Organiza os campos da tela de edição |

Por fim, `edu/admin.py:780` registra o par model/admin:

```python
admin.site.register(Matriz, MatrizAdmin)
```

Esse registro faz o admin montar o fluxo sob `/admin/edu/matriz/`. Não e
necessário criar manualmente uma entrada em `edu/urls.py`, uma view de inclusão,
uma view de edição ou um template de formulário para o CRUD básico.

Fluxo simplificado:

```text
/admin/edu/matriz/
-> MatrizAdmin
-> MatrizForm
-> is_valid()
-> form.save()
-> pagina de confirmacao/listagem do admin
```

#### Exemplo personalizado: replicacao de matriz

No fluxo personalizado, cada parte aparece explicitamente.

URL em `edu/urls.py:26`:

```python
path('replicar_matriz/<int:pk>/', views.replicar_matriz),
```

A implementação comentada apresenta cada parte do código.

View em `edu/views.py:1473-1485`:

```python
@permission_required('edu.add_matriz')
@rtr()
def replicar_matriz(request, pk):
    title = 'Replicacao de Matriz - Treinamento'
    matriz = get_object_or_404(Matriz, pk=pk)
    form = ReplicacaoMatrizForm(matriz, data=request.POST or None)

    if request.POST and form.is_valid():
        resultado = form.processar()
        return httprr(
            f'/edu/matriz/{resultado.id}/',
            'Matriz replicada com sucesso.',
        )

    return locals()
```

Nesse caso, a view decide:

- qual objeto será processado;
- qual permissão protege a operação;
- quando o form será validado;
- qual método executa a regra;
- para onde o usuário será redirecionado;
- qual mensagem será apresentada.

O botão que inicia o fluxo está em `edu/templates/matriz.html:24-29`, e o
`@rtr()` usa o template padrão `djtools/templates/default.html` para renderizar
o form.

#### Comparação direta

| Aspecto | Form no admin | Form em fluxo personalizado |
|---|---|---|
| URL | Gerada pelo admin | Declarada em `urls.py` |
| View | Fornecida por `ModelAdmin` | Escrita pelo desenvolvedor |
| Template | Template administrativo padrão | Padrão do `@rtr` ou template específico |
| Instanciacao | Feita pelo admin | Feita explicitamente na view |
| Permissão | Permissões padrão add/change/delete/view e regras do admin | Decoradores e regras definidos na view |
| Persistência | Normalmente `ModelForm.save()` | Pode usar `save()`, `processar()` ou produzir apenas uma consulta |
| Listagem e filtros | `list_display`, `list_filter`, `search_fields` | HTML e consulta implementados para o caso de uso |
| Flexibilidade | Excelente para CRUD administrativo | Melhor para fluxos, relatórios e operações específicas |

#### Como escolher

Use o admin quando a necessidade for principalmente cadastrar, consultar,
alterar ou excluir registros por usuários administrativos.

Use um fluxo personalizado quando houver:

- uma sequência própria de etapas;
- tela voltada ao aluno, professor ou público externo;
- relatório, PDF, importacao ou exportacao;
- ação sobre vários models;
- layout ou navegacao específicos;
- regra de permissão contextual;
- resultado que não seja simplesmente salvar o model do form.

Um `ModelFormPlus` pode ser usado nos dois contextos. Por exemplo,
`AlunoForm`, definido em `edu/forms.py:215`, e associado ao `AlunoAdmin` em
`edu/admin.py:1601-1613`. Portanto, evite concluir que todo `ModelFormPlus` e
personalizado ou que todo form do admin precisa herdar diretamente de
`forms.ModelForm`.

### 6. LPS e customizações

LPS significa **Linha de Produto de Software**. Não e um recurso nativo do
Django. No SUAP, e um mecanismo do DJTools para manter variacoes de uma
instalacao sem alterar diretamente todas as classes e templates do nucleo comum.

Uma instalacao pode, por exemplo, precisar de um campo diferente no cadastro de
servidor. Em vez de copiar todo o modulo `rh`, ela pode manter apenas a diferença
em uma pasta LPS.

A configuração-base fica em `suap/settings_base.py:738`:

```python
LPS = ''
```

Quando o valor está vazio, nenhuma variante LPS está ativa. Se uma instalacao
definir, por exemplo:

```python
LPS = 'demo_lps'
```

o SUAP passa a procurar customizacoes em caminhos como:

```text
<app>/lps/demo_lps/forms.py
<app>/lps/demo_lps/models.py
<app>/lps/demo_lps/templates/
<app>/lps/demo_lps/permissions.yaml
<app>/lps/demo_lps/urls.py
```

#### Customizacao LPS de forms

`FormPlus` usa `MetaFormPlus`, e `ModelFormPlus` usa `MetaModelFormPlus`. Essas
metaclasses estão em `djtools/lps.py:67-109` e executam quando a classe do
formulário e criada.

De forma resumida, o mecanismo:

1. verifica em `djtools/lps.py:112-117` se `settings.LPS` está preenchido e se a
   classe pertence a uma aplicação instalada;
2. identifica o modulo da classe original, por exemplo `rh.forms`;
3. importa `<app>.lps.<LPS>.forms`, por exemplo
   `rh.lps.demo_lps.forms`;
4. procura nesse modulo uma classe com o mesmo nome da original;
5. copia os atributos e métodos da classe LPS para a classe que está sendo
   criada;
6. deixa a metaclasse original do Django concluir a criação do form.

O trecho central de `MetaModelFormPlus`, em `djtools/lps.py:89-109`, e:

```python
class MetaModelFormPlus(fmodels.ModelFormMetaclass):
    def __new__(mcs, name, bases, attrs):
        if is_lps(attrs):
            s_m = attrs['__module__'].split('.')
            s_m = '.'.join(s_m[:-1])
            parents = [b for b in bases if isinstance(b, fmodels.ModelFormMetaclass)]

            if parents:
                try:
                    mdl = __import__(
                        '{}.lps.{}.forms'.format(s_m, settings.LPS),
                        fromlist=[('forms')],
                    )
                    if hasattr(mdl, name):
                        Klass = getattr(mdl, name)
                        set_attrs_klass(attrs, list(Klass.__dict__.items()))
                except Exception:
                    pass

        return super(MetaModelFormPlus, mcs).__new__(mcs, name, bases, attrs)
```

#### Exemplo real: `ServidorForm`

O formulário principal está em `rh/forms.py:810-837`:

```python
class ServidorForm(ServidorInformacoesPessoaisForm):
    setor = forms.ModelChoiceField(
        label='Setor SUAP',
        queryset=Setor.objects.all(),
        widget=TreeWidget(),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # configuracao dos campos...
```

A variante está em `rh/lps/demo_lps/forms.py:13-25` e declara uma classe com o
mesmo nome:

```python
class ServidorForm():
    setor = forms.ModelChoiceField(
        label='Setor SUAP LPS',
        queryset=Setor.objects.all(),
        widget=TreeWidget(),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super(ServidorInformacoesPessoaisForm, self).__init__(*args, **kwargs)
        # configuracao especifica desta instalacao...
```

Com `LPS = 'demo_lps'`, os atributos dessa segunda classe são sobrepostos aos da
classe principal durante sua criação. O campo passa a exibir o rotulo
`Setor SUAP LPS`, e o `__init__()` customizado passa a ser utilizado.

Isso explica por que `FormPlus` e `ModelFormPlus` possuem metaclasses proprias,
embora seus corpos sejam pequenos. A maior extensao não está nos métodos das
classes, mas na possibilidade de sobreposicao durante a criação.

Cuidados:

- a customizacao depende do nome exato da classe;
- ela deve conter somente a diferença necessária;
- alterar a assinatura de um método pode quebrar as views que usam o form;
- `super()` precisa respeitar a hierarquia resultante;
- sempre se deve testar o comportamento com a LPS ativa e inativa.

Resumo:

```text
Form e ModelForm sao do Django.
FormPlus e ModelFormPlus sao adaptacoes do DJTools/SUAP.
LPS e um mecanismo do SUAP para aplicar variacoes por instalacao.
```

### 7. Estado `bound`/`unbound` e `prefix`

#### Formulário `unbound`

Um formulário está **unbound**, ou não vinculado, quando foi criado sem dados de
entrada. Isso normalmente ocorre no primeiro acesso por `GET`:

```python
form = MeuForm(data=None)
```

Nesse estado:

- `form.is_bound` vale `False`;
- valores de `initial` podem ser exibidos;
- os campos ainda não foram submetidos pelo usuário;
- `form.is_valid()` retorna `False`, sem significar que os campos estejam
  incorretos.

Passar `initial` não torna o formulário vinculado:

```python
form = MeuForm(initial={'ano': 2026})
```

`initial` e apenas uma sugestao de exibição.

#### Formulário `bound`

Um formulário está **bound**, ou vinculado, quando recebe dados em `data` ou
arquivos em `files`:


```python
form = MeuForm(data=request.POST)
```

Nesse estado, `form.is_bound` vale `True`. O formulário preserva o que foi
enviado, pode mostrar erros e pode ser validado:

```python
form.is_valid()
```

No exemplo real de `edu/views.py:1478`, a expressao decide os dois estados:

```python
form = ReplicacaoMatrizForm(matriz, data=request.POST or None)
```

- no `GET`, `request.POST` está vazio e `data` recebe `None`: form `unbound`;
- no `POST` com dados, `data` recebe o `QueryDict`: form `bound`.

Detalhe importante: para o Django, até um dicionario vazio passado explicitamente
como `data={}` cria um form `bound`. A expressao `request.POST or None` converte
um `QueryDict` vazio em `None`. Para identificar a requisição sem depender de ela
conter campos, prefira testar `request.method`:

```python
form = MeuForm(data=request.POST or None)

if request.method == 'POST' and form.is_valid():
    ...
```

#### `prefix`

`prefix` e um parâmetro do Django que cria um namespace para os nomes e ids dos
campos. Ele e util quando a mesma página possui dois Formulários com campos de
nomes iguais.

```python
form_aluno = ContatoForm(prefix='aluno')
form_responsavel = ContatoForm(prefix='responsavel')
```

Se ambos possuem o campo `email`, o HTML gerado usa nomes diferentes:

```html
<input name="aluno-email" id="id_aluno-email">
<input name="responsavel-email" id="id_responsavel-email">
```

No POST, o mesmo prefixo precisa ser informado para que o Django encontre os
dados corretos:

```python
form_aluno = ContatoForm(request.POST or None, prefix='aluno')
form_responsavel = ContatoForm(request.POST or None, prefix='responsavel')
```

Exemplo real da infraestrutura administrativa do SUAP:
`djtools/contrib/admin/options/__init__.py:801-810` recebe `prefix` no construtor
de um formset e o repassa para `super().__init__()`. Em
`djtools/contrib/admin/options/__init__.py:1052-1058`, o admin calcula prefixos
unicos e instância cada formset:

```python
prefix = FormSet.get_default_prefix()
if prefixes[prefix] != 1 or not prefixes[prefix]:
    prefix = f'{prefix}-{prefixes[prefix]}'
formset = FormSet(instance=self.model(), prefix=prefix)
```

Assim, vários formsets podem coexistir na mesma página sem colisao entre campos.

### 8. `GET`, `POST` e `FILES`

Antes de estudar o código, e importante separar dois conceitos:

- `GET` e `POST` são **métodos da requisição HTTP**;
- `request.GET`, `request.POST` e `request.FILES` são **coleções criadas pelo
  Django** com os dados recebidos.

Assim, `FILES` não e um terceiro método HTTP ao lado de GET e POST. Os arquivos
normalmente chegam em uma requisição POST e ficam separados em
`request.FILES`.

```text
Requisicao HTTP
|
+-- request.method  -> "GET" ou "POST"
+-- request.GET     -> parametros da URL
+-- request.POST    -> campos textuais enviados no corpo
+-- request.FILES   -> arquivos enviados no corpo multipart
```

#### 8.1. `request.method`

`request.method` informa qual método HTTP foi usado para acessar a view:

```python
if request.method == 'POST':
    # O usuario submeteu uma operacao pelo formulario.
    ...
```

Esse teste responde **como a requisição foi feita**. Ele e diferente de testar
`if request.POST`, que responde apenas se a colecao possui algum valor.

```python
# Mais explicito para identificar uma submissao POST.
if request.method == 'POST':
    ...

# Verifica se request.POST possui dados; nao e exatamente a mesma pergunta.
if request.POST:
    ...
```

Uma requisição POST pode existir mesmo que o corpo esteja vazio. Por isso,
quando a decisão depende do método HTTP, prefira `request.method == 'POST'`.

#### 8.2. GET: consulta e filtros reproduzíveis

GET deve ser usado para consultar informações sem alterar o estado do sistema.
Os valores são enviados na própria URL, depois de `?`:

```text
/edu/relatorio_horario/ano_letivo=2026&periodo_letivo=1&turma=120
```

O Django disponibiliza esses parâmetros em `request.GET`, que e um
`QueryDict`:

```python
ano = request.GET.get('ano_letivo')
turmas = request.GET.getlist('turma')
```

Use GET principalmente para:

- pesquisas e filtros;
- ordenacao e paginacao;
- relatórios consultivos;
- telas cujo resultado pode ser favoritado, compartilhado ou recarregado.

Vantagens:

- os filtros permanecem visiveis na URL;
- o navegador pode guardar e repetir a consulta;
- o link pode reproduzir o mesmo resultado;
- atualizar a página não repete uma gravação no banco.

Cuidados:

- não use GET para salvar, excluir ou executar operações com efeito colateral;
- não envie senhas ou informações sensiveis, pois os valores aparecem na URL e
  podem ficar no histórico e nos logs;
- a URL não e adequada para grandes volumes de dados;
- os valores de `request.GET` continuam sendo entrada do usuário e precisam ser
  validados pelo form.

##### Exemplo real: relatório de horarios

O `RelatorioHorarioForm`, em `edu/forms.py:4456-4503`, declara:

A implementação comentada apresenta cada parte do código.

`METHOD = 'GET'` e um atributo utilizado pela camada de renderizacao do SUAP.
Ele faz o HTML do formulário usar `method="GET"`, mas não entrega os dados ao
form automaticamente. A view ainda precisa usar `request.GET`.

Isso acontece em `edu/views.py:6334-6373`. O trecho abaixo foi reduzido para
destacar o fluxo GET:

```python
@rtr()
@permission_required('edu.view_horarioauladiario')
def relatorio_horario(request):
    title = 'Listagem de Horarios'

    # No primeiro acesso, request.GET esta vazio e o form fica unbound.
    # Depois da pesquisa, o QueryDict recebido torna o form bound.
    form = RelatorioHorarioForm(
        data=request.GET or None,
        user=request.user,
    )

    if form.is_valid():
        # O processamento usa cleaned_data, nao valores brutos da URL.
        horarios = form.processar()

        # ... construcao das tabelas do relatorio ...

        # O parametro tambem pode controlar a resposta da mesma consulta.
        if request.GET.get('pdf'):
            return tabelas.as_pdf()

    return locals()
```

Fluxo desse exemplo:

```text
Usuario preenche os filtros
        |
        v
Navegador monta a URL com campo=valor
        |
        v
request.GET recebe os parametros
        |
        v
RelatorioHorarioForm valida e produz cleaned_data
        |
        v
processar() monta o QuerySet do relatorio
```

O template `edu/templates/relatorio_horario.html:1-34` renderiza o form e, se
ele for válido, apresenta os filtros e o resultado. A URL continua contendo os
parâmetros utilizados na consulta.

#### 8.3. POST: envio de operações e alterações

POST envia os dados no corpo da requisição. No Django, os campos textuais de um
formulário POST ficam em `request.POST`, também representado por um `QueryDict`.

Use POST para:

- cadastrar registros;
- alterar dados existentes;
- excluir ou confirmar operações;
- iniciar processamentos que produzem efeitos no sistema;
- enviar arquivos.

Exemplo de HTML equivalente:

```html
<form method="post">
    <input name="coordenador_curso">
    <button type="submit">Salvar</button>
</form>
```

Em Formulários POST internos, o Django exige normalmente o token CSRF:

```django
<form method="post">
    {% csrf_token %}
    {{ form }}
</form>
```

O template padrão do SUAP faz isso em
`djtools/templates/form.html:10-17`: define o método do form e inclui
`{% csrf_token %}` quando o método e POST.

##### Exemplo real: alterar requisitos de um componente

Em `edu/views.py:1518-1527`, a view recebe os dados por POST e altera uma
instância existente:

```python
@permission_required('edu.add_componentecurricular')
@rtr()
def definir_requisitos(request, pk):
    title = 'Definir Pre e Co-requisitos'
    instance = get_object_or_404(ComponenteCurricular, pk=pk)

    form = RequisitosComponenteCurricularForm(
        request.POST or None,
        instance=instance,
    )

    if form.is_valid():
        form.save()
        return httprr('..', 'Requisitos definidos com sucesso.')

    return locals()
```

No primeiro acesso por GET:

- `request.POST` está vazio;
- `request.POST or None` resulta em `None`;
- o formulário fica `unbound` e exibe os dados de `instance`.

Na submissao por POST:

- `request.POST` contém os campos textuais enviados;
- o formulário fica `bound`;
- `is_valid()` converte e valida os dados;
- `form.save()` atualiza a instância.

> Nunca use diretamente `request.POST['campo']` para salvar um valor que
> deveria passar pela validação do formulário. Depois de `is_valid()`, use
> `form.cleaned_data` ou `form.save()`.

#### 8.4. `QueryDict`: comportamento de GET e POST

`request.GET` e `request.POST` não são dicionarios Python comuns. São objetos
`QueryDict`, preparados para representar inclusive várias ocorrencias do mesmo
campo:

```text
curso=10&curso=20&curso=30
```

```python
request.GET.get('curso')       # normalmente retorna o ultimo valor
request.GET.getlist('curso')   # retorna ['10', '20', '30']
```

Por padrão, esses objetos são imutaveis. Quando a view realmente precisa
alterar os dados antes de entrega-los ao form, deve criar uma copia:

```python
form_data = request.POST.copy()
form_data['confirmacao'] = 'false'
form = MeuForm(data=form_data)
```

Ha um exemplo real desse procedimento em `edu/views.py:3410-3416`, na view
`definir_local_aula_diario`.

#### 8.5. FILES: arquivos enviados pelo formulário

Arquivos não ficam em `request.POST`. O Django os separa em `request.FILES`, um
`MultiValueDict` cujos valores são objetos de arquivo enviado.

```text
POST multipart/form-data
|
+-- campos comuns ----------> request.POST
+-- arquivos ---------------> request.FILES
```

Para que o upload funcione, tres partes precisam estar alinhadas:

1. o form deve possuir um `FileField`, `ImageField` ou variante `Plus`;
2. o HTML deve usar `method="post"` e `enctype="multipart/form-data"`;
3. a view deve entregar `request.FILES` ao parâmetro `files` do form.

Exemplo genérico:

```python
form = MeuUploadForm(
    data=request.POST or None,
    files=request.FILES or None,
)

if form.is_valid():
    arquivo = form.cleaned_data['arquivo']
```

Sem `files=request.FILES`, o campo de arquivo chega vazio ao formulário, mesmo
que o navegador tenha enviado o arquivo corretamente.

##### Exemplo real: importacao de componentes

O campo de upload está em `edu/forms.py:10509-10513`. No trecho reduzido:

```python
class ImportarComponentesForm(forms.FormPlus):
    planilha = forms.FileFieldPlus(
        required=True,
        help_text='O arquivo deve ser no formato xlsx, sem cabecalho.',
    )
```

Em `edu/forms.py:10515-10553`, o método `clean()` usa o arquivo já validado:

```python
def clean(self):
    try:
        # cleaned_data contem o objeto de arquivo, nao apenas seu nome.
        planilha = self.cleaned_data['planilha'].file
        workbook = xlrd.open_workbook(file_contents=planilha.read())
        sheet = workbook.sheet_by_index(0)

        # Leitura e validacao das linhas da planilha...
    except XLRDError:
        raise ValidationError(
            'Nao foi possivel processar a planilha.'
        )

    return self.cleaned_data
```

A view correspondente, em `edu/views.py:11574-11582`, entrega as duas coleções
ao formulário:

```python
@permission_required('edu.add_componente')
@rtr()
def importar_componentes(request):
    title = 'Importar Componentes'

    form = ImportarComponentesForm(
        data=request.POST or None,
        files=request.FILES or None,
    )

    if form.is_valid():
        form.processar()
        return httprr('..', 'Componentes importados com sucesso.')

    return locals()
```

O `{% render_form form %}` usa o template
`djtools/templates/form.html:10-13`. Nele, `form.is_multipart` detecta a
presenca do campo de arquivo e acrescenta automaticamente:

```html
<form method="POST" enctype="multipart/form-data">
```

O mesmo template inclui o token CSRF porque o método e POST.

#### 8.6. Comparação rápida

| Elemento | Onde os dados trafegam | Uso recomendado | Exemplo no EDU |
|---|---|---|---|
| `request.GET` | URL, depois de `?` | Consulta, filtro e relatório | `relatorio_horario`, `edu/views.py:6336-6373` |
| `request.POST` | Corpo da requisição | Criação, edição e operação | `definir_requisitos`, `edu/views.py:1520-1527` |
| `request.FILES` | Corpo multipart | Arquivos enviados por POST | `importar_componentes`, `edu/views.py:11576-11582` |
| `request.method` | Método informado na requisição HTTP | Identificar GET ou POST | `definir_local_aula_diario`, `edu/views.py:3410-3423` |

Regra prática:

```text
Somente consulta reproduzivel?        GET + request.GET
Cria, altera ou executa uma acao?     POST + request.POST
Possui arquivo?                       POST + request.POST + request.FILES
```

### 9. Validação: de `is_valid()` a `cleaned_data`

#### O que `is_valid()` faz

`is_valid()` e um método herdado do Django. Ele verifica se o formulário está vinculado a dados e se todas as etapas de validação terminaram sem erros.

Conceitualmente, seu resultado equivale a:

```python
formulario_tem_dados and not formulario_tem_erros
```

Um formulário vazio, criado com `data=None`, não está vinculado. Nesse caso:

```python
form.is_valid()  # False
```

Isso não significa que os campos estejam errados. Significa apenas que o usuário ainda não enviou o formulário.

Quando o form recebe `request.POST` ou `request.GET`, ele fica vinculado. Ao chamar `is_valid()`, o Django acessa a colecao de erros e dispara internamente o processo de limpeza e validação, caso ele ainda não tenha sido executado.

Fluxo detalhado:

```text
O form esta vinculado a dados?
        |
Nao -----------------------------> is_valid() retorna False
        |
Sim
        |
Conversao e validacao de cada Field
        |
to_python(): converte texto para o tipo Python esperado
        |
validate(): confere required e regras basicas
        |
run_validators(): executa validadores adicionais
        |
clean_<nome_do_campo>()
        |
clean()
        |
ModelForm: validacao do model e de unicidade
        |
Sem erros -> True / Com erros -> False
```

Para cada campo, o Django chama internamente `Field.clean()`. Esse método
coordena, nesta ordem:

```python
value = field.to_python(raw_value)
field.validate(value)
field.run_validators(value)
return value
```

Essa representacao e conceitual. Não se deve chamar essas etapas manualmente na
view; `form.is_valid()` coordena o processo.

#### `to_python()`

Converte o valor bruto enviado pelo navegador para o tipo Python esperado. O
navegador envia principalmente texto, mas a aplicação precisa trabalhar com
datas, números, booleanos e objetos.

Exemplos de conversao executada antes de `cleaned_data`:

```text
DateField: "17/10/2026" -> objeto date
IntegerField: "10" -> inteiro 10
ModelChoiceField: "25" -> instancia do model de pk 25
BooleanField: valor enviado -> True ou False
```

Exemplo real em `djtools/forms/fields/__init__.py:53-70`:

```python
class BooleanRequiredField(forms.BooleanField):
    def to_python(self, value):
        if value in (True, 'True', 'true', '1'):
            return True
        elif value in (False, 'False', 'false', '0'):
            return False
        else:
            return None
```

O campo converte diferentes representacoes vindas do HTML ou JavaScript para
`True`, `False` ou `None`.

Regra prática: `to_python()` converte. Ele não e o melhor lugar para regras que
dependem de outros campos.

#### `validate()`

Valida regras internas do próprio tipo de campo usando o valor já convertido.
No mesmo `BooleanRequiredField`, em
`djtools/forms/fields/__init__.py:72-74`:

```python
def validate(self, value):
    if value is None:
        raise ValidationError(self.error_messages['required'], code='required')
```

O método exige uma resposta booleana valida. Outro exemplo e
`MultiEmailField.validate()`, em `djtools/forms/fields/__init__.py:1089-1094`,
que chama `super().validate(value)` e depois verifica cada endereco com
`validate_email()`.

Ao sobrescrever `validate()`, normalmente se chama `super().validate(value)`
para preservar `required` e as regras da classe-pai.

#### `run_validators()`

Executa a lista de funções registrada no atributo `validators` do campo. Cada
validador recebe o valor convertido e deve levantar `ValidationError` se o valor
for inválido.

```python
def codigo_valido(value):
    if not value.startswith('EDU-'):
        raise forms.ValidationError('O codigo deve iniciar com EDU-.')

codigo = forms.CharField(validators=[codigo_valido])
```

`run_validators()` e implementado pelo Django e herdado pelos campos usados no
SUAP. Em geral, não se sobrescreve esse método: declara-se a lista
`validators=[...]`. Um exemplo real de validadores declarativos no SUAP está em
`calculos_pagamentos/models/pagamentos.py:33`, onde o campo `codigo` recebe
`MaxLengthValidator(5)` e `MinLengthValidator(5)`. Quando esse campo e levado a
um `ModelForm`, os validadores participam da validação do model/form.

Distincao importante:

```text
validate()       -> regras internas do tipo de Field
run_validators() -> validadores reutilizaveis declarados na lista validators
```

#### `clean_<nome_do_campo>()`

Depois que o `Field` converte e valida o valor, o Django procura no formulário
um método com o nome do campo. Ele serve para uma regra específica daquele
formulário.

Exemplo real em `edu/forms.py:631-635`:

```python
def clean_data_fim(self):
    if 'data_inicio' in self.cleaned_data and 'data_fim' in self.cleaned_data:
        if self.cleaned_data['data_fim'] < self.cleaned_data['data_inicio']:
            raise ValidationError('A data de fim deve ser maior que a data de inicio.')
    return self.cleaned_data['data_fim']
```

O método valida `data_fim` e precisa devolver o valor que permanecera em
`cleaned_data['data_fim']`.

#### `clean()` do formulário

Depois da limpeza dos campos, o Django chama `Form.clean()`. Este e o local para
regras que relacionam vários campos ou o contexto geral do form.

Exemplo real em `edu/forms.py:513-525`, na classe
`CadastrarMatriculaPeriodo`:

```python
def clean(self):
    if MatriculaPeriodo.objects.filter(
        aluno_id=self.instance.aluno_id,
        ano_letivo=self.cleaned_data['ano_letivo'],
        periodo_letivo=self.cleaned_data['periodo_letivo'],
    ).exists():
        raise forms.ValidationError(
            'Ja existe uma matricula para o ano/letivo informados.'
        )
    return self.cleaned_data
```

A regra combina aluno, ano e período para impedir duplicidade. O erro levantado
em `clean()` e geral e aparece em `form.non_field_errors()`.

O padrão mais seguro para novos forms e preservar primeiro a limpeza herdada:

```python
def clean(self):
    cleaned_data = super().clean()
    # validacao entre campos
    return cleaned_data
```

Um exemplo desse formato está em
`edu/forms.py:13761-13768`, no
`IniciarSessaoAssinaturaSenhaForm`: ele chama `super().clean()`, confere a senha
do usuário autenticado e devolve `cleaned_data`.

Não confundir os dois métodos de mesmo nome:

| Método | Onde existe | Responsabilidade |
|---|---|---|
| `Field.clean()` | Classe do campo | Coordenar `to_python()`, `validate()` e `run_validators()` |
| `Form.clean()` | Classe do formulário | Validar a combinacao de campos e regras gerais |

#### `cleaned_data`

Portanto, `cleaned_data` não e apenas uma copia de `request.POST`. Ele contém valores convertidos e validados.

Exemplo:

```python
if form.is_valid():
    ano = form.cleaned_data['ano_letivo']
    # ano pode ser uma instancia de Ano, e nao o texto enviado.
```

Quando existe erro:

```python
if not form.is_valid():
    print(form.errors)
```

Os erros ficam associados aos campos ou ao formulário:

```text
form.errors              -> erros por campo
form.non_field_errors()  -> erros produzidos pelo clean() geral
```

Pontos importantes:

- `is_valid()` não salva nenhum objeto;
- `is_valid()` não verifica permissão de acesso;
- `is_valid()` não executa automaticamente um método `processar()`;
- `is_valid()` apenas valida e prepara `cleaned_data` e `errors`;
- em `ModelForm`, `form.save()` deve ser chamado separadamente;
- campos inválidos não devem ser lidos diretamente de `request.POST` para executar a operação;
- a validação e executada uma vez e seus erros ficam armazenados no objeto form.

Os valores devem ser lidos de `cleaned_data` somente depois de `is_valid()`:

```python
if form.is_valid():
    matricula = form.cleaned_data['matricula']
```

Erro de um campo:

```python
def clean_matricula(self):
    matricula = self.cleaned_data['matricula'].strip()
    if not Aluno.objects.filter(matricula=matricula).exists():
        raise forms.ValidationError('Aluno nao encontrado.')
    return matricula
```

Erro que depende de mais de um campo:

```python
def clean(self):
    cleaned_data = super().clean()
    data_inicio = cleaned_data.get('data_inicio')
    data_fim = cleaned_data.get('data_fim')

    if data_inicio and data_fim and data_fim < data_inicio:
        raise forms.ValidationError(
            'A data final deve ser posterior a data inicial.'
        )

    return cleaned_data
```

O exemplo real de validação entre datas está em `edu/forms.py:599-649`, na classe `ReplicacaoConfiguracaoPedidoMatriculaForm`.

`cleaned_data` e um dicionario construido durante a validação. Ele deve ser
consultado somente depois de `is_valid()`. Campos inválidos podem não aparecer
no dicionario; por isso, em validacoes que dependem de vários campos, prefira
`.get()` ou verifique a existencia da chave.

Exemplo real em `edu/views.py:8235-8237`:

```python
if form.is_valid():
    ano_letivo = form.cleaned_data['ano_letivo']
    periodo_letivo = form.cleaned_data['periodo_letivo']
```

Nesse ponto, `ano_letivo` já e uma instância de `Ano`, pois o campo e um
`ModelChoiceField`, e `periodo_letivo` já passou pelas regras do `ChoiceField`.

### 10. `instance`, `save()` e `processar()`

#### `instance`

`instance` e o objeto de model que um `ModelForm` está construindo ou editando.
Ele não existe com essa finalidade em um `FormPlus` comum.

Para criar um objeto novo:

```python
form = AlterarCoordenadorPlanoEnsinoForm(data=request.POST or None)
```

O Django prepara internamente uma nova instância de `PlanoEnsino`.

Para editar um objeto existente, a view o fornece explicitamente. Exemplo real
em `edu/views.py:14728-14731`:

```python
obj = get_object_or_404(PlanoEnsino, pk=pk, ...)
form = AlterarCoordenadorPlanoEnsinoForm(
    data=request.POST or None,
    instance=obj,
)
if form.is_valid():
    form.save()
```

Nesse caso, `form.instance` e o mesmo objeto referenciado por `obj`. O `save()`
faz um `UPDATE`; sem `instance=obj`, o formulário tentaria criar outro registro.

O formulário pode preparar a instância antes de salva-la. Em
`edu/forms.py:513-515`, `CadastrarMatriculaPeriodo.__init__()` faz:

```python
self.instance.aluno_id = aluno_id
```

#### `form.save()` e `save()`

`form.save()` e a chamada feita pela view em uma instância de `ModelForm` ou
`ModelFormPlus`. O método copia os valores validados para `form.instance`, salva
o objeto no banco e devolve a instância salva.

```python
if form.is_valid():
    plano = form.save()
```

O `save()` não pertence a `FormPlus`; ele vem de `django.forms.ModelForm`. Por
isso, um form de filtro ou de relatório normalmente não pode executar
`form.save()`.

Uma classe pode sobrescrever `save()` para acrescentar comportamento. Exemplo
em `edu/forms.py:11903-11911`: o form define campos de `self.instance` e chama
`super().save(*args, **kwargs)` para conservar a persistência do `ModelForm`.

Regra essencial: `form.save()` deve vir depois de `form.is_valid()`. Salvar um
form inválido levanta erro e não produz uma instância confiavel.

#### `save(commit=False)`

`commit=False` pede ao `ModelForm` que monte e devolva `instance`, mas ainda não
execute seu `save()` no banco. Isso permite preencher campos que não vieram do
HTML antes da persistência.

Exemplo real em `edu/views.py:8235-8243`:

```python
if form.is_valid():
    ano_letivo = form.cleaned_data['ano_letivo']
    periodo_letivo = form.cleaned_data['periodo_letivo']

    procedimento = form.save(commit=False)
    procedimento.tipo = 'Reintegracao'
    procedimento.situacao_matricula_anterior = matricula_periodo.aluno.situacao

    matricula_periodo.reintegrar_aluno(
        procedimento,
        ano_letivo,
        periodo_letivo,
    )
```

O formulário cria um `ProcedimentoMatricula`, mas a view acrescenta o tipo e a
situação anterior antes de entregar o objeto a regra de reintegracao.

`commit=False` não significa descartar a operação. Significa apenas adiar o
salvamento. Algum ponto posterior precisa executar `instance.save()` ou passar o
objeto a uma regra que o salve.

#### `save_m2m()`

Relacionamentos `ManyToManyField` precisam que o objeto principal possua uma
chave primaria. Quando se usa `form.save(commit=False)`, o Django não pode salvar
imediatamente esses relacionamentos. Depois de salvar manualmente a instância,
deve-se chamar `form.save_m2m()`.

Exemplo real em `processo_eletronico/views.py:2992-3003`:

```python
form = DocumentoDigitalizadoRequerimentoForm(
    request.POST or None,
    request.FILES or None,
)

if form.is_valid():
    documento = form.save(commit=False)
    documento.tipo_conferencia = TipoConferencia.objects.get(id=3)
    documento.requerimento = requerimento
    documento.save()
    form.save_m2m()
```

A ordem correta e:

```text
form.is_valid()
-> objeto = form.save(commit=False)
-> completar objeto
-> objeto.save()
-> form.save_m2m()
```

Se o formulário não possui campos muitos-para-muitos, `save_m2m()` normalmente
não e necessário. Se `form.save()` foi chamado com o `commit=True` padrão, o
próprio `ModelForm` já cuida desses relacionamentos.

#### `processar()`

`processar()` não e um método do Django, de `FormPlus` ou de `ModelFormPlus`. E
uma convenção encontrada em vários forms do SUAP para executar uma ação que não
se resume a salvar diretamente um model.

Exemplo real em `edu/forms.py:671-673`:

```python
def processar(self):
    self.matriz.replicar(self.cleaned_data['descricao'])
    return self.matriz
```

A view chama o método explicitamente em `edu/views.py:1479-1482`:

```python
if request.POST and form.is_valid():
    resultado = form.processar()
    return httprr(
        f'/edu/matriz/{resultado.id}/',
        'Matriz replicada com sucesso.',
    )
```

Ele só deve ser chamado depois de `is_valid()`, pois normalmente depende de
`cleaned_data`. O nome não garante comportamento automático: a assinatura, o
retorno e os efeitos são definidos por cada classe.

#### Quando usar cada operação

| Operação | Origem | Quando usar |
|---|---|---|
| `form.save()` | Django `ModelForm` | Criar ou atualizar diretamente o model do form |
| `form.save(commit=False)` | Django `ModelForm` | Completar a instância antes de salva-la |
| `form.save_m2m()` | Django `ModelForm` | Salvar M2M depois de usar `commit=False` |
| `form.processar()` | Convenção do código SUAP | Executar pesquisa, replicacao ou regra personalizada |
| `instance.save()` | Django Model | Persistir diretamente a instância no banco |

Fluxo de decisão:

```text
O form e ModelFormPlus e representa diretamente um model?
    Sim -> form.save()
           Precisa completar campos antes?
               Sim -> form.save(commit=False), instance.save() e save_m2m()
    Nao -> a view usa cleaned_data ou chama um processar() definido pelo projeto
```

## E. Relação entre Form e View: replicação de matriz

### 1. Visão geral do fluxo

A replicação de uma matriz existente percorre três responsabilidades principais. A tela recebe a descrição da nova matriz, o formulário transforma e valida esse dado, e o model executa a regra de negócio que duplica a matriz e seus componentes.

| Camada | Responsabilidade neste exemplo |
|---|---|
| View | Receber a requisição, verificar permissão, localizar a matriz e coordenar o fluxo |
| Form | Exibir, receber, converter e validar a nova descrição |
| Model | Executar a regra de negócio que replica a matriz e seus componentes |

O fluxo comeca na URL declarada em `edu/urls.py:26`:

```python
path('replicar_matriz/<int:pk>/', views.replicar_matriz),
```

O `pk` presente no endereco identifica a matriz que será replicada. Por exemplo,
ao acessar `/edu/replicar_matriz/15/`, o Django chama a view
`replicar_matriz(request, pk=15)`.

### 2. Formulário `ReplicacaoMatrizForm`

A implementação comentada apresenta cada parte do código.

#### Por que a classe herda de `FormPlus`?

`ReplicacaoMatrizForm` herda de `forms.FormPlus`, uma extensao criada no DJTools
do SUAP sobre o `django.forms.Form`. Ela não herda de `ModelFormPlus` porque o
formulário não está editando diretamente uma instância por meio de um `Meta.model`
e de um `save()`. Ele recebe um dado auxiliar, valida esse dado e chama uma
operação específica do dominio: `Matriz.replicar()`.

Em outras palavras, a pergunta para escolher o tipo do formulário e:

- os campos representam diretamente um model que será salvo? Use
  `ModelFormPlus`;
- os campos servem para uma pesquisa, ação ou processo personalizado? Use
  `FormPlus`.

### 3. Estrutura do formulário

O bloco abaixo apresenta o mesmo código com comentários que destacam a
responsabilidade de cada parte.

```python
# Declara um formulario chamado ReplicacaoMatrizForm.
# FormPlus e a classe do DJTools/SUAP que estende o forms.Form do Django.
class ReplicacaoMatrizForm(forms.FormPlus):

    # Define o texto do botao de envio exibido pelo renderizador de formularios
    # do SUAP. A tag {% render_form form %} utiliza esse atributo.
    SUBMIT_LABEL = 'Replicar Matriz'

    # Declara o unico campo que o usuario preencherá.
    # CharFieldPlus e a versao do DJTools para um campo textual de formulario.
    descricao = forms.CharFieldPlus(
        # Sugere ao widget uma largura visual de 500 pixels.
        # Essa opcao trata da apresentacao, nao do tamanho maximo do texto.
        width=700,

        # Define o nome apresentado ao usuario ao lado do campo.
        label='Descricao',

        # Torna o preenchimento obrigatorio. Uma entrada vazia produz erro
        # durante form.is_valid().
        required=True,
    )

    # Personaliza a construcao de cada instancia do formulario.
    # "matriz" e um argumento criado por esta classe; nao e um argumento
    # padrao dos formularios do Django.
    # *args recebe argumentos posicionais adicionais.
    # **kwargs recebe parametros nomeados, como data, files e initial.
    def __init__(self, matriz, *args, **kwargs):

        # Inicializa primeiro a classe-pai. Esta chamada faz o Django criar
        # self.fields, associar os dados enviados e preparar a validacao.
        super().__init__(*args, **kwargs)

        # Guarda a matriz recebida pela view dentro desta instancia do form.
        # Assim, processar() podera utiliza-la posteriormente.
        self.matriz = matriz

        # Define o texto inicial exibido no campo descricao durante o GET.
        # Se a matriz se chama "Matriz 2026", o valor sugerido sera
        # "Matriz 2026 [DUPLICADO]".
        self.fields['descricao'].initial = f'{self.matriz.descricao} [DUPLICADO]'

    # Define a operacao executada depois que os dados forem validados.
    # processar() e uma convencao usada neste fluxo do SUAP; nao e um metodo
    # obrigatorio nem fornecido automaticamente pelo Django ou pelo FormPlus.
    def processar(self):

        # Recupera a descricao ja validada e convertida por is_valid().
        # Em seguida, delega a replicacao ao model Matriz.
        self.matriz.replicar(self.cleaned_data['descricao'])

        # Retorna a matriz replicada para a view obter seu id e redirecionar
        # o usuario para a pagina do novo registro.
        return self.matriz
```

> Observação: os comentários destacam o papel de cada parte; o código executável
> permanece igual ao da implementação atual.

### 4. Responsabilidade de cada parte

#### `SUBMIT_LABEL`

Não e um atributo padrão do Django. Ele faz parte das convencoes de renderizacao
do SUAP. A tag `{% render_form form %}` trata esse atributo em
`djtools/templatetags/tags/utils.py:251-257`, e o template
`djtools/templates/form.html:17` usa seu valor no botão `submit`.

Sem essa declaração, o renderizador escolhe um rotulo padrão, como `Salvar` ou
`Enviar`, conforme o contexto.

#### Campo `descricao`

O campo e declarado no corpo da classe porque todo
`ReplicacaoMatrizForm` precisa dele. Durante a criação da classe, o mecanismo de
forms transforma essa declaração em um campo do formulário. Em cada instância,
ele fica disponível em `self.fields['descricao']`.

`required=True` participa da validação. Se o usuário enviar uma string vazia,
`is_valid()` retorna `False`, registra a mensagem em
`form.errors['descricao']` e a view não chama `processar()`.

O parâmetro `width=700` altera apenas a apresentação do widget. Para limitar a
quantidade de caracteres, seria necessário usar `max_length`.

#### Método `__init__()`

`__init__()` e o construtor da classe. Ele e executado sempre que a view cria o
formulário, tanto no `GET` quanto no `POST`:

```python
form = ReplicacaoMatrizForm(matriz, data=request.POST or None)
```

Sua função neste exemplo e receber a matriz que está fora dos campos do form e
preparar uma sugestao de descrição. A ordem das operações importa:

1. `super().__init__()` deixa o Django montar `self.fields`;
2. `self.matriz = matriz` guarda o objeto de dominio;
3. o código acessa `self.fields` e define o valor inicial.

No `GET`, o usuário ve o valor inicial. No `POST`, os dados enviados em `data`
tem prioridade sobre `initial`. Portanto, se o POST for inválido, o formulário
mostra novamente o texto digitado pelo usuário, e não substitui esse texto pela
sugestao inicial.

#### Método `processar()`

`processar()` não pertence ao ciclo automático do Django: a view precisa chama-lo
explicitamente. Sua função e conectar o dado validado do formulário com a regra
de negocio:

```python
resultado = form.processar()
```

O método deve ser executado somente depois de `form.is_valid()`, pois
`self.cleaned_data` só está pronto depois da validação. Tentar acessar
`self.cleaned_data['descricao']` antes desse momento pode causar erro ou utilizar
um estado incompleto.

O form não implementa a copia da matriz. Ele delega essa operação a
`self.matriz.replicar(...)`, mantendo a regra de negocio no model. Por fim,
retorna a matriz para a view continuar o fluxo.

### 5. Regra de negócio no model

O código está em `edu/models/cursos.py:866-884`. O método `Matriz.replicar()`:

1. guarda a lista de componentes curriculares da matriz original;
2. define `self.id = None`, fazendo o próximo `save()` criar outro registro;
3. aplica a nova descrição;
4. chama `clean()` e `save()`;
5. replica e associa os componentes curriculares ao novo registro;
6. restaura os relacionamentos de Pré-requisitos e co-requisitos.

Trecho central:

```python
def replicar(self, descricao):
    componentes_curriculares = self.componentecurricular_set.all()
    for _ in componentes_curriculares:
        pass
    self.id = None
    self.descricao = descricao
    self.clean()
    self.save()

    for componente_curricular in componentes_curriculares:
        pre_requisitos = componente_curricular.pre_requisitos.all()
        co_requisitos = componente_curricular.co_requisitos.all()
        componente_curricular.id = None
        componente_curricular.matriz = self
        componente_curricular.save()
        for pre_requisito in pre_requisitos:
            componente_curricular.pre_requisitos.add(pre_requisito)
        for co_requisito in co_requisitos:
            componente_curricular.co_requisitos.add(co_requisito)
```

Esse desenho permite que a mesma regra de replicacao seja reutilizada por outra
view, um comando ou um teste sem depender da interface HTML.

### 6. View `replicar_matriz`

O código está em `edu/views.py:1473-1485`. Este é o fluxo completo, inclusive o tratamento
de erro de validação gerado pela regra de negocio:

```python
@permission_required('edu.add_matriz')
@rtr()
def replicar_matriz(request, pk):
    title = 'Replicação de matriz'
    matriz = get_object_or_404(Matriz, pk=pk)
    form = ReplicacaoMatrizForm(matriz, data=request.POST or None)
    if request.POST and form.is_valid():
        try:
            resultado = form.processar()
            return httprr(
                f'/edu/matriz/{resultado.id}/',
                'Matriz replicada com sucesso.',
            )
        except ValidationError as e:
            return httprr(
                '..',
                f'Nao foi possivel replicar a matriz: {e.messages[0]}',
                'error',
            )
    return locals()
```

### 7. Estrutura da view

```python
# Autoriza somente usuarios que possuem a permissao edu.add_matriz.
@permission_required('edu.add_matriz')

# Converte o dicionario retornado pela view em uma resposta HTML.
# Como nenhum template foi informado, o @rtr() usa o template padrao
# djtools/templates/default.html. Esse template chama {% render_form form %}
# quando encontra uma variavel form no contexto.
@rtr()

# request contem a requisicao HTTP; pk veio do parametro <int:pk> da URL.
def replicar_matriz(request, pk):

    # Titulo disponibilizado ao template pelo return locals().
    title = 'Replicação de matriz'

    # Busca a matriz pelo id. Se ela nao existir, responde com HTTP 404.
    matriz = get_object_or_404(Matriz, pk=pk)

    # Cria o formulario e sempre entrega a matriz exigida por seu __init__.
    # No GET, request.POST e vazio e a expressao resulta em None: o form fica
    # nao vinculado e apresenta os valores iniciais.
    # No POST, data recebe os dados enviados: o form fica vinculado e pode
    # valida-los.
    form = ReplicacaoMatrizForm(matriz, data=request.POST or None)

    # Entra no bloco apenas em uma submissao POST valida.
    # O "and" usa curto-circuito: no GET, is_valid() nem chega a ser chamado.
    if request.POST and form.is_valid():

        # Captura falhas de validacao levantadas pela regra do model.
        try:

            # Executa a replicacao somente depois da validacao do formulario.
            resultado = form.processar()

            # Redireciona para a matriz criada e inclui uma mensagem de sucesso.
            # O redirecionamento tambem evita repetir o POST ao atualizar a pagina.
            return httprr(
                f'/edu/matriz/{resultado.id}/',
                'Matriz replicada com sucesso.',
            )

        # Trata ValidationError gerado durante o processamento do model.
        except ValidationError as e:

            # Volta uma pagina e exibe a primeira mensagem como erro.
            return httprr(
                '..',
                f'Nao foi possivel replicar a matriz: {e.messages[0]}',
                'error',
            )

    # No GET, devolve a pagina com o formulario vazio.
    # No POST invalido, devolve a pagina com os dados e erros do mesmo form.
    # locals() inclui request, pk, title, matriz e form no contexto.
    return locals()
```

O encadeamento da renderizacao pode ser mostrado em
`djtools/templates/default.html:2-17`: o template estende
`super_template|default:"admin/base_site.html"` e, quando existe `form` no
contexto, executa `{% render_form form %}`.

> Atenção ao estudar o código existente: `if request.POST` testa se o
> `QueryDict` possui dados. Para novas views, `if request.method == 'POST'` deixa
> a intencao mais explicita e também reconhece um POST completamente vazio. O
> exemplo foi mantido como está no SUAP para permitir a leitura fiel do fluxo.

### 8. O que ocorre em cada requisição

#### Primeiro acesso: `GET`

1. A URL extrai o `pk` e chama a view.
2. A view verifica `edu.add_matriz`.
3. `get_object_or_404()` localiza a matriz.
4. O form recebe `data=None`, portanto ainda não está vinculado.
5. `__init__()` sugere a descrição com `[DUPLICADO]`.
6. A condicao `request.POST` e falsa.
7. `return locals()` entrega o form para renderizacao.

#### Envio vazio ou inválido: `POST`

1. O form recebe `request.POST` e fica vinculado aos dados enviados.
2. `is_valid()` converte e valida `descricao`.
3. Se estiver vazia, `is_valid()` retorna `False`.
4. `processar()` não e executado.
5. `return locals()` renderiza novamente o formulário com o erro do campo.

#### Envio válido: `POST`

1. `is_valid()` retorna `True` e preenche `cleaned_data`.
2. A view chama `form.processar()`.
3. O form passa a descrição limpa para `Matriz.replicar()`.
4. O model cria a matriz e replica os componentes.
5. O form devolve a matriz resultante.
6. `httprr()` redireciona para `/edu/matriz/<novo_id>/` com a mensagem de sucesso.

### 9. Síntese do fluxo

```text
URL com pk
   -> view busca a matriz
   -> view instancia ReplicacaoMatrizForm
   -> __init__ prepara o formulario
   -> usuario envia o POST
   -> is_valid converte e valida
   -> processar usa cleaned_data
   -> Matriz.replicar executa a regra de negocio
   -> httprr redireciona e informa o resultado
```

Mensagem principal: o form não substitui a view nem o model. Ele ocupa a fronteira
entre o dado bruto enviado pelo navegador e o dado confiavel que será entregue a
regra de negocio.

## F. Relação entre Form e Model: edição do plano de ensino

Este exemplo mostra o caminho completo de uma alteração simples:

```text
campo no model
-> campo produzido pelo ModelFormPlus
-> instance entregue pela view
-> validacao
-> form.save()
-> UPDATE no banco
```

### 1. Model `PlanoEnsino`

O código está em `edu/models/plano_ensino.py:6-34`. O trecho completo usado no exemplo e:

A implementação comentada apresenta cada parte do código.

#### Model comentado

```python
# PlanoEnsino e uma entidade persistida no banco.
# LogModel acrescenta ao model os recursos de auditoria usados pelo SUAP.
class PlanoEnsino(LogModel):

    # Relaciona o plano a um Diario. Se o diario for excluido, o CASCADE
    # determina a exclusao dos planos relacionados.
    diario = models.ForeignKeyPlus('edu.Diario', on_delete=models.CASCADE)

    # Campos textuais do conteudo pedagogico. blank=True permite que os
    # formularios aceitem esses campos vazios.
    ementa = models.TextField('Ementa', default='', blank=True)
    justificativa = models.TextField('Justificativa', default='', blank=True)
    objetivo_geral = models.TextField('Objetivo Geral', default='', blank=True)
    objetivos_especificos = models.TextField('Objetivos Especificos', default='', blank=True)
    conteudo_programatico = models.TextField('Conteudo Programatico', default='', blank=True)
    metodologia = models.TextField('Metodologia', default='', blank=True)
    informacoes_adicionais = models.TextField('Informacoes Adicionais', default='', blank=True)

    # Relaciona o plano ao funcionario que coordena o curso.
    # null=True permite que o banco armazene temporariamente NULL.
    coordenador_curso = models.ForeignKeyPlus(
        'rh.Funcionario',
        verbose_name='Coordenador do Curso',
        null=True,
    )

    # Datas que representam as etapas do fluxo de aprovacao.
    data_submissao = models.DateFieldPlus('Data da Submissao', null=True)
    data_aprovacao = models.DateFieldPlus('Data da Aprovacao', null=True)
    data_homologacao = models.DateFieldPlus('Data da Homologacao', null=True)

    # Metadados usados pelo ORM e pelas telas administrativas.
    class Meta:
        verbose_name = 'Plano de Ensino'
        verbose_name_plural = 'Planos de Ensino'
        ordering = ('id',)

    # Define a representacao textual exibida em selects, logs e mensagens.
    def __str__(self):
        return f'Plano de Ensino - {self.diario}'

    # Informa a URL principal desse objeto no SUAP.
    def get_absolute_url(self):
        return f'/edu/plano_ensino_pdf/{self.pk:d}/'

    # Personaliza o salvamento de qualquer PlanoEnsino.
    def save(self, *args, **kwargs):

        # Quando nenhum coordenador foi informado, usa o coordenador do curso
        # associado ao diario e a turma.
        if self.coordenador_curso is None:
            self.coordenador_curso = self.diario.turma.curso_campus.coordenador

        # Executa o save real do Django e encaminha argumentos como update_fields.
        super().save(*args, **kwargs)
```

O `save()` do model e importante neste fluxo: mesmo que o form receba um valor
vazio para `coordenador_curso`, o model aplica seu valor padrão antes de gravar.
Essa regra vale para qualquer ponto do sistema que salve um `PlanoEnsino`, não
somente para está tela.

### 2. Form `AlterarCoordenadorPlanoEnsinoForm`

O código está em `edu/forms.py:14168-14171`:

A implementação comentada apresenta cada parte do código.

#### Form comentado

```python
# ModelFormPlus liga os campos do formulario a uma instancia de model e
# acrescenta as integracoes do DJTools/SUAP.
class AlterarCoordenadorPlanoEnsinoForm(forms.ModelFormPlus):

    # Meta descreve como o Django deve construir o ModelForm.
    class Meta:

        # O formulario criara ou alterara uma instancia de PlanoEnsino.
        model = PlanoEnsino

        # Somente coordenador_curso sera exposto ao usuario.
        # A virgula transforma o valor em uma tupla de um elemento.
        fields = 'coordenador_curso',
```

O Django consulta `PlanoEnsino.coordenador_curso` e cria automaticamente um
campo de escolha de funcionario. Os demais campos do plano não aparecem e não
podem ser alterados por esse form.

Aspectos importantes:

- `Meta.model` define o model editado;
- `Meta.fields` limita explicitamente a superficie de alteração;
- o campo do form herda label, obrigatoriedade e relacionamento do model;
- não foi necessário declarar `save()`: ele e herdado do `ModelForm`;
- `ModelFormPlus` permite integracoes do SUAP sem perder o comportamento Django.

### 3. View `alterar_coordenador_plano_ensino`

O código está em `edu/views.py:14724-14733`:

```python
@login_required()
@rtr()
def alterar_coordenador_plano_ensino(request, pk):
    title = 'Alterar Coordenador de Curso'
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
        return httprr('..', 'Acao realizada com sucesso.')
    return locals()
```

#### View comentada

```python
# Exige que exista um usuario autenticado.
@login_required()

# Renderiza o retorno da view usando o mecanismo de templates do SUAP.
@rtr()

# request representa a requisicao; pk identifica o PlanoEnsino na URL.
def alterar_coordenador_plano_ensino(request, pk):

    # Titulo entregue ao template por return locals().
    title = 'Alterar Coordenador de Curso'

    # Busca o plano solicitado e devolve 404 se ele nao existir.
    # O filtro encadeado tambem restringe a consulta a unidade organizacional
    # vinculada ao usuario atual.
    obj = get_object_or_404(
        PlanoEnsino,
        pk=pk,
        diario__turma__curso_campus__diretoria__setor__uo=(
            request.user.get_vinculo().setor.uo
        ),
    )

    # No GET, data=None cria um form unbound com os dados atuais de obj.
    # No POST, o form recebe os dados enviados.
    # instance=obj informa que o objetivo e atualizar, nao criar.
    form = AlterarCoordenadorPlanoEnsinoForm(
        data=request.POST or None,
        instance=obj,
    )

    # Valida o campo e as regras do model/form.
    if form.is_valid():

        # Copia cleaned_data para instance e salva o PlanoEnsino.
        # O save sobrescrito no model tambem sera executado.
        form.save()

        # Retorna para a pagina anterior com mensagem de sucesso.
        return httprr('..', 'Acao realizada com sucesso.')

    # No GET ou em um POST invalido, entrega title, obj e form ao template.
    return locals()
```

### 4. Papel de `instance`

```text
Sem instance -> ModelForm prepara a criacao de um novo PlanoEnsino.
Com instance -> ModelForm carrega e altera o PlanoEnsino existente.
```

Neste exemplo, `instance=obj` também faz o campo iniciar com o coordenador atual.
Depois de `is_valid()`, `form.save()` atualiza esse mesmo objeto.

Quando for necessário preencher campos que não devem vir do navegador, usa-se
outro fluxo:

```python
obj = form.save(commit=False)
obj.cadastrado_por = request.user
obj.save()
form.save_m2m()
```

`save_m2m()` e necessário quando o form possui campos many-to-many e foi usado
`commit=False`.

### 5. Sequência do fluxo

1. Confira o campo `coordenador_curso` no model.
2. Confira que o form expoe somente esse campo.
3. Identifique o filtro institucional usado para localizar o objeto.
4. Destacar `instance=obj`.
5. Submeter um valor inválido e observar os erros.
6. Submeter um valor válido e acompanhar `form.save()`.
7. Reabrir o objeto e confirmar que o banco foi atualizado.

## G. Relação entre Form, View e Template: relatório de horários

### 1. Função do `RelatorioHorarioForm`

O `RelatorioHorarioForm` e um formulário de filtro, não um formulário de
cadastro. Sua função e:

1. receber ano, período, turma, professor e sala;
2. converter os identificadores enviados em objetos dos models;
3. limitar as salas ao campus do usuário;
4. exigir pelo menos turma, professor ou sala;
5. montar um `QuerySet` de `HorarioAulaDiario`;
6. registrar uma descrição dos filtros aplicados;
7. entregar o resultado para a view por meio de `processar()`.

Como não cria nem altera diretamente um model, ele herda de `FormPlus`, e não de
`ModelFormPlus`.

### 2. Formulário `RelatorioHorarioForm`

O código está em `edu/forms.py:4456-4503`:

A implementação comentada apresenta cada parte do código.

### 3. Estrutura do formulário

```python
# FormPlus e usado porque esta tela filtra uma consulta e nao salva um model.
class RelatorioHorarioForm(forms.FormPlus):

    # Instrui {% render_form %} a gerar method="GET".
    # Os filtros ficam visiveis e reproduziveis na URL.
    METHOD = 'GET'

    # Define o texto do botao de submissao.
    SUBMIT_LABEL = 'Pesquisar'

    # Campo opcional que converte o pk enviado em uma instancia de Turma.
    turma = forms.ModelChoiceFieldPlus(
        Turma.objects,
        label='Turma',
        required=False,

        # Evita carregar todas as turmas em um select comum.
        widget=AutocompleteWidget(

            # Ano e periodo digitados no form restringem a busca AJAX de turmas.
            form_filters=[
                ('ano_letivo', 'ano_letivo'),
                ('periodo_letivo', 'periodo_letivo'),
            ],

            # Define os campos do model pesquisados pelo texto informado.
            search_fields=Turma.SEARCH_FIELDS,
        ),
    )

    # Campo opcional de professor, tambem pesquisado por AJAX.
    professor = forms.ModelChoiceFieldPlus(
        Professor.objects,
        label='Professor',
        required=False,
        widget=AutocompleteWidget(search_fields=Professor.SEARCH_FIELDS),
    )

    # Campo opcional de sala. O queryset sera restringido no __init__.
    sala = forms.ModelChoiceFieldPlus(Sala.ativas, required=False)

    # Ano e periodo sao obrigatorios e participam de toda consulta.
    ano_letivo = forms.ModelChoiceField(
        Ano.objects.ultimos(),
        label='Ano Letivo',
        required=True,
    )
    periodo_letivo = forms.ChoiceField(
        choices=PERIODO_LETIVO_CHOICES,
        label='Periodo Letivo',
        required=True,
    )

    # Organiza os campos no layout do renderizador do SUAP.
    fieldsets = (
        (
            'Filtros de Pesquisa',
            {
                'fields': (
                    ('ano_letivo', 'periodo_letivo'),
                    'turma',
                    'professor',
                    'sala',
                )
            },
        ),
    )

    # user e um argumento adicional exigido por este form.
    def __init__(self, user, *args, **kwargs):

        # Inicializa fields, data, errors e os demais recursos de FormPlus.
        super().__init__(*args, **kwargs)

        # Limita a escolha a salas ativas do campus do usuario.
        self.fields['sala'].queryset = (
            self.fields['sala'].queryset.all().filter(
                ativa=True,
                predio__uo=get_uo(user),
            )
        )

    # Valida a combinacao dos campos e prepara a consulta.
    def clean(self):

        # Os ModelChoiceFields ja devolveram instancias ou None.
        professor = self.cleaned_data['professor']
        turma = self.cleaned_data['turma']
        sala = self.cleaned_data['sala']
        ano_letivo = self.cleaned_data.get('ano_letivo')
        periodo_letivo = self.cleaned_data['periodo_letivo']

        # Impede uma consulta ampla somente por ano e periodo.
        if not (professor or turma or sala):
            raise forms.ValidationError('Informe turma, professor ou sala.')

        # filtros alimentara a caixa "Filtros" do template.
        filtros = []

        # Comeca com todos os horarios e restringe progressivamente.
        qs = HorarioAulaDiario.objects.all()

        if professor:
            qs = qs.filter(diario__professordiario__professor=professor)
            filtros.append(dict(chave='Professor', valor=str(professor)))

        if turma:
            qs = qs.filter(diario__turma=turma)
            filtros.append(dict(chave='Turma', valor=str(turma)))

        if sala:
            qs = qs.filter(diario__local_aula=sala)
            filtros.append(dict(chave='Sala', valor=str(sala)))

        if ano_letivo:
            qs = qs.filter(diario__ano_letivo=ano_letivo)
            filtros.append(dict(chave='Ano Letivo', valor=str(ano_letivo)))

        if int(periodo_letivo):
            qs = qs.filter(diario__periodo_letivo=periodo_letivo)
            filtros.append(
                dict(chave='Periodo Letivo', valor=str(periodo_letivo))
            )

        # Anexa informacoes de apresentacao ao objeto QuerySet.
        qs.filtros = filtros

        # Guarda a consulta pronta nesta instancia do formulario.
        self.qs = qs

        # Mantem os dados limpos como resultado da validacao.
        return self.cleaned_data

    # Metodo do projeto chamado explicitamente pela view depois de is_valid().
    def processar(self):
        return self.qs
```

`self.qs` só e criado durante `clean()`. Por isso, `processar()` deve ser chamado
depois de `form.is_valid()` retornar `True`.

### 4. View do relatório

O código está em `edu/views.py:6330-6369`:

```python
@rtr()
@permission_required('edu.view_horarioauladiario')
def relatorio_horario(request):
    title = 'Listagem de Horarios'
    form = RelatorioHorarioForm(data=request.GET or None, user=request.user)
    if form.is_valid():
        tabelas = TabelasHorario(request=request)
        horarios = form.processar()
        tabela = TabelaHorario(export_to_pdf=True, request=request)
        tabela.filtros = horarios.filtros

        if horarios.exists():
            horarios_disponiveis = (
                horarios.first().diario.horario_campus.horarioaula_set.all()
            )
            for horario in horarios:
                horarios_disponiveis = horarios_disponiveis | (
                    horario.diario.horario_campus.horarioaula_set.all()
                )
        else:
            horarios_disponiveis = []

        prioridade_turnos = {3: 0, 4: 1, 2: 2}
        horarios_disponiveis = sorted(
            horarios_disponiveis,
            key=lambda x: prioridade_turnos.get(x.turno.id, 99),
        )

        for horario in horarios_disponiveis:
            tabela.adicionar_horario(
                horario.turno.descricao,
                horario.inicio,
                horario.termino,
            )
        for horario in horarios:
            hint = 'Componente: {}; Professor(es): {}; Sala: {};'.format(
                horario.diario.componente_curricular.componente.descricao,
                horario.diario.get_nomes_professores(),
                horario.diario.local_aula,
            )
            link = (
                not request.GET.get('pdf')
                and f'/edu/diario/{horario.diario.pk}'
                or ''
            )
            tabela.adicionar_registro(
                horario.diario.componente_curricular.componente.sigla,
                horario.get_horario_formatado(),
                link,
                hint,
            )
        tabelas.adicionar(tabela)
        if request.GET.get('pdf'):
            return tabelas.as_pdf()

    return locals()
```

### 5. Estrutura da view

```python
# Renderiza o dicionario retornado pela view.
@rtr()

# Exige permissao para visualizar horarios de aula de diario.
@permission_required('edu.view_horarioauladiario')
def relatorio_horario(request):

    # Titulo exibido na pagina.
    title = 'Listagem de Horarios'

    # Usa GET porque esta e uma consulta. Tambem entrega o usuario para que o
    # __init__ limite as salas ao campus correto.
    form = RelatorioHorarioForm(
        data=request.GET or None,
        user=request.user,
    )

    # No primeiro acesso o form e unbound. Com filtros validos, entra no bloco.
    if form.is_valid():

        # Conteiner usado quando a resposta solicitada for PDF.
        tabelas = TabelasHorario(request=request)

        # Recupera o QuerySet preparado pelo clean() do form.
        horarios = form.processar()

        # Componente que montara a grade visual de horarios.
        tabela = TabelaHorario(export_to_pdf=True, request=request)

        # Copia para a tabela a descricao dos filtros aplicados.
        tabela.filtros = horarios.filtros

        # Descobre todas as faixas de horario presentes nos campi encontrados.
        if horarios.exists():
            horarios_disponiveis = (
                horarios.first().diario.horario_campus.horarioaula_set.all()
            )
            for horario in horarios:
                horarios_disponiveis = horarios_disponiveis | (
                    horario.diario.horario_campus.horarioaula_set.all()
                )
        else:
            horarios_disponiveis = []

        # Define a ordem visual dos turnos.
        prioridade_turnos = {3: 0, 4: 1, 2: 2}
        horarios_disponiveis = sorted(
            horarios_disponiveis,
            key=lambda x: prioridade_turnos.get(x.turno.id, 99),
        )

        # Cria as linhas/faixas de horario da grade.
        for horario in horarios_disponiveis:
            tabela.adicionar_horario(
                horario.turno.descricao,
                horario.inicio,
                horario.termino,
            )

        # Posiciona cada aula na grade e prepara link e texto auxiliar.
        for horario in horarios:
            hint = 'Componente: {}; Professor(es): {}; Sala: {};'.format(
                horario.diario.componente_curricular.componente.descricao,
                horario.diario.get_nomes_professores(),
                horario.diario.local_aula,
            )

            # No PDF nao deve existir link clicavel para o diario.
            link = (
                not request.GET.get('pdf')
                and f'/edu/diario/{horario.diario.pk}'
                or ''
            )

            tabela.adicionar_registro(
                horario.diario.componente_curricular.componente.sigla,
                horario.get_horario_formatado(),
                link,
                hint,
            )

        # Guarda a tabela no conteiner de exportacao.
        tabelas.adicionar(tabela)

        # O mesmo endpoint devolve PDF quando existe ?pdf=1 na URL.
        if request.GET.get('pdf'):
            return tabelas.as_pdf()

    # Entrega ao template as variaveis locais, incluindo form, horarios e tabela
    # quando elas tiverem sido criadas.
    return locals()
```

### 6. Template do relatório

O código está em `edu/templates/relatorio_horario.html:1-36`:

```django
{% extends super_template %}
{% block content %}

<div id="formbox">{% render_form form %}</div>

<div id="resultadobox">
{% if form.is_valid %}
    <script>
        $('#formbox').hide();
    </script>

    {% box "Filtros" %}
    <ul class="action-bar">
        <li><a class="btn" href="/edu/relatorio_horario/">Limpar Filtros</a></li>
        <li><a class="btn" onclick="javascript:$('#formbox').toggle();$('#resultadobox').toggle();return false;">Alterar Filtros</a></li>
    </ul>
    <table class="info" border="0">
        {% for filtro in horarios.filtros %}
        <tr>
            <td>{{ filtro.chave }}</td>
            <td>{{ filtro.valor }}</td>
        </tr>
        {% endfor %}
    </table>
    {% endbox %}

    {% box "Resultado da Pesquisa ({{ horarios.count }} horarios)" %}
        {% if horarios %}
            {{ tabela }}
        {% else %}
            <p class="msg alert">Nenhum horario encontrado.</p>
        {% endif %}
    {% endbox %}
{% endif %}
</div>
{% endblock %}
```

### 7. Estrutura do template

```django
{# Herda a estrutura visual padrao da instalacao. #}
{% extends super_template %}

{# Substitui o bloco principal da pagina. #}
{% block content %}

{# render_form gera a tag form, os campos, os erros e o botao Pesquisar. #}
<div id="formbox">{% render_form form %}</div>

{# Agrupa a area que sera exibida depois da pesquisa. #}
<div id="resultadobox">

{# No template, Django chama automaticamente metodos sem argumentos.
   Assim, form.is_valid equivale a form.is_valid(). A validacao ja foi
   executada pela view e seu resultado fica armazenado no objeto form. #}
{% if form.is_valid %}

    {# Depois de uma pesquisa valida, esconde inicialmente o formulario. #}
    <script>
        $('#formbox').hide();
    </script>

    {# Abre um componente visual do SUAP para os filtros usados. #}
    {% box "Filtros" %}

    {# Acoes para limpar ou reabrir os filtros. #}
    <ul class="action-bar">
        <li><a class="btn" href="/edu/relatorio_horario/">Limpar Filtros</a></li>
        <li><a class="btn" onclick="javascript:$('#formbox').toggle();$('#resultadobox').toggle();return false;">Alterar Filtros</a></li>
    </ul>

    {# Percorre a lista criada em RelatorioHorarioForm.clean(). #}
    <table class="info" border="0">
        {% for filtro in horarios.filtros %}
        <tr>
            <td>{{ filtro.chave }}</td>
            <td>{{ filtro.valor }}</td>
        </tr>
        {% endfor %}
    </table>
    {% endbox %}

    {# Django tambem chama horarios.count() ao resolver horarios.count. #}
    {% box "Resultado da Pesquisa ({{ horarios.count }} horarios)" %}

        {# Um QuerySet vazio e avaliado como falso. #}
        {% if horarios %}

            {# Converte o objeto TabelaHorario em seu HTML. #}
            {{ tabela }}
        {% else %}
            <p class="msg alert">Nenhum horario encontrado.</p>
        {% endif %}
    {% endbox %}
{% endif %}
</div>
{% endblock %}
```

O `{% render_form form %}` está implementado em
`djtools/templatetags/tags/utils.py:220-285` e usa
`djtools/templates/form.html`. Ele gera automaticamente:

- a tag `<form>`;
- o método GET definido por `METHOD`;
- fieldsets, campos e mensagens de erro;
- o botão com `SUBMIT_LABEL`;
- CSRF quando o método e POST;
- `multipart/form-data` quando existe upload.

Por isso, não se deve colocar `{% render_form form %}` dentro de outra tag
`<form>`.

### 8. Como `{{ tabela }}` chega ao template

Na view, `tabela` não e uma string comum. Ela e uma instância de
`TabelaHorario`, criada em `edu/views.py:6338`:

```python
tabela = TabelaHorario(export_to_pdf=True, request=request)
```

Quando o template encontra:

```django
{{ tabela }}
```

o mecanismo de templates precisa transformar o objeto em texto. Para isso, usa
sua representacao textual. `TabelaHorario.__str__()`, implementado em
`djtools/ui/__init__.py:110-117`, faz:

```python
def __str__(self):
    return self.render('tabela_horarios.html')
```

O método herdado `Component.render()`, em `djtools/ui/__init__.py:7-22`,
renderiza outro template:

```python
def render(self, template_name):
    return render_to_string(template_name, {'self': self})
```

Portanto, o fluxo real e:

```text
{{ tabela }}
-> converte o objeto TabelaHorario para texto
-> chama TabelaHorario.__str__()
-> chama Component.render('tabela_horarios.html')
-> renderiza a grade de horarios em HTML
-> insere esse HTML na pagina do relatorio
```

Antes disso, a view preenche o objeto com:

- `adicionar_horario()`, que cria as faixas de horario;
- `adicionar_registro()`, que posiciona cada disciplina na grade;
- `filtros`, usados como metadados do resultado.

`{{ tabela }}` não consulta o banco nem monta os filtros. Ele apenas solicita a
representacao HTML do componente que a view já preparou.

## H. Recursos específicos do SUAP

Os recursos `Plus` do SUAP ampliam os formulários do Django com widgets, querysets dinâmicos, filtros dependentes e campos para upload. Nesta seção, cada recurso é relacionado ao problema que resolve e ao ponto em que entra no ciclo do formulário.

### 1. Campos Plus

Um **campo de formulário** representa uma entrada específica, como nome, data, aluno, CPF ou arquivo. O Django fornece campos como `CharField`, `DateField`, `ModelChoiceField` e `FileField`. O SUAP acrescenta versões `Plus`, implementadas no DJTools, para integrar esses campos aos widgets, estilos e convenções do sistema.

É importante separar os conceitos:

- `CharFieldPlus` e `ModelChoiceFieldPlus` são **campos**;
- `FormPlus` é uma **classe de formulário** que reúne campos e regras;
- um formulário pode usar campos `Plus` mesmo quando herda diretamente de `forms.Form`;
- usar um campo `Plus` não transforma automaticamente o formulário em `FormPlus`;
- o campo cuida da entrada, conversão e validação do próprio valor, mas não substitui as regras do formulário, da view ou do model.

No EDU, os recursos são importados normalmente pelo namespace do DJTools:

```python
from djtools import forms
```

A partir desse import, os campos podem ser declarados dentro de qualquer formulário compatível:

```python
class CadastroMaterialForm(forms.Form):
    descricao = forms.CharFieldPlus(
        label='Descrição',
        required=True,
    )
    data_publicacao = forms.DateFieldPlus(
        label='Data de publicação',
        required=False,
    )
    arquivo = forms.FileFieldPlus(
        label='Arquivo PDF',
        required=True,
    )
```

Nesse exemplo:

- `CharFieldPlus` recebe um texto e usa os recursos visuais do SUAP;
- `DateFieldPlus` converte a entrada para um objeto de data;
- `FileFieldPlus` valida um arquivo enviado e participa do fluxo de `request.FILES`;
- nenhum desses campos salva o registro sozinho: a view ou o `ModelForm` ainda precisa processar os dados válidos.

Para campos relacionados a models, o SUAP oferece campos de escolha que trabalham com querysets:

A implementação comentada apresenta cada parte do código.

O navegador envia os identificadores selecionados, mas depois da validação o formulário entrega instâncias dos models em `cleaned_data`:

```python
if form.is_valid():
    turma = form.cleaned_data['turma']
    alunos = form.cleaned_data['alunos']
```

Assim, `turma` pode ser uma instância de `Turma`, e `alunos` pode ser um queryset ou conjunto de instâncias de `Aluno`, conforme o campo utilizado. A conversão do identificador para o objeto acontece durante a validação do campo.

O campo especializado `BrCpfField` aplica regras próprias para CPF:

```python
class PessoaForm(forms.Form):
    cpf = forms.BrCpfField(
        label='CPF',
        required=True,
    )
```

A escolha do campo deve acompanhar o tipo de entrada e a interação esperada:

| Necessidade | Campo indicado | O que ele resolve |
|---|---|---|
| Texto simples | `CharFieldPlus` | Entrada textual integrada ao padrão visual do SUAP |
| Data | `DateFieldPlus` | Conversão e validação de datas |
| Um objeto relacionado | `ModelChoiceFieldPlus` | Seleção de uma instância de model |
| Vários objetos relacionados | `MultipleModelChoiceFieldPlus` | Seleção de várias instâncias |
| CPF | `BrCpfField` | Formatação e validação específica de CPF |
| Arquivo | `FileFieldPlus` | Validação e integração com upload |

Os campos `Plus` facilitam a integração visual e técnica com o SUAP, mas a segurança continua dependendo do queryset correto, das permissões e das validações aplicadas no fluxo completo.

### 2. `AutocompleteWidget`

`AutocompleteWidget` não e nativo do Django. O Django fornece widgets como
`Select`, `TextInput` e `SelectMultiple`. O `AutocompleteWidget` e implementado
pelo DJTools/SUAP em `djtools/forms/widgets/__init__.py:566-723` e herda do
`Select` do Django:

```python
class AutocompleteWidget(Select):
    ...
```

Ele deve ser usado quando o conjunto de opcoes e grande. Em vez de colocar
milhares de alunos, professores ou turmas no HTML inicial, o navegador solicita
pequenos grupos de resultados conforme o usuário pesquisa.

Exemplo real em `edu/forms.py:4459`:

```python
widget=AutocompleteWidget(
    form_filters=[
        ('ano_letivo', 'ano_letivo'),
        ('periodo_letivo', 'periodo_letivo'),
    ],
    search_fields=Turma.SEARCH_FIELDS,
)
```

#### Estrutura da implementação

##### 1. Recursos visuais

O `AutocompleteWidget` precisa de recursos no navegador para oferecer a busca enquanto o usuário digita. Esses recursos são declarados pela classe interna `Media`, em `djtools/forms/widgets/__init__.py:567-570`.

No Django, `Media` informa quais arquivos JavaScript e CSS devem ser incluídos quando o widget é renderizado. No SUAP, essa declaração conecta o campo do formulário à biblioteca Select2 e aos scripts de comportamento do DJTools:

```python
class Media(PipelineFormMedia):
    js = (
        '/static/djtools/jquery/jquery.maskedinput.js',
        '/static/djtools/jquery/widgets-core.js',
    )
    js_packages = ('select2',)
    css_packages = {'all': ('select2',)}
```

Cada parte tem uma função:

- `js` lista scripts estáticos usados pelo widget e por outros componentes do DJTools;
- `js_packages = ('select2',)` solicita os arquivos JavaScript do Select2;
- `css_packages = {'all': ('select2',)}` solicita os estilos do Select2 para todos os meios de exibição;
- `PipelineFormMedia` integra esses recursos ao sistema de mídia usado pelo SUAP.

Sem esses recursos, o campo ainda poderia aparecer como um `<select>` HTML básico, mas perderia a busca incremental, o carregamento assíncrono, os estilos e os comportamentos adicionados pelo Select2.

A diferença visual pode ser resumida assim:

```text
Select padrão do Django
-> navegador recebe todas as opções
-> usuário percorre uma lista extensa

AutocompleteWidget
-> navegador carrega a estrutura do campo
-> Select2 ativa a busca no campo
-> usuário digita parte do texto
-> JavaScript solicita resultados ao endpoint
-> opções filtradas são exibidas
```

Um formulário usa o widget no campo relacionado ao model:

A implementação comentada apresenta cada parte do código.

Quando o template renderiza esse formulário, o Django combina o campo, o widget e os recursos definidos em `Media`. O HTML inicial contém o campo e os atributos necessários; os arquivos Select2 e os scripts do DJTools completam o comportamento no navegador.

O componente visual utiliza a biblioteca Select2. O widget e a integração com essa biblioteca são fornecidos pelo DJTools e não fazem parte do widget `Select` padrão do Django. A aparência melhora a pesquisa, mas a validação do valor escolhido continua sendo feita pelo campo e pelo queryset do formulário.

##### 2. Parâmetros do construtor

O construtor de `AutocompleteWidget`, implementado em `djtools/forms/widgets/__init__.py:572-639`, recebe as informações que definem como o campo será pesquisado e quais dados serão enviados ao endpoint AJAX. Esses parâmetros configuram o widget; eles não substituem a validação feita pelo campo ou pelo queryset.

| Parâmetro | Conceito | Exemplo de uso |
|---|---|---|
| `url` | Substitui o endpoint AJAX escolhido automaticamente | Buscar resultados em uma URL específica |
| `form_filters` | Envia valores de outros campos para filtrar a consulta | Filtrar turmas por ano e período |
| `search_fields` | Define os campos pesquisados pelo texto digitado | Buscar por código, nome ou descrição |
| `manager_name` | Escolhe o manager usado para montar o queryset | Usar `ativas` em vez de `objects` |
| `qs_filter` | Aplica um filtro fixo à consulta | Restringir registros ativos |
| `readonly` | Exibe o valor sem permitir nova seleção | Mostrar uma relação somente para leitura |
| `multiple` | Permite selecionar vários objetos | Escolher vários alunos |
| `submit_on_select` | Envia o formulário ao selecionar um item | Aplicar imediatamente uma escolha |

Um exemplo com campos dependentes é o filtro de turma do relatório de horários:

```python
widget=AutocompleteWidget(
    form_filters=[
        ('ano_letivo', 'ano_letivo'),
        ('periodo_letivo', 'periodo_letivo'),
    ],
    search_fields=Turma.SEARCH_FIELDS,
)
```

Nesse caso:

- `search_fields` informa quais atributos de `Turma` serão pesquisados pelo texto digitado;
- `form_filters` informa que os valores de `ano_letivo` e `periodo_letivo` também devem acompanhar a requisição;
- o endpoint usa esses valores para devolver somente as turmas compatíveis;
- o campo continua validando se o identificador escolhido pertence ao queryset permitido.

Um segundo exemplo usa um manager e um filtro fixo:

```python
sala = forms.ModelChoiceFieldPlus(
    Sala.ativas,
    widget=AutocompleteWidget(
        manager_name='ativas',
        search_fields=('nome', 'predio__nome'),
        qs_filter={'predio__uo': get_uo(request.user)},
    ),
)
```

A configuração acima expressa três decisões diferentes:

1. a consulta parte do conjunto de salas ativas;
2. a busca textual considera o nome da sala e do prédio;
3. o resultado fica limitado à unidade organizacional do usuário.

O construtor verifica os tipos de alguns parâmetros antes de montar as opções do JavaScript:

```python
if form_filters:
    if not isinstance(form_filters, (tuple, list)):
        raise ValueError('`form_filters` deve ser lista ou tupla')
    options['extraParams']['form_parameter_names'] = json.dumps(form_filters)

if search_fields:
    if not isinstance(search_fields, (tuple, list)):
        raise ValueError('`search_fields` deve ser lista ou tupla')
    options['extraParams']['search_fields'] = ','.join(search_fields)
```

O fluxo dos parâmetros é:

```text
argumentos do AutocompleteWidget
        |
__init__() valida e organiza as opções
        |
atributos extraParams são enviados ao JavaScript
        |
Select2 envia texto e filtros ao endpoint
        |
endpoint monta e restringe o queryset
        |
resultado JSON volta para o campo
```

A configuração do widget melhora a pesquisa e a experiência de uso, mas a segurança depende de o backend reconstruir e validar o queryset permitido. Um parâmetro visual ou enviado pelo navegador nunca deve ser tratado como autorização.
##### 3. Renderização

O método `render()`, implementado em `djtools/forms/widgets/__init__.py:641-723`, é chamado quando o Django precisa transformar o widget em HTML. Ele recebe o nome do campo, o valor atual e os atributos HTML e devolve a marcação que será inserida no template.

No `AutocompleteWidget`, a renderização prepara duas partes do componente:

- o elemento HTML que representa o campo;
- as configurações que o JavaScript usará para buscar opções no endpoint AJAX.

Primeiro, o widget identifica o model associado ao queryset e monta uma URL padrão quando nenhuma URL foi informada:

```python
model_cls = self.choices.queryset.model
self.url = self.url or (
    f'/json/{model_cls._meta.app_label}/{model_cls.__name__.lower()}/'
)
```

Por exemplo, se o campo usa `Turma.objects`, o widget pode montar uma URL semelhante a:

```text
/json/edu/turma/
```

Depois, o método reúne os dados necessários para o template:

```python
context = dict(
    id=self.id_,
    values=values,
    options=self.options,
    form_filters=self.form_filters,
    name=name,
    url=self.url,
    control=timeless_dump_qs(self.choices.queryset.all().query),
    # demais opções... 
)
output = render_to_string(
    'djtools/templates/widgets/select2.html',
    context,
)
return mark_safe(output)
```

Cada item do contexto tem uma função:

- `id` e `name` identificam o campo no HTML e permitem que o formulário envie o valor selecionado;
- `values` representa os valores já escolhidos, especialmente quando o formulário é reexibido;
- `options` reúne as configurações do Select2 e dos scripts do DJTools;
- `form_filters` informa quais campos dependentes devem acompanhar a busca;
- `url` indica o endpoint que fornecerá os resultados;
- `control` representa a consulta-base permitida para o campo.

O template `djtools/templates/widgets/select2.html` usa esse contexto para gerar a estrutura visual. A saída pode ser entendida conceitualmente como:

```html
<select id="id_turma" name="turma" data-autocomplete-url="/json/edu/turma/">
    <!-- o JavaScript transforma este select em um campo Select2 -->
</select>
```

O fluxo completo da renderização é:

```text
Django encontra o campo no formulário
        |
campo chama o widget
        |
AutocompleteWidget.render() monta o contexto
        |
select2.html gera o HTML inicial
        |
JavaScript lê data-autocomplete-url e options
        |
Select2 ativa a busca e a seleção no navegador
```

`render()` prepara a interface, mas não realiza sozinho a consulta final nem autoriza o acesso aos dados. O endpoint ainda precisa reconstruir o queryset, aplicar permissões e devolver somente os objetos permitidos.

`mark_safe()` informa ao Django que a string retornada já contém HTML intencionalmente gerado pelo sistema. Por isso, os valores inseridos no contexto precisam ser preparados com segurança antes da renderização.
##### 4. Consulta AJAX

AJAX é a técnica que permite ao navegador solicitar dados ao servidor sem recarregar toda a página. No `AutocompleteWidget`, ela é usada para buscar somente as opções relacionadas ao texto digitado, em vez de carregar todos os registros no HTML inicial.

O template `djtools/templates/widgets/select2.html:59-120` inicializa o Select2. Quando o usuário digita, o JavaScript monta uma requisição para o endpoint do widget e envia informações como:

- `q`: texto pesquisado;
- `control`: queryset-base serializado;
- `search_fields`: campos pesquisáveis;
- `filter_pks`: valores dos campos dependentes;
- `page`: página dos resultados.

Uma requisição conceitual pode ser representada assim:

```text
GET /json/edu/turma/?q=Informática&page=1&...
```

O endpoint genérico está registrado em `suap/urls.py:34`:

```python
path('json/<str:app_name>/<str:class_name>/', utils.json_view),
```

Para a busca de turmas, a URL pode ser semelhante a:

```text
/json/edu/turma/
```

A view `json_view`, implementada em `djtools/utils/__init__.py:928-1014`, executa as etapas principais:

1. identifica o aplicativo e o model a partir da URL;
2. localiza o queryset-base enviado pelo widget;
3. verifica autenticação e as condições de acesso aos dados;
4. aplica filtros e campos de pesquisa;
5. pagina os resultados;
6. devolve os itens no formato esperado pelo Select2.

Os filtros recebidos de outros campos são aplicados em `djtools/utils/__init__.py:1162-1166`:

```python
if form_filters:
    for k, v in form_filters:
        qs = qs.filter(**{k: v})

return generate_autocomplete_dict(
    qs, page, label_value, ext_combo_template
)
```

Em um formulário que filtra turmas por ano e período, o fluxo fica:

```text
usuário digita parte do nome da turma
        |
Select2 envia q, page e os filtros dependentes
        |
json_view identifica edu.Turma
        |
queryset aplica search_fields e form_filters
        |
resultados são paginados
        |
JSON retorna id e texto de cada opção
        |
Select2 atualiza a lista no campo
```

Uma resposta simplificada pode ter esta estrutura:

```json
{
  "results": [
    {"id": 120, "text": "Informática 2026.1"},
    {"id": 135, "text": "Informática 2026.2"}
  ],
  "pagination": {"more": true}
}
```

`id` é o valor enviado pelo formulário. Depois de `is_valid()`, um `ModelChoiceFieldPlus` converte esse identificador na instância correspondente do model. `text` é o rótulo mostrado ao usuário, e `pagination.more` informa ao Select2 que ainda existem resultados para a próxima página.

A consulta AJAX melhora o desempenho, mas não constitui uma barreira de segurança. O endpoint deve reconstruir o queryset permitido e verificar autenticação, permissões e escopo. Um usuário pode alterar manualmente os parâmetros da URL; por isso, o backend nunca deve confiar apenas nos filtros enviados pelo navegador.
#### Como funcionam os `form_filters`

No exemplo do relatório:

```python
form_filters=[
    ('ano_letivo', 'ano_letivo'),
    ('periodo_letivo', 'periodo_letivo'),
]
```

Cada tupla significa:

```text
(nome do campo no formulario, lookup aplicado ao model pesquisado)
```

Assim, antes de buscar turmas, o JavaScript le os valores de `ano_letivo` e
`periodo_letivo`. O endpoint aplica esses valores ao queryset de `Turma`. O
código que coleta os valores no navegador está em
`djtools/static/djtools/select2/js/select2.custom.js:1-23`.

Fluxo completo:

```text
usuario digita no campo Turma
-> Select2 espera 250 ms
-> envia q, queryset e filtros para /json/edu/turma/
-> json_view localiza o model Turma
-> generic_search_json filtra ano, periodo e texto
-> endpoint devolve itens JSON paginados
-> Select2 apresenta as opcoes
-> o pk escolhido e enviado com o formulario
-> ModelChoiceFieldPlus converte o pk em uma instancia de Turma
```

O autocomplete melhora desempenho e usabilidade, mas não substitui autorizacao.
O queryset-base, o manager e a view final ainda precisam respeitar o escopo de
acesso do usuário.

### 3. Campos e querysets dinâmicos no `__init__`

Um formulário é declarado uma vez como classe, mas cada tela pode precisar de campos e opções diferentes. O método `__init__()` é executado a cada nova instância e permite configurar o formulário de acordo com o usuário, o campus, o objeto em edição ou os dados recebidos na requisição.

Essa configuração acontece depois que `super().__init__()` cria `self.fields`. Por isso, a ordem é importante:

```text
view envia o contexto
        |
__init__() chama super()
        |
Django cria self.fields
        |
form ajusta campos e querysets para esta instância
        |
template renderiza somente as opções permitidas
```

O `__init__()` pode:

- definir valores iniciais;
- limitar um queryset pelo campus ou pela unidade do usuário;
- preencher um campo com base em outro objeto;
- esconder ou remover campos;
- alterar `required`, `label` ou `widget`;
- receber objetos adicionais da view, como `user`, `campus` ou uma instância relacionada.

Um exemplo restringe as salas ao campus do usuário:

```python
class RelatorioSalaForm(forms.FormPlus):
    sala = forms.ModelChoiceFieldPlus(
        Sala.ativas,
        label='Sala',
        required=False,
    )

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['sala'].queryset = Sala.ativas.filter(
            predio__uo=get_uo(user),
        )
```

Quando a view instancia o formulário, ela fornece o usuário:

```python
form = RelatorioSalaForm(
    user=request.user,
    data=request.GET or None,
)
```

Assim, dois usuários podem receber a mesma tela com conjuntos de salas diferentes. O campo continua sendo o mesmo, mas seu queryset é configurado para cada instância.

Também é possível configurar valores iniciais e campos dependentes:

A implementação comentada apresenta cada parte do código.

Nesse caso, `curso` começa com `none()` para não carregar todos os cursos. Depois que a view informa o campus, o queryset é preenchido apenas com cursos ativos daquele campus. Se nenhum campus for informado, a lista permanece vazia.

Campos também podem ser ajustados conforme o contexto:

```python
def __init__(self, somente_leitura=False, *args, **kwargs):
    super().__init__(*args, **kwargs)
    if somente_leitura:
        self.fields['descricao'].disabled = True
        self.fields['observacao'].required = False
```

Essas alterações afetam a instância atual do formulário. Elas não modificam a declaração da classe nem os formulários já criados.

Fluxo de segurança:

```text
queryset limitado no __init__
        |
opções permitidas aparecem no formulário
        |
usuário envia um identificador
        |
campo e view validam novamente o objeto
        |
somente dados autorizados são processados
```

O filtro aplicado no `__init__()` melhora a experiência e reduz as opções exibidas, mas não deve ser a única proteção. A view, o model ou a regra de domínio também precisam verificar o escopo e as permissões antes de consultar ou salvar dados.
### 4. Upload e validação de arquivos

Um upload envolve mais do que declarar um campo. O fluxo completo e:

```text
<input type="file">
-> formulario HTML multipart/form-data
-> request.FILES
-> FileField converte e valida o arquivo
-> cleaned_data
-> model salva o arquivo no storage
-> banco guarda a referencia/caminho usado pelo storage
```

Em uma view personalizada, dados e arquivos precisam ser entregues ao form:

```python
form = MeuUploadForm(
    data=request.POST or None,
    files=request.FILES or None,
)
```

No admin, essa associacao e feita pelo próprio Django. O template do DJTools
também detecta `form.is_multipart` e acrescenta o atributo necessário em
`djtools/templates/form.html:10-13`:

```django
<form
    method="{{ form.METHOD|default:'POST' }}"
    {% if form.is_multipart %}enctype="multipart/form-data"{% endif %}>
```

Sem `multipart/form-data` e sem `request.FILES`, o arquivo não chega ao form,
mesmo que os outros campos do POST funcionem.

#### Exemplo real: model `MaterialAula`

O código está em `edu/models/diarios.py:1778-1800`:

```python
class MaterialAula(LogModel):
    professor = models.ForeignKeyPlus(
        'edu.Professor',
        null=False,
        verbose_name='Professor',
        on_delete=models.CASCADE,
    )
    descricao = models.CharFieldPlus(
        width=500,
        null=False,
        verbose_name='Descricao',
    )
    data_cadastro = models.DateTimeField(
        auto_now_add=True,
        null=False,
        verbose_name='Data de Cadastro',
    )
    arquivo = models.FileFieldPlus(
        upload_to='edu/material_aula/',
        null=True,
        blank=True,
        verbose_name='Upload do arquivo',
    )
    url = models.CharFieldPlus(
        width=500,
        null=True,
        blank=True,
        verbose_name='Url do arquivo',
    )
    publico = models.BooleanField(
        verbose_name='Publico',
        default=False,
    )
```

O campo `arquivo` e opcional porque o material também pode ser representado por
uma URL. `upload_to='edu/material_aula/'` define o diretorio logico dentro do
storage. O banco normalmente guarda o nome/referência do arquivo; os bytes ficam
no storage configurado pela instalacao.

#### Implementação de `FileFieldPlus`

O campo de formulário `FileFieldPlus` não e nativo do Django. Ele e uma extensao
do DJTools sobre `django.forms.FileField`, implementada em
`djtools/forms/fields/__init__.py:230-357`:

```python
class FileFieldPlus(forms.FileField):
    widget = ClearableFileInputPlus

    def __init__(self, *args, **kwargs):
        self.filetypes = kwargs.pop('filetypes', None)
        self.check_mimetype = kwargs.pop('check_mimetype', True)
        self.max_file_size = kwargs.pop('max_file_size', None)
        if not self.max_file_size:
            self.max_file_size = settings.DEFAULT_FILE_UPLOAD_MAX_SIZE
        super().__init__(*args, **kwargs)

    def clean(self, *args, **kwargs):
        value = super().clean(*args, **kwargs)
        if value:
            # valida extensao e MIME quando filetypes foi informado
            # valida tamanho quando max_file_size foi informado/configurado
            ...
        return value
```

Os principais parâmetros adicionais são:

| Parâmetro | Função |
|---|---|
| `filetypes` | Lista tipos permitidos, como `['pdf', 'png', 'jpg']` |
| `check_mimetype` | Define se o MIME real/declarado também será conferido |
| `max_file_size` | Define o tamanho maximo em bytes |
| `widget_custom_cls` | Permite trocar o widget de upload |

Entre `djtools/forms/fields/__init__.py:261-317`, `get_extensions()` e
`get_mimetypes()` transformam tipos simples como `pdf` em extensoes e MIME types
permitidos. Em `:329-357`, `clean()`:

1. chama a validação do `FileField` do Django;
2. identifica o MIME com `python-magic`, quando disponível;
3. compara extensao e MIME com as listas permitidas;
4. retorna o ponteiro do arquivo ao início com `seek(0)`;
5. confere o tamanho maximo;
6. levanta `ValidationError` se alguma regra falhar.

Validar apenas a extensao não e suficiente, pois o nome do arquivo pode ser
alterado. A verificacao conjunta de extensao e MIME reduz esse risco, embora
validacoes específicas ainda possam ser necessárias para formatos sensiveis.

#### Campo especializado `MaterialAulaFileField`

O código está em `edu/forms.py:5889-5896`:

```python
class MaterialAulaFileField(forms.FileFieldPlus):
    def clean(self, data, initial=None):
        if initial and not isinstance(data, UploadedFile):
            return FileField.clean(self, data, initial)
        return super().clean(data, initial)
```

Esse campo trata de modo diferente dois cenarios:

- **novo upload:** `data` e um `UploadedFile`; a chamada a `super().clean()`
  executa as validacoes de `FileFieldPlus`;
- **edição sem substituir o arquivo:** existe `initial`, mas `data` não e um
  novo `UploadedFile`; o campo preserva o arquivo atual usando a limpeza do
  `FileField` do Django.

Essa especialização foi criada para evitar que a edição de um material tente
tratar o arquivo já armazenado como se fosse um novo upload.

#### Form organizado para leitura: `MaterialAulaForm`

O código está em `edu/forms.py:5898-5959`:

```python
class MaterialAulaForm(forms.ModelFormPlus):
    tipo = forms.ChoiceField(
        choices=[[1, 'Upload'], [2, 'Link']],
        widget=forms.RadioSelect(),
        initial=1,
    )
    arquivo = MaterialAulaFileField(
        help_text='Tamanho maximo permitido: 15MB.',
        required=False,
    )
    diarios = forms.MultipleModelChoiceField(
        Diario.objects.none(),
        label='',
        widget=RenderableSelectMultiple(
            'widgets/diarios_cadastro_material_widget.html'
        ),
        required=False,
    )

    class Meta:
        model = MaterialAula
        fields = ['descricao', 'arquivo', 'url', 'publico']

    class Media:
        js = ('/static/edu/js/MaterialAulaForm.js',)

    fieldsets = (
        ('Dados Gerais', {'fields': ('descricao', 'tipo', 'publico')}),
        ('Arquivo', {'fields': ('arquivo', 'url')}),
        ('Diarios', {'fields': ('diarios',)}),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['tipo'].initial = self.instance.arquivo and 1 or 2
        self.fields['diarios'].queryset = self.qs_diarios()
        self.fields['diarios'].initial = MaterialDiario.objects.filter(
            material_aula=self.instance.pk
        ).values_list('professor_diario__diario', flat=True)

    def clean(self):
        arquivo = self.cleaned_data.get('arquivo')
        url = self.cleaned_data.get('url')

        if isinstance(arquivo, UploadedFile):
            tamanho_maximo_permitido = 15 * 1024 * 1024
            if len(arquivo.name) > 70:
                raise forms.ValidationError(
                    'O nome do arquivo deve conter no maximo 70 caracteres.'
                )
            if arquivo.size > tamanho_maximo_permitido:
                raise forms.ValidationError(
                    'O tamanho maximo permitido para o arquivo e 15MB.'
                )

        if not arquivo and not url:
            raise forms.ValidationError('Faca upload ou insira uma url.')
        return self.cleaned_data

    def save(self, *args, **kwargs):
        obj = super().save(False)
        obj.professor = Professor.objects.get(vinculo__user=self.request.user)
        obj.save()

        professor = Professor.objects.get(vinculo__user=self.request.user)
        todos_diarios = self.qs_diarios()

        for diario in todos_diarios:
            professor_diario = ProfessorDiario.objects.get(
                professor=professor,
                diario=diario,
            )
            material_diario = MaterialDiario.objects.filter(
                professor_diario=professor_diario,
                material_aula=obj,
            )
            if material_diario.exists() and diario not in self.cleaned_data['diarios']:
                material_diario.delete()
            elif not material_diario.exists() and diario in self.cleaned_data['diarios']:
                MaterialDiario.objects.create(
                    professor_diario=professor_diario,
                    material_aula=obj,
                )

        return obj
```

#### Explicação da implementação

`tipo` e `diarios` são campos auxiliares: eles não aparecem em `Meta.fields` e
não são salvos automaticamente no model `MaterialAula`.

A classe `Media` inclui
`edu/static/edu/js/MaterialAulaForm.js:1-31`. Esse JavaScript alterna visualmente
entre o campo de arquivo e o campo de URL. Essa troca melhora a interface, mas a
regra real continua no backend em `clean()`.

O `clean()` aplica duas regras adicionais:

- para um novo `UploadedFile`, limita o nome a 70 caracteres e o tamanho a
  15 MB;
- exige pelo menos um arquivo ou uma URL.

O `save()` executa um fluxo personalizado:

1. `super().save(False)` equivale a `super().save(commit=False)`;
2. o objeto ainda não foi persistido;
3. o professor e obtido do usuário autenticado, e não do navegador;
4. `obj.save()` persiste o model e envia o arquivo ao storage;
5. os registros `MaterialDiario` são incluidos ou excluidos manualmente;
6. o objeto salvo e devolvido ao admin.

O campo `diarios` não e um `ManyToManyField` direto de `MaterialAula`. A relação
passa pelo model intermediario `MaterialDiario`, em
`edu/models/diarios.py:1813-1815`; por isso o form sincroniza esses registros
manualmente, em vez de chamar `save_m2m()`.

#### Integração com o admin

`MaterialAulaAdmin`, em `edu/admin.py:2398-2405`, associa o form:

```python
class MaterialAulaAdmin(ModelAdminPlus):
    list_display = ('descricao', 'data_cadastro', 'professor')
    form = MaterialAulaForm
    fieldsets = MaterialAulaForm.fieldsets
```

O `ModelAdminPlus` disponibiliza o `request` ao formulário. Isso permite que
`MaterialAulaForm.save()` determine o professor por
`self.request.user`, sem expor um campo de professor que poderia ser adulterado
no POST.

#### Checklist para novos uploads

1. Usar POST e `multipart/form-data`.
2. Entregar `request.FILES` ao form em views personalizadas.
3. Definir extensoes e MIME types permitidos quando o formato for conhecido.
4. Limitar tamanho no backend, não apenas no JavaScript.
5. Normalizar ou limitar nomes de arquivos.
6. Não confiar somente no MIME informado pelo navegador.
7. Verificar quem pode criar, visualizar e baixar o arquivo.
8. Usar storage privado quando o documento possuir dados sensiveis.
9. Salvar campos de autoria a partir de `request.user`.
10. Testar criação, substituicao, manutencao e remocao do arquivo.

## I. Atividades práticas

As atividades reúnem os conceitos em fluxos completos. Cada uma mostra os arquivos envolvidos, a ordem das operações e os testes necessários para verificar o resultado.

Para manter a duração total de duas horas, o instrutor pode implementar um dos
exemplos integralmente e conduzir os demais como exercicios guiados. Todos os
As atividades permanecem completas para consulta e repetição posterior.

### 1. Gerar relatórios em PDF

#### 1. Ficha resumida de aluno

##### Objetivo da atividade

Criar uma tela que recebe a matricula, valida se o aluno existe dentro do escopo permitido e gera uma ficha resumida em PDF.

Fluxo final:

```text
/edu/ficha_resumida_aluno/
        |
Formulario de matricula
        |
Validacao
        |
Redirect
        |
/edu/ficha_resumida_aluno_pdf/<pk>/
        |
PDF autenticavel
```

Esta implementação deve ser testada em ambiente isolado antes de ser incorporada ao sistema.

##### 1. Criar o form

O arquivo `forms.py` concentra a definição dos campos, os tipos de entrada e as regras de validação. Nesta etapa, o form transforma os dados recebidos em valores que a view poderá consultar, salvar ou usar para gerar o relatório.

Arquivo: `edu/forms.py`.

Criar perto dos forms de relatório:

```python
# Formulario que localiza um aluno e prepara os dados do PDF.
class FichaResumidaAlunoForm(forms.FormPlus):
    # Texto do botao exibido pelo renderizador do SUAP.
    SUBMIT_LABEL = 'Gerar PDF'

    matricula = forms.CharFieldPlus(
        label='Matricula',
        required=True,
        max_length=30,
        help_text='Informe a matricula completa do aluno.',
    )

    fieldsets = (
        ('Identificacao do aluno', {
            'fields': ('matricula',),
        }),
    )

    # Localiza a matricula e aplica o escopo de acesso do usuario.
    def clean_matricula(self):
        matricula = self.cleaned_data['matricula'].strip()

        self.aluno = (
            Aluno.locals
            .select_related(
                'pessoa_fisica',
                'curso_campus',
                'curso_campus__diretoria__setor__uo',
                'situacao',
                'ano_letivo',
                'matriz',
            )
            .filter(matricula=matricula)
            .first()
        )

        if not self.aluno:
            raise forms.ValidationError(
                'Aluno nao encontrado ou fora do seu escopo de acesso.'
            )

        return matricula

    # Entrega o aluno validado para a view gerar o PDF.
    def processar(self):
        return self.aluno
```

Aspectos importantes:

- `clean_matricula()` valida apenas o campo matricula;
- `strip()` remove espacos acidentais;
- `Aluno.locals` respeita o recorte local do usuário;
- `select_related()` evita consultas adicionais no template PDF;
- o aluno localizado e guardado em `self.aluno`;
- `processar()` só pode ser chamado depois de `is_valid()`.

##### 2. Importar o form na view

A view precisa importar o formulário para criar sua instância e conectá-la à requisição. Essa ligação permite entregar `GET`, `POST` e, quando necessário, `FILES` ao form.

Arquivo: `edu/views.py`, no bloco de imports de `edu.forms`:

```python
from edu.forms import (
    ...,
    FichaResumidaAlunoForm,
)
```

##### 3. Criar as URLs

O arquivo `urls.py` associa um endereço a uma view. A URL é o ponto de entrada pelo qual o navegador acessa o formulário ou a emissão do PDF.

Arquivo: `edu/urls.py`, próximo das URLs de relatório em `edu/urls.py:129-135`:

```python
path(
    'ficha_resumida_aluno/',
    views.ficha_resumida_aluno,
),
path(
    'ficha_resumida_aluno_pdf/<int:pk>/',
    views.ficha_resumida_aluno_pdf,
),
```

##### 4. Criar a view do formulário

A view coordena o ciclo da tela: recebe a requisição, instancia o form, valida os dados e decide se deve renderizar a página ou seguir para a próxima etapa.

Arquivo: `edu/views.py`.

```python
@rtr('ficha_resumida_aluno.html')
@permission_required('edu.view_aluno')
def ficha_resumida_aluno(request):
    title = 'Ficha Resumida do Aluno'
    form = FichaResumidaAlunoForm(
        data=request.POST or None,
    )

    if request.method == 'POST' and form.is_valid():
        aluno = form.processar()
        return httprr(
            f'/edu/ficha_resumida_aluno_pdf/{aluno.pk}/'
        )

    return locals()
```

Aspectos importantes:

- `POST` foi escolhido porque o botão executa a ação de gerar um documento;
- `permission_required` protege a tela;
- o redirect aplica o padrão POST/Redirect/GET;
- a view não confia diretamente em `request.POST['matricula']`: usa o form validado.

##### 5. Criar o template do formulário

O template apresenta o formulário ao usuário. Ele recebe a instância preparada pela view e usa as tags do SUAP para exibir campos, mensagens de erro e ações.

Arquivo novo: `edu/templates/ficha_resumida_aluno.html`.

```django
{% extends super_template %}

{% block content %}
    {% box 'Localizar aluno' %}
        {% render_form form %}
    {% endbox %}
{% endblock %}
```

O `{% render_form %}` cria a tag `<form>`, CSRF, campo, erros e botão.

##### 6. Criar a view PDF

A view do PDF recebe os dados já validados, prepara o contexto do documento e devolve uma resposta própria para visualização ou download.

Arquivo: `edu/views.py`.

```python
@permission_required('edu.view_aluno')
@documento(
    'Ficha Resumida do Aluno',
    enumerar_paginas=False,
    modelo='edu.aluno',
    forcar_recriacao=True,
    usar_url_requisicao=True,
)
@rtr('ficha_resumida_aluno_pdf.html')
def ficha_resumida_aluno_pdf(request, pk):
    title = 'Ficha Resumida do Aluno'
    aluno = get_object_or_404(
        Aluno.locals.select_related(
            'pessoa_fisica',
            'curso_campus',
            'curso_campus__diretoria__setor__uo',
            'situacao',
            'ano_letivo',
            'matriz',
        ),
        pk=pk,
    )
    campus = aluno.curso_campus.diretoria.setor.uo
    return locals()
```

Aspectos importantes:

- a view PDF repete a protecao; conhecer a URL não pode liberar o documento;
- `get_object_or_404(Aluno.locals, pk=pk)` reaplica o escopo;
- `@rtr` renderiza o HTML;
- `@documento` converte para PDF e registra a emissao;
- `modelo='edu.aluno'` liga o `RegistroEmissaoDocumento` ao aluno;
- `forcar_recriacao=True` evita reutilizar uma ficha desatualizada;
- esse comportamento cria novas emissoes e deve ser avaliado em produção.

##### 7. Criar o template

O template transforma o resultado preparado pela view em uma página HTML. Ele renderiza o form, os filtros, as mensagens e a listagem devolvida pela consulta.

O template transforma o resultado preparado pela view em uma página HTML. Ele renderiza o form, os filtros, as mensagens e a listagem devolvida pela consulta. PDF

O template PDF define a apresentação final do documento. Ele usa o contexto fornecido pela view para organizar textos, dados e tabelas antes da conversão.

Arquivo novo: `edu/templates/ficha_resumida_aluno_pdf.html`.

```django
{% extends "relatorio_pdf.html" %}

{% block style %}
    .ficha {
        width: 100%;
        border-collapse: collapse;
    }
    .ficha th,
    .ficha td {
        border: 1px solid #777;
        padding: 6px;
        text-align: left;
    }
    .ficha th {
        width: 25%;
        background: #eee;
    }
{% endblock %}

{% block content %}
    <div class="corpo">
        <h1>{{ title }}</h1>

        <table class="ficha">
            <tbody>
                <tr>
                    <th>Nome</th>
                    <td>{{ aluno.get_nome_social_composto|normalizar }}</td>
                </tr>
                <tr>
                    <th>Matricula</th>
                    <td>{{ aluno.matricula }}</td>
                </tr>
                <tr>
                    <th>Ingresso</th>
                    <td>{{ aluno.ano_letivo|format }}/{{ aluno.periodo_letivo|format }}</td>
                </tr>
                <tr>
                    <th>Curso</th>
                    <td>{{ aluno.curso_campus|format }}</td>
                </tr>
                <tr>
                    <th>Matriz</th>
                    <td>{{ aluno.matriz|format }}</td>
                </tr>
                <tr>
                    <th>Situacao</th>
                    <td>{{ aluno.situacao|format }}</td>
                </tr>
                <tr>
                    <th>Periodo atual</th>
                    <td>{{ aluno.periodo_atual|format }}</td>
                </tr>
                <tr>
                    <th>Campus</th>
                    <td>{{ campus|format }}</td>
                </tr>
            </tbody>
        </table>
    </div>
{% endblock %}
```

O exemplo evita CPF, endereco e dados sociais. Se a atividade incluir dados pessoais, deve exigir uma permissão adequada, como `edu.view_dados_pessoais`, e revisar a necessidade de armazenar o PDF.

##### Adicionar template no Menu

Para que a tela fique disponível para o participante no menu do SUAP, inclua a entrada correspondente na configuração de menus:

```yaml
Ensino::Alunos e Professores::Ficha Resumida de Aluno:
  permissions_required:
  - edu.view_aluno
  url: /edu/ficha_resumida_aluno/
```

O caminho define a hierarquia exibida no menu, `permissions_required` restringe a opção aos usuários que possuem a permissão `edu.view_aluno` e `url` aponta para a tela inicial do formulário.

#### 2. Listagem de alunos por curso

##### Objetivo da atividade

Criar um relatório web que permita filtrar alunos por:

- campus;
- curso;
- ano de ingresso.

O resultado deve apresentar:

- matricula;
- nome do aluno;
- ano de ingresso;
- situação da matricula.

Fluxo final:

```text
/edu/relatorio_alunos_curso/
        |
Formulario GET
        |
Campus + Curso + Ano de ingresso
        |
Validacao dos filtros
        |
Consulta em Aluno.locals
        |
Tabela de resultados
```

Está atividade reutiliza os conceitos de `FormPlus`, autocomplete dependente,
`clean()`, `cleaned_data`, `QuerySet`, view e template.

##### 1. Criar o form

O arquivo `forms.py` concentra a definição dos campos, os tipos de entrada e as regras de validação. Nesta etapa, o form transforma os dados recebidos em valores que a view poderá consultar, salvar ou usar para gerar o relatório.

Arquivo: `edu/forms.py`.

Criar perto dos demais forms de relatório:

```python
# Formulario de filtros; ele consulta alunos, mas nao salva um model.
class RelatorioAlunosCursoForm(forms.FormPlus):
    # Filtros ficam na URL para permitir repetir e compartilhar a consulta.
    METHOD = 'GET'
    SUBMIT_LABEL = 'Pesquisar'

    campus = forms.ModelChoiceFieldPlus(
        UnidadeOrganizacional.locals,
        label='Campus',
        required=True,
    )
    curso = forms.ModelChoiceFieldPlus(
        CursoCampus.locals,
        label='Curso',
        required=True,
        widget=AutocompleteWidget(
            search_fields=CursoCampus.SEARCH_FIELDS,
            form_filters=[
                ('campus', 'diretoria__setor__uo'),
            ],
        ),
    )
    ano_ingresso = forms.ModelChoiceField(
        Ano.objects.ultimos(),
        label='Ano de Ingresso',
        required=True,
    )

    fieldsets = (
        (
            'Filtros de Pesquisa',
            {
                'fields': (
                    'campus',
                    'curso',
                    'ano_ingresso',
                )
            },
        ),
    )

    # Confere se o curso pertence ao campus escolhido.
    def clean(self):
        cleaned_data = super().clean()
        campus = cleaned_data.get('campus')
        curso = cleaned_data.get('curso')

        if campus and curso:
            curso_no_campus = CursoCampus.locals.filter(
                pk=curso.pk,
                diretoria__setor__uo=campus,
            ).exists()

            if not curso_no_campus:
                self.add_error(
                    'curso',
                    'O curso selecionado nao pertence ao campus informado.',
                )

        return cleaned_data

    # Monta e devolve o QuerySet usado pelo relatorio.
    def processar(self):
        campus = self.cleaned_data['campus']
        curso = self.cleaned_data['curso']
        ano_ingresso = self.cleaned_data['ano_ingresso']

        return (
            Aluno.locals
            .filter(
                curso_campus=curso,
                curso_campus__diretoria__setor__uo=campus,
                ano_letivo=ano_ingresso,
            )
            .select_related(
                'pessoa_fisica',
                'ano_letivo',
                'situacao',
                'curso_campus',
            )
            .order_by(
                'pessoa_fisica__nome_registro',
                'matricula',
            )
        )
```

##### 2. Como o formulário funciona

##### `METHOD = 'GET'`

O relatório apenas consulta dados. Com GET, os filtros aparecem na URL e a
pesquisa pode ser atualizada, compartilhada ou adicionada aos favoritos.

Exemplo de URL resultante:

```text
/edu/relatorio_alunos_curso/?campus=3&curso=25&ano_ingresso=15
```

Os números enviados na URL são as chaves primarias (`pk`) dos objetos
selecionados. Para o usuário, o formulário continua exibindo os nomes do campus,
do curso e do ano.

##### Campo `campus`

```python
campus = forms.ModelChoiceFieldPlus(
    UnidadeOrganizacional.locals,
    label='Campus',
    required=True,
)
```

`UnidadeOrganizacional.locals` limita as unidades ao escopo calculado pelo
`FiltroUnidadeOrganizacionalManager`, implementado em
`edu/managers.py:117-169`. Depois de `is_valid()`,
`cleaned_data['campus']` contém uma instância de `UnidadeOrganizacional`, e não
apenas o identificador enviado pela URL.

##### Campo `curso`

```python
curso = forms.ModelChoiceFieldPlus(
    CursoCampus.locals,
    label='Curso',
    required=True,
    widget=AutocompleteWidget(
        search_fields=CursoCampus.SEARCH_FIELDS,
        form_filters=[
            ('campus', 'diretoria__setor__uo'),
        ],
    ),
)
```

O autocomplete pesquisa pelos campos definidos em
`CursoCampus.SEARCH_FIELDS`, declarado em `edu/models/cursos.py:500-502`:

```python
SEARCH_FIELDS = [
    'codigo',
    'codigo_academico',
    'descricao',
    'descricao_historico',
]
```

O `form_filters` liga os dois campos:

```text
campo campus do form
-> lookup diretoria__setor__uo de CursoCampus
```

Assim, o autocomplete oferece apenas cursos do campus selecionado.

##### Campo `ano_ingresso`

```python
ano_ingresso = forms.ModelChoiceField(
    Ano.objects.ultimos(),
    label='Ano de Ingresso',
    required=True,
)
```

No model `Aluno`, o ano de ingresso e armazenado no relacionamento
`ano_letivo`. O nome `ano_ingresso` foi usado no form para deixar o filtro mais
claro para o usuário; em `processar()`, ele e aplicado a `ano_letivo`.

##### Validação entre campus e curso

Os `form_filters` melhoram a interface, mas não são uma barreira de segurança:
um usuário pode alterar manualmente os parâmetros da URL. Por isso, `clean()`
confere novamente se o curso pertence ao campus:

```python
if campus and curso:
    curso_no_campus = CursoCampus.locals.filter(
        pk=curso.pk,
        diretoria__setor__uo=campus,
    ).exists()

    if not curso_no_campus:
        self.add_error(
            'curso',
            'O curso selecionado nao pertence ao campus informado.',
        )
```

`self.add_error('curso', ...)` associa a mensagem diretamente ao campo de curso
e faz `is_valid()` retornar `False`.

##### Método `processar()`

`processar()` deve ser chamado somente depois de `is_valid()`. Ele usa os tres
objetos presentes em `cleaned_data` para montar a consulta.

```python
Aluno.locals.filter(
    curso_campus=curso,
    curso_campus__diretoria__setor__uo=campus,
    ano_letivo=ano_ingresso,
)
```

Mesmo que `curso_campus=curso` já determine o campus, o filtro de campus e
mantido para tornar o escopo explicito e aplicar uma segunda defesa na consulta.

`select_related()` carrega pessoa fisica, ano, situação e curso na mesma consulta
SQL, reduzindo consultas adicionais durante a montagem da tabela. O resultado e
ordenado pelo nome de registro e, em caso de empate, pela matricula.

Nesta versao do SUAP, `Aluno.locals` não representa, por si só, um filtro geral
por campus. O `AlunoLocalManager`, em `edu/managers.py:671-682`, aplica uma regra
específica para coordenadores de polo EAD. Por isso, o relatório também restringe
explicitamente a consulta pelo campus validado no form. O desenvolvedor deve
sempre ler o manager da versao em uso antes de tratar `.locals` como uma regra
completa de autorizacao.

##### 3. Importar o form na view

A view precisa importar o formulário para criar sua instância e conectá-la à requisição. Essa ligação permite entregar `GET`, `POST` e, quando necessário, `FILES` ao form.

Arquivo: `edu/views.py`, no bloco de imports de `edu.forms`:

```python
from edu.forms import (
    ...,
    RelatorioAlunosCursoForm,
)
```

##### 4. Criar a URL

O arquivo `urls.py` associa um endereço a uma view. A URL é o ponto de entrada pelo qual o navegador acessa o formulário ou o relatório.

Arquivo: `edu/urls.py`, próximo das URLs de relatório:

```python
path(
    'relatorio_alunos_curso/',
    views.relatorio_alunos_curso,
),
```

A URL final será:

```text
http://localhost:8000/edu/relatorio_alunos_curso/
```

##### 5. Criar a view

A view coordena o ciclo da tela: recebe a requisição, instancia o form, valida os dados e decide se deve renderizar a página ou seguir para a próxima etapa.

Arquivo: `edu/views.py`.

```python
@rtr('relatorio_alunos_curso.html')
@permission_required('edu.view_aluno')
def relatorio_alunos_curso(request):
    title = 'Listagem de Alunos por Curso'
    form = RelatorioAlunosCursoForm(
        data=request.GET or None,
    )
    pesquisa_realizada = False
    alunos = Aluno.locals.none()

    if form.is_valid():
        alunos = form.processar()
        pesquisa_realizada = True

    return locals()
```

##### 6. Código da view com comentários

```python
# Renderiza o template especifico do relatorio.
@rtr('relatorio_alunos_curso.html')

# Exige permissao geral para visualizar alunos.
@permission_required('edu.view_aluno')
def relatorio_alunos_curso(request):

    # Titulo disponibilizado ao template.
    title = 'Listagem de Alunos por Curso'

    # No primeiro acesso, request.GET esta vazio e data recebe None.
    # Depois da pesquisa, o form fica bound com os parametros da URL.
    form = RelatorioAlunosCursoForm(
        data=request.GET or None,
    )

    # Evita mostrar "nenhum aluno" antes de o usuario pesquisar.
    pesquisa_realizada = False

    # QuerySet vazio e compativel com os loops e count do template.
    alunos = Aluno.locals.none()

    # is_valid converte campus, curso e ano em objetos dos models.
    if form.is_valid():

        # Executa a consulta preparada pelo form.
        alunos = form.processar()

        # Informa ao template que a caixa de resultados deve aparecer.
        pesquisa_realizada = True

    # Entrega title, form, pesquisa_realizada e alunos ao template.
    return locals()
```

Aspectos importantes:

- a view não acessa diretamente `request.GET['curso']`;
- `permission_required` protege a URL, não apenas o menu;
- `Aluno.locals.none()` não consulta nem retorna registros;
- a consulta real só e produzida depois da validação;
- `pesquisa_realizada` diferencia primeiro acesso de resultado vazio.

##### 7. Criar o template

O template transforma o resultado preparado pela view em uma página HTML. Ele renderiza o form, os filtros, as mensagens e a listagem devolvida pela consulta.

Arquivo novo: `edu/templates/relatorio_alunos_curso.html`.

```django
{% extends super_template %}

{% block content %}
    {% box 'Filtros de Pesquisa' %}
        {% render_form form %}
    {% endbox %}

    {% if pesquisa_realizada %}
        {% box 'Alunos encontrados ({{ alunos.count }})' %}
            {% if alunos %}
                <table>
                    <thead>
                        <tr>
                            <th>Matricula</th>
                            <th>Nome do Aluno</th>
                            <th>Ano de Ingresso</th>
                            <th>Situacao</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for aluno in alunos %}
                            <tr>
                                <td>
                                    <a href="/edu/aluno/{{ aluno.matricula }}/">
                                        {{ aluno.matricula }}
                                    </a>
                                </td>
                                <td>{{ aluno.pessoa_fisica.nome_registro }}</td>
                                <td>{{ aluno.ano_letivo|format }}</td>
                                <td>{{ aluno.situacao|format }}</td>
                            </tr>
                        {% endfor %}
                    </tbody>
                </table>
            {% else %}
                <p class="msg alert">
                    Nenhum aluno encontrado para os filtros informados.
                </p>
            {% endif %}
        {% endbox %}
    {% endif %}
{% endblock %}
```

##### 8. Como o template funciona

`{% render_form form %}` gera o formulário com `method="GET"`, pois o form
declarou `METHOD = 'GET'`.

O bloco de resultados aparece somente quando `pesquisa_realizada` vale `True`.
Isso evita uma mensagem de lista vazia no primeiro acesso.

No Título da caixa:

```django
{{ alunos.count }}
```

o Django chama o método `QuerySet.count()` e apresenta o total retornado pelo
banco.

A tabela percorre o queryset:

```django
{% for aluno in alunos %}
```

e exibe somente as quatro informações solicitadas. A matricula também funciona
como link para a tela completa do aluno.

##### 9. Fluxo da consulta

```text
GET sem parametros
-> form unbound
-> exibe somente os filtros

GET com campus, curso e ano
-> ModelChoiceFields convertem os pks
-> clean() confirma a relacao campus/curso
-> processar() consulta Aluno.locals
-> select_related() prepara os dados da tabela
-> template mostra contagem e linhas
```

##### 10. Testes manuais

1. Acessar a URL sem parâmetros e confirmar que apenas o form aparece.
2. Selecionar um campus e verificar se o autocomplete limita os cursos.
3. Pesquisar um curso e ano que possuam alunos.
4. Conferir matricula, nome, ano de ingresso e situação.
5. Clicar na matricula e abrir a tela do aluno.
6. Pesquisar uma combinacao sem alunos e conferir a mensagem.
7. Alterar manualmente a URL para combinar campus e curso diferentes.
8. Confirmar que o erro aparece associado ao campo curso.
9. Testar com usuário sem `edu.view_aluno` e confirmar a negacao de acesso.
10. Conferir que alunos fora do escopo de `Aluno.locals` não aparecem.

##### 11. Pontos de verificação

- filtros visuais não substituem validação no backend;
- `ModelChoiceField` entrega objetos validados em `cleaned_data`;
- `UnidadeOrganizacional.locals` limita os campi disponíveis ao usuário;
- `Aluno.locals` possui regras contextuais, mas não substitui o filtro explicito
  por campus nem a permissão da view;
- `select_related()` evita o problema de uma consulta adicional por linha;
- GET e apropriado para relatórios consultivos;
- a view coordena o fluxo, enquanto o form valida e monta a consulta;
- o template apenas apresenta o queryset recebido.

### 2. Formulários de edição

#### 1. Editar dados do aluno: documento RG

##### Objetivo da atividade

Criar um formulário que altere somente os seguintes campos do aluno:

- número do RG;
- UF de emissao do RG;
- orgao emissor do RG.

Este exemplo apresenta uma diferença central em relação aos forms de relatório:
agora o formulário recebe uma instância existente de `Aluno` e persiste as
alterações no banco de dados.

Fluxo final:

```text
/edu/aluno/<matricula>/
        |
Botao "Documento RG"
        |
/edu/editar_rg_aluno/<pk>/
        |
GET: carrega o aluno e preenche o form com os dados atuais
        |
Usuario altera os campos e envia POST
        |
is_valid() converte e valida os valores
        |
form.save() executa UPDATE no registro do aluno
        |
httprr() volta para a aba Dados Pessoais
```

##### 1. Localizar os campos no model

Arquivo: `edu/models/alunos.py:344-348`.

```python
# rg
numero_rg = models.CharFieldPlus(max_length=255, verbose_name='Número do RG', null=True, blank=True)
uf_emissao_rg = models.ForeignKeyPlus('edu.Estado', verbose_name='Estado Emissor', null=True, blank=True, related_name='aluno_emissor_rg_set')
orgao_emissao_rg = models.ForeignKeyPlus('edu.OrgaoEmissorRg', verbose_name='Orgão Emissor', null=True, blank=True)
data_emissao_rg = models.DateFieldPlus(verbose_name='Data de Emissão', null=True, blank=True)
```

O trecho foi mantido como aparece no código-fonte. Para compreender este fluxo,
ler cada argumento separadamente: tipo, relacionamento, label, `null` e
`blank`.

##### `numero_rg`

E um campo textual baseado em `CharFieldPlus`. O limite de 255 caracteres vem
de `max_length=255`. Como possui `null=True` e `blank=True`, tanto o model quanto
o formulário permitem que o dado fique sem preenchimento.

O RG deve continuar sendo tratado como texto: ele pode conter pontuacao, letras
ou zeros a esquerda, dependendo do documento e da unidade federativa.

##### `uf_emissao_rg`

E uma chave estrangeira para `edu.Estado`. No formulário, o usuário seleciona
um estado, e o Django converte o valor enviado em uma instância de `Estado`.

O model `Estado` pode ser consultado em
`edu/models/cadastros_gerais.py:37-103`.

##### `orgao_emissao_rg`

E uma chave estrangeira para `edu.OrgaoEmissorRg`. Os orgaos emissores são
objetos cadastrados, em vez de textos digitados livremente. Isso evita variacoes
como `SSP`, `S.S.P.` e `ssp` para o mesmo orgao.

O model `OrgaoEmissorRg` está em
`edu/models/cadastros_gerais.py:12-21`.

##### Campo que fica fora deste exercicio

O model também possui `data_emissao_rg`, em `edu/models/alunos.py:348`, mas ele
não será incluido porque o escopo solicitado possui somente tres campos. Essa e
uma oportunidade para mostrar que um `ModelForm` não precisa expor todos os
campos do model.

##### 2. Comparar com o form existente do SUAP

O exemplo reduzido parte de `edu/forms.py:215-314` e apresenta o
`AlunoForm`, que também herda de `forms.ModelFormPlus`.

O bloco de RG aparece em `edu/forms.py:276`:

```python
('RG', {
    'fields': (
        'numero_rg',
        'uf_emissao_rg',
        'orgao_emissao_rg',
        'data_emissao_rg',
    )
}),
```

O `AlunoForm` e amplo e permite alterar muitos dados. Reutiliza-lo para está
tela seria arriscado e deixaria a atividade confusa. O novo form tera uma lista
explicita em `Meta.fields`, expondo somente os dados necessários.

##### 3. Criar o `ModelFormPlus`

O `ModelFormPlus` define quais campos do model serão expostos e quais regras de edição estarão disponíveis nessa tela.

Arquivo: `edu/forms.py`.

Criar próximo dos demais forms relacionados a aluno:

```python
# ModelFormPlus de edicao; os campos permitidos ficam explicitos em Meta.fields.
class EditarRgAlunoForm(forms.ModelFormPlus):
    SUBMIT_LABEL = 'Salvar'

    fieldsets = (
        (
            'Documento RG',
            {
                'fields': (
                    'numero_rg',
                    'uf_emissao_rg',
                    'orgao_emissao_rg',
                )
            },
        ),
    )

    # Meta limita o form aos tres campos do documento RG.
    class Meta:
        model = Aluno
        fields = (
            'numero_rg',
            'uf_emissao_rg',
            'orgao_emissao_rg',
        )

    # Remove espacos antes de gravar o numero do documento.
    def clean_numero_rg(self):
        numero_rg = self.cleaned_data.get('numero_rg')
        return numero_rg.strip() if numero_rg else None
```

##### 4. Como o formulário funciona

##### `forms.ModelFormPlus`

`ModelFormPlus` e a extensao do SUAP para o `ModelForm` do Django. Como o form
declara `model = Aluno`, os tipos, labels e regras basicas dos campos são
obtidos do model automaticamente.

Neste exemplo, o Django/SUAP produz:

- um campo de texto para `numero_rg`;
- um campo de selecao de `Estado` para `uf_emissao_rg`;
- um campo de selecao de `OrgaoEmissorRg` para `orgao_emissao_rg`.

##### `SUBMIT_LABEL`

```python
SUBMIT_LABEL = 'Salvar'
```

Define o texto do botão gerado por `{% render_form form %}`.

##### `fieldsets`

Organiza visualmente os tres campos sob o Título `Documento RG`. Ele não define
quais dados podem ser salvos; essa responsabilidade e de `Meta.fields`.

##### `Meta.model`

```python
model = Aluno
```

Informa que o formulário le e grava dados do model `Aluno`.

##### `Meta.fields`

Em um `ModelFormPlus`, `Meta.fields` define quais atributos do model podem participar daquele formulário. Ele funciona como uma lista explícita de campos permitidos: o Django cria os campos do formulário somente para os nomes declarados nessa opção.

No exemplo da edição do documento RG:

A implementação comentada apresenta cada parte do código.

Os três campos têm papéis diferentes:

- `numero_rg` recebe o número do documento;
- `uf_emissao_rg` relaciona o aluno a um estado;
- `orgao_emissao_rg` relaciona o documento ao órgão emissor.

Como `Aluno` possui muitos outros atributos, declarar apenas esses três campos produz um formulário restrito:

```text
model Aluno possui vários campos
        |
Meta.fields seleciona três nomes
        |
Django cria somente esses campos no form
        |
form.is_valid() valida apenas os dados recebidos
        |
form.save() atualiza somente os campos incluídos
```

Na prática, o formulário não exibirá nem alterará campos como nome, matrícula, curso ou situação acadêmica. Mesmo que alguém tente enviar esses nomes manualmente no POST, eles não fazem parte dos campos declarados pelo formulário e não serão atualizados por esse `ModelFormPlus`.

A tupla de um único campo precisa da vírgula final:

```python
fields = ('numero_rg',)
```

Sem a vírgula, o Python interpreta o valor como uma string, e não como uma tupla:

```python
fields = ('numero_rg')       # string
fields = ('numero_rg',)      # tupla
```

Usar `fields = '__all__'` seria inadequado para esta tela:

```python
class FormularioAmplo(forms.ModelForm):
    class Meta:
        model = Aluno
        fields = '__all__'
```

Essa configuração poderia expor campos que não fazem parte do objetivo da tela, incluindo dados que o usuário não deveria alterar. A lista explícita reduz a superfície de edição e torna a intenção do formulário verificável no código.

`Meta.fields` limita os campos disponíveis, mas não substitui outras proteções. A view ainda deve verificar permissão e escopo, e os métodos de validação devem conferir regras específicas, como o formato do RG.
##### `clean_numero_rg()`

O Django chama automaticamente esse método durante `is_valid()`. Ele remove
espacos no início e no fim, sem eliminar letras, pontuacao ou zeros.

```python
numero_rg = self.cleaned_data.get('numero_rg')
return numero_rg.strip() if numero_rg else None
```

Como o campo e opcional no model, um valor vazio continua sendo aceito. A
atividade pode ser adaptada para torna-lo obrigatorio declarando o campo
explicitamente no form, mas isso mudaria a regra atualmente definida no model.

##### 5. Importar o form na view

A view precisa importar o formulário para criar sua instância e conectá-la à requisição. Essa ligação permite entregar `GET`, `POST` e, quando necessário, `FILES` ao form.

Arquivo: `edu/views.py`, no bloco que importa os forms de `edu.forms`:

```python
from edu.forms import (
    ...,
    EditarRgAlunoForm,
)
```

Se `edu/views.py` usar uma importacao única ou uma lista já existente, adicionar
somente o nome da classe nessa estrutura. Não criar uma segunda importacao
desnecessaria.

##### 6. Criar a URL

O arquivo `urls.py` associa um endereço à view de edição ou de relatório. Sem essa rota, o navegador não consegue iniciar o fluxo.

Arquivo: `edu/urls.py`, próximo das URLs de aluno em
`edu/urls.py:76-81`:

```python
path(
    'editar_rg_aluno/<int:pk>/',
    views.editar_rg_aluno,
),
```

Exemplo, considerando um aluno cujo `pk` seja `95812`:

```text
http://localhost:8000/edu/editar_rg_aluno/95812/
```

O parâmetro da URL e o `pk` do registro de `Aluno`, não a matricula.

##### 7. Criar a view de edição

A view de edição carrega o objeto autorizado, instancia o formulário com `instance` e decide entre exibir a tela ou persistir os dados enviados.

Arquivo: `edu/views.py`.

```python
@permission_required('edu.change_aluno')
@rtr('editar_rg_aluno.html')
def editar_rg_aluno(request, pk):
    title = 'Editar Documento RG'
    aluno = get_object_or_404(
        Aluno.locals.select_related('curso_campus'),
        pk=pk,
    )

    if not perms.tem_permissao_realizar_procedimentos(
        request.user,
        aluno,
    ):
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

##### 8. Estrutura completa da view

```python
# Exige a permissao de alteracao do model Aluno antes de executar a view.
@permission_required('edu.change_aluno')

# Renderiza o retorno da view no template informado.
@rtr('editar_rg_aluno.html')
def editar_rg_aluno(request, pk):

    # Titulo entregue ao template pelo return locals().
    title = 'Editar Documento RG'

    # Procura o aluno pela chave primaria recebida na URL.
    # get_object_or_404 devolve HTTP 404 quando o registro nao existe.
    aluno = get_object_or_404(
        Aluno.locals.select_related('curso_campus'),
        pk=pk,
    )

    # A permissao change_aluno e geral. Esta segunda verificacao considera
    # se o usuario pode atuar no curso/diretoria do aluno selecionado.
    if not perms.tem_permissao_realizar_procedimentos(
        request.user,
        aluno,
    ):
        raise PermissionDenied()

    # No GET, request.POST esta vazio e data recebe None: form unbound.
    # No POST, data recebe os valores enviados: form bound.
    # instance=aluno preenche os campos e determina qual registro sera editado.
    form = EditarRgAlunoForm(
        data=request.POST or None,
        instance=aluno,
    )

    # So tenta salvar quando houve POST e todos os campos foram validados.
    if request.method == 'POST' and form.is_valid():

        # Como o form recebeu instance=aluno, save() executa UPDATE.
        # Sem instance, um ModelForm normalmente tentaria executar INSERT.
        form.save()

        # Redireciona depois do sucesso e evita repetir o POST ao atualizar.
        return httprr(
            f'/edu/aluno/{aluno.matricula}/?tab=dados_pessoais',
            'Dados do RG atualizados com sucesso.',
        )

    # Entrega title, aluno e form para o template.
    # Em caso de erro, o mesmo form retorna com as mensagens de validacao.
    return locals()
```

##### 9. Regras de acesso

##### Permissão geral

```python
@permission_required('edu.change_aluno')
```

Verifica a permissão Django `edu.change_aluno`. Ela aparece, por exemplo, nos
grupos configurados em `edu/permissions.yaml:46-61` e
`edu/permissions.yaml:767-780`.

##### Regra contextual

```python
perms.tem_permissao_realizar_procedimentos(request.user, aluno)
```

A função está em `edu/perms.py:88-89`. Ela chama
`realizar_procedimentos_academicos()`, implementada em `edu/perms.py:5-27`, para
considerar grupo, setor, diretoria, curso e coordenacao.

As duas verificacoes possuem papeis diferentes:

```text
change_aluno
-> o usuario tem permissao geral para alterar alunos?

tem_permissao_realizar_procedimentos
-> o usuario pode atuar sobre este aluno e este curso?
```

Somente ocultar o link no template não protege a alteração. A verificacao deve
permanecer na view porque uma URL pode ser acessada diretamente.

##### 10. O papel de `instance=aluno`

Este e o ponto principal da atividade:

```python
form = EditarRgAlunoForm(
    data=request.POST or None,
    instance=aluno,
)
```

No primeiro acesso, `instance` fornece os valores iniciais. Depois do POST, ela
informa ao `ModelForm` qual objeto deve receber os dados validados.

Comparação:

```python
# Edicao: o objeto possui pk e sera atualizado.
form = EditarRgAlunoForm(request.POST or None, instance=aluno)

# Inclusao: nao foi fornecida uma instancia existente.
form = EditarRgAlunoForm(request.POST or None)
```

No caso de edição, `form.save()` atualiza o registro correspondente ao
`aluno.pk`. Sem `instance`, o form tentaria criar um novo `Aluno`, o que não e o
objetivo e ainda falharia porque os demais campos obrigatorios não fazem parte
deste formulário.

##### 11. Criar o template

O template transforma o resultado preparado pela view em uma página HTML. Ele renderiza os campos, as mensagens e os dados da edição.

Arquivo novo: `edu/templates/editar_rg_aluno.html`.

```django
{% extends super_template %}

{% block content %}
    {% box 'Aluno' %}
        <dl class="definition-list flex">
            <div class="list-item">
                <dt>Matricula</dt>
                <dd>{{ aluno.matricula }}</dd>
            </div>
            <div class="list-item">
                <dt>Nome</dt>
                <dd>{{ aluno.get_nome_social_composto|normalizar }}</dd>
            </div>
        </dl>
    {% endbox %}

    {% box 'Documento RG' %}
        {% render_form form %}
    {% endbox %}
{% endblock %}
```

O primeiro box confirma qual aluno está sendo alterado. O segundo usa
`{% render_form form %}` para gerar o formulário, o token CSRF, os campos, as
mensagens de erro e o botão `Salvar`.

Não e necessário escrever manualmente `<input>` ou `<select>` para os campos.
Os widgets são produzidos a partir do `ModelFormPlus`.

##### 12. Adicionar a opcao na tela do aluno

Para que o menu use exatamente a mesma regra da view, criar uma variável na view
`aluno`, perto dos demais calculos de permissão em `edu/views.py:4683-4690`:

```python
pode_editar_rg = (
    request.user.has_perm('edu.change_aluno')
    and perms.tem_permissao_realizar_procedimentos(request.user, obj)
)
```

Depois, em `edu/templates/aluno.html:39-61`, dentro do menu `Editar`, adicionar:

```django
{% if pode_editar_rg %}
    <li>
        <a class="popup" href="/edu/editar_rg_aluno/{{ obj.pk }}/">
            Documento RG
        </a>
    </li>
{% endif %}
```

O uso da classe `popup` segue o comportamento de outras opcoes de edição da
tela. A variável melhora a experiência ao ocultar uma ação indisponível, mas a
segurança continua sendo responsabilidade da view `editar_rg_aluno`.

##### 13. O que acontece durante `is_valid()`

Quando o POST e recebido, `form.is_valid()` executa, de forma resumida:

```text
numero_rg
-> converte para texto
-> executa validadores do campo
-> executa clean_numero_rg()

uf_emissao_rg
-> recebe o pk enviado
-> procura uma instancia valida de Estado

orgao_emissao_rg
-> recebe o pk enviado
-> procura uma instancia valida de OrgaoEmissorRg

form completo
-> executa clean(), validacoes do model e regras de unicidade aplicaveis
```

Se um identificador de estado ou orgao inexistente for enviado manualmente, o
`ModelChoiceField` gerado pelo `ModelForm` rejeita o valor. O `save()` só e
executado quando todos os dados forem válidos.

##### 14. O que acontece durante `form.save()`

Como `instance=aluno` foi informado, o `ModelFormPlus` copia os valores de
`cleaned_data` para os tres atributos da instância e salva o model:

```text
form.cleaned_data['numero_rg']
-> aluno.numero_rg

form.cleaned_data['uf_emissao_rg']
-> aluno.uf_emissao_rg

form.cleaned_data['orgao_emissao_rg']
-> aluno.orgao_emissao_rg

aluno.save()
-> UPDATE do registro existente no banco
```

Os campos de `Aluno` que não aparecem em `Meta.fields` não são alterados por
esse form.

##### 15. Consultar o resultado na tela existente

Depois do redirecionamento, abrir a aba `Dados Pessoais` da tela do aluno. O
bloco `Documentos` mostra os dados do RG em
`edu/templates/tabs/aluno_dados_pessoais.html:92-110`:

```django
<dt>Identidade</dt>
<dd>{{ obj.numero_rg|format }}</dd>

<dt>Orgao Expedidor</dt>
<dd>{{ obj.orgao_emissao_rg|format }}</dd>

<dt>UF</dt>
<dd>{{ obj.uf_emissao_rg|format|normalizar }}</dd>
```

Esse fechamento permite acompanhar o ciclo completo:

```text
model -> form -> view -> validacao -> save -> banco -> template de consulta
```

##### 16. Comparar form de relatório e form de edição

| Aspecto | Form de relatório | Form de edição do RG |
|---|---|---|
| Classe | `FormPlus` | `ModelFormPlus` |
| Finalidade | Validar filtros | Alterar um model |
| Dados enviados | Normalmente `GET` | `POST` |
| Usa `Meta.model` | Não | Sim, `Aluno` |
| Usa `instance` | Não | Sim, o aluno existente |
| Resultado | `QuerySet` ou PDF | `UPDATE` no banco |
| Método principal | `processar()` criado pelo projeto | `save()` fornecido pelo ModelForm |
| Pos-sucesso | Exibe resultado | Redireciona com `httprr()` |

##### 17. Testes manuais

1. Abrir um aluno cujo usuário possa alterar.
2. Confirmar que a opcao `Documento RG` aparece no menu `Editar`.
3. Abrir o form e verificar se os valores atuais estão preenchidos.
4. Alterar número, UF e orgao emissor e clicar em `Salvar`.
5. Confirmar a mensagem de sucesso e o retorno para `Dados Pessoais`.
6. Reabrir o form e verificar se os novos valores foram persistidos.
7. Limpar os campos e confirmar que o form respeita `blank=True`.
8. Inserir espacos antes e depois do número e conferir o `strip()`.
9. Alterar manualmente o `pk` na URL para um aluno de outro escopo.
10. Confirmar que a regra contextual retorna acesso negado.
11. Acessar a URL com usuário sem `edu.change_aluno`.
12. Confirmar que o acesso e negado mesmo conhecendo o endereco.
13. Enviar um `pk` inexistente de estado ou orgao e conferir o erro do form.
14. Confirmar que nenhum outro campo do aluno foi alterado.

##### 18. Pontos de verificação

- `ModelFormPlus` pertence ao SUAP e estende o comportamento do Django;
- `Meta.fields` limita a superficie de alteração do formulário;
- `instance=aluno` diferencia edição de inclusão;
- `is_valid()` deve ser executado antes de `save()`;
- `form.save()` persiste os campos validados no banco;
- `POST` deve ser usado para operações que modificam estado;
- o redirecionamento evita reenvio acidental do formulário;
- permissão geral e regra contextual resolvem problemas diferentes;
- esconder o botão no template não substitui a autorizacao na view;
- documentos pessoais exigem cuidado com acesso, logs e exposicao de dados.

#### 2. Editar dados do professor

##### Objetivo da atividade

Criar um fluxo para alterar:

- titulacao acadêmica do professor;
- telefones institucionais apresentados na tela do professor;
- e-mail institucional do servidor vinculado ao professor.

Este exemplo encerra o encontro com uma situação mais proxima de um sistema
real: os tres dados aparecem juntos na interface, mas não pertencem ao mesmo
model nem possuem as mesmas permissões.

```text
Professor.titulacao
        -> model edu.Professor

E-mail institucional
        -> model rh.Servidor

Telefones institucionais
        -> model comum.SetorTelefone
        -> pertencem ao setor do vinculo, nao ao professor
```

Por esse motivo, não e correto criar um `ModelFormPlus` de `Professor` e esperar
que ele salve automaticamente os tres grupos de dados.

##### 1. Identificar onde cada dado está armazenado

##### 1.1 Titulação

Arquivo: `edu/models/professores.py:39-66`.

```python
TITULACAO_CHOICES = [
    ['Graduado', 'Graduado'],
    ['Graduada', 'Graduada'],
    ['Especialista', 'Especialista'],
    ['Mestre', 'Mestre'],
    ['Mestra', 'Mestra'],
    ['Doutor', 'Doutor'],
    ['Doutora', 'Doutora'],
    ['Pós-Doutor', 'Pós-Doutor'],
    ['Pós-Doutora', 'Pós-Doutora'],
]

titulacao = models.CharFieldPlus(
    'Titulação',
    choices=TITULACAO_CHOICES,
    null=True,
    blank=True,
)
```

O campo `Professor.titulacao` e textual, mas aceita somente os valores definidos
em `TITULACAO_CHOICES`.

Existe também `Servidor.titulacao`, em `rh/models.py:2033`, como chave
estrangeira para `rh.Titulacao`. Os dois campos não devem ser confundidos:

- `Professor.titulacao` e o dado acadêmico usado pelo modulo EDU;
- `Servidor.titulacao` pertence ao cadastro funcional do RH e pode ser
  alimentado por integracoes institucionais, como o SIAPE.

O método `Professor.get_titulacao()`, em
`edu/models/professores.py:139-145`, usa a titulacao do EDU e, quando ela não
está preenchida, tenta utilizar a titulacao do servidor:

```python
def get_titulacao(self):
    titulacao = None
    if self.titulacao:
        titulacao = self.titulacao
    elif self.vinculo.eh_servidor():
        titulacao = self.vinculo.relacionamento.get_titulacao()
    return titulacao
```

Neste exercicio será alterado somente `Professor.titulacao`. O cadastro
funcional do RH não será modificado.

##### 1.2 Telefones institucionais

A tela reune dados de tres origens diferentes. Por isso, a primeira pergunta nao e "qual formulario devo criar?", mas sim "qual model e o proprietario de cada dado e qual fluxo ja o altera?".
`edu/templates/professor.html:46-49`, ela percorre os telefones do setor:

```django
<div class="list-item">
    <dt>Telefones Institucionais</dt>
    <dd>{{ obj.vinculo.setor.setortelefone_set.all|format }}</dd>
</div>
```

O model correspondente está em `comum/models.py:3299-3322`:

```python
class SetorTelefone(models.ModelPlus):
    setor = models.ForeignKeyPlus(Setor, on_delete=models.CASCADE)
    numero = models.BrTelefoneField('Número')
    ramal = models.CharField(max_length=5, blank=True)
    observacao = models.CharField('Observação', max_length=50, blank=True)
```

Consequencia importante:

```text
Professor -> Vinculo -> Setor -> SetorTelefone
```

Alterar um telefone nessa estrutura modifica o contato institucional do setor.
A mudanca será percebida por todos os servidores e professores associados ao
mesmo setor. Ela não e uma alteração exclusiva do professor aberto na tela.

##### 1.3 E-mail institucional

Para professores que são servidores, o e-mail institucional está em
`rh/models.py:1999-2004`:

```python
# email extraido do SIAPE
email_siape = models.EmailField(blank=True, verbose_name='Email SIAPE')

# Modelagem nova para email
email_institucional = models.EmailField('Email Institucional', blank=True)
email_academico = models.EmailField('Email Acadêmico', blank=True)
email_google_classroom = models.EmailField(
    'Email do Google Classroom',
    blank=True,
)
```

O acesso ocorre por meio do vinculo:

```python
professor.vinculo.relacionamento.email_institucional
```

Isso funciona quando `professor.vinculo.eh_servidor()` retorna `True`. Um
professor externo pode estar ligado a outro tipo de relacionamento e não possui
o campo `Servidor.email_institucional`.

##### 2. Examinar os fluxos reais que já existem

Antes de implementar a nova tela, consulte os fluxos que o SUAP já utiliza para cada tipo de informação. Essa análise mostra onde ficam as regras de validação, quais permissões são exigidas e quais partes podem ser reutilizadas.

A tela reúne dados de três origens diferentes. Por isso, a primeira pergunta não é: "qual model é o proprietário de cada dado e qual fluxo já o altera?".

```text
Titulação
    -> Professor.titulacao
    -> edu/forms.py

E-mail institucional
    -> Servidor.email_institucional
    -> comum/forms.py + comum/views.py

Telefones institucionais
    -> SetorTelefone
    -> fluxo de gerenciamento do setor
```

A regra geral é: reutilize validáções, permissões e telas existentes sempre que elas já resolverem a necessidade. Assim, a nova página apenas coordena os dados do professor e encaminha o gerenciamento dos telefones para o fluxo responsável pelo setor.

###### Titulação no `ProfessorExternoForm`

O `ProfessorExternoForm` já declara o campo de titulação em `edu/forms.py:4776`:

```python
titulacao = forms.ChoiceField(
    label='Titulação',
    choices=[['', '-----']] + Professor.TITULACAO_CHOICES,
    required=False,
)
```

Esse trecho mostra duas decisões importantes:

- o formulário reutiliza `Professor.TITULACAO_CHOICES`, mantendo a mesma lista aceita pelo model;
- o campo é opcional, pois a titulação pode não estár informada.

O form completo está em `edu/forms.py:4751-4871` e edita outros dados do professor externo. Para a nova tela, será criado um formulário menor, com responsabilidade explícita sobre a titulação e o e-mail institucional.

###### E-mail no `AtualizarEmailForm`

O e-mail institucional possui um fluxo próprio, porque pertence ao model `Servidor` e pode ser usado por outras telas e integrações. As referências principais são:

- formulário: `comum/forms.py:237-374`;
- view: `comum/views.py:2177-2198`;
- permissão adicional: `rh.pode_editar_email_institucional`.

A validação específica aparece em `comum/forms.py:248-254`:

```python
def clean_email_institucional(self):
    email = self.cleaned_data['email_institucional']
    # validá domínio e impede duplicidade entre servidores
    return email
```

O método `clean_email_institucional()` impede que o mesmo endereço sejá atribuído a outro servidor. A nova tela deve preservar essa regra, mesmo que o campo sejá exibido junto com a titulação.

###### Telefones no `SetorAdicionarTelefoneForm`

Os telefones institucionais não pertencem ao professor. Eles são registros de `SetorTelefone` associados ao setor do vínculo. O SUAP já possui um fluxo completo para incluí-los, validá-los e removê-los:

| Parte do fluxo | Referência |
| --- | --- |
| Model | `comum/models.py:3299-3322` |
| Formulário | `comum/forms.py:874-882` |
| View de inclusão | `comum/views.py:790-800` |
| View de remoção | `comum/views.py:803-809` |
| Template | `comum/templates/setor_adicionar_telefone.html:1-55` |
| URL | `/comum/setor_adicionar_telefone/<setor_pk>/` |
| Permissão | `rh.pode_gerenciar_setor_telefone` |

A validação do ramal também já existe no formulário:

```python
def clean_ramal(self):
    if not self.cleaned_data['ramal'].isdigit():
        raise forms.ValidationError(
            'Certifique-se de que o ramal é um número'
        )
    return self.cleaned_data['ramal']
```

Portanto, não é necessário duplicar inclusão, listagem, validação de ramal ou remoção na nova tela. O template pode listar os telefones do setor e oferecer um link para `/comum/setor_adicionar_telefone/<setor_pk>/` quando o usuário tiver a permissão correspondente.

O resultado da análise pode ser resumido assim:

```text
Dado exibido na tela
        |
Identificar o model proprietário
        |
Localizar form, view, template e permissão existentes
        |
Reutilizar regras já implementadas
        |
Criar somente a coordenação que ainda falta
```

##### 3. Definir a estratégia do exemplo

O fluxo será dividido assim:

```text
EditarDadosProfessorForm
-> edita Professor.titulacao
-> edita Servidor.email_institucional
-> salva os dois dentro de transaction.atomic()

Telefones institucionais
-> lista SetorTelefone no template
-> reutiliza /comum/setor_adicionar_telefone/<setor_pk>/
```

Usaremos `FormPlus`, e não `ModelFormPlus`, porque o mesmo formulário coordena
campos de dois models diferentes. Um `ModelForm` possui apenas um `Meta.model`.

##### 4. Criar o form composto

O form composto reúne campos que pertencem a models ou objetos diferentes. Ele centraliza a validação e delega a persistência para o método `processar()`.

Arquivo: `edu/forms.py`.

As classes `Professor`, `Servidor`, `Configuracao` e `transaction` já são usadas
no arquivo desta instalacao. Conferir os imports antes de adicionar nomes
duplicados.

```python
# Formulario composto: coordena campos de Professor e Servidor.
class EditarDadosProfessorForm(forms.FormPlus):
    SUBMIT_LABEL = 'Salvar'

    titulacao = forms.ChoiceField(
        label='Titulação',
        choices=[['', '-----']] + Professor.TITULACAO_CHOICES,
        required=False,
    )
    email_institucional = forms.EmailField(
        label='E-mail Institucional',
        max_length=255,
        required=False,
    )

    fieldsets = (
        (
            'Dados Acadêmicos e Institucionais',
            {
                'fields': (
                    'titulacao',
                    'email_institucional',
                )
            },
        ),
    )

    # Recebe o professor para preencher os valores atuais.
    def __init__(self, *args, **kwargs):
        self.professor = kwargs.pop('professor')
        self.servidor = self.professor.vinculo.relacionamento

        initial = kwargs.setdefault('initial', {})
        initial.setdefault('titulacao', self.professor.titulacao)
        initial.setdefault(
            'email_institucional',
            self.servidor.email_institucional,
        )

        super().__init__(*args, **kwargs)

    # Valida dominio institucional e impede e-mails duplicados.
    def clean_email_institucional(self):
        email = self.cleaned_data.get('email_institucional')
        dominios = Configuracao.get_valor_por_chave(
            'comum',
            'dominios_institucionais',
        )

        if (
            email
            and dominios
            and not Configuracao.eh_email_institucional(email)
        ):
            raise forms.ValidationError(
                'Informe um endereço pertencente a um domínio institucional.'
            )

        email_em_uso = (
            Servidor.objects
            .exclude(pk=self.servidor.pk)
            .filter(email_institucional__iexact=email)
            .exists()
        )

        if email and email_em_uso:
            raise forms.ValidationError(
                'O e-mail informado já pertence a outro servidor.'
            )

        return email.lower() if email else ''

    # Grava os dois models em uma unica transacao.
    @transaction.atomic
    def processar(self):
        self.professor.titulacao = self.cleaned_data['titulacao'] or None
        self.professor.save(update_fields=['titulacao'])

        self.servidor.email_institucional = self.cleaned_data[
            'email_institucional'
        ]
        self.servidor.save(update_fields=['email_institucional'])
```

##### 5. Como o formulário funciona

##### Por que `FormPlus`?

O form não representa apenas `Professor` nem apenas `Servidor`. Ele recebe os
dados, valida e coordena a persistência manualmente em `processar()`.

##### Campo `titulacao`

O campo reutiliza `Professor.TITULACAO_CHOICES`. Isso evita repetir uma lista
que já pertence ao model e mantem o form alinhado com as opcoes aceitas.

##### Campo `email_institucional`

`EmailField` valida a estrutura básica do endereco. O método
`clean_email_institucional()` acrescenta duas regras:

1. Quando existem dominios institucionais configurados, o endereco deve
   pertencer a um deles.
2. Outro servidor não pode possuir o mesmo e-mail, ignorando diferenças entre
   maiusculas e minusculas com `__iexact`.

O método `Configuracao.eh_email_institucional()` está em
`comum/models.py:1173-1179`.

##### Construtor `__init__()`

```python
self.professor = kwargs.pop('professor')
self.servidor = self.professor.vinculo.relacionamento
```

O argumento nomeado `professor` não pertence ao construtor padrão do Django.
Por isso ele e retirado de `kwargs` antes de `super().__init__()`.

O dicionario `initial` preenche o GET com os valores atuais dos dois models. No
POST, os dados enviados continuam tendo prioridade sobre `initial`.

##### `processar()`

O método grava cada campo em seu verdadeiro proprietario:

```text
cleaned_data['titulacao']
-> Professor.titulacao

cleaned_data['email_institucional']
-> Servidor.email_institucional
```

`update_fields` limita o `UPDATE` aos campos indicados. Isso torna explicito o
escopo da alteração e evita salvar outros atributos modificados acidentalmente
na mesma instância.

##### `@transaction.atomic`

O decorador pertence ao Django, importado de `django.db.transaction`. Ele cria
uma transação para os dois `save()`:

```text
Professor salvo + Servidor salvo
-> COMMIT

Professor salvo + erro ao salvar Servidor
-> ROLLBACK das duas alteracoes
```

Sem a transação, seria possível atualizar a titulacao e falhar no e-mail,
deixando o formulário parcialmente aplicado.

##### 6. Criar a URL

O arquivo `urls.py` associa um endereço à view de edição ou de relatório. Sem essa rota, o navegador não consegue iniciar o fluxo.

Arquivo: `edu/urls.py`, perto das URLs de professor em `edu/urls.py:83-84`:

```python
path(
    'editar_dados_professor/<int:pk>/',
    views.editar_dados_professor,
),
```

Exemplo:

```text
http://localhost:8000/edu/editar_dados_professor/125/
```

O valor `125` representa o `pk` de `Professor`.

##### 7. Importar o form na view

A view precisa importar o formulário para criar sua instância e conectá-la à requisição. Essa ligação permite entregar `GET`, `POST` e, quando necessário, `FILES` ao form.

Arquivo: `edu/views.py`, no bloco de imports de `edu.forms`:

```python
from edu.forms import (
    ...,
    EditarDadosProfessorForm,
)
```

`PermissionDenied`, `Professor` e `httprr` já são utilizados em
`edu/views.py` nesta instalacao.

##### 8. Criar a view

A view coordena o ciclo da tela: recebe a requisição, instancia o form, valida os dados e decide se deve renderizar a página ou seguir para a próxima etapa.

Arquivo: `edu/views.py`.

```python
@permission_required('edu.change_professor')
@rtr('editar_dados_professor.html')
def editar_dados_professor(request, pk):
    title = 'Editar Dados do Professor'
    professor = get_object_or_404(
        Professor.objects.select_related(
            'vinculo__pessoa',
            'vinculo__setor',
        ),
        pk=pk,
    )

    if not professor.vinculo.eh_servidor():
        return httprr(
            '..',
            'Este formulário é exclusivo para professores servidores.',
            'error',
        )

    if not request.user.has_perm(
        'rh.pode_editar_email_institucional'
    ):
        raise PermissionDenied()

    setor = professor.vinculo.setor
    if not setor:
        return httprr(
            '..',
            'O professor não possui setor associado.',
            'error',
        )

    if not UnidadeOrganizacional.locals.filter(
        pk=setor.uo_id
    ).exists():
        raise PermissionDenied()

    form = EditarDadosProfessorForm(
        data=request.POST or None,
        professor=professor,
    )

    if request.method == 'POST' and form.is_valid():
        form.processar()
        return httprr(
            f'/edu/professor/{professor.pk}/',
            'Dados do professor atualizados com sucesso.',
        )

    telefones = setor.setortelefone_set.all().order_by(
        'numero',
        'ramal',
    )
    pode_gerenciar_telefones = request.user.has_perm(
        'rh.pode_gerenciar_setor_telefone'
    )

    return locals()
```

##### 9. Código da view com comentários

```python
# Exige permissao para alterar registros de Professor.
@permission_required('edu.change_professor')

# Define explicitamente o template usado pela view.
@rtr('editar_dados_professor.html')
def editar_dados_professor(request, pk):

    # Titulo entregue ao template.
    title = 'Editar Dados do Professor'

    # Carrega o professor e os relacionamentos usados na pagina.
    professor = get_object_or_404(
        Professor.objects.select_related(
            'vinculo__pessoa',
            'vinculo__setor',
        ),
        pk=pk,
    )

    # O campo email_institucional pertence a Servidor.
    # Professores externos nao possuem necessariamente esse model.
    if not professor.vinculo.eh_servidor():
        return httprr(
            '..',
            'Este formulário é exclusivo para professores servidores.',
            'error',
        )

    # A permissao de Professor nao autoriza automaticamente editar e-mail.
    if not request.user.has_perm(
        'rh.pode_editar_email_institucional'
    ):
        raise PermissionDenied()

    # Os telefones institucionais pertencem ao setor do vinculo.
    setor = professor.vinculo.setor
    if not setor:
        return httprr(
            '..',
            'O professor não possui setor associado.',
            'error',
        )

    # Restringe a operacao aos campi visiveis para o usuario atual.
    # A permissao Django, isoladamente, nao faz esse recorte contextual.
    if not UnidadeOrganizacional.locals.filter(
        pk=setor.uo_id
    ).exists():
        raise PermissionDenied()

    # No GET, o form usa initial; no POST, valida os dados enviados.
    form = EditarDadosProfessorForm(
        data=request.POST or None,
        professor=professor,
    )

    # processar() persiste Professor e Servidor em uma unica transacao.
    if request.method == 'POST' and form.is_valid():
        form.processar()
        return httprr(
            f'/edu/professor/{professor.pk}/',
            'Dados do professor atualizados com sucesso.',
        )

    # Lista os telefones compartilhados pelo setor.
    telefones = setor.setortelefone_set.all().order_by(
        'numero',
        'ramal',
    )

    # Controla apenas a exibicao do botao de gerenciamento.
    # A view de destino repete a verificacao da permissao.
    pode_gerenciar_telefones = request.user.has_perm(
        'rh.pode_gerenciar_setor_telefone'
    )

    # Entrega todas as variaveis locais ao template.
    return locals()
```

##### 10. Regras de acesso

O exemplo envolve tres responsabilidades e, portanto, tres permissões:

| Operação | Permissão | Onde e verificada |a
|---|---|---|
| Alterar titulacao do EDU | `edu.change_professor` | Decorador da nova view |
| Alterar e-mail institucional | `rh.pode_editar_email_institucional` | Corpo da nova view |
| Gerenciar telefones do setor | `rh.pode_gerenciar_setor_telefone` | Views existentes em `comum/views.py` |

Para executar todo o fluxo com o mesmo usuário, ele precisa possuir as tres
permissões. Em produção, não se deve conceder permissões adicionais apenas para
fazer a tela funcionar; os grupos autorizados precisam ser definidos conforme
a responsabilidade institucional.

A consulta com `UnidadeOrganizacional.locals` acrescenta o recorte contextual
de campus. Assim, possuir `edu.change_professor` não libera automaticamente a
edição de professores de todas as unidades.

##### 11. Criar o template

O template transforma o resultado preparado pela view em uma página HTML. Ele renderiza os campos, as mensagens e os dados da edição.

Arquivo novo: `edu/templates/editar_dados_professor.html`.

```django
{% extends super_template %}

{% block content %}
    {% box 'Professor' %}
        <dl class="definition-list flex">
            <div class="list-item">
                <dt>Nome</dt>
                <dd>{{ professor.vinculo.pessoa.nome|normalizar }}</dd>
            </div>
            <div class="list-item">
                <dt>Matrícula</dt>
                <dd>{{ professor.get_matricula|format }}</dd>
            </div>
            <div class="list-item">
                <dt>Setor</dt>
                <dd>{{ setor|format }}</dd>
            </div>
        </dl>
    {% endbox %}

    {% box 'Titulação e E-mail Institucional' %}
        {% render_form form %}
    {% endbox %}

    {% box 'Telefones Institucionais do Setor' %}
        {% if telefones %}
            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Ramal</th>
                        <th>Observação</th>
                    </tr>
                </thead>
                <tbody>
                    {% for telefone in telefones %}
                        <tr>
                            <td>{{ telefone.numero|format }}</td>
                            <td>{{ telefone.ramal|format }}</td>
                            <td>{{ telefone.observacao|format }}</td>
                        </tr>
                    {% endfor %}
                </tbody>
            </table>
        {% else %}
            <p class="msg alert">
                O setor não possui telefones cadastrados.
            </p>
        {% endif %}

        {% if pode_gerenciar_telefones %}
            <ul class="action-bar">
                <li>
                    <a class="btn primary"
                       href="/comum/setor_adicionar_telefone/{{ setor.pk }}/">
                        Editar Telefones do Setor
                    </a>
                </li>
            </ul>
        {% endif %}
    {% endbox %}
{% endblock %}
```

O template deixa visivel que os telefones pertencem ao setor. O botão não abre
um formulário criado para este fluxo: ele reutiliza a tela real que inclui, lista
e remove objetos `SetorTelefone`.

##### 12. Adicionar a opcao na tela do professor

O menu existente está em `edu/templates/professor.html:4-18`.

Dentro do submenu `Editar`, adicionar:

```django
{% if professor_eh_servidor and perms.rh.pode_editar_email_institucional %}
    <li>
        <a href="/edu/editar_dados_professor/{{ obj.pk }}/">
            Dados Acadêmicos e Institucionais
        </a>
    </li>
{% endif %}
```

O bloco externo do menu já verifica `perms.edu.change_professor`. A condicao
interna acrescenta os dois requisitos específicos desta tela: ser professor
servidor e possuir permissão para alterar e-mail institucional.

##### 13. Corrigir a exibição do e-mail institucional

Atualmente, `edu/templates/professor.html:42-45` apresenta
`obj.vinculo.pessoa.email`, que e o campo `Pessoa.email`.

Como este exercicio altera o campo canonico `Servidor.email_institucional`,
ajustar o trecho para professores servidores:

```django
<div class="list-item">
    <dt>E-mail Institucional</dt>
    <dd>
        {% if professor_eh_servidor %}
            {{ obj.vinculo.relacionamento.email_institucional|format }}
        {% else %}
            {{ obj.vinculo.pessoa.email|format }}
        {% endif %}
    </dd>
</div>
```

Essa distincao e importante: alterar `Servidor.email_institucional` não garante
que `Pessoa.email` seja atualizado imediatamente. Existem rotinas de
sincronizacao no sistema, mas o template deve exibir o atributo que está sendo
editado pelo fluxo.

##### 14. Acompanhar o fluxo dos telefones

Ao clicar em `Editar Telefones do Setor`, o navegador acessa:

```text
/comum/setor_adicionar_telefone/<setor_pk>/
```

A view `setor_adicionar_telefone`, em `comum/views.py:790-800`:

1. exige `rh.pode_gerenciar_setor_telefone`;
2. carrega o setor;
3. instância `SetorAdicionarTelefoneForm` com o POST;
4. valida número, ramal e observação;
5. cria um novo `SetorTelefone` ligado ao setor.

A mesma página lista os registros existentes. A remocao chama
`setor_remover_telefone`, em `comum/views.py:803-809`, que também exige a
permissão de gerenciamento.

O `clean_ramal()`, em `comum/forms.py:879-882`, garante que o ramal possua apenas
digitos:

```python
def clean_ramal(self):
    if not self.cleaned_data['ramal'].isdigit():
        raise forms.ValidationError(
            'Certifique-se de que o ramal é um número'
        )
    return self.cleaned_data['ramal']
```

##### 15. Fluxo completo da Edição

Esta etapa reúne as responsabilidades da URL, da view, do formulário e do template. O fluxo possui dois momentos principais: o primeiro acesso, feito por GET, e o envio das Alterações, feito por POST.

O gerenciamento dos telefones segue uma rota separada porque esses registros pertencem ao setor. A tela do professor apenas os lista e oferece o acesso ao fluxo responsável por inclui-los ou remove-los.

###### Primeiro acesso: GET

Quando o usuário abre a tela, a requisição passa por estas verificações:

```text
GET /edu/editar_dados_professor/<pk>/
        |
@permission_required('edu.change_professor')
        |
A view carrega o Professor
        |
Confirma que o vínculo e de servidor
        |
Confirma rh.pode_editar_email_institucional
        |
Verifica o CAMPUS pelo UnidadeOrganizacional.locals
        |
Cria EditarDadosProfessorForm com professor=professor
        |
__init__() preenche titulacao e e-mail atuais
        |
Template renderiza o formulário e os telefones do setor
```

Nesse momento, nenhum dado é alterado. O formulário recebe os valores atuais por `initial`, e o template apresenta uma página pronta para edição.

###### Envio das Alterações: POST

Ao salvar, a view entrega os dados ao formulário e só persiste depois que todas as validações terminam:

```text
POST /edu/editar_dados_professor/<pk>/
        |
form.is_valid()
        |
ChoiceField valida a titulacao
        |
clean_email_institucional()
        |
Valida domínio institucional e duplicidade
        |
@transaction.atomic
        |
processar()
        |
Professor.titulacao recebe o novo valor
        |
Servidor.email_institucional recebe o novo valor
        |
COMMIT das duas Alterações
        |
httprr() retorna para a tela do professor
```

Se qualquer validação falhar, `is_valid()` retorna `False`, as mensagens são exibidas no formulário e nenhum `save()` é executado. Se ocorrer um erro durante o segundo `save()`, a transação desfaz também o primeiro, evitando uma atualização parcial.

###### Gerenciamento dos telefones do setor

Os telefones seguem outro caminho:

```text
Botão "Editar Telefones do Setor"
        |
/comum/setor_adicionar_telefone/<setor_pk>/
        |
SetorAdicionarTelefoneForm
        |
clean_ramal() valida somente dígitos
        |
SetorTelefone é criado ou removido
        |
Todos os usuários vinculados ao setor visualizam a alteração
```

A view de telefones repete a permissão `rh.pode_gerenciar_setor_telefone`. A nova tela não deve copiar esse formulário nem suas regras; ela apenas encaminha o usuário autorizado para a funcionalidade existente.

###### Visão geral das responsabilidades

```text
URL -> identifica o professor
Quando o usuário abre a tela, a requisição passa por estas verificações:
Form -> valida titulacao e e-mail
processar() -> grava Professor e Servidor em uma transação
Template -> exibe campos, mensagens e telefones
Fluxo do setor -> gerencia SetorTelefone
```

Esse desenho explica por que a edicao de dados do professor usa `FormPlus`: a tela coordena informaçãoes de models diferentes, enquanto cada fluxo mantém a responsabilidade pelo próprio dado.

##### 16. Comparar os dois exemplos de edição

| Aspecto | RG do aluno | Dados do professor |
|---|---|---|
| Models alterados diretamente | Um: `Aluno` | Dois: `Professor` e `Servidor` |
| Classe principal | `ModelFormPlus` | `FormPlus` |
| Preenchimento inicial | `instance=aluno` | `initial` montado no `__init__` |
| Persistência | `form.save()` | `processar()` com dois `save()` |
| Transação explicita | Não necessária para um `save()` | Sim, com `@transaction.atomic` |
| Dado compartilhado | Não | Telefones pertencem ao setor |
| Permissões | Model + contexto acadêmico | EDU + RH + gerenciamento de setor |

##### 17. Testes manuais

1. Abrir um professor servidor com setor associado.
2. Confirmar que titulacao e e-mail atuais aparecem preenchidos.
3. Alterar somente a titulacao e salvar.
4. Confirmar a nova titulacao na tela do professor.
5. Alterar o e-mail usando um dominio institucional válido.
6. Confirmar que a tela passou a exibir `Servidor.email_institucional`.
7. Informar um e-mail já usado por outro servidor e conferir o erro.
8. Informar um dominio externo quando houver dominios configurados.
9. Confirmar que o erro aparece no campo e nada e salvo.
10. Abrir um professor externo e confirmar a mensagem de bloqueio.
11. Testar com usuário sem `edu.change_professor`.
12. Testar com usuário sem `rh.pode_editar_email_institucional`.
13. Tentar editar um professor de campus fora do escopo do usuário.
14. Conferir a lista de telefones do setor.
15. Testar o botão com usuário sem `rh.pode_gerenciar_setor_telefone`.
16. Incluir um telefone e um ramal válidos no fluxo existente.
17. Informar letras no ramal e conferir a validação.
18. Confirmar que o telefone aparece para outro professor do mesmo setor.
19. Remover apenas um telefone criado para o teste.

##### 18. Pontos de verificação

- proximidade visual não significa que os dados pertencem ao mesmo model;
- `Professor`, `Servidor`, `Vinculo`, `Setor` e `SetorTelefone` possuem
  responsabilidades diferentes;
- `FormPlus` e adequado quando a persistência não cabe em um único
  `Meta.model`;
- `initial` apenas preenche o form; quem grava e `processar()`;
- `@transaction.atomic` impede atualizacao parcial entre models;
- regras existentes devem ser reutilizadas em vez de copiadas;
- telefones institucionais são dados compartilhados pelo setor;
- cada operação deve verificar a permissão correspondente no backend;
- campos sincronizados com outros sistemas exigem cuidado antes de serem
  liberados para edição manual;
- o template deve exibir o mesmo campo canonico alterado pelo formulário.

## J. Erros comuns e como evitá-los

Use esta lista para revisar uma implementação antes de executá-la. Cada item representa uma falha frequente no fluxo de formulários, permissões, consultas ou persistência.

1. Acessar `cleaned_data` antes de `is_valid()`.
2. Usar `request.POST` em relatório que deveria utilizar GET.
3. Esquecer `request.FILES` em Formulários de upload.
4. Chamar `form.save()` em `FormPlus`, que não e `ModelForm`.
5. Esquecer `instance=obj` e criar um registro novo em vez de alterar.
6. Usar `fields = '__all__'` e expor campos indevidos.
7. Fazer consulta grande em `<select>` em vez de autocomplete.
8. Filtrar opcoes no form, mas não validar novamente na view ou model.
9. Colocar `{% render_form form %}` dentro de outro `<form>`.
10. Gerar PDF com dado sensivel sem permissão específica.
11. Renderizar novamente após POST bem-sucedido, permitindo reenvio ao atualizar a página.
12. Colocar toda a regra de negocio no form e dificultar sua reutilização.
13. Pressupor que dados exibidos juntos pertencem ao mesmo model.
14. Executar vários `save()` relacionados sem uma transação atomica.
15. Tratar telefone institucional do setor como dado particular do professor.
16. Duplicar validacoes e fluxos que o SUAP já implementa em outro modulo.
17. Alterar um campo sincronizado sem avaliar a integracao que pode sobrescreve-lo.

## K. Checklist de testes

O checklist cobre o caminho feliz, entradas inválidas, permissões, escopo dos dados, geração de PDF e persistência. Marque cada verificação somente depois de observar o comportamento correspondente.

### Testes manuais do formulário

- abrir a URL com GET e verificar formulário vazio;
- enviar matricula vazia e conferir erro de campo obrigatorio;
- enviar matricula inexistente e conferir a mensagem de `clean_matricula`;
- enviar matricula fora do escopo e confirmar que não e localizada;
- enviar matricula valida e confirmar o redirect;
- verificar se o PDF mostra as oito informações;
- tentar abrir diretamente o PDF sem permissão;
- confirmar que o documento possui código de autenticacao;
- localizar a emissao em `RegistroEmissaoDocumento`;
- gerar novamente e observar o efeito de `forcar_recriacao=True`.

### Testes automatizados sugeridos

```python
def test_form_rejeita_matricula_inexistente(self):
    form = FichaResumidaAlunoForm(
        data={'matricula': 'INEXISTENTE'}
    )
    self.assertFalse(form.is_valid())
    self.assertIn('matricula', form.errors)

def test_form_aceita_matricula_existente(self):
    form = FichaResumidaAlunoForm(
        data={'matricula': self.aluno.matricula}
    )
    self.assertTrue(form.is_valid())
    self.assertEqual(form.processar(), self.aluno)
```

Observação: como `Aluno.locals` depende do contexto do usuário/requisição, o teste real deve preparar esse contexto ou adaptar o form para receber explicitamente o usuário/queryset.

## L. Perguntas para fixação

Responda às perguntas sem consultar o texto e, em seguida, compare suas respostas com a seção seguinte.

1. Quando utilizar GET e quando utilizar POST?
2. Qual a diferença entre `FormPlus` e `ModelFormPlus`?
3. Por que `cleaned_data` só deve ser usado depois de `is_valid()`?
4. Quando usar `clean_<campo>()` e quando usar `clean()`?
5. Qual a função de `instance` em um `ModelFormPlus`?
6. O que `{% render_form form %}` gera automaticamente?
7. Por que limitar o queryset no form não substitui a validação de segurança na view?
8. Por que a view PDF precisa repetir a permissão?
9. Qual o efeito de `forcar_recriacao=True`?
10. Onde deve ficar uma regra de negocio que será utilizada por várias telas?

## M. Respostas para conferência

Estas respostas retomam os conceitos essenciais da página e servem para conferir o raciocínio usado nas perguntas de revisão.

- GET deve ser preferido para filtros; POST para alterações e ações.
- `FormPlus` recebe e valida dados sem estar obrigatoriamente ligado a um model.
- `ModelFormPlus` cria campos a partir de um model e oferece `save()`.
- `clean_<campo>()` valida um campo; `clean()` trata regras entre vários campos.
- `instance` diferencia alteração de criação em um ModelForm.
- `{% render_form %}` gera form, método, CSRF, fieldsets, erros e botão.
- permissões e escopo devem ser validados no backend, inclusive na URL do PDF.
- regras reutilizáveis devem ficar preferencialmente no model ou em servico de dominio.
- depois de um POST bem-sucedido, redirecionar evita envio duplicado.

## N. Referências

- `djtools/forms/__init__.py:54-74`
- `djtools/forms/utils/__init__.py:203-270`
- `djtools/templatetags/tags/utils.py:220-285`
- `djtools/templates/form.html:3-33`
- `edu/forms.py:599-673`
- `edu/forms.py:4456-4503`
- `edu/forms.py:5898-5959`
- `edu/forms.py:14168-14198`
- `edu/models/plano_ensino.py:6-34`
- `edu/views.py:1473-1485`
- `edu/views.py:6330-6339`
- `edu/views.py:14724-14733`
- `edu/templates/relatorio_horario.html:1-35`
- `edu/urls.py:129-135`
- `comum/templates/relatorio_pdf.html:1-37`

