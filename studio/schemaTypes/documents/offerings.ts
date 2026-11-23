import {CalendarIcon, ComposeIcon, LemonIcon, RocketIcon, SparklesIcon, UsersIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {slugRule} from '../../lib/validation'

/** Offer filters on /offers, in tile order. Keep in sync with lib/content/offers.ts. */
export const OFFER_CATEGORIES = [
  {title: 'Special Deals', value: 'deals'},
  {title: 'Stay Packages', value: 'stay'},
  {title: 'Wellness Retreats', value: 'wellness'},
  {title: 'Dining Offers', value: 'dining'},
  {title: 'Family Packages', value: 'family'},
] as const

const offeredAt = defineField({
  name: 'resorts',
  title: 'Offered at',
  type: 'array',
  of: [defineArrayMember({type: 'reference', to: [{type: 'resort'}]})],
  validation: (rule) => rule.required().min(1).unique(),
})

const images = defineField({
  name: 'images',
  type: 'array',
  of: [defineArrayMember({type: 'accessibleImage'})],
  options: {layout: 'grid'},
})

export const experience = defineType({
  name: 'experience',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Adventure', value: 'adventure'},
          {title: 'Culture', value: 'culture'},
          {title: 'Nature', value: 'nature'},
          {title: 'Dining', value: 'dining'},
          {title: 'Family', value: 'family'},
          {title: 'Water', value: 'water'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    {...images, validation: (rule) => rule.required().min(1)},
    defineField({name: 'summary', type: 'text', rows: 2, validation: (rule) => rule.required().max(200)}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'duration', type: 'string', description: 'For example "2 hours" or "Half day".'}),
    offeredAt,
    defineField({
      name: 'action',
      type: 'string',
      initialValue: 'enquire',
      description: '"Book" hands off to the booking engine, so only use it for experiences at bookable resorts.',
      options: {
        list: [
          {title: 'Enquire', value: 'enquire'},
          {title: 'Book', value: 'book'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'category', media: 'images.0'}},
})

export const spaTreatment = defineType({
  name: 'spaTreatment',
  title: 'Spa treatment',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Massage', value: 'massage'},
          {title: 'Facial', value: 'facial'},
          {title: 'Body treatment', value: 'body'},
          {title: 'Hammam & steam', value: 'hammam'},
          {title: 'Hands & feet', value: 'handsFeet'},
          {title: 'Hair', value: 'hair'},
          {title: 'Package', value: 'package'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'duration', type: 'string', description: 'For example "60 minutes".'}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'image', type: 'accessibleImage'}),
    defineField({name: 'price', type: 'price'}),
    {...offeredAt, description: 'Resorts or the day spa offering this treatment.'},
  ],
  preview: {select: {title: 'title', subtitle: 'duration', media: 'image'}},
})

export const diningVenue = defineType({
  name: 'diningVenue',
  title: 'Dining venue',
  type: 'document',
  icon: LemonIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'resort', type: 'reference', to: [{type: 'resort'}], validation: (rule) => rule.required()}),
    defineField({name: 'cuisine', type: 'string'}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'hours', title: 'Opening hours', type: 'string', description: 'For example "Daily 06:30–22:30".'}),
    images,
    defineField({
      name: 'menu',
      title: 'Menu (PDF)',
      type: 'file',
      description: 'Shown as "View Menu" on /dining. PDF only.',
      options: {accept: 'application/pdf'},
      fields: [defineField({name: 'label', type: 'string', description: 'For example "À la carte menu".'})],
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'resort.name', media: 'images.0'}},
})

export const eventVenue = defineType({
  name: 'eventVenue',
  title: 'Event venue',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'resort', type: 'reference', to: [{type: 'resort'}], validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'capacity', title: 'Maximum capacity', type: 'number', validation: (rule) => rule.integer().min(1)}),
    defineField({
      name: 'setups',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'setup',
          type: 'object',
          fields: [
            defineField({
              name: 'style',
              type: 'string',
              options: {list: ['Theatre', 'Banquet', 'Classroom', 'Cocktail', 'U-shape', 'Boardroom', 'Outdoor']},
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'capacity', type: 'number', validation: (rule) => rule.integer().min(1)}),
          ],
          preview: {select: {title: 'style', subtitle: 'capacity'}},
        }),
      ],
    }),
    images,
    defineField({name: 'enquiryContact', type: 'contactDetails'}),
  ],
  preview: {select: {title: 'name', subtitle: 'resort.name', media: 'images.0'}},
})

export const eventPackage = defineType({
  name: 'eventPackage',
  title: 'Event package',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          {title: 'Wedding', value: 'wedding'},
          {title: 'Meeting', value: 'meeting'},
          {title: 'Celebration', value: 'celebration'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'summary', type: 'text', rows: 2, validation: (rule) => rule.max(200)}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'inclusions', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    offeredAt,
    defineField({name: 'venues', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'eventVenue'}]})]}),
    defineField({name: 'fromPrice', type: 'price'}),
    images,
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'kind', media: 'images.0'}},
})

export const offer = defineType({
  name: 'offer',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({
      name: 'shortLine',
      type: 'string',
      description: 'For example "Up to 25% off your November stay".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'category',
      type: 'string',
      description: 'Groups the offer under one of the filters on the offers page.',
      initialValue: 'deals',
      options: {
        list: [...OFFER_CATEGORIES],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badge',
      type: 'string',
      description: 'Short label on the card image, for example "20% OFF". Leave empty for no badge. Never state a discount the offer does not give.',
      validation: (rule) => rule.max(16),
    }),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
    defineField({
      name: 'resorts',
      title: 'Applies to',
      type: 'array',
      description: 'Leave empty if the offer applies to every resort.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'resort'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'startDate', type: 'datetime', validation: (rule) => rule.required()}),
    defineField({
      name: 'endDate',
      type: 'datetime',
      description: 'The offer hides itself automatically after this date.',
      validation: (rule) =>
        rule.required().custom((end, context) => {
          const start = (context.document as {startDate?: string} | undefined)?.startDate
          return !start || !end || new Date(end) > new Date(start) || 'End date must be after the start date'
        }),
    }),
    defineField({name: 'terms', type: 'richText'}),
    defineField({name: 'promoCode', type: 'string'}),
    defineField({
      name: 'showAsPopup',
      title: 'Show as popup',
      type: 'boolean',
      initialValue: false,
      description: 'Shows once per session, dismissible.',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  orderings: [{title: 'Ends soonest', name: 'endDateAsc', by: [{field: 'endDate', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', end: 'endDate', category: 'category', media: 'image'},
    prepare({title, end, category, media}) {
      const expired = end && new Date(end) < new Date()
      const label = OFFER_CATEGORIES.find((c) => c.value === category)?.title
      const when = end ? `${expired ? 'Expired' : 'Ends'} ${new Date(end).toLocaleDateString()}` : undefined
      return {title, subtitle: [label, when].filter(Boolean).join(' · ') || undefined, media}
    },
  },
})
