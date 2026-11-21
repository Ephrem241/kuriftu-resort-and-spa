import {LinkIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {LINKABLE_TYPES} from './link'

/** Portable Text used for every rich description on the site. */
export const richText = defineType({
  name: 'richText',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'internalLink',
            type: 'object',
            icon: LinkIcon,
            fields: [defineField({name: 'reference', type: 'reference', to: LINKABLE_TYPES, validation: (rule) => rule.required()})],
          }),
          defineArrayMember({
            name: 'externalLink',
            type: 'object',
            icon: LinkIcon,
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) => rule.required().uri({scheme: ['https', 'http', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
