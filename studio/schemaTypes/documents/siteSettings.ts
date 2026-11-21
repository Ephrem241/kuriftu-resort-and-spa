import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {videoUrlRule} from '../../lib/validation'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'brand', title: 'Brand', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'navigation', title: 'Navigation & footer'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'brandName', type: 'string', group: 'brand', validation: (rule) => rule.required()}),
    defineField({
      name: 'logos',
      type: 'object',
      group: 'brand',
      description: 'Use the supplied brand SVG/PNG files.',
      fields: [
        defineField({name: 'primary', title: 'Primary (on light)', type: 'accessibleImage'}),
        defineField({name: 'light', title: 'Light (on dark)', type: 'accessibleImage'}),
        defineField({name: 'mark', title: 'Leaf mark', type: 'accessibleImage'}),
      ],
    }),
    defineField({name: 'footerTagline', type: 'string', group: 'brand'}),
    defineField({
      name: 'storyVideoUrl',
      title: '"Our Story" video',
      type: 'url',
      group: 'brand',
      description: 'YouTube or Vimeo link.',
      validation: videoUrlRule,
    }),
    defineField({
      name: 'reservations',
      title: 'Reservation contact',
      type: 'contactDetails',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'headOffice', title: 'Head office contact', type: 'contactDetails', group: 'contact'}),
    defineField({name: 'headOfficeAddress', type: 'address', group: 'contact'}),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'X', value: 'x'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'TikTok', value: 'tiktok'},
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required().uri({scheme: ['https']})}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'navResorts',
      title: 'Destinations menu',
      type: 'array',
      group: 'navigation',
      description: 'Resorts in the header Destinations menu and footer, in this order.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'resort'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'experienceLinks',
      title: 'Experiences menu',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({
      name: 'footerColumns',
      type: 'array',
      group: 'navigation',
      of: [
        defineArrayMember({
          name: 'footerColumn',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'links', type: 'array', of: [defineArrayMember({type: 'link'})]}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
    defineField({name: 'legalLinks', type: 'array', group: 'navigation', of: [defineArrayMember({type: 'link'})]}),
    defineField({name: 'seo', title: 'Default SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
