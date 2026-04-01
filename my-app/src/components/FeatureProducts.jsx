const fallbackProducts = [
  {
    id: 'fp-1',
    title: 'Amara Cot & Chest Nursery Package - Beech',
    body_html: 'Form gon, di em chan, hop moi outfit.',
    price: 59000000,
    compare_at_price: 69000000,
    url: '#',
    available: true,
    featured_image: 'https://placehold.co/100x100.png',
  },
  {
    id: 'fp-2',
    title: 'Everyday Backpack',
    body_html: 'Ngan rong rai, chong soc nhe, de mang theo.',
    price: 42000000,
    compare_at_price: 52000000,
    url: '#',
    available: true,
    featured_image: 'https://placehold.co/300x300.png',
  },
  {
    id: 'fp-2',
    title: 'Everyday Backpack',
    body_html: 'Ngan rong rai, chong soc nhe, de mang theo.',
    price: 42000000,
    compare_at_price: 52000000,
    url: '#',
    available: true,
    featured_image: 'https://placehold.co/300x300.png',
  },
  {
    id: 'fp-2',
    title: 'Everyday Backpack',
    body_html: 'Ngan rong rai, chong soc nhe, de mang theo.',
    price: 42000000,
    compare_at_price: 52000000,
    url: '#',
    available: true,
    featured_image: 'https://placehold.co/300x300.png',
  },
  {
    id: 'fp-2',
    title: 'Everyday Backpack',
    body_html: 'Ngan rong rai, chong soc nhe, de mang theo.',
    price: 42000000,
    compare_at_price: 52000000,
    url: '#',
    available: true,
    featured_image: 'https://placehold.co/300x300.png',
  },
]

function parseEmbeddedProducts() {
  if (typeof window === 'undefined') return []

  if (Array.isArray(window.__SHOPIFY_FEATURED_PRODUCTS__)) {
    return window.__SHOPIFY_FEATURED_PRODUCTS__
  }

  const node = document.getElementById('shopify-featured-products-data')
  if (!node) return []

  try {
    const parsed = JSON.parse(node.textContent || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeProduct(product) {
  const featuredImage =
    product.featured_image?.src ||
    product.featured_image ||
    product.image?.src ||
    product.image ||
    ''

  const priceInCents = Number(product.price || 0)
  const compareAtPriceInCents = Number(product.compare_at_price || 0)

  return {
    id: product.id || product.handle || Math.random().toString(36),
    title: product.title || 'Untitled product',
    description: product.body_html || product.description || '',
    priceInCents,
    compareAtPriceInCents,
    url: product.url || `/products/${product.handle || ''}`,
    available: product.available !== false,
    featuredImage,
  }
}

function formatMoneyFromCents(cents) {
  const currency = window?.Shopify?.currency?.active || 'VND'
  const locale = document?.documentElement?.lang || 'vi-VN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function FeatureProducts() {
  const rawProducts = parseEmbeddedProducts()
  const products = (rawProducts.length > 0 ? rawProducts : fallbackProducts)
    .map(normalizeProduct)
    .filter((product) => product.id && product.title)

  return (
    <section className="tw:mt-8">
      <header className="tw:mb-8 tw:after:block tw:after:content[''] tw:after:w-full tw:after:border-b tw:after:border-gray-500 tw:after:pb-4">
        <h2 className="tw:text-xl tw:text-black tw:text-center tw:uppercase tw:font-[500] tw:leading-[1.5] tw:tracking-[1px]">
          Featured Products
        </h2>
        <div className="tw:max-w-[700px] tw:mt-4 tw:ml-auto tw:mr-auto tw:text-center tw:truncate" >The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.</div>
      </header>

      <ul className="tw:grid tw:grid-cols-2 tw:md:grid-cols-4 tw:gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <article className="tw:h-full tw:flex tw:flex-col tw:border tw:border-[#ccc] tw:rounded-lg tw:overflow-hidden">
              <a href={product.url} className="">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage}
                    alt={product.title}
                    loading="lazy"
                    className="tw:object-cover tw:w-full tw:h-full tw:scale-90"
                  />
                ) : null}
              </a>

              <div className="tw:flex tw:flex-col tw:p-4 tw:gap-2">
                <div className="tw:flex tw:gap-4 tw:items-start">
                  <a href={product.url} className="tw:text-[16px] tw:text-black tw:leading-[1.2] tw:hover:text-blue-500 tw:hover:underline tw:hover:underline-offset-3">
                    {product.title}
                  </a>
                  <span style={{"--var-p": "2px", "--my-color": "#f00"}} className="tw:shrink-0 tw:text-[12px] tw:text-[#ccc] tw:p-(--var-p)">
                    {product.available ? 'In stock' : 'Sold out'}
                  </span>
                </div>

                <div className="tw:flex tw:items-end tw:gap-2 tw:mb-2">
                  {product.compareAtPriceInCents > product.priceInCents ? (
                    <span className="tw:text-[14px] tw:text-[#ccc] tw:line-through tw:decoration-black">
                      {formatMoneyFromCents(product.compareAtPriceInCents)}
                    </span>
                  ) : null}
                  <span className="tw:tex-[18px]">
                    {formatMoneyFromCents(product.priceInCents)}
                  </span>
                </div>

                <a
                  href={product.url}
                  className="tw:rounded-lg tw:p-2 tw:block
                  tw:bg-black tw:hover:bg-[#ccc] tw:text-white tw:hover:text-[#000] tw:text-[16px] tw:text-center tw:capitalize tw:transition-all tw:ease-in tw:duration-300"
                >
                  View product
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

