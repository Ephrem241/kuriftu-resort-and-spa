import {DocumentIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {pageSlugRule} from '../../lib/validation'
import {pageSectionTypes} from '../blocks'

/** Flexible marketing pages: About, Sustainability, Roadshow, Training, Coming Soon, Privacy. */
export const page = defineType({
  name: 'page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', group: 'content', options: {source: 'title'}, validation: pageSlugRule}),
    defineField({
      name: 'hero',
      type: 'object',
      group: 'content',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'title', type: 'string', description: 'Defaults to the page title.'}),
        defineField({name: 'intro', type: 'text', rows: 3}),
        defineField({name: 'image', type: 'accessibleImage'}),
      ],
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: pageSectionTypes.map((type) => defineArrayMember({type})),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current', media: 'hero.image'}},
})
