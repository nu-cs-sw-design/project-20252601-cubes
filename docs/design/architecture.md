# Key Quality Attributes and Their Corresponding Scenarios

## 1. Functional Suitability - Correctness

**Scenario:** "When a player submits the guess 'CRANE' for the target word 'STARE', the system shall evaluate and display the result as Gray-Yellow-Green-Yellow-Green (letter by letter feedback) with 100% accuracy, correctly handling the duplicate letter 'R'."

## 2. Interaction Capability - User Error Protection

**Scenario:** "When a player attempts to submit an invalid word 'QWXYZ' that does not exist in the dictionary, the system shall display the error message 'Not in word list', and allow the player to correct their input without decrementing the remaining attempts counter."

## 3. Reliability - Recoverability

**Scenario:** "In the event of an unexpected application crash while a player is mid-game (3 guesses submitted, 3 attempts remaining), the system must automatically save the complete game state after each guess, allowing the player to resume with all previous guesses, colors, keyboard state, and remaining attempts fully restored when the application restarts."

---

# Software Architectural Design

## Three-Layered Architecture

The application is organized into three distinct layers, each with clear responsibilities:

- **Presentation Layer** - Handles all user interface and user interaction concerns
- **Domain Layer (Business Logic)** - Contains core game logic, rules, and business entities
- **Data Layer** - Manages data persistence, retrieval, and storage operations

## MVC Pattern Within the Presentation Layer

Within the Presentation Layer, the MVC pattern provides fine-grained separation of concerns:

- **Model:** Represents game data and state.
- **View:** Displays game information and observes state changes using the Observer pattern.
- **Controller:** Mediates between user actions and business logic, coordinates game flow.