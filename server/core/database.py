import MySQLdb
import redis
import config

def connect_db():
    conn = MySQLdb.connect(config.DATABASE_HOST, config.DATABASE_USERNAME, config.DATABASE_PASSWORD, config.DATABASE_NAME);
    return conn

def connect_redis():
    conn = redis.StrictRedis(host=config.REDIS_HOST, port=6379, db=0, password=config.REDIS_PASSWORD)
    return conn