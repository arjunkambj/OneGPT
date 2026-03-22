import {
  BASE_PROMPT_SECTIONS,
  MODE_PROMPT_SECTIONS,
  type SystemPromptContext,
} from "@/lib/ai/prompt-config";

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
}

function buildSearchEvidenceBlock(
  searchResults: NonNullable<SystemPromptContext["searchResults"]>,
) {
  if (searchResults.length === 0) return null;

  const formattedResults = searchResults
    .map((result, index) => {
      const snippets = (result.highlights ?? [])
        .map((highlight) => `- ${highlight}`)
        .join("\n");
      const excerpt = result.text?.trim();
      const metadata = [
        result.author ? `Author: ${result.author}` : null,
        result.publishedDate ? `Published: ${result.publishedDate}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return [
        `Source ${index + 1}: ${result.title ?? result.url}`,
        `URL: ${result.url}`,
        metadata,
        snippets || (excerpt ? `Excerpt: ${excerpt.slice(0, 900)}` : ""),
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return ["Search evidence:", formattedResults].join("\n");
}

function buildCustomInstructionsBlock(context: SystemPromptContext) {
  const customInstructions = context.customInstructions;
  const content = customInstructions?.content.trim();

  if (!customInstructions?.isEnabled || !content) {
    return null;
  }

  return [
    "User custom instructions:",
    "Follow these preferences unless they conflict with higher-priority safety or grounding requirements.",
    content,
  ].join("\n");
}

export function buildSystemPrompt(context: SystemPromptContext) {
  const sections = [
    `Today is ${formatToday()} (UTC).`,
    ...BASE_PROMPT_SECTIONS,
    ...MODE_PROMPT_SECTIONS[context.mode],
    context.mode === "search"
      ? buildSearchEvidenceBlock(context.searchResults ?? [])
      : null,
    buildCustomInstructionsBlock(context),
  ].filter((section): section is string => Boolean(section?.trim()));

  return sections.join("\n\n");
}
