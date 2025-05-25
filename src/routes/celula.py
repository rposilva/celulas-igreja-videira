from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for, flash
from src.models.celula import db, Celula
from src.models.user import Usuario
from functools import wraps

celula_bp = Blueprint('celula', __name__)

# Decorator para verificar se o usuário está autenticado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return jsonify({'erro': 'Autenticação necessária'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Decorator para verificar se o usuário é administrador
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return jsonify({'erro': 'Autenticação necessária'}), 401
        
        usuario = Usuario.query.get(session['usuario_id'])
        if not usuario or not usuario.admin:
            return jsonify({'erro': 'Permissão negada'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# Rota para listar todas as células
@celula_bp.route('/', methods=['GET'])
def listar_celulas():
    celulas = Celula.query.filter_by(ativo=True).all()
    return jsonify([celula.to_dict() for celula in celulas])

# Rota para obter detalhes de uma célula específica
@celula_bp.route('/<int:celula_id>', methods=['GET'])
def obter_celula(celula_id):
    celula = Celula.query.get_or_404(celula_id)
    return jsonify(celula.to_dict())

# Rota para cadastrar uma nova célula (apenas para administradores)
@celula_bp.route('/', methods=['POST'])
@admin_required
def cadastrar_celula():
    dados = request.json
    
    # Validação básica dos campos obrigatórios
    campos_obrigatorios = ['nome', 'responsavel', 'telefone', 'dias_funcionamento', 
                          'horario', 'endereco', 'bairro', 'cidade']
    
    for campo in campos_obrigatorios:
        if campo not in dados or not dados[campo]:
            return jsonify({'erro': f'O campo {campo} é obrigatório'}), 400
    
    # Criação da nova célula
    nova_celula = Celula(
        nome=dados['nome'],
        responsavel=dados['responsavel'],
        telefone=dados['telefone'],
        dias_funcionamento=dados['dias_funcionamento'],
        horario=dados['horario'],
        endereco=dados['endereco'],
        bairro=dados['bairro'],
        cidade=dados['cidade'],
        tipo=dados.get('tipo'),
        observacoes=dados.get('observacoes')
    )
    
    db.session.add(nova_celula)
    db.session.commit()
    
    return jsonify({'mensagem': 'Célula cadastrada com sucesso', 'celula': nova_celula.to_dict()}), 201

# Rota para atualizar uma célula existente (apenas para administradores)
@celula_bp.route('/<int:celula_id>', methods=['PUT'])
@admin_required
def atualizar_celula(celula_id):
    celula = Celula.query.get_or_404(celula_id)
    dados = request.json
    
    # Atualização dos campos
    if 'nome' in dados:
        celula.nome = dados['nome']
    if 'responsavel' in dados:
        celula.responsavel = dados['responsavel']
    if 'telefone' in dados:
        celula.telefone = dados['telefone']
    if 'dias_funcionamento' in dados:
        celula.dias_funcionamento = dados['dias_funcionamento']
    if 'horario' in dados:
        celula.horario = dados['horario']
    if 'endereco' in dados:
        celula.endereco = dados['endereco']
    if 'bairro' in dados:
        celula.bairro = dados['bairro']
    if 'cidade' in dados:
        celula.cidade = dados['cidade']
    if 'tipo' in dados:
        celula.tipo = dados['tipo']
    if 'observacoes' in dados:
        celula.observacoes = dados['observacoes']
    if 'ativo' in dados:
        celula.ativo = dados['ativo']
    
    db.session.commit()
    
    return jsonify({'mensagem': 'Célula atualizada com sucesso', 'celula': celula.to_dict()})

# Rota para excluir uma célula (apenas para administradores)
@celula_bp.route('/<int:celula_id>', methods=['DELETE'])
@admin_required
def excluir_celula(celula_id):
    celula = Celula.query.get_or_404(celula_id)
    
    # Exclusão lógica (marcar como inativo)
    celula.ativo = False
    db.session.commit()
    
    return jsonify({'mensagem': 'Célula excluída com sucesso'})

# Rota para buscar células com filtros
@celula_bp.route('/buscar', methods=['GET'])
def buscar_celulas():
    # Parâmetros de busca
    bairro = request.args.get('bairro')
    dia = request.args.get('dia')
    tipo = request.args.get('tipo')
    responsavel = request.args.get('responsavel')
    
    # Construção da query base
    query = Celula.query.filter_by(ativo=True)
    
    # Aplicação dos filtros
    if bairro:
        query = query.filter(Celula.bairro.ilike(f'%{bairro}%'))
    if dia:
        query = query.filter(Celula.dias_funcionamento.ilike(f'%{dia}%'))
    if tipo:
        query = query.filter(Celula.tipo.ilike(f'%{tipo}%'))
    if responsavel:
        query = query.filter(Celula.responsavel.ilike(f'%{responsavel}%'))
    
    # Execução da query
    celulas = query.all()
    
    return jsonify([celula.to_dict() for celula in celulas])
