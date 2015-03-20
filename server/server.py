from flask import Flask, g, request, make_response
from core.database import connect_db
from core.permission import auth
import json
import jwt
import config

app = Flask(__name__)

from core.user import user
app.register_blueprint(user)
from core.product import product
app.register_blueprint(product)
from core.wantlist import wantlist
app.register_blueprint(wantlist)
from core.message import message
app.register_blueprint(message)
from core.bid import bid
app.register_blueprint(bid)
from core.comment import comment
app.register_blueprint(comment)

@app.before_request
def before_request():
    g.db = connect_db()

@app.after_request
def after_request(response):
    if g.db:
        g.db.close()

    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")

    return response

@auth.verify_password
def verify_password(token, password):
    try:
        payload = jwt.decode(token, config.SERVER_SECRET, algorithms=['HS256'])
        cur = g.db.cursor()
        cur.execute("SELECT UserId FROM User WHERE UserId = %s", str(payload["user_id"]))
        user_data = cur.fetchone()
        if user_data:
            g.user_id = payload["user_id"]
            return True
        else:
            return False
    except:
        return False

@auth.error_handler
def unauthorized():
    return make_response(json.dumps({"msg": "Unauthorized access"}), 403)

@app.errorhandler(404)
def not_found(error):
    return make_response(json.dumps({"msg": "Not found"}), 404)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)