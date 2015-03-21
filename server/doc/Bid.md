Bid API
=======

# Get all my bids (including bidded by others)

Endpoint: `GET /api/bid`

Login required: Yes

Bid status: new/accepted/rejected

Response:

```
{
    "sells": [
        {
            "status": "accepted",
            "product": {
                "price": 100,
                "id": 1,
                "name": "MBPR"
            },
            "timestamp": 1426867157,
            "price": 80,
            "bid_id": 1,
            "bidder_user_id": 2
        }
    ],
    "bids": [
        {
            "status": "new",
            "product": {
                "price": 250,
                "id": 6,
                "name": "Play Station 4"
            },
            "timestamp": 1426957691,
            "price": 220,
            "bid_id": 3,
            "bidder_user_id": 1
        }
    ]
}
```

# Accept/reject a bid

Endpoint: `PUT /api/bid/<bid_id>`

Login required: Yes

Comment:

* return 403 if operates on other user's product

Request:

```
{
    "accept": 1
}
```

Response: Empty