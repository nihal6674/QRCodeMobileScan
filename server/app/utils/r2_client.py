import os
import boto3

# -----------------------------
# ENV VARIABLES (REQUIRED)
# -----------------------------
ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"

if not all([R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET]):
    raise RuntimeError("Missing one or more R2 environment variables")

# -----------------------------
# R2 CLIENT (S3 COMPATIBLE)
# -----------------------------
r2_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",  # REQUIRED for Cloudflare R2
)

__all__ = ["r2_client", "R2_BUCKET"]
