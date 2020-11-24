const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')

const {
  trimFile,
} = require('../../lambdas/s3-trim-song')

const inputFilePath = path.resolve('__tests__/file-samples/example-mp3-01.mp3')
const outputFilePath = path.resolve('__tests__/file-samples/output.mp3')

ffmpeg.setFfmpegPath(ffmpegPath)

describe('processing MP3 via FFMPEG', () => {
  const res = trimFile(inputFilePath, outputFilePath)
  it('returns an object', async () => {
    expect(await res).toBeInstanceOf(fs.ReadStream)
  })
})
