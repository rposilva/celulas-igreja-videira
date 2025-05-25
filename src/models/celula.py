from src.models.user import db
from datetime import datetime


class Celula(db.Model):
    __tablename__ = 'celulas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    responsavel = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    dias_funcionamento = db.Column(db.String(100), nullable=False)  # Armazenado como string separado por vírgulas
    horario = db.Column(db.String(50), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    bairro = db.Column(db.String(100), nullable=False)
    cidade = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=True)  # Tipo de célula (jovens, casais, etc.)
    observacoes = db.Column(db.Text, nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    ativo = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Celula {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'responsavel': self.responsavel,
            'telefone': self.telefone,
            'dias_funcionamento': self.dias_funcionamento,
            'horario': self.horario,
            'endereco': self.endereco,
            'bairro': self.bairro,
            'cidade': self.cidade,
            'tipo': self.tipo,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.strftime('%d/%m/%Y'),
            'ativo': self.ativo
        }
