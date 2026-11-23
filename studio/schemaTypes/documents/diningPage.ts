import {LemonIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Copy and photography for /dining. Restaurants are `diningVenue` documents. */
export const diningPage = defineType({
  name: 'diningPage',
  title: 'Dining page',
  type: 'document',
  icon: LemonIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'experience', title: 'Dining experience'},
    {name: 'restaurants', title: 'Restaurants'},
    {name: 'highlights', title: 'Menu highlights'},
    {name: 'events', title: 'Dining events'},
    {name: 'reserve', title: 'Reserve a table'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Dining'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'Dining experience',
      type: 'object',
      group: 'experience',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 4, validation: (rule) => rule.max(400)}),
        defineField({
          name: 'features',
          type: 'array',
          description: 'Up to 4 icons with a short title. The text field is not shown on this page.',
          of: [defineArrayMember({type: 'feature'})],
          validation: (rule) => rule.max(4),
        }),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'restaurants',
      type: 'object',
      group: 'restaurants',
      description: 'Every dining venue with a photo is listed, filterable by resort.',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subtitle', type: 'string'}),
      ],
    }),
    defineField({
      name: 'highlights',
      title: 'Menu highlights',
      type: 'object',
      group: 'highlights',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.max(300)}),
        defineField({
          name: 'images',
          type: 'array',
          description: 'Up to 4 dish photos. The section is hidden when empty.',
          of: [defineArrayMember({type: 'accessibleImage'})],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),
    defineField({
      name: 'events',
      title: 'Dining events',
      type: 'object',
      group: 'events',
      description: 'Links to /event.',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.max(300)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'reserve',
      title: 'Reserve a table',
      type: 'object',
      group: 'reserve',
      description:
        "The button calls the reservation number of the resort the page is filtered to, or the site-wide reservation contact.",
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Reserve a Table'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Dining page'})},
})
