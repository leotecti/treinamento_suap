# Encontro 1 — Introdução ao fluxo do SUAP

Objetivo: apresentar o fluxo basico de manutencao no SUAP, mostrando como uma requisicao passa por URL, view, template e, quando necessario, PDF. Este roteiro deve ser usado como guia de fala e demonstracao em aula.

## I. Introducao

Comece explicando que uma tela no SUAP normalmente nao esta em um unico arquivo. Ela nasce da combinacao entre rota, regra de negocio, consulta ao banco e apresentacao.

### 1. `urls.py`

No Django, o arquivo `urls.py` define as rotas da aplicacao. Ele determina qual view sera executada quando o usuario acessar determinada URL.

Ponto importante:

- Existe um `urls.py` geral da aplicacao.
- Cada modulo tambem pode ter seu proprio `urls.py`, como `edu/urls.py`.

Frase para usar: a URL e o endereco do guiche. Ela nao resolve o atendimento, apenas encaminha a requisicao para a view correta.

### 2. `views.py`

O arquivo `views.py` processa a requisicao recebida, executa a logica da aplicacao, busca dados e retorna uma resposta ao usuario.

Na pratica, a view costuma:

- verificar permissao;
- buscar objetos no banco;
- montar variaveis para o template;
- retornar HTML, PDF, XLS, JSON ou redirecionamento.

### 3. Templates

Templates definem como o conteudo sera apresentado ao usuario.

No SUAP, eles normalmente recebem variaveis da view, como `obj`, `title`, `form`, `alunos`, `turnos` ou `diarios_por_sigla`, e organizam isso em HTML.

### 4. `admin.py`

O `admin.py` configura a interface administrativa do Django/SUAP.

Ele permite visualizar, cadastrar, editar e excluir registros sem desenvolver uma tela administrativa do zero. No admin, aparecem configuracoes como:

- colunas da listagem;
- filtros;
- campos de busca;
- exportacao;
- permissoes de exibicao.

### 5. `forms.py`

O `forms.py` define formularios usados para entrada de dados.

Ele pode definir:

- campos visiveis;
- validacoes;
- filtros de queryset;
- organizacao visual dos campos;
- processamento dos dados enviados pelo usuario.

### 6. `models.py`

O `models.py` define os modelos de dados da aplicacao. Ele representa as entidades gravadas e manipuladas no banco de dados.

Exemplos no EDU:

- `Aluno`;
- `Turma`;
- `Diario`;
- `CursoCampus`;
- `MatriculaPeriodo`.

Feche a introducao reforcando: em uma manutencao real, raramente basta olhar um unico arquivo.

## II. Exemplo Real: Turmas

Objetivo: mostrar uma tela real do EDU seguindo o caminho URL -> view -> template.

### 1. Abrir as URLs

Arquivo: `edu/urls.py:27-31`.

Mostre:

```python
path('turma/<int:pk>/', views.turma)
```

Explique que esta e a rota da tela de turma.

Mostre tambem:

```python
path('horarios_turma_pdf/<int:pk>/', views.horarios_turma_pdf)
```

Explique que esta e a rota da versao PDF dos horarios da turma.

### 2. Abrir a view da turma

Arquivo: `edu/views.py:1552-1554`.

Mostre:

```python
@permission_required('edu.view_turma')
@rtr()
def turma(request, pk):
```

Explique:

- `@permission_required('edu.view_turma')` exige permissao para visualizar turma.
- `@rtr()` renderiza o retorno da view em um template.
- `pk` e o identificador da turma recebido pela URL.

### 3. Explicar os dados enviados ao template

Arquivo: `edu/views.py:1591-1594`.

Mostre as variaveis:

- `semestre`;
- `turnos`;
- `diarios_por_sigla`;
- `return locals()`.

Explique que `return locals()` entrega ao template as variaveis criadas na view.

Frase para usar: a view monta o envelope de dados; o template abre esse envelope e organiza a tela.

### 4. Abrir o template

Arquivo: `edu/templates/horarios_turma.html:1-89`.

Mostre que o template usa as variaveis preparadas pela view para montar a visualizacao dos horarios.

Durante a explicacao, destaque:

- estruturas condicionais com `{% if %}`;
- repeticoes com `{% for %}`;
- uso de variaveis com `{{ variavel }}`;
- links para PDF ou outras telas.

## III. Criar uma Tela Nova

Objetivo: demonstrar como criar uma tela simples do zero, com URL, view e template.

### 1. Escolher local da URL

Arquivo: `edu/urls.py:130-141`.

Explique que ali ficam agrupadas algumas URLs de relatorios e atalhos.

Inserir logo apos `edu/urls.py:135`:

```python
path('treinamento_fluxo_web/', views.treinamento_fluxo_web),
```

### 2. Usar uma view real como referencia

Arquivo: `edu/views.py:6330-6338`.

