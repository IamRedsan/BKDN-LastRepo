from flask import Flask
from flaskr.utils.json_helper import CustomJSONProvider
from flaskr.errorHandlers.default_handler import default_handler
from flaskr.errorHandlers.default_http_handler import default_http_handler
from flaskr.errorHandlers.my_handler import my_handler
from flaskr.errors.bad_request import BadRequestError
from flaskr.errors.not_found import NotFoundError
from flaskr.errors.unauthenticated import UnauthenticatedError
from flaskr.errors.forbidden import ForbiddenError
from flaskr.controllers.moderation_image_controller import moderation_image_controller
from werkzeug.exceptions import HTTPException
from flask_cors import CORS

def create_app():

    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources={r"/api/v1/*": {"origins": "http://localhost:3001"}})

    app.json = CustomJSONProvider(app)

    app.register_error_handler(BadRequestError, my_handler)
    app.register_error_handler(NotFoundError, my_handler)
    app.register_error_handler(UnauthenticatedError, my_handler)
    app.register_error_handler(ForbiddenError, my_handler)
    app.register_error_handler(HTTPException, default_http_handler)
    app.register_error_handler(Exception, default_handler)

    app.register_blueprint(moderation_image_controller)

    return app