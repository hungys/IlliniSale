from flask import Blueprint, g, make_response, abort, request, current_app
from werkzeug import secure_filename
from core.permission import auth
import json
import os
import uuid

product = Blueprint("product", __name__)

@product.route('/product/category/<string:category>', methods=['GET'])
def get_products(category):
    page = request.args.get("page")
    page = 1 if page is None else int(page)
    rows_per_page = 4
    offset = rows_per_page * (page - 1)

    if page <= 0:
        abort(400)

    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, 0 , \
            (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
            FROM Product, User WHERE Product.Category = %s AND \
            User.UserId = Product.UserId ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
            LIMIT %s,%s", (category, offset, rows_per_page))
    else:
        cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
            Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
            User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s), \
            (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
            FROM Product, User WHERE Product.Category = %s AND \
            User.UserId = Product.UserId ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
            LIMIT %s,%s", (str(g.user_id), category, offset, rows_per_page))
    products_data = cur.fetchall()

    cur.execute("SELECT COUNT(Product.ProductId) FROM Product WHERE Product.Category \
        = %s", (category, ))
    total_pages = cur.fetchone()[0] / rows_per_page + 1

    resp_body = {}
    resp_body["total_pages"] = total_pages
    resp_body["results"] = []
    for product_data in products_data:
        resp_body["results"].append({
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
            "photo": product_data[15],
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
        User.UserId = Product.UserId", (str(product_id),))
    product_data = cur.fetchone()

    cur.execute("SELECT Comment.CommentId, Comment.UserId, Comment.Body, Comment.Response, \
        unix_timestamp(Comment.CreateAt), unix_timestamp(Comment.UpdateAt), \
        User.Nickname, User.ProfilePic FROM Comment, User WHERE \
        Comment.ProductId = %s AND Comment.UserId = User.UserId \
        ORDER BY Comment.CreateAt DESC", (str(product_id),))
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

    cur.execute("SELECT PhotoId, FileName FROM Photo WHERE ProductId = %s", (str(product_id),))
    photos_data = cur.fetchall()
    product_photos = []
    for photo_data in photos_data:
        product_photos.append({
            "photo_id": photo_data[0],
            "filename": photo_data[1]    
        })

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
        "tags": get_tags_of_product(product_id),
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
    keyword_arg = request.args.get("keyword") if "keyword" in request.args else ""
    price_low_arg = int(request.args.get("price_low")) if "price_low" in request.args and request.args.get("price_low") != "" else 0
    price_high_arg = int(request.args.get("price_high")) if "price_high" in request.args and request.args.get("price_high") != "" else 100000
    category_arg = request.args.get("category") if "category" in request.args else ""

    keyword_pattern = "%" + keyword_arg + "%"
    page = request.args.get("page")
    page = 1 if page is None else int(page)
    rows_per_page = 4
    offset = rows_per_page * (page - 1)

    cur = g.db.cursor()
    if category_arg != "":
        if g.user_id is None:
            cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
                Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
                User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, 0, \
                (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
                FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
                User.UserId = Product.UserId AND Product.Category = %s AND \
                Product.Price >= %s AND Product.Price <= %s \
                ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
                LIMIT %s,%s", (keyword_pattern, category_arg, str(price_low_arg), str(price_high_arg), offset, rows_per_page))
        else:
            cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
                Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
                User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s), \
                (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
                FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
                User.UserId = Product.UserId AND Product.Category = %s AND \
                Product.Price >= %s AND Product.Price <= %s \
                ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
                LIMIT %s,%s", (str(g.user_id), keyword_pattern, category_arg, str(price_low_arg), str(price_high_arg), offset, rows_per_page))
        products_data = cur.fetchall()

        cur.execute("SELECT COUNT(Product.ProductId) FROM Product \
            WHERE LOWER(Product.Name) LIKE %s AND Product.Category = %s \
            AND Product.Price >= %s AND Product.Price <= %s", (keyword_pattern, category_arg, str(price_low_arg), str(price_high_arg)))
        total_pages = cur.fetchone()[0] / rows_per_page + 1
    else:
        if g.user_id is None:
            cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
                Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
                User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, 0, \
                (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
                FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
                User.UserId = Product.UserId AND Product.Price >= %s AND Product.Price <= %s \
                ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
                LIMIT %s,%s", (keyword_pattern, str(price_low_arg), str(price_high_arg), offset, rows_per_page))
        else:
            cur.execute("SELECT Product.ProductId, Product.UserId, Product.Name, \
                Product.Category, Product.Description, Product.Price, Product.Location, Product.IsSold, \
                User.Nickname, User.FirstName, User.LastName, User.ProfilePic, User.Gender, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId) AS LikesCount, \
                (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s), \
                (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
                FROM Product, User WHERE LOWER(Product.Name) LIKE %s AND \
                User.UserId = Product.UserId AND Product.Price >= %s AND Product.Price <= %s \
                ORDER BY Product.IsSold ASC, LikesCount DESC, Product.CreateAt DESC \
                LIMIT %s,%s", (str(g.user_id), keyword_pattern, str(price_low_arg), str(price_high_arg), offset, rows_per_page))
        products_data = cur.fetchall()

        cur.execute("SELECT COUNT(Product.ProductId) FROM Product \
            WHERE LOWER(Product.Name) LIKE %s \
            AND Product.Price >= %s AND Product.Price <= %s", (keyword_pattern, str(price_low_arg), str(price_high_arg)))
        total_pages = cur.fetchone()[0] / rows_per_page + 1

    resp_body = {}
    resp_body["total_pages"] = total_pages
    resp_body["results"] = []
    for product_data in products_data:
        resp_body["results"].append({
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
            "photo": product_data[15],
            "is_sold": product_data[7],
            "likes": product_data[13],
            "is_liked": product_data[14]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/query/autocomplete', methods=['GET'])
def autocomplete():
    keyword = request.args.get("keyword")
    resp_body = current_app.autocomplete_provider.autocomplete(keyword)

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

    update_tags_of_product(product_id, req_body["tags"])

    g.db.commit()

    resp_body = {"product_id": product_id}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/<int:product_id>', methods=['PUT'])
@auth.login_required
def edit_product(product_id):
    try:
        req_body = json.loads(request.data)
    except:
        abort(400)

    cur = g.db.cursor()
    cur.execute("SELECT Name, Category, Description, Price, Location \
        FROM Product WHERE UserId = %s AND ProductId = %s", (str(g.user_id), str(product_id)))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    name = req_body["name"] if "name" in req_body else product_data[0]
    category = req_body["category"] if "category" in req_body else product_data[1]
    description = req_body["description"] if "description" in req_body else product_data[2]
    price = req_body["price"] if "price" in req_body else product_data[3]
    location = req_body["location"] if "location" in req_body else product_data[4]

    if "tags" in req_body:
        update_tags_of_product(product_id, req_body["tags"])

    cur.execute("UPDATE Product SET Name = %s, Category = %s, Description = %s, \
        Price = %s, Location = %s \
        WHERE ProductId = %s", (name, category, description, price, 
            location, str(product_id)))

    g.db.commit()

    return '', 200

@product.route('/product/<int:product_id>/bid', methods=['POST'])
@auth.login_required
def bid_product(product_id):
    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", (str(product_id),))
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
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", (str(product_id),))
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
    cur.execute("SELECT ProductId FROM Product WHERE ProductId = %s", (str(product_id),))
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

@product.route('/product/<int:product_id>/sold', methods=['PUT'])
@auth.login_required
def toggle_product_sold(product_id):
    cur = g.db.cursor()
    cur.execute("SELECT ProductId, IsSold FROM Product WHERE ProductId = %s AND UserId = %s", (str(product_id), str(g.user_id)))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    is_sold = product_data[1] == 1

    if is_sold:
        cur.execute("UPDATE Product SET IsSold = 0 WHERE ProductId = %s", (str(product_id), ))
        is_sold = False
    else:
        cur.execute("UPDATE Product SET IsSold = 1 WHERE ProductId = %s", (str(product_id), ))
        is_sold = True

    g.db.commit()

    resp_body = {"sold": is_sold}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@product.route('/product/upload', methods=['POST'])
def upload_product_photo():
    product_id = request.form['product_id']
    photo_file = request.files['file']
    filename = str(uuid.uuid1()) + "." + get_file_extension(photo_file.filename)
    if photo_file:
        photo_file.save(os.path.join("uploads/product", filename))
    
    cur = g.db.cursor()
    cur.execute("INSERT INTO Photo(ProductId, FileName) VALUES(%s, %s)", (str(product_id), filename))
    g.db.commit()

    return '', 200

@product.route('/product/upload/<int:photo_id>', methods=['DELETE'])
@auth.login_required
def delete_product_photo(photo_id):
    cur = g.db.cursor()
    cur.execute("SELECT Product.UserId, Photo.FileName FROM Product, Photo \
        WHERE Product.ProductId = Photo.ProductId AND Photo.PhotoId = %s", (str(photo_id),))
    product_data = cur.fetchone()

    if product_data is None:
        abort(404)

    if product_data[0] != g.user_id:
        abort(403)

    try:
        os.remove(os.path.join("uploads/product", product_data[1]))
    except:
        pass

    cur.execute("DELETE FROM Photo WHERE PhotoId = %s", (str(photo_id),))
    g.db.commit()

    return '', 200

def get_file_extension(filename):
    token = filename.split(".")
    return token[-1] if len(token) > 1 else None

def parse_tags(tags):
    start_idx = 0
    in_quote = False
    result = []

    tags = tags.strip()
    i = 0

    while i < len(tags):
        if tags[i] == "\"" and not in_quote:
            in_quote = True
            start_idx = i + 1
        elif tags[i] == "\"" and in_quote:
            result.append(tags[start_idx:i].strip())
            in_quote = False
            start_idx = i + 2
            i = i + 1
        elif tags[i] == " " and not in_quote:
            if tags[start_idx:i].strip() != "":
                result.append(tags[start_idx:i].strip())
                start_idx = i + 1
        elif i == len(tags) - 1:
            result.append(tags[start_idx:i+1].strip())

        i = i + 1

    return result

def get_tags_of_product(product_id):
    cur = g.db.cursor()
    cur.execute("SELECT Name FROM Tag WHERE ProductId = %s", (str(product_id),))
    tags_data = cur.fetchall()

    tags = []
    for tag in tags_data:
        tags.append(tag[0])

    return tags

def update_tags_of_product(product_id, tags_str):
    original_tag_set = set(get_tags_of_product(product_id))
    updated_tag_set = set(parse_tags(tags_str))

    to_be_inserted = updated_tag_set.difference(original_tag_set)
    to_be_deleted = original_tag_set.difference(updated_tag_set)

    cur = g.db.cursor()

    for tag in to_be_inserted:
        cur.execute("INSERT INTO Tag(ProductId, Name) VALUES(%s, %s)", (str(product_id), tag))

    for tag in to_be_deleted:
        cur.execute("DELETE FROM Tag WHERE ProductId = %s AND Name = %s", (str(product_id), tag))

    g.db.commit()