Mostre a view `relatorio_horario`, que:

- define `title`;
- instancia um form;
- processa dados;
- retorna `locals()`.

### 3. Criar a view de treinamento

Adicionar perto desse bloco:

```python
@rtr('treinamento_fluxo_web.html')
@permission_required('edu.view_horarioauladiario')
def treinamento_fluxo_web(request):
    title = 'Treinamento - Fluxo Web EDU'
    links = [
        ('Listagem de Horarios', '/edu/relatorio_horario/'),
        ('Locais e Horarios do Aluno', '/edu/locais_aula_aluno/'),
        ('Locais e Horarios do Professor', '/edu/locais_aula_professor/'),
    ]
    return locals()
```

Explique:

- `@rtr('treinamento_fluxo_web.html')` indica o template.
- `@permission_required(...)` protege a tela.
- `title` e `links` serao usados pelo template.
- `return locals()` envia tudo para a tela.

### 4. Criar o template

Arquivo novo: `edu/templates/treinamento_fluxo_web.html`.

```django
{% extends super_template %}

{% block content %}
    {% box 'Fluxo URL, view e template' %}
        <p>
            Esta tela foi criada para demonstrar como uma URL chama uma view e
            como a view entrega dados para o template.
        </p>
    {% endbox %}

    {% box 'Links de navegacao' %}
        <ul class="action-bar">
            {% for label, url in links %}
                <li>
                    <a class="btn default" href="{{ url }}">{{ label }}</a>
                </li>
            {% endfor %}
        </ul>
    {% endbox %}

    {% box 'Dados recebidos da view' %}
        <table class="info">
            <tbody>
                <tr>
                    <td>Título</td>
                    <td>{{ title }}</td>
                </tr>
                <tr>
                    <td>Total de links</td>
                    <td>{{ links|length }}</td>
                </tr>
            </tbody>
        </table>
    {% endbox %}
{% endblock %}
```

Pontos para explicar:

- `{% extends super_template %}` usa o layout padrao do SUAP.
- `{% box %}` cria blocos visuais no padrao do sistema.
- O `{% for %}` percorre a lista criada na view.
- `{{ links|length }}` aplica um filtro de template para contar itens.

## IV. Alterar Templates Existentes

Objetivo: mostrar que muitos chamados simples sao ajustes em templates ja existentes, especialmente em PDFs.

### 1. Historico de aluno

Aluno de exemplo: `2006101022008`.

Arquivo:

- `edu/templates/emitir_historico_pdf.html`

Link para demonstracao:

- `http://localhost:8000/edu/emitir_historico_final_pdf/95812/`

Pontos para mostrar:

- `edu/templates/emitir_historico_pdf.html:364`: titulo `Dados Pessoais`.
- `edu/templates/emitir_historico_pdf.html:655`: titulo `ESTÁGIOS`.

Sugestao de demonstracao:

1. Abrir o link do PDF.
2. Localizar visualmente as secoes.
3. Alterar temporariamente um texto no template.
4. Recarregar o PDF.
5. Explicar que a mudanca foi apenas de apresentacao, nao de regra de negocio.

### 2. Declaracao de matricula

Matricula de exemplo: `20252011050012`.

Link:

- `http://localhost:8000/edu/declaracaomatricula_pdf/90632/`

View:

- `edu/views.py:7158`

Template:

- `edu/templates/declaracaomatricula_pdf.html`

Ponto para mostrar:

- `edu/templates/declaracaomatricula_pdf.html:5`: titulo `DECLARAÇÃO`.

Explique que a view `declaracaomatricula_pdf` usa:

- `@login_required`;
- `@documento('Declaração de Matrícula', ...)`;
- `@rtr()`.

Como `@rtr()` esta sem nome de template, o SUAP infere o template pelo nome da view.

### 3. Declaracao de vinculo

Matricula de exemplo: `20252160300009`.

Link:

- `http://localhost:8000/edu/declaracaovinculo_pdf/90362/`

View:

- `edu/views.py:6982`

Template:

- `edu/templates/declaracaovinculo_pdf.html`

Ponto para explicar:

- A view usa `@documento('Declaração de Vínculo Discente', ...)`.
- Por ter texto no primeiro parametro de `@documento`, o PDF recebe codigo de autenticacao.
- O template e separado da tela normal do aluno, porque PDF costuma precisar de layout mais simples.

## V. Fechamento do Fluxo

Feche reforcando a ordem de investigacao:

1. Qual URL foi acessada?
2. Qual view atende essa URL?
3. Quais decorators controlam acesso e renderizacao?
4. Quais dados a view envia para o template?
5. Qual template monta a tela ou PDF?
6. A mudanca e de apresentacao, regra de negocio, permissao ou dados?

Mensagem final: quando o desenvolvedor aprende a seguir esse caminho, ele deixa de procurar no escuro e passa a navegar pelo SUAP com metodo.
