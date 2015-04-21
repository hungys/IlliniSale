import math
import json
import operator
import config
from core.database import connect_db, connect_redis

def dot_product(vector1, vector2):
    return sum([p1 * p2 for p1, p2 in zip(vector1, vector2)])

def magnitude(vector):
    return math.sqrt(sum([x**2 for x in vector]))

def cosine_similarity(vector1, vector2):
    return dot_product(vector1, vector2) / (magnitude(vector1) * magnitude(vector2))

def euclidean_distance(vector1, vector2):
    return math.sqrt(sum([math.pow(p1 - p2, 2) for p1, p2 in zip(vector1, vector2)]))

def tags_to_point(tags_set, tags_space):
    return [(1 if tag in tags_set else 0) for tag in tags_space]

class RecommenderJob:
    def __init__(self):
        self.db_conn = connect_db()
        self.cache_conn = connect_redis()
        self.tags_space = []

    def get_tags_space(self):
        cur = self.db_conn.cursor()
        cur.execute("SELECT DISTINCT LCASE(Name) FROM Tag")
        data = cur.fetchall()
        self.tags_space = [row[0] for row in data]

    def get_all_products(self):
        cur = self.db_conn.cursor()
        cur.execute("SELECT ProductId, GROUP_CONCAT(LCASE(Name)) FROM Tag GROUP BY ProductId")
        data = cur.fetchall()
        return dict([(int(row[0]), row[1].split(",")) for row in data])

    def calculate_similarity(self, products):
        similarities = {}
        for product_id in products:
            compared = dict([(i, cosine_similarity(products[product_id], products[i])) for i in products if i != product_id])
            similarities[product_id] = [p[0] for p in sorted(compared.items(), key=operator.itemgetter(1), reverse=True)[0:5] if p[1] > 0]
        return similarities

    def write_to_cache(self, similarities):
        for product_id, similar_list in similarities.items():
            if len(similar_list) > 0:
                # print product_id, similar_list
                self.cache_conn.setex(product_id, config.RECOMMENDATION_EXPIRATION, json.dumps(similar_list))

    def run(self):
        self.get_tags_space()
        products = self.get_all_products()
        for product_id in products:
            products[product_id] = tags_to_point(products[product_id], self.tags_space)
        similarities = self.calculate_similarity(products)
        self.write_to_cache(similarities)

        # print "Cache will be expired in %d seconds" % config.RECOMMENDATION_EXPIRATION
        # print "Job success"