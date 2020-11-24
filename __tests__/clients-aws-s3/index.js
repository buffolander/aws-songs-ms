const path = require('path')

const {
  listObjects,
  objectCRUD,
  signURL,
} = require('../../clients/aws-s3')

describe('listing objects in S3 Bucket', () => {
  const list = listObjects()

  it('returns an object', async () => {
    expect(await list).toBeInstanceOf(Object)
  })

  it('found high-level properties', async () => {
    expect(await list).toHaveProperty(['Contents'])
  })

  it('Content must include a Key', async () => {
    const { Contents: contents } = await list
    contents.map(content => expect(content).toHaveProperty(['Key']))
  })
})

describe('signing S3 URLs', () => {
  it('should return null if missing the file Key', () => {
    expect(signURL()).toBeNull()
  })

  it('expect string to include file Key', () => {
    const fileKey = 'foo'
    expect(signURL('getObject', { Key: fileKey })).toMatch(fileKey)
  })

  it('expect string to be an URL', () => {
    const fileKey = 'foo'
    const regex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g
    expect(signURL('getObject', { Key: fileKey })).toMatch(regex)
  })
})

const sampleFilePath = path.resolve('__tests__/file-samples/logo.png')
