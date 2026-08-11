import { createRoute } from 'honox/factory'
import ProductGrid from '../islands/ProductGrid'

export default createRoute(async (c) => {
  // 1. Ambil nomor halaman dari URL (?page=2), default 1
  const page = Number(c.req.query('page') || '1')
  
  // 2. Ambil pengaturan dari database
  const waResult = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'whatsapp_number'").first()
  const limitResult = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'items_per_page'").first()
  
  const waNumber = String(waResult?.value || '')
  const limit = Number(limitResult?.value || '8') // Jumlah per halaman dari setting admin
  const offset = (page - 1) * limit // Hitung data yang harus dilewati

  // 3. Ambil produk sesuai Limit dan Offset (Paginasi Database)
  const { results: productsRaw } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?").bind(limit, offset).all()
  const { results: imagesRaw } = await c.env.DB.prepare("SELECT * FROM product_images").all()

  // 4. Hitung Total Halaman (BUG DIPERBAIKI DI SINI)
  const countResult = await c.env.DB.prepare("SELECT COUNT(*) as total FROM products").first()
  const totalCount = countResult ? countResult.total : 0
  const totalPages = Math.ceil(Number(totalCount) / limit)

  // 5. Gabungkan produk dengan gambarnya
  const products = productsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    images: imagesRaw.filter((img: any) => img.product_id === p.id).map((img: any) => ({ id: img.id, url: img.url }))
  }))

  // 6. Lempar data ke komponen frontend
  return c.render(<ProductGrid products={products} totalPages={totalPages} currentPage={page} waNumber={waNumber} />)
})
