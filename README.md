# COCOAVISION DISKCHART

코코아비전 메인스토리지 **/show**, **/show2** 폴더의 용량을 하루에 한 번 자동으로 `du` 명령으로 계산하여 Django + Chart.js로 시각화하는 내부망 전용 스토리지 모니터링 시스템입니다.

## 주요 기능
- `/show`, `/show2` 폴더 용량 자동 측정
- `du -xsb` 기반 정확한 바이트 단위 계산
- Django DB 저장 후 Chart.js 그래프 시각화
- cron으로 매일 00:01 자동 업데이트
- 내부망 전용 서비스 (nginx, gunicorn 미사용)
- systemd를 통한 runserver 서비스 운영

## 전체 구성도

            [ Cron ]
               │
   매일 00:01 /du/ API 호출
               ▼
     ┌────────────────────┐
     │   Django runserver │
     │  (systemd 서비스)  │
     └────────────────────┘
               │
       du 명령 실행 (show/show2)
               │
           결과 DB 저장
               │
               ▼
    ┌─────────────────────┐
    │ Chart.js Web UI     │
    │ 실시간 그래프 출력  │
    └─────────────────────┘


## 시스템 세팅

### 1) Python 패키지
| Package  | Version |
|----------|---------|
| Django   | 4.2.11  |
| asgiref  | 3.11.0  |
| sqlparse | 0.5.3   |
| bootstrap| 2.9.4   |
| Chart.js | static 제공 |
| gunicorn | 사용하지 않음 |

### 2) Systemd 서비스 설정
`/etc/systemd/system/diskchart.service`
```ini
[Unit]
Description=Diskchart Django Server (runserver, root-based)
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/diskchart
ExecStart=/opt/python/3.12/bin/python manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target

## 적용 명령

systemctl daemon-reload
systemctl enable diskchart
systemctl restart diskchart
systemctl status diskchart

## Cron 자동 갱신 설정

1 0 * * * curl -s -X POST http://127.0.0.1:8000/du/ >> /var/log/diskchart_refresh.log 2>&1

## 화면 예시

![Diskchart Preview](/images/image.png)

## 프로젝트 구조

diskchart/
├── config/
├── main/
│   ├── models.py
│   ├── views.py
│   └── ...
├── static/
├── templates/
│   └── index.html
└── manage.py

## 사용 방법
systemctl start diskchart

## 웹 접속 
http://서버_IP:8000

## 로그
tail -f /var/log/diskchart_refresh.log


