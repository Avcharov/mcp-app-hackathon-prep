# Jira MCP Server

## Setup

### Claude

To setup this MCP server for Claude client, you may add this to your configuration file. Replace the 
corresponding environment variables with your values:
```json
{
  "mcpServers": {
    "jira-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "JIRA_API_TOKEN",
        "-e", "JIRA_USERNAME",
        "-e", "JIRA_DOMAIN",
        "borisplaton/jira-mcp-server:latest"
      ],
      "env": {
        "JIRA_API_TOKEN": "<JIRA_API_TOKEN>",
        "JIRA_USERNAME": "<JIRA_USERNAME>",
        "JIRA_DOMAIN": "<JIRA_DOMAIN>"
      }
    }
  }
}
```

To create a Jira token, read this [article](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).
