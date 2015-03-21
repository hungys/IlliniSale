# User API

## Get user's profile

Endpoint: `GET /user/<use_id>/profile`

Login required: No

Response:

```
{
    "profile_pic": "user1.jpg",
    "first_name": "Yu-Hsin",
    "last_name": "Hung",
    "following_count": 1,
    "product_count": 4,
    "gender": false,
    "follower_count": 1,
    "nickname": "Hungys",
    "register_time": 1426822712
}
```

## Get user's followers

Endpoint: `GET /api/user/<user_id>/follower`

Login required: No

Response: (array)

```
[
    {
        "profile_pic": "user2.jpg",
        "first_name": "Yu-Hsin2",
        "last_name": "Hung",
        "user_id": 2,
        "product_count": 0,
        "gender": true,
        "follower_count": 0,
        "nickname": "Hungys2"
    }
]
```

## Get the list of following users

Endpoint: `GET /api/user/<user_id>/following`

Login required: No

Response: (array)

```
[
    {
        "profile_pic": "user2.jpg",
        "first_name": "Yu-Hsin2",
        "last_name": "Hung",
        "user_id": 2,
        "product_count": 0,
        "gender": true,
        "follower_count": 0,
        "nickname": "Hungys2"
    }
]
```

## Get user's products

Endpoint: `GET /api/user/<user_id>/product`

Login required: No

Response: (array)

```
[
    {
        "category": "3C",
        "is_sold": 0,
        "likes": 0,
        "product_id": 1,
        "location": "PAR",
        "photo": "",
        "description": "all new",
        "price": 100,
        "name": "MBPR"
    }
]
```

## Get user's review

Endpoint: `GET /api/user/<user_id>/review`

Login required: No

Response:

```
{
    "reviews": [
        {
            "content": "good job 1",
            "reviewer": {
                "profile_pic": "user2.jpg",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "review_id": 3,
            "timestamp": 1426829865,
            "rating": 5
        }
    ],
    "average": 5
}
```

## Request for access token

Endpoint: `POST /api/user/auth`

Login required: No

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.jCMWRmaMpLh9n2lul8xmLe4hGHFA-VMQiY2ikdME4kA"
}
```

## Register a new user

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

Response: Empty

## Edit user's profile

Developing...

## Follow/unfollow a user

Endpoint: `POST /api/user/<user_id>/follow`

Login required: Yes

Request: Empty

Response:

```
{
    "followed": true
}
```

## Post review to user

Endpoint: `POST /api/user/<user_id>/review`

Login required: Yes

Request:

```
{
    "content": "Good seller",
    "rating": 5,
    "bid_id": 1
}
```

Response: Empty