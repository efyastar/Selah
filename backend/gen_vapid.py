from py_vapid import Vapid02
import base64

v = Vapid02()
v.generate_keys()

private_pem = v.private_pem().decode()
public_raw = v.public_key.public_bytes(
    encoding=__import__('cryptography').hazmat.primitives.serialization.Encoding.X962,
    format=__import__('cryptography').hazmat.primitives.serialization.PublicFormat.UncompressedPoint
)
public_b64url = base64.urlsafe_b64encode(public_raw).decode().rstrip('=')

print("PRIVATE PEM:")
print(private_pem)
print("PUBLIC (base64url for frontend):")
print(public_b64url)