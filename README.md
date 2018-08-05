# SMS-Stock-Service
SMS chat bot service that sends stock and currency quotes to subscribers throughout the day.
Quotes are 10 minute delayed and sourced from several APIs. 
AWS DynamoDB is used to store the subscriber list. All PII such as a subscriber's phone number is encrypted server side before being sent to DynamoDB.
The service is currently deployed on Digital Ocean, with plans to move to AWS Elastic Beanstalk.
Commit history is limited on the public repo of this project. Prior work lies hidden in a private repo. 

__Important note__:
This service requires several API and encryption keys to run (AWS, Twilio, and the currency exchange API). As such, cloning and attempting to run this service will not work.
