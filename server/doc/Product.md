Product API
===========

# Get products of a category

Endpoint: `GET /api/product/category/<category_name>`

Supported categories: TBD

Login required: No

Response: (array)

```
[
    {
        "category": "3C",
        "is_sold": 0,
        "likes": 0,
        "product_id": 1,
        "name": "MBPR",
        "location": "PAR",
        "photo": "",
        "description": "all new",
        "price": 100,
        "seller": {
            "profile_pic": "user1.jpg",
            "first_name": "Yu-Hsin",
            "last_name": "Hung",
            "user_id": 1,
            "gender": 0,
            "nickname": "Hungys"
        }
    }
]
```

# Get single product

Endpoint: `GET /api/product/<product_id>`

Login required: No

Response:

```
{
    "description": "90% new",
    "tags": [
        "Microsoft",
        "Tablet"
    ],
    "price": 1299,
    "photos": [
        "sp3_1.jpg",
        "sp3_2.jpg",
        "sp3_3.jpg"
    ],
    "is_sold": 0,
    "likes": 0,
    "name": "Surface Pro 3",
    "category": "3C",
    "product_id": 4,
    "comments": [
        {
            "content": "Looks really nice!",
            "comment_time": 1426955734,
            "user_id": 2,
            "user_profile_pic": "user2.jpg",
            "comment_id": 3,
            "response": "",
            "response_time": 0,
            "user_nickname": "Hungys2"
        }
    ],
    "seller": {
        "profile_pic": "user1.jpg",
        "first_name": "Yu-Hsin",
        "last_name": "Hung",
        "user_id": 1,
        "gender": 0,
        "nickname": "Hungys"
    },
    "location": "Siebel",
    "is_liked": 0
}
```

# Post a new product

Endpoint: `POST /api/product`

Login required: Yes

Request:

```
{
    "name": "Play Station 4",
    "category": "3C",
    "description": "really good condition",
    "price": 250,
    "location": "Green St.",
    "tags": ["game", "PS4", "Sony"]
}
```

Response:

```
{
    "product_id": 6
}
```

# Upload a photo for product

Developing...

# Search for products

Endpoint: `GET api/product/query?keyword=<keyword>`

Login required: No

Response: (array)

```
[
    {
        "category": "3C",
        "is_sold": 0,
        "likes": 0,
        "product_id": 1,
        "name": "MBPR",
        "location": "PAR",
        "photo": "",
        "description": "all new",
        "price": 100,
        "seller": {
            "profile_pic": "user1.jpg",
            "first_name": "Yu-Hsin",
            "last_name": "Hung",
            "user_id": 1,
            "gender": 0,
            "nickname": "Hungys"
        }
    }
]
```

# Edit a product

Developing...

# Like/unlike a product

Endpoint: `PUT /api/product/<product_id>/like`

Login required: Yes

Response:

```
{
    "liked": true
}
```

# Bid for a product

Endpoint: `POST /api/product/<product_id>/bid`

Login required: Yes

Request:

```
{
    "price": 1200
}
```

Response:

```
{
    "bid_id": 2
}
```

# Post a comment to product

Endpoint: `POST /api/product/<product_id>/comment`

Login required: Yes

Request:

```
{
    "content": "Looks really nice!"
}
```

Response:

```
{
    "comment_id": 3
}
```

# Get feeds and activities for landing page

Developing...