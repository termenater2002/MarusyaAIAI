# Data Model: AI Catalog Cards

## Entities

### AI Tool
- Fields: `id` (number), `name` (string), `description` (string), `longDescription` (string), `url` (string), `image` (string path), `rating` (number, one decimal precision), `tags` (string[]), `categoryIds` (number[]), `features` (string[]).
- Validation: `name`, `description`, `url`, `rating`, and `tags` must render as provided without modification; rating displayed with one decimal; tags shown in source order; links open externally; missing image does not block render (fallback shown).
- Relationships: Links to Category via `categoryIds` (no filtering in this scope).

### Category
- Fields: `id` (number), `name` (string).
- Relationships: Referenced by AI Tool `categoryIds`; not used for filtering or sorting in this feature.

### Card View
- Derived from AI Tool.
- Fields: `title` (AI Tool `name`), `summary` (`description`), `ratingDisplay` (one-decimal string), `tags` (all tags in order), `availabilityStatus` (direct tag or “доступность не указана”), `pricingStatus` (price tag or “модель оплаты не указана”), `link` (`url`), `imageSrc` (`image` or placeholder).
- Validation: Must render even if tags miss pricing/region info; must not invent tags or alter order; must preserve count equality with `aiData`.
