from twilio.rest import Client
from app.core.config import settings

client = Client(
    settings.twilio_account_sid,
    settings.twilio_auth_token
)

message = client.messages.create(
    body="sms_event_notifications",
    from_=settings.twilio_from_number,
    to="+919997542707"
)

print("SMS sent successfully!")
print("Message SID:", message.sid)