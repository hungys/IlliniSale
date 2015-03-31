from flask import Blueprint, g, make_response, abort, request
from core.permission import auth
import json

wantlist = Blueprint("wantlist", __name__)

@wantlist.route('/wantlist', methods=['GET'])
@auth.login_required
def get_my_wantlist():
    cur = g.db.cursor()
    cur.execute("SELECT WantlistId, Name, unix_timestamp(CreateAt) FROM Wantlist \
        WHERE UserId = %s ORDER BY CreateAt DESC", (str(g.user_id),))
    wantlists_data = cur.fetchall()

    resp_body = []
    for wantlist_data in wantlists_data:
        resp_body.append({
            "wantlist_id": wantlist_data[0],
            "name": wantlist_data[1],
            "create_time": wantlist_data[2]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@wantlist.route('/wantlist', methods=['POST'])
@auth.login_required
def post_wantlist():
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("INSERT INTO Wantlist(UserId, Name) VALUES(%s, %s)", (str(g.user_id), 
        req_body["name"]))

    g.db.commit()

    resp_body = {"wantlist_id": cur.lastrowid}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@wantlist.route('/wantlist/<int:wantlist_id>', methods=['PUT'])
@auth.login_required
def edit_wantlist(wantlist_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM Wantlist WHERE WantlistId = %s", (str(wantlist_id),))
    wantlist_data = cur.fetchone()

    if wantlist_data is None:
        abort(404)

    if wantlist_data[0] != g.user_id:
        abort(403)

    cur.execute("UPDATE Wantlist SET Name = %s WHERE WantlistId = %s", (req_body["name"], 
        str(wantlist_id)))

    g.db.commit()

    return '', 200

@wantlist.route('/wantlist/<int:wantlist_id>', methods=['DELETE'])
@auth.login_required
def delete_wantlist(wantlist_id):
    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM Wantlist WHERE WantlistId = %s", (str(wantlist_id),))
    wantlist_data = cur.fetchone()

    if wantlist_data is None:
        abort(404)

    if wantlist_data[0] != g.user_id:
        abort(403)

    cur.execute("DELETE FROM Wantlist WHERE WantlistId = %s", (str(wantlist_id),))

    g.db.commit()

    return '', 200