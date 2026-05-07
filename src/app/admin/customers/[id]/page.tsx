// src/app/admin/customers/[id]/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { 
            include: { product: true } 
          } 
        }
      }
    }
  });

  if (!customer) notFound();

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="text-blue-600 hover:underline">← Back to Customers</Link>
        <h1 className="text-2xl font-bold">Customer Details: {customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kundinfo Kort */}
        <div className="bg-white border rounded-lg p-6 shadow-sm h-fit">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-900">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">System-ID</p>
              <p className="text-[10px] font-mono text-gray-400">{customer.id}</p>
            </div>
            <div className="pt-2">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                customer.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {customer.role || "CUSTOMER"}
              </span>
            </div>
          </div>
        </div>

        {/* Orderhistorik */}
        <div className="bg-white border rounded-lg p-6 shadow-sm md:col-span-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Order History</h2>
          
          {customer.orders.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed rounded-lg">
              <p className="text-gray-400 italic text-sm">No order history found for this customer.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {customer.orders.map((order) => (
                <div key={order.id} className="border rounded-lg overflow-hidden border-gray-100">
                  <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                    <span className="font-bold text-sm">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[11px] text-gray-500 font-medium italic">
                      {order.createdAt.toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="text-xs text-gray-400 font-bold uppercase mt-1">Address:</div>
                      <div className="text-sm text-gray-700">
                        {order.deliveryStreet}, {order.deliveryPostalCode} {order.deliveryCity}
                      </div>
                    </div>

                    {/* Produkter i ordern */}
                    {order.items && order.items.length > 0 && (
                      <div className="bg-white rounded border border-gray-50 overflow-hidden">
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-gray-50">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2 pr-2 text-gray-600 italic">
                                  {item.productName}
                                </td>
                                <td className="py-2 px-2 text-gray-400">x{item.quantity}</td>
                                <td className="py-2 pl-2 text-right font-medium">{formatCurrency(Number(item.price) * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                         order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                      <div className="text-sm">
                        <span className="text-gray-400 mr-1 text-xs uppercase font-bold">Sum:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(Number(order.totalPrice))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
