# Data Model: Страница авторизации пользователей

## Entities

### AuthCredentials
- email: string (обязательное поле; формат email)
- password: string (обязательное поле; длина ≥ 8 символов любой сложности)

### AuthState
- status: `idle | validating | submitting | success | error`
- errorCode?: `invalid_credentials | blocked | unverified | network`
- message?: string (текст для пользователя)

### RecoveryRequest
- email: string
- requestedAt: ISO datetime (для отображения времени отправки ссылки восстановления)

## Relationships
- AuthCredentials → используется для формирования запроса `POST /api/auth/login`.
- AuthState → управляет визуальным состоянием формы и кнопки "Войти".
- RecoveryRequest → инициируется через `POST /api/auth/recover` и влияет на UI подтверждения.

## Validation Rules
- Email валидируется регулярным выражением и триммингом пробелов.
- Пароль должен быть непустым; дополнительные правила сложности могут быть подключены позже.
- При статусе `submitting` повторная отправка блокируется до завершения запроса.

## Derived / View State
- `isSubmitDisabled = status === "submitting" || !isFormValid`.
- `showError = status === "error" && message`.
