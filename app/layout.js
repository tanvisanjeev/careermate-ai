import "./globals.css";

export const metadata = {
  title: "CareerMate AI",
  description: "AI-powered resume matcher and career toolkit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
