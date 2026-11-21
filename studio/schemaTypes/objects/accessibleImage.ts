import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Every image on the site: hotspot/crop enabled, alt text required. */
export const accessibleImage = defineType({
  name: 'accessibleImage',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe what the photo shows, for screen readers and search engines.',
      validation: (rule) => rule.required().error('Alt text is required'),
    }),
    defineField({name: 'caption', type: 'string'}),
  ],
})
