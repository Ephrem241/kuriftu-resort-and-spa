import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Copy and photography for /contact. Phones, emails and addresses are not
 * stored here: they come from Site settings and each resort.
 */
export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'form', title: 'Form & directory'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Contact Us'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'form',
      title: 'Contact form',
      type: 'object',
      group: 'form',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Get in Touch'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.max(300)}),
        defineField({name: 'image', type: 'accessibleImage', description: 'Optional photo at the left of the form panel.'}),
      ],
    }),
    defineField({
      name: 'directoryTitle',
      title: 'Resort directory heading',
      type: 'string',
      group: 'form',
      initialValue: 'Our Resorts',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Contact page'})},
})
