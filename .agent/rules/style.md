# Design & Coding Guidelines

## Aesthetic: "Trading Arena / Cyber Terminal"
- **Theme**: Dark mode by default.
- **Panels**: Use glassmorphism (frosted glass) effects with subtle borders.
- **Colors**:
  - Primary: Green for profits/active (glowing effects).
  - Secondary: Red for losses/warnings.
  - Background: Deep dark blues/blacks with gradients.
- **Interactions**:
  - Every numerical change should have a micro-animation.
  - Hover effects on cards for depth.

## Frontend Best Practices
- Use React components for modularity.
- Prefer Tailwind utility classes for styling.
- Keep `framer-motion` animations smooth and not overly distracting.

## Backend Best Practices
- Use Pydantic models for request/response validation.
- Ensure all endpoints have proper error handling returned as JSON.
- Document logic within `main.py` or separate service files.
