import { useState } from 'hono/jsx'

type ProductImage = { id: number; url: string }
type Product = { id: number; name: string; description: string; images: ProductImage[] }

export default function ProductGrid({ products, totalPages, currentPage, waNumber }: { products: Product[], totalPages: number, currentPage: number, waNumber: string }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const openModal = (product: Product) => {
    setSelectedProduct(product)
    setCurrentSlide(0)
  }

  const closeModal = () => {
    setSelectedProduct(null)
  }

  const nextSlide = () => {
    if (selectedProduct && currentSlide < selectedProduct.images.length - 1) setCurrentSlide(currentSlide + 1)
  }

  const prevSlide = () => {
    if (selectedProduct && currentSlide > 0) setCurrentSlide(currentSlide - 1)
  }

  const handlePrintFullGrid = () => {
    window.print()
  }

  const handlePrintSingle = () => {
    window.print()
  }

  return (
    <div>
      <div class="flex justify-between items-center mb-6 no-print">
        <h2 class="text-2xl font-bold">Koleksi Kami</h2>
        <button onClick={handlePrintFullGrid} class="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
          Print Semua Halaman
        </button>
      </div>

      <div class="print-area grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} onClick={() => openModal(product)} class="cursor-pointer bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div class="w-full h-48 bg-gray-200 overflow-hidden relative">
              {product.images.length > 0 ? (
                <img src={product.images[0].url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div class="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
              )}
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-1">{product.name}</h3>
              <p class="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div class="flex justify-center mt-8 space-x-2 no-print">
        {Array.from({ length: totalPages }).map((_, i) => (
          <a key={i} href={`/?page=${i + 1}`} class={`px-4 py-2 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
            {i + 1}
          </a>
        ))}
      </div>

      {selectedProduct && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 no-print" onClick={closeModal}>
          <div class="bg-white w-11/12 max-w-3xl rounded-xl shadow-2xl overflow-hidden print-area relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} class="absolute top-4 right-4 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 no-print z-10">&times;</button>
            
            <div class="relative w-full h-96 bg-gray-100 flex items-center justify-center">
              {selectedProduct.images.length > 0 ? (
                <img src={selectedProduct.images[currentSlide].url} alt={selectedProduct.name} class="w-full h-full object-contain" />
              ) : (
                <span class="text-gray-400">Tidak ada gambar</span>
              )}
              
              {selectedProduct.images.length > 1 && (
                <div class="absolute inset-0 flex items-center justify-between px-4 no-print">
                  <button onClick={prevSlide} disabled={currentSlide === 0} class="bg-white bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 shadow">
                    &#8592;
                  </button>
                  <button onClick={nextSlide} disabled={currentSlide === selectedProduct.images.length - 1} class="bg-white bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 shadow">
                    &#8594;
                  </button>
                </div>
              )}
            </div>

            <div class="p-6">
              <h2 class="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
              <p class="text-gray-600 mb-6">{selectedProduct.description}</p>
              
              <div class="flex space-x-4 no-print">
                <a href={`https://wa.me/${waNumber}?text=Halo, saya ingin bertanya tentang produk: ${encodeURIComponent(selectedProduct.name)}`} target="_blank" class="flex-1 bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 rounded-lg transition-colors">
                  Tanya via WhatsApp
                </a>
                <button onClick={handlePrintSingle} class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors">
                  Print Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
