import {LinkIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const LINKABLE_TYPES = [
  {type: 'resort'},
  {type: 'room'},
  {type: 'experience'},
  {type: 'spaTreatment'},
  {type: 'eventPackage'},
  {type: 'offer'},
  {type: 'page'},
]

/** A labelled link to a document, a site path, or an external URL. */
export const link = defineType({
  name: 'link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'linkType',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'Document', value: 'internal'},
          {title: 'Site path', value: 'path'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reference',
      type: 'reference',
      to: LINKABLE_TYPES,
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as {linkType?: string})?.linkType === 'internal' && !value ? 'Pick a document' : true,
        ),
    }),
    defineField({
      name: 'path',
      type: 'string',
      description: 'A path on this site, for example /experience or /contact.',
      hidden: ({parent}) => parent?.linkType !== 'path',
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as {linkType?: string})?.linkType !== 'path') return true
          if (!value) return 'Enter a path'
          return /^\/[a-z0-9\-/#?=&]*$/.test(value) || 'Start with / and use lowercase letters, numbers and hyphens'
        }),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule.uri({scheme: ['https', 'http', 'mailto', 'tel']}).custom((value, context) =>
          (context.parent as {linkType?: string})?.linkType === 'external' && !value ? 'Enter a URL' : true,
        ),
    }),
  ],
  preview: {
    select: {title: 'label', linkType: 'linkType', path: 'path', url: 'url', ref: 'reference.title', refName: 'reference.name'},
    prepare({title, linkType, path, url, ref, refName}) {
      const target = linkType === 'path' ? path : linkType === 'external' ? url : ref || refName
      return {title: title || 'Untitled link', subtitle: target}
    },
  },
})
