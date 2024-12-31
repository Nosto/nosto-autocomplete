export function mockFetch<T>(mockUrl: string, response: T) {
  // @ts-expect-error partial mock
  global.fetch = jest.fn((url: string) => {
    if (url === mockUrl) {
      return Promise.resolve({
        status: 200,
        ok: true,
        text: () => Promise.resolve(response),
      })
    }
  })
}
