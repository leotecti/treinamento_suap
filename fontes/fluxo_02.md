# Encontro 2 — Decoradores do SUAP

Objetivo: explicar os principais decorators usados em `edu/views.py` e, em seguida, demonstrar um exemplo pratico criando um PDF com os dados gerais do aluno.

## I. Decorators em `views.py`

No `views.py`, decorators sao funcoes que "embrulham" uma view para acrescentar comportamento antes ou depois dela executar.

Exemplo:

```python
@permission_required('edu.view_turma')
@rtr()
def turma(request, pk):
    ...
```

Leitura didatica:

1. A permissao e verificada.
2. A view executa.
3. O retorno da view e renderizado.

Observacao importante: o decorator mais perto da funcao e aplicado primeiro, mas na execucao da requisicao o decorator de cima costuma interceptar antes.

### 1. `@rtr()`

`@rtr()` e um dos decorators mais importantes do SUAP. Ele renderiza o retorno da view em um template.

Referencia:

- Importado em `edu/views.py`.
- Implementado em `djtools/utils/response.py:148`.

Comportamentos principais:

- Se nao passar template, ele tenta descobrir o template pelo nome da view.
- Se passar template, ele renderiza o arquivo especifico.
- Se a view retornar `HttpResponse`, `HttpResponseRedirect`, PDF, XLS ou outra resposta pronta, o `@rtr()` nao tenta renderizar template; ele devolve a resposta diretamente.

Exemplo sem template explicito:

```python
@rtr()
def alguma_view(request):
    title = 'Titulo'
    return locals()
```

Exemplo com template explicito:

```python
@rtr('transferir_turma_ou_diario.html')
def transferir_turma(request, pk):
    ...
```

Frase para usar: o `@rtr()` pega o envelope de dados da view e transforma em tela.

### 2. `@permission_required(...)`

`@permission_required` e o decorator de permissao do Django/SUAP.

Exemplo:

```python
@permission_required('edu.view_turma')
```

Referencia:

- Exemplo em `edu/views.py:1684`.
- Implementacao em `djtools/utils/__init__.py:1783`.

Ele verifica se o usuario possui a permissao informada. Se nao possuir, levanta `PermissionDenied`.

Tambem pode receber lista:

```python
@permission_required(['edu.gerar_relatorio', 'rh.eh_servidor'])
```

Por padrao, a logica e `or`: basta possuir uma das permissoes. Quando a regra exigir todas, pode ser usado:

```python
@permission_required(['edu.gerar_relatorio', 'rh.eh_servidor'], logic_operator='and')
```

Use quando a regra vier de permissoes declaradas no `permissions.yaml` ou permissoes Django.

### 3. `@group_required(...)`

`@group_required` e parecido com `@permission_required`, mas em vez de olhar permissao, olha grupo.

Exemplo:

```python
@group_required('Administrador Acadêmico,Diretor Acadêmico,Secretário Acadêmico')
```

Referencia:

- Exemplo em `edu/views.py:4559`.
- Implementacao em `djtools/utils/__init__.py:1753`.

Quando usar:

- Use `@group_required` quando a regra for diretamente: "este perfil/grupo pode acessar".
- Use `@permission_required` quando o acesso depender de permissoes do sistema, como `edu.view_aluno`, `edu.change_diario`, `edu.gerar_relatorio`.

### 4. `@login_required`

`@login_required` e o decorator padrao do Django para exigir usuario autenticado.

Exemplo:

```python
@login_required
def alguma_view(request):
    ...
```

ou:

```python
@login_required()
def alguma_view(request):
    ...
```

Referencia:

- Exemplo em `edu/views.py:6204`.

Distincao:

- `@login_required`: exige que o usuario esteja logado.
- `@permission_required`: exige permissao especifica.
- `@group_required`: exige pertencer a grupo especifico.

### 5. `@documento(...)`

`@documento` transforma uma view HTML em PDF/documento.

Referencia:

