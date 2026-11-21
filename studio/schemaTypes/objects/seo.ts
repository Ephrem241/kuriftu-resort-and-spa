import {SearchIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Defaults to the document title.',
      validation: (rule) => rule.max(60).warning('Keep it under 60 characters'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep it under 160 characters'),
    }),
    defineField({name: 'ogImage', title: 'Open Graph image', type: 'accessibleImage', description: '1200 × 630 works best.'}),
    defineField({name: 'noIndex', title: 'Hide from search engines', type: 'boolean', initialValue: false}),
  ],
})
