# RBD Game Images Index

## Folder Structure

```
images/
├── tokens/                    (6 files - 62 KB)
│   ├── volunteers.png         - Blue token
│   ├── knowledge.png          - Green token
│   ├── funding.png            - Red token
│   ├── materials.png          - Yellow token
│   ├── political-will.png     - Black token
│   └── wild-aid.png           - Gold token
│
├── cards/
│   ├── level1/                (40 files - 2.8 MB)
│   │   ├── volunteers-01.jpg through volunteers-08.jpg
│   │   ├── knowledge-01.jpg through knowledge-08.jpg
│   │   ├── funding-01.jpg through funding-08.jpg
│   │   ├── materials-01.jpg through materials-08.jpg
│   │   └── political-will-01.jpg through political-will-08.jpg
│   │
│   ├── level2/                (30 files - 2.3 MB)
│   │   ├── volunteers-01.jpg through volunteers-06.jpg
│   │   ├── knowledge-01.jpg through knowledge-06.jpg
│   │   ├── funding-01.jpg through funding-06.jpg
│   │   ├── materials-01.jpg through materials-06.jpg
│   │   └── political-will-01.jpg through political-will-06.jpg
│   │
│   ├── level3/                (20 files - 1.7 MB)
│   │   ├── volunteers-01.jpg through volunteers-04.jpg
│   │   ├── knowledge-01.jpg through knowledge-04.jpg
│   │   ├── funding-01.jpg through funding-04.jpg
│   │   ├── materials-01.jpg through materials-04.jpg
│   │   └── political-will-01.jpg through political-will-04.jpg
│   │
│   ├── level1-example-a.jpg   - Level 1 showcase
│   ├── level1-example-b.jpg
│   ├── level1-example-c.jpg
│   ├── level2-example-a.jpg   - Level 2 showcase
│   ├── level2-example-b.jpg
│   ├── level3-example-a.jpg   - Level 3 showcase
│   └── level3-example-b.jpg
│
├── backs/                     (3 files - 396 KB)
│   ├── level1-back.jpg        - Coral/red back
│   ├── level2-back.jpg        - Blue back
│   └── level3-back.jpg        - Teal back
│
└── logo-resilience.jpg        - Game logo
```

## Total: 107 images (~8 MB)

## Usage in Website

### Token images (homepage):
```html
<img src="images/tokens/volunteers.png" alt="Volunteers token">
```

### Project cards:
```html
<img src="images/cards/level1/volunteers-01.jpg" alt="Level 1 Volunteers Project">
```

### Card backs:
```html
<img src="images/backs/level1-back.jpg" alt="Level 1 card back">
```

## Compression Recommendations

Before deploying, compress images using:
- **TinyPNG** (tinypng.com) - Best for PNG files
- **Squoosh** (squoosh.app) - Google's tool, great for JPG
- **ImageOptim** (Mac app)

Target: Under 50KB per card image, under 10KB per token