- Exemplo em `edu/views.py:1684`.
- Implementacao em `djtools/utils/__init__.py:1360`.

Padrao comum:

```python
@documento()
@rtr('template_pdf.html')
def minha_view_pdf(request, pk):
    ...
    return locals()
```

Leitura:

1. `@rtr` renderiza o HTML.
2. `@documento` transforma o HTML em PDF.

Parametros importantes:

#### A. `landscape=True`

Gera PDF em modo paisagem.

Exemplo:

```python
@documento(landscape=True)
```

Referencia: `edu/views.py:6245`.

#### B. `enumerar_paginas=False`

Remove a numeracao de paginas.

Exemplo:

```python
@documento(enumerar_paginas=False)
```

#### C. `validade=30`

Adiciona mensagem de validade do documento.

Exemplo:

```python
@documento('Declaração de Vínculo Discente', validade=30)
```

#### D. `modelo='edu.aluno'`

Associa o documento a um modelo.

Exemplo:

```python
@documento('Declaração de Matrícula', validade=30, modelo='edu.aluno')
```

#### E. Primeiro parametro: `@documento('Qualquer Coisa')`

Quando o primeiro parametro e informado, ele vira o `tipo_para_verificacao`.

Isso faz o SUAP:

- gerar `codigo_verificador`;
- inserir `Codigo de Autenticacao` no PDF;
- registrar o documento em `RegistroEmissaoDocumento`;
- permitir validacao em `/comum/autenticar_documento/`.

Referencia:

- Geracao do codigo em `djtools/utils/__init__.py:1423`.
- Insercao do rodape em `djtools/utils/__init__.py:1500-1508`.
- Registro do documento em `djtools/utils/__init__.py:1557-1595`.

Para PDF simples, sem autenticador, use:

```python
@documento()
```

### 6. `@transaction.atomic`

`@transaction.atomic` e do Django. Ele garante que as operacoes de banco dentro da view sejam executadas em uma transacao.

Se algo der erro durante a execucao, o banco pode fazer rollback.

Referencia:

- `edu/views.py:3568`.
- `edu/views.py:3596`.

Frase para usar: ou salva tudo, ou nao salva nada.

Use em acoes que gravam dados e precisam manter consistencia.

### 7. `@csrf_exempt`

`@csrf_exempt` remove a exigencia de token CSRF para aquela view.

Referencia:

- `edu/views.py:4274`.

Atencao: CSRF protege requisicoes POST contra envio malicioso vindo de outro site. Por isso, `@csrf_exempt` deve ser usado com cuidado e sempre com justificativa.

### 8. `@documentos.emissao_documentos()`

Este decorator e diferente dos anteriores. Ele nao e uma view comum de URL.

Ele conecta uma funcao a um sinal de emissao de documentos.

Referencia:

- Exemplo em `edu/views.py:481`.
- Implementacao em `djtools/documentos.py:6`.

Uso conceitual: quando o mecanismo de documentos dispara o sinal, a funcao decorada participa preenchendo dados ou tratando a emissao.

## II. Exemplo Pratico: Criar PDF com Dados Gerais do Aluno

Objetivo: criar um botao na tela do aluno que gera um PDF com os dados gerais.

Fluxo:

1. Criar URL.
2. Adicionar botao na tela do aluno.
3. Criar view PDF.
4. Criar template PDF.
5. Testar o resultado.

### 1. URL

Arquivo: `edu/urls.py`.

Adicionar perto das rotas de documentos do aluno:

```python
path('dados_gerais_aluno_pdf/<int:pk>/', views.dados_gerais_aluno_pdf),
```

Explique:

- `pk` e o identificador interno do aluno.
- A URL chama a view `dados_gerais_aluno_pdf`.

### 2. Botao na tela do aluno

Arquivo: `edu/templates/aluno.html`.

Adicionar dentro do bloco `action-bar`:

```django
<li>
    <a href="/edu/dados_gerais_aluno_pdf/{{ obj.pk }}/" class="btn">
        Gerar PDF - Dados Gerais
    </a>
</li>
```

