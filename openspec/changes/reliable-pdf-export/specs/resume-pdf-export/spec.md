## ADDED Requirements
### Requirement: Complete multipage output
The application SHALL retain all visible resume content when printing and provide margins on every A4 page.
#### Scenario: Long resume
- **WHEN** content exceeds one page
- **THEN** printing flows onto additional pages without fixed-height clipping
### Requirement: Export readiness
The application SHALL wait for fonts and images before printing and report resource failures without opening print.
#### Scenario: Failed image
- **WHEN** an image cannot load or readiness times out
- **THEN** an actionable error is shown and export can be retried
### Requirement: Readability-first fitting
The application SHALL reduce section spacing before scaling typography and retain existing lower bounds.
#### Scenario: Content still exceeds one page
- **WHEN** fitting reaches its lower bounds
- **THEN** the application recommends multipage output or manual content reduction
### Requirement: Honest preview
The application SHALL distinguish continuous on-screen preview from final print pagination.
#### Scenario: Overflow notification
- **WHEN** content exceeds one page
- **THEN** the user is informed that full content prints across pages and final pagination is available in print preview
