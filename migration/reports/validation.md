# Content migration validation

Dataset: f3i47bov/production (published perspective)

| Check | Result | Detail |
| --- | --- | --- |
| Counts match the transform | Pass | resort 9, room 17, eventVenue 32, diningVenue 22, experience 41, spaTreatment 31, eventPackage 27, offer 1, page 7, siteSettings 1, homePage 1 |
| Every migrated document exists | Pass | 189 documents |
| References resolve | Pass | 700 references |
| Images have an uploaded asset and alt text | Pass | 421 images |
| No content points at legacy image hosts | Pass | none |
| Slugs are unique per type | Pass | 133 slugs |
| Every room references a resort | Pass | 17 rooms |
| Import contains no enquiries | Pass | none |
| Spot checks (Bishoftu geo, suite amenities, room bed and label case, offer dates, reservation phone) | Pass | all match the source |

All checks passed.
