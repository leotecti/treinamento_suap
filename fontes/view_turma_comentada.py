def turma(request, pk):
    # Define uma view; request contém dados HTTP e pk identifica a turma.
    manager = request.user.has_group_cached('Diretor Acadêmico') and Turma.objects or Turma.locals
    # Seleciona o manager padrão para Diretor Acadêmico, ou Turma.locals nos demais casos.
    # A expressão and/or depende da avaliação de verdade de seus operandos.
    obj = get_object_or_404(manager, pk=pk)
    # Busca a turma no manager selecionado; se não existir, retorna HTTP 404.
    title = f'Turma {obj}'
    # Monta o título usando a representação textual do objeto Turma.
    is_administrador = request.user.has_group_cached('Administrador Acadêmico')
    # Identifica se o usuário pertence ao grupo Administrador Acadêmico.
    pode_realizar_procedimentos = perms.realizar_procedimentos_academicos(request.user, obj.curso_campus)
    # Verifica autorização contextual para procedimentos acadêmicos no curso da turma.
    # IFG - Issue 1569 - Coordenador de Curso não pode adicionar alunos avulsos em turma
    # Regra institucional identificada pelo comentário original.
    pode_adicionar_aluno_turma = pode_realizar_procedimentos and (
        # Exige autorização para procedimentos e pelo menos uma das condições abaixo.
        not request.user.has_group_cached('Coordenador de Curso') or request.user.has_group_cached(GRUPOS_ENSINO_LIBERADOS_ALUNO_AVULSO)
        # Usuário não é coordenador OU pertence aos grupos excepcionados.
    )
    # Armazena o resultado da regra para uso posterior, possivelmente no template.

    diarios = obj.diario_set.order_by('componente_curricular__componente')
    # Consulta os diários da turma, ordenados pelo componente curricular relacionado.

    alunos = obj.get_alunos_matriculados()
    # Recupera as matrículas segundo o método do model Turma.
    alunos_diarios = obj.get_alunos_matriculados_diarios()
    # Recupera as matrículas dos diários segundo a implementação do model.
    diarios_pendentes = obj.diarios_pendentes()
    # Obtém as pendências de diários segundo as regras encapsuladas no model.
    situacoes_inativas = (
        # Tupla de situações a excluir da contagem de alunos ativos desta view.
        SituacaoMatriculaPeriodo.CANCELADA,
        # Situação de matrícula cancelada.
        SituacaoMatriculaPeriodo.CANCELAMENTO_COMPULSORIO,
        # Situação de cancelamento compulsório.
        SituacaoMatriculaPeriodo.CANCELAMENTO_POR_DESLIGAMENTO,
        # Situação de cancelamento por desligamento.
        SituacaoMatriculaPeriodo.CANCELAMENTO_POR_DUPLICIDADE,
        # Situação de cancelamento por duplicidade.
        SituacaoMatriculaPeriodo.TRANCADA,
        # Situação de trancamento.
        SituacaoMatriculaPeriodo.TRANCADA_VOLUNTARIAMENTE,
        # Situação de trancamento voluntário.
        SituacaoMatriculaPeriodo.TRANSF_CURSO,
        # Situação de transferência de curso.
    )
    # Fim da tupla de situações excluídas.
    qtd_alunos_ativos = alunos.exclude(situacao__in=situacoes_inativas).count()
    # Conta registros de alunos cuja situação não consta na tupla.
    qtd_alunos_ativos += alunos_diarios.exclude(situacao__in=situacoes_inativas).count()
    # Soma a contagem de registros vinculados aos diários; verificar sobreposição.

    ids = request.GET.get('matriculas_periodo')
    # Lê os IDs de matrículas da query string, por exemplo 10_20_30.
    if ids:
        # Se houver IDs, entra no fluxo de remoção.
        if not pode_realizar_procedimentos:
            # Bloqueia a operação caso falte autorização contextual.
            return httprr('..', 'Você não tem permissão para realizar isso.', 'error')
            # Encerra a view com resposta/mensagem de erro, conforme httprr do SUAP.
        matriculas_periodo = MatriculaPeriodo.objects.filter(id__in=ids.split('_'), turma=obj)
        # Divide a string por '_' e seleciona apenas matrículas desta turma.
        obj.remover_alunos(matriculas_periodo, request.user)
        # Encaminha a remoção ao método do model, registrando o usuário como argumento.

# Acesso admin/edu/turma/
# Comentário original sem efeito na execução.
        return httprr(f'/edu/turma/{obj.pk}/?tab=dados_alunos', 'Aluno(s) removido(s) com sucesso.')
        # Retorna resposta com redirecionamento à aba de dados dos alunos e mensagem.

    semestre = request.GET.get('semestre') or '1'
    # Seleciona o semestre informado na URL ou usa a string '1' como padrão.
    turnos = obj.get_horarios(semestre)
    # Solicita os horários da turma para o semestre escolhido.
    diarios_por_sigla = diarios.filter(horarioauladiario__isnull=False).distinct().order_by('componente_curricular__componente__sigla')
    # Seleciona diários com horário, remove duplicações e ordena pela sigla.
    return locals()
    # Devolve as variáveis locais como dicionário; verificar decorator de renderização.
