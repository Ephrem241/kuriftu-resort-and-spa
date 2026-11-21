import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Display-only "from" price. Final rates are always in the booking engine. */
export const price = defineType({
  name: 'price',
  title: '"From" price',
  type: 'object',
  icon: TagIcon,
  description: 'Optional. Shown as "from" with a note that final rates are in booking.',
  options: {columns: 2},
  fields: [
    defineField({name: 'amount', type: 'number', validation: (rule) => rule.required().positive()}),
    defineField({
      name: 'currency',
      type: 'string',
      initialValue: 'ETB',
      options: {list: ['ETB', 'USD'], layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'unit', type: 'string', description: 'For example "per night" or "per person".'}),
  ],
})
