from flask import request, Blueprint, jsonify
from flaskr.errors.bad_request import BadRequestError
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import numpy as np

# Load the EfficientNetB1 model
model = load_model('./model/efficientnetb1_model.h5')
class_names = ['Safe', 'Unsafe']

moderation_image_controller = Blueprint("moderation_image", __name__, url_prefix="/api/v1/moderation")

def preprocess_image(image):
    try:
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Resize image to match EfficientNetB1 input size
        image = image.resize((240, 240))

        # Convert image to numpy array and preprocess
        image = np.array(image)
        image = preprocess_input(image)

        # Expand dimensions to match model input
        image = np.expand_dims(image, axis=0)

        return image
    except Exception as e:
        raise ValueError(f"Error during image preprocessing: {str(e)}")

@moderation_image_controller.route('/moderation', methods=['POST'])
def moderation():
    if 'images' not in request.files:
        raise BadRequestError('No images found in the request')

    files = request.files.getlist('images')
    if not files:
        raise BadRequestError('No files selected')

    try:
        safe_count = 0
        unsafe_count = 0

        for file in files:
            # Open image from uploaded file and preprocess
            image = Image.open(file.stream)
            processed_image = preprocess_image(image)

            # Predict with the model
            predictions = model.predict(processed_image)
            predicted_class = np.argmax(predictions[0])  # Get the class with the highest probability
            predicted_label = class_names[predicted_class]  # Corresponding class name

            if predicted_label == 'Safe':
                safe_count += 1
            else:
                unsafe_count += 1

        # Determine the result based on counts
        if safe_count >= unsafe_count:
            result = "ok"
        else:
            result = "false"

        response = {
            'EC': 0,  # Error code 0: Success
            'EM': 'Prediction successful',
            'DT': {
                'result': result,
                'safe_count': safe_count,
                'unsafe_count': unsafe_count
            }
        }

        return jsonify(response), 200

    except ValueError as ve:
        raise BadRequestError(str(ve))
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise

@moderation_image_controller.route("/", methods=["GET"])
def ping():
    return jsonify({
        'EC': 0,
        'EM': 'Server is running...',
        'DT': None
    }), 200