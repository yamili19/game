FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

ENV PORT=5000  # <-- Variable para el puerto
EXPOSE $PORT   # <-- Expón el puerto dinámico

CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]  # <-- Usa Gunicorn
