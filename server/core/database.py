import MySQLdb
import config

def connect_db():
    conn = MySQLdb.connect(config.DATABASE_HOST, config.DATABASE_USERNAME, config.DATABASE_PASSWORD, config.DATABASE_NAME);
    return conn