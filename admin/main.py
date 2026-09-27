


if __name__ == '__main__':
    import uvicorn

    # 启动应用
    uvicorn.run(app="main:app", host=app_settings.APP_HOST, port=app_settings.APP_PORT, reload=True)