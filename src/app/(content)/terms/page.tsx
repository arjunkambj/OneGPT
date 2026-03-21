import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LegalHeader } from "@/components/legal/legal-header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "OneGPT Terms of Service — the rules and guidelines for using our multi-model AI chat platform.",
  alternates: {
    canonical: "https://onegpt.sh/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const policySections = [
  {
    id: "acceptance",
    label: "Acceptance",
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using OneGPT, you confirm that you have read, understood, and agree to be bound by these Terms. We may update these terms from time to time, and continued use after changes are posted means you accept the updated terms.",
    ],
  },
  {
    id: "service",
    label: "Service",
    title: "Description of Service",
    paragraphs: [
      "OneGPT is a unified AI chat platform that gives you access to multiple AI models from different providers in a single interface. You can switch between models from OpenAI, Anthropic, Google, DeepSeek, Mistral, xAI, and others to find the best response for your needs.",
      "The service is hosted on Vercel, uses Convex for backend data storage, and integrates with Stack Auth for account authentication.",
    ],
  },
  {
    id: "conduct",
    label: "User Conduct",
    title: "User Conduct",
    paragraphs: ["You agree not to use OneGPT to:"],
    items: [
      "Violate any applicable laws, regulations, or third-party rights",
      "Generate, distribute, or promote illegal, harmful, or abusive content",
      "Attempt to gain unauthorized access to our systems or infrastructure",
      "Conduct automated scraping, crawling, or bulk querying of the service",
      "Distribute malware, viruses, or any other harmful code",
      "Interfere with the normal operation of the platform or degrade the experience for other users",
      "Circumvent usage limits, rate limits, or subscription restrictions",
    ],
  },
  {
    id: "content",
    label: "Content",
    title: "Content and Results",
    paragraphs: [
      "OneGPT routes your prompts to third-party AI models. While we aim to provide a reliable interface:",
    ],
    items: [
      "We do not guarantee the accuracy, completeness, or reliability of any AI-generated output",
      "AI responses may contain errors, biases, or outdated information",
      "You are responsible for evaluating and verifying any output before relying on it",
    ],
    afterItems: [
      "OneGPT should not be used as the sole basis for decisions in professional, medical, legal, or financial contexts. Always exercise your own judgment.",
    ],
  },
  {
    id: "ip",
    label: "IP",
    title: "Intellectual Property",
    paragraphs: [
      "The OneGPT platform \u2014 including its design, branding, code, and documentation \u2014 is our property and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the service without our written permission.",
      "You retain ownership of the content you create through your use of the platform, subject to the terms of the underlying AI model providers.",
    ],
  },
  {
    id: "third-party",
    label: "Third-Party",
    title: "Third-Party Services",
    paragraphs: [
      "OneGPT relies on several third-party services to operate:",
    ],
    items: [
      { bold: "AI Providers:", text: "OpenAI, Anthropic, Google, DeepSeek, Mistral, xAI, and others process your chat messages" },
      { bold: "Vercel:", text: "Provides hosting and infrastructure" },
      { bold: "Convex:", text: "Powers our backend data layer" },
      { bold: "Stack Auth:", text: "Handles account authentication" },
      { bold: "DodoPayments:", text: "Processes all billing and subscription payments" },
    ],
    afterItems: [
      "Each of these services operates under its own terms and privacy policies. We are not responsible for their practices or data handling beyond what we can control.",
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    title: "Pricing and Billing",
    paragraphs: [
      "OneGPT offers free and paid subscription tiers. For full details, visit our Pricing page.",
    ],
    items: [
      { bold: "Free:", text: "10 messages per day with access to basic AI models, chat history, and web search." },
      { bold: "Pro ($15/month):", text: "Unlimited messages, all base AI models, vision support, file uploads, custom instructions, and priority support." },
      { bold: "Max ($60/month):", text: "Everything in Pro, plus Anthropic Claude models (60 requests/week) and Gemini Pro models (80 requests/month)." },
    ],
    afterItems: [
      "We reserve the right to adjust pricing, model availability, or tier classifications at any time due to provider cost changes, usage patterns, or operational needs.",
      "Payment Data: OneGPT never stores your payment card details. All financial transactions are handled directly by DodoPayments.",
    ],
  },
  {
    id: "cancellation",
    label: "Cancellation",
    title: "Cancellation and Refunds",
    paragraphs: ["You can cancel your subscription at any time. When you do:"],
    items: [
      "You keep access to paid features until the end of your current billing cycle",
      "Your account reverts to the Free plan after the period ends",
      "No partial refunds are issued for unused time within a billing period",
    ],
    afterItems: [
      "Refund Policy: All subscription fees are final and non-refundable. Please evaluate the service on the Free plan before upgrading.",
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    title: "Privacy",
    paragraphs: [
      "Your use of OneGPT is also governed by our Privacy Policy, which is incorporated into these Terms by reference.",
    ],
  },
  {
    id: "liability",
    label: "Liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent allowed by law, OneGPT shall not be liable for any indirect, incidental, special, consequential, or punitive damages \u2014 including loss of profits, data, or goodwill \u2014 arising from your use of or inability to use the service.",
    ],
  },
  {
    id: "disclaimers",
    label: "Disclaimers",
    title: "Disclaimers",
    paragraphs: [
      'OneGPT is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or that AI outputs will meet your expectations.',
      "We reserve the right to suspend or terminate your access at any time if we believe you are violating these terms or harming the platform or its users.",
    ],
  },
  {
    id: "contact",
    label: "Contact",
    title: "Contact Us",
    paragraphs: [
      "Questions about these Terms of Service? Get in touch:",
      "hello@onegpt.sh",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader currentPage="terms" />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-16">
          <main>
            {/* Title */}
            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 mb-4 block font-medium">
                Legal
              </span>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-4">
                Terms of Service
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Last updated: March 21, 2026</span>
                <span className="w-px h-3 bg-border/50" />
                <span className="flex items-center gap-1.5">
                  <Icon icon="solar:clock-circle-linear" className="w-3 h-3" />
                  7 min read
                </span>
              </div>
            </div>

            {/* TLDR */}
            <div className="mb-12 p-5 rounded-2xl border border-primary/15 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Icon
                  icon="solar:document-text-linear"
                  className="w-4 h-4 text-primary/60"
                />
                <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-medium">
                  Quick Summary
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                OneGPT is free to use with optional Pro ($15/mo) and Max
                ($60/mo) plans. We route your messages to the AI model you
                choose &mdash; we don&apos;t store payment details. You own your
                conversations. Use the platform responsibly, verify important
                answers independently, and don&apos;t abuse the service. You can
                cancel anytime; subscriptions are non-refundable.
              </p>
            </div>

            {/* Intro */}
            <p className="text-base text-foreground/80 leading-relaxed mb-6">
              Welcome to OneGPT. These Terms of Service govern your access to
              and use of our platform. By using OneGPT, you agree to these
              terms. If you do not agree, please discontinue use of the
              service.
            </p>

            {/* Sections */}
            <div className="space-y-10">
              {policySections.map((section, i) => (
                <div key={section.id} id={section.id} className="scroll-mt-20">
                  <h2 className="text-lg font-light tracking-tight text-foreground mb-3">
                    <span className="text-xs text-muted-foreground/50 mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </h2>

                  {section.paragraphs?.map((p, j) => (
                    <p
                      key={j}
                      className="text-[15px] text-muted-foreground leading-relaxed mb-4"
                    >
                      {p}
                    </p>
                  ))}

                  {section.items && (
                    <div className="space-y-3 my-5 pl-4">
                      {section.items.map((item, k) => (
                        <div
                          key={k}
                          className="flex gap-3 text-[15px] text-muted-foreground leading-relaxed"
                        >
                          <span className="text-muted-foreground/40 mt-1.5 shrink-0">
                            &bull;
                          </span>
                          <span>
                            {typeof item === "string" ? (
                              item
                            ) : (
                              <>
                                <strong className="text-foreground font-medium">
                                  {item.bold}
                                </strong>{" "}
                                {item.text}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.afterItems?.map((p, j) => (
                    <p
                      key={j}
                      className="text-[15px] text-muted-foreground leading-relaxed mb-4"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Agreement Note */}
            <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                By using OneGPT, you agree to these Terms and our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-foreground hover:underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <Link
                href="/privacy-policy"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors group shrink-0"
              >
                Read Privacy Policy
                <Icon
                  icon="solar:arrow-right-up-linear"
                  className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </div>
          </main>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-4 font-medium">
                On this page
              </p>
              <nav className="space-y-1">
                {policySections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 group"
                  >
                    <span className="text-[9px] text-muted-foreground/40 group-hover:text-primary/60 transition-colors w-4 text-right tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground mb-2">
                  Related
                </p>
                <Link
                  href="/privacy-policy"
                  className="flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/70 transition-colors"
                >
                  Privacy Policy
                  <Icon
                    icon="solar:arrow-right-up-linear"
                    className="w-2.5 h-2.5"
                  />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} OneGPT
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/terms"
                className="text-xs text-foreground font-medium"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
