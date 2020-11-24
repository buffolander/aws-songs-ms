const { signURL } = require('../../clients/aws-s3')

const {
  FILEKEY_PREFIX_UPLOAD: prefix,
} = process.env

module.exports.handler = async (event, context) => {
  const signedURL = signURL('putObject', { Key: `${prefix}song-${Date.now()}.mp3` })
  if (!signedURL) return {
    statusCode: 500,
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      data: {
        signed_url: signedURL,
      },
    }),
  }
}
