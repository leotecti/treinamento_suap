const challengeStyles = document.createElement("link");
challengeStyles.rel = "stylesheet";
challengeStyles.href = "chamados.css";
document.head.append(challengeStyles);
const $ = (s) => document.querySelector(s),
  samples = window.SUAP_SAMPLES;
const course = [
  {
    id: "m1",
    num: "01",
    name: "Arquitetura e fluxo web",
    desc: "Entenda como o SUAP conecta URLs, views, models, forms e templates.",
    goals: [
      "Reconhecer a estrutura do módulo EDU",
      "Seguir o caminho de uma requisição",
      "Identificar métodos e relacionamentos do model Turma",
      "Montar uma tela simples conectando URL, view protegida e template",
      "Investigar e atender chamados simples de alteração de interface",
    ],
    tasks: [
      "Localize a rota da página de turma em edu/urls.py.",
      "Localize a view turma() e identifique o parâmetro pk.",
      "Encontre os managers objects e locals no model Turma.",
      "Explique de onde vêm alunos, diários e horários da turma.",
      "Localize o bloco de relatórios em edu/urls.py e identifique onde a nova rota seria inserida.",
      "Examine relatorio_horario em edu/views.py e registre quais elementos podem orientar uma nova view.",
      "Explique como @rtr, @permission_required e return locals() participam da tela de treinamento.",
      "Em um ambiente isolado, crie o template proposto e confirme que título, links e total de links são exibidos.",
    ],
    quiz: [
      [
        "Qual componente decide qual view atenderá uma URL?",
        ["Model", "urls.py", "Template"],
        1,
        "O arquivo de rotas mapeia o caminho solicitado para uma view.",
      ],
      [
        "Qual método da view procura a turma e retorna 404 se não a encontrar?",
        ["get_object_or_404", "get_horarios", "locals"],
        0,
        "get_object_or_404 consulta o manager informado e responde com 404 quando não encontra o objeto.",
      ],
      [
        "Quem entrega o contexto ao template no fluxo MTV?",
        [
          "Model diretamente",
          "Banco de dados",
          "View, com ajuda do mecanismo de renderização",
        ],
        2,
        "A view prepara os dados; o decorator @rtr do SUAP pode transformar o dicionário retornado em resposta renderizada.",
      ],
      [
        "Na nova tela, qual elemento protege o acesso no servidor?",
        [
          "A classe CSS do botão",
          "@permission_required",
          "O laço for do template",
        ],
        1,
        "@permission_required verifica a autorização antes da execução da view; controles visuais do template não substituem essa proteção.",
      ],
    ],
  },
  {
    id: "m2",
    num: "02",
    name: "Decorators e geração de PDF",
    desc: "Descubra como @rtr, @documento, httprr e PDFResponse participam das respostas.",
    goals: [
      "Entender o papel de um decorator",
      "Explicar o retorno locals() da view turma()",
      "Distinguir redirecionamento e resposta PDF",
    ],
    tasks: [
      "Localize a função rtr() em djtools/utils/response.py.",
      "Identifique o teste isinstance(f_return, HttpResponse).",
      "Encontre get_template_path() e explique a convenção de nomes.",
      "Examine httprr() e PDFResponse e registre suas diferenças.",
    ],
    quiz: [
      [
        "O que @rtr faz quando a view retorna um dicionário?",
        [
          "Renderiza um template usando o retorno como contexto",
          "Exclui os dados",
          "Cria uma migration",
        ],
        0,
        "A implementação chama render() quando o retorno não é um HttpResponse.",
      ],
      [
        "O que acontece se a view já retornar HttpResponse?",
        [
          "É renderizado novamente",
          "@rtr devolve a resposta diretamente",
          "O usuário recebe erro 404",
        ],
        1,
        "O decorator verifica isinstance(f_return, HttpResponse) e retorna o resultado sem renderização adicional.",
      ],
      [
        "Qual resposta é própria para conteúdo PDF no trecho fornecido?",
        ["HttpRequest", "PDFResponse", "get_template_path"],
        1,
        "PDFResponse define content_type application/pdf e Content-Disposition.",
      ],
    ],
  },
  {
    id: "m3",
    num: "03",
    name: "Grupos e permissões",
    desc: "Entenda como papéis, YAML, permissões e verificações contextuais se relacionam.",
    goals: [
      "Distinguir grupo, permissão e regra contextual",
      "Compreender a função de permissions.yaml",
      "Investigar uma autorização no módulo EDU",
    ],
    tasks: [
      "Localize um grupo acadêmico em permissions.yaml.",
      "Identifique uma checagem has_group_cached na view turma().",
      "Localize perms.realizar_procedimentos_academicos e descreva seus parâmetros.",
      "Explique por que ocultar um botão no template não substitui a autorização na view.",
    ],
    quiz: [
      [
        "Onde o SUAP declara permissões de grupos, conforme o roteiro?",
        ["permissions.yaml", "models.py apenas", "templates/ apenas"],
        0,
        "O YAML associa grupos e permissões, que precisam ser sincronizadas no sistema.",
      ],
      [
        "A variável pode_realizar_procedimentos considera:",
        [
          "Apenas a URL",
          "Usuário e curso da turma",
          "Apenas o nome do template",
        ],
        1,
        "A view chama perms.realizar_procedimentos_academicos(request.user, obj.curso_campus).",
      ],
      [
        "Ocultar uma ação no template é suficiente para impedir seu uso?",
        [
          "Sim",
          "Somente com JavaScript",
          "Não, a operação precisa verificar autorização no servidor",
        ],
        2,
        "O controle visual melhora a interface, mas não substitui a autorização no backend.",
      ],
    ],
  },
  {
    id: "m4",
    num: "04",
    name: "Forms e relatórios",
    desc: "Aprenda a criar, validar e testar formulários, consultas, relatórios e PDFs no SUAP.",
    goals: [
      "Diferenciar FormPlus e ModelFormPlus",
      "Relacionar form, view, model e template",
      "Criar filtros, relatórios e PDFs autenticáveis",
      "Editar registros com instance e save()",
      "Usar recursos específicos do SUAP com segurança",
    ],
    tasks: [
      "Acompanhe o ciclo de um formulário desde a URL até a resposta.",
      "Compare um relatório GET com uma edição POST.",
      "Explique o papel de is_valid(), cleaned_data, instance e processar().",
      "Analise um AutocompleteWidget e seus filtros dependentes.",
      "Teste uma atividade de relatório, PDF ou edição em ambiente isolado.",
      "Execute o checklist de permissões, escopo e acesso direto à URL.",
    ],
    quiz: [
      [
        "Qual classe é mais adequada para um formulário que não salva diretamente um model?",
        ["ModelFormPlus", "FormPlus", "ModelAdminPlus"],
        1,
        "FormPlus é usado para filtros, consultas e operações que não correspondem a um único model.",
      ],
      [
        "O que instance=obj indica em um ModelFormPlus?",
        ["Que um novo objeto será criado", "Que o objeto existente será editado", "Que a validação será ignorada"],
        1,
        "A instância existente é carregada e form.save() atualiza esse registro.",
      ],
      [
        "Por que um formulário de relatório costuma usar GET?",
        ["Para manter filtros na URL", "Para enviar arquivos", "Para esconder a consulta"],
        0,
        "GET é adequado para consultas e permite atualizar, compartilhar ou salvar a URL com os filtros.",
      ],
    ],
  },
  {
    id: "m5",
    num: "05",
    name: "Models do SUAP",
    desc: "Compreenda models, relacionamentos, regras de negócio, consultas ORM e migrations no módulo EDU.",
    goals: [
      "Identificar o papel de um model no Django e no SUAP",
      "Ler campos, relacionamentos, Meta, ModelPlus e LogModel",
      "Compreender save(), clean(), full_clean(), update() e delete()",
      "Compor consultas eficientes e evitar o problema N+1",
      "Relacionar models com forms, views, templates, admin e relatórios",
    ],
    tasks: [
      "Leia um model real e reconstrua seu caminho até a tela.",
      "Compare uma consulta com e sem select_related().",
      "Identifique onde uma regra deve ficar: campo, model, form, view ou banco.",
      "Revise uma migration e confira o SQL produzido.",
      "Conclua as quatro práticas integradas da página Models.",
    ],
    quiz: [
      [
        "Qual operação chama o save() da instância?",
        ["QuerySet.update()", "obj.save()", "values_list()"],
        1,
        "obj.save() persiste a instância e pode executar a implementação sobrescrita pelo model.",
      ],
      [
        "Qual recurso é indicado para uma relação de vários objetos?",
        ["prefetch_related()", "select_related() sempre", "get_absolute_url()"],
        0,
        "prefetch_related() busca relações múltiplas em consultas separadas e associa os resultados.",
      ],
      [
        "Qual arquivo registra a evolução da estrutura do banco?",
        ["Template", "Migration", "QuerySet"],
        1,
        "A migration registra operações que alteram o schema ou transformam dados.",
      ],
    ],
  },
  {
    id: "m6",
    num: "06",
    name: "Admin do SUAP",
    desc: "Compreenda como o Django Admin e o ModelAdminPlus organizam listagens, formul\u00e1rios, filtros, a\u00e7\u00f5es e permiss\u00f5es.",
    goals: [
      "Reconhecer a rela\u00e7\u00e3o entre model e interface administrativa",
      "Configurar colunas, filtros, buscas e formul\u00e1rios do admin",
      "Entender a\u00e7\u00f5es, permiss\u00f5es e escopos de consulta",
      "Investigar uma tela administrativa seguindo seus arquivos",
    ],
    tasks: [
      "Leia o encontro Admin e identifique o ModelAdmin respons\u00e1vel por uma tela do EDU.",
      "Relacione list_display, list_filter, search_fields e fieldsets com a experi\u00eancia da listagem.",
      "Acompanhe uma a\u00e7\u00e3o administrativa at\u00e9 sua view e regra de permiss\u00e3o.",
      "Compare objects e managers contextuais no queryset exibido pelo admin.",
      "Use o checklist final para revisar uma altera\u00e7\u00e3o administrativa em ambiente isolado.",
    ],
    quiz: [
      [
        "Qual \u00e9 a principal responsabilidade de uma classe ModelAdminPlus?",
        ["Criar tabelas no banco", "Configurar a interface administrativa de um model", "Renderizar somente arquivos PDF"],
        1,
        "A classe configura listagens, formul\u00e1rios, filtros, a\u00e7\u00f5es e regras da interface administrativa.",
      ],
      [
        "Qual configura\u00e7\u00e3o define as colunas exibidas na listagem?",
        ["list_display", "search_fields", "fieldsets"],
        0,
        "list_display define os campos ou m\u00e9todos usados como colunas da listagem.",
      ],
      [
        "Por que uma a\u00e7\u00e3o administrativa tamb\u00e9m precisa de valida\u00e7\u00e3o no servidor?",
        ["Porque o bot\u00e3o n\u00e3o substitui a autoriza\u00e7\u00e3o e as regras de neg\u00f3cio", "Porque o template n\u00e3o aceita HTML", "Porque o model n\u00e3o pode ser consultado"],
        0,
        "A interface apenas inicia a opera\u00e7\u00e3o; a view ou a a\u00e7\u00e3o deve verificar permiss\u00f5es, escopo e consist\u00eancia.",
      ],
    ],
  },
];
const module2Course = course.find((m) => m.id === "m2");
module2Course.desc =
  "Compreenda como os decorators controlam autenticação, autorização, renderização, transações e geração de documentos no SUAP.";
module2Course.goals = [
  "Explicar a ordem de aplicação e execução dos decorators",
  "Distinguir @login_required, @permission_required e @group_required",
  "Compreender @rtr, @documento e seus principais parâmetros",
  "Reconhecer os cuidados de @transaction.atomic e @csrf_exempt",
  "Montar e testar um PDF autenticável com dados gerais do aluno",
];
module2Course.tasks = [
  "Localize a função rtr() em djtools/utils/response.py.",
  "Identifique o teste isinstance(f_return, HttpResponse).",
  "Encontre get_template_path() e explique a convenção de nomes.",
  "Examine httprr() e PDFResponse e registre suas diferenças.",
  "Compare @login_required, @permission_required e @group_required e registre quando utilizar cada um.",
  "Localize a implementação de @documento e identifique os efeitos de landscape, enumerar_paginas, validade e modelo.",
  "Explique o que muda quando @documento recebe um primeiro parâmetro textual.",
  "Localize exemplos de @transaction.atomic, @csrf_exempt e @documentos.emissao_documentos() nas referências indicadas.",
  "Crie a URL e o botão do exemplo Dados Gerais do Aluno em um ambiente isolado.",
  "Implemente a view e o template PDF do exemplo, substituindo permissões fixas por regras adequadas antes de qualquer uso real.",
  "Teste o PDF, o código de autenticação e a visualização HTML com ?html=1.",
];
module2Course.quiz = [
  [
    "O que @rtr faz quando a view retorna um dicionário?",
    [
      "Renderiza um template usando o retorno como contexto",
      "Exclui os dados",
      "Cria uma migration",
    ],
    0,
    "A implementação chama render() quando o retorno não é um HttpResponse.",
  ],
  [
    "O que acontece se a view já retornar HttpResponse?",
    [
      "É renderizado novamente",
      "@rtr devolve a resposta diretamente",
      "O usuário recebe erro 404",
    ],
    1,
    "O decorator verifica isinstance(f_return, HttpResponse) e retorna o resultado sem renderização adicional.",
  ],
  [
    "Qual resposta é própria para conteúdo PDF no trecho fornecido?",
    ["HttpRequest", "PDFResponse", "get_template_path"],
    1,
    "PDFResponse define content_type application/pdf e Content-Disposition.",
  ],
  [
    "Qual decorator transforma o HTML renderizado em documento PDF?",
    ["@rtr", "@documento", "@login_required"],
    1,
    "@rtr prepara o HTML; @documento converte esse resultado em PDF/documento.",
  ],
  [
    "Em uma lista de permissões, qual é a lógica padrão de @permission_required?",
    ["and", "or", "xor"],
    1,
    'Por padrão, possuir uma das permissões é suficiente. Use logic_operator="and" quando todas forem obrigatórias.',
  ],
  [
    "O que acontece quando @documento recebe um primeiro parâmetro textual?",
    [
      "O template deixa de ser usado",
      "O documento ganha tipo de verificação e pode receber código de autenticação",
      "A view fica pública",
    ],
    1,
    "O texto define tipo_para_verificacao, permitindo registrar e autenticar o documento.",
  ],
  [
    "Qual cuidado é obrigatório no exemplo Dados Gerais do Aluno?",
    [
      "Manter is_admin=True em produção",
      "Remover todos os decorators",
      "Substituir permissões fixas pelas regras contextuais reais",
    ],
    2,
    "Os valores True existem apenas para a demonstração. Uma demanda real deve reaproveitar as regras de autorização da tela do aluno.",
  ],
];
const module3Course = course.find((m) => m.id === "m3");
module3Course.desc =
  "Acompanhe grupos, YAML, sincronização e checagens; investigue regras contextuais e três chamados reais do EDU.";
module3Course.goals.push(
  "Explicar o fluxo permissions.yaml → sync_permissions → banco → checagem",
  "Localizar verificações em views, templates, menus, decorators e managers",
  "Comparar os chamados 1144, 1168 e 1157",
  "Validar alterações de permissão e restaurar o ambiente de treinamento",
);
module3Course.tasks.push(
  "Leia a declaração Administrador Acadêmico e identifique grupo, app, modelo e codename.",
  "Localize sync_permissions e sync_groups_and_permissions e confirme como adicionam e removem associações.",
  "Registre exemplos das cinco camadas de checagem com arquivo e linha.",
  "Aplique o checklist de investigação a uma demanda e registre evidências e dados sensíveis envolvidos.",
  "Em ambiente isolado, teste a alteração de view_aluno e restaure o estado inicial; registre as permissões efetivas.",
  "Em ambiente isolado, teste add_aluno no botão e na URL direta do admin; restaure e registre o resultado.",
  "Analise a issue 1144 e a alteração correspondente; registre o alcance das três permissões de aluno.",
  "Analise a issue 1168 e a alteração correspondente; siga perms.py → view → template ENADE.",
  "Analise a issue 1157 e a alteração correspondente; confira as views de destino dos documentos.",
);
module3Course.quiz.push(
  [
    "As telas consultam diretamente o YAML em cada acesso?",
    [
      "Sim",
      "Não: a sincronização alimenta as associações no banco",
      "Somente os templates",
    ],
    1,
    "O YAML declara permissões; a aplicação verifica as associações sincronizadas e as regras contextuais.",
  ],
  [
    "Quando a condição com três has_perm negados ligados por and deixa de bloquear?",
    [
      "Quando ao menos uma permissão aceita está presente",
      "Somente quando todas estão presentes",
      "Quando o menu aparece",
    ],
    0,
    "Basta uma das permissões para essa condição não bloquear; outras regras ainda podem restringir o acesso.",
  ],
  [
    "Qual camada mudou no chamado 1168?",
    ["Apenas o menu", "Uma regra contextual em edu/perms.py", "O CSS"],
    1,
    "O grupo Secretário Acadêmico foi incluído na regra ENADE, consumida pela view e pelo template.",
  ],
  [
    "Remover view_aluno de um grupo garante a perda do acesso?",
    [
      "Sempre",
      "Não: confira sincronização, outros grupos e permissões diretas",
      "Sim, se o botão sumiu",
    ],
    1,
    "Confirme a revogação no banco e a ausência de outras fontes de permissão antes de avaliar a checagem.",
  ],
  [
    "O trecho do chamado 1157 comprova bloqueio de documentos no servidor?",
    [
      "Sim",
      "Não: é preciso conferir as views de destino",
      "Sim, porque altera o template",
    ],
    1,
    "O trecho controla apresentação. Ocultar Documentos não substitui a autorização na view.",
  ],
);
const moduleChallenges = {
  m1: [
    {
      id: "pesquisa-aluno-titulo",
      title: "Título da pesquisa de aluno",
      area: "Administração acadêmica",
      url: "https://suap.ifg.edu.br/admin/edu/aluno/",
      request:
        "A equipe da Secretaria Acadêmica solicita que o título exibido na página de pesquisa de alunos seja alterado para “Pesquisa de Aluno”.",
      acceptance:
        "Ao acessar a pesquisa de alunos, a página deve apresentar o novo título sem alterar os filtros ou os resultados.",
    },
    {
      id: "pesquisa-aluno-botao",
      title: "Texto do botão de pesquisa",
      area: "Administração acadêmica",
      url: "https://suap.ifg.edu.br/admin/edu/aluno/",
      request:
        "Na mesma tela de pesquisa de alunos, altere o texto do botão responsável por iniciar a consulta para “Pesquisar”.",
      acceptance:
        "O botão deve exibir “Pesquisar” e continuar executando a busca normalmente.",
    },
    {
      id: "aluno-período-ingresso",
      title: "Rótulo do período de ingresso",
      area: "Detalhamento do aluno",
      url: "https://suap.ifg.edu.br/edu/aluno/id_matricula/",
      request:
        "No detalhamento do aluno, substitua o texto “Ingresso” por “Período de Ingresso”.",
      acceptance:
        "O novo rótulo deve aparecer no detalhamento sem modificar o valor ou os demais dados acadêmicos.",
    },
    {
      id: "aluno-período-ingresso-duplicado",
      title: "Rótulo do período de ingresso",
      area: "Detalhamento do aluno · possível duplicidade",
      url: "https://suap.ifg.edu.br/edu/aluno/id_matricula/",
      request:
        "No detalhamento do aluno, substitua o texto “Ingresso” por “Período de Ingresso”.",
      acceptance:
        "Antes de implementar, compare este pedido com os chamados em aberto, identifique a possível duplicidade e registre a decisão de atendimento.",
      duplicate: true,
    },
  ],
};
moduleChallenges.m2 = [
  {
    id: "restringir-relatório-permissão",
    title: "Restringir relatório por permissão",
    area: "Autorização · @permission_required",
    url: "/edu/relatorio_horario/",
    request:
      "A página do relatório está disponível para qualquer usuário autenticado. Altere a proteção da view para exigir a permissão edu.gerar_relatorio.",
    acceptance:
      "Um usuário com a permissão acessa o relatório normalmente; um usuário sem a permissão recebe acesso negado pelo servidor.",
  },
  {
    id: "restringir-tela-grupo",
    title: "Restringir tela por grupo",
    area: "Autorização · @group_required",
    url: "edu/views.py · view acadêmica indicada no exercício",
    request:
      "Restrinja a funcionalidade acadêmica aos grupos Administrador Acadêmico, Diretor Acadêmico e Secretário Acadêmico.",
    acceptance:
      "Somente usuários pertencentes a pelo menos um dos grupos informados conseguem executar a view.",
  },
  {
    id: "ajustar-pdf-paisagem",
    title: "Ajustar orientação e páginação de PDF",
    area: "Documento · @documento",
    url: "edu/views.py · relatório PDF indicado no exercício",
    request:
      "O relatório possui muitas colunas e está difícil de ler. Gere o documento em modo paisagem e remova a numeração das páginas.",
    acceptance:
      "O PDF é gerado com landscape=True e enumerar_paginas=False, sem perder informações do relatório.",
  },
  {
    id: "declaração-autenticavel",
    title: "Tornar declaração autenticável",
    area: "Documento · código verificador",
    url: "/comum/autenticar_documento/",
    request:
      "Uma declaração atualmente gera um PDF simples. Configure-a com validade de 30 dias e código de autenticação para que possa ser verificada no SUAP.",
    acceptance:
      "O PDF apresenta código de autenticação, o documento é registrado e sua verificação pode ser realizada na área de autenticação.",
  },
  {
    id: "corrigir-dados-pessoais-pdf",
    title: "Corrigir exposição de dados pessoais no PDF",
    area: "Segurança · regras contextuais",
    url: "/edu/dados_gerais_aluno_pdf/<pk>/",
    request:
      "O PDF de dados gerais utiliza permissões fixas, como pode_ver_cpf = True. Substitua esses valores pelas regras contextuais aplicadas na tela do aluno.",
    acceptance:
      "CPF e demais dados sensíveis aparecem somente para usuários autorizados; para os demais, as informações permanecem ocultas ou mascaradas.",
  },
];
let state = {};
try {
  state = JSON.parse(localStorage.getItem("suapEduParticipanteV1") || "{}");
} catch {}
const save = () =>
  localStorage.setItem("suapEduParticipanteV1", JSON.stringify(state));
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const taskDone = (m) =>
  m.tasks.filter((t, i) => state["task:" + m.id + ":" + i]).length;
const challengeDone = (m) =>
  (moduleChallenges[m.id] || []).filter(
    (c) => state["ticket:" + m.id + ":" + c.id],
  ).length;
const moduleTotal = (m) =>
  m.tasks.length + (moduleChallenges[m.id] || []).length;
const moduleDone = (m) => taskDone(m) + challengeDone(m);
const modulePercent = (m) => Math.round((moduleDone(m) / moduleTotal(m)) * 100);
const card = (m) =>
  `<section class="modulecard"><span class="tag">MÓDULO ${m.num} · DISPONÍVEL</span><h3>${m.name}</h3><p>${m.desc}</p><div class="bar"><div style="width:${modulePercent(m)}%"></div></div><span class="muted small">${moduleDone(m)}/${moduleTotal(m)} atividades realizadas</span><button class="btn" data-page="${m.id}">Estudar módulo →</button></section>`;
function home() {
  return `<div class="hero"><span class="eyebrow">TRILHA DE APRENDIZAGEM · SUAP EDU</span><h1>Introdução ao Desenvolvimento SUAP</h1><p>Um guia de estudos com exemplos reais de código, exercícios práticos e explicações para consultar durante e depois das aulas.</p><button class="btn" data-page="m1">Começar pelo módulo 01 →</button></div><div class="stats"><div class="stat"><strong>12 h</strong><span>6 encontros · 2 h cada</span></div><div class="stat"><strong>06</strong><span>M\u00f3dulos de estudo dispon\u00edveis</span></div><div class="stat"><strong>${course.reduce((n, m) => n + moduleDone(m), 0)}/${course.reduce((n, m) => n + moduleTotal(m), 0)}</strong><span>Atividades realizadas</span></div></div><section class="panel"><span class="tag">ENTENDA A ARQUITETURA</span><h2>Do endereço à página: o fluxo MTV</h2><p class="muted">A view recebe a requisição encaminhada pelas URLs, consulta os models e prepara o contexto utilizado pelo template.</p><img class="diagram" src="fluxo_django_mtv.png" alt="Diagrama do fluxo: usuário, URL, view, model, banco de dados, template e resposta HTML"><p class="small muted">Diagrama introdutório. O processamento real também pode retornar JSON, PDF ou redirecionamentos.</p></section><h2>Seus módulos de estudo</h2><div class="grid3">${course.map(card).join("")}</div><section class="panel"><h2>Como estudar com este guia</h2><div class="grid3"><div><h3>01 · Compreenda</h3><p>Leia os conceitos e examine as relações entre os componentes.</p></div><div><h3>02 · Investigue</h3><p>Abra os arquivos indicados no VSCode e localize as implementações.</p></div><div><h3>03 · Pratique</h3><p>Conclua as atividades, responda às questões e registre suas descobertas.</p></div></div></section><div class="tip">Os seis encontros est\u00e3o dispon\u00edveis na trilha de estudos.</div>`;
}
const row = (a, b) => `<tr><th>${a}</th><td>${b}</td></tr>`;
function plan() {
  return `<div class="sectionhead"><span class="eyebrow">ORIENTAÇÃO DO CURSO</span><h1>Plano de curso</h1><p>Desenvolvimento SUAP com foco no EDU · 12 horas · 6 encontros de 2 horas</p></div><div class="panel"><h2>Por que este curso?</h2><p>O SUAP é um projeto Django modular com componentes próprios. O módulo <code>edu</code> reúne regras acadêmicas, cadastros, diários, horários, históricos, documentos e permissões. Aqui você aprenderá a localizar e compreender implementações reais antes de propor alterações.</p><h3>Objetivo geral</h3><p>Desenvolver autonomia para localizar funcionalidades, compreender fluxos web, investigar chamados, alterar regras de negócio e validar correções no SUAP.</p><h3>O que você deverá conseguir fazer</h3><ul><li>Reconhecer a organização do projeto e do módulo EDU.</li><li>Seguir uma URL até a view, o model, o form e o template.</li><li>Compreender managers, consultas ORM e permissões contextuais.</li><li>Investigar erros usando evidências e propor correções seguras.</li><li>Criar ou adaptar testes de regressão.</li></ul></div><div class="panel"><h2>Os seis encontros</h2><div class="tablewrap"><table><thead><tr><th>Encontro</th><th>Tema do menu</th><th>Caso principal</th><th>Atividade</th><th>Duração</th></tr></thead><tbody>${[
    [
      "01",
      "Introdução ao fluxo do SUAP",
      "URL → view → template",
      "Exploração",
      "2 horas",
    ],
    [
      "02",
      "Decoradores do SUAP",
      "Respostas, redirecionamentos e PDFs",
      "Exploração",
      "2 horas",
    ],
    [
      "03",
      "Permissões do SUAP",
      "Grupos, sincronização e regras contextuais",
      "Diagnóstico",
      "2 horas",
    ],
    [
      "04",
      "Forms e relatórios",
      "Validações, filtros e relatórios",
      "Exploração/implementação",
      "2 horas",
    ],
    [
      "05",
      "Models do SUAP",
      "Relacionamentos, managers e consultas ORM",
      "Exploração/diagnóstico",
      "2 horas",
    ],
    [
      "06",
      "Admin do SUAP",
      "Configuração e personalização do admin",
      "Implementação",
      "2 horas",
    ],
  ]
    .map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`)
    .join(
      "",
    )}</tbody></table></div></div><div class="grid2"><section class="panel"><h2>Metodologia</h2><p><strong>Conhecer → Localizar → Compreender → Investigar → Corrigir → Validar.</strong></p><p>As atividades são de exploração, diagnóstico e implementação em ambiente isolado.</p></section><section class="panel"><h2>Avaliação</h2><p>Participação nas investigações, entregáveis, referências a arquivos e linhas, clareza na identificação de causas e qualidade das propostas de teste.</p></section></div><div class="panel"><h2>Versões e referências</h2><p>O repositório analisado utiliza Django 4.1.5, DRF 3.14.0, Celery 5.2.7 e behave 1.2.6. O ambiente de desenvolvimento documentado usa PostgreSQL.</p><p>Linhas verificadas em 11/10/2026; podem variar conforme a versão do repositório.</p><a href="plano_curso.md" download>Baixar o plano completo em Markdown ↓</a></div>`;
}
function code(key, title, desc) {
  const x = samples[key];
  return `<section class="codepanel"><h3>${title}</h3><p>${desc}</p><div class="fileline">${escape(x.file)} ${x.line ? `· linhas ${x.line}–${x.end}.` : ""}</div><div class="codebar"><span class="tag">CÓDIGO REAL · ${key === "view" ? "VIEW COMENTADA" : "FONTE ANEXADA"}</span><div class="buttons"><button data-copy="${key}">Copiar</button><button data-toggle="${key}">Ocultar comentários</button></div></div><div class="codebox" id="code-${key}">${x.code
    .split("\n")
    .map(
      (l, i) =>
        `<span class="line ${l.trim().startsWith("#") ? "comment" : ""}"><span class="ln">${x.line ? x.line + i : i + 1}</span>${escape(l) || " "}</span>`,
    )
    .join("")}</div></section>`;
}
const decoratorOrderExample = `@permission_required('edu.view_turma')
@rtr()
def turma(request, pk):
    ...`;
const rtrImplicitExample = `@rtr()
def alguma_view(request):
    title = 'Titulo'
    return locals()`;
const rtrExplicitExample = `@rtr('transferir_turma_ou_diario.html')
def transferir_turma(request, pk):
    ...`;
const permissionExamples = `@permission_required('edu.view_turma')

