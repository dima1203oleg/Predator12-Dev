FROM python:3.9-slim

LABEL Name="dagster-etl" Version="1.0.0"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["dagster", "api", "grpc", "-h", "0.0.0.0", "-p", "4000"]
