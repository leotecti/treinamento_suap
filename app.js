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
  },];
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
      id: "aluno-periodo-ingresso",
      title: "Rótulo do período de ingresso",
      area: "Detalhamento do aluno",
      url: "https://suap.ifg.edu.br/edu/aluno/id_matricula/",
      request:
        "No detalhamento do aluno, substitua o texto “Ingresso” por “Período de Ingresso”.",
      acceptance:
        "O novo rótulo deve aparecer no detalhamento sem modificar o valor ou os demais dados acadêmicos.",
    },
    {
      id: "aluno-periodo-ingresso-duplicado",
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
    id: "restringir-relatorio-permissao",
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
    title: "Ajustar orientação e paginação de PDF",
    area: "Documento · @documento",
    url: "edu/views.py · relatório PDF indicado no exercício",
    request:
      "O relatório possui muitas colunas e está difícil de ler. Gere o documento em modo paisagem e remova a numeração das páginas.",
    acceptance:
      "O PDF é gerado com landscape=True e enumerar_paginas=False, sem perder informações do relatório.",
  },
  {
    id: "declaracao-autenticavel",
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
  return `<div class="hero"><span class="eyebrow">TRILHA DE APRENDIZAGEM · SUAP EDU</span><h1>Introdução ao Desenvolvimento SUAP</h1><p>Um guia de estudos com exemplos reais de código, exercícios práticos e explicações para consultar durante e depois das aulas.</p><button class="btn" data-page="m1">Começar pelo módulo 01 →</button></div><div class="stats"><div class="stat"><strong>12 h</strong><span>6 encontros · 2 h cada</span></div><div class="stat"><strong>04</strong><span>Módulos de estudo disponíveis</span></div><div class="stat"><strong>${course.reduce((n, m) => n + moduleDone(m), 0)}/${course.reduce((n, m) => n + moduleTotal(m), 0)}</strong><span>Atividades realizadas</span></div></div><section class="panel"><span class="tag">ENTENDA A ARQUITETURA</span><h2>Do endereço à página: o fluxo MTV</h2><p class="muted">A view recebe a requisição encaminhada pelas URLs, consulta os models e prepara o contexto utilizado pelo template.</p><img class="diagram" src="fluxo_django_mtv.png" alt="Diagrama do fluxo: usuário, URL, view, model, banco de dados, template e resposta HTML"><p class="small muted">Diagrama introdutório. O processamento real também pode retornar JSON, PDF ou redirecionamentos.</p></section><h2>Seus módulos de estudo</h2><div class="grid3">${course.map(card).join("")}</div><section class="panel"><h2>Como estudar com este guia</h2><div class="grid3"><div><h3>01 · Compreenda</h3><p>Leia os conceitos e examine as relações entre os componentes.</p></div><div><h3>02 · Investigue</h3><p>Abra os arquivos indicados no VSCode e localize as implementações.</p></div><div><h3>03 · Pratique</h3><p>Conclua as atividades, responda às questões e registre suas descobertas.</p></div></div></section><div class="tip">Os encontros 5 e 6 aparecem no plano de curso e serão incorporados nas próximas etapas.</div>`;
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
    cancelado = models.BooleanField(default=False)</code></pre><div class="tablewrap"><table><thead><tr><th>Campo</th><th>Finalidade</th></tr></thead><tbody><tr><td><code>tipo</code></td><td>Identifica o documento, como Plano de Ensino.</td></tr><tr><td><code>data_emissao</code></td><td>Registra quando o PDF foi gerado.</td></tr><tr><td><code>codigo_verificador</code></td><td>Guarda o código usado na autenticação.</td></tr><tr><td><code>documento</code></td><td>Aponta para o PDF armazenado.</td></tr><tr><td><code>data_validade</code></td><td>Registra uma validade quando ela foi configurada.</td></tr><tr><td><code>tipo_objeto</code> e <code>modelo_pk</code></td><td>Identificam o model e o registro que originaram o documento.</td></tr><tr><td><code>cancelado</code></td><td>Indica se a emissão deixou de ser aceita.</td></tr></tbody></table></div><p>O par <code>tipo_objeto</code> e <code>modelo_pk</code> permite que o mesmo model de registro se relacione a objetos de modelos diferentes. É essa combinação que liga uma emissão ao Plano de Ensino, ao histórico ou a outra entidade do SUAP.</p><h4>Como o registro é criado</h4><p>A criação normalmente ocorre dentro do decorator <code>@documento</code>, implementado em <code>djtools/utils/__init__.py:1360-1601</code>. Considere esta view:</p><pre class="codebox"><code>@documento(
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
    registro = qs_registro[0]</code></pre><p>Um novo registro é criado quando não há emissão válida ou quando uma das condições abaixo força a geração:</p><pre class="codebox"><code>not qs_registro
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
  return `<div class="lesson"><h2>1. Entenda o caminho de uma requisição</h2><p>Ao acessar uma turma, o Django identifica a rota em <code>urls.py</code> e encaminha a requisição para uma view. A view recupera dados dos models, aplica as regras necessárias e prepara o contexto para o template.</p><img class="diagram" src="fluxo_django_mtv.png" alt="Fluxo de requisição Django"><div class="tip"><strong>Conexão com o EDU:</strong> a função <code>turma(request, pk)</code> consulta o model <code>Turma</code>, recupera matrículas e horários e prepara variáveis para a página.</div><h3>Arquivos para reconhecer</h3><p>Uma tela no SUAP normalmente combina rota, lógica da aplicação, consultas ao banco e apresentação. Reconheça a responsabilidade de cada arquivo para saber onde começar uma investigação.</p><div class="tablewrap"><table><thead><tr><th scope="col">Arquivo ou diretório</th><th scope="col">Responsabilidade no fluxo web</th></tr></thead><tbody>${row("<code>edu/urls.py</code>", "Define as rotas do módulo e determina qual view será executada quando você acessar uma URL. Existe também um <code>urls.py</code> geral da aplicação; cada módulo pode ter seu próprio arquivo de rotas. Pense na URL como o endereço de um guichê: ela encaminha a requisição para o atendimento correto.")}${row("<code>edu/views.py</code>", "Processa a requisição, executa a lógica da aplicação, busca dados e retorna uma resposta. Na prática, a view costuma verificar permissões, buscar objetos no banco e preparar variáveis para o template. A resposta pode ser HTML, PDF, XLS, JSON ou um redirecionamento.")}${row("<code>edu/templates/</code>", "Contém os templates que definem como o conteúdo será apresentado. Eles recebem variáveis preparadas pela view, como <code>obj</code>, <code>title</code>, <code>form</code>, <code>alunos</code>, <code>turnos</code> e <code>diarios_por_sigla</code>, e organizam esses dados em HTML.")}${row("<code>edu/admin.py</code>", "Configura a interface administrativa do Django/SUAP para visualizar, cadastrar, editar e excluir registros, sem criar uma tela administrativa do zero. Observe as configurações de colunas da listagem, filtros, campos de busca, exportação e permissões de exibição.")}${row("<code>edu/forms.py</code>", "Define os formulários usados para entrada de dados. Pode estabelecer campos visíveis, validações, filtros de queryset, organização visual dos campos e processamento dos dados enviados pelo usuário.")}${row("<code>edu/models/</code><br>Exemplo: <code>edu/models/turmas.py</code>", "Define os modelos de dados: entidades gravadas e manipuladas no banco, como <code>Aluno</code>, <code>Turma</code>, <code>Diario</code>, <code>CursoCampus</code> e <code>MatriculaPeriodo</code>. O roteiro apresenta essa responsabilidade como <code>models.py</code>; no EDU, os models estão distribuídos em <code>edu/models/*.py</code>. O arquivo <code>turmas.py</code> contém o model <code>Turma</code> e suas regras.")}</tbody></table></div><div class="tip"><strong>Ao investigar uma manutenção:</strong> siga a rota até a view, identifique os dados e as regras envolvidos e localize o template responsável pela apresentação. Conforme a demanda, consulte também forms, models e admin; raramente um único arquivo explica toda a tela.</div><p class="small muted">As descrições acompanham a organização dos models do EDU apresentada nesta unidade.</p></div>${code("model", "2. Conheça o model Turma", "Observe a declaração dos managers, os campos acadêmicos e os relacionamentos com CursoCampus, Matriz, Turno e CalendarioAcademico.")}${code("matriculados", "3. De onde vêm os alunos?", "Compare os métodos de matrículas diretas e de matrículas relacionadas a diários. Observe filter(), exclude(), select_related() e distinct().")}${code("horarios", "4. Como a turma organiza os horários?", "O método get_horarios() consulta turnos e horários, organiza os dias da semana e considera o semestre informado.")}${code("view", "5. Leia a view turma() comentada", "Use o botão para ocultar comentários e tentar explicar o código com suas próprias palavras. O trecho é uma versão didática comentada da view fornecida.")}${newScreenLesson()}`;
}
function snippet(source) {
  return `<pre class="codebox" style="padding:18px"><code>${escape(source)}</code></pre>`;
}
const httprrExplanation = `<section class="lesson"><h2>Como <code>httprr()</code> funciona</h2><p>O helper está definido em <code>djtools/utils/response.py:47-172</code>. Ele combina duas ações frequentes: mostra uma mensagem ao usuário e redireciona a requisição para outra URL.</p><p>Assinatura da função:</p><pre class="codebox" style="padding:18px"><code>httprr(url, message='', tag='success', anchor='', get_params='', close_popup=False)</code></pre><div class="tablewrap"><table><thead><tr><th>Parâmetro</th><th>Função</th></tr></thead><tbody><tr><td><code>url</code></td><td>Define o destino. <code>'.'</code> mantém a página atual e <code>'..'</code> retorna para a página anterior da navegação.</td></tr><tr><td><code>message</code></td><td>Texto exibido ao usuário após o redirecionamento.</td></tr><tr><td><code>tag</code></td><td>Classifica a mensagem, normalmente como <code>success</code>, <code>warning</code> ou <code>error</code>.</td></tr><tr><td><code>anchor</code></td><td>Adiciona uma âncora ao endereço, como <code>#dados_alunos</code>.</td></tr><tr><td><code>get_params</code></td><td>Acrescenta parâmetros à URL, preservando a aba ativa quando necessário.</td></tr><tr><td><code>close_popup</code></td><td>Indica que a resposta deve fechar uma janela popup em vez de redirecionar a página inteira.</td></tr></tbody></table></div><h3>Exemplos de uso</h3><pre class="codebox" style="padding:18px"><code>return httprr('.', 'Alterações salvas com sucesso.')

return httprr('..', 'Você não tem permissão para realizar isso.', 'error')

return httprr('/edu/turma/123/?tab=dados_alunos',
              'Aluno removido com sucesso.')</code></pre><p>No primeiro exemplo, o usuário permanece na página atual. No segundo, volta para a página anterior e recebe uma mensagem de erro. No terceiro, a view envia o usuário para uma URL específica, já com a aba de alunos selecionada.</p><h3>O que acontece internamente</h3><ol><li>O SUAP obtém a requisição atual para acessar a sessão de mensagens.</li><li>Quando <code>message</code> é informado, a mensagem é registrada com a categoria definida em <code>tag</code>.</li><li>Os parâmetros de consulta, a aba e a âncora são combinados com a URL de destino.</li><li>A função devolve <code>HttpResponseRedirect</code>, que instrui o navegador a abrir o novo endereço.</li></ol><div class="tip"><strong>Leitura prática:</strong> ao encontrar <code>return httprr(...)</code>, identifique primeiro o destino e depois leia a mensagem e a categoria. Essa linha normalmente encerra a execução da view naquele caminho.</div><h3>Quando há popup</h3><p>Com <code>close_popup=True</code> e uma requisição marcada como popup, o helper devolve um pequeno <code>HttpResponse</code> com JavaScript para fechar a janela. Assim, a tela que abriu o formulário pode ser atualizada ou fechada conforme os parâmetros recebidos.</p><p>Por isso, <code>httprr()</code> não é apenas um redirecionamento simples: ele centraliza mensagens, abas, parâmetros, âncoras e o tratamento de janelas popup em um único retorno.</p><h3>Leia o código em camadas</h3><p>Ao estudar a implementação, separe o comportamento em quatro partes:</p><ol><li><strong>Mensagem:</strong> a função interna <code>set_message()</code> escolhe <code>messages.success()</code>, <code>messages.warning()</code> ou <code>messages.error()</code> de acordo com <code>tag</code>.</li><li><strong>Parâmetros:</strong> <code>get_params</code> é normalizado para começar com <code>?</code>, e o parâmetro <code>tab</code> da requisição atual pode ser preservado.</li><li><strong>Popup:</strong> quando a URL contém <code>_popup</code>, o helper pode devolver um script que chama <code>parent.close_fancybox()</code> ou <code>parent.close_fancybox_noreload()</code>.</li><li><strong>Destino:</strong> depois desses tratamentos, <code>.</code> é convertido no caminho atual, <code>..</code> usa <code>breadcrumbs_previous_url(request)</code> e a função acrescenta a âncora antes de criar o redirecionamento.</li></ol><h3>Exemplos com opções adicionais</h3><pre class="codebox" style="padding:18px"><code>return httprr('.',
              'Registro atualizado.',
              anchor='dados_alunos')

return httprr('/edu/turma/123/',
              'Confira os dados pendentes.',
              'warning',
              get_params='?semestre=2')

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
  return `<section class="lesson"><span class="tag">LEITURA DE VIEWS</span><h2>1. Como os decorators participam da execução</h2><p>Em <code>edu/views.py</code>, decorators são funções que envolvem uma view para acrescentar comportamento antes ou depois de sua execução. Leia sempre os decorators antes do corpo da função: eles revelam exigências de acesso, renderização, transação e tipo de resposta.</p>${snippet(decoratorOrderExample)}<ol><li>A permissão é verificada.</li><li>A view é executada.</li><li>O retorno da view é renderizado.</li></ol><div class="tip"><strong>Ordem:</strong> o decorator mais próximo da função é aplicado primeiro. Durante a requisição, porém, o decorator escrito acima costuma interceptar a chamada antes dos demais.</div></section><section class="lesson"><h2>2. <code>@rtr()</code>: dados transformados em tela</h2><p><code>@rtr()</code> é um dos decorators mais importantes do SUAP. Ele renderiza o retorno da view em um template.</p><div class="fileline">Importado em edu/views.py · implementação: djtools/utils/response.py:148</div><ul><li>Sem um template informado, tenta descobri-lo pelo nome da view.</li><li>Com um template informado, renderiza o arquivo específico.</li><li>Se a view já retornar <code>HttpResponse</code>, <code>HttpResponseRedirect</code>, PDF, XLS ou outra resposta pronta, devolve essa resposta sem tentar renderizar outro template.</li></ul><h3>Template descoberto pela convenção</h3>${snippet(rtrImplicitExample)}<h3>Template informado explicitamente</h3>${snippet(rtrExplicitExample)}<div class="tip"><strong>Uma forma de memorizar:</strong> <code>@rtr()</code> pega o envelope de dados retornado pela view e o transforma em tela.</div></section>${code("gettemplate", "Como o SUAP escolhe o template", "Quando @rtr() não recebe um nome, get_template_path() deriva o caminho a partir do módulo e do nome da função.")}${code("rtr", "A implementação real de @rtr()", "Observe a chamada à função decorada, o teste de HttpResponse e a renderização do dicionário retornado.")}<section class="lesson"><h2>3. <code>@permission_required(...)</code>: acesso por permissão</h2><p>Esse decorator verifica se o usuário possui a permissão informada. Caso não possua, levanta <code>PermissionDenied</code>.</p><div class="fileline">Exemplo: edu/views.py:1684 · implementação: djtools/utils/__init__.py:1783</div>${snippet(permissionExamples)}<ul><li>Uma string exige aquela permissão específica.</li><li>Uma lista usa lógica <code>or</code> por padrão: basta possuir uma das permissões.</li><li>Com <code>logic_operator='and'</code>, todas as permissões da lista se tornam obrigatórias.</li></ul><p>Utilize esse decorator quando a regra vier de permissões Django ou das permissões declaradas em <code>permissions.yaml</code>.</p></section><section class="lesson"><h2>4. <code>@group_required(...)</code>: acesso por grupo</h2><p><code>@group_required</code> é semelhante ao decorator de permissão, mas verifica diretamente os grupos do usuário.</p><div class="fileline">Exemplo: edu/views.py:4559 · implementação: djtools/utils/__init__.py:1753</div>${snippet(groupRequiredExample)}<ul><li>Use <code>@group_required</code> quando a regra disser diretamente que determinados perfis ou grupos podem acessar.</li><li>Use <code>@permission_required</code> quando o acesso depender de permissões como <code>edu.view_aluno</code>, <code>edu.change_diario</code> ou <code>edu.gerar_relatorio</code>.</li></ul></section><section class="lesson"><h2>5. <code>@login_required</code>: usuário autenticado</h2><p>Este é o decorator padrão do Django para exigir que o usuário esteja autenticado. As formas com e sem parênteses aparecem no código.</p><div class="fileline">Exemplo: edu/views.py:6204</div>${snippet(loginRequiredExample)}<div class="tablewrap"><table><thead><tr><th>Decorator</th><th>O que exige</th></tr></thead><tbody><tr><td><code>@login_required</code></td><td>Usuário autenticado.</td></tr><tr><td><code>@permission_required</code></td><td>Permissão específica.</td></tr><tr><td><code>@group_required</code></td><td>Pertencimento a grupo específico.</td></tr></tbody></table></div></section><section class="lesson"><h2>6. <code>@documento(...)</code>: HTML transformado em PDF</h2><p><code>@documento</code> transforma o HTML produzido pela view em PDF ou documento.</p><div class="fileline">Exemplo: edu/views.py:1684 · implementação: djtools/utils/__init__.py:1360</div>${snippet(documentoPatternExample)}<ol><li><code>@rtr</code> renderiza o HTML.</li><li><code>@documento</code> transforma o HTML em PDF.</li></ol><h3>Parâmetros importantes</h3><div class="tablewrap"><table><thead><tr><th>Parâmetro</th><th>Efeito</th><th>Referência</th></tr></thead><tbody><tr><td><code>landscape=True</code></td><td>Gera o PDF em modo paisagem.</td><td><code>edu/views.py:6245</code></td></tr><tr><td><code>enumerar_paginas=False</code></td><td>Remove a numeração das páginas.</td><td>Implementação do decorator</td></tr><tr><td><code>validade=30</code></td><td>Adiciona uma mensagem de validade do documento.</td><td>Implementação do decorator</td></tr><tr><td><code>modelo='edu.aluno'</code></td><td>Associa o documento ao model indicado.</td><td>Implementação do decorator</td></tr></tbody></table></div>${snippet(documentoParametersExample)}<h3>Primeiro parâmetro e autenticação</h3><p>Quando o primeiro parâmetro é informado, como em <code>@documento('Qualquer Coisa')</code>, ele se torna o <code>tipo_para_verificacao</code>. O SUAP passa a:</p><ul><li>gerar <code>codigo_verificador</code>;</li><li>inserir o Código de Autenticação no PDF;</li><li>registrar o documento em <code>RegistroEmissaoDocumento</code>;</li><li>permitir a validação em <code>/comum/autenticar_documento/</code>.</li></ul><div class="fileline">Geração do código: djtools/utils/__init__.py:1423 · rodapé: linhas 1500–1508 · registro: linhas 1557–1595</div><p>Para um PDF simples, sem autenticador, utilize <code>@documento()</code> sem o primeiro parâmetro textual.</p>
${forcarRecriacaoExplanation}</section><section class="lesson"><h2>7. <code>@transaction.atomic</code>: consistência das gravações</h2><p>Esse decorator do Django executa as operações de banco da view dentro de uma transação. Se ocorrer um erro, o banco pode realizar rollback.</p><div class="fileline">Referências: edu/views.py:3568 e edu/views.py:3596</div><div class="tip"><strong>Uma forma de memorizar:</strong> ou salva tudo, ou não salva nada. Utilize em ações que gravam dados e precisam manter consistência.</div></section><section class="lesson"><h2>8. <code>@csrf_exempt</code>: exceção à proteção CSRF</h2><p><code>@csrf_exempt</code> remove a exigência do token CSRF para aquela view.</p><div class="fileline">Referência: edu/views.py:4274</div><div class="warn"><strong>Atenção:</strong> CSRF protege requisições POST contra envios maliciosos originados em outros sites. Use essa exceção somente quando houver uma justificativa clara e após avaliar o risco.</div></section><section class="lesson"><h2>9. <code>@documentos.emissao_documentos()</code>: participação em um sinal</h2><p>Este decorator é diferente dos anteriores: não corresponde a uma view comum atendida por uma URL. Ele conecta uma função ao sinal de emissão de documentos. Quando o mecanismo dispara esse sinal, a função decorada participa preenchendo dados ou tratando a emissão.</p><div class="fileline">Exemplo: edu/views.py:481 · implementação: djtools/documentos.py:6</div></section><section class="lesson"><span class="tag">RECURSOS RELACIONADOS</span><h2>Respostas e redirecionamentos</h2><p>Os elementos abaixo não são decorators, mas ajudam a compreender os retornos que <code>@rtr()</code> pode receber e devolver diretamente.</p></section>${code("httprr", "Redirecionamentos com httprr()", "O helper registra mensagens de sucesso ou erro e devolve HttpResponseRedirect; também trata cenários de popup.")}${httprrExplanation}${code("pdfresponse", "Resposta pronta com PDFResponse", "PDFResponse usa o content type application/pdf e permite indicar exibição inline ou download por anexo.")}${pdfresponseExplanation}<section class="lesson"><span class="tag">EXEMPLO PRÁTICO</span><h2>Exemplo Prático: Criar PDF com Dados Gerais do Aluno</h2><p>O objetivo é acrescentar à tela do aluno um botão que gere um PDF com seus dados gerais.</p><ol><li>Criar a URL.</li><li>Adicionar o botão à tela do aluno.</li><li>Criar a view PDF.</li><li>Criar o template PDF.</li><li>Testar o resultado.</li></ol><h3>1. Crie a URL</h3><p>Em <code>edu/urls.py</code>, adicione a rota perto das rotas de documentos do aluno.</p>${snippet(studentPdfRoute)}<ul><li><code>pk</code> é o identificador interno do aluno.</li><li>A URL chama a view <code>dados_gerais_aluno_pdf</code>.</li></ul><h3>2. Adicione o botão à tela do aluno</h3><p>Em <code>edu/templates/aluno.html</code>, adicione o item dentro do bloco <code>action-bar</code>.</p>${snippet(studentPdfButton)}<ul><li><code>obj.pk</code> vem da view <code>aluno</code>.</li><li>O botão aponta para a nova URL.</li><li>Neste exercício, o botão permanece simples para facilitar a compreensão do fluxo.</li><li>Em uma demanda real, avalie quais perfis podem visualizar a ação.</li></ul><h3>3. Crie a view PDF</h3><p>Adicione a função em <code>edu/views.py</code>, próxima de <code>atestadofrequencia_pdf</code>, indicada nas linhas 6944–6976.</p>${snippet(studentPdfView)}<ul><li><code>@login_required</code> exige usuário autenticado.</li><li><code>@documento(...)</code> gera o PDF.</li><li>O texto <code>Dados Gerais do Aluno</code> faz o documento receber código de autenticação.</li><li><code>@rtr('dados_gerais_aluno_pdf.html')</code> renderiza o template antes da conversão.</li><li>As variáveis de permissão foram simplificadas exclusivamente para o treinamento.</li></ul><div class="warn"><strong>Não leve as permissões fixas para uma demanda real.</strong> Não mantenha <code>is_admin = True</code>, <code>pode_ver_cpf = True</code> ou equivalentes em produção. Reaproveite as regras contextuais da view <code>aluno</code> e trabalhe apenas com dados fictícios no treinamento.</div><h3>4. Crie o template PDF</h3><p>Crie o arquivo <code>edu/templates/dados_gerais_aluno_pdf.html</code>. O template completo indicado nesta seção está reproduzido abaixo.</p>${snippet(studentPdfTemplate)}<h3>5. Teste o resultado</h3><ol><li>Abra a tela de um aluno fictício no ambiente de desenvolvimento.</li><li>Verifique se o botão <code>Gerar PDF - Dados Gerais</code> aparece.</li><li>Acione o botão e confirme que o PDF abre.</li><li>Confira se o código de autenticação foi incluído.</li><li>Acrescente <code>?html=1</code> à URL para depurar o HTML antes da conversão em PDF.</li><li>Valide novamente as regras de acesso com perfis permitidos e não permitidos.</li></ol></section><section class="lesson"><span class="tag">FECHAMENTO</span><h2>Leia primeiro os decorators</h2><ul><li>Decorators controlam o comportamento da view.</li><li><code>@rtr</code> transforma dados em HTML.</li><li><code>@documento</code> transforma HTML em PDF.</li><li><code>@documento('Tipo')</code> cria um documento autenticável.</li><li>O template PDF deve ser mais simples que a tela normal.</li><li>Uma simplificação de treinamento nunca substitui as regras cuidadosas exigidas em produção.</li></ul><p><strong>Ao investigar uma view no SUAP, comece pelos decorators:</strong> eles revelam permissões, renderização, transações e o tipo de resposta.</p><p class="small muted">As linhas pertencem ao checkout de referência e devem ser conferidas após mudanças no repositório.</p></section>`;
}
const module3LessonHtml =
  '<section class="panel"><span class="tag">ENCONTRO 3 · EXPLORAÇÃO E DIAGNÓSTICO</span><h2>Da declaração à autorização</h2><p>Compreenda os grupos, siga a sincronização, localize as cinco camadas de checagem e pratique o diagnóstico. Depois, compare os chamados 1144, 1168 e 1157.</p><p>Caminhos e linhas devem ser conferidos no checkout SUAP utilizado no estudo. Os exemplos de alteração devem ser conferidos no checkout de trabalho.</p><div class="warn">As práticas exigem acesso ao repositório SUAP e a um ambiente isolado com dados fictícios. Sem esse acesso, analise os trechos e registre hipóteses e verificações necessárias. Não execute sincronização nem altere permissões em produção. Substitua o marcador de matrícula pela matrícula fictícia do ambiente.</div></section><p>Objetivo: explicar como o SUAP organiza grupos e permissões, como o <code>permissions.yaml</code> alimenta essas permissões e onde elas são verificadas nas telas, menus, views, templates e managers.</p><section class="lesson"><h2>I. Conceito de Grupos no SUAP</h2><p>Compreenda que grupo e uma forma de atribuir um conjunto de permissões a vários usuários.</p><p>Uma forma de compreender: em vez de dar permissão usuário por usuário, o SUAP coloca o usuário em um grupo; o grupo carrega as permissões.</p><h3>1. Observe na tela</h3><p>Na interface administrativa, observe um usuário e seus grupos.</p><p>Observe estas relações:</p><ul><li>Um usuário pode pertencer a vários grupos.</li><li>Um grupo pode ter várias permissões.</li><li>A permissão efetiva do usuário e a soma das permissões dos grupos dele, mais permissões diretas, se existirem.</li></ul><p>Exemplo de grupos no contexto EDU:</p><ul><li><code>Administrador Acadêmico</code>;</li><li><code>Secretário Acadêmico</code>;</li><li><code>Coordenador de Curso</code>;</li><li><code>Organizador de Minicurso</code>;</li><li><code>Diretor Acadêmico</code>.</li></ul><h3>2. Observe no <code>permissions.yaml</code></h3><p>Arquivo: <code>edu/permissions.yaml</code>.</p><p>Observe: o arquivo declara quais permissões cada grupo deve receber.</p><p>Exemplo em <code>edu/permissions.yaml:46-52</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Administrador Acadêmico:\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre><p>Leitura:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Grupo: Administrador Acadêmico\nApp: edu\nModelo: aluno\nPermissao: view_aluno\nPermissao completa: edu.view_aluno</code></pre><p>Ponto importante: o YAML declara permissões para grupos, mas ele não e consultado diretamente por cada tela em tempo real.</p><h3>3. Compreender grupos e permissões</h3><p>Analise a diferenca:</p><ul><li>Grupo: conjunto de usuários com um papel comum.</li><li>Permissão: capacidade de realizar ou visualizar algo no sistema.</li><li>Codename: nome técnico da permissão, como <code>view_aluno</code>.</li><li>Permissão completa: <code>app.codename</code>, como <code>edu.view_aluno</code>.</li></ul><p>Exemplo:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><p>Essa linha pergunta: o usuário logado possui a permissão <code>view_aluno</code> do app <code>edu</code>?</p><h3>4. Compreender o <code>edu/perms.py</code></h3><p>O arquivo <code>edu/perms.py</code> centraliza regras contextuais de autorização do módulo EDU. Ele responde perguntas que uma permissão geral não consegue responder sozinha:</p><ul><li>O usuário pode realizar procedimentos acadêmicos neste curso?</li><li>O usuário pode alterar o e-mail deste aluno?</li><li>O usuário pode realizar procedimentos ENADE?</li><li>O usuário é orientador deste aluno?</li></ul><p>A diferença pode ser resumida assim:</p><div class="tablewrap"><table><thead><tr><th>Arquivo</th><th>Responsabilidade</th></tr></thead><tbody><tr><td><code>permissions.yaml</code></td><td>Declara quais permissões cada grupo recebe.</td></tr><tr><td><code>edu/perms.py</code></td><td>Verifica se o usuário pode agir naquele contexto.</td></tr></tbody></table></div><div class="tip"><strong>Uma forma de lembrar:</strong> o <code>permissions.yaml</code> entrega o crachá; o <code>edu/perms.py</code> verifica onde esse crachá pode ser utilizado.</div><h4>Importação e resultado</h4><p>Nas views, o módulo é importado como:</p><pre class="codebox"><code>from edu import perms</code></pre><p>As funções recebem o usuário e, quando necessário, o objeto que define o contexto. Em geral, retornam <code>True</code> para autorizado e <code>False</code> para não autorizado:</p><pre class="codebox"><code>autorizado = perms.realizar_procedimentos_academicos(\n    request.user,\n    curso_campus\n)</code></pre><h4><code>realizar_procedimentos_academicos</code></h4><div class="fileline">Localização: <code>edu/perms.py:5-27</code></div><p>Essa é uma das funções centrais do arquivo. Ela verifica se o usuário pode realizar procedimentos acadêmicos em determinado curso. A regra pode considerar superusuário, grupos institucionais, setor, campus, coordenação do curso e outras responsabilidades acadêmicas.</p><p>Um trecho simplificado ajuda a acompanhar a lógica:</p><pre class="codebox"><code>def realizar_procedimentos_academicos(user, curso_campus=None):\n    autorizado = False\n\n    if not user.is_anonymous:\n        autorizado = user.is_superuser\n\n        if not autorizado:\n            autorizado = UsuarioGrupo.objects.filter(\n                user=user,\n                group__name__in=[\n                    &#39;Administrador Acadêmico&#39;,\n                    &#39;Diretor Acadêmico Sistêmico&#39;,\n                ]\n            ).exists()\n\n        if not autorizado and curso_campus is not None:\n            autorizado = UsuarioGrupoSetor.objects.filter(\n                usuario_grupo__user=user,\n                usuario_grupo__group__name__in=[\n                    &#39;Secretário Acadêmico&#39;,\n                    &#39;Diretor Acadêmico&#39;,\n                    &#39;Diretor de Ensino&#39;,\n                ],\n                setor=curso_campus.diretoria.setor,\n            ).exists()\n\n    return autorizado</code></pre><p>O detalhe mais importante é a verificação do setor:</p><pre class="codebox"><code>setor=curso_campus.diretoria.setor</code></pre><p>Ela impede que um Secretário Acadêmico de um campus seja automaticamente autorizado a atuar nos cursos de outro campus. A permissão depende do escopo em que o usuário exerce seu papel.</p><p>Em uma view, a regra pode bloquear a operação antes que qualquer alteração seja feita:</p><pre class="codebox"><code>if not perms.realizar_procedimentos_academicos(\n    request.user,\n    aluno.curso_campus,\n):\n    return httprr(\n        &#39;..&#39;,\n        &#39;Você não tem permissão para realizar isso.&#39;,\n        &#39;error&#39;,\n    )</code></pre><h4><code>tem_permissao_realizar_procedimentos</code></h4><div class="fileline">Localização: <code>edu/perms.py:88-89</code></div><p>Essa função auxiliar é útil quando a view já possui um objeto <code>Aluno</code>. Em vez de receber o curso separadamente, ela utiliza <code>aluno.curso_campus</code>:</p><pre class="codebox"><code>def tem_permissao_realizar_procedimentos(user, aluno):\n    return (\n        is_admin(user)\n        or realizar_procedimentos_academicos(\n            user,\n            aluno.curso_campus,\n        )\n    )</code></pre><p>Assim, a view pode centralizar a regra e manter o código de autorização legível:</p><pre class="codebox"><code>aluno = get_object_or_404(Aluno, pk=pk)\n\nif not perms.tem_permissao_realizar_procedimentos(\n    request.user,\n    aluno,\n):\n    return httprr(\n        aluno.get_absolute_url(),\n        &#39;Você não tem permissão.&#39;,\n        &#39;error&#39;,\n    )</code></pre><h4><code>pode_realizar_procedimentos_enade</code></h4><div class="fileline">Localização: <code>edu/perms.py:92-106</code></div><p>Essa função aplica uma regra específica do ENADE. Ela verifica grupos autorizados e também pode considerar se o usuário coordena o curso:</p><pre class="codebox"><code>def pode_realizar_procedimentos_enade(user, curso_campus):\n    if user.is_anonymous:\n        return False\n\n    autorizado = user.is_superuser\n\n    if not autorizado:\n        autorizado = UsuarioGrupo.objects.filter(\n            user=user,\n            group__name__in=[\n                &#39;Administrador Acadêmico&#39;,\n                &#39;Diretor de Avaliação e Regulação do Ensino&#39;,\n                &#39;Operador ENADE&#39;,\n                &#39;Secretário Acadêmico&#39;,\n            ],\n        ).exists()\n\n    return autorizado</code></pre><p>Na tela do aluno, a view combina a autorização com uma condição do próprio objeto:</p><pre class="codebox"><code>pode_realizar_procedimentos_enade = (\n    perms.pode_realizar_procedimentos_enade(\n        request.user,\n        obj.curso_campus,\n    )\n    and not obj.is_concluido()\n)</code></pre><p>O resultado pode ser enviado ao template para controlar a apresentação:</p><pre class="codebox"><code>{% if pode_realizar_procedimentos_enade %}\n    &lt;a href="/edu/lancar_situacao_enade/{{ registro.pk }}/"&gt;\n        Lançar Situação\n    &lt;/a&gt;\n{% endif %}</code></pre><p>A view pergunta se o usuário está autorizado e se o aluno ainda pode participar da operação. O template apenas apresenta a opção quando o resultado permite.</p><h4><code>pode_alterar_email</code></h4><div class="fileline">Localização: <code>edu/perms.py:121-130</code></div><p>Essa função verifica se o usuário pode alterar o e-mail de um aluno. A regra pode envolver Coordenador de TI sistêmico, Coordenador de TI do campus, Coordenador de Registros Acadêmicos e usuários autorizados a realizar procedimentos acadêmicos.</p><pre class="codebox"><code>pode_alterar_email = perms.pode_alterar_email(\n    request,\n    obj,\n)</code></pre><p>O template pode usar a variável para mostrar o link:</p><pre class="codebox"><code>{% if pode_alterar_email %}\n    &lt;a href="/edu/alterar_email_aluno/{{ obj.pk }}/"&gt;\n        Alterar E-mail\n    &lt;/a&gt;\n{% endif %}</code></pre><h4>Funções de relacionamento com o aluno</h4><p>O arquivo também possui funções que verificam a relação do usuário com determinado aluno:</p><ul><li><code>perms.is_proprio_aluno(request, aluno)</code></li><li><code>perms.is_orientador(request, aluno)</code></li><li><code>perms.is_coorientador(request, aluno)</code></li><li><code>perms.is_examinador(request, aluno)</code></li><li><code>perms.is_presidente(request, aluno)</code></li></ul><p>Essas funções permitem combinar a permissão institucional com uma relação direta com o aluno. Por exemplo, uma tela de projeto final pode autorizar gestores acadêmicos, orientadores, coorientadores ou examinadores:</p><pre class="codebox"><code>pode_visualizar = (\n    perms.tem_permissao_realizar_procedimentos(\n        request.user,\n        aluno,\n    )\n    or perms.is_orientador(request, aluno)\n    or perms.is_coorientador(request, aluno)\n    or perms.is_examinador(request, aluno)\n)</code></pre><h4>View, template e proteção da URL</h4><p>A view pode calcular uma variável para orientar a interface:</p><pre class="codebox"><code>@rtr()\ndef aluno_exemplo(request, pk):\n    aluno = get_object_or_404(Aluno, pk=pk)\n\n    pode_editar = perms.realizar_procedimentos_academicos(\n        request.user,\n        aluno.curso_campus,\n    )\n\n    return locals()</code></pre><p>O template pode usar o resultado:</p><pre class="codebox"><code>{% if pode_editar %}\n    &lt;a class="btn primary" href="/edu/editar_aluno/{{ aluno.pk }}/"&gt;\n        Editar\n    &lt;/a&gt;\n{% endif %}</code></pre><p>Essa condição melhora a interface, mas não protege sozinha a operação. A view que atende a URL de edição também deve verificar a autorização:</p><pre class="codebox"><code>@rtr()\ndef editar_aluno(request, pk):\n    aluno = get_object_or_404(Aluno, pk=pk)\n\n    if not perms.realizar_procedimentos_academicos(\n        request.user,\n        aluno.curso_campus,\n    ):\n        return httprr(\n            aluno.get_absolute_url(),\n            &#39;Você não tem permissão para editar este aluno.&#39;,\n            &#39;error&#39;,\n        )\n\n    # Continuação da operação</code></pre><div class="warn"><strong>Ponto essencial:</strong> ocultar o botão no template melhora a experiência da tela; a validação na view é o que impede o acesso direto pela URL.</div><h4>Não confunda os dois usos de <code>perms</code></h4><p>No código Python, <code>perms</code> é o módulo do EDU:</p><pre class="codebox"><code>from edu import perms\nperms.pode_alterar_email(request, aluno)</code></pre><p>No template, <code>perms</code> representa as permissões Django disponíveis para o usuário:</p><pre class="codebox"><code>{% if perms.edu.view_aluno %}\n    ...\n{% endif %}</code></pre><p>Essa condição equivale conceitualmente a:</p><pre class="codebox"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><div class="tablewrap"><table><thead><tr><th>Uso</th><th>Significado</th></tr></thead><tbody><tr><td><code>perms.pode_alterar_email(...)</code></td><td>Chama uma função contextual de <code>edu/perms.py</code>.</td></tr><tr><td><code>perms.edu.view_aluno</code></td><td>Consulta uma permissão Django atribuída ao usuário.</td></tr></tbody></table></div><h4>Por que centralizar essas regras?</h4><p>O <code>edu/perms.py</code> evita repetir decisões complexas em várias views e ajuda a manter o mesmo comportamento em telas diferentes. Ele considera campus, setor, curso e relação com o aluno, reduzindo o risco de um usuário atuar fora do próprio escopo.</p><p>Antes de alterar uma função, pesquise onde ela é usada:</p><pre class="codebox"><code>rg "realizar_procedimentos_academicos" edu/</code></pre><p>Uma mudança nesse arquivo pode afetar diversas telas, models e operações acadêmicas.</p><div class="tip"><strong>Resumo do fluxo:</strong> <code>permissions.yaml</code> define a permissão geral; <code>edu/perms.py</code> aplica a regra ao contexto; a view bloqueia ou libera a operação; e o template mostra ou oculta as opções.</div></section><section class="lesson">\n<h2>II. Como o <code>permissions.yaml</code> vira permissão no banco</h2>\n<p>O arquivo <code>permissions.yaml</code> declara quais permissões cada grupo deve possuir. Ele não é consultado diretamente quando o usuário acessa uma tela. Antes disso, suas informações são convertidas e gravadas nas tabelas de grupos e permissões do Django.</p>\n<div class="permission-flow" aria-label="Fluxo de sincronização das permissões"><div class="permission-step permission-source"><span class="permission-number">1</span><strong><code>permissions.yaml</code></strong><small>fonte de configuração</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-process"><span class="permission-number">2</span><strong><code>sync_permissions</code></strong><small>comando de sincronização</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step"><span class="permission-number">3</span><strong>Leitura e conversão</strong><small>o YAML é interpretado</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">4</span><strong>Grupos e permissões Django</strong><small>associações preparadas</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">5</span><strong>Banco de dados</strong><small>informações persistidas</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-check"><span class="permission-number">6</span><strong><code>user.has_perm(...)</code></strong><small>permissão verificada pela tela</small></div></div>\n<h3>1. Declaração no YAML</h3>\n<p>Exemplo em <code>edu/permissions.yaml:1-8</code>:</p>\n<pre class="codebox"><code>Administrador Acadêmico:\n  description: Usuários deste grupo possuem visão sistêmica.\n  edu:\n    planoensino:\n    - view_planoensino\n    - delete_planoensino</code></pre>\n<p>Outro exemplo, relacionado ao aluno:</p>\n<pre class="codebox"><code>Administrador Acadêmico:\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre>\n<p>A estrutura segue esta hierarquia:</p>\n<pre class="codebox"><code>Nome do grupo\n    Aplicativo\n        Modelo\n            Permissões</code></pre>\n<p>No segundo exemplo:</p>\n<ul><li><strong>Grupo:</strong> Administrador Acadêmico</li><li><strong>Aplicativo:</strong> <code>edu</code></li><li><strong>Modelo:</strong> <code>aluno</code></li><li><strong>Codename:</strong> <code>view_aluno</code></li></ul>\n<p>Durante o processamento, a permissão é representada internamente como <code>edu.aluno.view_aluno</code>. Nas verificações normais do Django, ela é consultada como <code>edu.view_aluno</code>.</p>\n<h3>2. Execução do <code>sync_permissions</code></h3>\n<p>O comando responsável pela sincronização está em <code>djtools/management/commands/sync_permissions.py</code>.</p>\n<p>Use:</p>\n<pre class="codebox"><code>python manage.py sync_permissions</code></pre>\n<p>Para processar apenas o EDU:</p>\n<pre class="codebox"><code>python manage.py sync_permissions edu</code></pre>\n<p>Para verificar os arquivos sem alterar o banco:</p>\n<pre class="codebox"><code>python manage.py sync_permissions --check</code></pre>\n<p>O comando percorre as aplicações instaladas e procura o arquivo definido por:</p>\n<pre class="codebox"><code>permissionFileName = f&#39;{app}/permissions.yaml&#39;</code></pre>\n<p>Esse trecho está em <code>djtools/management/commands/sync_permissions.py:134-145</code>. Para o módulo EDU, o arquivo localizado será <code>edu/permissions.yaml</code>.</p>\n<h3>3. Leitura do YAML</h3>\n<p>A leitura é feita pela classe <code>GroupPermission</code>, em <code>djtools/management/permission.py:63-126</code>:</p>\n<pre class="codebox"><code>with open(nome_arquivo_permissao) as arquivo:\n    dados = yaml.safe_load(arquivo)</code></pre>\n<p>Depois, o código percorre cada grupo, aplicativo, modelo e permissão:</p>\n<pre class="codebox"><code>for group_name, group_detail in dados.items():\n    for model_app_name, models in group_detail.items():\n        for model_name, permissions in models.items():\n            for permission_name in permissions:\n                permissao = Permissao(\n                    model_app_name,\n                    model_name,\n                    permission_name\n                )</code></pre>\n<p>A classe <code>Permissao</code> transforma os dados em uma identificação única:</p>\n<pre class="codebox"><code>self.nome = f&#39;{model_app}.{model_name}.{permission_name}&#39;</code></pre>\n<p>Assim, a declaração <code>edu → aluno → view_aluno</code> vira <code>edu.aluno.view_aluno</code>.</p>\n<h3>4. Limpeza das permissões anteriores</h3>\n<p>Antes de reconstruir as associações, o comando remove as permissões atuais dos grupos declarados no YAML. Isso acontece em <code>djtools/management/commands/sync_permissions.py:178-186</code>:</p>\n<pre class="codebox"><code>def limpar_permissoes_dos_grupos(self, group_permission):\n    for grupo in group_permission.obter_grupos():\n        grupo_db = Group.objects.filter(\n            name=grupo.nome\n        ).first()\n\n        if grupo_db:\n            grupo_db.permissions.clear()</code></pre>\n<p>Portanto, a sincronização:</p>\n<ol><li>limpa as permissões atuais do grupo;</li><li>lê novamente o <code>permissions.yaml</code>;</li><li>recria as associações declaradas.</li></ol>\n<div class="tip">Ao remover uma permissão do YAML e executar o comando, a associação também é removida do grupo no banco. A permissão pode continuar existindo na tabela <code>auth_permission</code>; o que deixa de existir é o vínculo com aquele grupo.</div>\n<h3>5. Criação ou localização do grupo</h3>\n<p>Depois da leitura, o comando chama <code>sync_groups_and_permissions(...)</code>, em <code>djtools/utils/__init__.py:1650-1729</code>. Para cada grupo:</p>\n<pre class="codebox"><code>group, created = Group.objects.get_or_create(\n    name=group_name\n)</code></pre>\n<p>O código procura o grupo pelo nome, reutiliza o registro existente ou cria um novo. Os grupos ficam na tabela <code>auth_group</code>.</p>\n<pre class="codebox"><code>id: 25\nname: Administrador Acadêmico</code></pre>\n<h3>6. Localização da permissão Django</h3>\n<p>A identificação interna é separada em três partes:</p>\n<pre class="codebox"><code>ct_app_label, ct_model, p_codename = p.split(&#39;.&#39;)</code></pre>\n<p>Para <code>edu.aluno.view_aluno</code>:</p>\n<ul><li><code>ct_app_label = edu</code></li><li><code>ct_model = aluno</code></li><li><code>p_codename = view_aluno</code></li></ul>\n<p>Depois, o comando procura a permissão:</p>\n<pre class="codebox"><code>Permission.objects.get(\n    content_type__app_label=ct_app_label,\n    content_type__model=ct_model,\n    codename=p_codename\n)</code></pre>\n<p>Esse trecho está em <code>djtools/utils/__init__.py:1686-1693</code>. A permissão fica em <code>auth_permission</code>, relacionada ao model por <code>django_content_type</code>.</p>\n<h3>7. Permissões padrão e personalizadas</h3>\n<p>O Django cria permissões padrão para os models, como:</p>\n<pre class="codebox"><code>add_aluno\nchange_aluno\ndelete_aluno\nview_aluno</code></pre>\n<p>Permissões personalizadas, como <code>view_dados_academicos</code>, <code>emitir_boletim</code> e <code>gerar_relatorio</code>, normalmente são declaradas no <code>Meta.permissions</code> de um model e criadas pelas migrações ou pelo processo de criação de permissões.</p>\n<div class="warn">Se uma permissão personalizada estiver no YAML, mas não existir em <code>auth_permission</code>, o <code>sync_permissions</code> apresentará erro.</div>\n<h3>8. Associação entre grupo e permissão</h3>\n<p>Depois de localizar o grupo e a permissão, o vínculo é criado com:</p>\n<pre class="codebox"><code>group.permissions.add(perm)</code></pre>\n<p>Esse trecho está em <code>djtools/utils/__init__.py:1714-1718</code>. A associação é gravada em <code>auth_group_permissions</code>.</p>\n<pre class="codebox"><code>group_id: 25\npermission_id: 840</code></pre>\n<p>Isso significa que o grupo Administrador Acadêmico possui a permissão <code>edu.view_aluno</code>.</p>\n<h3>9. Descrição do grupo</h3>\n<p>Quando o YAML possui uma descrição, como:</p>\n<pre class="codebox"><code>description: Usuários deste grupo possuem visão sistêmica.</code></pre>\n<p>O texto é armazenado pelo model <code>GroupDetail</code>:</p>\n<pre class="codebox"><code>GroupDetail.objects.update_or_create(\n    group=group,\n    app=app,\n    defaults={\n        &#39;descricao&#39;: descricao,\n        &#39;app_manager&#39;: managers.get(group_name)\n    }\n)</code></pre>\n<p>Esse processamento está em <code>djtools/utils/__init__.py:1709-1713</code>. A descrição documenta e organiza o grupo; ela não concede nenhuma permissão.</p>\n<h3>10. Associação entre usuário e grupo</h3>\n<p>O <code>permissions.yaml</code> associa permissões aos grupos, mas não coloca usuários nesses grupos. Essa relação fica em <code>auth_user_groups</code>, representada no SUAP pelo model <code>UsuarioGrupo</code>, em <code>comum/models.py:3714-3723</code>:</p>\n<pre class="codebox"><code>class UsuarioGrupo(models.ModelPlus):\n    user = models.ForeignKeyPlus(User, on_delete=models.CASCADE)\n    group = models.ForeignKeyPlus(Group, on_delete=models.CASCADE)</code></pre>\n<p>O caminho completo é:</p>\n<div class="permission-flow permission-flow-compact" aria-label="Relação entre usuário, grupo e permissão"><div class="permission-step"><span class="permission-number">1</span><strong><code>auth_user</code></strong><small>usuário</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step"><span class="permission-number">2</span><strong><code>auth_user_groups</code></strong><small>vínculo do usuário com o grupo</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">3</span><strong><code>auth_group</code></strong><small>grupo</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">4</span><strong><code>auth_group_permissions</code></strong><small>vínculo entre grupo e permissão</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">5</span><strong><code>auth_permission</code></strong><small>permissão Django</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">6</span><strong><code>django_content_type</code></strong><small>aplicativo e model relacionados</small></div></div>\n<h3>11. Como a permissão é verificada</h3>\n<p>Depois da sincronização, as telas consultam o banco, não o YAML.</p>\n<p>Na view:</p>\n<pre class="codebox"><code>if request.user.has_perm(&#39;edu.view_aluno&#39;):\n    # Usuário autorizado</code></pre>\n<p>Com decorator:</p>\n<pre class="codebox"><code>@permission_required(&#39;edu.view_aluno&#39;)\ndef aluno(request, pk):\n    ...</code></pre>\n<p>No template:</p>\n<pre class="codebox"><code>{% if perms.edu.view_aluno %}\n    &lt;a href="/edu/aluno/{{ aluno.pk }}/"&gt;\n        Visualizar aluno\n    &lt;/a&gt;\n{% endif %}</code></pre>\n<p>A verificação segue este raciocínio:</p>\n<div class="permission-flow permission-flow-compact" aria-label="Verificação de uma permissão"><div class="permission-step permission-source"><span class="permission-number">1</span><strong>O usuário pertence a algum grupo?</strong><small>o vínculo é consultado</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-database"><span class="permission-number">2</span><strong>O grupo possui <code>edu.view_aluno</code>?</strong><small>a associação é verificada</small></div><div class="permission-arrow" aria-hidden="true">↓</div><div class="permission-step permission-check"><span class="permission-number">3</span><strong><code>has_perm</code> retorna <code>True</code></strong><small>a tela reconhece o usuário como autorizado</small></div></div>\n<h3>12. Exemplo completo</h3>\n<p>Considere esta declaração:</p>\n<pre class="codebox"><code>Organizador de Minicurso:\n  edu:\n    aluno:\n    - view_aluno</code></pre>\n<p>Depois de executar <code>python manage.py sync_permissions edu</code>, o sistema:</p>\n<ol><li>lê o grupo Organizador de Minicurso;</li><li>converte a declaração em <code>edu.aluno.view_aluno</code>;</li><li>cria ou localiza o grupo em <code>auth_group</code>;</li><li>localiza <code>view_aluno</code> em <code>auth_permission</code>;</li><li>localiza o model <code>edu.aluno</code> em <code>django_content_type</code>;</li><li>grava a relação em <code>auth_group_permissions</code>;</li><li>permite que usuários do grupo obtenham <code>True</code> em <code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code>.</li></ol>\n<h3>Resumo</h3>\n<ul><li><code>permissions.yaml</code> declara as permissões.</li><li><code>GroupPermission</code> interpreta o arquivo.</li><li><code>sync_permissions</code> limpa e sincroniza as associações.</li><li><code>auth_group</code> guarda os grupos.</li><li><code>auth_permission</code> guarda as permissões.</li><li><code>auth_group_permissions</code> liga grupos e permissões.</li><li><code>auth_user_groups</code> liga usuários aos grupos.</li><li><code>has_perm</code> consulta o resultado final.</li></ul>\n<div class="tip"><strong>Ponto principal:</strong> o <code>permissions.yaml</code> não é consultado a cada acesso. Ele é uma fonte de configuração usada para sincronizar grupos e permissões com o banco de dados.</div>\n</section><section class="lesson"><h2>III. Como as Telas Checam Permissões</h2><h3>1. Na view com <code>has_perm</code></h3><p>Exemplo em <code>edu/views.py:11270-11275</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>if (\n    not request.user.has_perm(&#39;edu.efetuar_matricula&#39;)\n    and not request.user.has_perm(&#39;edu.gerar_relatorio&#39;)\n    and not request.user.has_perm(&#39;edu.view_aluno&#39;)\n):\n    return httprr(&#39;/&#39;, &#39;Você não tem permissão para acessar essa página&#39;, &#39;error&#39;)</code></pre><p>Explicação:</p><ul><li>A view verifica permissões diretamente.</li><li>Se o usuário não tiver nenhuma das permissões aceitas, ele e bloqueado.</li></ul><p>Outro exemplo importante: tela do aluno em <code>edu/views.py:4703</code>.</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>request.user.has_perm(&#39;edu.view_aluno&#39;)</code></pre><h3>2. No template com <code>perms.edu.view_aluno</code></h3><p>Exemplo em <code>edu/templates/relatorio.html:159-161</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if perms.edu.view_aluno %}\n    &lt;a target=&quot;_blank&quot; href=&quot;{{ aluno.get_absolute_url }}&quot;&gt;{{ aluno.matricula }}&lt;/a&gt;\n{% else %}\n    {{ aluno.matricula }}\n{% endif %}</code></pre><p>Explicação:</p><ul><li>Se o usuário tem permissão, o template mostra um link.</li><li>Se não tem, mostra apenas a matrícula.</li><li>Isso controla apresentacao, não substitui a validacao na view de destino.</li></ul><h3>3. No menu</h3><p>Arquivo: <code>edu/menu.yaml:8-11</code>.</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Ensino::Alunos e Professores::Alunos:\n  permissions_required:\n  - edu.view_aluno\n  url: /admin/edu/aluno/correntes</code></pre><p>Explicação:</p><ul><li>A permissão controla se o item de menu aparece.</li><li>Se o usuário não tem <code>edu.view_aluno</code>, o menu não deve ser exibido.</li><li>Mas esconder menu não bloqueia URL direta; a view/admin também precisa validar.</li></ul><h3>4. Em decorators</h3><p>Exemplo em <code>edu/views.py:11837-11839</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>@rtr()\n@permission_required(&#39;edu.view_convocacaoenade&#39;)\ndef convocados_enade(request, pk, curso_campus_pk):</code></pre><p>Explicação:</p><ul><li>O decorator verifica a permissão antes de executar a view.</li><li>Se o usuário não possuir a permissão, a view não roda.</li></ul><h3>5. Em managers/querysets</h3><p>Exemplo em <code>edu/managers.py:671-681</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>if user.groups.filter(permissions__codename=&#39;view_aluno&#39;).count() == 1:\n    ...\n    return qs.filter(polo__id__in=ids)</code></pre><p>Explicação:</p><ul><li>A permissão também pode influenciar o conjunto de objetos visiveis.</li><li>Aqui, a regra afeta quais alunos aparecem para determinado perfil.</li></ul></section><section class="lesson"><h2>IV. Como Analisar Demandas de Permissão</h2><p>Use este checklist:</p><ol><li>A permissão existe no <code>permissions.yaml</code>?</li><li>O grupo correto recebeu essa permissão?</li><li>O <code>sync_permissions</code> foi executado?</li><li>A view, template, menu ou manager realmente consulta essa permissão?</li><li>Existe regra contextual adicional em <code>views.py</code>, <code>perms.py</code> ou managers?</li><li>A mudanca envolve dados pessoais ou acadêmicos sensiveis?</li><li>Esconder botão e suficiente ou a URL também precisa ser bloqueada?</li></ol><p>Uma forma de compreender: permissão no SUAP raramente está em um unico lugar; ela pode estar declarada no YAML, aplicada pelo sync, checada na view, filtrada no manager e exibida no template.</p></section><section class="lesson"><h2>V. Exemplos Praticos</h2><h3>1. Remover acesso aos detalhes da tela do aluno</h3><p>Tela de exemplo:</p><ul><li><code>http://localhost:8000/edu/aluno/&lt;matricula_ficticia&gt;/</code></li></ul><p>Perfil sugerido:</p><ul><li><code>Secretário Acadêmico</code>.</li></ul><p>Roteiro:</p><ol><li>Observe o usuário com permissão.</li><li>Abrir a tela do aluno e confirmar que o acesso funciona.</li><li>Localizar o grupo no <code>edu/permissions.yaml</code>.</li><li>Remover temporariamente a permissão relacionada, por exemplo <code>view_aluno</code>.</li><li>Rodar <code>sync_permissions</code>.</li><li>Testar novamente com o mesmo usuário.</li><li>Compreender se o bloqueio veio da view, do menu, do manager ou de outra regra.</li></ol><p>Ponto de cuidado: remover <code>view_aluno</code> pode afetar várias telas, links e consultas, não apenas a tela de detalhe.</p><h3>2. Remover botão <code>Adicionar Aluno</code> do admin de aluno</h3><p>Tela:</p><ul><li><code>http://localhost:8000/admin/edu/aluno/</code></li></ul><p>Perfil sugerido:</p><ul><li><code>Secretário Acadêmico</code>.</li></ul><p>Roteiro:</p><ol><li>Observe o usuário com permissão.</li><li>Abrir o admin de aluno e observar o botão <code>Adicionar Aluno</code>.</li><li>Identificar qual permissão controla adição de aluno, normalmente <code>edu.add_aluno</code>.</li><li>Remover temporariamente essa permissão do grupo no <code>permissions.yaml</code>.</li><li>Rodar <code>sync_permissions</code>.</li><li>Testar novamente.</li><li>Compreender que o admin do Django usa permissões <code>add</code>, <code>change</code>, <code>delete</code> e <code>view</code> para controlar botões e ações.</li></ol><p>Ponto de cuidado: remover <code>add_aluno</code> não deve ser tratado como mudanca visual; e uma alteração de permissão real no admin.</p></section><section class="lesson"><h2>VI. Chamados Atendidos</h2><h3>1. Issue 1144: permissões para <code>Organizador de Minicurso</code></h3><p>Contexto: o grupo <code>Organizador de Minicurso</code> precisava visualizar dados de aluno.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/permissions.yaml:2101-2107</code></li></ul><p>Estado atual:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>Organizador de Minicurso:\n  description: Usuários deste grupo gerenciam os minicursos.\n  edu:\n    aluno:\n    - view_aluno\n    - view_dados_academicos\n    - view_dados_pessoais</code></pre><p>Compreender:</p><ul><li><code>edu.view_aluno</code>: permite passar por verificacoes gerais de visualizacao de aluno.</li><li><code>edu.view_dados_academicos</code>: participa da regra <code>pode_ver_dados_academicos</code> em <code>edu/views.py:4666-4672</code>.</li><li><code>edu.view_dados_pessoais</code>: aparece em condições de template, por exemplo <code>edu/templates/aluno.html:402-407</code>.</li></ul><p>Observe a condição no template:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if perms.edu.view_dados_pessoais or is_proprio_aluno %}</code></pre><p>Cuidado: conceder acesso a dados pessoais e acadêmicos amplia acesso a informações sensiveis. A análise deve registrar grupo, motivo, telas afetadas e escopo.</p><h3>2. Issue 1168: <code>Secretário Acadêmico</code> na aba ENADE</h3><p>Contexto: a demanda não foi resolvida apenas no <code>permissions.yaml</code>; ela alterou uma regra contextual em <code>edu/perms.py</code>.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/perms.py:92-106</code></li></ul><p>Ponto central:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>autorizado = UsuarioGrupo.objects.filter(\n    user=user,\n    group__name__in=[\n        &#39;Administrador Acadêmico&#39;,\n        &#39;Diretor de Avaliação e Regulação do Ensino&#39;,\n        &#39;Operador ENADE&#39;,\n        &#39;Secretário Acadêmico&#39;,\n    ],\n).exists()</code></pre><p>Na tela do aluno, examine <code>edu/views.py:5099-5101</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>pode_realizar_procedimentos_enade = perms.pode_realizar_procedimentos_enade(request.user, obj.curso_campus) and not obj.is_concluido()</code></pre><p>No template da aba ENADE, examine <code>edu/templates/tabs/aluno_convocacoes_enade.html:17-18</code>:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if pode_realizar_procedimentos_enade or is_coordenador %}\n    &lt;th class=&quot;no-print&quot;&gt;Opções&lt;/th&gt;\n{% endif %}</code></pre><p>Explicação:</p><ul><li><code>permissions.yaml</code> diz quais permissões o grupo tem.</li><li><code>pode_realizar_procedimentos_enade</code> decide se o usuário pode realizar procedimentos ENADE naquele curso.</li><li>O template decide se mostra opções de acao.</li></ul><h3>3. Issue 1157: remover opção <code>Documentos</code> para alunos especiais</h3><p>Contexto: a issue removeu o botão/menu <code>Documentos</code> para alunos especiais.</p><p>Localize e analise a alteração correspondente no repositório SUAP:</p><ul><li>Alteração correspondente à issue</li></ul><p>Arquivo:</p><ul><li><code>edu/templates/aluno.html:188-195</code></li></ul><p>Condicao atual:</p><div class="fileline">Trecho reproduzido do roteiro · reticências indicam conteúdo omitido</div><pre class="codebox" style="padding:18px"><code>{% if not obj.aluno_especial %}\n    &lt;a class=&quot;btn default&quot; href=&quot;#&quot;&gt;Documentos&lt;/a&gt;\n{% endif %}</code></pre><p>Explicação:</p><ul><li>Este caso tem relação com permissão porque muda a experiencia de acesso conforme perfil/situação do aluno.</li><li>Mas isso e apenas controle visual.</li><li>Os links internos continuam no bloco abaixo, em <code>urls_documentos</code>.</li><li>Se a regra precisa impedir acesso direto ao documento, deve existir validacao na view do documento, não apenas no template.</li></ul></section><section class="lesson"><h2>VII. Fechamento</h2><p>Revise as responsabilidades:</p><ul><li><code>permissions.yaml</code> declara permissões dos grupos.</li><li><code>sync_permissions</code> grava essas permissões no banco.</li><li><code>has_perm</code>, decorators, templates, menus e managers consultam essas permissões.</li><li><code>perms.py</code> trata regras contextuais.</li><li>Template pode esconder um botão, mas não deve ser a unica proteção.</li></ul><p>Ao investigar um chamado: para resolver chamado de permissão com seguranca, siga o caminho completo: grupo -&gt; YAML -&gt; sync -&gt; checagem -&gt; regra contextual -&gt; tela.</p></section><section class="lesson"><h2>Validação dos experimentos e limites dos trechos</h2><p>Antes dos exercícios, confira se <code>sync_permissions</code> remove associações ausentes do YAML. O trecho <code>group.permissions.add(perm)</code>, sozinho, demonstra apenas adição. Não presuma que editar o YAML revoga automaticamente o acesso.</p><p>Uma permissão pode vir de outro grupo ou de uma atribuição direta. Registre os grupos e as permissões efetivas do perfil de teste e confira-os após a sincronização. Teste também a URL direta, além do menu ou botão.</p><p>Depois de cada experimento, restaure o YAML e as associações alteradas, sincronize conforme o procedimento confirmado no checkout e teste novamente. Entregue um registro com perfil, estado inicial, alteração, camada responsável, resultado esperado, resultado observado e confirmação da restauração.</p><p>No manager, <code>count() == 1</code> testa uma contagem específica de grupos usando o codename. Não equivale, por si só, a <code>user.has_perm()</code>; examine o filtro por polo e a implementação completa.</p><p>No caso ENADE, acompanhe também <code>not obj.is_concluido()</code> na view e a alternativa <code>is_coordenador</code> no template. A lista de grupos é um recorte: confira todas as restrições por curso e campus.</p><p>No caso Documentos, o link e a condição são o recorte do roteiro. Examine o bloco completo, <code>urls_documentos</code> e as views de destino para verificar o acesso direto.</p><h3>Para consultar depois</h3><p>Use os caminhos e as referências desta unidade como índice de investigação no VSCode. Compare os merges indicados com o checkout de trabalho antes de concluir qual comportamento está vigente.</p></section>';
function module3() {
  return (
    module3LessonHtml +
    code(
      "view",
      "Complemento: permissões na view turma()",
      "Localize has_group_cached(), pode_realizar_procedimentos e a verificação antes da remoção de alunos.",
    ) +
    code(
      "remover",
      "Complemento: autorização no model",
      "O método verifica pode_remover_da_turma() e pode_ser_excluido_do_diario() antes de alterar vínculos; nem todos os registros recebidos precisam ser removidos.",
    )
  );
}
function enhanceFormDiagrams() {
  document.querySelectorAll(".forms-content .form-code.form-diagram").forEach((panel) => {
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
  const index = `<nav class="forms-index" aria-label="Índice de Forms e relatórios"><h2>Índice do conteúdo</h2><p>Use este índice para consultar os principais blocos da página.</p><div class="forms-index-grid"><a href="#forms-fundamentos"><strong>1.</strong> Fundamentos de Forms</a><a href="#forms-relacoes"><strong>2.</strong> Relação entre as camadas</a><a href="#forms-recursos"><strong>3.</strong> Recursos específicos do SUAP</a><a href="#forms-atividades"><strong>4.</strong> Atividades práticas</a><a href="#forms-revisao"><strong>5.</strong> Erros, testes e revisão</a><a href="#forms-referencias"><strong>6.</strong> Referências</a></div></nav>`;
  return `<section class="panel"><span class="tag">ENCONTRO 04 · FORMS E RELATÓRIOS</span><h2>Do dado enviado ao relatório final</h2><p>Estude como o SUAP recebe dados, valida formulários, consulta models, edita registros e gera relatórios ou PDFs.</p><div class="tip"><strong>Como estudar:</strong> escolha um exemplo, siga o diagrama, copie o trecho de código e confira cada camada antes de executar qualquer alteração.</div></section>${index}<div class="forms-content">${content}</div>`;
}
function enhanceFormsIndex() {
  const targets = [
    ["D.", "forms-fundamentos"],
    ["E.", "forms-relacoes"],
    ["F.", "forms-relacoes"],
    ["G.", "forms-relacoes"],
    ["H.", "forms-recursos"],
    ["I.", "forms-atividades"],
    ["J.", "forms-revisao"],
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
function modulePage(m) {
  return `<div class="sectionhead"><span class="eyebrow">MÓDULO ${m.num} · ESTUDO GUIADO</span><h1>${m.name}</h1><p>${m.desc}</p><div class="bar"><div style="width:${modulePercent(m)}%"></div></div><span class="muted small">${moduleDone(m)}/${moduleTotal(m)} etapas concluídas</span></div><section class="panel"><h3>Ao terminar este módulo, você será capaz de:</h3><ul>${m.goals.map((g) => `<li>${g}</li>`).join("")}</ul></section>${m.id === "m1" ? module1() : m.id === "m2" ? module2() : m.id === "m3" ? module3() : module4()}${challengeArea(m.id)}${tasks(m)}${quiz(m)}${notesBlock(m.id)}<div class="panel"><h3>Continue seus estudos</h3><button class="btn" data-page="${m.id === "m1" ? "m2" : m.id === "m2" ? "m3" : m.id === "m3" ? "m4" : "roadmap"}">${m.id === "m4" ? "Ver próximos encontros" : "Ir para o próximo módulo"} →</button></div>`;
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
  return `<div class="sectionhead"><span class="eyebrow">TRILHA COMPLETA</span><h1>Próximos encontros</h1><p>O plano de curso prevê seis encontros de 2 horas, totalizando 12 horas. Os quatro primeiros encontros já estão disponíveis; os materiais detalhados dos encontros 5 e 6 serão incorporados posteriormente.</p></div><div class="panel"><span class="tag">ENCONTRO 04 · DISPONÍVEL</span><h2>Forms e relatórios do SUAP</h2><p>Formulários, validações, filtros e geração de relatórios.</p><p><strong>Caso principal:</strong> organização e validação de dados em telas do SUAP.</p></div><div class="panel"><span class="tag">ENCONTRO 05 · PLANEJADO</span><h2>Models do SUAP</h2><p>Relacionamentos, managers, consultas ORM e regras associadas aos dados.</p><p><strong>Caso principal:</strong> investigação de relações acadêmicas e consultas.</p></div><div class="panel"><span class="tag">ENCONTRO 06 · PLANEJADO</span><h2>Admin do SUAP</h2><p>Configuração e personalização da interface administrativa.</p><p><strong>Caso principal:</strong> listagens, filtros, ações e permissões no admin.</p></div><button class="btn" data-page="plan">Consultar plano de curso →</button>`;
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
$("#hamburger").onclick = () => $("#sidebar").classList.toggle("open");
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
