IMAGE := borisplaton/jira-mcp-server:latest


## Start MCP inspector for development
up-inspector: build
	@npx @modelcontextprotocol/inspector docker run -i --env-file .env.local $(IMAGE)


HOST_MCP_APP_HTML_DIR ?= ../client/dist/
## Builds the MCP server docker image
build:
	@echo "Building MCP server image"
	@docker build -f Dockerfile \
		--build-arg MCP_APP_HTML_PATH=/app/static/mcp-app.html \
		--build-context mcp-html-dir=$(HOST_MCP_APP_HTML_DIR) \
		-t $(IMAGE) \
		 .
