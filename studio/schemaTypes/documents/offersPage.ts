import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Copy and photography for /offers. The offers themselves are `offer` documents. */
export const offersPage = defineType({
  name: 'offersPage',
  title: 'Offers page',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'banner', title: 'Banner'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Special Offers'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'banner',
      title: 'Limited time banner',
      type: 'object',
      group: 'banner',
      description: 'Shown below the offers. Hidden when it has no title or image.',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'title', type: 'string'}),
        defineField({
          name: 'text',
          type: 'text',
          rows: 2,
          description: 'Only mention discounts a live offer actually gives.',
          validation: (rule) => rule.max(160),
        }),
        defineField({name: 'image', type: 'accessibleImage'}),
        defineField({name: 'link', type: 'link'}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Offers page'})},
})
