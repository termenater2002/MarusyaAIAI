# Диаграмма классов

Ниже приведена UML-диаграмма классов для текущей версии проекта. Она отражает не только основные предметные сущности каталога, но и сервисные классы, которые реально участвуют в авторизации, поиске, проверке доступности и работе с индексом.

```mermaid
classDiagram
direction LR

class AITool {
  +int id
  +string name
  +string entityType
  +string url
  +string imageUrl
  +string shortDescription
  +string longDescription
  +boolean worksInRussia
  +boolean needsVPN
  +boolean requiresRegistration
  +boolean isFree
  +number editorialRating
}

class Category {
  +int id
  +string sourceName
}

class Tag {
  +string name
}

class Feature {
  +int positionIndex
  +string featureText
}

class User {
  +string id
  +string email
  +string username
  +string passwordHash
  +string displayName
  +string role
  +string status
  +boolean emailVerified
  +datetime lastLoginAt
}

class AuthSession {
  +string id
  +string refreshTokenHash
  +string ipAddress
  +string userAgent
  +datetime expiresAt
  +datetime revokedAt
}

class PasswordResetToken {
  +string id
  +string tokenHash
  +datetime expiresAt
  +datetime usedAt
}

class Favorite {
  +datetime createdAt
}

class UserRating {
  +string id
  +int ratingValue
  +string reviewText
  +datetime createdAt
  +datetime updatedAt
}

class ServiceCheckRun {
  +string id
  +string sourceFile
  +datetime checkedAt
  +int totalCount
  +int okCount
  +int failedCount
}

class ServiceCheckResult {
  +string id
  +int sourceIndex
  +string name
  +string entityType
  +string url
  +boolean ok
  +int status
  +string finalUrl
  +boolean redirected
  +int responseTimeMs
  +string error
  +datetime checkedAt
}

class ToolSearchIndex {
  +int toolId
  +string nameText
  +string entityTypeText
  +string descriptionText
  +string longDescriptionText
  +string tagsText
  +string featuresText
  +string categoriesText
  +string searchableText
  +string embeddingModel
  +json embedding
  +datetime embeddingUpdatedAt
}

class AuthService {
  +createSession(userId, meta)
  +revokeSession(token)
  +getSessionUser(request)
  +getSessionAccessError(user, options)
}

class FirebaseLookupService {
  +lookupFirebaseUser(idToken)
}

class FirebaseAdminService {
  +getFirebaseAdminAuth()
  +purgeExpiredUnverifiedFirebaseUserByEmail(email)
}

class ToolSearchService {
  +buildSearchableRepresentation(tool)
  +parseUserToolQuery(query)
  +searchToolsByUserQuery(query)
  -getTextCandidates(parsedQuery, limit)
  -getSemanticCandidates(parsedQuery, limit)
  -rerankCandidates(parsedQuery, candidates)
}

class OpenAIService {
  +createEmbedding(input)
  +createStructuredChatCompletion(input)
}

class DbPool {
  +getPool()
}

AITool "1" -- "*" Feature : contains
AITool "*" -- "*" Category : classified in
AITool "*" -- "*" Tag : labeled by
User "1" -- "*" AuthSession : owns
User "1" -- "*" PasswordResetToken : receives
User "1" -- "*" Favorite : creates
User "1" -- "*" UserRating : leaves
AITool "1" -- "*" Favorite : saved in
AITool "1" -- "*" UserRating : rated by
AITool "1" -- "0..1" ToolSearchIndex : indexed by
ServiceCheckRun "1" -- "*" ServiceCheckResult : contains
AITool "1" -- "*" ServiceCheckResult : checked as

AuthService ..> DbPool : uses
AuthService ..> User : reads
AuthService ..> AuthSession : manages
FirebaseLookupService ..> User : identifies
FirebaseAdminService ..> User : purges stale unverified account
FirebaseAdminService ..> DbPool : uses
ToolSearchService ..> ToolSearchIndex : queries
ToolSearchService ..> AITool : returns
ToolSearchService ..> OpenAIService : uses
ToolSearchService ..> DbPool : uses
```

## Что показывает эта диаграмма

- `AITool` — центральный класс системы, описывающий карточку нейросети или полезного сайта.
- `Category`, `Tag`, `Feature` — связанные сущности, которые описывают классификацию и свойства инструмента.
- `User`, `AuthSession`, `PasswordResetToken`, `Favorite`, `UserRating` — блок пользовательского взаимодействия и авторизации.
- `ServiceCheckRun` и `ServiceCheckResult` — блок мониторинга доступности сайтов.
- `ToolSearchIndex` — поисковый индекс для обычного и умного поиска.
- `AuthService`, `FirebaseLookupService`, `FirebaseAdminService`, `ToolSearchService`, `OpenAIService` — сервисные классы, реализующие прикладную логику.

## Как это можно описать в тексте

Если тебе нужен кусок для пояснительной записки, можно написать так:

> Диаграмма классов отражает статическую структуру программной системы и показывает основные сущности каталога ИИ-инструментов, их атрибуты, операции и взаимосвязи. Центральным классом является `AITool`, связанный с категориями, тегами, функциональными характеристиками, пользовательскими оценками и избранным. Отдельную группу составляют классы пользовательского доступа и авторизации (`User`, `AuthSession`, `PasswordResetToken`), а также сервисные классы, обеспечивающие работу поиска, Firebase-аутентификации, управления сессиями и индексации данных. Таким образом, диаграмма описывает логическое устройство системы и показывает взаимодействие предметной модели с прикладными сервисами.
