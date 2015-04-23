IlliniSale
==========

This is a application-oriented project for UIUC CS411 Database Systems developed by Team SegFaults.

# Summary

Our website is a trading platform designed for students of U of I at Urbana-Champaign, that's why it was named as "IlliniSale". A major drawback of the Facebook trade groups is that it is very hard to find posts that is older than a certain time since newer posts would be at the top. Our website solves this dilemma and allows students search any product with ease while providing a more user-friendly trading platform than UIUC Free & For Sale Facebook group, and students do not need to pay any fee when they trade their products. Any student can post their goods to sell and any students can view and buy. Our website also provides a dashboard to easily manage your bids or the offers others made, and you can even use the private message feature to communicate with sellers or buyers. Besides of the basic trading functions, we also implemented a recommender system based on user-defined tags of products, and it will list the similar products at the bottom of product detail page, then user can easily compare between similar or related goods.

# Functionalities

## Basic Functions

* Basic sale system: user can post the products and others can bid for them
* Each product is under a specific category and can have multiple tags
* User can make a bid and seller can either accept or reject it
* User can follow sellers so that the products posted by following sellers will show up on the landing page
* User can like products, and those metrics can be used to calculate the order or ranking of products
* User can create a want list and server will send notification once there is a matched product posted
* User can post public comments for specific product and seller can respond to them
* User can send private messages to seller or buyer.
* User can leave reviews for seller after buying the products
* User can search/filter for products with criteria such as keyword, category, or price range
* User will receive notifications when someone sends him/her a message, post a comment to product, or make/respond an offer.


##Advanced Functions

* Recommender system: 
The website will calculate the similarities between every products based on the cosine similarity of user-input tags and list the similar item on the product detail page.
* Keyword search auto-complete:
We use an efficient data structure called ternary search tree to implement auto-complete to give users suggestions while searching.

# Deploy

## Environment

* Python
* Nginx
* MariaDB 10
* redis

## Dependencies

* Front-end: we use `bower` to manage the packages
    * alertify.js#0.3.11
    * angular#1.3.15
    * angular-file-upload#1.1.5
    * angular-route#1.3.15
    * bootstrap#3.3.4
    * jquery#2.1.3
    * ngstorage#0.3.0
    * typeahead.js#0.10.5
* Back-end: we use `virtualenv` and `pip` to manage the packages, type `pip install -r pip-requires.txt` to restore the required packages.
    * backports.ssl-match-hostname (3.4.0.2)
    * certifi (14.5.14)
    * Flask (0.10.1)
    * Flask-HTTPAuth (2.4.0)
    * itsdangerous (0.24)
    * Jinja2 (2.7.3)
    * MarkupSafe (0.23)
    * MySQL-python (1.2.5)
    * pip (6.0.8)
    * PyJWT (1.0.0)
    * redis (2.10.3)
    * setuptools (12.0.5)
    * tornado (4.1)
    * Werkzeug (0.10.1)

## Configurations

### server/config.py

```
SERVER_SECRET = "<YOUR SECRET KEY HERE>"
DATABASE_HOST = "localhost"
DATABASE_USERNAME = "<USERNAME>"
DATABASE_PASSWORD = "<PASSWORD>"
DATABASE_NAME = "IlliniSale"
REDIS_HOST = "localhost"
REDIS_PASSWORD = "<PASSWORD>"
RECOMMENDATION_EXPIRATION = 86400
RECOMMENDER_JOB_PERIOD = 600
```

### client/static/js/app.js

```
service.GetAPIServer = function() {
    return "";  // leave blank if host in same domain
};
```

### Nginx

```
location / {
    root   /Users/cs411/Development/IlliniSale/client;
    index  index.html index.htm;
}

location /uploads {
    alias /Users/cs411/Development/IlliniSale/server/uploads;
}

location /api {
    proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    if (!-f $request_filename) {
        proxy_pass http://127.0.0.1:8080;
        break;
    }
}
```

## Run

```
cd server
python server.py &
```

# Team Members

* Yu-Hsin Hung: Back-end API, front-end, and recommender system
* Yiming Wang: Recommender system
* Eugene Lee: Auto-complete function
* Ruiqi Zhu: Auto-complete function, and demo video