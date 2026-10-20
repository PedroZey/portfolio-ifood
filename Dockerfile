FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js pet-icon.png /usr/share/nginx/html/
EXPOSE 8080
