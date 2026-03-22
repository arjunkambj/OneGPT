import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "OneGPT Privacy Policy — how we collect, use, and safeguard your personal data.",
  alternates: {
    canonical: "https://onegpt.sh/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const policySections = [
  {
    id: "info-collect",
    label: "Information Collected",
    title: "Information We Collect",
    paragraphs: [
      "When you use OneGPT, we may collect the following types of information:",
    ],
    items: [
      {
        bold: "Chat Messages:",
        text: "The prompts and conversations you submit to AI models through our platform.",
      },
      {
        bold: "Account Information:",
        text: "Your email address and profile details when you create an account via our authentication provider.",
      },
      {
        bold: "Usage Data:",
        text: "How you interact with the service, including which models you use, feature usage, and session activity.",
      },
      {
        bold: "Device Information:",
        text: "Browser type, operating system, IP address, and general device characteristics.",
      },
      {
        bold: "Subscription Data:",
        text: "Your plan tier and billing history (but never your payment card details).",
      },
    ],
    afterItems: [
      "Important: OneGPT does not collect, store, or process any payment card numbers, bank details, or other sensitive financial data. All payment processing is handled directly by DodoPayments.",
    ],
  },
  {
    id: "how-use",
    label: "How We Use It",
    title: "How We Use Your Information",
    paragraphs: ["Your information helps us:"],
    items: [
      "Operate and deliver the OneGPT service",
      "Route your messages to the appropriate AI model providers",
      "Manage your account and subscription",
      "Improve the platform based on usage patterns",
      "Identify and resolve technical issues",
      "Communicate important service updates",
    ],
  },
  {
    id: "sharing",
    label: "Data Sharing",
    title: "Data Sharing and Disclosure",
    paragraphs: [
      "We share your data only when necessary to provide the service:",
    ],
    items: [
      {
        bold: "AI Model Providers:",
        text: "Your chat messages are sent to the AI provider you select (OpenAI, Anthropic, Google, DeepSeek, Mistral, xAI, and others) for processing. Each provider has its own data handling policies.",
      },
      {
        bold: "Infrastructure:",
        text: "We use Vercel for hosting and Convex for our backend database.",
      },
      {
        bold: "Authentication:",
        text: "Account sign-in is managed through Stack Auth.",
      },
      {
        bold: "Payments:",
        text: "DodoPayments handles all billing and subscription transactions.",
      },
      {
        bold: "Legal Requirements:",
        text: "We may disclose data if required by law, regulation, or valid legal process.",
      },
    ],
  },
  {
    id: "security",
    label: "Data Security",
    title: "Data Security",
    paragraphs: [
      "We use reasonable technical and organizational safeguards to protect your personal information. This includes encrypted connections (HTTPS), secure authentication flows, and access controls on our infrastructure. However, no system is perfectly secure, and we cannot guarantee absolute protection.",
    ],
  },
  {
    id: "rights",
    label: "Your Rights",
    title: "Your Rights",
    paragraphs: [
      "Depending on where you are located, you may have the right to:",
    ],
    items: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate information",
      "Request deletion of your personal data",
      "Object to or restrict certain processing",
      "Receive your data in a portable format",
      "Withdraw consent where applicable",
    ],
    afterItems: [
      "To exercise any of these rights, contact us at hello@onegpt.sh.",
    ],
  },
  {
    id: "children",
    label: "Children's Privacy",
    title: "Children's Privacy",
    paragraphs: [
      "OneGPT is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can take appropriate action.",
    ],
  },
  {
    id: "retention",
    label: "Data Retention",
    title: "Data Retention & Deletion",
    paragraphs: [
      "We keep your personal information only for as long as needed to provide the service and fulfill the purposes described in this policy, unless a longer period is required by law.",
      "You may request deletion of your data at any time by emailing hello@onegpt.sh. We will process deletion requests within 30 days, except where we are legally required to retain certain records.",
    ],
  },
  {
    id: "changes",
    label: "Changes",
    title: "Changes to This Policy",
    paragraphs: [
      'We may revise this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of OneGPT after changes are posted constitutes your acceptance of the revised policy.',
    ],
  },
  {
    id: "contact",
    label: "Contact",
    title: "Contact Us",
    paragraphs: [
      "If you have questions or concerns about this Privacy Policy or your personal data, reach out to us at:",
      "hello@onegpt.sh",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader currentPage="privacy" />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-16">
          <main>
            {/* Title */}
            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 mb-4 block font-medium">
                Legal
              </span>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-4">
                Privacy Policy
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Last updated: March 21, 2026</span>
                <span className="w-px h-3 bg-border/50" />
                <span className="flex items-center gap-1.5">
                  <Icon icon="solar:clock-circle-linear" className="w-3 h-3" />5
                  min read
                </span>
              </div>
            </div>

            {/* TLDR */}
            <div className="mb-12 p-5 rounded-2xl border border-primary/15 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Icon
                  icon="solar:shield-check-linear"
                  className="w-4 h-4 text-primary/60"
                />
                <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-medium">
                  Quick Summary
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                We collect basic usage data and account information to operate
                the service. Payment details are handled entirely by
                DodoPayments &mdash; we never see or store your card
                information. We do not sell your data. You can request deletion
                of your personal data at any time.
              </p>
            </div>

            {/* Intro */}
            <p className="text-base text-foreground/80 leading-relaxed mb-6">
              At OneGPT, your privacy matters to us. This Privacy Policy
              describes how we collect, use, and protect your information when
              you use our multi-model AI chat platform.
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
                By using OneGPT, you agree to this Privacy Policy and our{" "}
                <Link
                  href="/terms"
                  className="text-foreground hover:underline underline-offset-2"
                >
                  Terms of Service
                </Link>
                .
              </p>
              <Link
                href="/terms"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors group shrink-0"
              >
                Read Terms
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
                  href="/terms"
                  className="flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/70 transition-colors"
                >
                  Terms of Service
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="text-xs text-foreground font-medium"
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
