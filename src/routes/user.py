from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for, flash
from src.models.user import db, Usuario
from werkzeug.security import generate_password_hash, check_password_hash

user_bp = Blueprint('user', __name__)

# Rota para registro de novo usuário
@user_bp.route('/registro', methods=['POST'])
def registro():
    dados = request.json
    
    # Verificar se todos os campos necessários estão presentes
    if not dados or not dados.get('nome') or not dados.get('email') or not dados.get('senha'):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    # Verificar se o e-mail já está em uso
    if Usuario.query.filter_by(email=dados['email']).first():
        return jsonify({'erro': 'E-mail já cadastrado'}), 400
    
    # Criar novo usuário
    novo_usuario = Usuario(
        nome=dados['nome'],
        email=dados['email']
    )
    novo_usuario.set_senha(dados['senha'])
    
    # O primeiro usuário registrado será administrador
    if Usuario.query.count() == 0:
        novo_usuario.admin = True
    
    db.session.add(novo_usuario)
    db.session.commit()
    
    return jsonify({'mensagem': 'Usuário registrado com sucesso'}), 201

# Rota para login
@user_bp.route('/login', methods=['POST'])
def login():
    dados = request.json
    
    if not dados or not dados.get('email') or not dados.get('senha'):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    usuario = Usuario.query.filter_by(email=dados['email']).first()
    
    if not usuario or not usuario.verificar_senha(dados['senha']):
        return jsonify({'erro': 'Credenciais inválidas'}), 401
    
    # Armazenar informações do usuário na sessão
    session['usuario_id'] = usuario.id
    session['usuario_nome'] = usuario.nome
    session['usuario_admin'] = usuario.admin
    
    return jsonify({
        'mensagem': 'Login realizado com sucesso',
        'usuario': {
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'admin': usuario.admin
        }
    })

# Rota para logout
@user_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'mensagem': 'Logout realizado com sucesso'})

# Rota para verificar status de autenticação
@user_bp.route('/status', methods=['GET'])
def status():
    if 'usuario_id' in session:
        usuario = Usuario.query.get(session['usuario_id'])
        if usuario:
            return jsonify({
                'autenticado': True,
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'admin': usuario.admin
                }
            })
    
    return jsonify({'autenticado': False})
