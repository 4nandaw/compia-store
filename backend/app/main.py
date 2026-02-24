from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.database import SessionLocal, create_tables, seed_data

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Evento de inicialização: cria tabelas e popula dados seed."""
    # Importar modelos para que Base.metadata conheça todas as tabelas
    import app.models  # noqa: F401

    print("[startup] Criando tabelas no banco de dados...")
    create_tables()

    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

    print("[startup] ✓ Backend pronto!")
    yield


app = FastAPI(
    title="COMPIA Store API",
    description="API backend da Loja Virtual da Editora de Inteligência Artificial (COMPIA).",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
