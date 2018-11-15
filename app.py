from flask import Flask
from datetime import datetime
import json
from flask import request
import absolutdata_crawler


app = Flask(__name__)

@app.route("/", methods=["POST"])
def homepage():
    json_data = json.loads(request.data)
    data = absolutdata_crawler.get_details(**json_data)
    response = app.response_class(
        response=json.dumps(data),
        mimetype='application/json'
    )
    return response

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
