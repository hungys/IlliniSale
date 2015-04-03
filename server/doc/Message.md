Message API
===========

# Get all messages with a user

Endpoint: `GET /api/message/<user_id>`

Login required: Yes

Response: (array)

```
[
    {
        "content": "I want to buy!",
        "timestamp": 1426864661,
        "speaker": 1
    },
    {
        "content": "Sure.",
        "timestamp": 1426865224,
        "speaker": 2
    }
]
```

# Send message to user

Endpoint: `POST /api/message/<user_id>`

Login required: Yes

Request:

```
{
    "content": "Good"
}
```

Response:

```
{
    "message_id": 4
}
```