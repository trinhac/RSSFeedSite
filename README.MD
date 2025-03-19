SyndicateAI - RSS Feeds Site

How to Run This Project

1. Database Setup (MongoDB Compass)

To run the project, first add test data to MongoDB Compass:

Open MongoDB Compass.

Create a new database named xml_rss.

Inside the xml_rss database, create a collection named test_json_xml.

Import the test_data.json file located in the rss_data folder into the test_json_xml collection.

2. Frontend Setup

Navigate to the Frontend directory:

cd Frontend

Install dependencies:

npm install

Start the frontend server:

npm start

3. Backend Setup

Navigate to the backend server directory:

cd Backend/server

Install dependencies:

npm install

Start the backend server:

npm start

VnCoreNLP Microservices Setup

The VnCoreNLP microservices are used to extract trending keywords. Follow these steps to set them up:

1. Setup and Installation

Download the VnCoreNLP repository.

Extract the downloaded file to your Desktop.

Navigate to Backend/vncorenlp_microservice and create a VnCoreNLP folder inside it.

Copy the VnCoreNLP-1.1.1.jar file and the models folder from the extracted repository.

Paste them into the newly created VnCoreNLP folder inside vncorenlp_microservice.

If you have Python installed and it is added to your system’s PATH, run the following commands:

python -m venv env
./env/Scripts/activate  # For Windows
source env/bin/activate  # For macOS/Linux
pip install -r requirements.txt

Setup is now complete.

2. Running the Microservice

To run the VnCoreNLP microservice, open a terminal, navigate to the vncorenlp_microservice folder, and execute:

python ./app/get-trending-keywords.py

For more details about the API, refer to the README.md file in the vncorenlp_microservice directory.

