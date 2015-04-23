Notification API
================

# Get latest notifications

Endpoint: `GET /api/notification/latest`

Login required: Yes

Comment:

* Only last 10 notifications will be returned

Response:

```
[
    {
        "body": "Product you may like: Apple Watch Sport",
        "url": "/product/34",
        "timestamp": 1429717592
    }
]
```

# Get all notifications

Endpoint: `GET /api/notification/all`

Login required: Yes

Response:

```
[
    {
        "body": "Product you may like: Apple Watch Sport",
        "url": "/product/34",
        "timestamp": 1429717592
    }
]
```