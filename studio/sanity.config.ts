import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {SERVER_WRITTEN_TYPES, SINGLETON_TYPES, schemaTypes} from './schemaTypes'
import {structure} from './structure'

const NOT_CREATABLE = new Set([...SINGLETON_TYPES, ...SERVER_WRITTEN_TYPES])
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

if (!projectId || !dataset) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID or SANITY_STUDIO_DATASET in studio/.env')
}

export default defineConfig({
  name: 'default',
  title: 'Kuriftu Resorts & Spa',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: '2026-11-21'})],
  schema: {
    types: schemaTypes,
    // Singletons and enquiries never appear in "create new" menus.
    templates: (templates) => templates.filter(({schemaType}) => !NOT_CREATABLE.has(schemaType)),
  },
  document: {
    // Singletons: no duplicate, delete or unpublish.
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.includes(schemaType)
        ? actions.filter(({action}) => action && SINGLETON_ACTIONS.has(action))
        : schemaType === 'enquiry'
          ? actions.filter(({action}) => action !== 'duplicate')
          : actions,
  },
})
