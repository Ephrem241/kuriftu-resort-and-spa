import {EarthGlobeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Copy and photography for /destinations. The resorts themselves are `resort` documents. */
export const destinationsPage = defineType({
  name: 'destinationsPage',
  title: 'Destinations page',
  type: 'document',
  icon: EarthGlobeIcon,
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
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Our Destinations'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Destinations page'})},
})
