import json
from datetime import datetime, date
from flask.json.provider import JSONProvider
from json import JSONEncoder

# Custom encoder để xử lý datetime -> ISO string
class MongoJSONEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return super().default(o)

# JSONProvider cho Flask
class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=MongoJSONEncoder)

    def loads(self, s: str | bytes, **kwargs):
        return json.loads(s, **kwargs)
