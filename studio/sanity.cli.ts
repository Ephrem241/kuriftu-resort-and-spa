import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  // Hosted at https://kuriftu.sanity.studio (`npm run deploy`).
  deployment: {
    appId: 'yuvowtddkjzdlvf7z33uigns',
    autoUpdates: true,
  },
  typegen: {
    // Queries live in the web workspace; types are committed there.
    path: '../{lib,sanity}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
