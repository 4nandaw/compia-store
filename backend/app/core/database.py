"""
Configuração do banco de dados SQLAlchemy com MySQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency que fornece uma sessão do banco de dados."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Cria todas as tabelas no banco de dados (com retry para aguardar MySQL)."""
    import time

    max_retries = 10
    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception as e:
            if attempt == max_retries:
                raise
            print(f"[database] Tentativa {attempt}/{max_retries} falhou ({e.__class__.__name__}). Aguardando 3s...")
            time.sleep(3)


def seed_data(db: Session):
    """Popula o banco com dados iniciais (apenas se vazio)."""
    from app.models.user import User
    from app.models.product import Product

    # Seed de usuários
    if db.query(User).count() == 0:
        admin = User(
            email="admin@compia.com",
            password="admin123",
            name="Administrador COMPIA",
            role="admin",
        )
        user = User(
            email="usuario@compia.com",
            password="user123",
            name="Usuário Teste",
            role="user",
        )
        db.add_all([admin, user])
        db.commit()
        print("[seed] ✓ Usuários criados (admin@compia.com / usuario@compia.com)")

    # Seed de produtos
    if db.query(Product).count() == 0:
        products = [
            Product(
                title="Inteligência Artificial: Uma Abordagem Moderna",
                author="Stuart Russell & Peter Norvig",
                price=249.90,
                rating=4.9,
                reviews_count=128,
                image="https://images.unsplash.com/photo-1770233621425-5d9ee7a0a700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3MTQxNzU5MXww&ixlib=rb-4.1.0&q=80&w=1080",
                category="Inteligência Artificial",
                type="book",
                is_best_seller=True,
                is_new=False,
                stock=15,
                description="A obra definitiva sobre IA, cobrindo desde os fundamentos até as últimas tendências em aprendizado de máquina e robótica.",
            ),
            Product(
                title="Clean Architecture: Guia do Artesão",
                author="Robert C. Martin",
                price=189.90,
                original_price=210.00,
                rating=4.8,
                reviews_count=342,
                image="https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGFyY2hpdGVjdHVyZSUyMGRpYWdyYW0lMjBjb2RlfGVufDF8fHx8MTc3MTUyNTY2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
                category="Arquitetura de Software",
                type="book",
                is_best_seller=True,
                is_new=False,
                stock=8,
                description="Aprenda a criar arquiteturas de software robustas e manuteníveis com o lendário Uncle Bob.",
            ),
            Product(
                title="Mastering Blockchain 4th Edition",
                author="Imran Bashir",
                price=149.90,
                rating=4.7,
                reviews_count=56,
                image="https://images.unsplash.com/photo-1644190022446-04b99df7259a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neSUyMGFic3RyYWN0fGVufDF8fHx8MTc3MTUwMDMwNnww&ixlib=rb-4.1.0&q=80&w=1080",
                category="Blockchain",
                type="ebook",
                is_best_seller=False,
                is_new=False,
                stock=999,
                description="Um mergulho profundo na tecnologia por trás das criptomoedas e sistemas descentralizados.",
            ),
            Product(
                title="Criptografia Prática",
                author="Niels Ferguson",
                price=129.50,
                rating=4.6,
                reviews_count=89,
                image="https://images.unsplash.com/photo-1682637275957-8e62180efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwbG9jayUyMGJpbmFyeXxlbnwxfHx8fDE3NzE1MjU2NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                category="Criptografia",
                type="book",
                is_best_seller=False,
                is_new=False,
                stock=20,
                description="Entenda como proteger sistemas e dados com as técnicas mais modernas de criptografia.",
            ),
            Product(
                title="Kit Robótica Avançada com Python",
                author="COMPIA Labs",
                price=599.00,
                original_price=650.00,
                rating=5.0,
                reviews_count=12,
                image="https://images.unsplash.com/photo-1768400730810-5c4398d58ae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMGFybSUyMGZ1dHVyaXN0aWN8ZW58MXx8fHwxNzcxNTI1NjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
                category="Inteligência Artificial",
                type="kit",
                is_best_seller=False,
                is_new=True,
                stock=5,
                description="Kit completo com hardware e material didático para construir seus próprios robôs inteligentes.",
            ),
            Product(
                title="Data Science do Zero",
                author="Joel Grus",
                price=89.90,
                rating=4.5,
                reviews_count=210,
                image="https://images.unsplash.com/photo-1761223976378-54f7a5769934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljcyUyMHNjcmVlbnxlbnwxfHx8fDE3NzE1MjU2NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                category="Inteligência Artificial",
                type="ebook",
                is_best_seller=False,
                is_new=False,
                stock=999,
                description="Aprenda os princípios da ciência de dados implementando algoritmos do zero.",
            ),
            Product(
                title="Hacking Ético: Guia Definitivo",
                author="Erickson Silva",
                price=159.00,
                rating=4.8,
                reviews_count=75,
                image="https://images.unsplash.com/photo-1682637275957-8e62180efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwbG9jayUyMGJpbmFyeXxlbnwxfHx8fDE3NzE1MjU2NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                category="Cibersegurança",
                type="book",
                is_best_seller=False,
                is_new=True,
                stock=12,
                description="Domine as técnicas de pentest e segurança ofensiva para proteger infraestruturas críticas.",
            ),
            Product(
                title="Deep Learning Book",
                author="Ian Goodfellow",
                price=299.00,
                rating=4.9,
                reviews_count=300,
                image="https://images.unsplash.com/photo-1761652661873-a08d8cb25b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwYmFja2dyb3VuZCUyMGJsdWUlMjBmdXR1cmlzdGljfGVufDF8fHx8MTc3MTUyNTY3MXww&ixlib=rb-4.1.0&q=80&w=1080",
                category="Inteligência Artificial",
                type="book",
                is_best_seller=True,
                is_new=False,
                stock=10,
                description="O livro de referência para Deep Learning, escrito pelos criadores da área.",
            ),
        ]
        db.add_all(products)
        db.commit()
        print(f"[seed] ✓ {len(products)} produtos criados")
