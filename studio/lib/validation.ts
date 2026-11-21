import type {SlugRule, SlugValue, UrlRule, ValidationContext} from 'sanity'

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VIDEO_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com', 'player.vimeo.com']

/** Required, kebab-case slug, unique within its document type. */
export function slugRule(rule: SlugRule) {
  return rule.required().custom(async (slug: SlugValue | undefined, context: ValidationContext) => {
    const current = slug?.current
    if (!current) return 'Required'
    if (!KEBAB_CASE.test(current)) return 'Use lowercase letters, numbers and hyphens only (for example "arba-minch")'

    const type = context.document?._type
    const id = context.document?._id?.replace(/^drafts\./, '')
    if (!type || !id) return true

    const client = context.getClient({apiVersion: '2026-11-21'})
    const count = await client.fetch<number>(
      'count(*[_type == $type && slug.current == $slug && !(_id in [$id, "drafts." + $id])])',
      {type, slug: current, id},
    )
    return count === 0 || 'Another document of this type already uses this slug'
  })
}

/** YouTube or Vimeo URL only (no self-hosted video). */
export function videoUrlRule(rule: UrlRule) {
  return rule.uri({scheme: ['https']}).custom((value: string | undefined) => {
    if (!value) return true
    try {
      return VIDEO_HOSTS.includes(new URL(value).hostname) || 'Use a YouTube or Vimeo link'
    } catch {
      return 'Enter a valid URL'
    }
  })
}

/** Phone number in E.164 form, used for tel: links. */
export const E164 = /^\+[1-9]\d{6,14}$/
