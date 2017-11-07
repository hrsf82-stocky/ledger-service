const AWS = require('aws-sdk');
const { S3HistBucket } = require('../config');

AWS.config.loadFromPath('../config.json');
AWS.config.setPromisesDependency(require('bluebird'));

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Call S3 to list current buckets
const listBucketsFromS3 = () => {
  return s3.listBuckets().promise()
    .then(data => {
      console.log('Bucket List', data.Buckets);
    })
    .catch((err) => {
      console.log('Bucket List Error', err);
    })
}

const listObjectsFromS3 = (bucket, maxKeys) => {
  const params = {
    Bucket: bucket || S3HistBucket,
    MaxKeys: maxKeys || 50
  }
  return s3.listObjects(params).promise()
    .then(data => {
      console.log(`Bucket(${bucket}) Object List - Retrieve Success`);
      console.log(data)
      return data;
    })
    .catch((err) => {
      console.log(`Bucket(${bucket}) Object List Error`, err);
    })}


// Get Object Data from S3 Bucket
const getObjectFromS3 = (key, bucket) => {
  const uploadParams = {
    Bucket: bucket || S3HistBucket,
    Key: key,
  };

  return s3.upload(uploadParams).promise()
    .then((data) => {
      console.log(`S3 Key:${key} - Retrieve Success`);
      const objectData = data.Body.toString('utf-8');

      console.log(objectData);

      return objectData;
    })
    .catch((err) => {
      console.error(`S3 Key:${key} - Retrieve Failed`, err);
    });
};

listBucketsFromS3();

module.exports = {
  listBucketsFromS3,
  listObjectsFromS3,
  getObjectFromS3
}
