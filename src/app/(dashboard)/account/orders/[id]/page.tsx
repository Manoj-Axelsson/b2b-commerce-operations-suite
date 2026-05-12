import { OrderStatus } from "@/generated/prisma/client";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { getOrderWithHistory } from "@/modules/orders/order.services";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    IN_PROCESS: "In Review",
    AWAITING_PAYMENT: "Awaiting Payment",
    CONFIRMED: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    const order = await getOrderWithHistory(id);

    if (!order || order.userId !== session.user.id) {
        notFound();
    }

    // Define steps for the timeline
    const steps = [
        { status: OrderStatus.IN_PROCESS, label: "Submitted", sub: "Order under review" },
        { status: OrderStatus.AWAITING_PAYMENT, label: "Payment Requested", sub: "Check your email" },
        { status: OrderStatus.CONFIRMED, label: "Confirmed", sub: "Preparing your order" },
        { status: OrderStatus.SHIPPED, label: "Shipped", sub: "On the way" },
        { status: OrderStatus.DELIVERED, label: "Delivered", sub: "Received" },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="min-h-screen bg-brand-cream p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Navigation & Header */}
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/account/orders" className="p-2 hover:bg-white rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-brand-primary">Order Details</h1>
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">ID: {order.id}</p>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === OrderStatus.CANCELLED ? "bg-red-500" : "bg-brand-primary"
                            }`} />
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">{STATUS_LABELS[order.status]}</span>
                    </div>
                </div>

                {/* Managed Workflow Timeline */}
                {order.status !== OrderStatus.CANCELLED && (
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-serif font-bold text-brand-primary mb-8 text-center">Order Progress</h2>
                        <div className="relative flex justify-between">
                            {/* Background Line */}
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 z-0" />

                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStepIndex;
                                const isCurrent = idx === currentStepIndex;

                                return (
                                    <div key={step.status} className="relative z-10 flex flex-col items-center flex-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? "bg-brand-primary text-white" :
                                            isCurrent ? "bg-white border-4 border-brand-primary text-brand-primary scale-110 shadow-lg" :
                                                "bg-white border-2 border-slate-100 text-slate-300"
                                            }`}>
                                            {isCompleted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs font-bold">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? "text-brand-primary" : "text-slate-400"}`}>
                                                {step.label}
                                            </p>
                                            <p className="hidden md:block text-[9px] text-slate-400 mt-0.5">{step.sub}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* State-specific instructions */}
                        <div className="mt-12 p-6 bg-brand-cream rounded-2xl border border-brand-border text-center">
                            {order.status === OrderStatus.IN_PROCESS && (
                                <p className="text-sm text-brand-primary italic">
                                    &quot;We are currently reviewing your order request. We will update the total with shipping costs and send you payment instructions shortly.&quot;
                                </p>
                            )}
                            {order.status === OrderStatus.AWAITING_PAYMENT && (
                                <p className="text-sm text-brand-primary font-semibold">
                                    &quot;Your order is approved! Please follow the payment instructions sent to your email to finalize the purchase.&quot;
                                </p>
                            )}
                            {order.status === OrderStatus.CONFIRMED && (
                                <p className="text-sm text-brand-primary">
                                    &quot;Payment received. We are now preparing your items for shipment.&quot;
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-serif font-bold text-brand-primary mb-6">Order Items</h2>
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-brand-cream rounded-xl flex items-center justify-center text-brand-primary font-bold text-xs">
                                            {item.quantity}x
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                                            <p className="text-xs text-slate-500">Unit Price: {formatCurrency(Number(item.price))}</p>
                                        </div>
                                        <div className="text-right font-bold text-slate-900">
                                            {formatCurrency(Number(item.lineTotal))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Details */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-serif font-bold text-brand-primary mb-6">Shipping Address</h2>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p className="font-bold text-slate-900">{order.user.name}</p>
                                <p>{order.deliveryStreet}</p>
                                <p>{order.deliveryPostalCode} {order.deliveryCity}</p>
                                <p>{order.deliveryCountry}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-6">
                        <div className="bg-brand-primary text-white rounded-[2rem] p-8 shadow-xl">
                            <h2 className="text-lg font-serif font-bold mb-6">Order Summary</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-brand-cream/70">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(Number(order.subtotalPrice))}</span>
                                </div>

                                {order.adjustments.map(adj => (
                                    <div key={adj.id} className="flex justify-between italic">
                                        <span>{adj.description || adj.type}</span>
                                        <span>{formatCurrency(Number(adj.amount))}</span>
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                                    <span className="font-serif text-xl">Total</span>
                                    <span className="text-2xl font-bold text-brand-gold">{formatCurrency(Number(order.totalPrice))}</span>
                                </div>
                            </div>

                            {order.status === OrderStatus.AWAITING_PAYMENT && (
                                <button className="w-full mt-8 bg-brand-gold text-brand-primary font-bold py-4 rounded-full uppercase tracking-widest hover:bg-white transition-colors">
                                    Complete Payment
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Need Help?</p>
                            <p className="text-xs text-slate-600">Contact us at support@rajputfoods.se regarding Order #{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
