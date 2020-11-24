const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const { objectCRUD } = require('../../clients/aws-s3')

const {
  TRIM_SONG_LENGTH = 5,
} = process.env

const probeFile = (input) => (new Promise((resolve, reject) => {
  ffmpeg(input)
    .ffprobe((err, metadata) => resolve(err || metadata.streams))
}))

const trimFile = (input, output) => (new Promise((resolve, reject) => {
  ffmpeg(input)
    .format('mp3')
    .output(output)
    .inputOptions(`-t ${TRIM_SONG_LENGTH}`)
    .on('error', err => reject(err))
    .on('start', cmd => console.info(cmd))
    .on('end', () => resolve(fs.createReadStream(output)))
    .run()
}))

const handler = async (event, context) => {
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

  const filename = fileKey.split('upload/')[1]
  const uploadKey = `trimmed/${filename}`
  const localInput = `/tmp/raw-${filename}`
  const localOutput = `/tmp/trimmed-${filename}`

  try {
    const inputBuffer = await objectCRUD('getObject', {
      Key: fileKey,
    })
    if (!inputBuffer) throw { error: 'null inputBuffer', event }

    fs.writeFileSync(localInput, inputBuffer.Body)

    /* const fileDetails = await probeFile(localInput)
    console.info(fileDetails) */
    const streamReader = await trimFile(localInput, localOutput)

    await objectCRUD('putObject', {
      Key: uploadKey,
      Body: streamReader,
    })
    await objectCRUD('deleteObject', {
      Key: fileKey,
    })
  } catch (err) {
    console.error(err)
  }
}

module.exports = { handler, trimFile }
