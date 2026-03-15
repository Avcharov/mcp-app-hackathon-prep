IMAGE := borisplan/jira-mcp-server:latest
CONTAINER_NAME := jira-mcp-server

## Builds the MCP server docker image
build:
	@echo "Building MCP server image"
	@docker build -f Dockerfile -t $(IMAGE) .

up-dev: build
	npx @modelcontextprotocol/inspector docker run -i --env-file .env.local --name $(CONTAINER_NAME) $(IMAGE)

## Removes the MCP server container
stop:
	@docker rm -f $(CONTAINER_NAME) 2> /dev/null | true
	@echo "Jira MCP server stopped"
