const fallbackProducts = [
  {
    id: 'fp-1',
    title: 'Minimalist Sneakers',
    body_html: 'Form gon, di em chan, hop moi outfit.',
    price: 59000000,
    compare_at_price: 69000000,
    url: '#',
    available: true,
    featured_image:
      'https://images.unsplash.com/photo-1528701800489-20be3c2b5c5a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'fp-2',
    title: 'Everyday Backpack',
    body_html: 'Ngan rong rai, chong soc nhe, de mang theo.',
    price: 42000000,
    compare_at_price: 52000000,
    url: '#',
    available: true,
    featured_image:
      'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80',
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
    <section className="tw:py-10">
      <header className="tw:mb-6">
        <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900">
          Featured Products
        </h2>
      </header>

      <ul className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 lg:tw:grid-cols-4 tw:gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <article className="tw:h-full tw:bg-white tw:rounded-2xl tw:overflow-hidden tw:border tw:border-slate-200 tw:hover:tw:shadow-lg tw:transition tw:duration-300">
              <div className="tw:aspect-[4/3] tw:bg-slate-100">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage}
                    alt={product.title}
                    loading="lazy"
                    className="tw:object-cover tw:w-full tw:h-full"
                  />
                ) : null}
              </div>

              <div className="tw:p-4">
                <div className="tw:flex tw:items-start tw:justify-between tw:gap-3">
                  <h3 className="tw:text-base tw:font-semibold tw:text-slate-900">
                    {product.title}
                  </h3>
                  <span className="tw:shrink-0 tw:inline-flex tw:items-center tw:px-2 tw:py-1 tw:text-xs tw:font-medium tw:rounded-full tw:bg-slate-100 tw:text-slate-700">
                    {product.available ? 'In stock' : 'Sold out'}
                  </span>
                </div>

                <div className="tw:mt-4 tw:flex tw:items-center tw:gap-3">
                  {product.compareAtPriceInCents > product.priceInCents ? (
                    <span className="tw:text-sm tw:text-slate-500 tw:line-through">
                      {formatMoneyFromCents(product.compareAtPriceInCents)}
                    </span>
                  ) : null}
                  <span className="tw:text-lg tw:font-bold tw:text-slate-900">
                    {formatMoneyFromCents(product.priceInCents)}
                  </span>
                </div>

                <a
                  href={product.url}
                  className="tw:mt-4 tw:inline-flex tw:w-full tw:items-center tw:justify-center tw:px-3 tw:py-2 tw:bg-slate-900 tw:text-white tw:rounded-xl tw:hover:tw:bg-slate-800 tw:transition"
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

