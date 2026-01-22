import yookassa

class YooKassaIntegration:
    def __init__(self, shop_id, secret_key):
        self.shop_id = shop_id
        self.secret_key = secret_key
        yookassa.Configuration.account_id = self.shop_id
        yookassa.Configuration.secret_key = self.secret_key

    def create_payment(self, amount, currency, description):
        try:
            payment = yookassa.Payment.create({
                "amount": {
                    "value": str(amount),
                    "currency": currency
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": "https://your-return-url.com"
                },
                "capture": True,
                "description": description
            })
            return payment
        except yookassa.exceptions.ApiError as e:
            print(f"An error occurred: {e}")
            return None

    def capture_payment(self, payment_id):
        try:
            payment = yookassa.Payment.capture(payment_id)
            return payment
        except yookassa.exceptions.ApiError as e:
            print(f"An error occurred: {e}")
            return None

    def get_payment_info(self, payment_id):
        try:
            payment = yookassa.Payment.find_one(payment_id)
            return payment
        except yookassa.exceptions.ApiError as e:
            print(f"An error occurred: {e}")
            return None

# Пример использования
# yookassa_integration = YooKassaIntegration(shop_id="ваш_shop_id", secret_key="ваш_secret_key")
# payment = yookassa_integration.create_payment(amount=500, currency="RUB", description="Тестовый платеж")
# print(payment)