@permission_required(['edu.gerar_relatorio', 'rh.eh_servidor'])

@permission_required(
    ['edu.gerar_relatorio', 'rh.eh_servidor'],
    logic_operator='and'
)`;
const groupRequiredExample = `@group_required('Administrador Acadêmico,Diretor Acadêmico,Secretário Acadêmico')`;
const loginRequiredExample = `@login_required
def alguma_view(request):
    ...

# A forma com parênteses também é aceita:
@login_required()
def outra_view(request):
    ...`;
const documentoPatternExample = `@documento()
@rtr('template_pdf.html')
def minha_view_pdf(request, pk):
    ...
    return locals()`;
const documentoParametersExample = `@documento(landscape=True)
@documento(enumerar_paginas=False)
@documento('Declaração de Vínculo Discente', validade=30)
@documento('Declaração de Matrícula', validade=30, modelo='edu.aluno')

# PDF simples, sem autenticador:
@documento()`;
const registroEmissaoExplanation = `<h3>Como funciona o <code>RegistroEmissaoDocumento</code></h3><p><code>RegistroEmissaoDocumento</code> é o model que registra os PDFs autenticáveis emitidos pelo SUAP. Ele conecta o arquivo armazenado, o código de autenticação, a data de emissão e o objeto que deu origem ao documento.</p><div class="fileline">Model: <code>comum/models.py:3783-3830</code> · tabela padrão: <code>comum_registroemissaodocumento</code></div><h4>O que fica registrado</h4><pre class="codebox"><code>class RegistroEmissaoDocumento(models.ModelPlus):
    tipo = models.CharFieldPlus()
    data_emissao = models.DateFieldPlus()
    codigo_verificador = models.TextField()
    documento = models.FileFieldPlus()
    data_validade = models.DateFieldPlus()
    modelo_pk = models.IntegerField()
    tipo_objeto = models.ForeignKeyPlus(ContentType)
    objeto = GenericForeignKey('tipo_objeto', 'modelo_pk')
    cancelado = models.BooleanField(default=False)</code></pre><div class="tablewrap"><table><thead><tr><th>Campo</th><th>Finalidade</th></tr></thead><tbody><tr><td><code>tipo</code></td><td>Identifica o documento, como Plano de Ensino.</td></tr><tr><td><code>data_emissao</code></td><td>Registra quando o PDF foi gerado.</td></tr><tr><td><code>codigo_verificador</code></td><td>Guarda o código usado na autenticação.</td></tr><tr><td><code>documento</code></td><td>Aponta para o PDF armazenado.</td></tr><tr><td><code>data_validade</code></td><td>Registra uma validade quando ela foi configurada.</td></tr><tr><td><code>tipo_objeto</code> e <code>modelo_pk</code></td><td>Identificam o model e o registro que originaram o documento.</td></tr><tr><td><code>cancelado</code></td><td>Indica se a emissão deixou de ser aceita.</td></tr></tbody></table></div><p>O par <code>tipo_objeto</code> e <code>modelo_pk</code> permite que o mesmo model de registro se relacione a objetos de modelos diferentes. É essa combinação que liga uma emissão ao Plano de Ensino, ao histórico ou a outra entidade do SUAP.</p><h4>Como o registro é criado</h4><p>A criação normalmente ocorre dentro do decorator <code>@documento</code>, implementado em <code>djtools/utils/__init__.py:1360-1601</code>. Considere está view:</p><pre class="codebox"><code>@documento(
    'Plano de Ensino',
    modelo='edu.planoensino',
    forcar_recriacao=True,
)
@rtr()
def plano_ensino_pdf(request, pk):
    obj = get_object_or_404(PlanoEnsino, pk=pk)
    return locals()</code></pre><p>O fluxo pode ser acompanhado nesta ordem:</p><ol><li>A view renderiza o template.</li><li><code>@documento</code> converte o HTML em PDF.</li><li>O SUAP gera um código verificador e o inclui no documento.</li><li>O arquivo é salvo no armazenamento.</li><li>Um novo <code>RegistroEmissaoDocumento</code> é preenchido e salvo.</li><li>O PDF é devolvido ao navegador.</li></ol><p>A gravação do registro ocorre em <code>djtools/utils/__init__.py:1582-1592</code>:</p><pre class="codebox"><code>registro = RegistroEmissaoDocumento()
registro.tipo = tipo_para_verificacao
registro.data_emissao = data_emissao
registro.codigo_verificador = codigo_verificador
registro.data_validade = data_validade
registro.modelo_pk = pk
registro.tipo_objeto = tipo_objeto
registro.documento = file_obj
registro.save()</code></pre><h4>Como o código de autenticação é usado</h4><p>O código completo é gerado em <code>djtools/utils/__init__.py:1423-1424</code>:</p><pre class="codebox"><code>codigo_verificador = hashlib.sha1(
    f'{request.user.pk}{data_emissao}{settings.SECRET_KEY}'.encode()
).hexdigest()</code></pre><p>O PDF mostra apenas os seis primeiros caracteres no rodapé, por exemplo:</p><pre class="codebox"><code>Tipo: Plano de Ensino
Data da Emissão: 16/10/2026
Código de Autenticação: 606ffc</code></pre><p>O código exibido é uma forma curta de consulta. O registro mantém o valor completo para que a busca possa confirmar a emissão.</p><h4>Como o documento é autenticado</h4><p>A URL pública de autenticação é declarada em <code>comum/urls.py:36</code>:</p><pre class="codebox"><code>path('autenticar_documento/', views.autenticar_documento)</code></pre><p>A view correspondente está em <code>comum/views.py:2036-2097</code>. A pessoa informa o tipo do documento, a data de emissão e o código de autenticação. O formulário procura uma emissão não cancelada:</p><pre class="codebox"><code>RegistroEmissaoDocumento.objects.filter(
    tipo=tipo,
    codigo_verificador__startswith=codigo_verificador,
    cancelado=False,
)</code></pre><div class="fileline">Busca de autenticação: <code>comum/forms.py:1125-1134</code></div><p>A validação confirma que existe uma emissão do tipo informado, com o código correspondente e que não foi cancelada. A data informada também participa da conferência feita pelo fluxo de autenticação.</p><h4>Reutilização ou nova emissão</h4><p>Antes de criar um registro, o decorator procura uma emissão válida para o tipo do documento, o model relacionado e o <code>pk</code> do objeto. Se encontrar uma emissão reaproveitável, pode usar o registro existente:</p><pre class="codebox"><code>else:
    registro = qs_registro[0]</code></pre><p>Um novo registro é criado quando não há emissão valida ou quando uma das condições abaixo força a geração:</p><pre class="codebox"><code>not qs_registro
or validade
or settings.DEBUG
or forcar_recriacao
or forcar_recriacao_local</code></pre><p>Essa decisão está em <code>djtools/utils/__init__.py:1582</code>. Portanto, <code>forcar_recriacao=True</code> faz uma nova emissão mesmo quando existe um documento anterior.</p><h4>Retorno, cancelamento e histórico</h4><p>O método <code>as_pdf_response()</code>, em <code>comum/models.py:3799-3800</code>, lê o arquivo armazenado e o entrega ao navegador como PDF:</p><pre class="codebox"><code>def as_pdf_response(self):
    return HttpResponse(
        self.documento.read(),
        content_type='application/pdf'
    )</code></pre><p>No admin, a ação <code>Cancelar</code> fica em <code>comum/admin.py:1251-1263</code>:</p><pre class="codebox"><code>def cancelar(self, request, queryset):
    queryset.update(cancelado=True)</code></pre><p>O cancelamento não apaga o registro. Ele preserva o histórico da emissão, mas faz com que o documento deixe de ser aceito na autenticação.</p><div class="tip"><strong>Regra para lembrar:</strong> <code>@documento('Plano de Ensino')</code> cria o PDF, gera o código e registra a emissão. Já <code>@documento()</code> pode gerar o PDF sem criar um <code>RegistroEmissaoDocumento</code>, porque não recebeu o tipo necessário para autenticação.</div><h4>Exemplo de um registro</h4><pre class="codebox"><code>tipo: Plano de Ensino
data_emissao: 16/10/2026
codigo_verificador: 606ffc...
tipo_objeto: edu.PlanoEnsino
modelo_pk: 150
documento: comum/registroemissaodocumento/documento/2026/10/...
cancelado: False</code></pre><h4>Como cancelar uma emissão</h4><p>A forma prevista pelo SUAP é cancelar a emissão pelo Django Admin, usando a ação da classe <code>RegistroEmissaoDocumentoAdmin</code>. O cancelamento altera o estado do registro e preserva o PDF e as informações da emissão.</p><h5>Cancelamento pelo Admin</h5><p>Acesse:</p><pre class="codebox"><code>/admin/comum/registroemissaodocumento/</code></pre><p>Depois, siga estas etapas:</p><ol><li>Localize o documento pelo tipo, código verificador ou identificador do objeto.</li><li>Marque o registro desejado.</li><li>Escolha a ação <code>Cancelar</code>.</li><li>Execute a ação e confira a coluna <code>cancelado</code>.</li></ol><p>A implementação está em <code>comum/admin.py:1251-1263</code>:</p><pre class="codebox"><code>class RegistroEmissaoDocumentoAdmin(ModelAdminPlus):
    list_display = (
        'id', 'tipo', 'data_emissao',
        'codigo_verificador', 'tipo_objeto',
        'modelo_pk', 'cancelado'
    )

    actions = ['cancelar']

    def cancelar(self, request, queryset):
        queryset.update(cancelado=True)</code></pre><p>O resultado é uma mudança de estado:</p><pre class="codebox"><code>cancelado = False

# depois da ação Cancelar
cancelado = True</code></pre><p>O registro não é apagado. Essa escolha mantém a rastreabilidade da emissão e permite explicar por que determinado PDF deixou de ser aceito.</p><h5>Cancelamento pelo código</h5><p>Em uma rotina autorizada, o cancelamento pode ser feito programaticamente:</p><pre class="codebox"><code>from comum.models import RegistroEmissaoDocumento

registro = RegistroEmissaoDocumento.objects.get(pk=10)
registro.cancelado = True
registro.save(update_fields=['cancelado'])</code></pre><p>Também é possível localizar a emissão pelo documento relacionado:</p><pre class="codebox"><code>registro = RegistroEmissaoDocumento.objects.filter(
    tipo='Plano de Ensino',
    tipo_objeto__app_label='edu',
    tipo_objeto__model='planoensino',
    modelo_pk=plano_ensino.pk,
    cancelado=False,
).order_by('-data_emissao', '-id').first()

if registro:
    registro.cancelado = True
    registro.save(update_fields=['cancelado'])</code></pre><h5>O que acontece depois</h5><p>A autenticação pública ignora registros cancelados. Em <code>comum/forms.py:1130</code>, a consulta mantém apenas emissões ativas:</p><pre class="codebox"><code>registros = registros.filter(cancelado=False)</code></pre><p>Assim, o documento deixa de ser considerado válido em:</p><pre class="codebox"><code>/comum/autenticar_documento/</code></pre><p>Quando a view de emissão é acessada novamente, o decorator <code>@documento</code> identifica que a última emissão foi cancelada e prepara uma nova geração. A regra está em <code>djtools/utils/__init__.py:1562</code>:</p><pre class="codebox"><code>if ultimo_registro and ultimo_registro.cancelado:
    qs_registro = RegistroEmissaoDocumento.objects.none()
    forcar_recriacao_local = True</code></pre><div class="flow"><div>Documento emitido</div><div>↓</div><div>Registro cancelado</div><div>↓</div><div>Autenticação deixa de validá-lo</div><div>↓</div><div>View acessada novamente</div><div>↓</div><div>Novo PDF e novo código</div></div><h5>Por que não excluir o registro?</h5><p>Excluir o registro não representa um cancelamento e ainda pode apagar o arquivo físico. O método <code>delete()</code>, em <code>comum/models.py:3808</code>, remove o objeto e o arquivo armazenado:</p><pre class="codebox"><code>def delete(self, *args, **kwargs):
    super().delete(*args, **kwargs)
    default_storage.delete(self.documento.name)</code></pre><div class="warn"><strong>Regra de segurança:</strong> use o campo <code>cancelado</code> para invalidar a emissão e preservar sua história. Evite excluir o registro quando a intenção for apenas impedir novas autenticações.</div><section class="document-storage-explanation">
<h5>Onde ficam os dados do documento?</h5>
<p>O <code>RegistroEmissaoDocumento</code> salva no banco os metadados da emissão, incluindo o caminho do PDF. O conteúdo binário do arquivo normalmente fica no storage configurado pelo Django, e não dentro do banco.</p>
<p>O model está em <code>comum/models.py:3783</code>:</p>
<pre class="codebox"><code>class RegistroEmissaoDocumento(models.ModelPlus):
    tipo = models.CharFieldPlus(verbose_name='Tipo de Documento')
    data_emissao = models.DateFieldPlus(verbose_name='Data de Emissão')
    codigo_verificador = models.TextField(verbose_name='Código Verificador')
    documento = models.FileFieldPlus(
        upload_to='documentos',
        verbose_name='Documento',
        filetypes=('pdf',)
    )
    data_validade = models.DateFieldPlus(null=True, blank=True)
    modelo_pk = models.IntegerField('Id da Referência', null=True)
    tipo_objeto = models.ForeignKeyPlus(
        ContentType, on_delete=models.CASCADE, null=True
    )
    objeto = GenericForeignKey('tipo_objeto', 'modelo_pk')
    cancelado = models.BooleanField(default=False)</code></pre>
<p>A tabela padrão é <code>comum_registroemissaodocumento</code>.</p>
<h6>O que fica no banco</h6>
<p>Um registro pode ser representado conceitualmente assim:</p>
<pre class="codebox"><code>id: 1530
tipo: Plano de Ensino
data_emissao: 16/10/2026
codigo_verificador: 606ffc8bba...
documento: comum/registroemissaodocumento/documento/2026/10/606ffc8bba....pdf
data_validade: NULL
modelo_pk: 250
tipo_objeto_id: ID do ContentType edu.planoensino
cancelado: False</code></pre>
<p>O campo <code>documento</code> não guarda os bytes completos do PDF. Ele guarda o nome ou caminho relativo do arquivo dentro do storage.</p>
<h6>Onde o PDF é salvo</h6>
<p>No decorator <code>@documento</code>, o nome do arquivo é montado em <code>djtools/utils/__init__.py:1427</code>:</p>
<pre class="codebox"><code>dir_name = (
    'comum/registroemissaodocumento/'
    f'documento/{data_emissao.year}/'
    f'{str(data_emissao.month).zfill(2)}'
)

file_name = f'{dir_name}/{codigo_verificador}.pdf'</code></pre>
<p>Um caminho possível é:</p>
<pre class="codebox"><code>comum/registroemissaodocumento/documento/2026/10/606ffc8bba1234.pdf</code></pre>
<p>Depois, os bytes são enviados para o storage:</p>
<pre class="codebox"><code>file_obj = default_storage.save(
    file_name,
    io.BytesIO(content)
)</code></pre>
<p>Isso acontece em <code>djtools/utils/__init__.py:1590</code>. O caminho retornado é associado ao registro:</p>
<pre class="codebox"><code>registro.documento = file_obj
registro.save()</code></pre>
<div class="flow"><div>Bytes do PDF</div><div>↓</div><div><code>default_storage.save()</code></div><div>↓</div><div>Arquivo salvo no storage</div><div>↓</div><div>Caminho associado a <code>registro.documento</code></div><div>↓</div><div>Caminho e metadados gravados no banco</div></div>
<h6>Onde o arquivo fica fisicamente</h6>
<p>O local depende da configuração de <code>default_storage</code>. Pode ser o <code>MEDIA_ROOT</code> no servidor, um volume compartilhado, o Amazon S3 ou outro serviço de armazenamento.</p>
<p>Em uma instalação com armazenamento local, a estrutura pode ser:</p>
<pre class="codebox"><code>MEDIA_ROOT/
└── comum/
    └── registroemissaodocumento/
        └── documento/
            └── 2026/
                └── 10/
                    └── 606ffc8bba1234.pdf</code></pre>
<p>No banco fica apenas o caminho relativo:</p>
<pre class="codebox"><code>comum/registroemissaodocumento/documento/2026/10/606ffc8bba1234.pdf</code></pre>
<h6>Como o arquivo é recuperado</h6>
<p>O método <code>as_pdf_response()</code>, em <code>comum/models.py:3799</code>, usa o campo <code>documento</code> para abrir o arquivo:</p>
<pre class="codebox"><code>def as_pdf_response(self):
    return HttpResponse(
        self.documento.read(),
        content_type='application/pdf'
    )</code></pre>
<p>O Django usa o storage configurado para localizar o arquivo pelo caminho armazenado no banco e devolvê-lo ao navegador.</p>
<h6>Cancelamento e exclusão</h6>
<p>Ao cancelar, o registro e o arquivo continuam existindo:</p>
<pre class="codebox"><code>registro.cancelado = True
registro.save()</code></pre>
<p>Ao excluir, o método sobrescrito remove também o arquivo do storage:</p>
<pre class="codebox"><code>def delete(self, *args, **kwargs):
    super().delete(*args, **kwargs)
    default_storage.delete(self.documento.name)</code></pre>
<div class="tablewrap"><table><thead><tr><th>Local</th><th>O que é armazenado</th></tr></thead><tbody><tr><td>Banco de dados</td><td>Metadados, código verificador, vínculo com o objeto e caminho do arquivo.</td></tr><tr><td>Storage</td><td>Conteúdo binário do PDF.</td></tr><tr><td>Cancelamento</td><td>Mantém o registro e o arquivo, mas invalida a emissão.</td></tr><tr><td>Exclusão</td><td>Remove o registro e também o arquivo do storage.</td></tr></tbody></table></div>
</section>`;const forcarRecriacaoExplanation = `<h3>O parâmetro <code>forcar_recriacao</code></h3><p>O parâmetro <code>forcar_recriacao</code> define se o SUAP deve reutilizar uma emissão de documento já existente ou gerar o documento novamente.</p><div class="fileline">Implementação: <code>djtools/utils/__init__.py:1360</code></div><p>Ele faz parte da assinatura do decorator <code>documento</code> e, por padrão, começa desativado:</p><pre class="codebox"><code>def documento(
    tipo_para_verificacao=None,
    landscape=False,
    validade=None,
    enumerar_paginas=True,
    pdf_response=True,
    modelo=None,
    forcar_recriacao=False,
    usar_url_requisicao=False
):</code></pre><p>Durante a execução, o decorator verifica se já existe um registro válido. A condição usada nessa decisão está em <code>djtools/utils/__init__.py:1582</code>:</p><pre class="codebox"><code>if (
    not qs_registro
    or validade
    or settings.DEBUG
    or forcar_recriacao
    or forcar_recriacao_local
):</code></pre><p>Quando <code>forcar_recriacao=True</code>, a condição se torna verdadeira mesmo que exista um documento válido. O SUAP entra então no bloco que cria uma nova emissão:</p><pre class="codebox"><code>registro = RegistroEmissaoDocumento()
registro.tipo = tipo_para_verificacao
registro.data_emissao = data_emissao
registro.codigo_verificador = codigo_verificador
registro.data_validade = data_validade
registro.modelo_pk = pk
registro.tipo_objeto = tipo_objeto

file_obj = default_storage.save(
    file_name,
    io.BytesIO(content)
)

registro.documento = file_obj
registro.save()</code></pre><div class="fileline">Criação do registro e salvamento do arquivo: <code>djtools/utils/__init__.py:1583</code></div><p>Se <code>forcar_recriacao=False</code> e já houver um registro válido, o código pode reutilizar o documento existente:</p><pre class="codebox"><code>else:
    registro = qs_registro[0]</code></pre><div class="tablewrap"><table><thead><tr><th>Configuração</th><th>Comportamento</th></tr></thead><tbody><tr><td><code>forcar_recriacao=False</code></td><td>Reutiliza o registro existente quando ele ainda é válido.</td></tr><tr><td><code>forcar_recriacao=True</code></td><td>Gera o PDF novamente, cria um novo <code>RegistroEmissaoDocumento</code> e salva um novo arquivo.</td></tr></tbody></table></div><div class="tip"><strong>Como interpretar:</strong> o parâmetro não altera o conteúdo do template por si só. Ele controla a decisão entre reaproveitar uma emissão anterior e iniciar uma nova geração do documento.</div><h3>Aplicação no Plano de Ensino</h3><p>Na view do Plano de Ensino, o parâmetro é ativado em <code>edu/views.py:14716</code>:</p><pre class="codebox"><code>forcar_recriacao=True</code></pre><p>Por isso, cada geração do Plano de Ensino cria uma nova emissão, mesmo quando já existe um documento válido para o mesmo <code>pk</code>.${registroEmissaoExplanation}<p>Ao investigar uma view com <code>@documento</code>, confira esse parâmetro junto com <code>validade</code>, <code>modelo</code> e o tipo de documento.</p>`;const studentPdfRoute = `path('dados_gerais_aluno_pdf/<int:pk>/', views.dados_gerais_aluno_pdf),`;
const studentPdfButton = `<li>
    <a href="/edu/dados_gerais_aluno_pdf/{{ obj.pk }}/" class="btn">
        Gerar PDF - Dados Gerais
    </a>
</li>`;
const studentPdfView = `@login_required
@documento('Dados Gerais do Aluno', validade=30, enumerar_paginas=False, modelo='edu.aluno')
@rtr('dados_gerais_aluno_pdf.html')
def dados_gerais_aluno_pdf(request, pk):
    obj = get_object_or_404(Aluno, pk=pk)
    title = f'Dados Gerais - {obj.get_nome()} ({obj.matrícula})'

    # Exemplo didatico do treinamento: a tela exige apenas usuário logado.
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

    return locals()`;
const studentPdfTemplate = `{% extends "relatorio_pdf.html" %}

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
                    <td>{{ obj.matrícula }}</td>
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
                        localizado no rodape de todas as páginas do SUAP. O login atraves de
                        senha não está habilitado para os servicos do Google for Education.
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

