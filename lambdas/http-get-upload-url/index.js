'use strict'
const AWS = require('aws-sdk')

const {
  AWS_DEFAULT_REGION,
  DEFAULT_BUCKET,
  SIGNED_URL_MAX_AGE,
} = process.env

module.exports.handler = async (event) => {
  const storage = new AWS.S3({ signatureVersion: 'v4', region: AWS_DEFAULT_REGION })
  const signedURL = storage.getSignedUrl('putObject', {
    Bucket: DEFAULT_BUCKET,
    Key: 'upload/song-' + Date.now() + '.mp3',
    Expires: Number(SIGNED_URL_MAX_AGE),
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      signed_url: signedURL,
    }),
  }
}
