# Data Model: Интерактивный навигационный бар

## Entities

### NavigationMenu
- id: string
- title: string
- items: MenuItem[]
- isSticky: boolean

### MenuItem
- id: string
- label: string
- href: string
- icon?: string
- children?: MenuItem[] (для подменю, если потребуется)
- isActive: boolean

### BurgerMenu
- isOpen: boolean
- items: MenuItem[]

## Relationships
- NavigationMenu содержит MenuItem[]
- BurgerMenu использует те же MenuItem[]

## Validation Rules
- Каждый MenuItem должен иметь уникальный id и label
- href должен быть валидным URL/route
- Если есть children, они также должны быть MenuItem[]

## State Transitions
- isActive меняется при переходе между разделами
- isOpen меняется при открытии/закрытии бургер-меню
