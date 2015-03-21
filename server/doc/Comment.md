Comment API
===========

# Respond to a comment

Endpoint: `PUT /api/comment/<comment_id>`

Login required: Yes

Comment:

* Return 403 if respond to comment of other user's product

Request:

```
{
    "response": "thanks"
}
```

Response: Empty