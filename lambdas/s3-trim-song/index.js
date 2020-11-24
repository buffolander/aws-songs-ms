'use strict'
const AWS = require('aws-sdk')
const ffmpeg = require('fluent-ffmpeg')

const fs = require('fs')

const probeFile = (input) => (new Promise((resolve, reject) => {
  ffmpeg(input)
    .ffprobe((err, metadata) => resolve(err ? err : metadata.streams))
}))

const trimFile = (input, output) => (new Promise((resolve, reject) => {
  ffmpeg(input)
    .format('mp3')
    .output(output)
    .inputOptions(`-t ${process.env.TRIM_SONG_LENGTH}`)
    .on('error', err => reject(err))
    .on('start', cmd => console.info(cmd))
    .on('end', () => resolve(fs.createReadStream(output)))
    .run()
}))

const handler = async (event) => {
  const {
    s3: {
      bucket: {
        name: bucketName = null,
      },
      object: {
        key: fileKey = null
      },
    },
  } = event.Records[0]
  if (!bucketName || !fileKey) return

  const storage = new AWS.S3()
  const originalObjectParams = {
    Bucket: bucketName,
    Key: fileKey,
  }
  const fileName = fileKey.split('upload/')[1]
  const inputLocal = `/tmp/raw-${fileName}`
  const outputLocal = `/tmp/trimmed-${fileName}`
  const uploadKey = `trimmed/${fileName}`

  try {
    const inputBuffer = await storage.getObject(originalObjectParams).promise()
    fs.writeFileSync(inputLocal, inputBuffer.Body)

    /* const fileDetails = await probeFile(inputLocal)
    console.info(fileDetails) */
    const trimRes = await trimFile(inputLocal, outputLocal)

    await storage.putObject({
      Bucket: bucketName,
      Key: uploadKey,
      Body: trimRes,
    }).promise()
    await storage.deleteObject(originalObjectParams).promise()
  } catch (err) {
    console.error(err)
  }
}

module.exports = { handler }
