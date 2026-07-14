import type { ReactNode } from "react"

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

export function LinkedText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(LINK_RE)) {
    const [full, label, url] = match
    const index = match.index!

    if (index > lastIndex) parts.push(text.slice(lastIndex, index))

    parts.push(
      <a
        key={`${url}-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
      >
        {label}
      </a>,
    )
    lastIndex = index + full.length
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  return <>{parts.length > 0 ? parts : text}</>
}
