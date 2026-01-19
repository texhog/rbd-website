# CLAUDE.md - Development Documentation

This document captures the technical architecture, patterns, and practices used in the Resilience By Design (RBD) game website project.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Hosting**: Netlify (auto-deployment from GitHub)
- **Version Control**: Git + GitHub
- **Repository**: https://github.com/texhog/rbd-website
- **Live Site**: https://rbdgame.netlify.app

## Project Structure

```
/Users/brookshogya/Downloads/files/
├── index.html              # Homepage
├── rules.html              # Learn to Play page
├── score.html              # Scoring calculator page
├── css/
│   └── styles.css          # Main stylesheet with CSS variables
├── js/
│   └── app.js              # All JavaScript functionality
└── CLAUDE.md               # This file
```

## Architecture Decisions

### Why Vanilla JavaScript?

- **Simplicity**: No build tools, bundlers, or complex dependencies
- **Performance**: Fast page loads, no framework overhead
- **Maintainability**: Easy to understand and modify without framework knowledge
- **Deployment**: Simple git push → automatic Netlify deployment

### CSS Architecture

**CSS Custom Properties (Variables)**
All design tokens defined in `:root` at the top of `styles.css`:

```css
:root {
    /* Colors */
    --color-navy: #1e3a5f;
    --color-coral: #e07a5f;
    --color-light-blue: #EFF6FF;
    --color-green: #4CAF50;
    --color-red: #f44336;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Typography */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
}
```

**Benefits**:
- Consistent design system
- Easy theme modifications
- Single source of truth for styling
- Better developer experience

### Mobile-First Responsive Design

**Media Query Strategy**:
```css
/* Mobile styles: default (no media query) */
.element { ... }

/* Tablet and up */
@media (min-width: 768px) { ... }

/* Desktop and up */
@media (min-width: 1024px) { ... }
```

**Mobile-Specific Overrides** (when needed):
```css
@media (max-width: 768px) {
    /* Use !important sparingly, only when overriding existing rules */
    .search-input { font-size: 18px !important; }
}
```

### Accordion Pattern

**HTML Structure**:
```html
<div class="accordion active">
    <button class="accordion-header">
        <span>Section Title</span>
        <svg class="accordion-icon">...</svg>
    </button>
    <div class="accordion-content">
        <!-- Content goes here -->
    </div>
</div>
```

**CSS**:
```css
.accordion-content {
    display: none;
    padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.accordion.active .accordion-content {
    display: block;
}

.accordion.active .accordion-icon {
    transform: rotate(180deg);
}
```

**JavaScript**:
```javascript
const accordions = document.querySelectorAll('.accordion');
accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        accordion.classList.toggle('active');
    });
});
```

## Common Patterns

### Cache Busting for Deployments

When CSS/JS changes don't appear after deployment, increment version parameter:

```html
<link rel="stylesheet" href="css/styles.css?v=1000">
<script src="js/app.js?v=1000"></script>
```

This forces browsers to reload files instead of using cached versions.

### CSS Specificity Management

**Problem**: Multiple `.accordion-content` rules conflicting across pages.

**Solution**: Use scoped selectors or comment out conflicting rules:
```css
/* Score page specific - DISABLED to avoid conflict with rules page */
/* .accordion-content { max-height: 0; } */
```

**Better approach for multi-page sites**: Use page-specific classes:
```css
.score-page .accordion-content { ... }
.rules-page .accordion-content { ... }
```

### Mobile Scaling for Complex Layouts

**Problem**: Complex desktop layouts (like player mat diagrams) break on mobile.

**Traditional approach**: Reflow layout with flexbox/grid changes.

**Alternative approach**: Scale entire component down:
```css
@media (max-width: 768px) {
    .player-mat-diagram-new {
        transform: scale(0.5);
        transform-origin: top left;
        width: 200%;
        margin-bottom: calc(var(--spacing-xl) * -1);
    }
}
```

**When to use**:
- Complex diagrams or layouts that work better as "static images" on mobile
- When maintaining desktop structure is more important than mobile optimization
- User explicitly prefers tiny-but-complete over simplified mobile version

### Supabase Integration

**Client initialization**:
```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
```

**Variable naming**: Use `supabaseClient` instead of `supabase` to avoid conflicts with the global Supabase library object.

### Dynamic Calculations

**Pattern**: Real-time calculations as users input data.

**Implementation**:
```javascript
// Attach listeners to all input fields
document.querySelectorAll('.pts-input').forEach(input => {
    input.addEventListener('input', calculateTotals);
});

function calculateTotals() {
    // Perform calculations
    // Update display elements
}
```

