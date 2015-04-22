Product API
===========

# Get products of a category

Endpoint: `GET /api/product/category/<category_name>?page=<page_number>`

Login required: No

Comment:

* The API will return maximum 12 records per page
* Supported categories:
    * 3c-tech
    * for-her
    * for-him
    * baby-kids
    * luxury
    * pet-accessories
    * furniture-home
    * kitchen-appliances
    * vintage-antiques
    * cars-motors
    * beauty-products
    * textbooks
    * lifestyle-gadgets
    * design-craft
    * music-instruments
    * photography
    * sporting-gear
    * books
    * tickets-vouchers
    * games-toys
    * everything-else

Response:

```
{
    "total_pages": 1,
    "results": [
        {
            "description": "85% new, body only.",
            "photo": "b0974338-da65-11e4-9b05-3c15c2daac86.jpg",
            "price": 1500,
            "is_sold": 0,
            "likes": 3,
            "name": "Nikon D750 Body",
            "category": "3c-tech",
            "product_id": 8,
            "seller": {
                "profile_pic": "user_1.jpg",
                "first_name": "Yu-Hsin",
                "last_name": "Hung",
                "user_id": 1,
                "gender": 0,
                "nickname": "Jimmy"
            },
            "location": "PAR",
            "is_liked": 1
        }
    ]
}
```

# Get single product

Endpoint: `GET /api/product/<product_id>`

Login required: No

Response:

```
{
    "post_time": 1427564969,
    "description": "90% new, Core i5 CPU, 16GB RAM, and 512GB SSD",
    "tags": [
        "MBPR",
        "Apple",
        "MacBook"
    ],
    "price": 1300,
    "photos": [
        {
            "photo_id": 28,
            "filename": "792ffb68-da6e-11e4-95ee-3c15c2daac86.jpg"
        },
        {
            "photo_id": 29,
            "filename": "7932ee99-da6e-11e4-9f27-3c15c2daac86.jpg"
        }
    ],
    "is_sold": 0,
    "likes": 1,
    "name": "MacBook Pro Retina 13\"",
    "category": "3c-tech",
    "product_id": 7,
    "comments": [
        {
            "content": "Great device.",
            "comment_time": 1427667014,
            "user_id": 1,
            "user_profile_pic": "user_1.jpg",
            "comment_id": 8,
            "response": null,
            "response_time": 0,
            "user_nickname": "Jimmy"
        }
    ],
    "seller": {
        "profile_pic": "user_1.jpg",
        "first_name": "Yu-Hsin",
        "last_name": "Hung",
        "user_id": 1,
        "gender": 0,
        "nickname": "Jimmy"
    },
    "new_bid_alert": 0,
    "location": "ECEB",
    "is_liked": 0
}
```

# Get similar products

Endpoint: `GET /api/product/<product_id>/similar`

Login required: No

Response: (array)

```
[
    {
        "post_time": 1426831853,
        "description": "all new",
        "photo": "60043db0-da6d-11e4-8b52-3c15c2daac86.jpg",
        "price": 1000,
        "is_sold": 1,
        "likes": 3,
        "name": "MBPR Late 2013",
        "category": "3c-tech",
        "product_id": 1,
        "seller": {
            "profile_pic": "user_1.jpg",
            "first_name": "Yu-Hsin",
            "last_name": "Hung",
            "user_id": 1,
            "gender": 0,
            "nickname": "Jimmy"
        },
        "location": "PAR"
    }
]
```

# Search for products

Endpoint: `GET api/product/query?keyword=<keyword>?page=<page_number>`

Login required: No

Comment:

* The API will return maximum 9 records per page

Parameters:

```
keyword: string
category: string
price_high: int
price_low: int
```

Response:

```
{
    "total_pages": 1,
    "results": [
        {
            "description": "New condition\ Can be used with Verizon att T-Mobile and internationally. Comes with new charger\ $650\ Call or text 2172020525",
            "photo": "09c05811-e57d-11e4-b467-3c15c2daac86.jpg",
            "price": 650,
            "is_sold": 0,
            "likes": 1,
            "name": "iPhone 6 Plus 16GB Verizon Unlocked",
            "category": "3c-tech",
            "product_id": 27,
            "seller": {
                "profile_pic": "user_2.JPG",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "location": "PAR",
            "is_liked": 1
        }
    ]
}
```

# Auto-complete for keyword search

Endpoint: `GET /api/product/query/autocomplete?keyword=<keyword>`

Login required: No

Response: (array)

```
[
    "ipad",
    "iphone",
    "iphone 5s 16gb verizon",
    "iphone 6 plus 16gb verizon unlocked"
]
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

# Get suggestion tags

Endpoint: `POST /api/product/tag/suggestion`

Login required: Yes

Request:

```
{
    "name": "iPhone 6 Plus"
}
or
{
    "tags": [
        "iphone",
        "apple"
    ]
}
```

Response: (array)

```
[
    "verizon",
    "ipad",
    "charger",
    "adapter"
]
```

# Upload a photo for product

Developing...

# Edit a product

Endpoint: `PUT /api/product/<product_id>`

Login required: Yes

Comment:

* The properties not provided in request payload will remain for the old value

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

Response: Empty
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

# Like/unlike a product

Endpoint: `PUT /api/product/<product_id>/like`

Login required: Yes

Response:

```
{
    "liked": true   // current liked status
}
```

# Mark product as sold/unsold

Endpoint: `PUT /api/product/<product_id>/sold`

Login required: Yes

Response:

```
{
    "sold": true
}
```

# Upload product photo

Endpoint: `POST /api/product/upload`

Login required: Yes

Comment:

* Submit form using `multipart/form-data`

Request:

```
product_id: <product_id>
file: ......
```

Response: Empty

# Delete product photo

Endpoint: `DELETE /api/product/upload/<photo_id>`

Login required: Yes

Response: Empty

# Get landing page

Endpoint: `GET /api/product/landing`

Login required: No

Response:

```
{
    "following": [
        {
            "description": "Rarely use.",
            "photo": "bff8fc0f-e906-11e4-af67-3c15c2daac86.png",
            "price": 359,
            "is_sold": 0,
            "likes": 1,
            "name": "Apple Watch Sport",
            "category": "3c-tech",
            "product_id": 34,
            "seller": {
                "profile_pic": "user_2.JPG",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "location": "PAR",
            "is_liked": 1
        }
    ],
    "hot": [
        {
            "description": "Rarely use.",
            "photo": "bff8fc0f-e906-11e4-af67-3c15c2daac86.png",
            "price": 359,
            "is_sold": 0,
            "likes": 1,
            "name": "Apple Watch Sport",
            "category": "3c-tech",
            "product_id": 34,
            "seller": {
                "profile_pic": "user_2.JPG",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "location": "PAR",
            "is_liked": 1
        }
    ],
    "latest": [
        {
            "description": "Rarely use.",
            "photo": "bff8fc0f-e906-11e4-af67-3c15c2daac86.png",
            "price": 359,
            "is_sold": 0,
            "likes": 1,
            "name": "Apple Watch Sport",
            "category": "3c-tech",
            "product_id": 34,
            "seller": {
                "profile_pic": "user_2.JPG",
                "first_name": "Yu-Hsin2",
                "last_name": "Hung",
                "user_id": 2,
                "gender": 1,
                "nickname": "Hungys2"
            },
            "location": "PAR",
            "is_liked": 1
        }
    ]    
}
```