# Software Requirements Document

## 1. Encapsulation

**Compliance:** Full

The design properly encapsulates data within appropriate classes where each class bundles related data with methods that operate on that data.

**Example 1:** The `EvaluationResult` class encapsulates the guess string, `letterStatuses` array, and `isCorrect` boolean as private fields, providing controlled access through `getGuess()`, `getLetterStatuses()`, and `isWinningGuess()` methods.

**Example 2:** The `GameState` class encapsulates `targetWord`, `guesses`, `currentRow`, and `gameStatus` with private fields, preventing external code from directly modifying game state.

**Tradeoff:** Strict encapsulation adds overhead in getter/setter methods, but this protects internal state from invalid modifications and makes code easier to maintain and debug.

## 2. Delegation

**Compliance:** Full

The design effectively delegates responsibilities to specialized classes rather than having one class do everything.

**Example 1:** The `Game` class delegates word evaluation to `WordEvaluator` by calling `wordEvaluator.evaluate("CRANE")` rather than containing the evaluation algorithm itself.

**Example 2:** The `Game` class delegates hint logic to `HintService` by calling `hintService.getHint(previousGuesses)` rather than implementing hint selection internally.

**Tradeoff:** Delegation introduces more classes and method calls, but each class has a focused purpose making the system easier to test, maintain, and extend.

## 3. Information Hiding

**Compliance:** Full

The design hides implementation details behind well-defined interfaces so other modules only know what they need to know.

**Example 1:** The `LocalStorageRepository` hides the localStorage key format (e.g., `wordle_5_statistics`) and JSON serialization details behind `save()` and `load()` methods.

**Example 2:** The `ThemeStrategy` implementations hide the actual hex color values (e.g., `#6aaa64` for green) behind methods like `getCorrectColor()` and `getPresentColor()`.

**Tradeoff:** Information hiding requires careful interface design upfront, but internal implementations can change without affecting other parts of the system.

## 4. Encapsulate What Varies

**Compliance:** Full

The design identifies aspects likely to change and separates them from what stays the same.

**Example 1:** Word length configuration varies and is encapsulated in `WordLengthStrategy` with separate `FourLetterStrategy`, `FiveLetterStrategy`, and `SixLetterStrategy` classes.

**Example 2:** Theme colors vary and are encapsulated in `ThemeStrategy` with `LightThemeStrategy`, `DarkThemeStrategy`, and `HighContrastStrategy` implementations.

**Tradeoff:** Creating separate classes for variations adds more files, but adding a 7-letter mode or new theme only requires creating a new strategy class without modifying existing code.

## 5. Favor Composition Over Inheritance

**Compliance:** Full

The design favors composition throughout, using inheritance only where appropriate for the Template Method pattern.

**Example 1:** The `Game` class is composed with a `GameState` object and an array of `GameObserver` objects rather than inheriting from a base game class.

**Example 2:** The `GameStateRepository` is composed with a `Repository` object (`repository: Repository`) rather than extending `LocalStorageRepository`.

**Tradeoff:** Composition requires more explicit wiring of objects, but provides greater flexibility since composed objects can be swapped at runtime and avoids fragile base class problem.

## 6. Program to Interface, Not Implementation

**Compliance:** Full

The design consistently depends on abstractions rather than concrete implementations.

**Example 1:** `GameConfiguration` depends on the `WordLengthStrategy` interface, not on `FiveLetterStrategy` directly, allowing any word length strategy to be injected.

**Example 2:** `Game` depends on the `GameObserver` interface when notifying observers, not on concrete classes like `GameBoardView` or `KeyboardView`.

**Tradeoff:** Programming to interfaces requires defining abstractions upfront, but implementations can be swapped without changing client code, enabling easier testing and future extensibility.

## 7. Strive for Loosely Coupled Designs Between Objects That Interact

**Compliance:** Full

The design achieves loose coupling through multiple mechanisms including Observer, Strategy, and Repository patterns.

**Example 1:** The `Game` class doesn't know about `GameBoardView`, `KeyboardView`, or `StatisticsView` directly—it only knows the `GameObserver` interface and calls `notifyGuessEvaluated(result)`.

**Example 2:** The Domain layer has no dependencies on the Presentation layer; it only exposes interfaces that the Presentation layer implements.

**Tradeoff:** Loose coupling requires additional abstraction layers which adds complexity, but components can be developed, tested, and modified independently.

## 8. Hollywood Principle

**Compliance:** Full

The design follows "Don't Call Us, We'll Call You" through Observer and Template Method patterns.

**Example 1:** When a guess is evaluated, `Game` calls `notifyGuessEvaluated(result)` which triggers `onGuessEvaluated()` in all registered observers—Views don't poll the Game for updates.

**Example 2:** The `WordEvaluator.evaluate()` template method calls the hook methods `validateGuess()` and `computeLetterStatuses()` in subclasses, rather than subclasses calling the parent.

