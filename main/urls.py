from django.urls import path
from .views import Main, HashManager, Du, Db
from . import views

urlpatterns = [
    path('', Main.as_view(), name="index"),
    path('du/', Du.as_view()),
    path('db/', Db.as_view())
    # path('path/<str:path>/', HashManager.as_view()),
    # path('test/', views.test, name="test")
]