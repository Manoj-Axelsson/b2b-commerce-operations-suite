import { createProduct, updateProduct } from "./actions";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    brand: string;
    articleNo: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    weightValue: number;
    weightUnit: string;
    quantity: number;
    minQuantity: number;
    categoryId: string;
    discountPrice?: number | null;
    discountStart?: Date | null;
    discountEnd?: Date | null;
    expiryDate?: Date | null;
  };
}

const WEIGHT_UNITS = ["g", "kg", "ml", "l"];

export function ProductForm({ categories, product }: ProductFormProps) {
  const isEditing = Boolean(product);
  const action = isEditing ? updateProduct : createProduct;

  return (
    <form action={action} className="space-y-6 max-w-3xl">

      {isEditing && <input type="hidden" name="id" value={product!.id} />}

      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Product Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product?.name ?? ""}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="e.g. Classic Basmati Rice" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="brand" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Brand *
            </label>
            <input
              id="brand"
              name="brand"
              required
              defaultValue={product?.brand ?? ""}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="e.g. Rajput Foods" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="articleNo" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Article No. *
            </label>
            <input
              id="articleNo"
              name="articleNo"
              required
              defaultValue={product?.articleNo ?? ""}
              className="border rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="e.g. RF-001" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="categoryId" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
            placeholder="Optional product description visible to customers" />
        </div>
      </section>

      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Weight & Pricing</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="flex flex-col gap-1">
            <label htmlFor="weightValue" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Weight Value *
            </label>
            <input
              id="weightValue"
              name="weightValue"
              type="number"
              min={1}
              required
              defaultValue={product?.weightValue ?? ""}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="e.g. 5000" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="weightUnit" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Unit *
            </label>
            <select
              id="weightUnit"
              name="weightUnit"
              required
              defaultValue={product?.weightUnit ?? "g"}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
            >
              {WEIGHT_UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Price (öre) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={product?.price ?? ""}
              className="border rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="e.g. 24900 = 249.00 kr" />
            <p className="text-[10px] text-gray-400">100 öre = 1 kr.</p>
          </div>

        </div>

        <div className="pt-4 border-t border-dashed border-gray-100">
          <h3 className="text-xs font-bold text-blue-600 uppercase mb-3">Promotions & Discounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="discountPrice" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Discount Price (öre)
              </label>
              <input
                id="discountPrice"
                name="discountPrice"
                type="number"
                min={0}
                defaultValue={product?.discountPrice ?? ""}
                className="border rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Must be < Regular Price" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="discountStart" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Discount Start
              </label>
              <input
                id="discountStart"
                name="discountStart"
                type="date"
                defaultValue={product?.discountStart ? new Date(product.discountStart).toISOString().split('T')[0] : ""}
                className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="discountEnd" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Discount End
              </label>
              <input
                id="discountEnd"
                name="discountEnd"
                type="date"
                defaultValue={product?.discountEnd ? new Date(product.discountEnd).toISOString().split('T')[0] : ""}
                className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Note: End date must be in the future and after Start date.</p>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Stock</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1">
            <label htmlFor="quantity" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Current Stock
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              defaultValue={product?.quantity ?? 0}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="minQuantity" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Min. Stock (restock alert)
            </label>
            <input
              id="minQuantity"
              name="minQuantity"
              type="number"
              min={0}
              defaultValue={product?.minQuantity ?? 5}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
          </div>

        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 mt-2 pt-4 border-t border-dashed border-gray-100">
          <label htmlFor="expiryDate" className="text-[14px] font-bold text-slate-950 uppercase tracking-wider subpixel-antialiased">
            Expiry Date
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            defaultValue={product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ""}
            className="border rounded px-3 py-2 text-lg text-slate-950 focus:ring-2 focus:ring-yellow-400 outline-none subpixel-antialiased" />
          <p className="text-[10px] text-gray-400 mt-1 italic">Controls the 3-day expiry notification in the Admin command center.</p>
        </div>

    </section>

      <section className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Image</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="imageUrl" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Image Path or URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            defaultValue={product?.imageUrl ?? ""}
            className="border rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-yellow-400 outline-none"
            placeholder="e.g. /images/products/basmati.jpg" />
          <p className="text-[10px] text-gray-400">
            Upload image files to <code>public/images/products/</code> and enter the path here.
            Phase 2 will add drag-and-drop uploads directly.
          </p>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded font-bold text-sm transition-colors"
        >
          {isEditing ? "Save Changes" : "Create Product"}
        </button>
        <a
          href="/admin/products"
          className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded text-sm transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
