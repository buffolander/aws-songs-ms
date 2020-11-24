const {
  handler,
} = require('../../lambdas/http-get-download-urls')

describe('request signed download URLs', () => {
  const res = handler()

  it('returns an object', async () => {
    expect(await res).toBeInstanceOf(Object)
  })

  it('object has properties "body", "statusCode"', async () => {
    expect(await res).toHaveProperty('body')
    expect(await res).toHaveProperty('statusCode', 200)
  })

  it('property body.data is an collection', async () => {
    const { data } = JSON.parse((await res).body)
    const regex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g
    expect(data).toBeInstanceOf(Array)
    data.map((item) => (expect(item.signed_url).toMatch(regex)))
    data.map((item) => (expect(item.filename).toBeDefined()))
  })
})
