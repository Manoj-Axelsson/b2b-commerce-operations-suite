"use client";

import { useState } from "react";
import Link from "next/link";

export interface DetailedPromotionAlert {
  productId: string;
  productName: string;
  articleNo: string;
  eventType: 'STARTING' | 'ENDING';
  discountType: string;
}

export interface NotificationCounts {
  lowStock: number;
  pendingApprovals: number;
  promotionsEndingSoon: number;
  detailedPromotions: DetailedPromotionAlert[];
  expiringSoon: number;
}

interface AdminNotificationsDropdownProps {
  counts: NotificationCounts;
}

interface NotificationItem {
  id: string;
  label: string;
  count: number;
  href: string;
  color: string;
  icon: string;
}

// Client component — receives pre-fetched counts from the Server Component parent.
// Renders a bell icon badge in the sidebar and a dropdown panel on click.
export const AdminNotificationsDropdown = ({ counts }: AdminNotificationsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const totalAlerts =
    counts.lowStock +
    counts.pendingApprovals +
    counts.promotionsEndingSoon +
    counts.expiringSoon;

  const notifications: NotificationItem[] = [
    {
      id: "low-stock",
      label: "Low or out of stock",
      count: counts.lowStock,
      href: "/admin/inventory",
      color: "text-red-600",
      icon: "📦",
    },
    {
      id: "pending-approvals",
      label: "Pending member approvals",
      count: counts.pendingApprovals,
      href: "/admin/customers",
      color: "text-orange-600",
      icon: "👤",
    },
    {
      id: "expiring-soon",
      label: "Products expiring in three days or less",
      count: counts.expiringSoon,
      href: "/admin/inventory",
      color: "text-red-700",
      icon: "⏰",
    },
  ];

  // Add each promotion as a separate notification item
  counts.detailedPromotions.forEach((promo) => {
    notifications.push({
      id: `promo-${promo.productId}-${promo.eventType}`,
      label: `${promo.productName} (${promo.discountType.replace("_", " ")}) ${promo.eventType === "STARTING" ? "starting" : "ending"} in less than twenty-four hours`,
      count: 1,
      href: `/admin/products/${promo.productId}/edit`,
      color: promo.eventType === "STARTING" ? "text-green-600" : "text-orange-600",
      icon: "🏷️",
    });
  });

  // Only show items with at least one alert
  const activeNotifications = notifications.filter((n) => n.count > 0);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasViewed(true);
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        id="admin-notifications-button"
        onClick={handleToggle}
        aria-label={`Notifications — ${totalAlerts} alert${totalAlerts !== 1 ? "s" : ""}`}
        aria-expanded={isOpen}
        className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-yellow-100 transition-colors text-yellow-800"
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-5 h-5 shrink-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        <span className="text-sm font-semibold flex-1 text-left">Notifications</span>

        {totalAlerts > 0 && !hasViewed && (
          <span
            aria-hidden="true"
            className="w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none shrink-0"
          >
            {totalAlerts > 99 ? "99+" : totalAlerts}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Admin notifications"
          className="absolute left-full top-0 ml-2 w-72 bg-white border border-yellow-200 rounded-lg shadow-xl z-50 py-2"
        >
          <p className="px-4 py-1 text-xs font-bold text-yellow-700 uppercase tracking-wider border-b border-yellow-100 mb-1">
            Alert Centre
          </p>

          {activeNotifications.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 italic">
              All clear — no alerts right now.
            </p>
          ) : (
            activeNotifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition-colors"
              >
                <span aria-hidden="true" className="text-base">{n.icon}</span>
                <span className="flex-1 text-sm text-slate-800">{n.label}</span>
                <span className={`text-sm font-bold ${n.color}`}>{n.count}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};
