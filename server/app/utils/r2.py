import json
from app.utils.r2_client import r2_client, R2_BUCKET

async def upload_json_to_r2(key: str, data: dict):
    r2_client.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=json.dumps(data, indent=2),
        ContentType="application/json"
    )