{% endblock %}`;
const newScreenRoute =
  "path('treinamento_fluxo_web/', views.treinamento_fluxo_web),";
const newScreenView = `@rtr('treinamento_fluxo_web.html')
@permission_required('edu.view_horarioauladiario')
def treinamento_fluxo_web(request):
    title = 'Treinamento - Fluxo Web EDU'
    links = [
        ('Listagem de Horarios', '/edu/relatorio_horario/'),
        ('Locais e Horarios do Aluno', '/edu/locais_aula_aluno/'),
        ('Locais e Horarios do Professor', '/edu/locais_aula_professor/'),
    ]
    return locals()`;
const newScreenTemplate = `{% extends super_template %}

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
{% endblock %}`;
function newScreenLesson() {
  return `<section class="lesson"><span class="tag">PRÁTICA GUIADA · URL → VIEW → TEMPLATE</span><h2>6. Crie uma tela simples no SUAP</h2><p>Nesta prática, você conectará uma nova rota a uma view protegida e apresentará os dados em um template. Realize as alterações somente em um ambiente de desenvolvimento isolado e confira as linhas no seu checkout antes de editar.</p><h3>Passo 1 · Defina a rota</h3><p>Abra <code>edu/urls.py</code> e localize o bloco de relatórios e atalhos indicado nas linhas 130–141 do checkout de referência. Após reconhecer o padrão das rotas próximas, insira a rota abaixo na posição correspondente à linha 135.</p><div class="fileline">edu/urls.py · referência: linhas 130–141</div><pre class="codebox" style="padding:18px"><code>${escape(newScreenRoute)}</code></pre><p>Essa declaração associa o endereço <code>/edu/treinamento_fluxo_web/</code> à função <code>treinamento_fluxo_web</code> de <code>edu/views.py</code>.</p><h3>Passo 2 · Examine uma view existente</h3><p>Antes de escrever a nova função, localize <code>relatorio_horario</code> em <code>edu/views.py</code>, nas linhas 6330–6338 do checkout de referência. Observe como essa view define <code>title</code>, instancia um formulário, processa os dados recebidos e retorna <code>locals()</code>. Use esse comportamento real como referência para reconhecer as convenções do módulo.</p><h3>Passo 3 · Crie a view de treinamento</h3><p>Adicione a função próxima ao bloco examinado. Preserve os decorators e a permissão indicados no roteiro.</p><div class="fileline">edu/views.py · próximo à view relatorio_horario</div><pre class="codebox" style="padding:18px"><code>${escape(newScreenView)}</code></pre><ul><li><code>@rtr('treinamento_fluxo_web.html')</code> informa explicitamente qual template será renderizado.</li><li><code>@permission_required('edu.view_horarioauladiario')</code> restringe a execução da view a usuários autorizados.</li><li><code>title</code> e <code>links</code> são variáveis que o template poderá utilizar.</li><li><code>return locals()</code> reúne as variáveis locais no dicionário de contexto processado por <code>@rtr</code>.</li></ul><div class="tip"><strong>Segurança:</strong> a autorização está na view. Ocultar um link ou botão no template não substitui a verificação feita no servidor.</div><h3>Passo 4 · Crie o template</h3><p>Crie o arquivo <code>edu/templates/treinamento_fluxo_web.html</code> com o conteúdo abaixo.</p><div class="fileline">edu/templates/treinamento_fluxo_web.html · arquivo novo</div><pre class="codebox" style="padding:18px"><code>${escape(newScreenTemplate)}</code></pre><ul><li><code>{% extends super_template %}</code> reutiliza o layout padrão do SUAP.</li><li><code>{% box %}</code> organiza o conteúdo em blocos visuais do sistema.</li><li><code>{% for label, url in links %}</code> percorre a lista preparada pela view.</li><li><code>{{ links|length }}</code> aplica o filtro <code>length</code> para apresentar a quantidade de links.</li></ul><h3>Passo 5 · Verifique o fluxo completo</h3><ol><li>Acesse <code>/edu/treinamento_fluxo_web/</code> com um usuário autorizado no ambiente de desenvolvimento.</li><li>Confirme que a rota chama a nova view e que a página usa o layout do SUAP.</li><li>Verifique se o título, os três links e o total de links aparecem no template.</li><li>Teste com um usuário sem a permissão indicada e confirme que a proteção ocorre no servidor.</li><li>Se algo falhar, percorra novamente a sequência: URL → view → decorators → contexto → template.</li></ol><p class="small muted">As linhas indicadas devem ser conferidas no checkout utilizado para o estudo, pois podem variar entre versões.</p></section>`;
}
function challengeArea(moduleId) {
  const items = moduleChallenges[moduleId] || [];
  if (!items.length) return "";
  const done = items.filter(
    (c) => state["ticket:" + moduleId + ":" + c.id],
  ).length;
  return `<section class="lesson challenge-area" id="chamados"><span class="tag">LABORATÓRIO DE CHAMADOS</span><h2>Chamados simulados</h2><p>Assuma o atendimento dos pedidos abaixo. Para cada chamado, localize o fluxo responsável pela tela, identifique o arquivo correto, implemente a menor alteração necessária e valide o critério de aceite.</p><div class="warn"><strong>Ambiente de treinamento:</strong> não altere o SUAP de produção nem utilize dados pessoais reais. As URLs indicam a tela de referência; execute e teste as mudanças em seu ambiente de desenvolvimento.</div><div class="ticket-grid">${items.map((c, i) => `<article class="ticket-card ${c.duplicate ? "ticket-duplicate" : ""}"><div class="ticket-heading"><span class="ticket-number">CHAMADO ${String(i + 1).padStart(2, "0")}</span>${c.duplicate ? '<span class="ticket-status">VERIFICAR DUPLICIDADE</span>' : ""}</div><h3>${escape(c.title)}</h3><p class="ticket-area">${escape(c.area)}</p><div class="ticket-block"><strong>Solicitação</strong><p>${escape(c.request)}</p></div><div class="ticket-block"><strong>Tela de referência</strong><code>${escape(c.url)}</code></div><div class="ticket-block"><strong>Critério de aceite</strong><p>${escape(c.acceptance)}</p></div><label class="ticket-check"><input type="checkbox" data-ticket="${moduleId}:${escape(c.id)}" ${state["ticket:" + moduleId + ":" + c.id] ? "checked" : ""}><span>Atendimento concluído e validado</span></label></article>`).join("")}</div><div class="bar"><div style="width:${Math.round((done / items.length) * 100)}%"></div></div><p class="muted small">${done} de ${items.length} chamados concluídos · Progresso salvo neste navegador</p></section>`;
}
function tasks(m) {
  return `<section class="lesson" id="atividades"><span class="tag">AGORA É SUA VEZ</span><h2>Atividade prática orientada</h2><p>Realize as etapas no repositório de desenvolvimento. Marque cada uma quando conseguir explicar o resultado.</p>${m.tasks.map((t, i) => `<label class="task"><input type="checkbox" data-task="${m.id}:${i}" ${state["task:" + m.id + ":" + i] ? "checked" : ""}><span>${t}</span></label>`).join("")}<div class="bar"><div style="width:${Math.round((taskDone(m) / m.tasks.length) * 100)}%"></div></div><p class="muted small">${taskDone(m)} de ${m.tasks.length} concluídas · Salvo neste navegador</p></section>`;
}
function quiz(m) {
  return `<section class="lesson"><span class="tag">VERIFIQUE SUA COMPREENSÃO</span><h2>Questões de revisão</h2><p>Escolha uma alternativa para receber uma explicação imediata.</p>${m.quiz.map((q, i) => `<div class="question"><h3>${i + 1}. ${q[0]}</h3>${q[1].map((opt, j) => `<label><input type="radio" name="q-${m.id}-${i}" data-quiz="${m.id}:${i}:${j}" ${state["quiz:" + m.id + ":" + i] === j ? "checked" : ""}> ${escape(opt)}</label>`).join("")}<div id="feedback-${m.id}-${i}">${state["quiz:" + m.id + ":" + i] === undefined ? "" : feedback(m, i)}</div></div>`).join("")}</section>`;
}
function feedback(m, i) {
  let q = m.quiz[i],
    ok = state["quiz:" + m.id + ":" + i] === q[2];
  return `<div class="feedback ${ok ? "correct" : ""}">${ok ? "✓ Correto." : "Reveja este conceito."} ${escape(q[3])}</div>`;
}
function notesBlock(id) {
  return `<section class="lesson"><span class="tag">REGISTRO DE APRENDIZAGEM</span><h2>Minhas descobertas</h2><p class="muted">Anote dúvidas, arquivos encontrados e conclusões. O texto fica salvo apenas neste navegador.</p><textarea data-note="${id}" placeholder="Ex.: Encontrei a função em edu/views.py e percebi que...">${escape(state["note:" + id] || "")}</textarea><div class="codebar"><span class="muted small">Salvamento automático local</span><button class="btn secondary" data-export="${id}">Exportar anotações (.md) ↓</button></div></section>`;
}
function module1() {
  return `<div class="reading-layout"><div class="reading-main"><div class="toc-content"><div class="lesson"><h2>1. Entenda o caminho de uma requisição</h2><p>Ao acessar uma turma, o Django identifica a rota em <code>urls.py</code> e encaminha a requisição para uma view. A view recupera dados dos models, aplica as regras necessárias e prepara o contexto para o template.</p><img class="diagram" src="fluxo_django_mtv.png" alt="Fluxo de requisição Django"><div class="tip"><strong>Conexão com o EDU:</strong> a função <code>turma(request, pk)</code> consulta o model <code>Turma</code>, recupera matrículas e horários e prepara variáveis para a página.</div><h3>Arquivos para reconhecer</h3><p>Uma tela no SUAP normalmente combina rota, lógica da aplicação, consultas ao banco e apresentação. Reconheça a responsabilidade de cada arquivo para saber onde começar uma investigação.</p><div class="tablewrap"><table><thead><tr><th scope="col">Arquivo ou diretório</th><th scope="col">Responsabilidade no fluxo web</th></tr></thead><tbody>${row("<code>edu/urls.py</code>", "Define as rotas do módulo e determina qual view será executada quando você acessar uma URL. Existe também um <code>urls.py</code> geral da aplicação; cada módulo pode ter seu próprio arquivo de rotas. Pense na URL como o endereço de um guichê: ela encaminha a requisição para o atendimento correto.")}${row("<code>edu/views.py</code>", "Processa a requisição, executa a lógica da aplicação, busca dados e retorna uma resposta. Na prática, a view costuma verificar permissões, buscar objetos no banco e preparar variáveis para o template. A resposta pode ser HTML, PDF, XLS, JSON ou um redirecionamento.")}${row("<code>edu/templates/</code>", "Contém os templates que definem como o conteúdo será apresentado. Eles recebem variáveis preparadas pela view, como <code>obj</code>, <code>title</code>, <code>form</code>, <code>alunos</code>, <code>turnos</code> e <code>diarios_por_sigla</code>, e organizam esses dados em HTML.")}${row("<code>edu/admin.py</code>", "Configura a interface administrativa do Django/SUAP para visualizar, cadastrar, editar e excluir registros, sem criar uma tela administrativa do zero. Observe as configurações de colunas da listagem, filtros, campos de busca, exportação e permissões de exibição.")}${row("<code>edu/forms.py</code>", "Define os formulários usados para entrada de dados. Pode estabelecer campos visíveis, validações, filtros de queryset, organização visual dos campos e processamento dos dados enviados pelo usuário.")}${row("<code>edu/models/</code><br>Exemplo: <code>edu/models/turmas.py</code>", "Define os modelos de dados: entidades gravadas e manipuladas no banco, como <code>Aluno</code>, <code>Turma</code>, <code>Diario</code>, <code>CursoCampus</code> e <code>MatriculaPeriodo</code>. O roteiro apresenta essa responsabilidade como <code>models.py</code>; no EDU, os models estão distribuídos em <code>edu/models/*.py</code>. O arquivo <code>turmas.py</code> contém o model <code>Turma</code> e suas regras.")}</tbody></table></div><div class="tip"><strong>Ao investigar uma manutenção:</strong> siga a rota até a view, identifique os dados e as regras envolvidos e localize o template responsável pela apresentação. Conforme a demanda, consulte também forms, models e admin; raramente um único arquivo explica toda a tela.</div><p class="small muted">As descrições acompanham a organização dos models do EDU apresentada nesta unidade.</p></div>${code("model", "2. Conheça o model Turma", "Observe a declaração dos managers, os campos acadêmicos e os relacionamentos com CursoCampus, Matriz, Turno e CalendarioAcademico.")}${code("matriculados", "3. De onde vêm os alunos?", "Compare os métodos de matrículas diretas e de matrículas relacionadas a diários. Observe filter(), exclude(), select_related() e distinct().")}${code("horarios", "4. Como a turma organiza os horários?", "O método get_horarios() consulta turnos e horários, organiza os dias da semana e considera o semestre informado.")}${code("view", "5. Leia a view turma() comentada", "Use o botão para ocultar comentários e tentar explicar o código com suas próprias palavras. O trecho é uma versão didática comentada da view fornecida.")}${newScreenLesson()}</div></div><button class="toc-float" id="intro-toc-toggle" type="button" aria-expanded="false" aria-controls="intro-right-toc">Tópicos</button><aside class="right-toc" id="intro-right-toc" aria-label="Tópicos da página"><h2>Nesta página</h2><nav></nav></aside></div>`;
}
function snippet(source) {
  return `<pre class="codebox" style="padding:18px"><code>${escape(source)}</code></pre>`;
}
const httprrExplanation = `<section class="lesson"><h2>Como <code>httprr()</code> funciona</h2><p>O helper está definido em <code>djtools/utils/response.py:47-172</code>. Ele combina duas ações frequentes: mostra uma mensagem ao usuário e redireciona a requisição para outra URL.</p><p>Assinatura da função:</p><pre class="codebox" style="padding:18px"><code>httprr(url, message='', tag='success', anchor='', get_params='', close_popup=False)</code></pre><div class="tablewrap"><table><thead><tr><th>Parâmetro</th><th>Função</th></tr></thead><tbody><tr><td><code>url</code></td><td>Define o destino. <code>'.'</code> mantém a página atual e <code>'..'</code> retorna para a página anterior da navegação.</td></tr><tr><td><code>message</code></td><td>Texto exibido ao usuário após o redirecionamento.</td></tr><tr><td><code>tag</code></td><td>Classifica a mensagem, normalmente como <code>success</code>, <code>warning</code> ou <code>error</code>.</td></tr><tr><td><code>anchor</code></td><td>Adiciona uma âncora ao endereço, como <code>#dados_alunos</code>.</td></tr><tr><td><code>get_params</code></td><td>Acrescenta parâmetros à URL, preservando a aba ativa quando necessário.</td></tr><tr><td><code>close_popup</code></td><td>Indica que a resposta deve fechar uma janela popup em vez de redirecionar a página inteira.</td></tr></tbody></table></div><h3>Exemplos de uso</h3><pre class="codebox" style="padding:18px"><code>return httprr('.', 'Alterações salvas com sucesso.')

return httprr('..', 'Você não tem permissão para realizar isso.', 'error')

return httprr('/edu/turma/123/tab=dados_alunos',
              'Aluno removido com sucesso.')</code></pre><p>No primeiro exemplo, o usuário permanece na página atual. No segundo, volta para a página anterior e recebe uma mensagem de erro. No terceiro, a view envia o usuário para uma URL específica, já com a aba de alunos selecionada.</p><h3>O que acontece internamente</h3><ol><li>O SUAP obtém a requisição atual para acessar a sessão de mensagens.</li><li>Quando <code>message</code> é informado, a mensagem é registrada com a categoria definida em <code>tag</code>.</li><li>Os parâmetros de consulta, a aba e a âncora são combinados com a URL de destino.</li><li>A função devolve <code>HttpResponseRedirect</code>, que instrui o navegador a abrir o novo endereço.</li></ol><div class="tip"><strong>Leitura prática:</strong> ao encontrar <code>return httprr(...)</code>, identifique primeiro o destino e depois leia a mensagem e a categoria. Essa linha normalmente encerra a execução da view naquele caminho.</div><h3>Quando há popup</h3><p>Com <code>close_popup=True</code> e uma requisição marcada como popup, o helper devolve um pequeno <code>HttpResponse</code> com JavaScript para fechar a janela. Assim, a tela que abriu o formulário pode ser atualizada ou fechada conforme os parâmetros recebidos.</p><p>Por isso, <code>httprr()</code> não é apenas um redirecionamento simples: ele centraliza mensagens, abas, parâmetros, âncoras e o tratamento de janelas popup em um único retorno.</p><h3>Leia o código em camadas</h3><p>Ao estudar a implementação, separe o comportamento em quatro partes:</p><ol><li><strong>Mensagem:</strong> a função interna <code>set_message()</code> escolhe <code>messages.success()</code>, <code>messages.warning()</code> ou <code>messages.error()</code> de acordo com <code>tag</code>.</li><li><strong>Parâmetros:</strong> <code>get_params</code> é normalizado para começar com <code>?</code>, e o parâmetro <code>tab</code> da requisição atual pode ser preservado.</li><li><strong>Popup:</strong> quando a URL contém <code>_popup</code>, o helper pode devolver um script que chama <code>parent.close_fancybox()</code> ou <code>parent.close_fancybox_noreload()</code>.</li><li><strong>Destino:</strong> depois desses tratamentos, <code>.</code> é convertido no caminho atual, <code>..</code> usa <code>breadcrumbs_previous_url(request)</code> e a função acrescenta a âncora antes de criar o redirecionamento.</li></ol><h3>Exemplos com opções adicionais</h3><pre class="codebox" style="padding:18px"><code>return httprr('.',
              'Registro atualizado.',
              anchor='dados_alunos')

return httprr('/edu/turma/123/',
              'Confira os dados pendentes.',
              'warning',
              get_params='semestre=2')

return httprr('..',
              'Acesso negado.',
              'error',
              close_popup=True)</code></pre><p>Esses exemplos mostram por que é importante ler todos os argumentos, e não apenas a URL. A mesma função pode atualizar uma aba, preservar filtros, exibir uma mensagem de alerta ou encerrar uma janela auxiliar.</p><div class="warn"><strong>Atenção:</strong> o redirecionamento não substitui a autorização. Antes de chamar <code>httprr()</code> após uma operação, a view ainda precisa verificar permissões, validar os dados recebidos e garantir que o usuário pode executar aquela ação.</div></section>`;
const pdfresponseExplanation = `<section class="lesson"><h2>Como <code>PDFResponse</code> funciona</h2><p>A classe está definida em <code>djtools/utils/response.py:543-584</code>. Ela é uma resposta HTTP especializada para entregar conteúdo PDF ao navegador.</p><p>Assinatura do construtor:</p><pre class="codebox" style="padding:18px"><code>PDFResponse(data, nome='relatorio.pdf', anexo=False)</code></pre><div class="tablewrap"><table><thead><tr><th>Parâmetro</th><th>Função</th></tr></thead><tbody><tr><td><code>data</code></td><td>Conteúdo do PDF, normalmente recebido como bytes.</td></tr><tr><td><code>nome</code></td><td>Nome sugerido para o arquivo entregue ao navegador.</td></tr><tr><td><code>anexo</code></td><td>Define se o navegador deve tentar baixar o arquivo. O padrão <code>False</code> permite exibição inline.</td></tr></tbody></table></div><h3>O que a classe configura</h3><p>No construtor, <code>PDFResponse</code> chama <code>HttpResponse</code> com <code>content_type='application/pdf'</code>. Essa informação comunica ao navegador que o conteúdo retornado é um PDF.</p><p>Em seguida, a classe define o cabeçalho <code>Content-Disposition</code>:</p><ul><li>com <code>anexo=False</code>, usa <code>inline</code> e tenta abrir o PDF no próprio navegador;</li><li>com <code>anexo=True</code>, usa <code>attachment</code> e sugere o download do arquivo.</li></ul><h3>Exemplo de exibição no navegador</h3><pre class="codebox" style="padding:18px"><code>pdf_bytes = gerar_pdf()
return PDFResponse(
    pdf_bytes,
    nome='historico.pdf',
)</code></pre><p>Nesse caso, o conteúdo é enviado como PDF e o navegador pode abrir o documento em uma nova aba ou no visualizador incorporado.</p><h3>Exemplo de download</h3><pre class="codebox" style="padding:18px"><code>pdf_bytes = gerar_pdf()
return PDFResponse(
    pdf_bytes,
    nome='historico.pdf',
    anexo=True,
)</code></pre><p>O parâmetro <code>anexo=True</code> altera o cabeçalho para <code>attachment</code>. O navegador passa a tratar a resposta como um arquivo para download.</p><h3>Relação com <code>@rtr()</code> e <code>@documento</code></h3><p><code>PDFResponse</code> já é uma resposta HTTP. Por isso, quando uma view retorna esse objeto, o decorator <code>@rtr()</code> reconhece a instância de <code>HttpResponse</code> e a devolve diretamente, sem procurar ou renderizar outro template.</p><p>O fluxo pode ser representado assim:</p><ol><li>A view prepara ou recebe os bytes do PDF.</li><li>A view cria uma instância de <code>PDFResponse</code>.</li><li>O cabeçalho informa o tipo <code>application/pdf</code> e o modo de entrega.</li><li>O navegador abre ou baixa o documento conforme <code>anexo</code>.</li></ol><div class="tip"><strong>Como diferenciar:</strong> use <code>PDFResponse</code> quando a view já possui o conteúdo final do PDF. Use <code>@documento</code> quando o SUAP deve transformar um template HTML em documento e, quando necessário, registrar autenticação e validade.</div><h3>O que conferir ao investigar uma view</h3><ul><li>De onde vêm os bytes enviados em <code>data</code>?</li><li>Qual nome será apresentado no download?</li><li>O documento deve abrir no navegador ou ser baixado?</li><li>A resposta precisa de código de autenticação e registro no SUAP?</li><li>Existe alguma regra de permissão antes da criação do PDF?</li></ul><p>Essas perguntas ajudam a distinguir uma resposta PDF direta de um fluxo completo baseado em template, conversão e registro de documento.</p></section>`;
function module2() {
  return `<div class="reading-layout"><div class="reading-main"><div class="toc-content decorators-content"><section class="lesson"><span class="tag">LEITURA DE VIEWS</span><h2>1. Como os decorators participam da execução</h2><p>Em <code>edu/views.py</code>, decorators são funções que envolvem uma view para acrescentar comportamento antes ou depois de sua execução. Leia sempre os decorators antes do corpo da função: eles revelam exigências de acesso, renderização, transação e tipo de resposta.</p>${snippet(decoratorOrderExample)}<ol><li>A permissão é verificada.</li><li>A view é executada.</li><li>O retorno da view é renderizado.</li></ol><div class="tip"><strong>Ordem:</strong> o decorator mais próximo da função é aplicado primeiro. Durante a requisição, porém, o decorator escrito acima costuma interceptar a chamada antes dos demais.</div></section><section class="lesson"><h2>2. <code>@rtr()</code>: dados transformados em tela</h2><p><code>@rtr()</code> é um dos decorators mais importantes do SUAP. Ele renderiza o retorno da view em um template.</p><div class="fileline">Importado em edu/views.py · implementação: djtools/utils/response.py:148</div><ul><li>Sem um template informado, tenta descobri-lo pelo nome da view.</li><li>Com um template informado, renderiza o arquivo específico.</li><li>Se a view já retornar <code>HttpResponse</code>, <code>HttpResponseRedirect</code>, PDF, XLS ou outra resposta pronta, devolve essa resposta sem tentar renderizar outro template.</li></ul><h3>Template descoberto pela convenção</h3>${snippet(rtrImplicitExample)}<h3>Template informado explicitamente</h3>${snippet(rtrExplicitExample)}<div class="tip"><strong>Uma forma de memorizar:</strong> <code>@rtr()</code> pega o envelope de dados retornado pela view e o transforma em tela.</div></section>${code("gettemplate", "Como o SUAP escolhe o template", "Quando @rtr() não recebe um nome, get_template_path() deriva o caminho a partir do módulo e do nome da função.")}${code("rtr", "A implementação real de @rtr()", "Observe a chamada à função decorada, o teste de HttpResponse e a renderização do dicionário retornado.")}<section class="lesson"><h2>3. <code>@permission_required(...)</code>: acesso por permissão</h2><p>Esse decorator verifica se o usuário possui a permissão informada. Caso não possua, levanta <code>PermissionDenied</code>.</p><div class="fileline">Exemplo: edu/views.py:1684 · implementação: djtools/utils/__init__.py:1783</div>${snippet(permissionExamples)}<ul><li>Uma string exige aquela permissão específica.</li><li>Uma lista usa lógica <code>or</code> por padrão: basta possuir uma das permissões.</li><li>Com <code>logic_operator='and'</code>, todas as permissões da lista se tornam obrigatórias.</li></ul><p>Utilize esse decorator quando a regra vier de permissões Django ou das permissões declaradas em <code>permissions.yaml</code>.</p></section><section class="lesson"><h2>4. <code>@group_required(...)</code>: acesso por grupo</h2><p><code>@group_required</code> é semelhante ao decorator de permissão, mas verifica diretamente os grupos do usuário.</p><div class="fileline">Exemplo: edu/views.py:4559 · implementação: djtools/utils/__init__.py:1753</div>${snippet(groupRequiredExample)}<ul><li>Use <code>@group_required</code> quando a regra disser diretamente que determinados perfis ou grupos podem acessar.</li><li>Use <code>@permission_required</code> quando o acesso depender de permissões como <code>edu.view_aluno</code>, <code>edu.change_diario</code> ou <code>edu.gerar_relatorio</code>.</li></ul></section><section class="lesson"><h2>5. <code>@login_required</code>: usuário autenticado</h2><p>Este é o decorator padrão do Django para exigir que o usuário esteja autenticado. As formas com e sem parênteses aparecem no código.</p><div class="fileline">Exemplo: edu/views.py:6204</div>${snippet(loginRequiredExample)}<div class="tablewrap"><table><thead><tr><th>Decorator</th><th>O que exige</th></tr></thead><tbody><tr><td><code>@login_required</code></td><td>Usuário autenticado.</td></tr><tr><td><code>@permission_required</code></td><td>Permissão específica.</td></tr><tr><td><code>@group_required</code></td><td>Pertencimento a grupo específico.</td></tr></tbody></table></div></section><section class="lesson"><h2>6. <code>@documento(...)</code>: HTML transformado em PDF</h2><p><code>@documento</code> transforma o HTML produzido pela view em PDF ou documento.</p><div class="fileline">Exemplo: edu/views.py:1684 · implementação: djtools/utils/__init__.py:1360</div>${snippet(documentoPatternExample)}<ol><li><code>@rtr</code> renderiza o HTML.</li><li><code>@documento</code> transforma o HTML em PDF.</li></ol><h3>Parâmetros importantes</h3><div class="tablewrap"><table><thead><tr><th>Parâmetro</th><th>Efeito</th><th>Referência</th></tr></thead><tbody><tr><td><code>landscape=True</code></td><td>Gera o PDF em modo paisagem.</td><td><code>edu/views.py:6245</code></td></tr><tr><td><code>enumerar_paginas=False</code></td><td>Remove a numeração das páginas.</td><td>Implementação do decorator</td></tr><tr><td><code>validade=30</code></td><td>Adiciona uma mensagem de validade do documento.</td><td>Implementação do decorator</td></tr><tr><td><code>modelo='edu.aluno'</code></td><td>Associa o documento ao model indicado.</td><td>Implementação do decorator</td></tr></tbody></table></div>${snippet(documentoParametersExample)}<h3>Primeiro parâmetro e autenticação</h3><p>Quando o primeiro parâmetro é informado, como em <code>@documento('Qualquer Coisa')</code>, ele se torna o <code>tipo_para_verificacao</code>. O SUAP passa a:</p><ul><li>gerar <code>codigo_verificador</code>;</li><li>inserir o Código de Autenticação no PDF;</li><li>registrar o documento em <code>RegistroEmissaoDocumento</code>;</li><li>permitir a validação em <code>/comum/autenticar_documento/</code>.</li></ul><div class="fileline">Geração do código: djtools/utils/__init__.py:1423 · rodapé: linhas 1500–1508 · registro: linhas 1557–1595</div><p>Para um PDF simples, sem autenticador, utilize <code>@documento()</code> sem o primeiro parâmetro textual.</p>
