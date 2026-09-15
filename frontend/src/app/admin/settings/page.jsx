"use client";

import React from "react";
import Link from "next/link";
import AdminLayout from "@/app/admin/layout";
import "./settings.css";

const settingsSections = [
  {
    title: "Company Settings",
    description:
      "Manage company identity, contact information, address, and business details.",
    href: "/admin/settings/company",
    icon: "🏢",
  },
  {
    title: "Bank Settings",
    description:
      "Manage bank account information used in business documents.",
    href: "/admin/settings/bank",
    icon: "🏦",
  },
  {
    title: "Quotation Settings",
    description:
      "Configure quotation numbering, defaults, terms, and document preferences.",
    href: "/admin/settings/quotation",
    icon: "📄",
  },
  {
    title: "Invoice Settings",
    description:
      "Configure invoice numbering, default values, and invoice document preferences.",
    href: "/admin/settings/invoice",
    icon: "🧾",
  },
  {
    title: "Product Settings",
    description:
      "Manage solar products, pricing, specifications, and product availability.",
    href: "/admin/settings/products",
    icon: "📦",
  },
  {
    title: "Proposal Settings",
    description:
      "Configure proposal document content, branding, and default information.",
    href: "/admin/settings/proposal",
    icon: "📋",
  },
];

const SettingsPage = () => {
  return (
    <AdminLayout>
      <div className="admin-settings-page">
        <div className="admin-settings-header">
          <div>
            <h1>Settings</h1>
            <p>
              Manage company, document, product, and business configuration.
            </p>
          </div>
        </div>

        <div className="admin-settings-grid">
          {settingsSections.map((section) => (
            <Link
              href={section.href}
              className="admin-settings-card"
              key={section.href}
            >
              <div className="admin-settings-card-icon">
                <span aria-hidden="true">{section.icon}</span>
              </div>

              <div className="admin-settings-card-content">
                <h2>{section.title}</h2>
                <p>{section.description}</p>

                <span className="admin-settings-card-link">
                  Manage Settings
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;