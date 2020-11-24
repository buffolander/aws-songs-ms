const AWS = require('aws-sdk')

const storage = new AWS.S3()

const {
  DEFAULT_BUCKET = 'dev-song-vault',
  SIGNED_URL_MAX_AGE = 60,
} = process.env

module.exports.listObjects = (params = {}, Bucket = DEFAULT_BUCKET) => {
  try {
    const res = storage.listObjects({
      Bucket,
      ...params,
    })
    return res.promise()
  } catch (err) {
    return null
  }
}

module.exports.signURL = (operation, params = {}, Bucket = DEFAULT_BUCKET) => {
  try {
    return storage.getSignedUrl(operation, {
      Bucket,
      Expires: Number(SIGNED_URL_MAX_AGE),
      ...params,
    })
  } catch (err) {
    return null
  }
}

module.exports.objectCRUD = (operation, params = {}, Bucket = DEFAULT_BUCKET) => {
  try {
    const res = storage[operation]({
      Bucket,
      ...params,
    })
    return res.promise()
  } catch (err) {
    return null
  }
}
