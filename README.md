# COCOAVISION Diskchart

COCOAVISION 내부 스토리지의 디스크 용량을 자동으로 측정하고  
Chart.js 기반 그래프 형태로 시각화하는 Django 기반 모니터링 시스템입니다.

이 서비스는 아래 구조로 동작합니다:

Client → Nginx → Gunicorn → Django

---

## 주요 기능

- `/du/` API 요청 시 서버 로컬 디스크 용량(df/du)을 자동 측정  
- 측정된 값은 Django 모델(DiskUsage)에 저장  
- 프론트엔드에서 Chart.js로 그래프 시각화  
- Gunicorn + Nginx를 이용한 실서비스 환경 구성  
- Cron으로 매일 자동 디스크 업데이트 가능

---

## 사용 중인 버전

```bash
asgiref   3.11.0
Django    4.2.11
gunicorn  23.0.0
packaging 25.0
pip       25.3
sqlparse  0.5.3

## /etc/systemd/system/gunicorn.service

[Unit]
Description=Gunicorn daemon for Diskchart
After=network.target

[Service]
User=root
Group=root
PermissionsStartOnly=true
WorkingDirectory=/home/cocoa/diskchart
ExecStart=/opt/python/3.12/bin/gunicorn --workers 3 --bind unix:/home/cocoa/diskchart/gunicorn.sock config.wsgi:application

[Install]
WantedBy=multi-user.target

## 적용
systemctl daemon-reload
systemctl enable gunicorn
systemctl restart gunicorn

## /etc/nginx/conf.d/diskchart.conf
[Unit]
Description=Gunicorn daemon for Diskchart
After=network.target

[Service]
User=root
Group=root
PermissionsStartOnly=true
WorkingDirectory=/home/cocoa/diskchart
ExecStart=/opt/python/3.12/bin/gunicorn --workers 3 --bind unix:/home/cocoa/diskchart/gunicorn.sock config.wsgi:application

[Install]
WantedBy=multi-user.target

[root@localhost ~]# cat /etc/nginx/conf.d/diskchart.conf
server {
    listen 80 default_server;
    server_name _;

    # STATIC FILES
    location /static/ {
        alias /home/cocoa/diskchart/main/static/;
    }

    # Django → Gunicorn 소켓 연결
    location / {
        proxy_pass http://unix:/home/cocoa/diskchart/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

	proxy_read_timeout 7200;
	proxy_connect_timeout 7200;
	proxy_send_timeout 7200;
	proxy_buffering off;
	proxy_request_buffering off;
    }
}

## 적용
systemctl restart nginx

## 크론탭 설정
crontab -e 
1 0 * * * curl -s -X POST http://127.0.0.1:80/du/ >> /var/log/diskchart_refresh.log 2>&1

## sudoers 권한 허용
cocoa ALL=(root) NOPASSWD: /usr/bin/df, /usr/bin/du


