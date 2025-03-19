# SyndicateAI - RSS Feeds Site

## How to Run This Project

### 1. Database Setup (MongoDB Compass)
To run the project, first add test data to MongoDB Compass:
1. Open MongoDB Compass.
2. Create a new database named **`xml_rss`**.
3. Inside the `xml_rss` database, create a collection named **`test_json_xml`**.
4. Import the `test_data.json` file located in the `rss_data` folder into the `test_json_xml` collection.

### 2. Frontend Setup
1. Navigate to the `Frontend` directory:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm start
   ```

### 3. Backend Setup
1. Navigate to the backend server directory:
   ```sh
   cd Backend/server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm start
   ```

---

## VnCoreNLP Microservices Setup
The **VnCoreNLP** microservices are used to extract trending keywords. Follow these steps to set them up:

### 1. Setup and Installation
1. Download the [VnCoreNLP repository](https://github.com/vncorenlp/VnCoreNLP).
2. Extract the downloaded file to your Desktop.
3. Navigate to `Backend/vncorenlp_microservice` and create a **VnCoreNLP** folder inside it.
4. Copy the **VnCoreNLP-1.1.1.jar** file and the **models** folder from the extracted repository.
5. Paste them into the newly created `VnCoreNLP` folder inside `vncorenlp_microservice`.

6. If you have Python installed and it is added to your system’s PATH, run the following commands:
   ```sh
   python -m venv env
   ./env/Scripts/activate  # For Windows
   source env/bin/activate  # For macOS/Linux
   pip install -r requirements.txt
   ```
7. Setup is now complete.

### 2. Running the Microservice
To run the VnCoreNLP microservice, open a terminal, navigate to the `vncorenlp_microservice` folder, and execute:
   ```sh
   python ./app/get-trending-keywords.py
   ```
For more details about the API, refer to the `README.md` file in the `vncorenlp_microservice` directory.

