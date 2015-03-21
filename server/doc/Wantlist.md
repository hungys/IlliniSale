Wantlist API
============

# Get my wantlist

Endpoint: `GET /api/wantlist`

Login required: Yes

Respones: (array)

```
[
    {
        "create_time": 1426862956,
        "wantlist_id": 2,
        "name": "iPad Air"
    }
]
```

# Add a new item into my wantlist

Endpoint: `POST /api/wantlist`

Login required: Yes

Request:

```
{
    "name": "Surface Pro 3"
}
```

Response:

```
{
    "wantlist_id": 3
}
```

# Edit an item in my wantlist

Endpoint: `PUT /api/wantlist/<wantlist_id>`

Login required: Yes

Request:

```
{
    "name": "Xbox One"
}
```

Response: Empty

# Delete an item in my wantlist

Endpoint: `DELETE /api/wantlist/<wantlist_id>`

Login required: Yes

Response: Empty