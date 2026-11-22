import {RocketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Copy and photography for /experience. The experiences themselves are `experience` documents. */
export const experiencesPage = defineType({
  name: 'experiencesPage',
  title: 'Experiences page',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Experiences'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Experiences page'})},
})
