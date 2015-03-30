from flask import Blueprint, g, make_response, abort, request
from core.permission import auth
import json

product = Blueprint("product", __name__)

@product.route('/product/category/<string:category>', methods=['GET'])
def get_products(category):
    page = request.args.get("page")
    page = 1 if page is None else int(page)
    rows_per_page = 30
    offset = rows_per_page * (page - 1)

    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), 0 \
            FROM Product, User WHERE Product.Category = %s AND \
            User.UserId = Product.UserId ORDER BY Product.Ranking,Product.CreateAt DESC \
            LIMIT %s,%s", (category, offset, rows_per_page))
    else:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s) \
            FROM Product, User WHERE Product.Category = %s AND \
            User.UserId = Product.UserId ORDER BY Product.Ranking,Product.CreateAt DESC \
            LIMIT %s,%s", (str(g.user_id), category, offset, rows_per_page))
    products_data = cur.fetchall()

    resp_body = []
    for product_data in products_data:
        resp_body.append({
            "product_id": product_data[0],
            "seller": {
                "user_id": product_data[1],
                "nickname": product_data[8],
                "first_name": product_data[9],
                "last_name": product_data[10],
                "profile_pic": product_data[11],
                "gender": product_data[12]
            },
            "name": product_data[2],
            "category": product_data[3],
            "description": product_data[4],
            "price": product_data[5],
            "location": product_data[6],
            "photo": "",
            "is_sold": product_data[7],
            "likes": product_data[13],
            "is_liked": product_data[14]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/<int:product_id>', methods=['GET'])
def get_product(product_id):
    cur = g.db.cursor()
    cur.execute("SELECT Product.UserId, Product.Name, Product.Category, \
        Product.Description, Product.Price, Product.Location, Product.IsSold, \
        unix_timestamp(Product.CreateAt), User.Nickname, \
        User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
        (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) \
        FROM Product, User WHERE Product.ProductId = %s AND \
        User.UserId = Product.UserId", str(product_id))
    product_data = cur.fetchone()

    cur.execute("SELECT Name FROM Tag WHERE ProductId = %s", str(product_id))
    tags_data = cur.fetchall()
    product_tags = []
    for tag_data in tags_data:
        product_tags.append(tag_data[0])

    cur.execute("SELECT Comment.CommentId, Comment.UserId, Comment.Body, Comment.Response, \
        unix_timestamp(Comment.CreateAt), unix_timestamp(Comment.UpdateAt), \
        User.Nickname, User.ProfilePic FROM Comment, User WHERE \
        Comment.ProductId = %s AND Comment.UserId = User.UserId \
        ORDER BY Comment.CreateAt DESC", str(product_id))
    comments_data = cur.fetchall()
    product_comments = []
    for comment_data in comments_data:
        product_comments.append({
            "comment_id": comment_data[0],
            "user_id": comment_data[1],
            "content": comment_data[2],
            "response": comment_data[3],
            "comment_time": comment_data[4],
            "response_time": comment_data[5] if comment_data[3] is not None else 0,
            "user_nickname": comment_data[6],
            "user_profile_pic": comment_data[7]
        })

    cur.execute("SELECT FileName FROM Photo WHERE ProductId = %s", str(product_id))
    photos_data = cur.fetchall()
    product_photos = []
    for photo_data in photos_data:
        product_photos.append(photo_data[0])

    if g.user_id is None:
        is_liked = 0
    else:
        cur.execute("SELECT UserId FROM Likes WHERE ProductId = %s AND UserId = %s", (str(product_id), str(g.user_id)))
        is_liked = 0 if cur.fetchone() is None else 1

    if product_data is None:
        abort(404)
    
    resp_body = {
        "product_id": product_id,
        "seller": {
            "user_id": product_data[0],
            "nickname": product_data[8],
            "first_name": product_data[9],
            "last_name": product_data[10],
            "profile_pic": product_data[11],
            "gender": product_data[12]
        },
        "name": product_data[1],
        "category": product_data[2],
        "description": product_data[3],
        "price": product_data[4],
        "location": product_data[5],
        "photos": product_photos,
        "comments": product_comments,
        "tags": product_tags,
        "is_sold": product_data[6],
        "post_time": product_data[7],
        "likes": product_data[13],
        "is_liked": is_liked
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/query', methods=['GET'])
def search_product():
    keyword_pattern = "%" + request.args.get("keyword").lower() + "%"
    page = request.args.get("page")
    page = 1 if page is None else int(page)
    rows_per_page = 30
    offset = rows_per_page * (page - 1)

    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), 0 \
            FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
            User.UserId = Product.UserId ORDER BY Product.Ranking,Product.CreateAt DESC \
            LIMIT %s,%s", (keyword_pattern, offset, rows_per_page))
    else:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s) \
            FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
            User.UserId = Product.UserId ORDER BY Product.Ranking,Product.CreateAt DESC \
            LIMIT %s,%s", (str(g.user_id), keyword_pattern, offset, rows_per_page))
    products_data = cur.fetchall()

    resp_body = []
    for product_data in products_data:
        resp_body.append({
            "product_id": product_data[0],
            "seller": {
                "user_id": product_data[1],
                "nickname": product_data[8],
                "first_name": product_data[9],
                "last_name": product_data[10],
                "profile_pic": product_data[11],
                "gender": product_data[12]
            },
            "name": product_data[2],
            "category": product_data[3],
            "description": product_data[4],
            "price": product_data[5],
            "location": product_data[6],
            "photo": "",
            "is_sold": product_data[7],
            "likes": product_data[13],
            "is_liked": product_data[14]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product', methods=['POST'])
@auth.login_required
def post_product():
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("INSERT INTO Product(UserId, Name, Category, Description, \
        Price, Location) VALUES(%s, %s, %s, %s, %s, %s)", (str(g.user_id), 
        req_body["name"], req_body["category"], req_body["description"], 
        str(req_body["price"]), req_body["location"]))

    product_id = cur.lastrowid

    for tag in req_body["tags"]:
        cur.execute("INSERT INTO Tag(ProductId, Name) VALUES(%s, %s)", (str(product_id), tag))

    g.db.commit()

    resp_body = {"product_id": product_id}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/<int:product_id>/bid', methods=['POST'])
@auth.login_required
def bid_product(product_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", str(product_id))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    cur.execute("INSERT INTO Bid(UserId, ProductId, Price, Status) VALUES(%s, %s, \
        %s, 'new')", (str(g.user_id), str(product_id), str(req_body["price"])))

    g.db.commit()

    resp_body = {"bid_id": cur.lastrowid}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/<int:product_id>/comment', methods=['POST'])
@auth.login_required
def post_product_comment(product_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", str(product_id))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    cur.execute("INSERT INTO Comment(UserId, ProductId, Body) VALUES(%s, %s, \
        %s)", (str(g.user_id), str(product_id), req_body["content"]))

    g.db.commit()

    resp_body = {"comment_id": cur.lastrowid}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/<int:product_id>/like', methods=['PUT'])
@auth.login_required
def toggle_product_like(product_id):
    cur = g.db.cursor()
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", str(product_id))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    cur.execute("SELECT COUNT(*) FROM Likes WHERE UserId = %s AND \
        ProductId = %s", (str(g.user_id), str(product_id)))
    is_liked = bool(cur.fetchone()[0])

    if is_liked:
        cur.execute("DELETE FROM Likes \
            WHERE UserId = %s AND ProductId = %s", 
            (str(g.user_id), str(product_id)))
    else:
        cur.execute("INSERT INTO Likes(UserId, ProductId) \
            VALUES(%s, %s)", (str(g.user_id), str(product_id)))

    g.db.commit()

    resp_body = {"liked": not is_liked}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp