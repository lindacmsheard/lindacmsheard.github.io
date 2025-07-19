# Interactive Map Demo

A responsive web application for drawing bounding boxes on interactive maps using Leaflet.js, with coordinate display and export functionality.

## Features

✅ **Interactive Map**: Uses Leaflet.js with OpenStreetMap tiles  
✅ **Bounding Box Drawing**: Click and drag to create rectangles on the map  
✅ **High-Contrast Styling**: Thin, high-visibility lines optimized for accessibility  
✅ **Mobile Optimized**: Touch-friendly interface for mobile devices  
✅ **Coordinate Display**: Real-time display of bounding box coordinates  
✅ **Data Export**: Copy coordinates or export as JSON for database storage  
✅ **Fallback Support**: Works in testing environments without external CDN access

## Live Demo

The application is designed to work on GitHub Pages and any web server with internet access.

### Demo Screenshots

![Interactive Map Demo - Drawing Mode](https://github.com/user-attachments/assets/1d0b1277-80ca-47ef-b8ae-d8915a0b97ba)

![Interactive Map Demo - With Coordinates](https://github.com/user-attachments/assets/4d6c210d-5229-4cd6-9f38-016adb09c0ee)

## Usage

1. **Draw Bounding Box**: Click the "Draw Bounding Box" button to enter drawing mode
2. **Create Rectangle**: Click and drag on the map to draw a bounding box
3. **View Coordinates**: The coordinate panel will automatically appear showing:
   - North/South/East/West boundaries
   - Center coordinates
   - Area calculation in km²
4. **Export Data**: Use "Copy Coordinates" or "Export JSON" to save the data

### Keyboard Shortcuts

- `Ctrl/Cmd + D`: Toggle drawing mode
- `Ctrl/Cmd + X`: Clear all shapes
- `Ctrl/Cmd + Shift + C`: Copy coordinates
- `Escape`: Exit drawing mode

## Technical Details

### Dependencies

- **Leaflet.js 1.9.4**: Interactive map library (loaded from CDN)
- **Pure JavaScript**: No additional frameworks required
- **CSS3**: Modern styling with responsive design

### Browser Support

- Modern browsers with ES6+ support
- Mobile browsers with touch events
- Fallback functionality for environments without CDN access

### File Structure

```
interactive-map-demo/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── app.js             # JavaScript functionality
└── README.md          # Documentation
```

## Database Integration

The application exports data in a database-ready JSON format:

```json
{
  "id": "bbox_1234567890",
  "name": "Bounding Box 7/19/2025",
  "bounds": {
    "north": 40.7831,
    "south": 40.7489,
    "east": -73.9441,
    "west": -73.9927
  },
  "center": {
    "lat": 40.766,
    "lng": -73.9684
  },
  "area_km2": 2.45,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Recommended Database Solutions

1. **PostgreSQL with PostGIS**: For advanced geospatial queries and operations
2. **MongoDB**: For flexible JSON document storage with geospatial indexing
3. **SQLite with SpatiaLite**: For lightweight applications
4. **Cloud Solutions**: AWS DynamoDB, Google Cloud Firestore, or Firebase

### Sample Database Schema (PostgreSQL)

```sql
CREATE TABLE bounding_boxes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    north DECIMAL(10, 6) NOT NULL,
    south DECIMAL(10, 6) NOT NULL,
    east DECIMAL(10, 6) NOT NULL,
    west DECIMAL(10, 6) NOT NULL,
    center_lat DECIMAL(10, 6) NOT NULL,
    center_lng DECIMAL(10, 6) NOT NULL,
    area_km2 DECIMAL(12, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add geospatial index for efficient querying
CREATE INDEX idx_bounding_boxes_bounds ON bounding_boxes 
USING GIST (ST_MakeEnvelope(west, south, east, north, 4326));
```

## Development

### Local Testing

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open `http://localhost:8000` in your browser

### Deployment

The application is ready for deployment to:
- GitHub Pages
- Netlify
- Vercel
- Any static web hosting service

No build process is required - simply upload the files to your web server.

## Customization

### Map Styling

Modify the tile layer in `app.js`:

```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(this.map);
```

### Bounding Box Appearance

Adjust the styling in `app.js`:

```javascript
const rectangle = L.rectangle(bounds, {
    color: '#e74c3c',        // Border color
    weight: 2,               // Line thickness
    opacity: 1,              // Border opacity
    fillOpacity: 0.1,        // Fill opacity
    fillColor: '#e74c3c'     // Fill color
});
```

### Default Map Location

Change the initial map view in `app.js`:

```javascript
this.map = L.map('map').setView([latitude, longitude], zoomLevel);
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## Future Enhancements

- [ ] Multiple bounding box support
- [ ] Custom map tile layers
- [ ] Geofencing capabilities
- [ ] Advanced coordinate system support
- [ ] Integration with mapping APIs (Google Maps, Mapbox)
- [ ] Real-time collaboration features
- [ ] Shape editing and modification tools