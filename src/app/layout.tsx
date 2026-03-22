import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onegpt.sh"),
  title: {
    default: "OneGPT - All AI models, one place.",
    template: "%s | OneGPT",
  },
  description:
    "OneGPT brings together top AI models from OpenAI, Anthropic, Google, DeepSeek, and more into a single chat interface. Switch models instantly, compare responses, and get the best answer every time.",
  openGraph: {
    url: "https://onegpt.sh",
    siteName: "OneGPT",
    type: "website",
  },
  keywords: [
    "onegpt",
    "OneGPT",
    "all ai models in one",
    "multi model ai chat",
    "ai chat aggregator",
    "chatgpt alternative",
    "ai model comparison",
    "unified ai chat",
    "ai assistant",
    "best ai chat app",
    "openai",
    "anthropic",
    "google gemini",
    "deepseek",
    "claude alternative",
    "multiple ai models",
    "ai playground",
    "free ai chat",
    "ai search",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://onegpt.sh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-dvh antialiased ${geistSans.variable} ${geistMono.variable} font-sans ${figtree.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "colourful", "t3chat", "claudedark", "claudelight", "neutrallight", "neutraldark"]}
        >
          <StackProvider app={stackServerApp}>
            <StackTheme>
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
