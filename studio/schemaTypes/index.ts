import type {SchemaTypeDefinition} from 'sanity'

import {blockTypes} from './blocks'
import {destinationRegion, resort, room} from './documents/destinations'
import {enquiry} from './documents/enquiry'
import {homePage} from './documents/homePage'
import {diningVenue, eventPackage, eventVenue, experience, offer, spaTreatment} from './documents/offerings'
import {page} from './documents/page'
import {siteSettings} from './documents/siteSettings'
import {accessibleImage} from './objects/accessibleImage'
import {address, contactDetails} from './objects/contact'
import {amenity, feature} from './objects/feature'
import {link} from './objects/link'
import {price} from './objects/price'
import {richText} from './objects/richText'
import {seo} from './objects/seo'

/** Fixed-id documents, edited in place from the Structure. */
export const SINGLETON_TYPES = ['siteSettings', 'homePage']

/** Documents only the web server writes. Never created in Studio. */
export const SERVER_WRITTEN_TYPES = ['enquiry']

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  accessibleImage,
  link,
  seo,
  contactDetails,
  address,
  price,
  richText,
  feature,
  amenity,
  ...blockTypes,
  // Documents
  siteSettings,
  homePage,
  destinationRegion,
  resort,
  room,
  experience,
  spaTreatment,
  diningVenue,
  eventVenue,
  eventPackage,
  offer,
  page,
  enquiry,
]
