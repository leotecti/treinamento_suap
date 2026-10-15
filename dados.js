window.SUAP_SAMPLES = {
  model: {
    code: "class Turma(LogModel):\n\n    SEARCH_FIELDS = ['codigo', 'descricao']\n\n\n\n    # Manager\n\n    objects = TurmaManager()\n\n    locals = TurmaLocalManager()\n\n    # Fields\n\n    codigo = models.CharFieldPlus(verbose_name='Código')\n\n    descricao = models.CharFieldPlus(verbose_name='Descrição')\n\n    ano_letivo = models.ForeignKeyPlus('comum.Ano', verbose_name='Ano Letivo', related_name='turma_por_ano_letivo_set', on_delete=models.CASCADE)\n\n    periodo_letivo = models.PositiveIntegerField(verbose_name='Período Letivo', choices=PERIODO_LETIVO_CHOICES)\n\n    periodo_matriz = models.PositiveIntegerField(verbose_name='Período Turma')\n\n    turno = models.ForeignKeyPlus('edu.Turno', verbose_name='Turno', on_delete=models.CASCADE)\n\n    curso_campus = models.ForeignKeyPlus('edu.CursoCampus', verbose_name='Curso')\n\n    matriz = models.ForeignKeyPlus('edu.Matriz', null=True)\n\n    sequencial = models.PositiveIntegerField(default=1)\n\n    calendario_academico = models.ForeignKeyPlus('edu.CalendarioAcademico', null=True)\n\n    quantidade_vagas = models.PositiveIntegerField('Quantidade de Vagas', default=0)\n\n    polo = models.ForeignKeyPlus('edu.Polo', null=True, verbose_name='Polo EAD', blank=True, on_delete=models.CASCADE)\n\n    sigla = models.CharFieldPlus(max_length=255, default='', null=True, blank=True)\n\n    codigo_educacenso = models.CharFieldPlus('Código EDUCACENSO', null=True, blank=True)\n\n    # plano de retomada de aulas em virtude da pandemia (COVID19)\n\n    pertence_ao_plano_retomada = models.BooleanField(verbose_name='Plano de Retomada', default=False, help_text='Adicionada ao plano de retomada de aulas em virtude da pandemia (COVID19)')\n\n\n\n    class Meta:\n\n        verbose_name = 'Turma'\n\n        verbose_name_plural = 'Turmas'\n\n\n\n        permissions = (('gerar_turmas', 'Gerar Turmas'),)\n\n        ordering = ('descricao',)",
    file: "edu/models/turmas.py",
    line: 37,
    end: 98,
  },
  matriculados: {
    code: "    def get_alunos_matriculados(self):\n\n        return MatriculaPeriodo.objects.filter(turma=self).order_by('aluno__pessoa_fisica__nome', 'aluno__pk').select_related('aluno__pessoa_fisica')\n\n\n\n    def get_alunos_matriculados_diarios(self):\n\n        from edu.models import MatriculaDiario\n\n\n\n        return (\n\n            MatriculaPeriodo.objects.filter(matriculadiario__diario__turma=self)\n\n            .exclude(turma=self)\n\n            .exclude(matriculadiario__situacao=MatriculaDiario.SITUACAO_TRANSFERIDO)\n\n            .order_by('aluno__pessoa_fisica__nome', 'aluno__pk')\n\n            .select_related('aluno__pessoa_fisica')\n\n            .distinct()\n\n        )",
    file: "edu/models/turmas.py",
    line: 151,
    end: 180,
  },
  remover: {
    code: "    def remover_alunos(self, matriculas_periodo, user):\n\n        from edu.models import EstruturaCurso, MatriculaDiario\n\n\n\n        for matricula_periodo in matriculas_periodo:\n\n            if matricula_periodo.pode_remover_da_turma(user):\n\n                if matricula_periodo.aluno.matriz.estrutura.tipo_avaliacao != EstruturaCurso.TIPO_AVALIACAO_CREDITO:\n\n                    for md in matricula_periodo.matriculadiario_set.filter(diario__turma=self, situacao=MatriculaDiario.SITUACAO_CURSANDO):\n\n                        if md.pode_ser_excluido_do_diario(user):\n\n                            md.delete()\n\n                matricula_periodo.turma = None\n\n                matricula_periodo.save()\n\n\n\n                if not matricula_periodo.matriculadiario_set.count():\n\n                    matricula_periodo.situacao = SituacaoMatriculaPeriodo.objects.get(pk=SituacaoMatriculaPeriodo.EM_ABERTO)\n\n                    matricula_periodo.save()\n\n                    matricula_periodo.aluno.atualizar_situacao('Remoção de Turma')",
    file: "edu/models/turmas.py",
    line: 279,
    end: 312,
  },
  horarios: {
    code: "    def get_horarios(self, semestre='1'):\n\n        # turnos = Turno.objects.all()\n\n        ordem_turnos = Case(\n\n            When(descricao='Matutino', then=1),\n\n            When(descricao='Vespertino', then=2),\n\n            When(descricao='Noturno', then=3),\n\n            default=4,\n\n            output_field=IntegerField()\n\n        )\n\n        turnos = Turno.objects.all().order_by(ordem_turnos)\n\n        turnos.vazio = True\n\n        for turno in turnos:\n\n            turno.vazio = True\n\n            horarios = HorarioAula.objects.filter(horarioauladiario__diario__in=self.diario_set.all(), turno=turno).distinct().order_by('inicio')\n\n            if horarios:\n\n                turno.vazio = False\n\n                turnos.vazio = False\n\n            turno.horariosaulas = horarios\n\n            diarios = self.diario_set.order_by('componente_curricular__componente')\n\n            # excluíndo os diários semestrais em cursos anuais\n\n            if semestre == '1':\n\n                diarios = diarios.exclude(segundo_semestre=True)\n\n            else:\n\n                diarios = diarios.exclude(segundo_semestre=False, componente_curricular__qtd_avaliacoes=2)\n\n            dias_semana = [[1, 'Segunda'], [2, 'Terça'], [3, 'Quarta'], [4, 'Quinta'], [5, 'Sexta'], [6, 'Sábado'], [7, 'Domingo']]\n\n            for dia_semana in dias_semana:\n\n                dia_semana.append(HorarioAulaDiario.objects.filter(dia_semana=dia_semana[0], diario__in=diarios))\n\n            turno.dias_semana = dias_semana\n\n        return turnos",
    file: "edu/models/turmas.py",
    line: 553,
    end: 612,
  },
  rtr: {
    code: "def rtr(template=None, two_factor_authentication=False):\n\n    \"\"\"\n\n    Decorator que adiciona renderização a uma função/view.\n\n\n\n    Args:\n\n        template (string): nome do template para renderizar.\n\n\n\n    Returns:\n\n        Função decorada.\n\n\n\n    Note:\n\n        Caso não seja passado o nome de um template, o template será calculado com base em \\*get_template_path\\*\n\n    \"\"\"\n\n\n\n    def receive_function(function):\n\n        @wraps(function, assigned=WRAPPER_ASSIGNMENTS)\n\n        def receive_function_args(request, \\*args, \\*\\*kwargs):\n\n            if two_factor_authentication and not request.session.get('2fa') and not settings.DEBUG:\n\n                if not request.user.is_authenticated:\n\n                    return httprr('..', 'Por favor efetue o login novamente.')\n\n                if not request.user.get_vinculo().pessoa.email_secundario:\n\n                    return httprr('..', 'Esta funcionalidade requer o envio de um código de autenticação para o seu e-mail secundário, porém, você não possui este e-maill cadastrado. Entre em contato com o setor de Gestão de Pessoas da sua unidade para cadastro do seu email.', 'error')\n\n                from djtools.models import TwoFactorAuthenticationCode\n\n                obj = TwoFactorAuthenticationCode.objects.create()\n\n                send_mail('[SUAP] Código de Autenticação', '\\<h1>Código de Autenticação\\</h1>\\<dl>\\<dt>Código:\\</dt>\\<dd>{}\\</dd>\\</dl>\\<div class=\"clear\">\\</div>\\<p>Você não deve compartilhar este código com terceiros.\\</p>'.format(\n\n                    obj.code), settings.DEFAULT_FROM_EMAIL, [request.user.get_vinculo().pessoa.email_secundario])\n\n                url = '/djtools/two_factor_authentication/?next={}'.format(\n\n                    request.path)\n\n                if '\\_popup' in request.GET:\n\n                    url = f'{url}&\\_popup=1'\n\n                return HttpResponseRedirect(url)\n\n            f_return = function(request, \\*args, \\*\\*kwargs)\n\n            if isinstance(f_return, HttpResponse):\n\n                return f_return\n\n            app_name = get_app_name(function)\n\n            if isinstance(request, HttpRequest):\n\n                request.help_key = f'{app_name}.{function.\\_\\_name\\_\\_}'\n\n            template_list = [template or get_template_path(function)]\n\n            if settings.LPS:\n\n                if template:\n\n                    template_name_lps = '{}/lps/{}/templates/{}'.format(\n\n                        app_name, settings.LPS, template.split('/')[-1])\n\n                else:\n\n                    template_name_lps = '{}/lps/{}/templates/{}.html'.format(\n\n                        app_name, settings.LPS, function.\\_\\_name\\_\\_)\n\n                template_list.insert(0, template_name_lps)\n\n            return render(template_list, f_return, request, template)\n\n\n\n        return receive_function_args\n\n\n\n    return receive_function",
    file: "djtools/utils/response.py",
    line: 295,
    end: 400,
  },
  gettemplate: {
    code: 'def get_template_path(function):\n\n    """\n\n    Obtem o template, a renderizar, com base em uma função.\n\n\n\n    Args\n\n        function (Function): função.\n\n\n\n    Returns:\n\n        String com o template a ser renderizado.\n\n    """\n\n    app_name = get_app_name(function)\n\n    if app_name == settings.PROJECT_NAME:\n\n        return \'templates/%s.html\' % (function.\\_\\_name\\_\\_)\n\n    return f\'{app_name}/templates/{function.\\_\\_name\\_\\_}.html\'',
    file: "djtools/utils/response.py",
    line: 173,
    end: 204,
  },
  httprr: {
    code: "def httprr(url, message='', tag='success', anchor='', get_params='', close_popup=False):\n\n    \"\"\"\n\n    Shortcut para o \\*\\*HttpResponseRedirect\\*\\* que possibilita a passagem de uma mensagem.\n\n\n\n    Args:\n\n        url (string): string com a url a redirecionar;\n\n        message (string): string contendo a mensagem a ser passada;\n\n        tag (string): tag utilizada para caracterizar a mensagem, por exemplo: success, warning\n\n        anchor (string): ancora a ser direcionado a página;\n\n        get_params (string): contem pares chave=valor, por exemplo: 'p1=v1&p2=v2';\n\n        close_popup (bool): instrui fechar imediatamente janela de popup se esse for o caso.\n\n\n\n    Returns:\n\n        Objeto HttpResponseRedirect, ou HttpResponse quando for para fechar janelas popups.\n\n    \"\"\"\n\n\n\n    def set_message():\n\n        if message:\n\n            from django.contrib import messages\n\n            if tag == 'success':\n\n                messages.success(request, message)\n\n            elif tag == 'warning':\n\n                messages.warning(request, message)\n\n            else:\n\n                messages.error(request, message, extra_tags='errornote')\n\n\n\n    request = get_tl().get_request()\n\n\n\n    tab = 'tab' in request.GET and request.GET['tab'] and '?tab=%s' % request.GET['tab'] or ''\n\n\n\n    if get_params:\n\n        get_params = f'{tab}{get_params}'\n\n        if not get_params[0] == '?':\n\n            get_params = '?{}'.format(get_params.replace('?', ''))\n\n\n\n    if close_popup and '\\_popup' in request.GET.keys():\n\n        if '\\_popup_close_noreload' in request.GET.keys():\n\n            return HttpResponse(f'\\<script>parent.close_fancybox_noreload(\"{message}\", \"{tag}\");\\</script>')\n\n        else:\n\n            # reload por padrão\n\n            set_message()\n\n            return HttpResponse('\\<script>parent.close_fancybox();\\</script>')\n\n\n\n    if url == '..' and (tag == 'success' or tag == 'warning' or tag == 'error') and '\\_popup' in request.GET.keys():\n\n        if '\\_popup_close_noreload' in request.GET.keys():\n\n            return HttpResponse(f'\\<script>parent.close_fancybox_noreload(\"{message}\", \"{tag}\");\\</script>')\n\n        else:\n\n            # reload por padrão\n\n            set_message()\n\n            return HttpResponse('\\<script>parent.close_fancybox();\\</script>')\n\n\n\n    set_message()\n\n\n\n    if url == '.':\n\n        url = f'{request.path}{get_params}'\n\n    elif url == '..':\n\n        url = breadcrumbs_previous_url(request)\n\n\n\n    url = anchor and f'{url}#{anchor}' or url\n\n\n\n    return HttpResponseRedirect(url)",
    file: "djtools/utils/response.py",
    line: 47,
    end: 172,
  },
  pdfresponse: {
    code: "class PDFResponse(HttpResponse):\n\n    \"\"\"\n\n    Classe derivada do \\*\\*HttpResponse\\*\\* que retorna um conteúdo do tipo '\\*application/pdf\\*'.\n\n    \"\"\"\n\n\n\n    def \\_\\_init\\_\\_(self, data, nome='relatorio.pdf', anexo=False):\n\n        \"\"\"\n\n        Construtor da classe.\n\n\n\n        Args:\n\n            data (byte): conteúdo a ser processado;\n\n            nome (string): nome do arquivo;\n\n            anexo (bool): indica que o conteúdo deve ser anexado.\n\n        \"\"\"\n\n        HttpResponse.\\_\\_init\\_\\_(self, content=data, content_type='application/pdf')\n\n        if anexo:\n\n            self['Content-Disposition'] = 'attachment; filename=%s' % (nome)\n\n        else:\n\n            self['Content-Disposition'] = 'inline; filename=%s' % (nome)",
    file: "djtools/utils/response.py",
    line: 543,
    end: 584,
  },
  view: {
    code: "def turma(request, pk):\n    # Define uma view; request contém dados HTTP e pk identifica a turma.\n    manager = request.user.has_group_cached('Diretor Acadêmico') and Turma.objects or Turma.locals\n    # Seleciona o manager padrão para Diretor Acadêmico, ou Turma.locals nos demais casos.\n    # A expressão and/or depende da avaliação de verdade de seus operandos.\n    obj = get_object_or_404(manager, pk=pk)\n    # Busca a turma no manager selecionado; se não existir, retorna HTTP 404.\n    title = f'Turma {obj}'\n    # Monta o título usando a representação textual do objeto Turma.\n    is_administrador = request.user.has_group_cached('Administrador Acadêmico')\n    # Identifica se o usuário pertence ao grupo Administrador Acadêmico.\n    pode_realizar_procedimentos = perms.realizar_procedimentos_academicos(request.user, obj.curso_campus)\n    # Verifica autorização contextual para procedimentos acadêmicos no curso da turma.\n    # IFG - Issue 1569 - Coordenador de Curso não pode adicionar alunos avulsos em turma\n    # Regra institucional identificada pelo comentário original.\n    pode_adicionar_aluno_turma = pode_realizar_procedimentos and (\n        # Exige autorização para procedimentos e pelo menos uma das condições abaixo.\n        not request.user.has_group_cached('Coordenador de Curso') or request.user.has_group_cached(GRUPOS_ENSINO_LIBERADOS_ALUNO_AVULSO)\n        # Usuário não é coordenador OU pertence aos grupos excepcionados.\n    )\n    # Armazena o resultado da regra para uso posterior, possivelmente no template.\n\n    diarios = obj.diario_set.order_by('componente_curricular__componente')\n    # Consulta os diários da turma, ordenados pelo componente curricular relacionado.\n\n    alunos = obj.get_alunos_matriculados()\n    # Recupera as matrículas segundo o método do model Turma.\n    alunos_diarios = obj.get_alunos_matriculados_diarios()\n    # Recupera as matrículas dos diários segundo a implementação do model.\n    diarios_pendentes = obj.diarios_pendentes()\n    # Obtém as pendências de diários segundo as regras encapsuladas no model.\n    situacoes_inativas = (\n        # Tupla de situações a excluir da contagem de alunos ativos desta view.\n        SituacaoMatriculaPeriodo.CANCELADA,\n        # Situação de matrícula cancelada.\n        SituacaoMatriculaPeriodo.CANCELAMENTO_COMPULSORIO,\n        # Situação de cancelamento compulsório.\n        SituacaoMatriculaPeriodo.CANCELAMENTO_POR_DESLIGAMENTO,\n        # Situação de cancelamento por desligamento.\n        SituacaoMatriculaPeriodo.CANCELAMENTO_POR_DUPLICIDADE,\n        # Situação de cancelamento por duplicidade.\n        SituacaoMatriculaPeriodo.TRANCADA,\n        # Situação de trancamento.\n        SituacaoMatriculaPeriodo.TRANCADA_VOLUNTARIAMENTE,\n        # Situação de trancamento voluntário.\n        SituacaoMatriculaPeriodo.TRANSF_CURSO,\n        # Situação de transferência de curso.\n    )\n    # Fim da tupla de situações excluídas.\n    qtd_alunos_ativos = alunos.exclude(situacao__in=situacoes_inativas).count()\n    # Conta registros de alunos cuja situação não consta na tupla.\n    qtd_alunos_ativos += alunos_diarios.exclude(situacao__in=situacoes_inativas).count()\n    # Soma a contagem de registros vinculados aos diários; verificar sobreposição.\n\n    ids = request.GET.get('matriculas_periodo')\n    # Lê os IDs de matrículas da query string, por exemplo 10_20_30.\n    if ids:\n        # Se houver IDs, entra no fluxo de remoção.\n        if not pode_realizar_procedimentos:\n            # Bloqueia a operação caso falte autorização contextual.\n            return httprr('..', 'Você não tem permissão para realizar isso.', 'error')\n            # Encerra a view com resposta/mensagem de erro, conforme httprr do SUAP.\n        matriculas_periodo = MatriculaPeriodo.objects.filter(id__in=ids.split('_'), turma=obj)\n        # Divide a string por '_' e seleciona apenas matrículas desta turma.\n        obj.remover_alunos(matriculas_periodo, request.user)\n        # Encaminha a remoção ao método do model, registrando o usuário como argumento.\n\n# Acesso admin/edu/turma/\n# Comentário original sem efeito na execução.\n        return httprr(f'/edu/turma/{obj.pk}/?tab=dados_alunos', 'Aluno(s) removido(s) com sucesso.')\n        # Retorna resposta com redirecionamento à aba de dados dos alunos e mensagem.\n\n    semestre = request.GET.get('semestre') or '1'\n    # Seleciona o semestre informado na URL ou usa a string '1' como padrão.\n    turnos = obj.get_horarios(semestre)\n    # Solicita os horários da turma para o semestre escolhido.\n    diarios_por_sigla = diarios.filter(horarioauladiario__isnull=False).distinct().order_by('componente_curricular__componente__sigla')\n    # Seleciona diários com horário, remove duplicações e ordena pela sigla.\n    return locals()\n    # Devolve as variáveis locais como dicionário; verificar decorator de renderização.\n",
    file: "edu/views.py (função turma; conferir linha no checkout)",
    line: null,
    end: null,
  },
};

