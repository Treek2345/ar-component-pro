# AR Component Pro - AI-Powered AR Analysis

<div align="center">
  <img src="logo.png" alt="AR Component Pro Logo" width="120" height="120" style="border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</div>

<p align="center">
  <strong>A revolutionary web application that uses Gemini 2.5 Flash Image Preview to provide true augmented reality overlays for identifying and analyzing components in circuit boards and engineering parts. Experience AR-like component detection with real-time camera integration!</strong>
</p>

## 🎬 Demo Video

<video width="100%" controls poster="logo.png">
  <source src="AR Component Pro AI-Powered AR Analysis video (1).mp4" type="video/mp4">
  <a href="AR Component Pro AI-Powered AR Analysis video (1).mp4">📥 Download Demo Video</a>
</video>

*Competition demo video - Shows AR Component Pro in action!*

## 🚀 Key Features

- **📷 Dual Mode Operation**: Image analysis + Live AR camera mode
- **🎯 AR Component Detection**: Real-time overlay on live camera feed
- **🧠 Gemini 2.5 Flash Integration**: Latest Nano Banana model
- **📱 Mobile Optimized**: Works on phones and tablets
- **⚡ Real-Time Processing**: Instant component identification
- **🎨 Interactive Overlays**: Clickable AR-style bounding boxes

## Features

- **Component Detection**: Upload images of circuit boards or engineering parts
- **AI-Powered Analysis**: Uses Gemini 2.5 Flash Image for accurate component identification
- **Interactive Overlays**: Visual highlights with clickable component information
- **Detailed Information**: Component names, descriptions, positions, and markings
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Quick Start (Recommended)
1. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new project or use existing one
   - Generate an API key from the API Keys section

2. **Configure the Application**:
   - The API key is already configured in `script.js`
   - Or replace `AIzaSyDQO1GCzWENmq9tW48mZqFOhglb5tkC0uc` with your own key

3. **Run the Application**:
   ```bash
   # Start local web server
   python -m http.server 8000

   # Open in browser
   # http://localhost:8000
   ```

### Option 2: Full Stack (Recommended for Production)
1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variable**:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```
   Or create a `.env` file with `GEMINI_API_KEY=your_api_key_here`

3. **Run the Backend**:
   ```bash
   python backend.py
   ```
   Backend will be available at http://localhost:5000

4. **Run the Frontend**:
   - Open `index.html` in a web browser
   - Or use the Python server: `python -m http.server 8000`
   - Frontend will be available at http://localhost:8000

### Quick Start Script
Run both servers simultaneously:
```bash
# Terminal 1 - Backend
python backend.py

# Terminal 2 - Frontend
python -m http.server 8000
```

## Usage

### Smart AR Query System

1. **Upload an Image**: Click "Choose Image" to select a circuit board or engineering part image
2. **Ask a Question**: Type your specific question in the query box, such as:
   - "What are the main components on this motherboard?"
   - "Show me the power supply connections"
   - "Identify the sensors in this assembly"
   - "What tools do I need to disassemble this?"
3. **Generate AR Overlay**: Click "🔍 Generate AR Overlay"
4. **View Results**: Nano Banana generates a custom AR overlay answering your question
5. **Interactive Experience**: The overlay appears as a transparent layer on your original image

### AR Camera Mode (Real-Time)

1. **Switch to AR Mode**: Click "📱 AR Overlay" button
2. **Open Camera**: Click "📹 Open Camera" and grant permissions
3. **Point & Capture**: Point your camera at engineering objects
4. **Ask Questions**: Use the query system with live camera feed
5. **Real-Time AR**: Get instant AR overlays on your camera view

### Example Queries

- **Component Identification**: "What are all the ICs and their functions?"
- **Assembly Guidance**: "Show me how to connect these wires"
- **Diagnostic Help**: "Highlight any damaged components"
- **Educational**: "Explain the data flow in this circuit"
- **Maintenance**: "What parts need regular replacement?"

## API Usage Notes

- Uses Gemini 2.5 Flash Image Preview model for advanced image analysis
- Processes images up to 800x600 pixels for optimal performance
- Full-stack version uses Python backend for secure API key handling
- Frontend-only version makes API calls client-side

## Supported Image Types

- Circuit boards (resistors, capacitors, ICs, connectors, etc.)
- Engineering parts (gears, motors, sensors, etc.)
- Assembly components (3D printer parts, mechanical components)

## Competition Submission

This project showcases:
- **Dynamic Creation**: AI-generated component overlays
- **Editing with Words**: Natural language component descriptions
- **Blending Realities**: AR-like overlay on real images
- **World Knowledge**: Accurate engineering component identification

## Technical Stack

- HTML5 Canvas for image manipulation and overlays
- Google Generative AI SDK for Gemini integration
- Vanilla JavaScript (ES6+)
- Responsive CSS with modern design

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

To modify the application:
- Edit `index.html` for structure changes
- Edit `styles.css` for styling updates
- Edit `script.js` for functionality changes

## License

This project is created for the Nano Banana competition and is available under MIT License.
