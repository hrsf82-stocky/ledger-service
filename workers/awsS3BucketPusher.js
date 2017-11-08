const AWS = require('aws-sdk');
const { S3HistBucket } = require('../config');

AWS.config.loadFromPath('../config.json');
AWS.config.setPromisesDependency(require('bluebird'));

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const uploadFileToS3 = (key, body) => {
  const uploadParams = {
    Bucket: S3HistBucket,
    Key: key,
    Body: JSON.stringify(body),
    ACL: 'public-read'
  };

  return s3.upload(uploadParams).promise()
    .then((data) => {
      console.log('S3 Upload Success', data.Location);
      return data.Location;
    })
    .catch((err) => {
      console.error('S3 Upload Error', err);
    });
};

module.exports = { uploadFileToS3 };