Explicacao:

- `obj.pk` vem da view `aluno`.
- O botao aponta para a nova URL.
- No treinamento, o botao fica simples para facilitar a demonstracao.
- Em demanda real, avaliar se o botao deve aparecer apenas para determinados perfis.

### 3. View PDF

Arquivo: `edu/views.py`.

Adicionar perto de `atestadofrequencia_pdf`, que fica em `edu/views.py:6944-6976`.

```python
@login_required
@documento('Dados Gerais do Aluno', validade=30, enumerar_paginas=False, modelo='edu.aluno')
@rtr('dados_gerais_aluno_pdf.html')
def dados_gerais_aluno_pdf(request, pk):
    obj = get_object_or_404(Aluno, pk=pk)
    title = f'Dados Gerais - {obj.get_nome()} ({obj.matricula})'

    # Exemplo didatico do treinamento: a tela exige apenas usuario logado.
    # Em uma demanda real, replique aqui as regras contextuais da view aluno.
    is_admin = True
    pode_ver_cpf = True
    pode_ver_dados_sociais = True
    pode_ver_dados_academicos = True

    diploma = RegistroEmissaoDiploma.objects.filter(aluno=obj, cancelado=False).order_by('-via')
    emitiu_diploma = diploma.exists()
    situacao_sistemica = obj.get_situacao_sistemica()
    qtd_periodos = obj.matriz.qtd_periodos_letivos if obj.matriz else '-'
    uo = obj.curso_campus.diretoria.setor.uo

    return locals()
```

Pontos para explicar:

- `@login_required` exige usuario logado.
- `@documento(...)` gera PDF.
- Como usamos `@documento('Dados Gerais do Aluno', ...)`, o PDF recebe codigo de autenticacao.
- `@rtr('dados_gerais_aluno_pdf.html')` renderiza o template antes da conversao.
- As variaveis `is_admin`, `pode_ver_cpf`, `pode_ver_dados_sociais` e `pode_ver_dados_academicos` foram simplificadas para o treinamento.

Observacao para aula:

Em uma demanda real, nao manter `is_admin = True`. O correto e reaproveitar as regras de permissao da tela do aluno.

### 4. Template PDF

Arquivo novo: `edu/templates/dados_gerais_aluno_pdf.html`.

