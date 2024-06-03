# 使用官方 Python 3.11 基础镜像
FROM python:3.11

# 设置工作目录
WORKDIR /app

# 切换到 root 用户
USER root

# 复制 requirements.txt 文件到工作目录
COPY ./backend/py/requirements.txt /app/


# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ /app/
# 设置环境变量
ENV LISTEN_PORT=8000

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["uvicorn", "py.main:app", "--host", "0.0.0.0", "--port", "8000"]