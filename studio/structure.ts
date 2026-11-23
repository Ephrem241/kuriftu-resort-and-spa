import {CalendarIcon, CogIcon, EarthGlobeIcon, EnvelopeIcon, HomeIcon, RocketIcon, SparklesIcon, TagIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

function singleton(S: StructureBuilder, type: string, title: string, icon: typeof CogIcon) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title))
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      singleton(S, 'siteSettings', 'Site settings', CogIcon),
      singleton(S, 'homePage', 'Home page', HomeIcon),
      singleton(S, 'destinationsPage', 'Destinations page', EarthGlobeIcon),
      singleton(S, 'experiencesPage', 'Experiences page', RocketIcon),
      singleton(S, 'wellnessPage', 'Wellness page', SparklesIcon),
      singleton(S, 'eventsPage', 'Events page', CalendarIcon),
      singleton(S, 'offersPage', 'Offers page', TagIcon),
      S.divider(),
      S.documentTypeListItem('destinationRegion').title('Regions'),
      S.documentTypeListItem('resort').title('Resorts'),
      S.documentTypeListItem('room').title('Rooms'),
      S.divider(),
      S.documentTypeListItem('experience').title('Experiences'),
      S.documentTypeListItem('spaTreatment').title('Spa treatments'),
      S.documentTypeListItem('diningVenue').title('Dining venues'),
      S.divider(),
      S.documentTypeListItem('eventVenue').title('Event venues'),
      S.documentTypeListItem('eventPackage').title('Event packages'),
      S.documentTypeListItem('offer').title('Offers'),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.listItem()
        .title('Enquiries')
        .id('enquiries')
        .icon(EnvelopeIcon)
        .child(
          S.documentTypeList('enquiry')
            .title('Enquiries')
            .initialValueTemplates([])
            .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
        ),
    ])
