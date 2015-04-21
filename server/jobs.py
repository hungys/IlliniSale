from job.recommender import RecommenderJob
from threading import Thread
import time
import config

def start_background_jobs():
    recommender_job_thread = Thread(target=recommender_job)
    recommender_job_thread.setDaemon(True)
    recommender_job_thread.start()

def recommender_job():
    print "Recommender job running with period %d seconds..." % config.RECOMMENDER_JOB_PERIOD
    job = RecommenderJob()
    while True:
        job.run()
        print "Recommender job success"
        time.sleep(config.RECOMMENDER_JOB_PERIOD)