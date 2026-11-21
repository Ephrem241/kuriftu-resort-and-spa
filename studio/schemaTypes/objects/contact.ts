import {EnvelopeIcon, PinIcon, UsersIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {E164} from '../../lib/validation'

export const contactDetails = defineType({
  name: 'contactDetails',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'phones',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'phone',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', description: 'For example "Reservations" or "Front desk".'}),
            defineField({
              name: 'display',
              type: 'string',
              description: 'As shown, for example +251 999 222 211.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'tel',
              title: 'Dialable number',
              type: 'string',
              description: 'International format without spaces, for example +251999222211.',
              validation: (rule) => rule.required().regex(E164, {name: 'E.164 phone number'}),
            }),
          ],
          preview: {select: {title: 'display', subtitle: 'label'}},
        }),
      ],
    }),
    defineField({
      name: 'emails',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'emailAddress',
          type: 'object',
          icon: EnvelopeIcon,
          fields: [
            defineField({name: 'label', type: 'string'}),
            defineField({name: 'address', type: 'string', validation: (rule) => rule.required().email()}),
          ],
          preview: {select: {title: 'address', subtitle: 'label'}},
        }),
      ],
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number',
      type: 'string',
      description: 'International format without spaces.',
      validation: (rule) => rule.regex(E164, {name: 'E.164 phone number'}),
    }),
  ],
})

export const address = defineType({
  name: 'address',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({name: 'streetAddress', type: 'string'}),
    defineField({name: 'locality', title: 'Town or city', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'region', type: 'string'}),
    defineField({name: 'postalCode', type: 'string'}),
    defineField({name: 'country', type: 'string', initialValue: 'Ethiopia', validation: (rule) => rule.required()}),
  ],
})
