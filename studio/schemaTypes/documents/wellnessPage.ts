import {SparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Treatment groups on /wellness and /wellness/treatments, in card order.
 * Keep in sync with TREATMENT_GROUPS in the web app's lib/content/wellness.ts.
 */
export const TREATMENT_GROUPS = [
  {title: 'Massage Therapy (massage)', value: 'massage'},
  {title: 'Facial Treatments (facial)', value: 'facial'},
  {title: 'Body Treatments (body, hammam & steam)', value: 'body'},
  {title: 'Wellness Packages (package)', value: 'packages'},
  {title: 'Beauty Services (hands & feet, hair)', value: 'beauty'},
] as const

const iconFeatures = defineField({
  name: 'features',
  type: 'array',
  description: 'Up to 4 icons with a short title. The text field is not shown on this page.',
  of: [defineArrayMember({type: 'feature'})],
  validation: (rule) => rule.max(4),
})

/** Copy and photography for /wellness and /wellness/treatments. Treatments are `spaTreatment` documents. */
export const wellnessPage = defineType({
  name: 'wellnessPage',
  title: 'Wellness page',
  type: 'document',
  icon: SparklesIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'daySpa', title: 'Day spa'},
    {name: 'treatments', title: 'Treatments'},
    {name: 'booking', title: 'Booking request'},
    {name: 'whyChoose', title: 'Why choose'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Wellness & Spa'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'daySpa',
      title: 'Day spa',
      type: 'object',
      group: 'daySpa',
      fields: [
        defineField({
          name: 'resort',
          type: 'reference',
          to: [{type: 'resort'}],
          description: 'The day spa this section introduces.',
        }),
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 4, validation: (rule) => rule.max(400)}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
        iconFeatures,
      ],
    }),
    defineField({
      name: 'treatments',
      type: 'object',
      group: 'treatments',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subtitle', type: 'string'}),
        defineField({
          name: 'cards',
          type: 'array',
          description: 'One card per treatment group. A card is hidden when no treatment is in its group.',
          of: [
            defineArrayMember({
              name: 'treatmentGroupCard',
              type: 'object',
              fields: [
                defineField({
                  name: 'group',
                  type: 'string',
                  options: {list: [...TREATMENT_GROUPS]},
                  validation: (rule) => rule.required(),
                }),
                defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
                defineField({name: 'subtitle', type: 'string', validation: (rule) => rule.max(60)}),
                defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
              ],
              preview: {select: {title: 'title', subtitle: 'group', media: 'image'}},
            }),
          ],
          validation: (rule) => rule.max(5),
        }),
      ],
    }),
    defineField({
      name: 'booking',
      title: 'Booking request',
      type: 'object',
      group: 'booking',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Book a Spa Session'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
        defineField({name: 'tagline', type: 'string', description: 'Shown in italics, e.g. "Your Wellness Our Priority".'}),
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'whyChoose',
      title: 'Why choose',
      type: 'object',
      group: 'whyChoose',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        iconFeatures,
        defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
      ],
    }),
    defineField({
      name: 'treatmentsIndex',
      title: 'Treatments page',
      type: 'object',
      group: 'treatments',
      description: 'Heading for /wellness/treatments.',
      fields: [
        defineField({name: 'eyebrow', type: 'string', initialValue: 'Spa Treatments'}),
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'intro', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO (wellness page)', type: 'seo', group: 'seo'}),
    defineField({name: 'treatmentsSeo', title: 'SEO (treatments page)', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Wellness page'})},
})
