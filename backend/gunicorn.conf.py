import multiprocessing

bind = "127.0.0.1:1500"
workers = multiprocessing.cpu_count() * 2 + 1
timeout = 0
threads = 2


# gunicorn -w 4 -b :1500 'app:create_app()' -c gunicorn.conf.ini   