import {StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Icons editors can pick. Each value maps to one Lucide outline icon in the
 * web app (see the icon map there), so keep the two lists in sync.
 */
export const ICON_OPTIONS = [
  {title: 'Bed / stay', value: 'bed'},
  {title: 'Spa / flower', value: 'spa'},
  {title: 'Dining', value: 'utensils'},
  {title: 'Activity / adventure', value: 'activity'},
  {title: 'Location', value: 'map-pin'},
  {title: 'Calendar', value: 'calendar'},
  {title: 'Guests', value: 'user'},
  {title: 'Wi-Fi', value: 'wifi'},
  {title: 'Pool / water', value: 'waves'},
  {title: 'Parking', value: 'car'},
  {title: 'Coffee', value: 'coffee'},
  {title: 'Fitness', value: 'dumbbell'},
  {title: 'Nature', value: 'trees'},
  {title: 'Mountain', value: 'mountain'},
  {title: 'View', value: 'eye'},
  {title: 'Air conditioning', value: 'snowflake'},
  {title: 'TV', value: 'tv'},
  {title: 'Bath', value: 'bath'},
  {title: 'Hair dryer', value: 'wind'},
  {title: 'Safe', value: 'vault'},
  {title: 'Minibar / fridge', value: 'refrigerator'},
  {title: 'Phone', value: 'phone'},
  {title: 'Family', value: 'baby'},
  {title: 'Celebration', value: 'party-popper'},
  {title: 'Meetings', value: 'presentation'},
  {title: 'Culture', value: 'landmark'},
  {title: 'Sustainability', value: 'leaf'},
  {title: 'Care / heart', value: 'heart'},
  {title: 'Wellbeing / smile', value: 'smile'},
  {title: 'Premium / gem', value: 'gem'},
  {title: 'Business / briefcase', value: 'briefcase'},
  {title: 'Group / people', value: 'users'},
  {title: 'Toast / glasses', value: 'wine'},
  {title: 'Star / excellence', value: 'star'},
  {title: 'Fine cuisine / cloche', value: 'concierge-bell'},
]

export const iconField = defineField({
  name: 'icon',
  type: 'string',
  options: {list: ICON_OPTIONS},
})

/** Icon + title + short text, used for resort highlights and feature lists. */
export const feature = defineType({
  name: 'feature',
  type: 'object',
  icon: StarIcon,
  fields: [
    iconField,
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

/** Icon + label, used for amenity lists. */
export const amenity = defineType({
  name: 'amenity',
  type: 'object',
  icon: StarIcon,
  fields: [iconField, defineField({name: 'label', type: 'string', validation: (rule) => rule.required()})],
  preview: {select: {title: 'label', subtitle: 'icon'}},
})
