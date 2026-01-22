class RatingsAndReviews:
    def __init__(self, user_id, rating, comment, date):
        self.user_id = user_id
        self.rating = rating  # Should be between 1 and 5
        self.comment = comment
        self.date = date  # Should be a date object

    # CRUD Operations

    def create_review(self):
        # Logic to create a review
        pass

    def read_review(self, review_id):
        # Logic to read a review
        pass

    def update_review(self, review_id, rating=None, comment=None):
        # Logic to update a review
        pass

    def delete_review(self, review_id):
        # Logic to delete a review
        pass
