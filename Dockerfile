FROM nginx:alpine

# 정적 파일 복사
COPY . /usr/share/nginx/html/

# nginx 설정 (선택사항 - SPA 라우팅이 필요한 경우)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run은 PORT 환경변수 사용
EXPOSE 8080

# nginx가 PORT 환경변수를 사용하도록 설정
CMD sed -i -e 's/80;/'"$PORT"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
