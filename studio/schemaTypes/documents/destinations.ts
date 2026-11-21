import {EarthGlobeIcon, HomeIcon, PinIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {slugRule, videoUrlRule} from '../../lib/validation'

export const RESORT_TYPES = [
  {title: 'Resort & spa', value: 'resortAndSpa'},
  {title: 'Adventure park', value: 'adventurePark'},
  {title: 'Water park', value: 'waterPark'},
  {title: 'Day spa', value: 'daySpa'},
]

export const destinationRegion = defineType({
  name: 'destinationRegion',
  title: 'Destination region',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'heroImage', type: 'accessibleImage'}),
  ],
  preview: {select: {title: 'title', media: 'heroImage'}},
})

export const resort = defineType({
  name: 'resort',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'details', title: 'Details'},
    {name: 'media', title: 'Media'},
    {name: 'booking', title: 'Booking & contact'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'name', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', group: 'overview', options: {source: 'name'}, validation: slugRule}),
    defineField({
      name: 'type',
      type: 'string',
      group: 'overview',
      initialValue: 'resortAndSpa',
      options: {list: RESORT_TYPES, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'region', type: 'reference', group: 'overview', to: [{type: 'destinationRegion'}]}),
    defineField({
      name: 'locationLabel',
      type: 'string',
      group: 'overview',
      description: 'For example "Bishoftu" or "Awash National Park".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      group: 'overview',
      description: 'Short line for tiles, for example "Lakeside Retreat".',
      validation: (rule) => rule.max(60),
    }),
    defineField({name: 'intro', type: 'richText', group: 'overview'}),
    defineField({
      name: 'highlights',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({type: 'feature'})],
    }),
    defineField({name: 'amenities', type: 'array', group: 'details', of: [defineArrayMember({type: 'amenity'})]}),
    defineField({name: 'address', type: 'address', group: 'details'}),
    defineField({name: 'geo', title: 'Map location', type: 'geopoint', group: 'details'}),
    defineField({name: 'heroImage', type: 'accessibleImage', group: 'media', validation: (rule) => rule.required()}),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero video',
      type: 'url',
      group: 'media',
      description: 'Optional YouTube or Vimeo link. The hero image stays as the poster and fallback.',
      validation: videoUrlRule,
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'accessibleImage'})],
      options: {layout: 'grid'},
    }),
    defineField({
      name: 'bookable',
      title: 'Takes overnight bookings',
      type: 'boolean',
      group: 'booking',
      initialValue: true,
      description: 'Off for the water park and day spa: their pages show an enquiry action instead of the search bar.',
    }),
    defineField({
      name: 'bookingPropertyId',
      title: 'Booking engine property id',
      type: 'string',
      group: 'booking',
      hidden: ({document}) => document?.bookable === false,
    }),
    defineField({name: 'reservationContact', type: 'contactDetails', group: 'booking'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'locationLabel', media: 'heroImage'},
  },
})

export const room = defineType({
  name: 'room',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: slugRule}),
    defineField({name: 'resort', type: 'reference', to: [{type: 'resort'}], validation: (rule) => rule.required()}),
    defineField({
      name: 'images',
      type: 'array',
      of: [defineArrayMember({type: 'accessibleImage'})],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 2, validation: (rule) => rule.required().max(200)}),
    defineField({name: 'description', type: 'richText'}),
    defineField({name: 'maxGuests', type: 'number', validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: 'bedConfiguration', type: 'string', description: 'For example "1 king bed" or "2 twin beds".'}),
    defineField({name: 'sizeSqm', title: 'Size (m²)', type: 'number', validation: (rule) => rule.positive()}),
    defineField({name: 'amenities', type: 'array', of: [defineArrayMember({type: 'amenity'})]}),
    defineField({name: 'fromPrice', type: 'price'}),
    defineField({name: 'bookingRoomCode', title: 'Booking engine room code', type: 'string'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'resort.name', media: 'images.0'},
  },
})
