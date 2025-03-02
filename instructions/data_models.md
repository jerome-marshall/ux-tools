# UX Research Tools - Data Models

## User Model

- ID
- Name
- Email
- Role (Admin/User)
- Created At
- Updated At

## Project Model

- ID
- Name
- Description
- Objectives
- Created By (User ID)
- Created At
- Updated At

## Tree Template Model

- ID
- Project ID
- Name
- Description
- Tree Structure (JSON)
- Created By (User ID)
- Created At
- Updated At

## Test Model

- ID
- Project ID
- Name
- Type (Tree Test, Card Sort, etc.)
- Description
- Tree Template ID (optional, references Tree Template)
- Custom Tree Structure (JSON, used if not using a template)
- Configuration (JSON)
- Status (Draft, Active, Completed)
- Created By (User ID)
- Created At
- Updated At

## Task Model

- ID
- Test ID
- Description
- Starting Point (optional)
- Target Node
- Order
- Created At
- Updated At

## Participant Results Model

- ID
- Test ID
- Participant ID (anonymous)
- Responses (JSON)
- Completion Time
- Created At
