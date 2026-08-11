import { createRoute } from 'honox/factory'
import ProductGrid from '../islands/ProductGrid'

export default createRoute(async (c) => {
  const page = Number(c.req.query('page') || '1')
  
  const waResult = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'whatsapp_number'").first()
  const limitResult = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'items_per_page'").first()
  
  const waNumber = String(waResult?.value || '')
  const limit = Number(limitResult?.value || '8')
  const offset = (page - 1) * limit

  const { results: productsRaw } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?").bind(limit, offset).all()
  const { results: imagesRaw } = await c.env.DB.prepare("SELECT * FROM product_images").all()

  const { count } = await c.env.DB.prepare("SELECT COUNT(*) as c FROM products").first() || { count: 0 }
  const totalPages = Math.ceil(Number(count) / limit)

  const products = productsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    images: imagesRaw.filter((img: any) => img.product_id === p.id).map((img: any) => ({ id: img.id, url: img.url }))
  }))

  return c.render(<ProductGrid products={products} totalPages={totalPages} currentPage={page} waNumber={waNumber} />)
})
