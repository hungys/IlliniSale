REST API Documents
==================

# Authentication

Request for access token: `POST /api/user/auth`

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

Attach token in the **Authorization header** for all login-required resources **everytime**,

```
Authorization: Bearer <token you get>
```