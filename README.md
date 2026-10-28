## Folder Structure

```
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
```

## Data Structure

The `data/index.json` file contains an array of image objects:

```json
{
  "filename": "example.jpg",
  "title": "Image Title",
  "description": "A brief description of the image",
  "tags": ["tag1", "tag2", "tag3"],
  "credit": "Artist/Copyright-holder, Medium/Material, Place, Year"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `filename` | string | Image filename (must match a file in `images/` folder) |
| `title` | string | Display title for the image |
| `description` | string | Brief description shown in tooltips and modal |
| `tags` | array | List of tags for filtering |
| `credit` | string | Credit line: "Artist/Copyright-holder, Medium/Material, Place, Year" |

## Updating from Excel

1. Create a spreadsheet with columns: `filename`, `title`, `description`, `tags`, `credit`
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
