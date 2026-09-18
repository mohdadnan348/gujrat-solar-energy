import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "GUJRAT SOLAR ENERGY",
  description:
    "Solar Company Management System for managing leads, solar requirements, system configurations, quotations, customers, invoices, tasks, employees, attendance, leaves, and reports.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}