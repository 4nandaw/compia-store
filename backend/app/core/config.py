from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configurações principais da aplicação.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "COMPIA Store"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"

    # Database
    DATABASE_URL: str = "mysql+pymysql://compia:compia123@localhost:3306/compia_store"

    # Email (Resend)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    STORE_CONTACT_EMAIL: str = "contato@compia.com.br"

    @property
    def cors_origins_list(self) -> list[str]:
        """Converte a string de origens separadas por vírgula em lista."""
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
