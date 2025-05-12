from http import HTTPStatus

def default_handler(e):
    return {
        "message": str(e),
        "status code": HTTPStatus.INTERNAL_SERVER_ERROR,
    }, HTTPStatus.INTERNAL_SERVER_ERROR