import { PayPalInterface, PayPalProduct } from '@/app/actions/paypalActions'
import { ShopProducts } from '@/components/ShopProducts'
import { CartSummary } from '@/components/cart/CartSummary'

type PayPalCatalogProduct = PayPalProduct & {
  create_time?: string | number | Date
  description?: string
  type?: string
  category?: string
  price?: number
}

type PayPalCatalog = { products: PayPalCatalogProduct[]; total_items: number }

async function getCatalog(): Promise<PayPalCatalog | null> {
  const paypal = new PayPalInterface()
  try {
    return await paypal.getItems()
  } catch (error) {
    console.error('Failed to load PayPal catalog for shop:', error)
    return null
  }
}

function SuccessMessage() {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
      <p className="font-semibold">Order placed successfully!</p>
      <p className="text-sm">Thank you for your purchase. Your order is being processed.</p>
    </div>
  )
}

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const showSuccess = params.order === 'success'
  const catalog = await getCatalog()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Shop</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse available products powered by PayPal.
          </p>
        </div>

        {showSuccess && <SuccessMessage />}

        {!catalog && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Unable to load products right now. Please try again later.
          </div>
        )}

        {catalog && catalog.products.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
            No products are available at the moment.
          </div>
        )}

        {catalog && catalog.products.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <ShopProducts products={catalog.products} />
            </div>
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
