from settings import app_settings

from src import create_app

app = create_app()

if __name__ == '__main__':
    import uvicorn

    # 启动应用
    uvicorn.run(
        app="main:app",
        host=app_settings.ADMIN_APP_HOST,
        port=app_settings.ADMIN_APP_PORT,
        reload=True
    )