```django
{% extends "relatorio_pdf.html" %}

{% block style %}
    h1 {
        text-align: center;
        border: 1px solid #222;
        padding: 6px;
        font-size: 16pt;
    }

    .dados-gerais {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
    }

    .dados-gerais th {
        width: 24%;
        background: #f2f2f2;
        color: #333;
        border: 1px solid #ccc;
        padding: 6px;
        text-align: left;
        font-weight: bold;
    }

    .dados-gerais td {
        border: 1px solid #ccc;
        padding: 6px;
        text-align: left;
    }

    .foto {
        width: 95px;
        text-align: center;
    }

    .foto img {
        max-width: 75px;
        max-height: 100px;
    }

    .status-ok {
        background: #dff0d8;
        border-left: 4px solid #3c763d;
        padding: 3px 6px;
    }

    .status-alerta {
        background: #fcf8e3;
        border-left: 4px solid #8a6d3b;
        padding: 3px 6px;
    }

    .status-erro {
        background: #f2dede;
        border-left: 4px solid #a94442;
        padding: 3px 6px;
    }

    .observacao {
        font-size: 8pt;
        color: #555;
        line-height: 1.35em;
    }
{% endblock %}

{% block content %}

    <div class="corpo">
        <h1>Dados Gerais do Aluno</h1>

        <table class="dados-gerais">
            <tbody>
                <tr>
                    <td class="foto" rowspan="5">
                        <img src="{{ obj.get_foto_75x100_url }}" alt="Foto de {{ obj.get_nome }}">
                    </td>
                    <th>Nome</th>
                    <td>{{ obj.get_nome|normalizar }}</td>
                    <th>Matrícula</th>
                    <td>{{ obj.matricula }}</td>
                </tr>
                <tr>
                    <th>Ingresso</th>
                    <td>{{ obj.ano_letivo|format }}/{{ obj.periodo_letivo|format }}</td>
                    <th>E-mail Acadêmico</th>
                    <td>{{ obj.email_academico|format }}</td>
                </tr>
                <tr>
                    <th>E-mail Google Sala de Aula</th>
                    <td colspan="3">{{ obj.email_google_classroom|format }}</td>
                </tr>
                <tr>
                    <td colspan="4" class="observacao">
                        O login para este e-mail, e para os recursos do Google for Education,
                        e realizado exclusivamente atraves do link para o Google Sala de Aula
                        localizado no rodape de todas as paginas do SUAP. O login atraves de
                        senha nao esta habilitado para os servicos do Google for Education.
                    </td>
                </tr>
                <tr>
                    <th>CPF</th>
                    <td>{% if pode_ver_cpf %}{{ obj.pessoa_fisica.cpf|format }}{% else %}***.****.***-**{% endif %}</td>
                    <th>Período de Referência</th>
                    <td>{{ obj.periodo_atual|format }}º</td>
                </tr>
                <tr>
                    <th>I.R.A.</th>
                    <td>{% if pode_ver_dados_sociais or pode_ver_dados_academicos %}{{ obj.get_ira|format }}{% else %}**{% endif %}</td>
                    <th>Curso</th>
                    <td colspan="3">
                        {{ obj.curso_campus }}
                        {% if obj.habilitacao %} - Habilitação em {{ obj.habilitacao|format }}{% endif %}
                    </td>
                </tr>
                <tr>
                    <th>Matriz</th>
                    <td colspan="2">{{ obj.matriz|format }}</td>
                    <th>Qtd. Períodos</th>
                    <td>{{ qtd_periodos|format }}</td>
                </tr>
                <tr>
                    <th>Situação Sistêmica</th>
                    <td>
                        <span class="{% if situacao_sistemica.0 == 1 %}status-erro{% elif situacao_sistemica.0 == 2 %}status-alerta{% else %}status-ok{% endif %}">
                            {{ situacao_sistemica.1 }}
                        </span>
                    </td>
                    <th>Data da Migração</th>
                    <td colspan="2">{{ obj.data_integralizacao|format }}</td>
                </tr>
                <tr>
                    <th>Impressão Digital</th>
                    <td>{{ obj.pessoa_fisica.tem_digital|format }}</td>
                    <th>Chave Primária</th>
                    <td colspan="2">{% if is_admin %}{{ obj.pk }}{% else %}-{% endif %}</td>
                </tr>
                <tr>
                    <th>Emitiu Diploma</th>
                    <td>{{ emitiu_diploma|format }}</td>
                    <th>Campus</th>
                    <td colspan="2">{{ uo|format }}</td>
                </tr>
            </tbody>
        </table>
    </div>

{% endblock %}
```

### 5. Teste em aula

1. Abrir a tela de um aluno.
2. Verificar se o botao `Gerar PDF - Dados Gerais` aparece.
3. Clicar no botao.
4. Conferir se o PDF abre.
5. Conferir se aparece o codigo de autenticacao.
6. Acrescentar `?html=1` na URL para depurar o HTML antes da conversao em PDF.

## III. Fechamento

Reforce os pontos principais:

- Decorators controlam comportamento da view.
- `@rtr` transforma dados em HTML.
- `@documento` transforma HTML em PDF.
- `@documento('Tipo')` cria documento autenticavel.
- O template PDF deve ser mais simples que a tela normal.
- Em treinamento podemos simplificar permissao; em producao, a regra deve ser cuidadosa.

Mensagem final: para entender uma view no SUAP, leia primeiro os decorators. Eles contam muita coisa sobre permissao, renderizacao, transacao e tipo de resposta.
