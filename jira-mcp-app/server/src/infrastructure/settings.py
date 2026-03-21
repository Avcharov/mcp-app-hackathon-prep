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


class MCPAppSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='MCP_')

    APP_HTML_PATH: str
    ISSUE_APP_RESOURCE: str = "ui://issue/mcp-app.html"


app_settings = AppSettings()
mcp_settings = MCPAppSettings()
jira_settings = JiraSettings()
