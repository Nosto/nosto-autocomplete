function dummyProduct(index: number) {
  return {
    id: String(index),
    name: "Product " + index,
    url: "/product-" + index,
    imageUrl: `https://picsum.photos/id/${index + 100}/300/300`,
    price: (Math.random() * 100).toFixed(2),
    listPrice: (Math.random() * 100 + 50).toFixed(2),
    brand: "Brand A",
  }
}

const api = {
  search: () =>
    Promise.resolve({
      products: {
        hits: [
          dummyProduct(1),
          dummyProduct(2),
          dummyProduct(3),
          dummyProduct(4),
        ],
      },
      keywords: {
        hits: [
          { keyword: "keyword1" },
          { keyword: "keyword2" },
          { keyword: "keyword3" },
        ],
      }
    }),
  recordSearchClick: () => {},
  internal: {
    getSettings: () => {},
  },
}

// @ts-expect-error not typed
window.nostojs = cb => cb(api)
