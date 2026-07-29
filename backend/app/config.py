from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    POSTGRES_URL: str = "postgresql+asyncpg://voltedge:voltedge@localhost:5432/voltedge"
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "voltedge"
    JWT_SECRET: str = "change-this-to-a-long-random-string"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_ORIGIN: str = "http://localhost:4200"
    # Super admin bootstrapped on startup if not present
    SUPERADMIN_EMAIL: str = "admin@voltedge.in"
    SUPERADMIN_PASSWORD: str = "admin12345"
    SUPERADMIN_NAME: str = "Super Admin"


settings = Settings()
