<!--
SYNC IMPACT REPORT
==================
Version Change: [NEW] → 1.0.0
Constitution Type: MINOR (Initial constitution creation with comprehensive principles)

Principles Created:
- I. Code Quality & Maintainability (DRY, KISS, SOLID)
- II. Test-First Development (NON-NEGOTIABLE)
- III. Monorepo Structure
- IV. UI/UX Consistency
- V. Simplicity & Single Responsibility

Sections Created:
- Core Principles (5 principles)
- Technical Standards
- Development Workflow
- Governance

Templates Status:
✅ .specify/templates/plan-template.md - Constitution Check section aligns with principles
✅ .specify/templates/spec-template.md - User story and requirements format compatible
✅ .specify/templates/tasks-template.md - Task structure supports test-first and story-based development

Follow-up Items:
- None (all placeholders filled)

Rationale:
This is the initial constitution derived from existing project documentation
(coding-guidelines.md, testing-guidelines.md, project-overview.md, ui-guidelines.md,
functional-requirements.md). All principles reflect current documented practices.
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Code Quality & Maintainability

Code MUST follow DRY (Don't Repeat Yourself), KISS (Keep It Simple, Stupid), and SOLID principles:

- **DRY**: Extract common code into shared functions/utilities; build reusable components
- **KISS**: Prefer simple implementations; code must be readable at first glance; break complex logic into smaller functions
- **SOLID**: Each module/component has single responsibility; depend on abstractions not implementations; use composition for extensibility
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for React components/classes, `UPPER_SNAKE_CASE` for constants
- **Comments**: Document "why" not "what"; use JSDoc for public functions; keep comments updated or remove them

**Rationale**: Maintainability and code quality directly impact team velocity and reduce technical debt. These principles ensure code remains understandable and modifiable.

### II. Test-First Development (NON-NEGOTIABLE)

Testing MUST follow comprehensive test-first practices:

- **Coverage Target**: 80%+ code coverage across all packages
- **Test Types**: Unit tests for components/functions; integration tests for component interactions and API communication
- **Test Behavior**: Test what code does, not how it does it; use descriptive test names; follow Arrange-Act-Assert pattern
- **Test Organization**: Tests colocated in `__tests__/` directories; use fixtures and mock data for consistency
- **Quality Gate**: All tests MUST pass before committing; new features MUST include tests

**Rationale**: Comprehensive testing ensures reliability, facilitates refactoring, and serves as living documentation. 80%+ coverage provides confidence without test brittleness.

### III. Monorepo Structure

Project MUST maintain monorepo architecture using npm workspaces:

- **Structure**: `packages/frontend/` (React), `packages/backend/` (Express.js)
- **Workspace Management**: Use npm workspaces; run commands from root or individual packages
- **File Organization**: Frontend follows component-based structure with `src/components/`, `src/services/`, `src/utils/`; Backend follows layered architecture with `src/routes/`, `src/controllers/`, `src/services/`
- **Import Rules**: Use relative paths for internal modules; organize imports by external libraries → internal modules → styles
- **Shared Code**: Extract shared utilities; avoid circular dependencies

**Rationale**: Monorepo structure enables code sharing, consistent tooling, and simplified dependency management while maintaining clear boundaries between frontend and backend.

### IV. UI/UX Consistency

User interface MUST follow Material Design principles with Halloween theme:

- **Design System**: Consistent color palette (light/dark modes), 8px spacing grid, system font stack
- **Typography Hierarchy**: Clear heading/body/caption distinctions; specific font sizes and weights
- **Component Standards**: Card-based layouts with 8px border radius; consistent padding (8px/16px/24px/32px/48px)
- **Accessibility**: WCAG AA color contrast; keyboard accessible; proper ARIA labels; visible focus indicators
- **Responsiveness**: Desktop-focused with mobile considerations; max-width 600px centered layout

**Rationale**: Consistent UI/UX improves usability, reduces cognitive load, and ensures accessibility for all users. Material Design provides proven patterns.

### V. Simplicity & Single Responsibility

Features MUST remain simple and focused:

- **YAGNI Principle**: Implement only what is specified; no speculative features
- **Feature Scope**: Core todo management only (create, view, update status, delete, edit); no advanced features unless specified
- **Single User**: No authentication, multi-user support, or collaboration features
- **Clear Boundaries**: Each component/service has one clear purpose; avoid feature creep
- **Performance**: Avoid premature optimization; optimize only when necessary with clear goals

**Rationale**: Simplicity reduces maintenance burden, accelerates development, and prevents scope creep. Single responsibility ensures testability and maintainability.

## Technical Standards

**Technology Stack**:
- Frontend: React, React DOM, CSS, Jest
- Backend: Node.js, Express.js, Jest
- Version Control: Git with atomic commits, feature branches, pull requests

**Code Style**:
- Indentation: 2 spaces (JavaScript, JSON, CSS, Markdown)
- Line Length: Max 100 characters for code
- Line Endings: LF (Unix-style)
- Linting: ESLint enforced; no console.log in production; no unused variables

**Error Handling**:
- Try-catch blocks around operations that can fail
- Meaningful error messages for users
- Proper error logging for developers
- Graceful degradation when possible

**Performance Considerations**:
- React: Use `useMemo` and `useCallback` appropriately
- Lazy loading when beneficial
- Efficient algorithms and data structures
- Reasonable bundle sizes

## Development Workflow

**Git Practices**:
- Atomic commits representing one logical change
- Clear commit messages explaining "why"
- Feature branches: `feature/[description]`
- Pull requests required for code review before merging

**Code Review Checklist**:
- [ ] Follows naming conventions
- [ ] Imports organized correctly
- [ ] No linting errors or warnings
- [ ] Code is DRY and avoids repetition
- [ ] Functions/components have single responsibility
- [ ] Error handling implemented
- [ ] Comments are clear and helpful
- [ ] Tests written for new functionality
- [ ] No console.log statements in production code

**Testing Workflow**:
- Write tests as part of development process
- Run tests locally before committing
- All tests MUST pass before PR approval
- Use test fixtures and helpers to reduce duplication

**Specification Workflow**:
- Feature specifications MUST be prioritized (P1, P2, P3)
- Each user story MUST be independently testable
- Requirements MUST use "MUST" for mandatory, "SHOULD" for recommended
- Mark unclear requirements as "NEEDS CLARIFICATION"

## Governance

This constitution supersedes all other development practices and guidelines. All code reviews, pull requests, and feature implementations MUST verify compliance with these principles.

**Amendment Process**:
- Amendments require documentation of rationale and impact
- Version increments follow semantic versioning (MAJOR.MINOR.PATCH)
- All dependent artifacts (templates, documentation) MUST be updated
- Team approval required for MAJOR version changes

**Compliance Review**:
- Constitution Check MUST pass before Phase 0 research in implementation plans
- Re-check after Phase 1 design
- Complexity violations MUST be justified in plan.md
- Regular audits to ensure adherence

**Living Document**:
- Guidelines evolve based on team feedback and project needs
- Continuous improvement encouraged
- Share knowledge through code reviews and documentation

**Runtime Guidance**:
- Development guidance documents in `docs/` directory
- Copilot instructions in `.github/copilot-instructions.md`
- Templates in `.specify/templates/` for consistent feature development

**Version**: 1.0.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-13
