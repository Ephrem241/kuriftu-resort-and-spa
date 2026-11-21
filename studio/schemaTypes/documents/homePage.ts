import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {ICON_OPTIONS} from '../objects/feature'

const sectionHeading = [
  defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
  defineField({name: 'subtitle', type: 'string'}),
]

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'sections', title: 'Sections'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'heroSlides',
      type: 'array',
      group: 'hero',
      of: [
        defineArrayMember({
          name: 'heroSlide',
          type: 'object',
          fields: [
            defineField({name: 'eyebrow', type: 'string'}),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'text', type: 'text', rows: 2}),
            defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'title', subtitle: 'eyebrow', media: 'image'}},
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'destinations',
      type: 'object',
      group: 'sections',
      fields: [
        ...sectionHeading,
        defineField({
          name: 'resorts',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'resort'}]})],
          validation: (rule) => rule.unique(),
        }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'The Kuriftu experience',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'pillars',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'pillar',
              type: 'object',
              fields: [
                defineField({name: 'icon', type: 'string', options: {list: ICON_OPTIONS}, validation: (rule) => rule.required()}),
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'subtitle', type: 'string'}),
                defineField({name: 'link', type: 'link'}),
              ],
              preview: {select: {title: 'title', subtitle: 'subtitle'}},
            }),
          ],
        }),
        defineField({name: 'image', type: 'accessibleImage'}),
      ],
    }),
    defineField({
      name: 'rooms',
      title: 'Featured accommodation',
      type: 'object',
      group: 'sections',
      fields: [
        ...sectionHeading,
        defineField({
          name: 'items',
          title: 'Rooms',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'room'}]})],
          validation: (rule) => rule.unique(),
        }),
      ],
    }),
    defineField({
      name: 'offersPanel',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 2}),
        defineField({name: 'ctaLabel', title: 'Button label', type: 'string'}),
        defineField({name: 'image', type: 'accessibleImage'}),
      ],
    }),
    defineField({
      name: 'testimonials',
      type: 'object',
      group: 'sections',
      fields: [
        ...sectionHeading,
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'testimonial',
              type: 'object',
              fields: [
                defineField({name: 'quote', type: 'text', rows: 3, validation: (rule) => rule.required()}),
                defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'location', type: 'string'}),
                defineField({name: 'avatar', type: 'accessibleImage'}),
              ],
              preview: {select: {title: 'name', subtitle: 'quote', media: 'avatar'}},
            }),
          ],
        }),
        defineField({name: 'backgroundImage', type: 'accessibleImage'}),
      ],
    }),
    defineField({name: 'stayConnected', type: 'object', group: 'sections', fields: sectionHeading}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Home page'})},
})
