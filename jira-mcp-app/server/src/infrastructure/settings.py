from pydantic_settings import BaseSettings


class HTTPSettings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int


class AppSettings(BaseSettings):
    NAME: str = "Jira MCP Server"
    DEBUG: bool
