import {BlockContentIcon, BulbOutlineIcon, ImagesIcon, PlayIcon, SplitHorizontalIcon, TextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {videoUrlRule} from '../../lib/validation'

/** Section blocks for flexible `page` documents. Keep this set small. */

export const textSection = defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'body', type: 'richText', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Text', subtitle: 'Text'}),
  },
})

export const mediaText = defineType({
  name: 'mediaText',
  title: 'Image + text',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', type: 'richText'}),
    defineField({name: 'image', type: 'accessibleImage', validation: (rule) => rule.required()}),
    defineField({
      name: 'imagePosition',
      type: 'string',
      initialValue: 'start',
      options: {
        list: [
          {title: 'Before text', value: 'start'},
          {title: 'After text', value: 'end'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({name: 'link', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Image + text', subtitle: 'Image + text', media}),
  },
})

export const featureList = defineType({
  name: 'featureList',
  title: 'Feature list',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({type: 'feature'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Feature list', subtitle: 'Feature list'}),
  },
})

export const imageGallery = defineType({
  name: 'imageGallery',
  title: 'Image gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'images',
      type: 'array',
      of: [defineArrayMember({type: 'accessibleImage'})],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'images.0'},
    prepare: ({title, media}) => ({title: title || 'Image gallery', subtitle: 'Image gallery', media}),
  },
})

export const callToAction = defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', type: 'text', rows: 2}),
    defineField({name: 'link', type: 'link', validation: (rule) => rule.required()}),
    defineField({name: 'backgroundImage', type: 'accessibleImage'}),
  ],
  preview: {
    select: {title: 'heading', media: 'backgroundImage'},
    prepare: ({title, media}) => ({title: title || 'Call to action', subtitle: 'Call to action', media}),
  },
})

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'url',
      title: 'YouTube or Vimeo URL',
      type: 'url',
      validation: (rule) => videoUrlRule(rule).required(),
    }),
    defineField({name: 'poster', type: 'accessibleImage', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'title', media: 'poster'},
    prepare: ({title, media}) => ({title: title || 'Video', subtitle: 'Video', media}),
  },
})

export const pageSectionTypes = ['textSection', 'mediaText', 'featureList', 'imageGallery', 'callToAction', 'videoEmbed']

export const blockTypes = [textSection, mediaText, featureList, imageGallery, callToAction, videoEmbed]
