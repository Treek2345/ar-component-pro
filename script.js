// Initialize Nano Banana (Gemini 2.5 Flash Image Preview)
let userApiKey = localStorage.getItem('geminiApiKey') || '';
let ai = userApiKey ? new window.GoogleGenAI({ apiKey: userApiKey }) : null;
const model = "gemini-2.5-flash-image-preview";

// DOM elements
const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const imageCanvas = document.getElementById('imageCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const videoElement = document.getElementById('videoElement');
const canvasContainer = document.querySelector('.canvas-container');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const componentsList = document.getElementById('componentsList');
const resultsTitle = document.getElementById('resultsTitle');
const queryInput = document.getElementById('queryInput');
const analyzeBtn = document.getElementById('analyzeBtn');

// Mode buttons
const imageModeBtn = document.getElementById('imageMode');
const arModeBtn = document.getElementById('arMode');
const cameraBtn = document.getElementById('cameraBtn');
const captureBtn = document.getElementById('captureBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const arControls = document.querySelector('.ar-controls');

let currentImage = null;
let currentMode = 'image'; // 'image' or 'ar'
let stream = null;
let isAnalyzing = false;
let chat = null; // For conversational AR editing

// Mode switching
imageModeBtn.addEventListener('click', () => switchMode('image'));
arModeBtn.addEventListener('click', () => switchMode('ar'));

// Camera and AR controls
cameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', captureAndAnalyze);
stopCameraBtn.addEventListener('click', stopCamera);

// Query and analysis
analyzeBtn.addEventListener('click', generateAROverlay);

// API Key management
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const apiKeyStatus = document.getElementById('apiKeyStatus');

saveApiKeyBtn.addEventListener('click', saveApiKey);

function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        showApiKeyStatus('Please enter a valid API key', 'error');
        return;
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith('AIza')) {
        showApiKeyStatus('Invalid API key format. Gemini API keys start with "AIza"', 'error');
        return;
    }

    // Save to localStorage
    userApiKey = apiKey;
    localStorage.setItem('geminiApiKey', userApiKey);

    // Initialize AI with new key
    ai = new window.GoogleGenAI({ apiKey: userApiKey });

    // Clear input and show success
    apiKeyInput.value = '';
    showApiKeyStatus('✅ API key saved successfully! You can now analyze images.', 'success');

    console.log('API key saved and AI initialized');
}

function showApiKeyStatus(message, type) {
    apiKeyStatus.textContent = message;
    apiKeyStatus.className = `api-key-status ${type}`;

    // Clear status after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            apiKeyStatus.textContent = '';
            apiKeyStatus.className = 'api-key-status';
        }, 5000);
    }
}

function showSuccess(message) {
    showApiKeyStatus(message, 'success');
}

// Smart query classification and suggestions
function classifyQuery(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('component') || lowerQuery.includes('part') || lowerQuery.includes('identify')) {
        return 'component_analysis';
    }
    if (lowerQuery.includes('work') || lowerQuery.includes('function') || lowerQuery.includes('operate')) {
        return 'functional_analysis';
    }
    if (lowerQuery.includes('material') || lowerQuery.includes('made') || lowerQuery.includes('construct')) {
        return 'material_analysis';
    }
    if (lowerQuery.includes('spec') || lowerQuery.includes('voltage') || lowerQuery.includes('dimension') || lowerQuery.includes('technical')) {
        return 'technical_analysis';
    }
    if (lowerQuery.includes('repair') || lowerQuery.includes('maintain') || lowerQuery.includes('fix')) {
        return 'maintenance_analysis';
    }

    return 'general_analysis';
}

function getQueryFocus(query) {
    const queryType = classifyQuery(query);
    const focusMap = {
        'component_analysis': 'identifying and describing components',
        'functional_analysis': 'explaining how the device operates',
        'material_analysis': 'analyzing materials and construction',
        'technical_analysis': 'providing technical specifications',
        'maintenance_analysis': 'guiding repair and maintenance',
        'general_analysis': 'comprehensive device analysis'
    };
    return focusMap[queryType] || 'general device analysis';
}

// Enhanced query suggestions with smart classification
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        queryInput.value = query;

        // Add visual feedback for query type
        const queryType = classifyQuery(query);
        console.log(`Query classified as: ${queryType}`);

        // Auto-submit after suggestion click
        setTimeout(() => analyzeBtn.click(), 100);
    });
});

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('theme') || 'light';

// Set initial theme
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeToggleButton();

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleButton();
});

