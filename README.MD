# SyndicateAI - RSS Feeds Site

## How to run this?
* Add test data to MongoDB Compass
- Create a *"xml_rss"* database in MongoDB Compass then create a *"test_json_xml"* collection. Import test_data.json in rss_data folder to *test_json_xml* collection.

#### Frontend.
- `cd Frontend` then run `npm i` after the packages are finished downloading then run `npm start`.

#### Backend.
- `cd Backend\server` then run `npm i` after the packages are finished downloading then run `npm start`.

#### VnCoreNLP Microservices
To run the VnCoreNLP microservices for extracting trending keywords first you need to:
##### 1. Setup and installation
- Download the VnCoreNLP repo from this link [VnCoreNLP](https://github.com/vncorenlp/VnCoreNLP)
- Extract to Desktop, then go to folder `Backend/vncorenlp_microservice` and create a VnCoreNLP folder.
- Copy the `VnCoreNLP-1.1.1.jar` file and `models` folder and paste to `VnCoreNLP` folder in `vncorenlp_microservice` that have been created before.
- If you have python installed and already add path to system variable, run following commands (IN ORDER):
```python -m venv env
./env/Scripts/activate
pip install -r requirements.txt
```
*-->Finish setup and installation*
##### 2. Run the code
- To run the code, open the terminal and then from `vncorenlp_microservice` folder run:
`python ./app/get-trending-keywords.py`

- Open README.md in `vncorenlp_microservice` directory for more information about the API.