from py_vapid import Vapid02
import base64

v = Vapid02()
v.generate_keys()

private_der = v.private_key.private_bytes(
    encoding=__import__('cryptography').hazmat.primitives.serialization.Encoding.DER,
    format=__import__('cryptography').hazmat.primitives.serialization.PrivateFormat.PKCS8,
    encryption_algorithm=__import__('cryptography').hazmat.primitives.serialization.NoEncryption()
)
private_b64url = base64.urlsafe_b64encode(private_der).decode().rstrip('=')

public_raw = v.public_key.public_bytes(
    encoding=__import__('cryptography').hazmat.primitives.serialization.Encoding.X962,
    format=__import__('cryptography').hazmat.primitives.serialization.PublicFormat.UncompressedPoint
)
public_b64url = base64.urlsafe_b64encode(public_raw).decode().rstrip('=')

print("PRIVATE (base64url for .env):")
print(private_b64url)
print("PUBLIC (base64url for frontend):")
print(public_b64url)