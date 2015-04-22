User API
========

# Get user's profile

Endpoint: `GET /user/<use_id>/profile`

Login required: No

Response:

```
{
    "is_followed": 0,
    "profile_pic": "user_1.jpg",
    "last_name": "Hung",
    "following_count": 2,
    "product_count": 16,
    "nickname": "Jimmy",
    "first_name": "Yu-Hsin",
    "user_id": 1,
    "gender": false,
    "register_time": 1426822712,
    "follower_count": 3
}
```

# Get user's followers

Endpoint: `GET /api/user/<user_id>/follower`

Login required: No

Response: (array)

```
[
    {
        "is_followed": 1,
        "profile_pic": "user_2.JPG",
        "first_name": "Yu-Hsin2",
        "last_name": "Hung",
        "user_id": 2,
        "product_count": 5,
        "gender": true,
        "follower_count": 1,
        "nickname": "Hungys2"
    }
]
```

# Get the list of following users

Endpoint: `GET /api/user/<user_id>/following`

Login required: No

Response: (array)

```
[
    {
        "is_followed": 1,
        "profile_pic": "user_2.JPG",
        "first_name": "Yu-Hsin2",
        "last_name": "Hung",
        "user_id": 2,
        "product_count": 5,
        "gender": true,
        "follower_count": 1,
        "nickname": "Hungys2"
    }
]
```

# Get user's products

Endpoint: `GET /api/user/<user_id>/product`

Login required: No

Response: (array)

```
[
    {
        "category": "3c-tech",
        "is_sold": 0,
        "likes": 3,
        "product_id": 8,
        "is_liked": 1,
        "location": "PAR",
        "photo": "b0974338-da65-11e4-9b05-3c15c2daac86.jpg",
        "description": "85% new, body only.",
        "price": 1500,
        "name": "Nikon D750 Body"
    }
]
```

# Get user's review

Endpoint: `GET /api/user/<user_id>/review`

Login required: No

Response:

```
{
    "reviews": [
        {
            "content": "Great",
            "reviewer": {
                "profile_pic": "user_2.JPG",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "review_id": 28,
            "timestamp": 1428116068,
            "rating": 1
        }
    ],
    "percentage": 100
}
```

# Follow/unfollow a user

Endpoint: `PUT /api/user/<user_id>/follow`

Login required: Yes

Response:

```
{
    "followed": true   // current followed status
}
```

# Get my profile

Endpoint: `GET /api/user`

Login required: Yes

Response:

```
{
    "profile_pic": "user_1.jpg",
    "first_name": "Yu-Hsin",
    "last_name": "Hung",
    "gender": 0,
    "mobile_phone": "6262412272",
    "nickname": "Jimmy",
    "email": "hungys@hotmail.com",
    "birthday": "1993-03-19 00:00:00"
}
```

# Register a new user

Endpoint: `POST /api/user`

Login required: No

Request:

```
{
    "email": "hungys@illinois.edu",
    "password": "12345",
    "nickname": "Jimmy",
    "first_name": "Yu-Hsin",
    "last_name": "Hung",
    "mobile_phone": "6262412272",
    "gender": 0,
    "birthday": "1993/3/19"
}
```

Response:

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.jCMWRmaMpLh9n2lul8xmLe4hGHFA-VMQiY2ikdME4kA",
    "user_id": 1
}
```

# Check if email has been registered

Endpoint: `POST /api/user/check`

Login required: No

Request:

```
{
    "email": "hungys@hotmail.com"
}
```

Response:

```
{
    "valid": 1   // 1 if can be used, 0 if has been registered
}
```

# Edit user's profile

Endpoint: `PUT /api/user`

Login required: Yes

Comment:

* The properties not provided in request payload will remain for the old value

Request:

```
{
    "password": "12345",
    "nickname": "Jimmy",
    "first_name": "Yu-Hsin",
    "last_name": "Hung",
    "gender": 0,
    "mobile_phone": "6262412272",
    "birthday": "1993/3/19"
}
```

Response: Empty

# Upload profile picture

Endpoint: `POST /api/user/upload`

Login required: Yes

Comment:

* Submit form using `multipart/form-data`

Request:

```
user_id: <user_id>
file: ......
```

Response: Empty

# Request for access token

Endpoint: `POST /api/user/auth`

Login required: No

Comment:

* token should be stored by client/browser for further requests
* token may be expired

Request:

```
{
    "email": "hungys@hotmail.com",
    "password": "12345"
}
```

Response:

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.jCMWRmaMpLh9n2lul8xmLe4hGHFA-VMQiY2ikdME4kA",
    "user_id": 1
}
```

# Post review to user

Endpoint: `POST /api/user/<user_id>/review`

Login required: Yes

Request:

```
{
    "content": "Good seller",
    "rating": 1,   // -1 for negative, 0 for neutral, 1 for positive
    "bid_id": 1
}
```

Response: Empty