function updateThemeToggleButton() {
    const isDark = currentTheme === 'dark';
    themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

// File upload handling
imageInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        fileName.textContent = `Selected: ${file.name}`;
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            displayImage(img);
            analyzeImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayImage(img) {
    const canvas = imageCanvas;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match image
    const maxWidth = 800;
    const maxHeight = 600;
    let { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);

    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
}

// Note: Analysis functionality removed to focus on AR generation
// The system now uses Nano Banana's image generation for AR overlays
async function analyzeImage(img) {
    // Placeholder - analysis now happens through AR generation
    console.log('Image loaded, ready for AR analysis');
}

function displayComponents() {
    componentsList.innerHTML = '';

    components.forEach((component, index) => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.innerHTML = `
            <h3>${component.name}</h3>
            <p><strong>Description:</strong> ${component.description}</p>
            <p class="component-position"><strong>Position:</strong> (${component.bbox.x}, ${component.bbox.y})</p>
            ${component.markings ? `<p><strong>Markings:</strong> ${component.markings}</p>` : ''}
        `;

        // Add click handler to highlight component
        card.addEventListener('click', () => highlightComponent(index));

        componentsList.appendChild(card);
    });
}

function drawOverlays() {
    if (!currentImage || components.length === 0) return;

    const canvas = imageCanvas;
    const ctx = canvas.getContext('2d');

    // Clear and redraw image
    displayImage(currentImage);

    // Draw overlays
    components.forEach((component, index) => {
        const bbox = component.bbox;

        // Scale bbox to canvas size
        const scaleX = canvas.width / currentImage.width;
        const scaleY = canvas.height / currentImage.height;

        const x = bbox.x * scaleX;
        const y = bbox.y * scaleY;
        const width = bbox.width * scaleX;
        const height = bbox.height * scaleY;

        // Draw rectangle
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.fillRect(x, y - 25, ctx.measureText(component.name).width + 10, 20);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(component.name, x + 5, y - 10);
    });
}

function highlightComponent(index) {
    const canvas = imageCanvas;
    const ctx = canvas.getContext('2d');

    // Clear and redraw
    displayImage(currentImage);
    drawOverlays();

    // Highlight selected component
    const component = components[index];
    const bbox = component.bbox;

    const scaleX = canvas.width / currentImage.width;
    const scaleY = canvas.height / currentImage.height;

    const x = bbox.x * scaleX;
    const y = bbox.y * scaleY;
    const width = bbox.width * scaleX;
    const height = bbox.height * scaleY;

    // Draw highlight
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // Scroll component card into view
    const cards = document.querySelectorAll('.component-card');
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

// AR Mode Functions
function switchMode(mode) {
    currentMode = mode;

    // Update button states
    imageModeBtn.classList.toggle('active', mode === 'image');
    arModeBtn.classList.toggle('active', mode === 'ar');

    // Update accessibility attributes
    imageModeBtn.setAttribute('aria-pressed', mode === 'image');
    arModeBtn.setAttribute('aria-pressed', mode === 'ar');

    // Clear current content
    clearCanvas();
    components = [];
    displayComponents();

    // Update UI based on mode
    if (mode === 'image') {
        resultsTitle.textContent = 'Identified Components';
        cameraBtn.classList.add('hidden');
        arControls.classList.add('hidden');
        videoElement.classList.add('hidden');
        imageCanvas.classList.remove('hidden');
    } else {
        resultsTitle.textContent = 'AR Component Detection';
        cameraBtn.classList.remove('hidden');
        videoElement.classList.add('hidden');
        imageCanvas.classList.add('hidden');
        overlayCanvas.classList.add('hidden');
    }

    // Stop camera if switching away from AR
    if (mode === 'image' && stream) {
        stopCamera();
    }
}

async function startCamera() {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Use back camera on mobile
            }
        });

        videoElement.srcObject = stream;
        videoElement.classList.remove('hidden');
        imageCanvas.classList.add('hidden');
        overlayCanvas.classList.remove('hidden');
        arControls.classList.remove('hidden');

        // Set canvas sizes to match video
        videoElement.onloadedmetadata = () => {
            overlayCanvas.width = videoElement.videoWidth;
            overlayCanvas.height = videoElement.videoHeight;
            imageCanvas.width = videoElement.videoWidth;
            imageCanvas.height = videoElement.videoHeight;
        };

        console.log('Camera started successfully');
    } catch (error) {
        console.error('Error accessing camera:', error);
        showError('Camera access denied. Please allow camera permissions.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    videoElement.classList.add('hidden');
    overlayCanvas.classList.add('hidden');
    arControls.classList.add('hidden');
    imageCanvas.classList.remove('hidden');

    // Clear overlay
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

async function captureAndAnalyze() {
    if (isAnalyzing) return;

    try {
        isAnalyzing = true;
        loadingText.textContent = 'Analyzing frame...';
        showLoading();

        // Capture current video frame
        const ctx = imageCanvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, imageCanvas.width, imageCanvas.height);

        // Convert to image for analysis
        const img = new Image();
        img.src = imageCanvas.toDataURL('image/jpeg');

        img.onload = async () => {
            currentImage = img;
            await analyzeImage(img);

            // Draw AR overlays on video
            drawAROverlays();

            isAnalyzing = false;
        };

    } catch (error) {
        console.error('Error capturing frame:', error);
        showError('Failed to capture frame');
        isAnalyzing = false;
    } finally {
        hideLoading();
        loadingText.textContent = 'Analyzing image...';
    }
}

function drawAROverlays() {
    if (components.length === 0) return;

    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw overlays on video
    components.forEach((component, index) => {
        const bbox = component.bbox;

        // Scale bbox to video size
        const scaleX = overlayCanvas.width / currentImage.width;
        const scaleY = overlayCanvas.height / currentImage.height;

        const x = bbox.x * scaleX;
        const y = bbox.y * scaleY;
        const width = bbox.width * scaleX;
        const height = bbox.height * scaleY;

        // Draw AR-style rectangle with glow effect
        ctx.shadowColor = '#667eea';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw label background with AR styling
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
        ctx.fillRect(x, y - 30, ctx.measureText(component.name).width + 20, 25);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(component.name, x + 10, y - 10);

        // Draw corner markers for AR effect
        drawARCornerMarkers(ctx, x, y, width, height);
    });
}

function drawARCornerMarkers(ctx, x, y, width, height) {
    const markerSize = 20;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(x, y + markerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + markerSize, y);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(x + width - markerSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + markerSize);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(x, y + height - markerSize);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + markerSize, y + height);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(x + width - markerSize, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - markerSize);
    ctx.stroke();
}