**Tradeoff:** Requires setting up notification infrastructure, but low-level components don't need to know when to update—they simply respond when called.

## 9. Principle of Least Knowledge (Law of Demeter)

**Compliance:** Full

The design ensures objects only communicate with their immediate collaborators, not reaching through objects to access others.

**Example 1:** `GameController` calls `gameBoardView.onGuessEvaluated(result)` rather than reaching into the view with `gameBoardView.tiles[0][2].setBackgroundColor()`.

**Example 2:** `Game` calls `observer.onHintUsed(letter, position)` rather than `keyboardView.keyButtons.get(letter).setHighlightColor()`.

**Tradeoff:** Strictly following this principle sometimes requires adding wrapper methods, but it reduces coupling and makes the system more resilient to internal changes.

## 10. Single Responsibility Principle (SRP)

**Compliance:** Full

Each class in the design has a single, well-defined responsibility with only one reason to change.

**Example 1:** `WordEvaluator` has one responsibility: evaluating guesses against the target word. It doesn't handle UI, storage, or game state management.

**Example 2:** `ToastView` has one responsibility: displaying temporary notification messages. It doesn't handle game logic or statistics.

**Tradeoff:** SRP results in many small classes which increases file count, but each class is easier to understand, test, and modify independently.

## 11. Open/Closed Principle (OCP)

**Compliance:** Full

The design is open for extension but closed for modification through Strategy and Repository patterns.

**Example 1:** Adding a 7-letter mode requires only creating a new `SevenLetterStrategy` class implementing `WordLengthStrategy`—no existing strategy classes need modification.

**Example 2:** Adding cloud storage requires only creating a new `CloudStorageRepository` class implementing `Repository`—`GameStateRepository` and other clients remain unchanged.

**Tradeoff:** Achieving OCP requires thoughtful abstraction design, but functionality can be extended without risking bugs in existing tested code.

## 12. Liskov Substitution Principle (LSP)

**Compliance:** Full

All subtypes can substitute for their base types without altering program correctness.

**Example 1:** `FourLetterStrategy`, `FiveLetterStrategy`, and `SixLetterStrategy` all implement `WordLengthStrategy` identically—`GameConfiguration` can use any of them interchangeably without behavior changes.

**Example 2:** `GameBoardView`, `KeyboardView`, and `StatisticsView` all implement `GameObserver`—`Game` can register any combination of them without knowing which specific views are observing.

**Tradeoff:** LSP requires careful interface design to ensure all implementations fulfill the contract, but enables polymorphism and system flexibility.

## 13. Interface Segregation Principle (ISP)

**Compliance:** Partial

The design uses focused interfaces but `GameObserver` groups multiple notification methods together.

**Example 1:** `WordLengthStrategy` is a focused interface with only 4 methods related to word length concerns: `getWordLength()`, `getWordList()`, `getRandomWord()`, `isValidWord()`.

**Example 2:** `Repository` is a focused interface with only 4 CRUD methods: `save()`, `load()`, `delete()`, `exists()`.

**Violation:** `GameObserver` requires implementing all four methods (`onGameStateChanged`, `onGuessEvaluated`, `onGameOver`, `onHintUsed`) even if an observer only needs some.

**Tradeoff:** The `GameObserver` interface could be split into smaller interfaces, but the current design accepts this minor violation for simplicity since most observers use multiple methods.

## 14. Dependency Inversion Principle (DIP)

**Compliance:** Full

High-level modules depend on abstractions, not low-level modules.

**Example 1:** `GameStateRepository` (high-level) depends on `Repository` interface (abstraction), not directly on `LocalStorageRepository` (low-level implementation).

**Example 2:** `Game` (high-level domain logic) depends on `GameObserver` interface (abstraction), not directly on `GameBoardView` or `KeyboardView` (low-level UI components).

**Tradeoff:** DIP requires defining interfaces and potentially using dependency injection, but high-level business logic is insulated from low-level implementation details.

## 15. Low Coupling and High Cohesion

**Compliance:** Full

The design achieves low coupling between classes and high cohesion within classes.

**Low Coupling Example 1:** `Game` is loosely coupled to Views through the `GameObserver` interface—changing `KeyboardView` internals doesn't affect `Game`.

**Low Coupling Example 2:** `StatisticsRepository` is loosely coupled to storage through the `Repository` interface—switching from localStorage to a database doesn't affect statistics logic.

**High Cohesion Example 1:** `WordEvaluator` has high cohesion—all its methods relate to evaluating guesses: `evaluate()`, `validateGuess()`, `computeLetterStatuses()`, `countLetterOccurrences()`, `createEvaluationResult()`.

**High Cohesion Example 2:** `HintService` has high cohesion—all its methods relate to hint functionality: `getHint()` and `findUnrevealedLetter()`.

**Tradeoff:** Achieving low coupling requires abstraction layers, and high cohesion results in more classes. However, this combination creates a system where classes are independent, focused, and easy to maintain.