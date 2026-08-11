import { createRoute } from 'honox/factory'

// Fungsi untuk upload gambar ke Cloudinary via API
async function uploadToCloudinary(file: File, cloudName: string, apiKey: string, apiSecret: string): Promise<string> {
  const timestamp = Math.round((new Date()).getTime() / 1000).toString()
  const msgBuffer = new TextEncoder().encode(`timestamp=${timestamp}${apiSecret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const formData = new FormData()
  formData.append("file", file)
  formData.append("timestamp", timestamp)
  formData.append("api_key", apiKey)
  formData.append("signature", signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  })
  const data = await res.json()
  return data.secure_url
}

export default createRoute(async (c) => {
  let message = ''

  if (c.req.method === 'POST') {
    const body = await c.req.parseBody({ all: true })
    const action = body['action']

    if (action === 'update_settings') {
      const waNumber = body['whatsapp_number'] as string
      const itemsPerPage = body['items_per_page'] as string
      await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'whatsapp_number'").bind(waNumber).run()
      await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'items_per_page'").bind(itemsPerPage).run()
      message = 'Pengaturan berhasil diperbarui.'
    } 
    else if (action === 'add_product') {
      const name = body['name'] as string
      const description = body['description'] as string
      const files = (Array.isArray(body['images']) ? body['images'] : [body['images']]).filter(f => f instanceof File && f.size > 0) as File[]
      
      const insertResult = await c.env.DB.prepare("INSERT INTO products (name, description) VALUES (?, ?) RETURNING id").bind(name, description).first()
      const productId = insertResult?.id

      if (productId && files.length > 0) {
        for (const file of files) {
          try {
            const url = await uploadToCloudinary(file, c.env.CLOUDINARY_CLOUD_NAME, c.env.CLOUDINARY_API_KEY, c.env.CLOUDINARY_API_SECRET)
            if (url) {
              await c.env.DB.prepare("INSERT INTO product_images (product_id, url) VALUES (?, ?)").bind(productId, url).run()
            }
          } catch (e) {
            console.error("Gagal upload gambar", e)
          }
        }
      }
      message = 'Produk berhasil ditambahkan.'
    }
    else if (action === 'delete_product') {
      const productId = body['product_id'] as string
      await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run()
      message = 'Produk berhasil dihapus.'
    }
  }

  const { results: settingsRaw } = await c.env.DB.prepare("SELECT * FROM settings").all()
  const waNumber = settingsRaw.find((s: any) => s.key === 'whatsapp_number')?.value || ''
  const itemsPerPage = settingsRaw.find((s: any) => s.key === 'items_per_page')?.value || ''
  
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all()

  return c.render(
    <div class="space-y-8">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold">Dashboard Admin</h2>
        <a href="/" class="text-blue-600 font-medium hover:underline">Lihat Web &rarr;</a>
      </div>

      {message && <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">{message}</div>}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel Config */}
        <div class="bg-white p-6 border rounded-lg shadow-sm">
          <h3 class="text-lg font-bold border-b pb-2 mb-4">Pengaturan Web</h3>
          <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="update_settings" />
            <div>
              <label class="block text-sm font-medium mb-1">Nomor WhatsApp (Contoh: 62812...)</label>
              <input type="text" name="whatsapp_number" value={waNumber} class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Jumlah Item Per Halaman</label>
              <input type="number" name="items_per_page" value={itemsPerPage} class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Simpan Pengaturan</button>
          </form>
        </div>

        {/* Panel Tambah Produk */}
        <div class="bg-white p-6 border rounded-lg shadow-sm">
          <h3 class="text-lg font-bold border-b pb-2 mb-4">Tambah Produk Baru</h3>
          <form method="POST" enctype="multipart/form-data" class="space-y-4">
            <input type="hidden" name="action" value="add_product" />
            <div>
              <label class="block text-sm font-medium mb-1">Nama Produk</label>
              <input type="text" name="name" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea name="description" rows={3} class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Gambar (Bisa pilih lebih dari satu)</label>
              <input type="file" name="images" multiple accept="image/*" class="w-full border p-2 rounded bg-gray-50" required />
            </div>
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Simpan Produk</button>
          </form>
        </div>
      </div>

      {/* Tabel Manajemen Produk */}
      <div class="bg-white p-6 border rounded-lg shadow-sm">
        <h3 class="text-lg font-bold border-b pb-2 mb-4">Daftar Produk ({products.length})</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 border-b">ID</th>
                <th class="p-3 border-b">Nama Produk</th>
                <th class="p-3 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} class="hover:bg-gray-50">
                  <td class="p-3 border-b text-sm text-gray-500">#{p.id}</td>
                  <td class="p-3 border-b font-medium">{p.name}</td>
                  <td class="p-3 border-b">
                    <form method="POST" onSubmit={(e) => { if(!confirm('Yakin ingin menghapus produk ini?')) e.preventDefault() }}>
                      <input type="hidden" name="action" value="delete_product" />
                      <input type="hidden" name="product_id" value={p.id} />
                      <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={3} class="p-4 text-center text-gray-500 border-b">Belum ada produk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
})
