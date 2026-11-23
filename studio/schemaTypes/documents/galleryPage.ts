import {ImagesIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Copy for /gallery. The photos are each resort's own Gallery field. */
export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Gallery page',
  type: 'document',
  icon: ImagesIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      description: 'Photos are taken from each resort’s Gallery, in that order.',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Gallery'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Gallery page'})},
})
