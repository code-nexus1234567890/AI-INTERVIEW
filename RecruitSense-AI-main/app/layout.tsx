import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./AppProviders";

export const metadata: Metadata = {
  title: "RecruitSense-AI | AI Interview Platform",
  description: "Prepare for interviews with AI-powered practice, real-time emotion telemetry, and custom neural network scoring.",
};

const raleway = Raleway({ subsets: ["latin"] });

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={raleway.className}>
        <AppProviders clerkKey={clerkPublishableKey}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
