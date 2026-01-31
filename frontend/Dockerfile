# 1단계: 빌드 환경
FROM node:18-alpine AS build
WORKDIR /app

# 의존성 설치 (캐시 활용)
COPY package*.json ./
# rolldown-vite와 같은 특수 의존성 처리를 위해 npm install 사용
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 실행 환경 (Nginx)
FROM nginx:stable-alpine
# Vite 빌드 결과물인 dist 폴더를 Nginx 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 기본 포트 80 노출
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]