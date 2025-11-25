from django.db import models
from django.utils import timezone
# Create your models here.


# ✔ 실제 예시 데이터 (DB에 들어가는 형태)
# id	root	folder	    size	     available_space	created_at
# 1	   /show	DEV	   1199662571800	186282675273728	    2025-11-25
# 2	   /show	RND	   1692711915083	186282675273728	    2025-11-25
# 3	   /show	lib	    16301156876	    186282675273728	    2025-11-25
# 4	   /show2	wds	   10074583427279	123456789123456	    2025-11-25
# 5	   /show2	sgl	    2047934420256	123456789123456	    2025-11-25

class DiskUsage(models.Model):
    root = models.CharField(max_length=50)
    folder = models.CharField(max_length=255)
    size = models.BigIntegerField()
    available_space = models.BigIntegerField()
    created_at = models.DateTimeField(default=timezone.now)


