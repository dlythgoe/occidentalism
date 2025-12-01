# Image Cloud Viewer

A minimalist image gallery viewer with tag-based filtering and accompanying papers/essays section. Designed to be hosted on GitHub Pages.

## Folder Structure

\`\`\`
your-repo/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── app.js              # Application logic
├── README.md           # This file
├── data/
│   └── index.json      # Image metadata (edit this!)
└── images/
    ├── 1.jpg           # Your images go here
    ├── 2.jpg
    └── ...
\`\`\`

## Data Structure

The `data/index.json` file contains an array of image objects:

\`\`\`json
{
  "filename": "example.jpg",
  "title": "Image Title",
  "description": "A brief description of the image",
  "tags": ["tag1", "tag2", "tag3"],
  "date": "2024-01-15"
}
\`\`\`

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `filename` | string | Image filename (must match a file in `images/` folder) |
| `title` | string | Display title for the image |
| `description` | string | Brief description shown in tooltips and modal |
| `tags` | array | List of tags for filtering |
| `date` | string | Date in YYYY-MM-DD format |

## Updating from Excel

1. Create a spreadsheet with columns: `filename`, `title`, `description`, `tags`, `date`
2. For tags, separate multiple values with commas (e.g., "tag1, tag2, tag3")
3. Export as CSV
4. Convert to JSON using [csvjson.com](https://csvjson.com/csv2json)
5. Ensure tags are arrays, then save as `data/index.json`

## Controls

- **Click + Drag**: Pan across the canvas
- **Click Image**: Open enlarged modal view
- **Hover Image**: Show tooltip with details
- **Tag Buttons**: Filter images by tag
- **Clear Filters**: Reset all tag filters
- **Reset View**: Return to centered view

## Important

This app requires a web server (uses `fetch()` for JSON). Opening `index.html` directly with `file://` will NOT work. GitHub Pages provides the server automatically.

---

## Hosting on GitHub Pages

### Step 1: Create a GitHub Account
Go to [github.com](https://github.com) and sign up if needed.

### Step 2: Create a New Repository
1. Click "+" > "New repository"
2. Name it (e.g., `image-cloud-viewer`)
3. Keep it **Public**
4. Click "Create repository"

### Step 3: Upload Files
1. Click "Add file" > "Upload files"
2. Drag all files/folders: `index.html`, `style.css`, `app.js`, `README.md`, `data/`, `images/`
3. Click "Commit changes"

### Step 4: Enable GitHub Pages
1. Go to repo "Settings"
2. Click "Pages" in left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select `main` branch and `/ (root)`
5. Click "Save"

### Step 5: Access Your Site
Wait 1-2 minutes, then visit: `https://YOUR-USERNAME.github.io/REPO-NAME/`

To update later, edit files directly on GitHub or push changes locally.
