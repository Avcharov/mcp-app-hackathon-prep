from pydantic_settings import BaseSettings, SettingsConfigDict


class HTTPSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='HTTP_')

    HOST: str = "0.0.0.0"
    PORT: int


class AppSettings(BaseSettings):
    NAME: str = "Jira MCP Server"
    DEBUG: bool


class JiraSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='JIRA_')

    API_TOKEN: str
    USERNAME: str
    DOMAIN: str
