IMAGE := borisplaton/jira-mcp-server:latest
CONTAINER_NAME := jira-mcp-server


## Start MCP inspector for development
up-inspector:
	@npx @modelcontextprotocol/inspector docker run -i --env-file .env.local --name $(CONTAINER_NAME) $(IMAGE)


HOST_MCP_APP_HTML_DIR ?= ../client/dist/
## Builds the MCP server docker image
build:
	@echo "Building MCP server image"
	@docker build -f Dockerfile \
		--build-arg MCP_APP_HTML_PATH=/app/static/mcp-app.html \
		--build-context mcp-html-dir=$(HOST_MCP_APP_HTML_DIR) \
		-t $(IMAGE) \
		 .


## Removes the MCP server container
stop:
	@docker rm -f $(CONTAINER_NAME) 2> /dev/null | true
	@echo "Jira MCP server stopped"
