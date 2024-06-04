# Nginx 配置

确保在当前文件夹下有 certs 证书

```bash
mkdir certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/nginx.key -out certs/nginx.crt -subj "/CN=localhost"
```
