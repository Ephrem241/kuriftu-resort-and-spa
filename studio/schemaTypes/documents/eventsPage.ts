import {CalendarIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {iconField} from '../objects/feature'

/**
 * Event types on /event, in tile order.
 * Keep in sync with EVENT_TYPES in the web app's lib/enquiry/schema.ts.
 */
export const EVENT_TYPE_OPTIONS = [
  {title: 'Weddings', value: 'wedding'},
  {title: 'Corporate events (meeting)', value: 'corporate'},
  {title: 'Social events', value: 'social'},
  {title: 'Private parties', value: 'private-party'},
  {title: 'Conferences (meeting)', value: 'conference'},
] as const

const PACKAGE_KINDS = [
  {title: 'Wedding', value: 'wedding'},
  {title: 'Meeting', value: 'meeting'},
  {title: 'Celebration', value: 'celebration'},
] as const

/** Copy and photography for /event and /event/venues. Venues and packages are their own documents. */
export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events page',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'eventTypes', title: 'Event types'},
    {name: 'venues', title: 'Venues'},
    {name: 'packages', title: 'Packages'},
    {name: 'enquiry', title: 'Enquiry'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Celebrations & Events'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'eventTypes',
      title: 'Event types',
      type: 'object',
      group: 'eventTypes',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subtitle', type: 'string'}),
        defineField({
          name: 'tiles',
          type: 'array',
          description: 'Each tile opens the enquiry form with its event type selected.',
          of: [
            defineArrayMember({
              name: 'eventTypeTile',
              type: 'object',
              fields: [
                defineField({
                  name: 'eventType',
                  type: 'string',
                  options: {list: [...EVENT_TYPE_OPTIONS]},
                  validation: (rule) => rule.required(),
                }),
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                iconField,
                defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
              ],
              preview: {select: {title: 'title', subtitle: 'eventType', media: 'image'}},
            }),
          ],
          validation: (rule) => rule.max(5),
        }),
      ],
    }),
    defineField({
      name: 'venues',
      type: 'object',
      group: 'venues',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subtitle', type: 'string'}),
        defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.max(300)}),
        defineField({
          name: 'featured',
          type: 'reference',
          to: [{type: 'eventVenue'}],
          description: 'Shown large with its capacity and setups (when entered on the venue).',
        }),
        defineField({
          name: 'highlights',
          type: 'array',
          description: 'Venue names listed with gold checks.',
          of: [defineArrayMember({type: 'reference', to: [{type: 'eventVenue'}]})],
          validation: (rule) => rule.max(6).unique(),
        }),
      ],
    }),
    defineField({
      name: 'packages',
      type: 'object',
      group: 'packages',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subtitle', type: 'string'}),
        defineField({
          name: 'cards',
          type: 'array',
          description: '"Starting from" shows only when the linked package has a "from" price.',
          of: [
            defineArrayMember({
              name: 'packageCard',
              type: 'object',
              fields: [
                defineField({
                  name: 'kind',
                  type: 'string',
                  options: {list: [...PACKAGE_KINDS], layout: 'radio', direction: 'horizontal'},
                  validation: (rule) => rule.required(),
                }),
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'text', type: 'string', validation: (rule) => rule.max(100)}),
                defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
                defineField({
                  name: 'package',
                  type: 'reference',
                  to: [{type: 'eventPackage'}],
                  description: '"View Details" opens this package.',
                  options: {
                    filter: ({parent}) => {
                      const kind = (parent as {kind?: string} | undefined)?.kind
                      return kind ? {filter: 'kind == $kind', params: {kind}} : {}
                    },
                  },
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {select: {title: 'title', subtitle: 'package.title', media: 'image'}},
            }),
          ],
          validation: (rule) => rule.max(3),
        }),
      ],
    }),
    defineField({
      name: 'enquiry',
      type: 'object',
      group: 'enquiry',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', description: 'Optional photo behind the copy.'}),
      ],
    }),
    defineField({
      name: 'venuesIndex',
      title: 'Venues page',
      type: 'object',
      group: 'venues',
      description: 'Heading for /event/venues.',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Celebrations & Events'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO (events page)', type: 'seo', group: 'seo'}),
    defineField({name: 'venuesSeo', title: 'SEO (venues page)', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Events page'})},
})
