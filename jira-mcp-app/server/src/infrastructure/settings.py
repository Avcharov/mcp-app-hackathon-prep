from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='APP_')

    NAME: str = "Jira MCP Server"
    DEBUG: bool = False


class JiraSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='JIRA_')

    API_TOKEN: str
    USERNAME: str
    DOMAIN: str
