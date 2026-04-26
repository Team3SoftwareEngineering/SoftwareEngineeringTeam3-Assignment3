FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./

EXPOSE 3000
CMD ["flask", "--app", "src.app:create_app", "run", "--host", "0.0.0.0", "--port", "3000"]
