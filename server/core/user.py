from flask import Blueprint, g, make_response, abort, request
from core.permission import auth
from md5 import md5
import json
import jwt
import config

user = Blueprint("user", __name__)

@user.route('/user/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT Nickname, FirstName, LastName, ProfilePic, Gender, unix_timestamp(CreateAt) \
        FROM User WHERE UserId = %s", (str(user_id),))
    user_data = cur.fetchone()

    if user_data is None:
        abort(404)

    if g.user_id is None:
        is_followed = 0
    else:
        cur.execute("SELECT COUNT(*) FROM Follow WHERE FollowerUserId = %s AND FollowingUserId = %s", (str(g.user_id), str(user_id)))
        is_followed = cur.fetchone()[0]

    cur.execute("SELECT COUNT(ProductId) FROM Product WHERE UserId = %s", (str(user_id),))
    product_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(User.UserId) FROM User, Follow \
        WHERE Follow.FollowingUserId = %s AND User.UserId = Follow.FollowerUserId", 
        (str(user_id),))
    follower_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(User.UserId) FROM User, Follow \
        WHERE Follow.FollowerUserId = %s AND User.UserId = Follow.FollowingUserId", 
        (str(user_id),))
    following_count = cur.fetchone()[0]

    resp_body = {
        "user_id": user_id,
        "nickname": user_data[0],
        "first_name": user_data[1],
        "last_name": user_data[2],
        "profile_pic": user_data[3],
        "gender": bool(user_data[4]),
        "register_time": user_data[5],
        "product_count": product_count,
        "follower_count": follower_count,
        "following_count": following_count,
        "is_followed": is_followed
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/follower', methods=['GET'])
def get_user_follower(user_id):
    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
            User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Product WHERE Product.UserId = F1.FollowerUserId), \
            (SELECT COUNT(*) FROM Follow F2 WHERE F2.FollowingUserId = F1.FollowerUserId), 0 \
            FROM User, Follow F1 WHERE F1.FollowingUserId = %s AND \
            User.UserId = F1.FollowerUserId", (str(user_id),))
    else:
        cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
            User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Product WHERE Product.UserId = F1.FollowerUserId), \
            (SELECT COUNT(*) FROM Follow F2 WHERE F2.FollowingUserId = F1.FollowerUserId), \
            (SELECT COUNT(*) FROM Follow F3 WHERE F3.FollowingUserId = F1.FollowerUserId AND F3.FollowerUserId = %s)\
            FROM User, Follow F1 WHERE F1.FollowingUserId = %s AND \
            User.UserId = F1.FollowerUserId", (str(g.user_id), str(user_id)))
    followers_data = cur.fetchall()

    resp_body = []
    for follower_data in followers_data:
        resp_body.append({
            "user_id": follower_data[0],
            "nickname": follower_data[1],
            "first_name": follower_data[2],
            "last_name": follower_data[3],
            "profile_pic": follower_data[4],
            "gender": bool(follower_data[5]),
            "product_count": follower_data[6],
            "follower_count": follower_data[7],
            "is_followed": follower_data[8]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/following', methods=['GET'])
def get_user_following(user_id):
    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
            User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Product WHERE Product.UserId = F1.FollowingUserId), \
            (SELECT COUNT(*) FROM Follow F2 WHERE F2.FollowingUserId = F1.FollowingUserId), 0 \
            FROM User, Follow F1 WHERE F1.FollowerUserId = %s AND \
            User.UserId = F1.FollowingUserId", (str(user_id),))
    else:
        cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
            User.ProfilePic, User.Gender, \
            (SELECT COUNT(*) FROM Product WHERE Product.UserId = F1.FollowingUserId), \
            (SELECT COUNT(*) FROM Follow F2 WHERE F2.FollowingUserId = F1.FollowingUserId), \
            (SELECT COUNT(*) FROM Follow F3 WHERE F3.FollowingUserId = F1.FollowingUserId AND F3.FollowerUserId = %s) \
            FROM User, Follow F1 WHERE F1.FollowerUserId = %s AND \
            User.UserId = F1.FollowingUserId", (str(g.user_id), str(user_id)))
    followings_data = cur.fetchall()

    resp_body = []
    for following_data in followings_data:
        resp_body.append({
            "user_id": following_data[0],
            "nickname": following_data[1],
            "first_name": following_data[2],
            "last_name": following_data[3],
            "profile_pic": following_data[4],
            "gender": bool(following_data[5]),
            "product_count": following_data[6],
            "follower_count": following_data[7],
            "is_followed": following_data[8]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/product', methods=['GET'])
def get_user_product(user_id):
    cur = g.db.cursor()
    if g.user_id is None:
        cur.execute("SELECT ProductId, UserId, Name, Category, Description, \
            Price, Location, IsSold, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), 0, \
            (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
            FROM Product WHERE UserId = %s", (str(user_id),))
    else:
        cur.execute("SELECT ProductId, UserId, Name, Category, Description, \
            Price, Location, IsSold, \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId), \
            (SELECT COUNT(*) FROM Likes WHERE Likes.ProductId = Product.ProductId AND Likes.UserId = %s), \
            (SELECT FileName FROM Photo WHERE Photo.ProductId = Product.ProductId LIMIT 1) \
            FROM Product WHERE UserId = %s", (str(g.user_id), str(user_id)))
    products_data = cur.fetchall()

    resp_body = []
    for product_data in products_data:
        resp_body.append({
            "product_id": product_data[0],
            "name": product_data[2],
            "category": product_data[3],
            "description": product_data[4],
            "price": product_data[5],
            "location": product_data[6],
            "photo": product_data[10],
            "is_sold": product_data[7],
            "likes": product_data[8],
            "is_liked": product_data[9]
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/review', methods=['GET'])
def get_user_review(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT Review.ReviewId, Review.FromUserId, Review.Body, \
        Review.Rating, unix_timestamp(Review.CreateAt), User.Nickname, \
        User.FirstName, User.LastName, User.ProfilePic, User.Gender \
        FROM Review, User WHERE Review.ToUserId = %s AND \
        User.UserId = Review.FromUserId", (str(user_id),))
    reviews_data = cur.fetchall()

    cur.execute("SELECT COUNT(Rating) FROM Review WHERE \
        Review.ToUserId = %s AND Rating = -1", (str(user_id),))
    negative_count = cur.fetchone()[0]
    percentage = int(round(100 - (float(negative_count) / float(len(reviews_data)) * 100.0 if len(reviews_data) > 0 else 0)))

    reviews = []
    for review_data in reviews_data:
        reviews.append({
            "review_id": review_data[0],
            "reviewer": {
                "user_id": review_data[1],
                "nickname": review_data[5],
                "first_name": review_data[6],
                "last_name": review_data[7],
                "profile_pic": review_data[8],
                "gender": review_data[9]
            },
            "content": review_data[2],
            "rating": review_data[3],
            "timestamp": review_data[4]
        })

    resp_body = {
        "percentage": percentage,
        "reviews": reviews
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/follow', methods=['PUT'])
@auth.login_required
def toggle_user_follow(user_id):
    if user_id == g.user_id:
        abort(400)

    cur = g.db.cursor()
    cur.execute("SELECT COUNT(*) FROM Follow \
        WHERE FollowerUserId = %s AND FollowingUserId = %s", 
        (str(g.user_id), str(user_id)))
    is_followed = bool(cur.fetchone()[0])

    if is_followed:
        cur.execute("DELETE FROM Follow \
            WHERE FollowerUserId = %s AND FollowingUserId = %s", 
            (str(g.user_id), str(user_id)))
    else:
        cur.execute("INSERT INTO Follow(FollowerUserId, FollowingUserId) \
            VALUES(%s, %s)", (str(g.user_id), str(user_id)))

    g.db.commit()

    resp_body = {"followed": not is_followed}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user', methods=['POST'])
def register_user():
    req_body = json.loads(request.data)
    password_hashed = md5(req_body["password"]).hexdigest()
    cur = g.db.cursor()
    cur.execute("INSERT INTO User(Email, Password, Nickname, FirstName, \
        LastName, MobilePhone, Gender, Birthday) VALUES(%s, %s, %s, %s, \
        %s, %s, %s, %s)", (req_body["email"], password_hashed, 
        req_body["nickname"], req_body["first_name"], req_body["last_name"], 
        req_body["mobile_phone"], req_body["gender"], req_body["birthday"]))

    g.db.commit()

    token = jwt.encode({"user_id": cur.lastrowid}, config.SERVER_SECRET, algorithm="HS256")
    resp_body = {
        "user_id": cur.lastrowid,
        "token": token
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/check', methods=['POST'])
def check_email_valid():
    try:
        req_body = json.loads(request.data)
    except:
        abort(400)

    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM User WHERE Email = %s", (str(req_body["email"]),))
    user_data = cur.fetchone()

    valid = user_data is None
    resp_body = {"valid": valid}

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user', methods=['PUT'])
@auth.login_required
def edit_user():
    try:
        req_body = json.loads(request.data)
    except:
        abort(400)

    cur = g.db.cursor()
    cur.execute("SELECT Password, Nickname, FirstName, LastName, MobilePhone, Gender, Birthday \
        FROM User WHERE UserId = %s", (str(g.user_id),))
    user_data = cur.fetchone()

    if user_data is None:
        abort(404)

    password_hashed = md5(req_body["password"]).hexdigest() if "password" in req_body else user_data[0]
    nickname = req_body["nickname"] if "nickname" in req_body else user_data[1]
    first_name = req_body["first_name"] if "first_name" in req_body else user_data[2]
    last_name = req_body["last_name"] if "last_name" in req_body else user_data[3]
    mobile_phone = req_body["mobile_phone"] if "mobile_phone" in req_body else user_data[4]
    gender = req_body["gender"] if "gender" in req_body else user_data[5]
    birthday = req_body["birthday"] if "birthday" in req_body else user_data[6]

    cur.execute("UPDATE User SET Password = %s, Nickname = %s, FirstName = %s, \
        LastName = %s, MobilePhone = %s, Gender = %s, Birthday = %s \
        WHERE UserId = %s", (password_hashed, nickname, first_name, 
        last_name, mobile_phone, gender, birthday, str(g.user_id)))

    g.db.commit()

    return '', 200

@user.route('/user/auth', methods=['POST'])
def get_user_token():
    req_body = json.loads(request.data)
    password_hashed = md5(req_body["password"]).hexdigest()
    cur = g.db.cursor()
    cur.execute("SELECT UserId FROM User WHERE Email = %s AND \
        Password = %s", (req_body["email"], password_hashed))
    user_data = cur.fetchone()

    if user_data is None:
        abort(401)
    else:
        token = jwt.encode({"user_id": user_data[0]}, config.SERVER_SECRET, algorithm="HS256")
        resp_body = {
            "user_id": user_data[0],
            "token": token
        }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/review', methods=['POST'])
@auth.login_required
def review_user(user_id):
    if user_id == g.user_id:
        abort(400)

    req_body = json.loads(request.data)
    cur = g.db.cursor()
    cur.execute("INSERT INTO Review(BidId, FromUserId, ToUserId, Body, Rating) \
        VALUES(%s, %s, %s, %s, %s)", (str(req_body["bid_id"]), str(g.user_id), str(user_id), 
        req_body["content"], str(req_body["rating"])))

    g.db.commit()

    return '', 200