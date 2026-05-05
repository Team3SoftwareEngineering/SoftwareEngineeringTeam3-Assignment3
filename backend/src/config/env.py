import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    PORT = int(os.getenv("PORT", os.getenv("BACKEND_PORT", "3000")))
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "student_life_db")
    DB_USER = os.getenv("DB_USER", "pnw_app")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    MAP_API_KEY = os.getenv("MAP_API_KEY", "")
    MAP_PROVIDER = os.getenv("MAP_PROVIDER", "mock")

