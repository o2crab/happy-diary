# ツールのバージョンは CI が mise の値を --build-arg で渡します。
FROM node:24-slim AS frontend
ARG PNPM_VERSION
WORKDIR /app/frontend
RUN npm install -g "pnpm@${PNPM_VERSION}"
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

FROM python:3.13-slim
ARG UV_VERSION
WORKDIR /app/backend
RUN pip install --no-cache-dir "uv==${UV_VERSION}"
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-dev
COPY backend/app ./app
COPY --from=frontend /app/frontend/dist /app/static
RUN useradd --system --no-create-home app && mkdir -p data && chown app:app data
ENV STATIC_DIR=/app/static
USER app
EXPOSE 8000
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