window.SUAP_GLOSSARY = [
  {
    term: "SUAP",
    category: "Visão geral",
    definition: "O SUAP é o sistema institucional que reúne processos acadêmicos, administrativos e de gestão em uma única aplicação.",
    context: "Durante uma investigação, o SUAP deve ser observado como um conjunto de módulos que compartilham autenticação, permissões, componentes visuais e regras de negócio.",
    example: "O módulo edu concentra funcionalidades de ensino, como alunos, turmas, matrículas e horários."
  },
  {
    term: "Django",
    category: "Visão geral",
    definition: "Django é o framework Python usado para estruturar grande parte do SUAP, oferecendo convenções para URLs, views, models, templates, formulários e administração.",
    context: "Conhecer Django ajuda a reconhecer onde cada responsabilidade costuma estar e a acompanhar uma requisição desde a URL até a resposta.",
    example: "Uma URL encaminha a requisição para uma view, que consulta um model e renderiza um template."
  },
  {
    term: "Aplicação",
    category: "Visão geral",
    definition: "Aplicação é um conjunto organizado de código que implementa uma parte funcional do sistema.",
    context: "No Django, uma aplicação normalmente reúne models, views, templates, forms, admin, URLs e regras específicas de um domínio.",
    example: "edu é a aplicação que concentra funcionalidades relacionadas ao ensino."
  },
  {
    term: "Módulo",
    category: "Visão geral",
    definition: "Módulo é uma unidade de organização do código ou do produto, criada para separar responsabilidades e facilitar a manutenção.",
    context: "No portal, módulo também identifica cada encontro de estudo; no código, pode representar um arquivo Python ou uma área funcional do SUAP.",
    example: "O módulo Models do SUAP estuda as classes que representam os dados acadêmicos."
  },
  {
    term: "URL",
    category: "Fluxo web",
    definition: "URL é o endereço usado para localizar uma tela, um recurso ou uma ação na aplicação web.",
    context: "Ela é o ponto de entrada visível da requisição. Ao analisar uma tela, comece pela URL para descobrir qual rota será acionada.",
    example: "Em /edu/turma/42/, o trecho 42 pode ser recebido pela view como o identificador pk."
  },
  {
    term: "Rota",
    category: "Fluxo web",
    definition: "Rota é a regra que associa um padrão de URL a uma função ou view.",
    context: "O arquivo de URLs não executa a regra de negócio; ele encaminha a requisição para o ponto correto do código.",
    example: "path('turma/<int:pk>/', views.turma) chama views.turma quando o endereço corresponde ao padrão."
  },
  {
    term: "View",
    category: "Fluxo web",
    definition: "View é a função ou classe que recebe a requisição, aplica decisões da aplicação e produz uma resposta.",
    context: "É comum a view verificar permissões, buscar objetos, preparar variáveis e escolher entre HTML, PDF, JSON ou redirecionamento.",
    example: "A view turma(request, pk) recupera uma turma e prepara alunos, diários e horários para o template."
  },
  {
    term: "Template",
    category: "Fluxo web",
    definition: "Template é o arquivo de apresentação que combina HTML com variáveis e comandos da linguagem de templates do Django.",
    context: "A view prepara o contexto; o template decide como os dados serão organizados e exibidos para a pessoa usuária.",
    example: "{% if perms.edu.view_dados_pessoais %} pode controlar a exibição de uma seção de dados pessoais."
  },
  {
    term: "Model",
    category: "Dados",
    definition: "Model é a classe Python que representa uma entidade persistida e descreve seus campos, relacionamentos e comportamentos.",
    context: "O model concentra regras relacionadas ao dado, enquanto a view coordena a requisição e o template apresenta o resultado.",
    example: "Turma possui campos acadêmicos e métodos como get_alunos_matriculados() e get_horarios()."
  },
  {
    term: "Banco de dados",
    category: "Dados",
    definition: "Banco de dados é o sistema que armazena de forma persistente os registros usados pelo SUAP.",
    context: "Models e ORM protegem o código de detalhes repetitivos do SQL, mas toda consulta ainda precisa considerar volume, filtros e segurança.",
    example: "Uma consulta de Turma pode recuperar alunos relacionados sem carregar registros que não pertencem àquela turma."
  },
  {
    term: "QuerySet",
    category: "Dados",
    definition: "QuerySet é uma representação de uma consulta Django que pode ser filtrada, ordenada e combinada antes de ser executada.",
    context: "Ele permite construir consultas legíveis e normalmente é avaliado de forma tardia, quando os dados são necessários.",
    example: "MatriculaPeriodo.objects.filter(turma=self).order_by('aluno__pessoa_fisica__nome') retorna matrículas ordenadas."
  },
  {
    term: "Form",
    category: "Entrada e relatórios",
    definition: "Form é a estrutura que descreve campos de entrada, validações e conversão dos dados enviados pela pessoa usuária.",
    context: "Um formulário reduz validações espalhadas pela view e oferece uma forma consistente de tratar dados inválidos antes de salvar ou consultar.",
    example: "Um form pode receber um período, validar a data e entregar à view um valor já convertido."
  },
  {
    term: "Admin",
    category: "Interface administrativa",
    definition: "Admin é a interface administrativa do Django adaptada pelo SUAP para listar, consultar, criar e alterar registros.",
    context: "A configuração do admin define colunas, filtros, buscas, ações e permissões, mas não substitui as regras de segurança das views.",
    example: "Um ModelAdmin pode definir list_display para mostrar campos úteis na lista de alunos."
  },
  {
    term: "Decorator",
    category: "Execução e segurança",
    definition: "Decorator é uma função que envolve outra função para acrescentar comportamento sem reescrever seu corpo.",
    context: "No SUAP, decorators deixam visíveis regras transversais como autenticação, permissão, renderização e geração de documentos.",
    example: "@permission_required(...) pode impedir que a view seja executada por quem não tem acesso."
  },
  {
    term: "@rtr()",
    category: "Execução e segurança",
    definition: "@rtr() é um decorator do SUAP que transforma o retorno de uma view em uma resposta renderizada por template.",
    context: "Quando recebe um dicionário ou locals(), ele prepara o contexto; quando a view já retorna uma resposta HTTP, preserva essa resposta.",
    example: "@rtr('horarios_turma.html') informa explicitamente o template que deve ser usado."
  },
  {
    term: "@permission_required()",
    category: "Execução e segurança",
    definition: "@permission_required() verifica se o usuário possui uma permissão Django antes de permitir a execução da view.",
    context: "A checagem acontece no servidor. Esconder um botão no template não é suficiente para proteger uma URL acessada diretamente.",
    example: "@permission_required('edu.view_turma') exige a permissão edu.view_turma."
  },
  {
    term: "@login_required",
    category: "Execução e segurança",
    definition: "@login_required exige que exista um usuário autenticado antes da execução da função protegida.",
    context: "Autenticação confirma quem está acessando; autorização, feita por permissões ou regras, decide o que essa pessoa pode fazer.",
    example: "Uma página interna pode exigir login mesmo quando não depende de uma permissão específica."
  },
  {
    term: "@group_required()",
    category: "Execução e segurança",
    definition: "@group_required() restringe uma view a usuários que pertencem a um ou mais grupos determinados.",
    context: "Use-o quando a regra estiver expressa diretamente como papel ou grupo. Quando o requisito for uma capacidade, prefira uma permissão.",
    example: "Uma view pode exigir o grupo Coordenador de Curso para uma operação administrativa específica."
  },
  {
    term: "httprr()",
    category: "Respostas",
    definition: "httprr() é um atalho do SUAP para redirecionar a pessoa usuária e enviar uma mensagem de sucesso, aviso ou erro.",
    context: "Ele concentra o redirecionamento e a mensagem exibida após uma ação, evitando que cada view repita esse tratamento.",
    example: "httprr('..', 'Registro salvo com sucesso.') retorna à tela anterior com uma mensagem."
  },
  {
    term: "PDFResponse",
    category: "Respostas",
    definition: "PDFResponse é uma resposta HTTP configurada para entregar conteúdo no formato PDF.",
    context: "A view pode produzir os bytes do documento e definir se o navegador deve exibir o PDF ou iniciar seu download.",
    example: "PDFResponse(data, nome='historico.pdf', anexo=False) exibe o documento no navegador."
  },
  {
    term: "Permissão",
    category: "Acesso",
    definition: "Permissão é uma capacidade específica que autoriza uma ação ou a visualização de determinado recurso.",
    context: "No SUAP, a permissão pode ser declarada para um grupo, sincronizada no banco e consultada por views, templates, menus e managers.",
    example: "edu.view_aluno representa a capacidade de visualizar informações de aluno."
  },
  {
    term: "Grupo",
    category: "Acesso",
    definition: "Grupo é um conjunto de usuários que compartilha um papel e, normalmente, um conjunto de permissões.",
    context: "O grupo simplifica a administração: em vez de conceder cada permissão pessoa por pessoa, o sistema associa o usuário ao papel adequado.",
    example: "Organizador de Minicurso pode receber permissões de aluno necessárias para suas atividades."
  },
  {
    term: "permissions.yaml",
    category: "Acesso",
    definition: "permissions.yaml é o arquivo declarativo que descreve grupos e as permissões que devem ser associadas a eles.",
    context: "Ele funciona como uma fonte de configuração; as permissões só passam a existir para o uso das telas depois que o processo de sincronização é executado.",
    example: "Um grupo pode declarar view_aluno e view_dados_pessoais dentro do app edu."
  },
  {
    term: "sync_permissions",
    category: "Acesso",
    definition: "sync_permissions é o comando que lê as declarações de permissões e atualiza grupos e permissões no banco de dados.",
    context: "Depois de alterar o YAML, confirme a sincronização e teste as permissões efetivas do usuário, inclusive por URL direta.",
    example: "O comando transforma a declaração de edu.view_aluno em uma associação persistida no banco."
  },
  {
    term: "has_perm()",
    category: "Acesso",
    definition: "has_perm() é o método usado para perguntar se um usuário possui uma permissão específica.",
    context: "A resposta considera as permissões diretas e as herdadas dos grupos, por isso a investigação deve observar o conjunto completo de acessos.",
    example: "request.user.has_perm('edu.view_aluno') retorna verdadeiro ou falso para aquele usuário."
  },
  {
    term: "perms",
    category: "Acesso",
    definition: "perms é o objeto de permissões disponível em templates ou módulos de regras para consultar capacidades do usuário.",
    context: "Ele permite controlar trechos da interface, mas a proteção decisiva de uma operação deve existir também na view ou em outra camada do servidor.",
    example: "{% if perms.edu.view_dados_pessoais %} mostra uma seção somente quando a permissão está disponível."
  },
  {
    term: "Contexto",
    category: "Fluxo web",
    definition: "Contexto é o conjunto de variáveis que a view entrega ao template para que ele monte a página.",
    context: "Um contexto bem definido faz a separação entre decisão e apresentação: a view prepara dados e o template os organiza.",
    example: "locals() pode fornecer title, alunos, turnos e diarios_por_sigla para o template."
  },
  {
    term: "Requisição HTTP",
    category: "Fluxo web",
    definition: "Requisição HTTP é a mensagem enviada pelo navegador ao servidor, contendo método, URL, parâmetros, dados e informações da sessão.",
    context: "A view recebe essa requisição e deve tratar seus dados de forma explícita, validada e coerente com a operação solicitada.",
    example: "request.GET pode carregar filtros; request.POST normalmente carrega dados enviados por um formulário."
  },
  {
    term: "Resposta HTTP",
    category: "Respostas",
    definition: "Resposta HTTP é o resultado devolvido pelo servidor, com status, cabeçalhos e conteúdo para o navegador ou outro cliente.",
    context: "Uma resposta pode ser HTML, JSON, PDF, arquivo para download ou redirecionamento, conforme a finalidade da view.",
    example: "@rtr() produz uma resposta HTML quando o retorno da view contém dados para um template."
  },
  {
    term: "Redirecionamento",
    category: "Respostas",
    definition: "Redirecionamento é uma resposta que orienta o navegador a fazer uma nova requisição para outra URL.",
    context: "Ele é útil após salvar ou excluir dados, pois evita o reenvio acidental de um formulário ao atualizar a página.",
    example: "Depois de salvar uma turma, httprr() pode levar o usuário de volta à tela de detalhes."
  },
  {
    term: "Middleware",
    category: "Arquitetura",
    definition: "Middleware é uma camada que participa do processamento das requisições antes ou depois das views.",
    context: "Ele pode tratar sessão, autenticação, mensagens, segurança e outros comportamentos comuns sem duplicá-los em cada view.",
    example: "Um middleware pode disponibilizar o usuário autenticado para o restante do fluxo."
  },
  {
    term: "ORM",
    category: "Dados",
    definition: "ORM é o mapeamento objeto-relacional que permite trabalhar com tabelas e registros por meio de classes e objetos Python.",
    context: "O ORM do Django aproxima o código da linguagem do domínio, mas não elimina a necessidade de entender relacionamentos e custo das consultas.",
    example: "Turma.objects.filter(ano_letivo=ano) constrói uma consulta sem escrever SQL diretamente."
  },
  {
    term: "Migration",
    category: "Dados",
    definition: "Migration é o registro versionado de uma alteração na estrutura do banco de dados.",
    context: "Quando um model muda, migrations ajudam a aplicar essa mudança de forma repetível nos ambientes de desenvolvimento e homologação.",
    example: "Adicionar um campo ao model exige uma migration para criar a coluna correspondente."
  },
  {
    term: "Manager",
    category: "Dados",
    definition: "Manager é o objeto que oferece consultas e comportamentos de acesso a um model.",
    context: "Um model pode ter managers diferentes para representar visões distintas dos dados, como registros completos ou filtrados por regras institucionais.",
    example: "Turma.objects e Turma.locals podem selecionar conjuntos diferentes de turmas."
  },
  {
    term: "Sessão",
    category: "Execução e segurança",
    definition: "Sessão é o mecanismo que mantém informações associadas a uma pessoa usuária entre várias requisições.",
    context: "Ela permite manter login, mensagens e preferências temporárias, mas não deve ser usada para substituir uma autorização no servidor.",
    example: "request.session pode registrar uma etapa de autenticação de dois fatores."
  },
  {
    term: "Autenticação",
    category: "Acesso",
    definition: "Autenticação é o processo de confirmar a identidade de quem está acessando o sistema.",
    context: "Depois de autenticar, o SUAP consegue associar a requisição a um usuário e avaliar seus grupos e permissões.",
    example: "@login_required exige autenticação antes de abrir uma tela interna."
  },
  {
    term: "Autorização",
    category: "Acesso",
    definition: "Autorização é a decisão sobre quais ações e dados uma pessoa autenticada pode acessar.",
    context: "Ela combina permissões, grupos e regras contextuais, como curso, campus, situação do aluno ou vínculo institucional.",
    example: "Ter login não garante autorização para visualizar dados pessoais de qualquer aluno."
  },
  {
    term: "CRUD",
    category: "Dados",
    definition: "CRUD resume as operações de criar, consultar, atualizar e excluir registros.",
    context: "A sigla ajuda a identificar quais ações uma tela oferece e quais permissões add, view, change e delete podem estar envolvidas.",
    example: "O admin pode oferecer consulta e alteração de Turma, enquanto uma view específica executa uma ação de atualização."
  },
  {
    term: "Relatório",
    category: "Entrada e relatórios",
    definition: "Relatório é uma apresentação organizada de dados para consulta, impressão, exportação ou tomada de decisão.",
    context: "No SUAP, relatórios podem usar forms para filtros, views para preparar dados e templates HTML ou PDF para apresentação.",
    example: "Um relatório de horários pode filtrar uma turma e gerar uma versão para impressão."
  },
  {
    term: "Formset",
    category: "Entrada e relatórios",
    definition: "Formset é um conjunto de formulários relacionados tratados como uma unidade.",
    context: "Ele é útil quando uma tela precisa editar várias linhas semelhantes mantendo validação e processamento coordenados.",
    example: "Uma tela pode usar um formset para editar horários de várias aulas da mesma turma."
  },
  {
    term: "Signal",
    category: "Arquitetura",
    definition: "Signal é um mecanismo de eventos que permite executar uma função quando uma ocorrência específica acontece no Django.",
    context: "Signals podem automatizar efeitos complementares, mas exigem cuidado porque tornam o fluxo menos visível para quem lê apenas a view.",
    example: "Um signal post_save pode criar um registro relacionado depois que um objeto é salvo."
  },
  {
    term: "Transação",
    category: "Dados",
    definition: "Transação é um conjunto de operações tratado como uma unidade: todas são confirmadas ou o estado é revertido em caso de falha.",
    context: "Ela protege alterações relacionadas, especialmente quando uma ação atualiza vários registros e não pode deixar o banco pela metade.",
    example: "A remoção de alunos e a atualização de suas situações podem precisar ocorrer na mesma transação."
  },
  {
    term: "Ambiente virtual",
    category: "Desenvolvimento",
    definition: "Ambiente virtual é uma instalação isolada das dependências Python usadas por um projeto.",
    context: "Ele reduz conflitos entre versões e torna mais previsível executar comandos, testes e ferramentas do SUAP.",
    example: "Antes de rodar o servidor, ative o ambiente virtual e instale as dependências do projeto."
  }
];