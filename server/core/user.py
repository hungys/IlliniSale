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
        FROM User WHERE UserId = %s", str(user_id))
    user_data = cur.fetchone()

    if user_data is None:
        abort(404)

    cur.execute("SELECT COUNT(ProductId) FROM Product WHERE UserId = %s", str(user_id))
    product_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(User.UserId) FROM User, Follow \
        WHERE Follow.FollowingUserId = %s AND User.UserId = Follow.FollowerUserId", 
        str(user_id))
    follower_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(User.UserId) FROM User, Follow \
        WHERE Follow.FollowerUserId = %s AND User.UserId = Follow.FollowingUserId", 
        str(user_id))
    following_count = cur.fetchone()[0]

    resp_body = {
        "nickname": user_data[0],
        "first_name": user_data[1],
        "last_name": user_data[2],
        "profile_pic": user_data[3],
        "gender": bool(user_data[4]),
        "register_time": user_data[5],
        "product_count": product_count,
        "follower_count": follower_count,
        "following_count": following_count
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/follower', methods=['GET'])
def get_user_follower(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
        User.ProfilePic, User.Gender FROM User, Follow \
        WHERE Follow.FollowingUserId = %s AND User.UserId = Follow.FollowerUserId", 
        str(user_id))
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
            "product_count": 0,
            "follower_count": 0
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/following', methods=['GET'])
def get_user_following(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT User.UserId, User.Nickname, User.FirstName, User.LastName, \
        User.ProfilePic, User.Gender FROM User, Follow \
        WHERE Follow.FollowerUserId = %s AND User.UserId = Follow.FollowingUserId", 
        str(user_id))
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
            "product_count": 0,
            "follower_count": 0
        })

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/product', methods=['GET'])
def get_user_product(user_id):
    cur = g.db.cursor()
    cur.execute("SELECT ProductId, UserId, Name, Category, Description, \
        Price, Location, IsSold FROM Product WHERE UserId = %s", str(user_id))
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
            "photo": "",
            "likes": 0,
            "is_sold": product_data[7]
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
        User.UserId = Review.FromUserId", str(user_id))
    reviews_data = cur.fetchall()

    cur.execute("SELECT AVG(Rating) FROM Review WHERE \
        Review.ToUserId = %s", str(user_id))
    avg_rating = float(cur.fetchone()[0])

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
        "average": avg_rating,
        "reviews": reviews
    }

    resp = make_response(json.dumps(resp_body), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

@user.route('/user/<int:user_id>/follow', methods=['POST'])
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
        resp_body = {"token": token}

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
    cur.execute("INSERT INTO Review(FromUserId, ToUserId, Body, Rating) \
        VALUES(%s, %s, %s, %s)", (str(g.user_id), str(user_id), 
        req_body["content"], str(req_body["rating"])))

    g.db.commit()

    return '', 200