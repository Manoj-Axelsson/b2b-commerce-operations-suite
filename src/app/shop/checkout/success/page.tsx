import Link from "next/link";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams;
  const orderId = params.orderId;
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-brand-primary mb-4">Request Received!</h1>
        <p className="text-muted-foreground mb-8">
          Your order request <span className="text-brand-primary font-bold">#{orderId?.slice(-6).toUpperCase()}</span> has been submitted successfully.
        </p>
        
        <div className="bg-brand-cream/30 p-6 rounded-2xl mb-8 border border-brand-border text-sm text-brand-primary italic">
          Our team is now reviewing your order. We will contact you shortly with the final quote and payment instructions.
        </div>

        <div className="space-y-4">
          <Link 
            href="/shop"
            className="block w-full bg-brand-primary text-white font-bold uppercase tracking-widest py-4 rounded-full hover:bg-brand-gold-dark transition-all duration-300"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/account"
            className="block w-full text-brand-primary font-bold text-sm hover:underline"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
