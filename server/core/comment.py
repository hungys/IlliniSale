from flask import Blueprint, g, make_response, abort, request
from core.permission import auth
import json

comment = Blueprint("comment", __name__)

@comment.route('/comment/<int:comment_id>', methods=['PUT'])
@auth.login_required
def respond_to_comment(comment_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT Comment.CommentId, Product.UserId FROM Comment, Product \
        WHERE Comment.CommentId = %s AND Comment.ProductId = \
        Product.ProductId", (str(comment_id),))
    comment_data = cur.fetchone()

    if comment_data is None:
        abort(404)

    if comment_data[1] != g.user_id:
        abort(403)

    cur.execute("UPDATE Comment SET Response = %s WHERE CommentId = %s", (req_body["response"], 
        str(comment_id)))

    g.db.commit()

    return '', 200