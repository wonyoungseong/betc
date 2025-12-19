FROM nginx:alpine

# 정적 파일 복사
COPY . /usr/share/nginx/html/

# 커스텀 nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
