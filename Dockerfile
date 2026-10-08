FROM cgr.dev/chainguard/nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY /dist/app/browser /usr/share/nginx/html


EXPOSE 80
