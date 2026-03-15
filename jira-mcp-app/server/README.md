# Jira MCP Server

## Setup

### Claude

To setup this MCP server for Claude client, you may add this to your configuration file. Replace the 
corresponding environment variables with your values:
```json
{
    "jira-mcp": {
        "command": "docker",
        "args": [
            "run",
            "-i",
            "--rm",
            "--name", "jira-mcp-server",
            "-e", "JIRA_API_TOKEN",
            "-e", "JIRA_USERNAME",
            "-e", "JIRA_DOMAIN",
            "borisplan/jira-mcp-server:latest"
        ],
        "env": {
            "JIRA_API_TOKEN": <YOUR JIRA API TOKEN>,
            "JIRA_USERNAME": <YOUR JIRA EMAIL>,
            "JIRA_DOMAIN": <YOUR JIRA DOMAIN>,
        }
    }
}
```

To create a Jira token, read this [article](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).
