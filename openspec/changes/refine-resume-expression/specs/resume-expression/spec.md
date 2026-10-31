## ADDED Requirements
### Requirement: Visual hierarchy
The preview SHALL distinguish section titles, entry names, body content and supporting metadata while preserving configured typography sizes and line heights.
#### Scenario: Resume rendering
- **WHEN** a resume is previewed or printed
- **THEN** headings and explicit bold emphasis remain readable and decorative elements do not obscure text
### Requirement: Theme-aware tags
Technology tags SHALL use the configured brand color rather than a fixed blue palette.
#### Scenario: Brand change
- **WHEN** the theme brand color changes
- **THEN** project tags reflect the new color
### Requirement: Identifiable project links
Project links SHALL include a visible text label and retain their original destination.
#### Scenario: Project URL present
- **WHEN** a project has a link
- **THEN** the preview and PDF display a labelled clickable project link
