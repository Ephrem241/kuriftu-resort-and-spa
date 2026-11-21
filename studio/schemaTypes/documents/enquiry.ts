import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * App state, written only by the web server route. Read-only in Studio
 * (except status) and never included in page queries.
 */
export const enquiry = defineType({
  name: 'enquiry',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Handled', value: 'handled'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'type',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {title: 'Event or wedding', value: 'event'},
          {title: 'Meeting', value: 'meeting'},
          {title: 'Spa booking request', value: 'spa'},
          {title: 'General contact', value: 'contact'},
        ],
      },
    }),
    defineField({name: 'name', type: 'string', readOnly: true}),
    defineField({name: 'email', type: 'string', readOnly: true}),
    defineField({name: 'phone', type: 'string', readOnly: true}),
    defineField({name: 'resort', type: 'reference', to: [{type: 'resort'}], readOnly: true}),
    defineField({name: 'startDate', title: 'Date from', type: 'date', readOnly: true}),
    defineField({name: 'endDate', title: 'Date to', type: 'date', readOnly: true}),
    defineField({name: 'guests', type: 'number', readOnly: true}),
    defineField({name: 'message', type: 'text', readOnly: true}),
    defineField({name: 'emailSent', title: 'Notification email sent', type: 'boolean', readOnly: true}),
    defineField({name: 'createdAt', type: 'datetime', readOnly: true}),
  ],
  orderings: [{title: 'Newest first', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]}],
  preview: {
    select: {name: 'name', type: 'type', status: 'status', createdAt: 'createdAt'},
    prepare({name, type, status, createdAt}) {
      const date = createdAt ? new Date(createdAt).toLocaleDateString() : ''
      return {title: name || 'Enquiry', subtitle: [status === 'handled' ? 'Handled' : 'New', type, date].filter(Boolean).join(' · ')}
    },
  },
})