${forcarRecriacaoExplanation}</section><section class="lesson"><h2>7. <code>@transaction.atomic</code>: consistência das gravações</h2><p>Esse decorator do Django executa as operações de banco da view dentro de uma transação. Se ocorrer um erro, o banco pode realizar rollback.</p><div class="fileline">Referências: edu/views.py:3568 e edu/views.py:3596</div><div class="tip"><strong>Uma forma de memorizar:</strong> ou salva tudo, ou não salva nada. Utilize em ações que gravam dados e precisam manter consistência.</div></section><section class="lesson"><h2>8. <code>@csrf_exempt</code>: exceção à proteção CSRF</h2><p><code>@csrf_exempt</code> remove a exigência do token CSRF para aquela view.</p><div class="fileline">Referência: edu/views.py:4274</div><div class="warn"><strong>Atenção:</strong> CSRF protege requisições POST contra envios maliciosos originados em outros sites. Use essa exceção somente quando houver uma justificativa clara e após avaliar o risco.</div></section><section class="lesson"><h2>9. <code>@documentos.emissao_documentos()</code>: participação em um sinal</h2><p>Este decorator é diferente dos anteriores: não corresponde a uma view comum atendida por uma URL. Ele conecta uma função ao sinal de emissão de documentos. Quando o mecanismo dispara esse sinal, a função decorada participa preenchendo dados ou tratando a emissão.</p><div class="fileline">Exemplo: edu/views.py:481 · implementação: djtools/documentos.py:6</div></section><section class="lesson"><span class="tag">RECURSOS RELACIONADOS</span><h2>Respostas e redirecionamentos</h2><p>Os elementos abaixo não são decorators, mas ajudam a compreender os retornos que <code>@rtr()</code> pode receber e devolver diretamente.</p></section>${code("httprr", "Redirecionamentos com httprr()", "O helper registra mensagens de sucesso ou erro e devolve HttpResponseRedirect; também trata cenários de popup.")}${httprrExplanation}${code("pdfresponse", "Resposta pronta com PDFResponse", "PDFResponse usa o content type application/pdf e permite indicar exibição inline ou download por anexo.")}${pdfresponseExplanation}<section class="lesson"><span class="tag">EXEMPLO PRÁTICO</span><h2>Exemplo Prático: Criar PDF com Dados Gerais do Aluno</h2><p>O objetivo é acrescentar à tela do aluno um botão que gere um PDF com seus dados gerais.</p><ol><li>Criar a URL.</li><li>Adicionar o botão à tela do aluno.</li><li>Criar a view PDF.</li><li>Criar o template PDF.</li><li>Testar o resultado.</li></ol><h3>1. Crie a URL</h3><p>Em <code>edu/urls.py</code>, adicione a rota perto das rotas de documentos do aluno.</p>${snippet(studentPdfRoute)}<ul><li><code>pk</code> é o identificador interno do aluno.</li><li>A URL chama a view <code>dados_gerais_aluno_pdf</code>.</li></ul><h3>2. Adicione o botão à tela do aluno</h3><p>Em <code>edu/templates/aluno.html</code>, adicione o item dentro do bloco <code>action-bar</code>.</p>${snippet(studentPdfButton)}<ul><li><code>obj.pk</code> vem da view <code>aluno</code>.</li><li>O botão aponta para a nova URL.</li><li>Neste exercício, o botão permanece simples para facilitar a compreensão do fluxo.</li><li>Em uma demanda real, avalie quais perfis podem visualizar a ação.</li></ul><h3>3. Crie a view PDF</h3><p>Adicione a função em <code>edu/views.py</code>, próxima de <code>atestadofrequencia_pdf</code>, indicada nas linhas 6944–6976.</p>${snippet(studentPdfView)}<ul><li><code>@login_required</code> exige usuário autenticado.</li><li><code>@documento(...)</code> gera o PDF.</li><li>O texto <code>Dados Gerais do Aluno</code> faz o documento receber código de autenticação.</li><li><code>@rtr('dados_gerais_aluno_pdf.html')</code> renderiza o template antes da conversão.</li><li>As variáveis de permissão foram simplificadas exclusivamente para o treinamento.</li></ul><div class="warn"><strong>Não leve as permissões fixas para uma demanda real.</strong> Não mantenha <code>is_admin = True</code>, <code>pode_ver_cpf = True</code> ou equivalentes em produção. Reaproveite as regras contextuais da view <code>aluno</code> e trabalhe apenas com dados fictícios no treinamento.</div><h3>4. Crie o template PDF</h3><p>Crie o arquivo <code>edu/templates/dados_gerais_aluno_pdf.html</code>. O template completo indicado nesta seção está reproduzido abaixo.</p>${snippet(studentPdfTemplate)}<h3>5. Teste o resultado</h3><ol><li>Abra a tela de um aluno fictício no ambiente de desenvolvimento.</li><li>Verifique se o botão <code>Gerar PDF - Dados Gerais</code> aparece.</li><li>Acione o botão e confirme que o PDF abre.</li><li>Confira se o código de autenticação foi incluído.</li><li>Acrescente <code>?html=1</code> à URL para depurar o HTML antes da conversão em PDF.</li><li>Valide novamente as regras de acesso com perfis permitidos e não permitidos.</li></ol></section><section class="lesson"><span class="tag">FECHAMENTO</span><h2>Leia primeiro os decorators</h2><ul><li>Decorators controlam o comportamento da view.</li><li><code>@rtr</code> transforma dados em HTML.</li><li><code>@documento</code> transforma HTML em PDF.</li><li><code>@documento('Tipo')</code> cria um documento autenticável.</li><li>O template PDF deve ser mais simples que a tela normal.</li><li>Uma simplificação de treinamento nunca substitui as regras cuidadosas exigidas em produção.</li></ul><p><strong>Ao investigar uma view no SUAP, comece pelos decorators:</strong> eles revelam permissões, renderização, transações e o tipo de resposta.</p><p class="small muted">As linhas pertencem ao checkout de referência e devem ser conferidas após mudanças no repositório.</p></section></div></div><button class="toc-float" id="decorators-toc-toggle" type="button" aria-expanded="false" aria-controls="decorators-right-toc">Tópicos</button><aside class="right-toc" id="decorators-right-toc" aria-label="Tópicos da página"><h2>Nesta página</h2><nav></nav></aside></div>`;
}
const module3LessonHtml =
  '<section class="panel"><span class="tag">ENCONTRO 3 · EXPLORAÇÃO E DIAGNÓSTICO</span><h2>Da declaração à autorização</h2><p>Compreenda os grupos, siga a sincronização, localize as cinco camadas de checagem e pratique o diagnóstico. Depois, compare os chamados 1144, 1168 e 1157.</p><p>Caminhos e linhas devem ser conferidos no checkout SUAP utilizado no estudo. Os exemplos de alteração devem ser conferidos no checkout de trabalho.</p><div class="warn">As práticas exigem acesso ao repositório SUAP e a um ambiente isolado com dados fictícios. Sem esse acesso, analise os trechos e registre hipóteses e verificações necessárias. Não execute sincronização nem altere permissões em produção. Substitua o marcador de matrícula pela matrícula fictícia do ambiente.</div></section><p>Objetivo: explicar como o SUAP organiza grupos e permissões, como o <code>permissions.yaml</code> alimenta essas permissões e onde elas são verificadas nas telas, menus, views, templates e managers.</p><section class="lesson"><h2>I. Conceito de Grupos no SUAP</h2><p>Compreenda que grupo e uma forma de atribuir um conjunto de permissões a vários usuários.</p><p>Uma forma de compreender: em vez de dar permissão usuário por usuário, o SUAP coloca o usuário em um grupo; o grupo carrega as permissões.</p><h3>1. Observe na tela</h3><p>Na interface administrativa, observe um usuário e seus grupos.</p><p>Observe estas relações:</p><ul><li>Um usuário pode pertencer a vários grupos.</li><li>Um grupo pode ter várias permissões.</li><li>A permissão efetiva do usuário e a soma das permissões dos grupos dele, mais permissões diretas, se existirem.</li></ul><p>Exemplo de grupos no contexto EDU:</p><ul><li><code>Administrador Acadêmico</code>;</li><li><code>Secretário Acadêmico</code>;</li><li><code>Coordenador de Curso</code>;</li><li><code>Organizador de Minicurso</code>;</li><li><code>Diretor Acadêmico</code>.</li></ul><h3>2. Observe no <code>permissions.yaml</code></h3><p>Arquivo: <code>edu/permissions.yaml</code>.</p><p>Observe: o arquivo declara quais permissões cada grupo deve receber.</p><p>Exemplo em <code>edu/permissions.yaml:46-52</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Administrador Acadêmico:\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre><p>Leitura:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Grupo: Administrador Acadêmico\nApp: edu\nModelo: aluno\nPermissao: view_aluno\nPermissao completa: edu.view_aluno</code></pre><p>Ponto importante: o YAML declara permissões para grupos, mas ele não e consultado diretamente por cada tela em tempo real.</p><h3>3. Compreender grupos e permissões</h3><p>Analise a diferenca:</p><ul><li>Grupo: conjunto de usuários com um papel comum.</li><li>Permissão: capacidade de realizar ou visualizar algo no sistema.</li><li>Codename: nome técnico da permissão, como <code>view_aluno</code>.</li><li>Permissão completa: <code>app.codename</code>, como <code>edu.view_aluno</code>.</li></ul><p>Exemplo:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><p>Essa linha pergunta: o usuário logado possui a permissão <code>view_aluno</code> do app <code>edu</code>?</p><h3>4. Compreender o <code>edu/perms.py</code></h3><p>O arquivo <code>edu/perms.py</code> centraliza regras contextuais de autorização do módulo EDU. Ele responde perguntas que uma permissão geral não consegue responder sozinha:</p><ul><li>O usuário pode realizar procedimentos acadêmicos neste curso?</li><li>O usuário pode alterar o e-mail deste aluno?</li><li>O usuário pode realizar procedimentos ENADE?</li><li>O usuário é orientador deste aluno?</li></ul><p>A diferença pode ser resumida assim:</p><div class="tablewrap"><table><thead><tr><th>Arquivo</th><th>Responsabilidade</th></tr></thead><tbody><tr><td><code>permissions.yaml</code></td><td>Declara quais permissões cada grupo recebe.</td></tr><tr><td><code>edu/perms.py</code></td><td>Verifica se o usuário pode agir naquele contexto.</td></tr></tbody></table></div><div class="tip"><strong>Uma forma de lembrar:</strong> o <code>permissions.yaml</code> entrega o crachá; o <code>edu/perms.py</code> verifica onde esse crachá pode ser utilizado.</div><h4>Importação e resultado</h4><p>Nas views, o módulo é importado como:</p><pre class="codebox"><code>from edu import perms</code></pre><p>As funções recebem o usuário e, quando necessário, o objeto que define o contexto. Em geral, retornam <code>True</code> para autorizado e <code>False</code> para não autorizado:</p><pre class="codebox"><code>autorizado = perms.realizar_procedimentos_academicos(\n    request.user,\n    curso_campus\n)</code></pre><h4><code>realizar_procedimentos_academicos</code></h4><div class="fileline">Localização: <code>edu/perms.py:5-27</code></div><p>Essa é uma das funções centrais do arquivo. Ela verifica se o usuário pode realizar procedimentos acadêmicos em determinado curso. A regra pode considerar superusuário, grupos institucionais, setor, campus, coordenação do curso e outras responsabilidades acadêmicas.</p><p>Um trecho simplificado ajuda a acompanhar a lógica:</p><pre class="codebox"><code>def realizar_procedimentos_academicos(user, curso_campus=None):\n    autorizado = False\n\n    if not user.is_anonymous:\n        autorizado = user.is_superuser\n\n        if not autorizado:\n            autorizado = UsuarioGrupo.objects.filter(\n                user=user,\n                group__name__in=[\n                    &#39;Administrador Acadêmico&#39;,\n                    &#39;Diretor Acadêmico Sistêmico&#39;,\n                ]\n            ).exists()\n\n        if not autorizado and curso_campus is not None:\n            autorizado = UsuarioGrupoSetor.objects.filter(\n                usuario_grupo__user=user,\n                usuario_grupo__group__name__in=[\n                    &#39;Secretário Acadêmico&#39;,\n                    &#39;Diretor Acadêmico&#39;,\n                    &#39;Diretor de Ensino&#39;,\n                ],\n                setor=curso_campus.diretoria.setor,\n            ).exists()\n\n    return autorizado</code></pre><p>O detalhe mais importante é a verificação do setor:</p><pre class="codebox"><code>setor=curso_campus.diretoria.setor</code></pre><p>Ela impede que um Secretário Acadêmico de um campus seja automaticamente autorizado a atuar nos cursos de outro campus. A permissão depende do escopo em que o usuário exerce seu papel.</p><p>Em uma view, a regra pode bloquear a operação antes que qualquer alteração seja feita:</p><pre class="codebox"><code>if not perms.realizar_procedimentos_academicos(\n    request.user,\n    aluno.curso_campus,\n):\n    return httprr(\n        &#39;..&#39;,\n        &#39;Você não tem permissão para realizar isso.&#39;,\n        &#39;error&#39;,\n    )</code></pre><h4><code>tem_permissao_realizar_procedimentos</code></h4><div class="fileline">Localização: <code>edu/perms.py:88-89</code></div><p>Essa função auxiliar é útil quando a view já possui um objeto <code>Aluno</code>. Em vez de receber o curso separadamente, ela utiliza <code>aluno.curso_campus</code>:</p><pre class="codebox"><code>def tem_permissao_realizar_procedimentos(user, aluno):\n    return (\n        is_admin(user)\n        or realizar_procedimentos_academicos(\n            user,\n            aluno.curso_campus,\n        )\n    )</code></pre><p>Assim, a view pode centralizar a regra e manter o código de autorização legível:</p><pre class="codebox"><code>aluno = get_object_or_404(Aluno, pk=pk)\n\nif not perms.tem_permissao_realizar_procedimentos(\n    request.user,\n    aluno,\n):\n    return httprr(\n        aluno.get_absolute_url(),\n        &#39;Você não tem permissão.&#39;,\n        &#39;error&#39;,\n    )</code></pre><h4><code>pode_realizar_procedimentos_enade</code></h4><div class="fileline">Localização: <code>edu/perms.py:92-106</code></div><p>Essa função aplica uma regra específica do ENADE. Ela verifica grupos autorizados e também pode considerar se o usuário coordena o curso:</p><pre class="codebox"><code>def pode_realizar_procedimentos_enade(user, curso_campus):\n    if user.is_anonymous:\n        return False\n\n    autorizado = user.is_superuser\n\n    if not autorizado:\n        autorizado = UsuarioGrupo.objects.filter(\n            user=user,\n            group__name__in=[\n                &#39;Administrador Acadêmico&#39;,\n                &#39;Diretor de Avaliação e Regulação do Ensino&#39;,\n                &#39;Operador ENADE&#39;,\n                &#39;Secretário Acadêmico&#39;,\n            ],\n        ).exists()\n\n    return autorizado</code></pre><p>Na tela do aluno, a view combina a autorização com uma condição do próprio objeto:</p><pre class="codebox"><code>pode_realizar_procedimentos_enade = (\n    perms.pode_realizar_procedimentos_enade(\n        request.user,\n        obj.curso_campus,\n    )\n    and not obj.is_concluido()\n)</code></pre><p>O resultado pode ser enviado ao template para controlar a apresentação:</p><pre class="codebox"><code>{% if pode_realizar_procedimentos_enade %}\n    &lt;a href="/edu/lancar_situacao_enade/{{ registro.pk }}/"&gt;\n        Lançar Situação\n    &lt;/a&gt;\n{% endif %}</code></pre><p>A view pergunta se o usuário está autorizado e se o aluno ainda pode participar da operação. O template apenas apresenta a opção quando o resultado permite.</p><h4><code>pode_alterar_email</code></h4><div class="fileline">Localização: <code>edu/perms.py:121-130</code></div><p>Essa função verifica se o usuário pode alterar o e-mail de um aluno. A regra pode envolver Coordenador de TI sistêmico, Coordenador de TI do campus, Coordenador de Registros Acadêmicos e usuários autorizados a realizar procedimentos acadêmicos.</p><pre class="codebox"><code>pode_alterar_email = perms.pode_alterar_email(\n    request,\n    obj,\n)</code></pre><p>O template pode usar a variável para mostrar o link:</p><pre class="codebox"><code>{% if pode_alterar_email %}\n    &lt;a href="/edu/alterar_email_aluno/{{ obj.pk }}/"&gt;\n        Alterar E-mail\n    &lt;/a&gt;\n{% endif %}</code></pre><h4>Funções de relacionamento com o aluno</h4><p>O arquivo também possui funções que verificam a relação do usuário com determinado aluno:</p><ul><li><code>perms.is_proprio_aluno(request, aluno)</code></li><li><code>perms.is_orientador(request, aluno)</code></li><li><code>perms.is_coorientador(request, aluno)</code></li><li><code>perms.is_examinador(request, aluno)</code></li><li><code>perms.is_presidente(request, aluno)</code></li></ul><p>Essas funções permitem combinar a permissão institucional com uma relação direta com o aluno. Por exemplo, uma tela de projeto final pode autorizar gestores acadêmicos, orientadores, coorientadores ou examinadores:</p><pre class="codebox"><code>pode_visualizar = (\n    perms.tem_permissao_realizar_procedimentos(\n        request.user,\n        aluno,\n    )\n    or perms.is_orientador(request, aluno)\n    or perms.is_coorientador(request, aluno)\n    or perms.is_examinador(request, aluno)\n)</code></pre><h4>View, template e proteção da URL</h4><p>A view pode calcular uma variável para orientar a interface:</p><pre class="codebox"><code>@rtr()\ndef aluno_exemplo(request, pk):\n    aluno = get_object_or_404(Aluno, pk=pk)\n\n    pode_editar = perms.realizar_procedimentos_academicos(\n        request.user,\n        aluno.curso_campus,\n    )\n\n    return locals()</code></pre><p>O template pode usar o resultado:</p><pre class="codebox"><code>{% if pode_editar %}\n    &lt;a class="btn primary" href="/edu/editar_aluno/{{ aluno.pk }}/"&gt;\n        Editar\n    &lt;/a&gt;\n{% endif %}</code></pre><p>Essa condição melhora a interface, mas não protege sozinha a operação. A view que atende a URL de edição também deve verificar a autorização:</p><pre class="codebox"><code>@rtr()\ndef editar_aluno(request, pk):\n    aluno = get_object_or_404(Aluno, pk=pk)\n\n    if not perms.realizar_procedimentos_academicos(\n        request.user,\n        aluno.curso_campus,\n    ):\n        return httprr(\n            aluno.get_absolute_url(),\n            &#39;Você não tem permissão para editar este aluno.&#39;,\n            &#39;error&#39;,\n        )\n\n    # Continuação da operação</code></pre><div class="warn"><strong>Ponto essencial:</strong> ocultar o botão no template melhora a experiência da tela; a validação na view é o que impede o acesso direto pela URL.</div><h4>Não confunda os dois usos de <code>perms</code></h4><p>No código Python, <code>perms</code> é o módulo do EDU:</p><pre class="codebox"><code>from edu import perms\nperms.pode_alterar_email(request, aluno)</code></pre><p>No template, <code>perms</code> representa as permissões Django disponíveis para o usuário:</p><pre class="codebox"><code>{% if perms.edu.view_aluno %}\n    ...\n{% endif %}</code></pre><p>Essa condição equivale conceitualmente a:</p><pre class="codebox"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><div class="tablewrap"><table><thead><tr><th>Uso</th><th>Significado</th></tr></thead><tbody><tr><td><code>perms.pode_alterar_email(...)</code></td><td>Chama uma função contextual de <code>edu/perms.py</code>.</td></tr><tr><td><code>perms.edu.view_aluno</code></td><td>Consulta uma permissão Django atribuída ao usuário.</td></tr></tbody></table></div><h4>Por que centralizar essas regras?</h4><p>O <code>edu/perms.py</code> evita repetir decisões complexas em várias views e ajuda a manter o mesmo comportamento em telas diferentes. Ele considera campus, setor, curso e relação com o aluno, reduzindo o risco de um usuário atuar fora do próprio escopo.</p><p>Antes de alterar uma função, pesquise onde ela é usada:</p><pre class="codebox"><code>rg "realizar_procedimentos_academicos" edu/</code></pre><p>Uma mudança nesse arquivo pode afetar diversas telas, models e operações acadêmicas.</p><div class="tip"><strong>Resumo do fluxo:</strong> <code>permissions.yaml</code> define a permissão geral; <code>edu/perms.py</code> aplica a regra ao contexto; a view bloqueia ou libera a operação; e o template mostra ou oculta as opções.</div></section><section class="lesson">\n<h2>II. Como o <code>permissions.yaml</code> vira permissão no banco</h2>\n<p>O arquivo <code>permissions.yaml</code> declara quais permissões cada grupo deve possuir. Ele não é consultado diretamente quando o usuário acessa uma tela. Antes disso, suas informações são convertidas e gravadas nas tabelas de grupos e permissões do Django.</p>\n<div class="permission-flow" aria-label="Fluxo de sincronização das permissões"><div class="permission-step permission-source"><span class="permission-number">1</span><strong><code>permissions.yaml</code></strong><small>fonte de configuração</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-process"><span class="permission-number">2</span><strong><code>sync_permissions</code></strong><small>comando de sincronização</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step"><span class="permission-number">3</span><strong>Leitura e conversão</strong><small>o YAML é interpretado</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">4</span><strong>Grupos e permissões Django</strong><small>associações preparadas</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">5</span><strong>Banco de dados</strong><small>informações persistidas</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-check"><span class="permission-number">6</span><strong><code>user.has_perm(...)</code></strong><small>permissão verificada pela tela</small></div></div>\n<h3>1. Declaração no YAML</h3>\n<p>Exemplo em <code>edu/permissions.yaml:1-8</code>:</p>\n<pre class="codebox"><code>Administrador Acadêmico:\n  description: Usuários deste grupo possuem visão sistêmica.\n  edu:\n    planoensino:\n    - view_planoensino\n    - delete_planoensino</code></pre>\n<p>Outro exemplo, relacionado ao aluno:</p>\n<pre class="codebox"><code>Administrador Acadêmico:\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre>\n<p>A estrutura segue está hierarquia:</p>\n<pre class="codebox"><code>Nome do grupo\n    Aplicativo\n        Modelo\n            Permissões</code></pre>\n<p>No segundo exemplo:</p>\n<ul><li><strong>Grupo:</strong> Administrador Acadêmico</li><li><strong>Aplicativo:</strong> <code>edu</code></li><li><strong>Modelo:</strong> <code>aluno</code></li><li><strong>Codename:</strong> <code>view_aluno</code></li></ul>\n<p>Durante o processamento, a permissão é representada internamente como <code>edu.aluno.view_aluno</code>. Nas verificações normais do Django, ela é consultada como <code>edu.view_aluno</code>.</p>\n<h3>2. Execução do <code>sync_permissions</code></h3>\n<p>O comando responsável pela sincronização está em <code>djtools/management/commands/sync_permissions.py</code>.</p>\n<p>Use:</p>\n<pre class="codebox"><code>python manage.py sync_permissions</code></pre>\n<p>Para processar apenas o EDU:</p>\n<pre class="codebox"><code>python manage.py sync_permissions edu</code></pre>\n<p>Para verificar os arquivos sem alterar o banco:</p>\n<pre class="codebox"><code>python manage.py sync_permissions --check</code></pre>\n<p>O comando percorre as aplicações instaladas e procura o arquivo definido por:</p>\n<pre class="codebox"><code>permissionFileName = f&#39;{app}/permissions.yaml&#39;</code></pre>\n<p>Esse trecho está em <code>djtools/management/commands/sync_permissions.py:134-145</code>. Para o módulo EDU, o arquivo localizado será <code>edu/permissions.yaml</code>.</p>\n<h3>3. Leitura do YAML</h3>\n<p>A leitura é feita pela classe <code>GroupPermission</code>, em <code>djtools/management/permission.py:63-126</code>:</p>\n<pre class="codebox"><code>with open(nome_arquivo_permissao) as arquivo:\n    dados = yaml.safe_load(arquivo)</code></pre>\n<p>Depois, o código percorre cada grupo, aplicativo, modelo e permissão:</p>\n<pre class="codebox"><code>for group_name, group_detail in dados.items():\n    for model_app_name, models in group_detail.items():\n        for model_name, permissions in models.items():\n            for permission_name in permissions:\n                permissao = Permissao(\n                    model_app_name,\n                    model_name,\n                    permission_name\n                )</code></pre>\n<p>A classe <code>Permissao</code> transforma os dados em uma identificação única:</p>\n<pre class="codebox"><code>self.nome = f&#39;{model_app}.{model_name}.{permission_name}&#39;</code></pre>\n<p>Assim, a declaração <code>edu → aluno → view_aluno</code> vira <code>edu.aluno.view_aluno</code>.</p>\n<h3>4. Limpeza das permissões anteriores</h3>\n<p>Antes de reconstruir as associações, o comando remove as permissões atuais dos grupos declarados no YAML. Isso acontece em <code>djtools/management/commands/sync_permissions.py:178-186</code>:</p>\n<pre class="codebox"><code>def limpar_permissoes_dos_grupos(self, group_permission):\n    for grupo in group_permission.obter_grupos():\n        grupo_db = Group.objects.filter(\n            name=grupo.nome\n        ).first()\n\n        if grupo_db:\n            grupo_db.permissions.clear()</code></pre>\n<p>Portanto, a sincronização:</p>\n<ol><li>limpa as permissões atuais do grupo;</li><li>lê novamente o <code>permissions.yaml</code>;</li><li>recria as associações declaradas.</li></ol>\n<div class="tip">Ao remover uma permissão do YAML e executar o comando, a associação também é removida do grupo no banco. A permissão pode continuar existindo na tabela <code>auth_permission</code>; o que deixa de existir é o vínculo com aquele grupo.</div>\n<h3>5. Criação ou localização do grupo</h3>\n<p>Depois da leitura, o comando chama <code>sync_groups_and_permissions(...)</code>, em <code>djtools/utils/__init__.py:1650-1729</code>. Para cada grupo:</p>\n<pre class="codebox"><code>group, created = Group.objects.get_or_create(\n    name=group_name\n)</code></pre>\n<p>O código procura o grupo pelo nome, reutiliza o registro existente ou cria um novo. Os grupos ficam na tabela <code>auth_group</code>.</p>\n<pre class="codebox"><code>id: 25\nname: Administrador Acadêmico</code></pre>\n<h3>6. Localização da permissão Django</h3>\n<p>A identificação interna é separada em três partes:</p>\n<pre class="codebox"><code>ct_app_label, ct_model, p_codename = p.split(&#39;.&#39;)</code></pre>\n<p>Para <code>edu.aluno.view_aluno</code>:</p>\n<ul><li><code>ct_app_label = edu</code></li><li><code>ct_model = aluno</code></li><li><code>p_codename = view_aluno</code></li></ul>\n<p>Depois, o comando procura a permissão:</p>\n<pre class="codebox"><code>Permission.objects.get(\n    content_type__app_label=ct_app_label,\n    content_type__model=ct_model,\n    codename=p_codename\n)</code></pre>\n<p>Esse trecho está em <code>djtools/utils/__init__.py:1686-1693</code>. A permissão fica em <code>auth_permission</code>, relacionada ao model por <code>django_content_type</code>.</p>\n<h3>7. Permissões padrão e personalizadas</h3>\n<p>O Django cria permissões padrão para os models, como:</p>\n<pre class="codebox"><code>add_aluno\nchange_aluno\ndelete_aluno\nview_aluno</code></pre>\n<p>Permissões personalizadas, como <code>view_dados_academicos</code>, <code>emitir_boletim</code> e <code>gerar_relatorio</code>, normalmente são declaradas no <code>Meta.permissions</code> de um model e criadas pelas migrações ou pelo processo de criação de permissões.</p>\n<div class="warn">Se uma permissão personalizada estiver no YAML, mas não existir em <code>auth_permission</code>, o <code>sync_permissions</code> apresentará erro.</div>\n<h3>8. Associação entre grupo e permissão</h3>\n<p>Depois de localizar o grupo e a permissão, o vínculo é criado com:</p>\n<pre class="codebox"><code>group.permissions.add(perm)</code></pre>\n<p>Esse trecho está em <code>djtools/utils/__init__.py:1714-1718</code>. A associação é gravada em <code>auth_group_permissions</code>.</p>\n<pre class="codebox"><code>group_id: 25\npermission_id: 840</code></pre>\n<p>Isso significa que o grupo Administrador Acadêmico possui a permissão <code>edu.view_aluno</code>.</p>\n<h3>9. Descrição do grupo</h3>\n<p>Quando o YAML possui uma descrição, como:</p>\n<pre class="codebox"><code>description: Usuários deste grupo possuem visão sistêmica.</code></pre>\n<p>O texto é armazenado pelo model <code>GroupDetail</code>:</p>\n<pre class="codebox"><code>GroupDetail.objects.update_or_create(\n    group=group,\n    app=app,\n    defaults={\n        &#39;descricao&#39;: descricao,\n        &#39;app_manager&#39;: managers.get(group_name)\n    }\n)</code></pre>\n<p>Esse processamento está em <code>djtools/utils/__init__.py:1709-1713</code>. A descrição documenta e organiza o grupo; ela não concede nenhuma permissão.</p>\n<h3>10. Associação entre usuário e grupo</h3>\n<p>O <code>permissions.yaml</code> associa permissões aos grupos, mas não coloca usuários nesses grupos. Essa relação fica em <code>auth_user_groups</code>, representada no SUAP pelo model <code>UsuarioGrupo</code>, em <code>comum/models.py:3714-3723</code>:</p>\n<pre class="codebox"><code>class UsuarioGrupo(models.ModelPlus):\n    user = models.ForeignKeyPlus(User, on_delete=models.CASCADE)\n    group = models.ForeignKeyPlus(Group, on_delete=models.CASCADE)</code></pre>\n<p>O caminho completo é:</p>\n<div class="permission-flow permission-flow-compact" aria-label="Relação entre usuário, grupo e permissão"><div class="permission-step"><span class="permission-number">1</span><strong><code>auth_user</code></strong><small>usuário</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step"><span class="permission-number">2</span><strong><code>auth_user_groups</code></strong><small>vínculo do usuário com o grupo</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">3</span><strong><code>auth_group</code></strong><small>grupo</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">4</span><strong><code>auth_group_permissions</code></strong><small>vínculo entre grupo e permissão</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">5</span><strong><code>auth_permission</code></strong><small>permissão Django</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">6</span><strong><code>django_content_type</code></strong><small>aplicativo e model relacionados</small></div></div>\n<h3>11. Como a permissão é verificada</h3>\n<p>Depois da sincronização, as telas consultam o banco, não o YAML.</p>\n<p>Na view:</p>\n<pre class="codebox"><code>if request.user.has_perm(&#39;edu.view_aluno&#39;):\n    # Usuário autorizado</code></pre>\n<p>Com decorator:</p>\n<pre class="codebox"><code>@permission_required(&#39;edu.view_aluno&#39;)\ndef aluno(request, pk):\n    ...</code></pre>\n<p>No template:</p>\n<pre class="codebox"><code>{% if perms.edu.view_aluno %}\n    &lt;a href="/edu/aluno/{{ aluno.pk }}/"&gt;\n        Visualizar aluno\n    &lt;/a&gt;\n{% endif %}</code></pre>\n<p>A verificação segue este raciocínio:</p>\n<div class="permission-flow permission-flow-compact" aria-label="Verificação de uma permissão"><div class="permission-step permission-source"><span class="permission-number">1</span><strong>O usuário pertence a algum grupo?</strong><small>o vínculo é consultado</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">2</span><strong>O grupo possui <code>edu.view_aluno</code>?</strong><small>a associação é verificada</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-check"><span class="permission-number">3</span><strong><code>has_perm</code> retorna <code>True</code></strong><small>a tela reconhece o usuário como autorizado</small></div></div>\n<h3>12. Exemplo completo</h3>\n<p>Considere está declaração:</p>\n<pre class="codebox"><code>Organizador de Minicurso:\n  edu:\n    aluno:\n    - view_aluno</code></pre>\n<p>Depois de executar <code>python manage.py sync_permissions edu</code>, o sistema:</p>\n<ol><li>lê o grupo Organizador de Minicurso;</li><li>converte a declaração em <code>edu.aluno.view_aluno</code>;</li><li>cria ou localiza o grupo em <code>auth_group</code>;</li><li>localiza <code>view_aluno</code> em <code>auth_permission</code>;</li><li>localiza o model <code>edu.aluno</code> em <code>django_content_type</code>;</li><li>grava a relação em <code>auth_group_permissions</code>;</li><li>permite que usuários do grupo obtenham <code>True</code> em <code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code>.</li></ol>\n<h3>Resumo</h3>\n<ul><li><code>permissions.yaml</code> declara as permissões.</li><li><code>GroupPermission</code> interpreta o arquivo.</li><li><code>sync_permissions</code> limpa e sincroniza as associações.</li><li><code>auth_group</code> guarda os grupos.</li><li><code>auth_permission</code> guarda as permissões.</li><li><code>auth_group_permissions</code> liga grupos e permissões.</li><li><code>auth_user_groups</code> liga usuários aos grupos.</li><li><code>has_perm</code> consulta o resultado final.</li></ul>\n<div class="tip"><strong>Ponto principal:</strong> o <code>permissions.yaml</code> não é consultado a cada acesso. Ele é uma fonte de configuração usada para sincronizar grupos e permissões com o banco de dados.</div>\n</section><section class="lesson"><h2>III. Como as Telas Checam Permissões</h2><h3>1. Na view com <code>has_perm</code></h3><p>Exemplo em <code>edu/views.py:11270-11275</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>if (\n    not request.user.has_perm(&#39;edu.efetuar_matricula&#39;)\n    and not request.user.has_perm(&#39;edu.gerar_relatorio&#39;)\n    and not request.user.has_perm(&#39;edu.view_aluno&#39;)\n):\n    return httprr(&#39;/&#39;, &#39;Você não tem permissão para acessar essa página&#39;, &#39;error&#39;)</code></pre><p>Explicação:</p><ul><li>A view verifica permissões diretamente.</li><li>Se o usuário não tiver nenhuma das permissões aceitas, ele e bloqueado.</li></ul><p>Outro exemplo importante: tela do aluno em <code>edu/views.py:4703</code>.</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><h3>2. No template com <code>perms.edu.view_aluno</code></h3><p>Exemplo em <code>edu/templates/relatorio.html:159-161</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if perms.edu.view_aluno %}\n    &lt;a target=&quot;_blank&quot; href=&quot;{{ aluno.get_absolute_url }}&quot;&gt;{{ aluno.matricula }}&lt;/a&gt;\n{% else %}\n    {{ aluno.matricula }}\n{% endif %}</code></pre><p>Explicação:</p><ul><li>Se o usuário tem permissão, o template mostra um link.</li><li>Se não tem, mostra apenas a matrícula.</li><li>Isso controla apresentação, não substitui a validação na view de destino.</li></ul><h3>3. No menu</h3><p>Arquivo: <code>edu/menu.yaml:8-11</code>.</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Ensino::Alunos e Professores::Alunos:\n  permissions_required:\n  - edu.view_aluno\n  url: /admin/edu/aluno/correntes</code></pre><p>Explicação:</p><ul><li>A permissão controla se o item de menu aparece.</li><li>Se o usuário não tem <code>edu.view_aluno</code>, o menu não deve ser exibido.</li><li>Mas esconder menu não bloqueia URL direta; a view/admin também precisa validar.</li></ul><h3>4. Em decorators</h3><p>Exemplo em <code>edu/views.py:11837-11839</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>@rtr()\n@permission_required(&#39;edu.view_convocacaoenade&#39;)\ndef convocados_enade(request, pk, curso_campus_pk):</code></pre><p>Explicação:</p><ul><li>O decorator verifica a permissão antes de executar a view.</li><li>Se o usuário não possuir a permissão, a view não roda.</li></ul><h3>5. Em managers/querysets</h3><p>Exemplo em <code>edu/managers.py:671-681</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>if user.groups.filter(permissions__codename=&#39;view_aluno&#39;).count() == 1:\n    ...\n    return qs.filter(polo__id__in=ids)</code></pre><p>Explicação:</p><ul><li>A permissão também pode influenciar o conjunto de objetos visiveis.</li><li>Aqui, a regra afeta quais alunos aparecem para determinado perfil.</li></ul></section><section class="lesson"><h2>IV. Como Analisar Demandas de Permissão</h2><p>Use este checklist:</p><ol><li>A permissão existe no <code>permissions.yaml</code>?</li><li>O grupo correto recebeu essa permissão?</li><li>O <code>sync_permissions</code> foi executado?</li><li>A view, template, menu ou manager realmente consulta essa permissão?</li><li>Existe regra contextual adicional em <code>views.py</code>, <code>perms.py</code> ou managers?</li><li>A mudanca envolve dados pessoais ou acadêmicos sensiveis?</li><li>Esconder botão e suficiente ou a URL também precisa ser bloqueada?</li></ol><p>Uma forma de compreender: permissão no SUAP raramente está em um único lugar; ela pode estar declarada no YAML, aplicada pelo sync, checada na view, filtrada no manager e exibida no template.</p></section><section class="lesson"><h2>V. Exemplos Praticos</h2><h3>1. Remover acesso aos detalhes da tela do aluno</h3><p>Tela de exemplo:</p><ul><li><code>http://localhost:8000/edu/aluno/&lt;matricula_ficticia&gt;/</code></li></ul><p>Perfil sugerido:</p><ul><li><code>Secretário Acadêmico</code>.</li></ul><p>Roteiro:</p><ol><li>Observe o usuário com permissão.</li><li>Abrir a tela do aluno e confirmar que o acesso funciona.</li><li>Localizar o grupo no <code>edu/permissions.yaml</code>.</li><li>Remover temporariamente a permissão relacionada, por exemplo <code>view_aluno</code>.</li><li>Rodar <code>sync_permissions</code>.</li><li>Testar novamente com o mesmo usuário.</li><li>Compreender se o bloqueio veio da view, do menu, do manager ou de outra regra.</li></ol><p>Ponto de cuidado: remover <code>view_aluno</code> pode afetar várias telas, links e consultas, não apenas a tela de detalhe.</p><h3>2. Remover botão <code>Adicionar Aluno</code> do admin de aluno</h3><p>Tela:</p><ul><li><code>http://localhost:8000/admin/edu/aluno/</code></li></ul><p>Perfil sugerido:</p><ul><li><code>Secretário Acadêmico</code>.</li></ul><p>Roteiro:</p><ol><li>Observe o usuário com permissão.</li><li>Abrir o admin de aluno e observar o botão <code>Adicionar Aluno</code>.</li><li>Identificar qual permissão controla adição de aluno, normalmente <code>edu.add_aluno</code>.</li><li>Remover temporariamente essa permissão do grupo no <code>permissions.yaml</code>.</li><li>Rodar <code>sync_permissions</code>.</li><li>Testar novamente.</li><li>Compreender que o admin do Django usa permissões <code>add</code>, <code>change</code>, <code>delete</code> e <code>view</code> para controlar botões e ações.</li></ol><p>Ponto de cuidado: remover <code>add_aluno</code> não deve ser tratado como mudanca visual; e uma alteração de permissão real no admin.</p></section><section class="lesson"><h2>VI. Chamados Atendidos</h2><h3>1. Issue 1144: permissões para <code>Organizador de Minicurso</code></h3><p>Contexto: o grupo <code>Organizador de Minicurso</code> precisava visualizar dados de aluno.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/permissions.yaml:2101-2107</code></li></ul><p>Estado atual:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Organizador de Minicurso:\n  description: Usuários deste grupo gerenciam os minicursos.\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre><p>Compreender:</p><ul><li><code>edu.view_aluno</code>: permite passar por verificacoes gerais de visualizacao de aluno.</li><li><code>edu.view_dados_academicos</code>: participa da regra <code>pode_ver_dados_academicos</code> em <code>edu/views.py:4666-4672</code>.</li><li><code>edu.view_dados_pessoais</code>: aparece em condições de template, por exemplo <code>edu/templates/aluno.html:402-407</code>.</li></ul><p>Observe a condição no template:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if perms.edu.view_dados_pessoais or is_proprio_aluno %}</code></pre><p>Cuidado: conceder acesso a dados pessoais e acadêmicos amplia acesso a informações sensiveis. A análise deve registrar grupo, motivo, telas afetadas e escopo.</p><h3>2. Issue 1168: <code>Secretário Acadêmico</code> na aba ENADE</h3><p>Contexto: a demanda não foi resolvida apenas no <code>permissions.yaml</code>; ela alterou uma regra contextual em <code>edu/perms.py</code>.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/perms.py:92-106</code></li></ul><p>Ponto central:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>autorizado = UsuarioGrupo.objects.filter(\n    user=user,\n    group__name__in=[\n        &#39;Administrador Acadêmico&#39;,\n        &#39;Diretor de Avaliação e Regulação do Ensino&#39;,\n        &#39;Operador ENADE&#39;,\n        &#39;Secretário Acadêmico&#39;,\n    ],\n).exists()</code></pre><p>Na tela do aluno, examine <code>edu/views.py:5099-5101</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>pode_realizar_procedimentos_enade = perms.pode_realizar_procedimentos_enade(request.user, obj.curso_campus) and not obj.is_concluido()</code></pre><p>No template da aba ENADE, examine <code>edu/templates/tabs/aluno_convocacoes_enade.html:17-18</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if pode_realizar_procedimentos_enade or is_coordenador %}\n    &lt;th class=&quot;no-print&quot;&gt;Opções&lt;/th&gt;\n{% endif %}</code></pre><p>Explicação:</p><ul><li><code>permissions.yaml</code> diz quais permissões o grupo tem.</li><li><code>pode_realizar_procedimentos_enade</code> decide se o usuário pode realizar procedimentos ENADE naquele curso.</li><li>O template decide se mostra opções de acao.</li></ul><h3>3. Issue 1157: remover opção <code>Documentos</code> para alunos especiais</h3><p>Contexto: a issue removeu o botão/menu <code>Documentos</code> para alunos especiais.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/templates/aluno.html:188-195</code></li></ul><p>Condicao atual:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if not obj.aluno_especial %}\n    &lt;a class=&quot;btn default&quot; href=&quot;#&quot;&gt;Documentos&lt;/a&gt;\n{% endif %}</code></pre><p>Explicação:</p><ul><li>Este caso tem relação com permissão porque muda a experiência de acesso conforme perfil/situação do aluno.</li><li>Mas isso e apenas controle visual.</li><li>Os links internos continuam no bloco abaixo, em <code>urls_documentos</code>.</li><li>Se a regra precisa impedir acesso direto ao documento, deve existir validação na view do documento, não apenas no template.</li></ul></section><section class="lesson"><h2>VII. Fechamento</h2><p>Revise as responsabilidades:</p><ul><li><code>permissions.yaml</code> declara permissões dos grupos.</li><li><code>sync_permissions</code> grava essas permissões no banco.</li><li><code>has_perm</code>, decorators, templates, menus e managers consultam essas permissões.</li><li><code>perms.py</code> trata regras contextuais.</li><li>Template pode esconder um botão, mas não deve ser a única proteção.</li></ul><p>Ao investigar um chamado: para resolver chamado de permissão com segurança, siga o caminho completo: grupo -&gt; YAML -&gt; sync -&gt; checagem -&gt; regra contextual -&gt; tela.</p></section><section class="lesson"><h2>Validação dos experimentos e limites dos trechos</h2><p>Antes dos exercícios, confira se <code>sync_permissions</code> remove associações ausentes do YAML. O trecho <code>group.permissions.add(perm)</code>, sozinho, demonstra apenas adição. Não presuma que editar o YAML revoga automaticamente o acesso.</p><p>Uma permissão pode vir de outro grupo ou de uma atribuição direta. Registre os grupos e as permissões efetivas do perfil de teste e confira-os após a sincronização. Teste também a URL direta, além do menu ou botão.</p><p>Depois de cada experimento, restaure o YAML e as associações alteradas, sincronize conforme o procedimento confirmado no checkout e teste novamente. Entregue um registro com perfil, estado inicial, alteração, camada responsável, resultado esperado, resultado observado e confirmação da restauração.</p><p>No manager, <code>count() == 1</code> testa uma contagem específica de grupos usando o codename. Não equivale, por si só, a <code>user.has_perm()</code>; examine o filtro por polo e a implementação completa.</p><p>No caso ENADE, acompanhe também <code>not obj.is_concluido()</code> na view e a alternativa <code>is_coordenador</code> no template. A lista de grupos é um recorte: confira todas as restrições por curso e campus.</p><p>No caso Documentos, o link e a condição são o recorte do roteiro. Examine o bloco completo, <code>urls_documentos</code> e as views de destino para verificar o acesso direto.</p><h3>Para consultar depois</h3><p>Use os caminhos e as referências desta unidade como índice de investigação no VSCode. Compare os merges indicados com o checkout de trabalho antes de concluir qual comportamento está vigente.</p></section>';
function module3() {
  return (
    `<div class="reading-layout"><div class="reading-main"><div class="toc-content permissions-content">${module3LessonHtml}` +
    code(
      "view",
      "Complemento: permissões na view turma()",
      "Localize has_group_cached(), pode_realizar_procedimentos e a verificação antes da remoção de alunos.",
    ) +
    code(
      "remover",
      "Complemento: autorização no model",
      "O método verifica pode_remover_da_turma() e pode_ser_excluido_do_diario() antes de alterar vínculos; nem todos os registros recebidos precisam ser removidos.",
    ) +
    `</div></div><button class="toc-float" id="permissions-toc-toggle" type="button" aria-expanded="false" aria-controls="permissions-right-toc">Tópicos</button><aside class="right-toc" id="permissions-right-toc" aria-label="Tópicos da página"><h2>Nesta página</h2><nav></nav></aside></div>`
  );
}
function module6() {
  const content = (window.SUAP_ADMIN_HTML || "<p>O conte\u00fado de Admin ainda n\u00e3o foi carregado.</p>").replace(/^<h1>[\s\S]*?<\/h1>/, "");
  return '<div class="reading-layout"><div class="reading-main"><section class="panel"><span class="tag">ENCONTRO 06 \u00b7 ADMIN DO SUAP</span><h2>Da configura\u00e7\u00e3o do model \u00e0 interface administrativa</h2><p>Estude como o Django Admin e as extens\u00f5es do SUAP transformam models em telas de consulta, cadastro e edi\u00e7\u00e3o.</p><div class="tip"><strong>Como estudar:</strong> acompanhe os arquivos, execute os exemplos em ambiente isolado e registre o efeito de cada configura\u00e7\u00e3o.</div></section><div class="admin-content toc-content">' + content + '</div></div><button class="toc-float" id="admin-toc-toggle" type="button" aria-expanded="false" aria-controls="admin-right-toc">T\u00f3picos</button><aside class="right-toc" id="admin-right-toc" aria-label="T\u00f3picos da p\u00e1gina"><h2>Nesta p\u00e1gina</h2><nav></nav></aside></div>';
}
function enhanceFormDiagrams() {
  document.querySelectorAll(".forms-content .form-code.form-diagram, .models-content .model-code, .admin-content .form-code.form-diagram").forEach((panel) => {
    if (panel.classList.contains("visual-diagram")) return;
    const code = panel.querySelector("code");
    if (!code) return;
    const raw = code.textContent.trim();
    const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.some((line) => /^(\||v|↓|→|->|<-)\s*$/.test(line) || /\s(→|->)\s/.test(line))) return;
    const nodes = lines.filter((line) => !/^(\||v|↓|→|->|<-)\s*$/.test(line));
    const source = panel.innerHTML;
    panel.classList.add("visual-diagram");
    panel.innerHTML = `<div class="visual-flow" role="img" aria-label="Diagrama do fluxo">${nodes.map((node, index) => `<div class="visual-flow-node">${escape(node)}</div>${index < nodes.length - 1 ? '<div class="visual-flow-arrow" aria-hidden="true">↓</div>' : ""}`).join("")}</div><details class="diagram-source"><summary>Ver representação textual</summary>${source}</details>`;
  });
}
function module4() {
  const content = (window.SUAP_FORMS_HTML || "").replace(/^<h1>[\s\S]*?<\/h1>\s*/, "");
  const index = `<nav class="forms-index" aria-label="&Iacute;ndice de Forms e relat&oacute;rios"><h2>&Iacute;ndice do conte&uacute;do</h2><p>Consulte os principais blocos da p&aacute;gina.</p></nav>`;
  const formConceptUpdate = "<h4>3.1. O que &eacute; <code>Form</code></h4>\n<p><code>django.forms.Form</code> representa um formul&aacute;rio independente de um model. Ele declara campos, recebe dados, converte valores e valida a entrada. Como n&atilde;o est&aacute; ligado automaticamente a uma tabela, n&atilde;o possui <code>instance</code> nem <code>save()</code> para gravar um objeto.</p>\n<p>No SUAP, esse tipo de form &eacute; usado quando a tela precisa receber op&ccedil;&otilde;es para uma consulta, um c&aacute;lculo ou um relat&oacute;rio. O exemplo pertence ao m&oacute;dulo EDU, usa turmas e di&aacute;rios j&aacute; existentes e pode ser acessado pela pr&oacute;pria tela de uma turma.</p>\n<h5>3.1.1. Exemplo 01 &mdash; <code>EstatisticaTurmaForm</code></h5>\n<p>O formul&aacute;rio real est&aacute; em <code>edu/forms.py:13693-13703</code>. Ele recebe as etapas e os di&aacute;rios que devem participar da estat&iacute;stica e permite escolher uma forma abreviada de exibir os componentes.</p>\n<pre class=\"codebox\"><code>class EstatisticaTurmaForm(forms.Form):\n    SUBMIT_LABEL = 'Exibir Estat&iacute;stica'\n\n    etapas = forms.MultipleChoiceField(\n        choices=[\n            [1, '1&ordf; Etapa'], [2, '2&ordf; Etapa'], [3, '3&ordf; Etapa'],\n            [4, '4&ordf; Etapa'], [5, 'Final'],\n        ],\n        label='',\n        widget=forms.CheckboxSelectMultiplePlus(),\n    )\n\n    diarios = forms.MultipleModelChoiceField(\n        Diario.objects.none(),\n        label='',\n        widget=forms.CheckboxSelectMultiplePlus(),\n    )\n\n    abreviar = forms.BooleanField(\n        label='Abreviar',\n        help_text='Exibir a sigla do componente ao inv&eacute;s da descri&ccedil;&atilde;o completa do di&aacute;rio.',\n        required=False,\n    )\n\n    fieldsets = (\n        ('Etapas', {'fields': ('etapas',)}),\n        ('Di&aacute;rios', {'fields': ('diarios',)}),\n        ('Exibi&ccedil;&atilde;o', {'fields': ('abreviar',)}),\n    )</code></pre>\n<table><thead><tr><th>Campo</th><th>Tipo</th><th>Valor validado</th></tr></thead><tbody><tr><td><code>etapas</code></td><td><code>MultipleChoiceField</code></td><td>Lista das etapas selecionadas</td></tr><tr><td><code>diarios</code></td><td><code>MultipleModelChoiceField</code></td><td>Objetos <code>Diario</code> escolhidos</td></tr><tr><td><code>abreviar</code></td><td><code>BooleanField</code></td><td><code>True</code> ou <code>False</code></td></tr></tbody></table>\n<p>Esse exemplo permite observar campos de escolha, sele&ccedil;&atilde;o de objetos, widgets do SUAP, <code>fieldsets</code> e o acesso aos valores convertidos em <code>cleaned_data</code>.</p>\n<h6>Como localizar o fluxo completo</h6>\n<p>Use a tela da turma como ponto de partida e siga o caminho at&eacute; o template:</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Fluxo do formul&aacute;rio de estat&iacute;stica da turma\"><div class=\"visual-flow-node\">Tela da turma</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">Bot&atilde;o Estat&iacute;stica da Turma</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>/edu/turma_estatistica/&lt;turma_pk&gt;/</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">View <code>turma_estatistica</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>EstatisticaTurmaForm</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">Template <code>turma_estatistica.html</code></div></div>\n<h6>1. Encontrar a tela e o link</h6>\n<p>Acesse <code>/admin/edu/turma/</code> e escolha uma turma com matriz e di&aacute;rios. Na tela da turma, o bot&atilde;o &eacute; declarado em <code>edu/templates/turma.html:8-15</code>:</p>\n<pre class=\"codebox\"><code>&lt;a class=\"btn default\" href=\"/edu/turma_estatistica/{{ obj.pk }}/\"&gt;\n    Estat&iacute;stica da Turma\n&lt;/a&gt;</code></pre>\n<p><code>{{ obj.pk }}</code> insere a chave prim&aacute;ria da turma. Para uma turma de chave <code>120</code>, o link resulta em <code>/edu/turma_estatistica/120/</code>.</p>\n<h6>2. Encontrar a URL</h6>\n<p>A rota est&aacute; em <code>edu/urls.py:28</code>. Ela reconhece o caminho e encaminha a requisi&ccedil;&atilde;o para a fun&ccedil;&atilde;o indicada:</p>\n<pre class=\"codebox\"><code>path(\n    'turma_estatistica/&lt;str:turma_pk&gt;/',\n    views.turma_estatistica,\n)</code></pre>\n<ul><li><code>turma_estatistica/</code> &eacute; o trecho fixo do endere&ccedil;o;</li><li><code>&lt;str:turma_pk&gt;</code> captura o identificador da turma;</li><li><code>views.turma_estatistica</code> &eacute; a view executada.</li></ul>\n<h6>3. Encontrar e entender a view</h6>\n<p>A view est&aacute; em <code>edu/views.py:13166-13186</code>. Procure primeiro pelo nome <code>turma_estatistica</code> e depois acompanhe como ela prepara o form e os dados da resposta:</p>\n<pre class=\"codebox\"><code>@rtr()\n@login_required()\ndef turma_estatistica(request, turma_pk):\n    turma = get_object_or_404(Turma, pk=turma_pk)\n    title = f'Estat&iacute;stica da Turma {turma.codigo}'\n\n    media = turma.matriz.estrutura.media_aprovacao_sem_prova_final\n    media_final = (\n        50\n        if turma.pertence_ao_plano_retomada\n        else turma.matriz.estrutura.media_aprovacao_avaliacao_final\n    )\n\n    etapa_acima = {1: [], 2: [], 3: [], 4: [], 5: []}\n    etapa_abaixo = {1: [], 2: [], 3: [], 4: [], 5: []}\n\n    form = EstatisticaTurmaForm(data=request.POST or None)\n    form.fields['diarios'].queryset = turma.diario_set.all()\n\n    if form.is_valid():\n        etapas = form.cleaned_data['etapas']\n        diarios = form.cleaned_data['diarios']\n        abreviar = form.cleaned_data['abreviar']\n\n        for diario in diarios:\n            # c&aacute;lculo dos dados usados nos gr&aacute;ficos\n            ...\n\n    return locals()</code></pre>\n<ul><li><code>@login_required()</code> exige autentica&ccedil;&atilde;o;</li><li><code>@rtr()</code> usa o contexto retornado para localizar/renderizar o template;</li><li><code>get_object_or_404</code> busca a turma ou retorna 404;</li><li><code>request.POST or None</code> deixa o form sem dados no GET e preenchido no POST;</li><li>o queryset inicial de <code>diarios</code> &eacute; substitu&iacute;do pelos di&aacute;rios da turma antes de <code>is_valid()</code>;</li><li><code>cleaned_data</code> cont&eacute;m os valores convertidos e validados;</li><li><code>return locals()</code> envia as vari&aacute;veis para o template.</li></ul>\n<h6>4. Entender os campos e as conven&ccedil;&otilde;es</h6>\n<p><code>etapas</code> usa <code>MultipleChoiceField</code>: cada escolha tem valor enviado e texto exibido, e <code>CheckboxSelectMultiplePlus</code> apresenta caixas de sele&ccedil;&atilde;o. <code>diarios</code> come&ccedil;a com <code>Diario.objects.none()</code> para n&atilde;o listar di&aacute;rios de todo o sistema; a view limita o queryset &agrave; turma. <code>abreviar</code> &eacute; opcional: marcado, exibe a sigla; desmarcado, exibe a descri&ccedil;&atilde;o completa.</p>\n<p><code>SUBMIT_LABEL</code> define o texto do bot&atilde;o de envio usado pela camada de renderiza&ccedil;&atilde;o do SUAP. <code>fieldsets</code> apenas agrupa visualmente os campos em Etapas, Di&aacute;rios e Exibi&ccedil;&atilde;o; ele n&atilde;o altera a valida&ccedil;&atilde;o.</p>\n<h6>5. Encontrar e entender o template</h6>\n<p>O template est&aacute; em <code>edu/templates/turma_estatistica.html:11-16</code>. A view fornece o form e, depois do POST v&aacute;lido, as vari&aacute;veis usadas pelos gr&aacute;ficos:</p>\n<pre class=\"codebox\"><code>{% extends super_template %}\n\n{% block extrahead %}\n    &lt;script src=\"/static/djtools/graficos/highcharts.js\"&gt;&lt;/script&gt;\n    &lt;script src=\"/static/djtools/graficos/exporting.js\"&gt;&lt;/script&gt;\n{% endblock %}\n\n{% block content %}\n    {% render_form form %}\n\n    {% if etapas %}\n        &lt;div id=\"containeralunos\"&gt;&lt;/div&gt;\n        &lt;div id=\"containermedia\"&gt;&lt;/div&gt;\n        {# os dados preparados pela view alimentam os gr&aacute;ficos #}\n    {% endif %}\n{% endblock %}</code></pre>\n<ul><li><code>{% extends super_template %}</code> reaproveita o layout do SUAP;</li><li><code>{% block extrahead %}</code> inclui os scripts necess&aacute;rios;</li><li><code>{% render_form form %}</code> renderiza campos e erros;</li><li><code>{% if etapas %}</code> s&oacute; mostra os gr&aacute;ficos quando h&aacute; etapas selecionadas;</li><li>os elementos <code>containeralunos</code> e <code>containermedia</code> s&atilde;o preenchidos pelos scripts de gr&aacute;ficos.</li></ul>\n<h6>6. Testar o fluxo</h6>\n<ol><li>Abra <code>/admin/edu/turma/</code>.</li><li>Escolha uma turma com matriz e di&aacute;rios.</li><li>Clique em <strong>Estat&iacute;stica da Turma</strong>.</li><li>Selecione uma etapa e um ou mais di&aacute;rios.</li><li>Clique em <strong>Exibir Estat&iacute;stica</strong>.</li></ol>\n<p>A tela pode gerar os gr&aacute;ficos com os dados da turma. Mesmo sem notas registradas, &eacute; poss&iacute;vel observar o formul&aacute;rio, a valida&ccedil;&atilde;o e o caminho completo entre URL, view, form e template.</p>";
  const formExample02Update = "<h4>3.2. Exemplo 02 &mdash; <code>ListarDiarioMatriculaAlunoForm</code></h4>\n<p>Este exemplo apresenta a tela <strong>Matricular em Di&aacute;rio</strong>. O form herda diretamente de <code>forms.Form</code> e permite acompanhar um fluxo completo de consulta: a tela do aluno cria o link, a URL entrega o identificador &agrave; view, o form valida filtros enviados por <code>GET</code>, o model executa a busca e o template apresenta os di&aacute;rios encontrados.</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Fluxo da tela Matricular em Di&aacute;rio\"><div class=\"visual-flow-node\">Tela do aluno</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">Link com o <code>pk</code> de <code>MatriculaPeriodo</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">URL do EDU</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">View <code>listar_diarios_matricula_aluno</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>ListarDiarioMatriculaAlunoForm</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">Template e lista de di&aacute;rios</div></div>\n<h5>3.2.1. Arquivos envolvidos</h5>\n<table><thead><tr><th>Responsabilidade</th><th>Arquivo</th></tr></thead><tbody><tr><td>Inclus&atilde;o das URLs do m&oacute;dulo</td><td><code>suap/urls.py:45-52</code></td></tr><tr><td>Link de entrada</td><td><code>edu/templates/aluno.html:146-149</code></td></tr><tr><td>URL da tela</td><td><code>edu/urls.py:216</code></td></tr><tr><td>View</td><td><code>edu/views.py:8683-8715</code></td></tr><tr><td>Form</td><td><code>edu/forms.py:7097-7131</code></td></tr><tr><td>Template</td><td><code>edu/templates/listar_diarios_matricula_aluno.html:1-109</code></td></tr><tr><td>Consulta dos di&aacute;rios</td><td><code>edu/models/alunos.py:2032-2070</code></td></tr></tbody></table>\n<p>Para localizar os arquivos rapidamente, pesquise pelo nome da classe e pelo nome da view:</p>\n<pre class=\"codebox\"><code>rg -n \"ListarDiarioMatriculaAlunoForm\" suap/edu\nrg -n \"listar_diarios_matricula_aluno\" suap/edu</code></pre>\n<h5>3.2.2. Encontrar a tela e o link</h5>\n<p>Acesse <code>/admin/edu/aluno/</code>, abra um aluno com uma matr&iacute;cula em situa&ccedil;&atilde;o <strong>Matriculado</strong> ou <strong>Em Aberto</strong> e entre na p&aacute;gina do aluno. Em <code>edu/templates/aluno.html:146-149</code>, o link &eacute; criado somente quando as permiss&otilde;es e a situa&ccedil;&atilde;o permitem a opera&ccedil;&atilde;o:</p>\n<pre class=\"codebox\"><code>{% if pode_realizar_procedimentos and ultima_matricula_periodo.pode_matricular_diario %}\n    &lt;a href=\"/edu/listar_diarios_matricula_aluno/{{ ultima_matricula_periodo.pk }}/\"&gt;\n        Matricular em Di&aacute;rio\n    &lt;/a&gt;\n{% endif %}</code></pre>\n<p>O valor de <code>ultima_matricula_periodo.pk</code> &eacute; o identificador da matr&iacute;cula no per&iacute;odo. N&atilde;o invente esse n&uacute;mero: ele precisa corresponder a um registro real.</p>\n<h5>3.2.3. Encontrar a URL</h5>\n<p>A rota est&aacute; em <code>edu/urls.py:216</code> e recebe o identificador como <code>matricula_periodo_pk</code>:</p>\n<pre class=\"codebox\"><code>path(\n    'listar_diarios_matricula_aluno/&lt;int:matricula_periodo_pk&gt;/',\n    views.listar_diarios_matricula_aluno,\n)</code></pre>\n<p>Ao acessar <code>/edu/listar_diarios_matricula_aluno/12345/diretoria=7</code>, o Django entrega <code>12345</code> &agrave; view e deixa <code>diretoria=7</code> em <code>request.GET</code>. O prefixo <code>/edu/</code> vem da inclus&atilde;o das URLs do m&oacute;dulo em <code>suap/urls.py:45-52</code>.</p>\n<h5>3.2.4. Encontrar e ler a view</h5>\n<p>A view est&aacute; em <code>edu/views.py:8683-8715</code>:</p>\n<pre class=\"codebox\"><code>@rtr()\n@login_required()\ndef listar_diarios_matricula_aluno(request, matricula_periodo_pk):\n    title = 'Matricular em Di&aacute;rio'\n    matricula_periodo = get_object_or_404(\n        MatriculaPeriodo,\n        pk=matricula_periodo_pk,\n    )\n\n    pode_realizar_procedimentos = perms.realizar_procedimentos_academicos(\n        request.user,\n        matricula_periodo.aluno.curso_campus,\n    )\n    if (\n        not pode_realizar_procedimentos\n        or not matricula_periodo.pode_matricular_diario()\n    ):\n        return httprr('..', 'Voc&ecirc; n&atilde;o tem permiss&atilde;o para realizar isso.', 'error')\n\n    diarios_matriculados = Diario.objects.none()\n    if int(request.GET.get('page', 1)) == 1:\n        diarios_matriculados = Diario.objects.filter(\n            id__in=matricula_periodo.matriculadiario_set.values_list(\n                'diario__id', flat=True,\n            )\n        )\n\n    form = ListarDiarioMatriculaAlunoForm(\n        matricula_periodo,\n        request.GET or None,\n    )\n    if form.is_valid():\n        diarios = form.processar()\n\n    return locals()</code></pre>\n<ul><li><code>@login_required()</code> exige autentica&ccedil;&atilde;o;</li><li>a permiss&atilde;o contextual impede o acesso mesmo que o link seja digitado diretamente;</li><li><code>get_object_or_404</code> busca a matr&iacute;cula ou devolve 404;</li><li><code>request.GET or None</code> deixa o form sem dados no primeiro acesso e preenchido depois do envio;</li><li><code>form.is_valid()</code> executa a valida&ccedil;&atilde;o e, em seguida, <code>processar()</code> realiza a consulta;</li><li><code>return locals()</code> envia <code>form</code>, <code>diarios</code> e demais vari&aacute;veis para o template.</li></ul>\n<p>Como a view usa <code>@rtr()</code> sem indicar um arquivo, o nome da fun&ccedil;&atilde;o permite deduzir o template: <code>listar_diarios_matricula_aluno</code> &rarr; <code>edu/templates/listar_diarios_matricula_aluno.html</code>.</p>\n<h5>3.2.5. Encontrar e entender o form</h5>\n<p>O form est&aacute; em <code>edu/forms.py:7097-7131</code>:</p>\n<pre class=\"codebox\"><code>class ListarDiarioMatriculaAlunoForm(forms.Form):\n    METHOD = 'GET'\n    SUBMIT_LABEL = 'Listar Di&aacute;rios'\n\n    fieldsets = (\n        ('Filtros', {'fields': (\n            ('diretoria', 'componente'),\n            ('outros_componentes',),\n            ('outras_matrizes',),\n            ('ignorar_futuros',),\n        )}),\n    )\n\n    diretoria = forms.ModelChoiceField(\n        Diretoria.objects.none(),\n        required=True,\n    )\n    componente = forms.ModelChoiceFieldPlus(\n        Componente.objects,\n        required=False,\n    )\n    outros_componentes = forms.BooleanField(required=False)\n    outras_matrizes = forms.BooleanField(required=False)\n    ignorar_futuros = forms.BooleanField(required=False)\n\n    def __init__(self, matricula_periodo, *args, **kwargs):\n        super().__init__(*args, **kwargs)\n        self.fields['diretoria'].queryset = Diretoria.objects.filter(\n            setor__uo_id=matricula_periodo.aluno.curso_campus.diretoria.setor.uo.pk\n        )\n        self.matricula_periodo = matricula_periodo\n\n    def clean(self):\n        if self.matricula_periodo.situacao.pk not in [\n            SituacaoMatriculaPeriodo.MATRICULADO,\n            SituacaoMatriculaPeriodo.EM_ABERTO,\n        ]:\n            raise forms.ValidationError(\n                'A situa&ccedil;&atilde;o da matr&iacute;cula n&atilde;o permite a opera&ccedil;&atilde;o.'\n            )\n        return self.cleaned_data\n\n    def processar(self):\n        return self.matricula_periodo.aluno.get_diarios_disponiveis_matricular_por_diretoria(\n            self.cleaned_data.get('diretoria'),\n            self.cleaned_data.get('outros_componentes'),\n            self.cleaned_data.get('outras_matrizes'),\n            self.cleaned_data.get('ignorar_futuros'),\n            self.cleaned_data.get('componente'),\n        )</code></pre>\n<table><thead><tr><th>Elemento</th><th>Fun&ccedil;&atilde;o</th></tr></thead><tbody><tr><td><code>METHOD = 'GET'</code></td><td>Envia os filtros na query string e facilita página&ccedil;&atilde;o e compartilhamento.</td></tr><tr><td><code>diretoria</code></td><td>Seleciona uma diretoria permitida para o curso.</td></tr><tr><td><code>componente</code></td><td>Filtra por componente curricular.</td></tr><tr><td>BooleanFields</td><td>Controlam outras matrizes, outros componentes e per&iacute;odos futuros.</td></tr><tr><td><code>__init__</code></td><td>Recebe o objeto de neg&oacute;cio e restringe o queryset.</td></tr><tr><td><code>clean()</code></td><td>Confere a situa&ccedil;&atilde;o geral da matr&iacute;cula.</td></tr><tr><td><code>processar()</code></td><td>Chama a busca de di&aacute;rios depois da valida&ccedil;&atilde;o.</td></tr></tbody></table>\n<h5>3.2.6. Seguir o fluxo de busca no model</h5>\n<p><code>processar()</code> n&atilde;o concentra toda a regra no form. Ele chama <code>get_diarios_disponiveis_matricular_por_diretoria()</code>, em <code>edu/models/alunos.py:2032-2070</code>. Esse m&eacute;todo filtra os di&aacute;rios pelo per&iacute;odo, diretoria e componente, exclui matr&iacute;culas incompat&iacute;veis e usa <code>distinct()</code> quando necess&aacute;rio.</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Fluxo de busca dos di&aacute;rios\"><div class=\"visual-flow-node\">Filtros validados em <code>cleaned_data</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>processar()</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>Aluno.get_diarios_disponiveis_matricular_por_diretoria()</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">QuerySet de di&aacute;rios dispon&iacute;veis</div></div>\n<p>A separa&ccedil;&atilde;o de responsabilidades fica assim:</p><pre class=\"codebox\"><code>Form    -&gt; recebe filtros, converte valores e valida\nModel   -&gt; aplica regras e monta a consulta\nView    -&gt; coordena a requisi&ccedil;&atilde;o e entrega o contexto\nTemplate -&gt; apresenta os resultados</code></pre>\n<h5>3.2.7. Encontrar e entender o template</h5>\n<p>O template est&aacute; em <code>edu/templates/listar_diarios_matricula_aluno.html:1-109</code>. Ele mostra os dados da matr&iacute;cula, renderiza o form e lista os resultados:</p>\n<pre class=\"codebox\"><code>{% extends super_template %}\n\n{% block content %}\n    {% box 'Informa&ccedil;&otilde;es Gerais' %}\n        &lt;table class=\"info\"&gt;\n            &lt;tr&gt;\n                &lt;td&gt;Aluno&lt;/td&gt;\n                &lt;td&gt;{{ matricula_periodo.aluno|format }}&lt;/td&gt;\n                &lt;td&gt;Ano/Per&iacute;odo&lt;/td&gt;\n                &lt;td&gt;{{ matricula_periodo.ano_letivo.ano }}/{{ matricula_periodo.periodo_letivo }}&lt;/td&gt;\n            &lt;/tr&gt;\n        &lt;/table&gt;\n    {% endbox %}\n\n    {% box 'Di&aacute;rios' %}\n        {% render_form form %}\n        {% if form.is_valid %}\n            {% for diario in diarios %}\n                ...\n            {% endfor %}\n        {% endif %}\n    {% endbox %}\n{% endblock %}</code></pre>\n<p><code>{% extends super_template %}</code> herda o layout do SUAP; <code>{% box %}</code> organiza os blocos; <code>{% render_form form %}</code> cria campos, erros e bot&atilde;o; <code>{% if form.is_valid %}</code> evita exibir resultados antes da valida&ccedil;&atilde;o; e <code>{% for %}</code> percorre os di&aacute;rios retornados.</p>\n<h5>3.2.8. Testar o fluxo</h5>\n<ol><li>Abra <code>/admin/edu/aluno/</code> e escolha um aluno eleg&iacute;vel.</li><li>Na tela do aluno, acesse <strong>A&ccedil;&otilde;es &gt; Matricular em Di&aacute;rio</strong>.</li><li>Confira a URL com o <code>matricula_periodo_pk</code>.</li><li>Selecione uma diretoria e, se desejar, outros filtros.</li><li>Clique em <strong>Listar Di&aacute;rios</strong>.</li><li>Observe a query string, a valida&ccedil;&atilde;o e a lista produzida pelo model.</li></ol>\n<p>O resultado esperado &eacute; a apresenta&ccedil;&atilde;o dos di&aacute;rios atuais e dos di&aacute;rios dispon&iacute;veis. O bot&atilde;o <strong>Matricular</strong> inicia outro fluxo; aqui o foco est&aacute; em acompanhar a busca realizada pelo form.</p>";
  const formPlusUpdate = "<h4>3.3. O que &eacute; <code>FormPlus</code></h4>\n<p><code>FormPlus</code> &eacute; a especializa&ccedil;&atilde;o do DJTools/SUAP para formul&aacute;rios comuns do Django. Ele continua sendo um <code>django.forms.Form</code>, mas acrescenta acesso opcional &agrave; requisi&ccedil;&atilde;o em <code>self.request</code> e suporte &agrave; <code>MetaFormPlus</code>, usada pelo mecanismo de LPS.</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Composi&ccedil;&atilde;o do FormPlus\"><div class=\"visual-flow-node\"><code>django.forms.Form</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>request</code> opcional em <code>self.request</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>MetaFormPlus</code> e customiza&ccedil;&atilde;o por LPS</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>djtools.forms.FormPlus</code></div></div>\n<p>Use <code>FormPlus</code> quando o formul&aacute;rio n&atilde;o representa diretamente um &uacute;nico model, mas precisa conhecer o usu&aacute;rio, a sess&atilde;o ou outras informa&ccedil;&otilde;es da requisi&ccedil;&atilde;o. Ele n&atilde;o recebe <code>save()</code> automaticamente; a persist&ecirc;ncia precisa ser implementada pela classe quando fizer sentido.</p>\n<h5>3.3.1. Onde o <code>FormPlus</code> &eacute; implementado</h5>\n<p>A classe est&aacute; em <code>djtools/forms/__init__.py:54-62</code>:</p>\n<pre class=\"codebox\"><code>class FormPlus(forms.Form, metaclass=MetaFormPlus):\n    def __init__(self, *args, **kwargs):\n        if 'request' in kwargs:\n            self.request = kwargs.pop('request')\n        super().__init__(*args, **kwargs)</code></pre>\n<p><code>pop('request')</code> remove o argumento antes de chamar o Django, pois <code>forms.Form</code> n&atilde;o conhece um par&acirc;metro chamado <code>request</code>. Depois, <code>super()</code> entrega ao Django os argumentos que ele conhece, como <code>data</code>, <code>files</code>, <code>initial</code> e <code>prefix</code>.</p>\n<pre class=\"codebox\"><code>form = MeuFiltroForm(\n    data=request.GET or None,\n    request=request,\n)\n\n# 1. request entra em kwargs\n# 2. FormPlus guarda request em self.request\n# 3. super().__init__() prepara os campos e o estado bound/unbound</code></pre>\n<h5>3.3.2. O que continua vindo do Django</h5>\n<table><thead><tr><th>Recurso</th><th>Origem</th><th>Fun&ccedil;&atilde;o</th></tr></thead><tbody><tr><td><code>fields</code>, <code>data</code> e <code>files</code></td><td>Django</td><td>Campos e dados brutos da requisi&ccedil;&atilde;o</td></tr><tr><td><code>initial</code>, <code>prefix</code> e <code>is_bound</code></td><td>Django</td><td>Valores iniciais, identifica&ccedil;&atilde;o e estado do form</td></tr><tr><td><code>is_valid()</code>, <code>errors</code> e <code>cleaned_data</code></td><td>Django</td><td>Valida&ccedil;&atilde;o e valores convertidos</td></tr><tr><td><code>clean_&lt;campo&gt;()</code> e <code>clean()</code></td><td>Django</td><td>Regras de valida&ccedil;&atilde;o</td></tr><tr><td><code>self.request</code></td><td>DJTools/SUAP</td><td>Requisi&ccedil;&atilde;o, usu&aacute;rio e sess&atilde;o quando fornecida</td></tr><tr><td><code>MetaFormPlus</code></td><td>DJTools/SUAP</td><td>Possibilidade de substitui&ccedil;&atilde;o por LPS</td></tr></tbody></table>\n<p>A valida&ccedil;&atilde;o segue a mesma ordem de um <code>Form</code>:</p><pre class=\"codebox\"><code>valor bruto\n-&gt; to_python()\n-&gt; validate()\n-&gt; run_validators()\n-&gt; clean_&lt;campo&gt;()\n-&gt; clean()\n-&gt; cleaned_data ou errors</code></pre>\n<h5>3.3.3. Como funciona <code>MetaFormPlus</code></h5>\n<p><code>MetaFormPlus</code> est&aacute; em <code>djtools/lps.py:67-86</code> e herda da metaclasse declarativa do Django. Quando <code>settings.LPS</code> est&aacute; configurado, ela procura uma classe com o mesmo nome em:</p>\n<pre class=\"codebox\"><code>&lt;aplicativo&gt;/lps/&lt;LPS_ATIVA&gt;/forms.py</code></pre>\n<p>Se encontrar a classe correspondente, seus atributos podem substituir ou complementar a implementa&ccedil;&atilde;o principal. Sem LPS ativa ou sem classe correspondente, o form original permanece em uso. Essa decis&atilde;o acontece quando a classe &eacute; criada, e n&atilde;o a cada chamada de <code>is_valid()</code>.</p>\n<h5>3.3.4. Exemplo real 1 &mdash; <code>RelatorioHorarioForm</code></h5>\n<p>Este <code>FormPlus</code> filtra uma consulta de hor&aacute;rios. Ele usa <code>GET</code>, restringe salas conforme o usu&aacute;rio e n&atilde;o altera registros:</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Fluxo do RelatorioHorarioForm\"><div class=\"visual-flow-node\">Ensino &gt; Relat&oacute;rios &gt; Listagem de Hor&aacute;rios</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>/edu/relatorio_horario/</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">View <code>relatorio_horario</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>RelatorioHorarioForm</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>relatorio_horario.html</code> e tabela</div></div>\n<h6>Encontrar a tela e a URL</h6><p>O menu est&aacute; em <code>edu/menu.yaml:554-557</code> e a rota em <code>edu/urls.py:134</code>:</p><pre class=\"codebox\"><code>Ensino::Relat&oacute;rios::Listagem de Hor&aacute;rios:\n  permissions_required:\n  - edu.view_horarioauladiario\n  url: /edu/relatorio_horario/\n\npath('relatorio_horario/', views.relatorio_horario)</code></pre><p>Os filtros aparecem depois do ponto de interroga&ccedil;&atilde;o e chegam em <code>request.GET</code>, por exemplo <code>/edu/relatorio_horario/ano_letivo=2026&amp;periodo_letivo=1&amp;turma=120</code>.</p>\n<h6>Encontrar e entender o form</h6><p>O form est&aacute; em <code>edu/forms.py:4456-4503</code>:</p><pre class=\"codebox\"><code>class RelatorioHorarioForm(forms.FormPlus):\n    METHOD = 'GET'\n    SUBMIT_LABEL = 'Pesquisar'\n\n    turma = forms.ModelChoiceFieldPlus(Turma.objects, required=False)\n    professor = forms.ModelChoiceFieldPlus(Professor.objects, required=False)\n    sala = forms.ModelChoiceFieldPlus(Sala.ativas, required=False)\n    ano_letivo = forms.ModelChoiceField(Ano.objects.ultimos())\n    periodo_letivo = forms.ChoiceField(choices=PERIODO_LETIVO_CHOICES)\n\n    def __init__(self, user, *args, **kwargs):\n        super().__init__(*args, **kwargs)\n        self.fields['sala'].queryset = (\n            self.fields['sala'].queryset\n            .filter(ativa=True, predio__uo=get_uo(user))\n        )\n\n    def clean(self):\n        if not (self.cleaned_data['professor']\n                or self.cleaned_data['turma']\n                or self.cleaned_data['sala']):\n            raise forms.ValidationError(\n                'Informe turma, professor ou sala.'\n            )\n        self.qs = HorarioAulaDiario.objects.all()\n        return self.cleaned_data\n\n    def processar(self):\n        return self.qs</code></pre>\n<h6>Acompanhar a view</h6><p>A view est&aacute; em <code>edu/views.py:6334-6373</code>:</p><pre class=\"codebox\"><code>@rtr()\n@permission_required('edu.view_horarioauladiario')\ndef relatorio_horario(request):\n    title = 'Listagem de Hor&aacute;rios'\n    form = RelatorioHorarioForm(\n        data=request.GET or None,\n        user=request.user,\n    )\n    if form.is_valid():\n        horarios = form.processar()\n        tabelas = TabelasHorario(request=request)\n        tabela = TabelaHorario(export_to_pdf=True, request=request)\n        if request.GET.get('pdf'):\n            return tabelas.as_pdf()\n    return locals()</code></pre>\n<p>No GET inicial, o form fica <code>unbound</code>. Depois do envio, fica <code>bound</code>, valida os filtros e prepara a tabela.</p>\n<h6>Relacionar com o template</h6><p>O template est&aacute; em <code>edu/templates/relatorio_horario.html:1-36</code>:</p><pre class=\"codebox\"><code>{% extends super_template %}\n{% block content %}\n    &lt;div id=\"formbox\"&gt;{% render_form form %}&lt;/div&gt;\n    {% if form.is_valid %}\n        {% box \"Resultado da Pesquisa\" %}\n            {% if horarios %}{{ tabela }}{% else %}\n                Nenhum hor&aacute;rio encontrado.\n            {% endif %}\n        {% endbox %}\n    {% endif %}\n{% endblock %}</code></pre>\n<p><code>return locals()</code> fornece <code>form</code>, <code>horarios</code> e <code>tabela</code> ao template.</p>\n<h5>3.3.5. Exemplo real 2 &mdash; <code>AtualizarEmailAlunoForm</code></h5>\n<p>Este exemplo mostra o uso de <code>self.request</code> para definir dinamicamente quais campos podem ser editados. A tela usa o aluno da URL, verifica permiss&otilde;es no backend e coordena dados que pertencem a mais de um model.</p>\n<div class=\"visual-flow\" role=\"img\" aria-label=\"Fluxo do AtualizarEmailAlunoForm\"><div class=\"visual-flow-node\">Tela do aluno &gt; Editar &gt; E-mail</div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>/edu/atualizar_email_secundario/&lt;aluno_pk&gt;/</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">View <code>atualizar_email</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\"><code>AtualizarEmailAlunoForm</code></div><div class=\"visual-flow-arrow\">&darr;</div><div class=\"visual-flow-node\">Template padr&atilde;o do <code>@rtr()</code></div></div>\n<h6>Encontrar o link, URL e view</h6><p>O link fica em <code>edu/templates/aluno.html:39-47</code>. A rota est&aacute; em <code>edu/urls.py:459</code> e a view em <code>edu/views.py:14091-14103</code>:</p><pre class=\"codebox\"><code>{% if pode_alterar_email or eh_auxiliar_secretaria_academica %}\n    &lt;a href=\"/edu/atualizar_email_secundario/{{ obj.pk }}/\"&gt;E-mail&lt;/a&gt;\n{% endif %}\n\npath('atualizar_email_secundario/&lt;int:pk&gt;/', views.atualizar_email)\n\n@rtr()\n@login_required()\ndef atualizar_email(request, pk):\n    aluno = Aluno.locals.filter(pk=pk).first()\n    form = AtualizarEmailAlunoForm(\n        request.POST or None,\n        request=request,\n        aluno=aluno,\n    )\n    if form.is_valid():\n        form.save()\n        return httprr('..', 'E-mail atualizado com sucesso.')\n    return locals()</code></pre>\n<p>Os argumentos t&ecirc;m origens diferentes: <code>request.POST</code> &eacute; tratado pelo Django; <code>request=request</code> &eacute; retirado pelo <code>FormPlus</code>; e <code>aluno=aluno</code> &eacute; tratado pela classe concreta.</p>\n<h6>Encontrar o form e os campos din&acirc;micos</h6><p>O form est&aacute; em <code>edu/forms.py:13128-13152</code>:</p><pre class=\"codebox\"><code>class AtualizarEmailAlunoForm(forms.FormPlus):\n    email_secundario = forms.EmailField(required=False)\n    email_academico = forms.EmailField(required=False)\n    email_google_classroom = forms.EmailField(required=False)\n\n    def __init__(self, *args, **kwargs):\n        self.aluno = kwargs.pop('aluno')\n        super().__init__(*args, **kwargs)\n        self.fields['email_secundario'].initial = (\n            self.aluno.get_vinculo().pessoa.email_secundario\n        )\n        self.fields['email_academico'].initial = self.aluno.email_academico\n        if not self.request.user.has_perm(\n            'rh.pode_editar_email_academico'\n        ):\n            del self.fields['email_academico']</code></pre><p><code>self.fields</code> pertence &agrave; inst&acirc;ncia atual. Remover um campo altera somente o formul&aacute;rio daquela requisi&ccedil;&atilde;o; usu&aacute;rios com permiss&otilde;es diferentes podem receber campos diferentes.</p>\n<h6>Valida&ccedil;&atilde;o e <code>save()</code> pr&oacute;prio</h6><p>As valida&ccedil;&otilde;es est&atilde;o em <code>edu/forms.py:13154-13188</code>. A classe implementa <code>clean_&lt;campo&gt;()</code> para os e-mails e o <code>save()</code> em <code>edu/forms.py:13190-13197</code> grava valores em <code>Aluno</code> e na <code>Pessoa</code> relacionada:</p><pre class=\"codebox\"><code>def save(self):\n    if 'email_academico' in self.cleaned_data:\n        self.aluno.email_academico = self.cleaned_data['email_academico']\n    if 'email_google_classroom' in self.cleaned_data:\n        self.aluno.email_google_classroom = self.cleaned_data['email_google_classroom']\n    self.aluno.save()\n    if 'email_secundario' in self.cleaned_data:\n        Pessoa.objects.filter(\n            pk=self.aluno.get_vinculo().pessoa.id,\n        ).update(email_secundario=self.cleaned_data['email_secundario'])</code></pre><p>O teste <code>'campo' in self.cleaned_data</code> &eacute; necess&aacute;rio porque campos sem permiss&atilde;o foram removidos no <code>__init__()</code>. Esse <code>save()</code> &eacute; um m&eacute;todo da classe, n&atilde;o o <code>save()</code> autom&aacute;tico de um <code>ModelForm</code>.</p>\n<h6>Descobrir o template usado</h6><p>N&atilde;o existe um template espec&iacute;fico para essa view. Como <code>@rtr()</code> n&atilde;o recebeu nome de arquivo, o DJTools usa <code>djtools/templates/default.html:12-18</code>:</p><pre class=\"codebox\"><code>{% if h1 or form.TITLE %}\n    &lt;h2&gt;{{ h1 }}{{ form.TITLE }}&lt;/h2&gt;\n{% endif %}\n{% if form %}\n    {% render_form form %}\n{% endif %}</code></pre>\n<h5>3.3.6. Diferen&ccedil;as entre <code>Form</code> e <code>FormPlus</code></h5><table><thead><tr><th>Aspecto</th><th><code>Form</code></th><th><code>FormPlus</code></th></tr></thead><tbody><tr><td>Origem</td><td>Django</td><td>DJTools/SUAP</td></tr><tr><td>Classe-base</td><td><code>django.forms.Form</code></td><td><code>django.forms.Form</code> com <code>MetaFormPlus</code></td></tr><tr><td>Recebe <code>request=request</code></td><td>N&atilde;o</td><td>Sim, e disponibiliza <code>self.request</code></td></tr><tr><td>Suporte a LPS</td><td>N&atilde;o</td><td>Sim</td></tr><tr><td><code>save()</code> autom&aacute;tico</td><td>N&atilde;o</td><td>N&atilde;o</td></tr><tr><td>Ligado automaticamente a model</td><td>N&atilde;o</td><td>N&atilde;o</td></tr></tbody></table>\n<h5>3.3.7. O que n&atilde;o &eacute; exclusivo de <code>FormPlus</code></h5><p><code>METHOD</code>, <code>SUBMIT_LABEL</code>, <code>fieldsets</code>, <code>processar()</code>, campos <code>Plus</code> e widgets do DJTools s&atilde;o conven&ccedil;&otilde;es ou recursos que tamb&eacute;m podem aparecer em um <code>Form</code> comum. A palavra <code>Plus</code> em um campo n&atilde;o obriga a classe a herdar de <code>FormPlus</code>.</p>\n<h5>3.3.8. Qual classe escolher</h5><ul><li>Use <code>Form</code> quando o formul&aacute;rio for independente de model e n&atilde;o precisar de <code>request</code> ou LPS.</li><li>Use <code>FormPlus</code> quando o form precisar acessar a requisi&ccedil;&atilde;o, o usu&aacute;rio, a sess&atilde;o ou o mecanismo de LPS.</li><li>Use <code>ModelFormPlus</code> quando o objetivo principal for criar ou editar uma inst&acirc;ncia de model com <code>instance</code> e <code>save()</code>.</li></ul><pre class=\"codebox\"><code>FormPlus = Form do Django + request opcional + metaclasse de LPS</code></pre>";
  const updatedContent = content.replace(/<h4>3\.3\.[\s\S]*?(?=<h4>4\.)/, formPlusUpdate).replace(/<h4>3\.1\.[\s\S]*?(?=<h4>3\.2\.)/, formConceptUpdate).replace(/<h4>3\.2\.[\s\S]*?(?=<h4>3\.3\.)/, formExample02Update).replaceAll("3.2. Exemplo real de", "3.2. Exemplo 02 &mdash;").replaceAll("Mostrar o campo", "Confira o campo").replaceAll("Mostrar que o form", "Confira que o form").replaceAll("podem ser demonstrados", "podem ser observados");
  return `<div class="reading-layout"><div class="reading-main"><section class="panel"><span class="tag">ENCONTRO 04 &middot; FORMS E RELAT&Oacute;RIOS</span><h2>Do dado enviado ao relat&oacute;rio final</h2><p>Estude como o SUAP recebe dados, valida formul&aacute;rios, consulta models, edita registros e gera relat&oacute;rios ou PDFs.</p></section>${index}<div class="forms-content">${updatedContent}</div></div><aside class="right-toc" id="forms-right-toc" aria-label="T&oacute;picos da p&aacute;gina"><h2>Nesta p&aacute;gina</h2><nav></nav></aside></div>`;
}
function module5() {
  const content = window.SUAP_MODELS_HTML || "<p>O conteúdo de Models ainda não foi carregado.</p>";
  const structure = `<section class="panel models-structure"><h2>Como os models são organizados no módulo EDU</h2><p>O módulo EDU separa os models por área do domínio. Assim, cada arquivo permanece legível e você consegue começar a investigação pelo tipo de dado envolvido.</p><div class="visual-flow" role="img" aria-label="Organização dos arquivos de models do EDU"><div class="visual-flow-node"><code>edu/models/alunos.py</code><br>Aluno e dados acadêmicos</div><div class="visual-flow-arrow">↓</div><div class="visual-flow-node"><code>edu/models/turmas.py</code><br>Turma e período letivo</div><div class="visual-flow-arrow">↓</div><div class="visual-flow-node"><code>edu/models/__init__.py</code><br>Reexporta as classes do pacote</div></div><p>Os arquivos ficam separados fisicamente, mas podem ser usados de forma uniforme:</p><pre class="codebox"><code>from edu.models import Turma</code></pre><p>Depois de localizar o arquivo, confirme a classe e o identificador usado pelo Django:</p><pre class="codebox"><code>rg -n '^class Turma\\\\b' edu/models\n\nfrom edu.models import Turma\nprint(Turma._meta.app_label)  # edu\nprint(Turma._meta.model_name) # turma</code></pre></section>`;
  const mapGuide = `<section class="panel models-map-guide"><h2>Como usar o mapa durante uma investigação</h2><ol><li><strong>Identifique o vocabulário:</strong> turma, matrícula, diário e plano de ensino indicam o domínio provável.</li><li><strong>Escolha o primeiro arquivo:</strong> comece em <code>turmas.py</code> para regras de turma ou em <code>historico.py</code> para matrículas.</li><li><strong>Confirme a classe:</strong> leia classe-base, campos, <code>Meta</code>, managers e métodos.</li><li><strong>Siga os relacionamentos:</strong> um <code>ForeignKey</code> ou método pode levar a outro arquivo.</li><li><strong>Procure os usos:</strong> siga depois para forms, views, templates, admin e migrations.</li></ol><p>Exemplo: uma demanda sobre horários pode percorrer <code>Turma</code> em <code>turmas.py</code>, os diários em <code>diarios.py</code>, a view e, por fim, o template da tela.</p></section>`;
  const importsGuide = `<section class="panel models-imports-guide"><h2>Dependência circular entre imports</h2><p>Ela ocorre quando <code>turmas.py</code> importa <code>historico.py</code> e, durante o carregamento, <code>historico.py</code> tenta importar <code>turmas.py</code> novamente. Uma das classes ainda está incompleta.</p><div class="visual-flow" role="img" aria-label="Ciclo de imports entre models"><div class="visual-flow-node"><code>turmas.py</code> importa <code>historico.py</code></div><div class="visual-flow-arrow">↓</div><div class="visual-flow-node"><code>historico.py</code> importa <code>turmas.py</code></div><div class="visual-flow-arrow">↓</div><div class="visual-flow-node">Classe parcialmente inicializada</div></div><p>Para evitar o ciclo, use referências em string nos relacionamentos, imports locais dentro dos métodos ou um módulo independente para regras compartilhadas.</p><pre class="codebox"><code>turma = models.ForeignKeyPlus('edu.Turma')\n\n# ou, dentro do método:\nfrom edu.models import Turma</code></pre></section>`;
  const localImportsGuide = `<section class="panel models-local-imports"><h2>Por que usar um import dentro do método?</h2><p>Quando uma classe só é necessária durante uma operação, o import pode ocorrer quando o método é chamado. Isso permite que os models terminem de carregar antes de resolver uma dependência secundária.</p><pre class="codebox"><code>def transferir(self, matriculas_periodo):\n    from edu.models import MatriculaDiario\n    return MatriculaDiario.objects.filter(\n        matricula_periodo__in=matriculas_periodo,\n    )</code></pre><p>O import no topo acontece durante a inicialização do módulo; o import local acontece durante a execução do método. Use-o para evitar ciclos ou dependências de carregamento, mas prefira imports no topo quando não houver esse risco.</p></section>`;
  const searchGuide = `<section class="panel models-search-guide"><h2>Como localizar um model no EDU</h2><p>Comece pela declaração da classe e depois siga seus imports, managers e pontos de uso.</p><pre class="codebox"><code>rg -n '^class Aluno\\\\b' edu/models\n\nedu/models/alunos.py:107:class Aluno(LogModel)\n\nrg -n 'Aluno\\\\.objects|Aluno\\\\.locals|from edu\\\\.models import Aluno' edu</code></pre><p><code>edu/models/alunos.py</code> é o arquivo, <code>107</code> é a linha e <code>LogModel</code> é a classe-base. Depois confira forms, views, templates, migrations e LPS para reconstruir o caminho completo da entidade.</p></section>`;
  const fieldsGuide = `<section class="panel models-fields-guide"><h2>Como as opções de um campo trabalham juntas</h2><p>As opções não fazem todas a mesma coisa: <code>null</code> trata do armazenamento, <code>blank</code> da validação, <code>default</code> do valor inicial, <code>db_index</code> das consultas e <code>verbose_name</code> da apresentação.</p><pre class="codebox"><code>codigo = models.CharFieldPlus(\n    'Código da turma',\n    max_length=20,\n    null=True,\n    blank=True,\n    default='PENDENTE',\n    db_index=True,\n    verbose_name='Código exibido',\n)</code></pre><p>No exemplo, o banco aceita <code>NULL</code>, o formulário aceita vazio, uma nova instância começa com <code>PENDENTE</code>, filtros podem usar o índice e forms/admin exibem “Código exibido”.</p></section>`;
  const reverseGuide = `<section class="panel models-reverse-guide"><h2>Como funciona o relacionamento reverso</h2><p>Uma <code>ForeignKey</code> permite navegar do filho para o pai e também do pai para todos os filhos relacionados. Quando não definimos <code>related_name</code>, o Django cria um manager com o padrão <code>&lt;modelo&gt;_set</code>.</p><pre class="codebox"><code>PlanoEnsino.diario  ───────────────▶  Diario\n       ▲                               │\n       └── diario.planoensino_set ◀────┘\n           todos os planos deste diário\n\ndiario = Diario.objects.get(pk=25)\nplanos = diario.planoensino_set.filter(\n    data_submissao__isnull=False,\n)</code></pre><p>Use o acesso reverso quando a tela já tem o objeto pai e precisa listar seus relacionados, como os planos de um diário ou os avisos de uma turma. O atributo reverso aceita <code>all()</code>, <code>filter()</code>, <code>exists()</code> e <code>count()</code> e transforma a relação em uma consulta no banco.</p><pre class="codebox"><code>class Aviso(models.Model):\n    turma = models.ForeignKey(\n        'Turma',\n        on_delete=models.CASCADE,\n        related_name='avisos',\n    )\n\nturma.avisos.filter(ativo=True)</code></pre><p>Com <code>related_name='avisos'</code>, o nome fica explícito e substitui o padrão <code>aviso_set</code>.</p></section>`;
  const relatedNameGuide = `<section class="panel models-related-name-guide"><h2>Nome padrão e nome personalizado</h2><p><code>related_name</code> escolhe o nome do acesso reverso. Ele não muda a chave estrangeira no banco; muda a forma de navegar entre os objetos no código.</p><pre class="codebox"><code>class Turma(models.Model):\n    ano_letivo = models.ForeignKey('comum.Ano', on_delete=models.CASCADE)\n\nano = Ano.objects.get(ano=2026)\nano.turma_set.all()  # nome padrão\n\nclass Turma(models.Model):\n    ano_letivo = models.ForeignKey(\n        'comum.Ano',\n        related_name='turmas_por_ano',\n        on_delete=models.CASCADE,\n    )\n\nano.turmas_por_ano.all()  # nome escolhido</code></pre><pre class="codebox"><code>Sem related_name                    Com related_name\nAno ──▶ Turma                        Ano ──▶ Turma\n  └── turma_set                         └── turmas_por_ano\n\nano.turma_set.all()                 ano.turmas_por_ano.all()</code></pre><p>Use um nome explícito quando ele melhorar a leitura ou quando existirem várias relações com o mesmo model. Antes de renomear um acesso já usado, procure suas ocorrências em views, forms, templates e consultas.</p></section>`;
  const relationshipChangesGuide = `<section class="panel models-relationship-changes-guide"><h2>Cuidados ao alterar relacionamentos</h2><p>Uma mudança no relacionamento precisa considerar os registros que já existem. Tornar obrigatório um campo que antes aceitava vazio, por exemplo, exige preencher os valores antigos antes de remover <code>null=True</code>.</p><pre class="codebox"><code>1. adicionar o novo campo como opcional\n2. tratar os dados antigos\n3. conferir registros sem relação\n4. tornar o campo obrigatório\n5. atualizar forms, views, admin e relatórios</code></pre><p>Quando a transformação puder ser automatizada, uma migration de dados atualiza as linhas históricas:</p><pre class="codebox"><code>def preencher_diario(apps, schema_editor):\n    PlanoEnsino = apps.get_model('edu', 'PlanoEnsino')\n    Diario = apps.get_model('edu', 'Diario')\n    diario_padrao = Diario.objects.order_by('pk').first()\n\n    if diario_padrao:\n        PlanoEnsino.objects.filter(diario__isnull=True).update(\n            diario=diario_padrao,\n        )\n\n# A migration chama a função com migrations.RunPython.</code></pre><p><code>apps.get_model()</code> usa a versão histórica do model, adequada ao momento da migration. Também avalie mudanças em <code>on_delete</code>: trocar <code>SET_NULL</code> por <code>CASCADE</code> pode apagar registros dependentes.</p><pre class="codebox"><code>python manage.py makemigrations edu\npython manage.py sqlmigrate edu 0009\npython manage.py migrate</code></pre><p>Revise o SQL, faça backup quando necessário e valide contagens, valores nulos e telas que usam a relação.</p></section>`;
  const abstractGuide = `<section class="panel models-abstract-guide"><h2>Model abstrato e model concreto</h2><p>Um model com <code>abstract = True</code> é uma classe-base reutilizável: fornece campos e métodos, mas não cria registros próprios. O model concreto é o que gera a tabela, o manager e os objetos consultáveis.</p><pre class="codebox"><code>class Identificado(models.Model):\n    codigo = models.CharField(max_length=20)\n\n    class Meta:\n        abstract = True\n\nclass Aluno(Identificado):\n    nome = models.CharField(max_length=120)\n\nclass Documento(models.Model):\n    titulo = models.CharField(max_length=120)</code></pre><pre class="codebox"><code>Identificado (abstrato)  ── não cria tabela\n       │\n       └── Aluno          ── cria edu_aluno\n           codigo e nome ficam na mesma tabela\n\nDocumento (concreto)     ── cria edu_documento</code></pre><p>Por isso não existe <code>Identificado.objects.all()</code>. Já <code>Aluno.objects.all()</code> e <code>Documento.objects.all()</code> consultam suas próprias tabelas. No SUAP, <code>LogModel</code> e <code>ModelPlus</code> são bases abstratas; <code>Turma</code> e <code>PlanoEnsino</code> são models concretos.</p><p>Use uma base abstrata quando vários models compartilham estrutura ou comportamento. Se a classe precisa ter registros próprios ou ser referenciada por uma <code>ForeignKey</code>, ela deve ser concreta.</p></section>`;
  const logModelGuide = `<section class="panel models-logmodel-guide"><h2>Auditoria: alteração, registro e diferença</h2><p>Quando uma matrícula muda de “Ativa” para “Concluída”, a auditoria precisa preservar quem alterou, quando ocorreu e qual valor foi substituído.</p><pre class="codebox"><code>Antes: situação = "Ativa"\nAlteração: situação = "Concluída"\n          │\n          ▼\nLog: EDICAO, objeto MatriculaPeriodo, usuário e data\n          │\n          ▼\nRegistroDiferenca:\n  campo: situacao\n  valor anterior: Ativa\n  valor atual: Concluída</code></pre><pre class="codebox"><code>matricula.situacao = 'Concluída'\nmatricula.save()\n\n# O Log identifica a operação.\n# RegistroDiferenca guarda cada campo alterado.</code></pre><p>No EDU, esse comportamento é herdado por models que usam <code>LogModel</code>. O model de negócio salva a alteração normalmente; os sinais de auditoria comparam o valor anterior e o atual e criam os registros correspondentes.</p><p>A auditoria técnica registra alterações feitas por <code>save()</code>. Operações diretas como <code>QuerySet.update()</code> não executam os sinais e, portanto, não produzem a mesma diferença automaticamente.</p></section>`;
  const managersGuide = `<section class="panel models-managers-guide"><h2><code>objects</code>, <code>locals</code> e managers especializados</h2><p>O manager é a porta de entrada das consultas de um model. <code>objects</code> costuma iniciar pelo conjunto geral; <code>locals</code> pode acrescentar filtros baseados no usuário, na unidade ou em outra regra do SUAP.</p><pre class="codebox"><code>turmas = Turma.objects.filter(ano_letivo=ano)\n\nturmas_locais = Turma.locals.filter(ano_letivo=ano)</code></pre><pre class="codebox"><code>Turma.objects                    Turma.locals\n       │                                 │\n       ▼                                 ▼\nregistros do model              registros do model\n                                 + filtro contextual\n                                 (usuário, diretoria, unidade...)</code></pre><p>O resultado pode ser diferente. O nome <code>locals</code> não cria um comportamento automático: é a implementação do manager que define o filtro. Por isso, abra a classe do manager antes de concluir qual escopo será aplicado.</p><pre class="codebox"><code>alunos = Aluno.locals.filter(\n    situacao__ativo=True,\n).order_by('pessoa_fisica__nome')</code></pre><p>Use <code>objects</code> quando a rotina precisar do conjunto geral e o manager contextual quando a tela deve respeitar o escopo do usuário. Managers não substituem permissões; autorização e regras de acesso continuam necessárias.</p></section>`;
  const threadLocalGuide = `<section class="panel models-threadlocal-guide"><h2>Thread-local e usuário atual</h2><p><code>tl.get_user()</code> recupera o usuário associado ao contexto de execução. Em uma requisição web autenticada esse contexto costuma ser preenchido pelo middleware; em comandos e no shell ele geralmente não existe.</p><pre class="codebox"><code>Requisição web ── middleware ──► tl.user ──► tl.get_user() ──► manager contextual\nComando/shell  ── sem middleware ──────────► None           ──► regra alternativa</code></pre><pre class="codebox"><code>usuario = tl.get_user()\nalunos = Aluno.locals.all()\n\nif usuario:\n    print(f'Consulta executada por {usuario.username}')\nelse:\n    print('Consulta sem usuário associado ao contexto')</code></pre><p>Na view, o manager pode respeitar o usuário atual. Em um comando ou no shell, trate a ausência explicitamente e escolha o escopo adequado:</p><pre class="codebox"><code>usuario = tl.get_user()\nif usuario is None:\n    alunos = Aluno.objects.filter(ativo=True)\nelse:\n    alunos = Aluno.locals.filter(ativo=True)</code></pre><p>A mesma consulta pode produzir resultados diferentes fora de uma requisição. Testes, migrations e tarefas automáticas devem configurar ou tratar o contexto quando a regra depender de <code>tl</code>.</p></section>`;
  const lpsGuide = `<section class="panel models-lps-guide"><h2>LPS: comportamento padrão e substituído</h2><p>A LPS permite alterar um método do model conforme a variante configurada em <code>settings.LPS</code>. Sem variante, o model principal é usado; com uma variante ativa, um método de mesmo nome pode substituí-lo.</p><pre class="codebox"><code># rh/models.py\nclass Servidor(ModelPlus):\n    def get_titulacao(self):\n        return self.titulacao.nome\n\n# rh/lps/demo_lps/models.py\nclass Servidor:\n    def get_titulacao(self):\n        return 'LPS Titulacao'</code></pre><pre class="codebox"><code>Servidor em rh/models.py\n          │\n          ├── LPS vazia ───────────────► usa o método padrão\n          │\n          └── LPS = demo_lps ──────────► usa o método da variante</code></pre><p>O restante do model continua vindo do arquivo principal. Para descobrir o comportamento efetivo, confira a configuração, o arquivo da LPS e o model original. Alterações de campos continuam exigindo análise de migrations e do banco.</p></section>`;
  const integratedManagersGuide = `<section class="panel models-integrated-managers-guide"><h2>Por que analisar managers e QuerySets juntos?</h2><p>O manager é a porta de entrada e define o escopo inicial. O QuerySet organiza os filtros, métodos reutilizáveis e otimizações. A consulta completa só fica clara quando os dois são lidos em conjunto.</p><pre class="codebox"><code>Turma.objects ou Turma.locals\n             │\n             ▼\n      TurmaManager\n             │ escopo inicial\n             ▼\n        TurmaQuery\n             │ filtros e select_related()\n             ▼\n      consulta avaliada\n             │\n             ▼\n          registros</code></pre><p>Uma view pode escolher <code>Turma.locals</code>, o manager aplicar o escopo do usuário e o <code>TurmaQuery</code> acrescentar a busca de alunos matriculados. Ler apenas a view não revela todos os filtros; ler apenas o QuerySet não mostra quem escolheu o escopo.</p></section>`;
  const saveGuide = `<section class="panel models-save-guide"><h2>Por que <code>super().save()</code> é necessário?</h2><p>Ao sobrescrever <code>save()</code>, a classe filha precisa preservar a gravação do Django:</p><pre class="codebox"><code>def save(self, *args, **kwargs):\n    self.codigo = self.codigo.upper()\n    # Sem esta chamada, nada é persistido.\n    super().save(*args, **kwargs)</code></pre><pre class="codebox"><code>save() sem super()   objeto muda em memória ──X──► banco\nsave() com super()   regra personalizada ───────► INSERT/UPDATE</code></pre><p>Sem <code>super()</code>, um objeto novo não recebe <code>pk</code> e uma alteração desaparece quando o registro é consultado novamente. Também preserve <code>*args</code>, <code>**kwargs</code> e considere <code>update_fields</code>.</p></section>`;
  const rulePlacementGuide = `<section class="panel models-rule-placement-guide"><h2>Escolhendo onde implementar uma regra</h2><p>A camada deve ser escolhida pela responsabilidade da regra. Exemplos curtos:</p><pre class="codebox"><code># Campo\nquantidade = models.PositiveIntegerField(default=0)\n\n# Model.clean()\ndef clean(self):\n    if self.data_fim and self.ativo:\n        raise ValidationError('Registro ativo não pode ter data de fim.')\n\n# Form\ndef clean_data_fim(self):\n    if data_fim < self.cleaned_data['data_inicio']:\n        raise ValidationError('Data final inválida.')\n\n# QuerySet\nclass TurmaQuerySet(models.QuerySet):\n    def pendentes(self):\n        return self.filter(data_submissao__isnull=True)\n\n# View\ndef editar(request, pk):\n    obj = get_object_or_404(Modelo, pk=pk)\n    form = Form(request.POST or None, instance=obj)\n    if form.is_valid():\n        form.save()\n        return redirect(obj)</code></pre><p>Regras reutilizadas em admin, views e tarefas não devem ficar somente em um formulário. A validação deve estar na camada que consegue garanti-la em todos os caminhos de entrada.</p></section>`;
  const uniqueGuide = `<section class="panel models-unique-guide"><h2><code>validate_unique()</code> e a garantia do banco</h2><p>A validação Python oferece uma mensagem amigável; a restrição <code>UNIQUE</code> no banco protege os dados mesmo quando a validação não foi chamada.</p><pre class="codebox"><code>obj = Componente(sigla='MAT')\nobj.full_clean()  # pode mostrar ValidationError no campo\nobj.save()\n\nComponente.objects.create(sigla='MAT')\n# duplicidade: o banco rejeita pela restrição UNIQUE</code></pre><pre class="codebox"><code>full_clean()/ModelForm ──► mensagem amigável\n                              │\n                              ▼\n                         save no banco\n                              │\n                     restrição UNIQUE ──► garantia</code></pre><p>Use a validação para orientar quem preenche a tela e mantenha a restrição do banco para impedir duplicidades em comandos, tasks e integrações.</p></section>`;
  const lifecycleGuide = `<section class="panel models-lifecycle-guide"><h2>Estados de uma instância</h2><p>Uma instância começa somente em memória, pode ser persistida, alterada e carregada novamente.</p><pre class="codebox"><code>aluno = Aluno(nome='Ana')\n# novo: pk=None, _state.adding=True\n\naluno.save()\n# persistido: recebeu pk e adding=False\n\naluno.nome = 'Ana Souza'\n# alterado: somente a memória mudou\n\naluno.save()\n# atualizado: UPDATE no banco\n\naluno.refresh_from_db()\n# carregado novamente a partir do banco</code></pre><pre class="codebox"><code>novo ──save()──► persistido ──atribuição──► alterado em memória\n  ▲                                      │\n  └──────────── refresh_from_db() ◄──────┘\n                         │\n                         └──save()──► persistido novamente</code></pre></section>`;
  const queryMethodsGuide = `<section class="panel models-query-methods-guide"><h2>Escolhendo entre <code>get()</code>, <code>filter()</code> e <code>first()</code></h2><table><thead><tr><th>Método</th><th>Retorno</th><th>Sem resultado</th><th>Vários resultados</th><th>Uso</th></tr></thead><tbody><tr><td><code>get()</code></td><td>uma instância</td><td><code>DoesNotExist</code></td><td><code>MultipleObjectsReturned</code></td><td>exatamente um registro</td></tr><tr><td><code>filter()</code></td><td><code>QuerySet</code></td><td>vazio</td><td>todos</td><td>zero, um ou vários; permite compor</td></tr><tr><td><code>first()</code></td><td>instância ou <code>None</code></td><td><code>None</code></td><td>primeiro ordenado</td><td>ausência normal; basta um</td></tr></tbody></table><pre class="codebox"><code>matricula = MatriculaPeriodo.objects.get(pk=10)\nalunos = Aluno.objects.filter(curso=curso).order_by('nome')\ncoordenador = Professor.objects.filter(turma=turma).first()</code></pre></section>`;
  const decisionGuide = `<section class="panel models-decision-guide"><h2>Como escolher a operação ORM</h2><p>Comece pela intenção: ler, criar, alterar ou excluir. Depois verifique se as regras de <code>save()</code>, <code>delete()</code> e sinais precisam ser executadas.</p><pre class="codebox"><code># Listagem: zero ou muitos\nalunos = Aluno.objects.filter(curso=curso)\n\n# Detalhe: exatamente um\naluno = Aluno.objects.get(pk=pk)\n\n# Criação: executa save()\nmatricula = MatriculaPeriodo.objects.create(aluno=aluno, periodo_letivo=periodo)\n\n# Lote: rápido, mas sem save() por instância\nAluno.objects.filter(situacao__ativo=False).update(arquivado=True)</code></pre><p>Se uma alteração em lote precisar de uma regra personalizada, carregue as instâncias e chame <code>save()</code> individualmente ou use um serviço adequado. A tabela ajuda a escolher a operação sem confundir velocidade com comportamento completo.</p></section>`;
  const pitfallsGuide = `<section class="panel models-pitfalls-guide"><h2>Armadilhas frequentes: problema e correção</h2><p>Uma consulta pode retornar os dados corretos e ainda ser lenta por carregar relações desnecessárias ou repetir SQL.</p><pre class="codebox"><code># N+1: uma consulta para cada aluno\nfor aluno in alunos:\n    print(aluno.pessoa_fisica.nome)\n\n# Correção\nalunos = Aluno.objects.select_related('pessoa_fisica')\nfor aluno in alunos:\n    print(aluno.pessoa_fisica.nome)</code></pre><pre class="codebox"><code># Filtro não significa que a relação está pré-carregada.\nalunos = Aluno.objects.filter(matriculaperiodo__isnull=False)\n\n# Correção quando a tela percorre as matrículas.\nalunos = Aluno.objects.filter(\n    matriculaperiodo__isnull=False,\n).prefetch_related('matriculaperiodo_set')</code></pre><pre class="codebox"><code># Problema: carrega tudo em uma tela paginada.\nalunos = list(Aluno.objects.order_by('pk'))\n\n# Correção: limite a consulta.\nalunos = Aluno.objects.order_by('pk')[:50]\n\n# Se a lista precisa de poucos campos:\nnomes = Aluno.objects.values('pk', 'pessoa_fisica__nome')[:100]</code></pre></section>`;
  const formsConceptsGuide = `<section class="panel models-forms-concepts-guide"><h2>Models e Forms: conceitos essenciais</h2><p><code>Meta.model</code> liga o formulário à entidade; <code>Meta.fields</code> limita os campos editáveis; <code>instance</code> transforma o envio em edição; <code>commit=False</code> permite completar o objeto antes de gravar; e <code>save_m2m()</code> salva relações depois do objeto ter uma chave primária.</p><pre class="codebox"><code>class AlunoForm(forms.ModelForm):\n    class Meta:\n        model = Aluno\n        fields = ['matricula', 'pessoa_fisica']\n\nobj = form.save(commit=False)\nobj.atualizado_por = request.user\nobj.save()\nform.save_m2m()</code></pre><p>Validações do model protegem a entidade; validações do form tratam a combinação de campos daquela tela. Opções como <code>blank</code>, <code>choices</code> e <code>help_text</code> influenciam o formulário. Evite <code>fields = '__all__'</code> quando a tela não deve expor todos os campos.</p></section>`;
  const integratedFormGuide = `<section class="panel models-integrated-form-guide"><h2>Form integrado ao model</h2><p>O fluxo abaixo mostra o model persistido, o form que limita o campo editável e a view que usa <code>instance</code> para alterar o registro correto.</p><pre class="codebox"><code>class PlanoEnsino(models.Model):\n    coordenador = models.ForeignKey(\n        'comum.Funcionario', null=True,\n        on_delete=models.SET_NULL,\n    )\n\nclass AlterarCoordenadorPlanoEnsinoForm(forms.ModelForm):\n    class Meta:\n        model = PlanoEnsino\n        fields = ['coordenador']\n\ndef alterar_coordenador(request, pk):\n    plano = get_object_or_404(PlanoEnsino, pk=pk)\n    form = AlterarCoordenadorPlanoEnsinoForm(\n        request.POST or None, instance=plano,\n    )\n    if form.is_valid():\n        form.save()  # atualiza, não cria outro plano\n        return redirect('plano_ensino', pk=plano.pk)\n    return render(request, 'alterar_coordenador.html', {'form': form})</code></pre></section>`;
  const viewFlowGuide = `<section class="panel models-view-flow-guide"><h2>View, QuerySet, template e transação</h2><p>A view coordena a requisição, o manager define o escopo, o QuerySet prepara os dados e o template apenas apresenta o contexto.</p><pre class="codebox"><code>@permission_required('edu.view_turma')\ndef detalhes(request, pk):\n    turma = get_object_or_404(Turma.locals, pk=pk)\n    turmas = Turma.locals.select_related('ano_letivo')\n    return render(request, 'turma.html', {\n        'turma': turma, 'turmas': turmas,\n    })</code></pre><pre class="codebox"><code>GET  → formulário\nPOST → valida e salva\n302  → redireciona\nGET  → tela atualizada</code></pre><pre class="codebox"><code>with transaction.atomic():\n    plano.save()\n    Diario.objects.filter(pk=plano.diario_id).update(\n        atualizado=True,\n    )</code></pre><p>Use uma transação quando várias alterações precisarem ser confirmadas juntas. Trate ausência com 404, conflitos com <code>IntegrityError</code> e mantenha regras de negócio fora do template.</p></section>`;
  const layerFlowGuide = `<section class="panel models-layer-flow-guide"><h2>Como ler o fluxo da tela de turma</h2><p>Cada arquivo responde por uma etapa: a URL reconhece o endereço, a view coordena e autoriza, o manager escolhe o escopo, o model fornece regras e o template apresenta os dados.</p><pre class="codebox"><code>edu/urls.py → edu/views.py:turma → Turma.locals/objects → model → templates/turma.html</code></pre><p>Ao investigar, pergunte em cada camada quem autoriza, quem filtra, quem calcula e quem apenas exibe. Isso evita duplicar regras.</p></section>`;
  const adminReportsGuide = `<section class="panel models-admin-reports-guide"><h2>Admin e relatórios usam o mesmo model com objetivos diferentes</h2><pre class="codebox"><code>@admin.register(AvisoTurma)\nclass AvisoTurmaAdmin(ModelAdminPlus):\n    list_display = ('titulo', 'turma', 'autor', 'cadastrado_em')\n    list_filter = ('turma',)\n    search_fields = ('titulo', 'mensagem')</code></pre><pre class="codebox"><code>avisos = (\n    AvisoTurma.objects\n    .select_related('turma', 'autor')\n    .filter(turma__ano_letivo=ano)\n    .values('titulo', 'turma__descricao', 'autor__username')\n    .order_by('-cadastrado_em')\n)</code></pre><p>O admin configura a interface administrativa. O relatório prepara campos, filtros e ordenação para leitura ou exportação. Ambos reutilizam o model sem duplicar suas regras.</p></section>`;
  const integratedFlowsGuide = `<section class="panel models-integrated-flows-guide"><h2>Finalidade dos fluxos integrados</h2><ul><li><strong>Admin:</strong> mostra como uma edição passa por admin, form e <code>save()</code>.</li><li><strong>Coordenador:</strong> mostra uma edição especializada com <code>instance</code> e escopo contextual.</li><li><strong>PDF:</strong> acompanha a leitura do model até o template e a resposta documental.</li><li><strong>Devolução:</strong> mostra uma regra de negócio reutilizável concentrada no model.</li></ul></section>`;
  const avisoPracticeGuide = `<section class="panel models-aviso-practice-guide"><h2>Antes e durante a criação de AvisoTurma</h2><p>Transformar requisitos em model significa decidir campos, relações e regras antes de programar.</p><pre class="codebox"><code>requisito → campo/relação/regra → model → form/view/URL/template</code></pre><p>O arquivo do model declara a entidade persistida. A view coordena a criação, define turma e autor pelo backend e processa GET ou POST:</p><pre class="codebox"><code>def adicionar_aviso_turma(request, turma_pk):\n    turma = get_object_or_404(Turma.locals, pk=turma_pk)\n    aviso = AvisoTurma(turma=turma, autor=request.user)\n    form = AvisoTurmaForm(request.POST or None, instance=aviso)\n    if form.is_valid():\n        return httprr(form.save().get_absolute_url())</code></pre><p>A URL reconhece o endereço e entrega o número de <code>turma_pk</code> à view:</p><pre class="codebox"><code>path(\n    'adicionar_aviso_turma/&lt;int:turma_pk&gt;/',\n    views.adicionar_aviso_turma,\n)\n\n/edu/adicionar_aviso_turma/25/\n→ turma_pk = 25</code></pre></section>`;
  const templatePartsGuide = `<section class="panel models-template-parts-guide"><h2>Template do formulário: quatro partes</h2><p><code>super_template</code> reaproveita o layout geral do SUAP; <code>{% block content %}</code> marca a área específica da página; <code>{% box %}</code> organiza o conteúdo em um bloco visual; e <code>{% render_form form %}</code> renderiza campos e erros do formulário.</p><pre class="codebox"><code>{% extends super_template %}\n\n{% block content %}\n    {% box title %}\n        {% render_form form %}\n    {% endbox %}\n{% endblock %}</code></pre></section>`;
  const permissionStagesGuide = `<section class="panel models-permission-stages-guide"><h2>Declarar, sincronizar e verificar permissão</h2><p>A declaração no YAML, a sincronização e a verificação na view são etapas diferentes:</p><pre class="codebox"><code>permissions.yaml\n      ↓ sync_permissions\ngrupo recebe edu.add_avisoturma\n      ↓ permission_required()\nview permite ou bloqueia o cadastro</code></pre><p>O YAML descreve a associação, <code>sync_permissions</code> grava essa associação no banco e o decorator consulta o resultado durante a requisição.</p></section>`;
  const compatibleChangeGuide = `<section class="panel models-compatible-change-guide"><h2>Alteração compatível com dados existentes</h2><p>Ao adicionar um campo, preserve primeiro os registros antigos. Neste exemplo, <code>null=True</code> e <code>blank=True</code> permitem que avisos já existentes continuem sem data de expiração:</p><pre class="codebox"><code>data_expiracao = models.DateFieldPlus(\n    'Data de Expiração',\n    null=True,\n    blank=True,\n)</code></pre><p>Depois da migration e da revisão dos dados, a regra pode ser endurecida em etapas. Não atribua uma data atual automaticamente a registros históricos sem confirmar o significado.</p></section>`;
  const presentationFlowGuide = `<section class="panel models-presentation-flow-guide"><h2>Do model ao template</h2><p>Uma alteração chega à interface pela migration, pela consulta da view e pelo contexto entregue ao template.</p><pre class="codebox"><code>model + migration\n       ↓\nview filtra e entrega aviso.data_expiracao\n       ↓\ntemplate formata e exibe a data</code></pre><p>O template apresenta o valor recebido e não deve consultar o banco nem repetir a regra de expiração.</p></section>`;
  const lazyEvaluationGuide = `<section class="panel models-lazy-evaluation-guide"><h2>O que observar na avaliação preguiçosa</h2><p>Montar e encadear um <code>QuerySet</code> não consulta o banco. Operações terminais como <code>count()</code>, <code>exists()</code>, <code>first()</code>, <code>list()</code> e a iteração executam SQL.</p><pre class="codebox"><code>from django.db import connection\n\nqs = Aluno.objects.filter(situacao__ativo=True)\nantes = len(connection.queries)\nqs = qs.select_related('pessoa_fisica')\ndepois_da_montagem = len(connection.queries)\n\nlist(qs[:10])\ndepois_da_lista = len(connection.queries)\nqs.count()\ndepois_da_contagem = len(connection.queries)</code></pre><p>Compare os contadores: a montagem deve manter o mesmo número; a lista e a contagem podem acrescentar consultas próprias. Reutilizar um QuerySet já avaliado pode usar o cache, enquanto uma nova relação não pré-carregada pode gerar SQL adicional.</p></section>`;
  const nPlusOneCompareGuide = `<section class="panel models-nplusone-compare-guide"><h2>Problema N+1: comparação</h2><p>Sem otimização, o loop pode abrir uma consulta para cada relação. Use <code>select_related()</code> para chaves estrangeiras e <code>prefetch_related()</code> para relações reversas ou muitos-para-muitos.</p><pre class="codebox"><code># Pode gerar N+1 consultas\nalunos = Aluno.objects.order_by('pk')[:10]\nfor aluno in alunos:\n    print(aluno.pessoa_fisica.nome)\n\n# Uma consulta com JOIN para relações de valor único\nalunos = Aluno.objects.select_related(\n    'pessoa_fisica', 'curso_campus',\n).order_by('pk')[:10]</code></pre><pre class="codebox"><code># Relação reversa sem prefetch\nfor turma in Turma.objects.all():\n    list(turma.diario_set.all())\n\n# Duas consultas: turmas + todos os diários relacionados\nturmas = Turma.objects.prefetch_related('diario_set')</code></pre></section>`;
  const testsGuide = `<section class="panel models-tests-guide"><h2>O que cada teste verifica</h2><p>Testes de model verificam valores padrão, choices, representação, validação, unicidade, persistência, exclusão e métodos de domínio.</p><pre class="codebox"><code>def test_clean_rejeita_data_anterior(self):\n    aviso = AvisoTurma(data_expiracao=date(2026, 1, 1))\n    with self.assertRaises(ValidationError):\n        aviso.full_clean()\n\ndef test_unicidade(self):\n    Componente.objects.create(sigla='MAT')\n    with self.assertRaises(ValidationError):\n        Componente(sigla='MAT').validate_unique()\n\ndef test_exclusao_em_cascata(self):\n    turma = TurmaFactory()\n    aviso = AvisoTurmaFactory(turma=turma)\n    turma.delete()\n    self.assertFalse(AvisoTurma.objects.filter(pk=aviso.pk).exists())\n\ndef test_metodo_de_dominio(self):\n    aviso = AvisoTurmaFactory()\n    aviso.cancelar('Encerrado')\n    self.assertTrue(aviso.cancelado)</code></pre></section>`;
  const reviewGuide = `<section class="panel models-review-guide"><h2>Aplicando o checklist em uma revisão</h2><p>Para uma alteração como <code>data_expiracao</code> em <code>AvisoTurma</code>, confirme: o campo pertence ao model; registros antigos aceitam <code>NULL</code>; migration e índice são necessários; o manager mantém o escopo; form, view, admin, template e PDF exibem o valor; não surgiu N+1; e <code>check</code>, migration e testes passaram.</p><pre class="codebox"><code>python manage.py check\npython manage.py makemigrations edu --check\npython manage.py test edu.tests.AvisoTurmaTestCase</code></pre><p>A revisão deve relacionar cada pergunta a um arquivo, comando ou comportamento observável, e não apenas marcar itens de uma lista.</p></section>`;
  return `<div class="reading-layout"><div class="reading-main"><section class="panel"><span class="tag">ENCONTRO 05 · MODELS DO SUAP</span><h2>Do model à regra de negócio</h2><p>Estude como o SUAP representa entidades, persiste dados, executa consultas e integra models com forms, views, templates, admin e relatórios.</p><div class="tip"><strong>Como estudar:</strong> leia o conceito, localize o arquivo indicado, copie os exemplos quando necessário e confira o fluxo completo antes de propor uma alteração.</div></section>${structure}${mapGuide}${importsGuide}${localImportsGuide}${searchGuide}${fieldsGuide}${reverseGuide}${relatedNameGuide}${relationshipChangesGuide}${abstractGuide}${logModelGuide}${managersGuide}${threadLocalGuide}${lpsGuide}${integratedManagersGuide}${saveGuide}${rulePlacementGuide}${uniqueGuide}${lifecycleGuide}${queryMethodsGuide}${decisionGuide}${pitfallsGuide}${formsConceptsGuide}${integratedFormGuide}${viewFlowGuide}${layerFlowGuide}${adminReportsGuide}${integratedFlowsGuide}${avisoPracticeGuide}${templatePartsGuide}${permissionStagesGuide}${compatibleChangeGuide}${presentationFlowGuide}${lazyEvaluationGuide}${nPlusOneCompareGuide}${testsGuide}${reviewGuide}<div class="models-content toc-content">${content}</div></div><button class="toc-float" id="models-toc-toggle" type="button" aria-expanded="false" aria-controls="models-right-toc">Tópicos</button><aside class="right-toc" id="models-right-toc" aria-label="Tópicos da página"><h2>Nesta página</h2><nav></nav></aside></div>`;
}
function enhanceFormsIndex() {
  const targets = [
    ["D.", "forms-fundamentos"],
    ["E.", "forms-form-view"],
    ["F.", "forms-form-model"],
    ["G.", "forms-form-template"],
    ["H.", "forms-recursos"],
    ["I.", "forms-atividades"],
    ["J.", "forms-erros"],
    ["K.", "forms-revisao"],
    ["L.", "forms-revisao"],
    ["M.", "forms-revisao"],
    ["N.", "forms-referencias"],
  ];
  document.querySelectorAll(".forms-content h2").forEach((heading) => {
    const target = targets.find(([prefix]) => heading.textContent.trim().startsWith(prefix));
    if (target && !document.getElementById(target[1])) heading.id = target[1];
  });
  document.querySelectorAll(".forms-index a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
function enhanceAdminLinks() {
  document.querySelectorAll(".admin-content a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });
}
function enhanceRightToc() {
  const toc = document.querySelector("#forms-right-toc, #permissions-right-toc, #decorators-right-toc, #intro-right-toc, #models-right-toc, #admin-right-toc");
  const content = document.querySelector(".forms-content, .models-content, .admin-content, .toc-content");
  if (!toc || !content) return;
  const toggle = document.querySelector("#forms-toc-toggle, #permissions-toc-toggle, #decorators-toc-toggle, #intro-toc-toggle, #models-toc-toggle, #admin-toc-toggle");
  if (toggle) {
    const savedToc = localStorage.getItem("suapEduToc");
    if (savedToc === "open" && window.matchMedia("(max-width: 1180px)").matches) {
      toc.classList.add("mobile-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    toggle.onclick = () => {
      const open = toc.classList.toggle("mobile-open");
      toggle.setAttribute("aria-expanded", String(open));
      localStorage.setItem("suapEduToc", open ? "open" : "closed");
    };
  }
  const headingSelector = content.classList.contains("permissions-content") ? "h2, h3" : "h2, h3, h4";
  const headings = [...content.querySelectorAll(headingSelector)];
  const used = new Set(headings.map((heading) => heading.id).filter(Boolean));
  headings.forEach((heading, index) => {
    if (!heading.id) {
      let id = "forms-topic-" + index;
      while (used.has(id)) id += "-x";
      heading.id = id;
      used.add(id);
    }
  });
  const nav = toc.querySelector("nav");
  nav.innerHTML = headings.map((heading) => {
    const level = heading.tagName === "H2" ? "primary" : heading.tagName === "H3" ? "secondary" : "tertiary";
    return `<a class="right-toc-link ${level}" href="#${heading.id}">${escape(heading.textContent)}</a>`;
  }).join("");
  const links = [...nav.querySelectorAll("a")];
  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.hash === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  setActive(headings[0]?.id);
  links.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      setActive(target.id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (toggle && window.matchMedia("(max-width: 1180px)").matches) {
        toc.classList.remove("mobile-open");
        toggle.setAttribute("aria-expanded", "false");
        localStorage.setItem("suapEduToc", "closed");
      }
    }
  }));
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setActive(visible[0].target.id);
  }, { rootMargin: "-92px 0px -65% 0px", threshold: 0 });
  headings.forEach((heading) => observer.observe(heading));
}
function modulePage(m) {
  return `<div class="sectionhead"><span class="eyebrow">MÓDULO ${m.num} · ESTUDO GUIADO</span><h1>${m.name}</h1><p>${m.desc}</p><div class="bar"><div style="width:${modulePercent(m)}%"></div></div><span class="muted small">${moduleDone(m)}/${moduleTotal(m)} etapas concluídas</span></div><section class="panel"><h3>Ao terminar este módulo, você será capaz de:</h3><ul>${m.goals.map((g) => `<li>${g}</li>`).join("")}</ul></section>${m.id === "m1" ? module1() : m.id === "m2" ? module2() : m.id === "m3" ? module3() : m.id === "m4" ? module4() : m.id === "m5" ? module5() : m.id === "m6" ? module6() : module4()}${challengeArea(m.id)}${tasks(m)}${quiz(m)}${notesBlock(m.id)}<div class="panel"><h3>Continue seus estudos</h3><button class="btn" data-page="${m.id === "m1" ? "m2" : m.id === "m2" ? "m3" : m.id === "m3" ? "m4" : m.id === "m4" ? "m5" : m.id === "m5" ? "m6" : "roadmap"}">${m.id === "m6" ? "Voltar para a trilha" : m.id === "m5" ? "Ir para o encontro 06" : "Ir para o pr\u00f3ximo m\u00f3dulo"} →</button></div>`;
}
const libraryItems = [
  ["model", "Model Turma: campos e managers"],
  ["matriculados", "Métodos de matrículas"],
  ["horarios", "Método get_horarios()"],
  ["view", "View turma() comentada"],
  ["rtr", "Decorator @rtr()"],
  ["gettemplate", "Localização automática do template"],
  ["httprr", "Redirecionamento com httprr()"],
  ["pdfresponse", "Resposta PDFResponse"],
  ["remover", "Método remover_alunos()"],
];
function library() {
  let key = state.library || "view";
  return `<div class="sectionhead"><span class="eyebrow">REFERÊNCIA DE CÓDIGO</span><h1>Biblioteca de códigos comentados</h1><p>Exemplos extraídos dos arquivos fornecidos. Use as referências para localizar a implementação no repositório.</p></div><div class="tabs">${libraryItems.map(([k, t]) => `<button data-library="${k}" class="${k === key ? "selected" : ""}">${escape(t)}</button>`).join("")}</div>${code(key, libraryItems.find((x) => x[0] === key)[1], key === "view" ? "Código da view com comentários didáticos." : "Trecho extraído do arquivo original anexado.")}<section class="panel"><h3>Como estudar um trecho</h3><p>Leia primeiro a assinatura da função, identifique os parâmetros, localize as chamadas a outros componentes e explique o retorno. Depois oculte os comentários e tente repetir a análise.</p></section>`;
}
function glossary() {
  const groups = [...new Set(SUAP_GLOSSARY.map((item) => item.category))];
  return `<div class="sectionhead"><span class="eyebrow">REFERÊNCIA DE ESTUDO</span><h1>Glossário do SUAP</h1><p>Os termos abaixo formam uma rede de conceitos. Para investigar uma tela, acompanhe o caminho da requisição: a URL encontra a rota, a view coordena o processamento, os models consultam os dados, o contexto alimenta o template e a resposta volta ao navegador. Permissões, autenticação e regras contextuais atravessam esse fluxo.</p></div><section class="panel glossary-guide"><h2>Como usar este glossário</h2><p>Comece pelo termo que apareceu durante a leitura e depois siga as relações indicadas na explicação. O objetivo é reconhecer a responsabilidade de cada camada e fazer perguntas melhores ao investigar uma manutenção.</p><div class="glossary-flow"><span>Requisição</span><b>→</b><span>URL e rota</span><b>→</b><span>View</span><b>→</b><span>Dados e regras</span><b>→</b><span>Template ou resposta</span></div></section>${groups.map((category) => `<section class="glossary-section"><h2>${escape(category)}</h2><div class="glossary-grid">${SUAP_GLOSSARY.filter((item) => item.category === category).map((item) => `<details class="glossary-item"><summary><span>${escape(item.term)}</span><small>${escape(item.category)}</small></summary><div class="glossary-body"><p><strong>O que significa:</strong> ${escape(item.definition)}</p><p><strong>No SUAP:</strong> ${escape(item.context)}</p><p><strong>Exemplo:</strong> <code>${escape(item.example)}</code></p></div></details>`).join("")}</div></section>`).join("")}`;
}function notes() {
  return `<div class="sectionhead"><span class="eyebrow">SEU CADERNO</span><h1>Minhas anotações</h1><p>As notas são salvas neste navegador e podem ser exportadas em Markdown.</p></div>${notesBlock("geral")}${course.map((m) => `<div class="panel"><h3>${m.name}</h3><p>${escape((state["note:" + m.id] || "").slice(0, 350)) || "Nenhuma anotação registrada."}</p><button class="btn secondary" data-page="${m.id}">Abrir módulo →</button></div>`).join("")}`;
}
function progress() {
  return `<div class="sectionhead"><span class="eyebrow">ACOMPANHAMENTO</span><h1>Meu progresso</h1><p>Veja as atividades concluídas e retome os módulos que ainda deseja revisar.</p></div>${course.map((m) => `<section class="panel"><div class="codebar"><h3>${m.num} · ${m.name}</h3><strong>${modulePercent(m)}%</strong></div><div class="bar"><div style="width:${modulePercent(m)}%"></div></div><p class="muted">${moduleDone(m)} de ${moduleTotal(m)} atividades${moduleChallenges[m.id]?.length ? ` · ${challengeDone(m)} de ${moduleChallenges[m.id].length} chamados` : ""}</p><button class="btn secondary" data-page="${m.id}">Revisar módulo →</button></section>`).join("")}<div class="panel"><p>O progresso fica armazenado apenas neste dispositivo e navegador.</p><button class="btn ghost" id="reset">Reiniciar atividades, chamados e respostas</button></div>`;
}
function roadmap() {
  return `<div class="sectionhead"><span class="eyebrow">TRILHA COMPLETA</span><h1>Pr\u00f3ximos encontros</h1><p>O plano de curso prev\u00ea seis encontros de 2 horas, totalizando 12 horas. Todos os encontros est\u00e3o dispon\u00edveis para estudo.</p></div><div class="panel"><span class="tag">ENCONTRO 04 \u00b7 DISPON\u00cdVEL</span><h2>Forms e relat\u00f3rios do SUAP</h2><p>Formul\u00e1rios, valida\u00e7\u00f5es, filtros e gera\u00e7\u00e3o de relat\u00f3rios.</p><button class="btn" data-page="m4">Abrir encontro 04 \u2192</button></div><div class="panel"><span class="tag">ENCONTRO 05 \u00b7 DISPON\u00cdVEL</span><h2>Models do SUAP</h2><p>Relacionamentos, managers, consultas ORM e regras associadas aos dados.</p><button class="btn" data-page="m5">Abrir encontro 05 \u2192</button></div><div class="panel"><span class="tag">ENCONTRO 06 \u00b7 DISPON\u00cdVEL</span><h2>Admin do SUAP</h2><p>Configura\u00e7\u00e3o e personaliza\u00e7\u00e3o da interface administrativa.</p><button class="btn" data-page="m6">Abrir encontro 06 \u2192</button></div><button class="btn" data-page="plan">Consultar plano de curso \u2192</button>`;
}
function searchPage(q) {
  let entries = [
    ...course.map((m) => ({
      id: m.id,
      title: m.name,
      content: m.desc + " " + m.goals.join(" ") + " " + m.tasks.join(" "),
    })),
    ...SUAP_GLOSSARY.map((item) => ({
      id: "glossary",
      title: item.term,
      content: item.definition + " " + item.context + " " + item.example,
    })),
    ...libraryItems.map(([id, title]) => ({
      id: "library",
      title,
      content: samples[id].code,
      lib: id,
    })),
  ];
  let found = entries.filter((e) =>
    (e.title + " " + e.content).toLowerCase().includes(q.toLowerCase()),
  );
  return `<div class="sectionhead"><span class="eyebrow">PESQUISA</span><h1>Resultados para “${escape(q)}”</h1><p>${found.length} resultados encontrados.</p></div>${found.map((e) => `<div class="result"><button ${e.lib ? `data-open-library="${e.lib}"` : `data-page="${e.id}"`}>${escape(e.title)} →</button><p class="muted small">${escape(e.content.replace(/\s+/g, " ").slice(0, 170))}...</p></div>`).join("") || '<div class="empty">Tente outro termo, como “Turma”, “rtr” ou “permissão”.</div>'}`;
}
let current = "home";
function navigate(page) {
  current = page;
  location.hash = page;
  render();
  $("#sidebar").classList.remove("open");
  if (typeof updateSidebarButton === "function" && window.matchMedia("(max-width: 760px)").matches) updateSidebarButton(false);
  window.scrollTo(0, 0);
}
function downloadText(name, txt) {
  let a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([txt], { type: "text/markdown;charset=utf-8" }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function render() {
  let m = course.find((x) => x.id === current);
  $("#crumb").textContent =
    "Guia do SUAP / " +
    (m
      ? m.name
      : {
          home: "Início",
          plan: "Plano de curso",
          library: "Códigos comentados",
          glossary: "Glossário",
          notes: "Anotações",
          progress: "Progresso",
          roadmap: "Próximos encontros",
          search: "Pesquisa",
        }[current] || "Início");
  $("#content").innerHTML =
    current === "home"
      ? home()
      : current === "plan"
        ? plan()
        : current === "library"
          ? library()
          : current === "glossary"
            ? glossary()
          : current === "notes"
            ? notes()
            : current === "progress"
              ? progress()
              : current === "roadmap"
                ? roadmap()
                : current === "search"
                  ? searchPage($("#search").value)
                  : m
                    ? modulePage(m)
                    : home();
  enhanceFormDiagrams();
  enhanceFormsIndex();
  enhanceRightToc();
  enhanceAdminLinks();
  document.querySelectorAll("[data-page]").forEach((b) => {
    b.onclick = () => navigate(b.dataset.page);
    b.classList.toggle("active", b.dataset.page === current);
  });
  document.querySelectorAll("[data-library]").forEach(
    (b) =>
      (b.onclick = () => {
        state.library = b.dataset.library;
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-open-library]").forEach(
    (b) =>
      (b.onclick = () => {
        state.library = b.dataset.openLibrary;
        save();
        navigate("library");
      }),
  );
  document.querySelectorAll("[data-task]").forEach(
    (b) =>
      (b.onchange = () => {
        state["task:" + b.dataset.task] = b.checked;
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-ticket]").forEach(
    (b) =>
      (b.onchange = () => {
        state["ticket:" + b.dataset.ticket] = b.checked;
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-quiz]").forEach(
    (b) =>
      (b.onchange = () => {
        let [id, i, j] = b.dataset.quiz.split(":");
        state["quiz:" + id + ":" + i] = +j;
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-note]").forEach(
    (t) =>
      (t.oninput = () => {
        state["note:" + t.dataset.note] = t.value;
        save();
      }),
  );
  document
    .querySelectorAll("[data-export]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          downloadText(
            "anotacoes_" + b.dataset.export + ".md",
            "# Minhas anotações — SUAP EDU\n\n" +
              (state["note:" + b.dataset.export] || ""),
          )),
    );
  document.querySelectorAll("[data-copy]").forEach(
    (b) =>
      (b.onclick = async () => {
        try {
          await navigator.clipboard.writeText(samples[b.dataset.copy].code);
          b.textContent = "Copiado ✓";
        } catch {
          b.textContent = "Selecione e copie o trecho";
        }
      }),
  );
  document.querySelectorAll("[data-toggle]").forEach(
    (b) =>
      (b.onclick = () => {
        let el = $("#code-" + b.dataset.toggle);
        el.classList.toggle("no-comments");
        b.textContent = el.classList.contains("no-comments")
          ? "Mostrar comentários"
          : "Ocultar comentários";
      }),
  );
  document.querySelectorAll("[data-form-copy]").forEach(
    (b) =>
      (b.onclick = async () => {
        const codeEl = b.closest(".form-code")?.querySelector("code");
        if (!codeEl) return;
        try {
          await navigator.clipboard.writeText(codeEl.textContent);
          b.textContent = "Copiado ✓";
        } catch {
          b.textContent = "Selecione e copie o trecho";
        }
      }),
  );
  document.querySelectorAll("[data-form-toggle]").forEach(
    (b) =>
      (b.onclick = () => {
        const panel = b.closest(".form-code");
        if (!panel) return;
        panel.classList.toggle("no-comments");
        b.textContent = panel.classList.contains("no-comments")
          ? "Mostrar comentários"
          : "Ocultar comentários";
      }),
  );
  if ($("#reset"))
    $("#reset").onclick = () => {
      if (
        confirm(
          "Reiniciar atividades, chamados e respostas? As anotações serão preservadas.",
        )
      ) {
        Object.keys(state)
          .filter(
            (k) =>
              k.startsWith("task:") ||
              k.startsWith("ticket:") ||
              k.startsWith("quiz:"),
          )
          .forEach((k) => delete state[k]);
        save();
        render();
      }
    };
}
const sidebarToggle = $("#hamburger");
const sidebar = $("#sidebar");
function updateSidebarButton(expanded) {
  sidebarToggle.setAttribute("aria-expanded", String(expanded));
  const label = expanded ? "Ocultar navegação" : "Mostrar navegação";
  sidebarToggle.setAttribute("aria-label", label);
  sidebarToggle.title = label;
}
function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  localStorage.setItem("suapEduSidebar", collapsed ? "collapsed" : "expanded");
  updateSidebarButton(!collapsed);
}
const savedSidebar = localStorage.getItem("suapEduSidebar");
if (savedSidebar === "collapsed") setSidebarCollapsed(true);
sidebarToggle.onclick = () => {
  if (window.matchMedia("(max-width: 760px)").matches) {
    const open = sidebar.classList.toggle("open");
    updateSidebarButton(open);
  } else {
    setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
  }
};
$("#theme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "suapEduParticipanteTheme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
};
if (localStorage.getItem("suapEduParticipanteTheme") === "dark")
  document.body.classList.add("dark");
$("#print").onclick = () => window.print();
let timeout;
$("#search").oninput = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if ($("#search").value.trim()) {
      current = "search";
      render();
    } else navigate("home");
  }, 220);
};
window.addEventListener("hashchange", () => {
  let p = location.hash.slice(1);
  if (
    [
      "home",
      "plan",
      "library",
      "glossary",
      "notes",
      "progress",
      "roadmap",
      ...course.map((x) => x.id),
    ].includes(p) &&
    p !== current
  ) {
    current = p;
    render();
  }
});
current = [
  "home",
  "plan",
  "library",
  "glossary",
  "notes",
  "progress",
  "roadmap",
  ...course.map((x) => x.id),
].includes(location.hash.slice(1))
  ? location.hash.slice(1)
  : "home";
render();
