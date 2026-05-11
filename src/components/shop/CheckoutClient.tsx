"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { processCheckoutAction, saveAddressAction } from "@/app/actions/checkout";
import { useRouter } from "next/navigation";
import { Address } from "@/generated/prisma/client";

interface CheckoutClientProps {
  items: any[];
  totalPrice: number;
  addresses: Address[];
}

export const CheckoutClient = ({ items, totalPrice, addresses }: CheckoutClientProps) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || "");
  const [isPending, setIsPending] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }

    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("addressId", selectedAddressId);

    const result = await processCheckoutAction(formData);

    if (result.success) {
      router.push(`/shop/checkout/success?orderId=${result.orderId}`);
    } else {
      setError(result.error || "An unknown error occurred");
      setIsPending(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveAddressAction(formData);

    if (result.success) {
      router.refresh();
      setShowAddAddressForm(false);
      setSelectedAddressId(result.addressId!);
      setIsSavingAddress(false);
    } else {
      setError(result.error || "Failed to save address");
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left: Address Selection */}
      <div className="lg:col-span-2 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-6 border-b border-brand-border pb-2">
            <h2 className="text-2xl font-serif font-bold text-brand-primary">
              1. Delivery Address
            </h2>
            {!showAddAddressForm && (
              <button 
                onClick={() => setShowAddAddressForm(true)}
                className="text-xs font-bold text-brand-gold-dark hover:text-brand-primary transition-colors uppercase tracking-widest"
              >
                + Add New
              </button>
            )}
          </div>
          
          {showAddAddressForm ? (
            <form onSubmit={handleAddAddress} className="bg-brand-cream/20 p-8 rounded-3xl border border-brand-border animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">First Name</label>
                  <input name="firstName" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">Last Name</label>
                  <input name="lastName" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">Street Address</label>
                  <input name="street" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">House Number</label>
                  <input name="houseNumber" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">City</label>
                  <input name="city" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">Postal Code</label>
                  <input name="postalCode" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider ml-1">Country</label>
                  <input name="country" defaultValue="Sweden" required className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="submit" 
                  disabled={isSavingAddress}
                  className="bg-brand-primary text-white font-bold px-8 py-3 rounded-full hover:bg-brand-gold-dark transition-all shadow-md disabled:opacity-50"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddAddressForm(false)}
                  className="text-brand-primary font-bold px-8 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                    selectedAddressId === addr.id
                      ? "border-brand-primary bg-brand-cream/50 shadow-md"
                      : "border-brand-border hover:border-brand-gold-dark/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-brand-primary uppercase text-xs tracking-widest">
                      {addr.addressLabel || "Address"}
                    </span>
                    {selectedAddressId === addr.id && (
                      <div className="bg-brand-primary text-white p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-brand-primary font-medium">{addr.firstName} {addr.lastName}</p>
                  <p className="text-muted-foreground text-sm">{addr.street} {addr.houseNumber}</p>
                  <p className="text-muted-foreground text-sm">{addr.postalCode} {addr.city}</p>
                  <p className="text-muted-foreground text-sm">{addr.country}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-cream/30 border border-dashed border-brand-border rounded-3xl">
              <p className="text-muted-foreground mb-4">No addresses found in your account.</p>
              <button 
                onClick={() => setShowAddAddressForm(true)}
                className="text-brand-primary font-bold hover:underline"
              >
                + Add New Address
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6 border-b border-brand-border pb-2">
            2. Payment Method
          </h2>
          <div className="p-6 bg-brand-cream/20 border border-brand-border rounded-2xl">
            <p className="text-sm text-brand-primary italic">
              Rajput Foods uses a **Managed Checkout Workflow**. We will review your order first and then send you a payment link or invoice for the final amount.
            </p>
          </div>
        </section>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-border sticky top-24">
          <h2 className="text-xl font-serif font-bold text-brand-primary mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} <span className="text-brand-gold-dark font-bold">x{item.quantity}</span>
                </span>
                <span className="font-bold text-brand-primary">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-brand-primary">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-brand-gold-dark italic">Calculated after review</span>
            </div>
            <div className="flex justify-between pt-4 text-lg">
              <span className="font-serif font-bold text-brand-primary">Total</span>
              <span className="font-bold text-brand-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={isPending || items.length === 0 || !selectedAddressId}
            className="w-full mt-8 bg-brand-primary text-white font-bold uppercase tracking-widest py-4 rounded-full hover:bg-brand-gold-dark transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Place Order Request"
            )}
            {!isPending && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
          
          <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-tighter">
            By placing a request, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};