async function generateAROverlay() {
    if (!userApiKey) {
        showError('Please enter your Gemini API key first');
        apiKeyInput.focus();
        return;
    }

    if (!ai) {
        showError('API key not initialized. Please save your API key again.');
        return;
    }

    if (!currentImage) {
        showError('Please upload an image first');
        return;
    }

    const query = queryInput.value.trim();
    if (!query) {
        showError('Please enter a question about the image');
        return;
    }

    // Enhanced loading experience
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Generating...';

    showLoading();
    loadingText.textContent = '🤖 Nano Banana analyzing image...';

    // Add progress animation
    let progressStep = 0;
    const progressMessages = [
        '🤖 Nano Banana analyzing image...',
        '🔍 Identifying components...',
        '🎨 Generating AR overlay...',
        '✨ Applying professional styling...'
    ];

    const progressInterval = setInterval(() => {
        progressStep = (progressStep + 1) % progressMessages.length;
        loadingText.textContent = progressMessages[progressStep];
    }, 800);

    try {
        // Convert image to base64 for Nano Banana
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.drawImage(currentImage, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

        // JSON-structured prompt for consistent AR overlay generation
        const arPromptStructure = {
          task: {
            objective: `Generate professional AR overlay answering: "${query}"`,
            domain: "engineering component analysis",
            output: "semi-transparent AR overlay image"
          },
          style: {
            theme: "professional AR glasses interface",
            colorScheme: ["#0066FF", "#00CCFF", "#FFFFFF"],
            designLanguage: "modern, clean, technical",
            visualEffects: ["glowing rectangles", "corner markers", "subtle highlights"]
          },
          technical: {
            overlayType: "semi-transparent rectangles",
            transparency: "30-40%",
            markers: "professional corner brackets ┌───┐",
            typography: "clean sans-serif, white text",
            resolution: "high detail, crisp edges"
          },
          materials: {
            background: "original engineering image",
            overlay: "blue-tinted glass effect",
            components: "highlighted with glowing borders",
            text: "white professional labels"
          },
          environment: {
            context: "industrial engineering analysis",
            lighting: "neutral, professional",
            perspective: "direct overlay on existing image",
            atmosphere: "clean, technical workspace"
          },
          composition: {
            layout: "component-focused rectangles",
            hierarchy: "important components prominently highlighted",
            spacing: "professional, organized",
            balance: "clean, uncluttered design"
          },
          quality: {
            consistency: "uniform styling across all elements",
            professionalism: "enterprise-grade AR interface",
            accuracy: "precise component highlighting",
            reliability: "consistent output quality"
          }
        };

        // Smart query classification for enhanced analysis
        const queryType = classifyQuery(query);
        const queryFocus = getQueryFocus(query);

        // Adaptive prompt based on query type
        const adaptiveGuidance = {
            component_analysis: `
🔧 COMPONENT ANALYSIS FOCUS:
• Identify and highlight specific components mentioned in the query
• Provide detailed descriptions of each component's function
• Show relationships between components
• Use clear, labeled annotations for each part`,

            functional_analysis: `
⚙️ FUNCTIONAL ANALYSIS FOCUS:
• Explain how the device operates based on the query
• Show functional relationships between components
• Highlight operational mechanisms and processes
• Provide clear explanations of working principles`,

            material_analysis: `
🔬 MATERIAL ANALYSIS FOCUS:
• Analyze construction materials and methods
• Highlight material properties and quality indicators
• Show manufacturing techniques used
• Provide insights into material selection and durability`,

            technical_analysis: `
📊 TECHNICAL ANALYSIS FOCUS:
• Provide detailed specifications and measurements
• Show electrical/mechanical characteristics
• Highlight technical standards and compliance
• Include performance metrics and operating parameters`,

            maintenance_analysis: `
🛠️ MAINTENANCE ANALYSIS FOCUS:
• Identify repairable components and access points
• Show maintenance requirements and procedures
• Highlight potential failure points
• Provide repair guidance and tool requirements`,

            general_analysis: `
🔍 GENERAL ANALYSIS FOCUS:
• Provide comprehensive overview of the device
• Highlight key features and capabilities
• Show important components and their relationships
• Offer balanced technical and functional insights`
        };

        // Convert JSON structure to optimized natural language prompt
        const prompt = `
🎯 ANALYSIS OBJECTIVE:
${arPromptStructure.task.objective}
Query Type: ${queryType.replace('_', ' ').toUpperCase()}
Focus Area: ${queryFocus}

${adaptiveGuidance[queryType] || adaptiveGuidance.general_analysis}

🎨 VISUAL STYLE REQUIREMENTS:
• Theme: ${arPromptStructure.style.theme}
• Colors: ${arPromptStructure.style.colorScheme.join(', ')}
• Design: ${arPromptStructure.style.designLanguage}
• Effects: ${arPromptStructure.style.visualEffects.join(', ')}

📋 TECHNICAL SPECIFICATIONS:
• Overlay: ${arPromptStructure.technical.overlayType}
• Transparency: ${arPromptStructure.technical.transparency}
• Markers: ${arPromptStructure.technical.markers}
• Typography: ${arPromptStructure.technical.typography}

✨ QUALITY ASSURANCE:
• Consistency: ${arPromptStructure.quality.consistency}
• Professionalism: ${arPromptStructure.quality.professionalism}
• Accuracy: ${arPromptStructure.quality.accuracy}

Create a professional AR overlay that specifically addresses: "${query}"
Focus on providing clear, actionable information that directly answers the user's question.`;

        // Use Nano Banana to generate AR overlay
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: imageData,
                    },
                },
            ],
        });

        // Process the generated AR overlay
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                // Create data URL for the generated overlay
                const overlayDataURL = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

                // Load and apply the AR overlay
                const overlayImg = new Image();
                overlayImg.onload = () => {
                    applyAROverlay(overlayImg);
                    resultsTitle.textContent = `AR Analysis: "${query}"`;
                };
                overlayImg.src = overlayDataURL;
                break;
            }
        }

    } catch (error) {
        console.error('Error generating AR overlay:', error);
        showError(`AR generation failed: ${error.message}`);
    } finally {
        clearInterval(progressInterval);
        hideLoading();
        loadingText.textContent = 'Analyzing image...';
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Generate AR Overlay';
    }
}

function applyAROverlay(overlayImg) {
    const ctx = overlayCanvas.getContext('2d');

    // Set overlay canvas to match original image size
    overlayCanvas.width = currentImage.width;
    overlayCanvas.height = currentImage.height;

    // Clear any existing overlay
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw the AR overlay image
    ctx.drawImage(overlayImg, 0, 0, overlayCanvas.width, overlayCanvas.height);

    // Make sure overlay canvas is visible
    overlayCanvas.classList.remove('hidden');

    // Update results section
    componentsList.innerHTML = `
        <div class="component-card">
            <h3>AR Overlay Generated</h3>
            <p><strong>Query:</strong> ${queryInput.value}</p>
            <p><strong>Status:</strong> AR overlay successfully applied to image</p>
            <p>The generated overlay provides visual information answering your specific question about the engineering components.</p>
        </div>
    `;
}

function clearCanvas() {
    const ctx1 = imageCanvas.getContext('2d');
    const ctx2 = overlayCanvas.getContext('2d');

    ctx1.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx2.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    currentImage = null;
    components = [];
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Component Identifier initialized');

    // Set initial mode
    switchMode('image');
});
