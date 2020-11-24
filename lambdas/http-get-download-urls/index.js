const { listObjects, signURL } = require('../../clients/aws-s3')

const {
  FILEKEY_PREFIX_TRIMMED: prefix,
} = process.env

const handler = async (event, context) => {
  try {
    const { Contents: fileDetailsArray } = await listObjects({ Prefix: prefix })

    const signedURLs = fileDetailsArray.map((file) => {
      const signedURL = signURL('getObject', { Key: file.Key })
      if (!signedURL) throw new Error({ error: 'null signedURL', fileDetailsArray })
      return {
        filename: file.Key.replace(prefix, ''),
        signed_url: signedURL,
      }
    })

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
