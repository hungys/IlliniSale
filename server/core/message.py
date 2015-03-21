from flask import Blueprint, g, make_response, abort, request
from core.permission import auth
import json

message = Blueprint("message", __name__)

@message.route('/message/<int:user_id>', methods=['GET'])
@auth.login_required
def get_conversation(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM User WHERE UserId = %s", str(user_id))
    user_data = cur.fetchone()

    if user_data is None:
        abort(404)

    if user_id == g.user_id:
        abort(400)

    if g.user_id > user_id:
        smaller_userid = user_id
        greater_userid = g.user_id
    else:
        smaller_userid = g.user_id
        greater_userid = user_id

    cur.execute("SELECT SpeakerUserId, Body, unix_timestamp(CreateAt) \
        FROM Message WHERE SmallerUserId = %s AND \
        GreaterUserId = %s ORDER BY CreateAt DESC", (str(smaller_userid), str(greater_userid)))
    messages_data = cur.fetchall()

    resp_body = []
    for message_data in messages_data:
        resp_body.append({
            "speaker": message_data[0],
            "content": message_data[1],
            "timestamp": message_data[2] 
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@message.route('/message/<int:user_id>', methods=['POST'])
@auth.login_required
def send_message(user_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM User WHERE UserId = %s", str(user_id))
    user_data = cur.fetchone()

    if user_data is None:
        abort(404)

    if user_id == g.user_id:
        abort(400)

    if g.user_id > user_id:
        smaller_userid = user_id
        greater_userid = g.user_id
    else:
        smaller_userid = g.user_id
        greater_userid = user_id

    cur.execute("INSERT INTO Message(SmallerUserId, GreaterUserId, SpeakerUserId, \
        Body) VALUES(%s, %s, %s, %s)", (str(smaller_userid), str(greater_userid),  
        str(g.user_id), req_body["content"]))

    g.db.commit()

    resp_body = {"message_id": cur.lastrowid}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp