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
- Download the VnCoreNLP repo from this link [VnCoreNLP](https://github.com/vncorenlp/VnCoreNLP)
- `cd vncorenlp_microservice`