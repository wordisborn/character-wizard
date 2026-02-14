## ADDED Requirements

### Requirement: 3D Character Preview
The app SHALL render a 3D character model using Three.js (via React Three Fiber) in the character sheet panel that visually represents the character being created.

#### Scenario: Initial 3D preview
- **WHEN** the character sheet panel loads
- **THEN** a 3D canvas displays a default humanoid base model
- **AND** the user can rotate the model by clicking and dragging
- **AND** the user can zoom with scroll

#### Scenario: Model updates from character choices
- **WHEN** the user selects a race or makes appearance-related decisions
- **THEN** the 3D model updates to reflect the choice (e.g., color changes, proportions, accessories)
- **AND** the transition is smooth/animated

### Requirement: Visualization Fallback
The app SHALL gracefully handle cases where 3D rendering is not available or assets are missing.

#### Scenario: 3D not supported
- **WHEN** the user's browser does not support WebGL
- **THEN** the app displays a static placeholder illustration instead of the 3D canvas
- **AND** the character sheet remains fully functional

#### Scenario: Asset not yet available
- **WHEN** a character choice maps to a 3D asset that doesn't exist yet
- **THEN** the model retains its current appearance
- **AND** no error is shown to the user