**Debugging tip**: Add console.logs to trace calculation flow:
```javascript
console.log('Player scores:', playerScores);
console.log('Goals total:', goalsTotal);
console.log('Final total:', finalTotal);
```

## Development Workflow

### Local Development
1. Edit files in `/Users/brookshogya/Downloads/files/`
2. Open HTML files directly in browser or use local server
3. Test changes locally first

### Deployment Process

**IMPORTANT**: Commit and push immediately after every code change that works and won't break the app. Don't batch multiple changes—deploy frequently.

```bash
# 1. Stage changes
git add css/styles.css js/app.js

# 2. Commit with descriptive message
git commit -m "Description of changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 3. Push to GitHub immediately
git push

# 4. Wait 1-2 minutes for Netlify auto-deployment
```

### Debugging Production Issues

**Browser cache**: Always check if changes are actually deployed:
```bash
# Fetch live CSS to verify changes
curl https://rbdgame.netlify.app/css/styles.css | grep "specific-rule"
```

**Use browser DevTools**:
- Inspect element to see computed styles
- Check console for JavaScript errors
- Use Network tab to verify files are loading
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Common Issues and Solutions

### Issue: CSS Changes Not Appearing

**Cause**: Browser caching old files.

**Solutions**:
1. Increment cache-busting version: `?v=1001`
2. Hard refresh browser
3. Verify file is updated on Netlify: `curl https://rbdgame.netlify.app/css/styles.css`

### Issue: JavaScript Not Working After Refactor

**Cause**: Variable name conflicts (e.g., `supabase` vs `supabaseClient`).

**Solution**: Use unique variable names that don't conflict with library globals.

### Issue: Accordion Content Hidden

**Cause**: CSS rule with `max-height: 0` or `display: none` affecting all accordions.

**Solution**:
- Check for conflicting CSS rules
- Use browser DevTools to inspect computed styles
- Ensure JavaScript is toggling `active` class correctly

### Issue: Mobile Layout Breaks

**Causes**:
- Sticky positioning overlapping content
- Font sizes too small (iOS renders differently)
- Complex layouts collapsing incorrectly

**Solutions**:
- Use `position: static` on mobile
- Increase font sizes: 18px for inputs, 16px for body text
- Consider `transform: scale()` for complex layouts

## Best Practices

### CSS
- Define all design tokens in `:root`
- Use CSS custom properties for theming
- Mobile-first media queries
- Avoid `!important` unless overriding existing styles
- Group related styles with comments

### JavaScript
- Use `const` by default, `let` only when reassigning
- Attach event listeners in DOMContentLoaded
- Use descriptive variable names
- Add console.logs during development, remove in production
- Handle edge cases (null checks, empty inputs)

### Git Commits
- Write clear, descriptive commit messages
- Include context in commit body
- Reference issue/feature being addressed
- Include co-author attribution when applicable

### HTML
- Semantic markup (header, nav, main, section)
- Accessibility: ARIA labels, alt text, keyboard navigation
- Clear class names that describe purpose
- Cache-busting parameters on CSS/JS links

## Performance Considerations

### Why Vanilla JS is Fast
- No framework parsing/hydration
- Minimal JavaScript bundle size
- Direct DOM manipulation
- No virtual DOM overhead

### Optimization Techniques
- Minimize HTTP requests
- Use CSS transforms for animations (GPU accelerated)
- Lazy load images if needed
- Keep JavaScript files small and focused

## Future Considerations

### When to Consider a Framework
- Need for complex state management
- Multiple developers with varying skill levels
- Component reusability across many pages
- Need for server-side rendering

### Potential Improvements
- CSS: Consider utility classes for common patterns
- JavaScript: Modularize into separate files if it grows
- Build process: Add minification for production
- Testing: Add automated tests for calculations
- Accessibility: Comprehensive ARIA implementation

## Maintainer Notes

This project prioritizes simplicity and ease of maintenance over architectural complexity. The vanilla stack allows anyone with basic HTML/CSS/JS knowledge to contribute without framework-specific expertise.

When making changes:
1. Test locally first
2. Check mobile responsive behavior
3. Verify calculations still work
4. Update cache-busting versions
5. Document significant architectural changes here

## Contact & Resources

- **Repository**: https://github.com/texhog/rbd-website
- **Live Site**: https://rbdgame.netlify.app
- **Supabase Dashboard**: [Access through your account]
- **Netlify Dashboard**: [Access through your account]

---

*Last Updated: 2026-01-18*
*Maintained with assistance from Claude Sonnet 4.5*
