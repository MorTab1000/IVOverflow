import { useMemo, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import styles from "./RichBody.module.css";

export interface RichBodyProps {
  text: string;
  className?: string;
}

type BodySegment =
  { kind: "text"; value: string } | { kind: "code"; language: string; value: string };

const FENCE_PATTERN = /```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)```/g;

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  html: "markup",
  xml: "markup",
};

function normalizeLanguage(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (!key) {
    return "plaintext";
  }
  return LANGUAGE_ALIASES[key] ?? key;
}

function parseBodySegments(text: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(FENCE_PATTERN)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, matchIndex) });
    }

    segments.push({
      kind: "code",
      language: normalizeLanguage(match[1] ?? ""),
      value: match[2] ?? "",
    });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ kind: "text", value: text });
  }

  return segments;
}

function highlightCode(code: string, language: string): string {
  const grammar = Prism.languages[language];
  if (!grammar) {
    return code.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  return Prism.highlight(code, grammar, language);
}

export default function RichBody({ text, className }: RichBodyProps) {
  const segments = useMemo(() => parseBodySegments(text), [text]);

  const nodes: ReactNode[] = segments.map((segment, index) => {
    if (segment.kind === "text") {
      if (!segment.value) {
        return null;
      }
      return (
        <span key={`text-${index}`} className={styles.text}>
          {segment.value}
        </span>
      );
    }

    const highlighted = highlightCode(segment.value, segment.language);

    return (
      <pre key={`code-${index}`} className={styles.codeBlock}>
        <code
          className={`language-${segment.language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    );
  });

  return <div className={[styles.root, className].filter(Boolean).join(" ")}>{nodes}</div>;
}
