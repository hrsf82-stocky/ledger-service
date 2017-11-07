// Load the SDK for JavaScript
const AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.loadFromPath('../config.json');

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Create the parameters for calling createBucket
const bucketParams = {
  Bucket: process.argv[2],
  ACL : 'public-read'
};

// Call S3 to create the bucket
s3.createBucket(bucketParams, (err, data) => {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data.Location);
  }
});
