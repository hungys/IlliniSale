class AutoCompleteProvider:
    def __init__(self):
        self.candidates = []

    def insert(self, name):
        self.candidates.append(name.lower())

    def remove(self, name):
        if name.lower() in self.candidates:
            self.candidates.remove(name.lower())

    def load_candidates(self):
        self.insert("iPhone")
        self.insert("iPhone 6 Plus")
        self.insert("iPhone 5S")
        self.insert("iPad Air")
        self.insert("iPad mini")
        self.insert("MacBook Pro Retina")
        self.insert("MacBook Air")
        self.insert("iPhone 4S")
        self.insert("iPhone 6")
        self.insert("iPhone 6 case")
        self.insert("iPhone 6 charger")

    def autocomplete(self, keyword):
        result = [x for x in set(self.candidates) if x.startswith(keyword.lower())]
        result.sort()
        return result[0:10]