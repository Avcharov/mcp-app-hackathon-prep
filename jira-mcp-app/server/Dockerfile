FROM python:3.14 AS base

COPY uv.lock pyproject.toml .
COPY --from=ghcr.io/astral-sh/uv:0.9.2 /uv /bin/
RUN uv venv -p 3.14 && \
    . .venv/bin/activate && \
    uv sync --frozen

FROM python:3.14-slim AS final

ARG MCP_APP_HTML_PATH
ENV PATH="/.venv/bin:${PATH}"
ENV MCP_APP_HTML_PATH=$MCP_APP_HTML_PATH

COPY --from=mcp-html-dir mcp-app.html "$MCP_APP_HTML_PATH"
COPY --from=base /.venv /.venv
COPY . /app

CMD ["python", "/app/src/main.py"]
