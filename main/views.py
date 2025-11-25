from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpRequest, HttpResponseBase
from .models import DiskUsage
import hashlib
import pathlib
import os, json, time
import subprocess
from multiprocessing import Pool
import shlex

# Create your views here.

CACHE_DIR = "/home/mw/diskchart_cache"

BASE_PATH = [
    '/show',
    '/show2'
    ]

def df_available_space(path: str) -> int:
    """Return available space (in bytes) for the filesystem that contains path."""
    
    # df -B1 = 1 byte 단위로 출력
    cmd = ["sudo","df", "-B1", path]
    
    try:
        output = subprocess.check_output(cmd, stderr=subprocess.STDOUT).decode().splitlines()
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] df failed for {path}: {e.output.decode()}")
        return 0

    # df 출력 예:
    # Filesystem     1B-blocks        Used    Available Use% Mounted on
    # /dev/sdb1     48023552000  123123123  47800000000   2% /show
    #
    # → 두 번째 줄을 split 해서 3번째 칼럼이 Available
    if len(output) < 2:
        return 0

    cols = output[1].split()
    # df 결과의 4번째 필드가 "Available"
    try:
        available_bytes = int(cols[3])
    except:
        available_bytes = 0

    return available_bytes

class Main(View):
    def get(self, request: HttpRequest) -> HttpResponse:
        return render(request, 'index.html')
    
class HashManager:
    def __init__(self):
        self.path = None
    
    def normalize(self, path: str) -> None:
        self.path = path.strip()
        if self.path != '/' and self.path.endswith('/'):
            self.path = self.path[:-1]
        if not self.path.startswith('/'):
            self.path = '/' + self.path
    
    def create_sha1_hash(self) -> str:
        encoded_string = self.path.encode('utf-8')
        sha1_hash = hashlib.sha1()
        sha1_hash.update(encoded_string)
        return sha1_hash.hexdigest()


def du_task(path: str):
    cmd = f"sudo du -xsb {shlex.quote(path)} 2>/dev/null"
    try:
        output = subprocess.check_output(cmd, shell=True).decode().strip()
        return output  # "12345   /show/DEV/assets"
    except Exception as e:
        print(f"[ERROR] DU FAILED: {path} → {e}")
        return None
    
class Db(View):
    def get(self, request: HttpRequest) -> HttpResponse:
        if request.method != "GET":
            return JsonResponse({"error": "GET only"}, status=405)
        content = DiskUsage.objects.all().values()   
        result = {"result": list(content)}           
        return JsonResponse(result, safe=False) 


@method_decorator(csrf_exempt, name='dispatch')
class Du(View):

    def post(self, request: HttpRequest) -> HttpResponseBase:

        if request.method != "POST":
            return JsonResponse({"error": "POST only"}, status=405)

        all_results = {}

        for root_path in BASE_PATH:

            start_time = time.time()
            root = pathlib.Path(root_path)
            # hash_mgr = HashManager()
            # hash_mgr.normalize(root_path)
            # volume_hash = hash_mgr.create_sha1_hash()

            child_dirs = [
                str(p) for p in root.iterdir()
                if p.is_dir() and not p.name.startswith(".")
            ]

            print(f"[INFO] Running parallel DU on {root_path}...")
            with Pool(processes=4) as pool:
                du_results = pool.map(du_task, child_dirs)

            available_space = df_available_space(root_path)
            elapsed_time = time.time() - start_time

            content_sizes = []
            for output, path in zip(du_results, child_dirs):
                if not output:
                    continue

                size_str = output.split()[0] 

                if not size_str.isdigit():
                    continue

                size_int = int(size_str)
                folder_name = pathlib.Path(path).name

                DiskUsage.objects.create(
                    root=root_path,
                    folder=folder_name,
                    size=size_int,
                    available_space=available_space
                )

                content_sizes.append(f"{path}={size_str}")

            result = {
                "contentSizes": content_sizes,
                "messages": [],
                "availableSpace": available_space,
                "ellapsedTime": elapsed_time
            }

            # self.cache_save(volume_hash, result)

            all_results[root_path] = result

        return JsonResponse(all_results)


    def cache_save(self, volume_hash: str, data: dict) -> None:
        os.makedirs(CACHE_DIR, exist_ok=True)
        file_path = f"{CACHE_DIR}/{volume_hash}.json"
        with open(file_path, "w") as f:
            json.dump(data, f)

    
    def du(self, path: str) -> list[str]:
        cmd = f'sudo du -xsb {shlex.quote(path)} 2>&1'
        print("Executing:", cmd)
        return os.popen(cmd).readlines()



def test(request: HttpRequest):
    with open("/home/mw/Desktop/foo.txt", "w") as f:
        f.write("hello world")
    return HttpResponse("OK")
