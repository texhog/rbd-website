# Resilience by Design - Game Website

A companion website for the Resilience by Design tabletop game focused on climate change planning, adaptation, and building community resilience.

## Features

- **Homepage**: Introduction to the game with overview of mechanics
- **Learn to Play**: Searchable rules with accordion sections
- **Score & Leaderboard**: Record game scores and view community rankings

## Quick Start

### Option 1: Open Locally

Simply open `index.html` in a web browser. The site works completely offline, though the leaderboard will only save locally.

### Option 2: Deploy to Netlify (Recommended)

1. Create a [GitHub](https://github.com) account if you don't have one
2. Create a new repository and upload all files
3. Go to [Netlify](https://netlify.com) and sign up with GitHub
4. Click "Add new site" → "Import an existing project"
5. Connect to GitHub and select your repository
6. Leave build settings as default and click "Deploy site"
7. Your site will be live in ~1 minute!

### Option 3: Deploy to GitHub Pages

1. Create a GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Under "Source", select "main" branch
5. Click Save
6. Your site will be available at `https://yourusername.github.io/repository-name`

## File Structure

```
rbd-website/
├── index.html          # Homepage
├── rules.html          # Learn to Play page
├── score.html          # Score & Leaderboard page
├── css/
│   └── styles.css      # All styles
├── js/
│   └── app.js          # All functionality
├── images/             # (Add game photos here)
├── SETUP.md            # Supabase database setup
└── README.md           # This file
```

## Setting Up the Leaderboard Database

The leaderboard can work in two modes:

1. **Local Storage (Default)**: Scores saved in browser only
2. **Supabase (Recommended)**: Scores shared across all users

To enable shared leaderboards, follow the instructions in `SETUP.md`.

## Customization

### Adding Game Photos

1. Add your images to the `images/` folder
2. Update `index.html` to reference them in the photos section

### Changing Colors

Edit the CSS variables at the top of `css/styles.css`:

```css
:root {
    --color-coral: #E07A5F;      /* Primary brand color */
    --color-navy: #1D3557;       /* Secondary brand color */
    /* ... etc */
}
```

### Adding More Hazards

Edit the hazard sections in `index.html` and `rules.html`.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This website is licensed under CC-BY-NC (Creative Commons Attribution-NonCommercial).

You are free to:
- Share — copy and redistribute the material
- Adapt — remix, transform, and build upon the material

Under the following terms:
- Attribution — You must give appropriate credit
- NonCommercial — You may not use the material for commercial purposes

## Credits

- Game Design: Resilience by Design team
- Website: Built for the RBD game community

## Support

Visit [resiliencebydesign.com](https://resiliencebydesign.com) for:
- Game purchase
- Workshop facilitation
- Contact information
