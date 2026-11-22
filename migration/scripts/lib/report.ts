/** Collects quality issues during a transform run and renders them as Markdown. */

interface Entry {
  kind: string
  subject: string
  detail: string
}

export class Report {
  private skipped: Entry[] = []
  private flags: Entry[] = []
  private alts = new Map<string, { context: string; where: string }>()
  private seenSkips = new Set<string>()

  skip(kind: string, subject: string, detail: string) {
    const id = `${kind}|${subject}`
    if (this.seenSkips.has(id)) return
    this.seenSkips.add(id)
    this.skipped.push({ kind, subject, detail })
  }

  flag(kind: string, subject: string, detail: string) {
    this.flags.push({ kind, subject, detail })
  }

  contextualAlt(url: string, context: string, where: string) {
    if (!this.alts.has(url)) this.alts.set(url, { context, where })
  }

  get contextualAltCount() {
    return this.alts.size
  }

  render(meta: { source: string; counts: Record<string, number>; redirects: { source: string; destination: string }[] }): string {
    const lines: string[] = []
    lines.push("# Content migration quality report", "")
    lines.push(`Source: ${meta.source}`, "")
    lines.push("## Documents", "", "| Type | Count |", "| --- | ---: |")
    for (const [type, count] of Object.entries(meta.counts).sort()) lines.push(`| ${type} | ${count} |`)

    const byKind = (entries: Entry[]) => {
      const groups = new Map<string, Entry[]>()
      for (const entry of entries) groups.set(entry.kind, [...(groups.get(entry.kind) ?? []), entry])
      return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
    }

    lines.push("", "## Needs review", "")
    if (this.flags.length === 0) lines.push("Nothing flagged.")
    for (const [kind, entries] of byKind(this.flags)) {
      lines.push(`### ${kind} (${entries.length})`, "")
      for (const e of entries) lines.push(`- **${e.subject}**: ${e.detail}`)
      lines.push("")
    }

    lines.push("## Skipped source content", "")
    if (this.skipped.length === 0) lines.push("Nothing skipped.")
    for (const [kind, entries] of byKind(this.skipped)) {
      lines.push(`### ${kind} (${entries.length})`, "")
      for (const e of entries) lines.push(`- ${e.subject}: ${e.detail}`)
      lines.push("")
    }

    lines.push(`## Contextual alt text to improve (${this.alts.size})`, "")
    lines.push("These photos had no descriptive alt text on the old site. Editors should replace the alt below with what the photo shows.", "")
    for (const [url, { context, where }] of [...this.alts.entries()].sort((a, b) => a[1].where.localeCompare(b[1].where))) {
      lines.push(`- ${where}: "${context}" (${url})`)
    }

    lines.push("", "## Legacy URL redirects", "", "| From | To |", "| --- | --- |")
    for (const r of meta.redirects) lines.push(`| \`${r.source}\` | \`${r.destination}\` |`)
    lines.push("")
    return lines.join("\n")
  }
}
