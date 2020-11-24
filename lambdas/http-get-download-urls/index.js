'use strict'
const AWS = require('aws-sdk')

const {
  AWS_DEFAULT_REGION,
  DEFAULT_BUCKET,
  SIGNED_URL_MAX_AGE,
} = process.env

const PREFIX = 'trimmed/'

const handler = async (event) => {
  const storage = new AWS.S3()
  try {
    const { Contents: fileDetails } = await storage.listObjects({
      Bucket: DEFAULT_BUCKET,
      Prefix: PREFIX,
    }).promise()
    console.info(fileDetails)
    const signedURLs = fileDetails.map(({ Key }) => ({
      filename: Key.replace(PREFIX, ''),
      signed_url: storage.getSignedUrl('getObject', {
        Bucket: DEFAULT_BUCKET,
        Expires: Number(SIGNED_URL_MAX_AGE),
        Key,
      })
    }))
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: signedURLs,
      }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
    }
  }
}

module.exports = { handler }
