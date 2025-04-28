# Text-to-Podcast Converter

A web application that converts text content into human-like podcast audio using advanced AI technologies.

## Features

- Convert any text content into natural-sounding podcast audio using DIa TTS
- AI-powered text processing with Gemini
- Customizable voice options and speaking styles
- Web-based interface for easy text input and audio generation
- Real-time processing and audio preview
- Support for various text formats and lengths

## Project Structure

```
.
├── frontend/              # Frontend web application
│   ├── index.html        # Main landing page
│   ├── generator.html    # Text-to-podcast generation page
│   ├── script.js         # Frontend JavaScript logic
│   ├── styles.css        # Main stylesheet
│   ├── home.css          # Home page specific styles
│   └── apikeys.json      # API key configuration
└── backend/              # Backend server
    ├── main.py          # Main server application
    ├── check.py         # API key verification
    ├── requirements.txt # Python dependencies
    └── static/          # Static files
```

## Prerequisites

- Python 3.8 or higher
- Node.js (for frontend development)
- Modern web browser
- API keys for:
  - [DIa TTS API Key](https://cloud.segmind.com/console/api-keys) (Free tier available)
  - [Gemini API Key](https://aistudio.google.com/app/apikey)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Podcasts
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Configure API keys:
   - Copy `frontend/apikeys.json` to `frontend/apikeys.json`
   - Add your API keys to the configuration file:
     - Get your DIa TTS API key from [Segmind Console](https://cloud.segmind.com/console/api-keys)
     - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Usage

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Open the frontend in your web browser:
   - Navigate to `http://localhost:3000` (or the specified port)
   - Enter your text in the input field
   - Select voice preferences
   - Click "Generate Podcast" to create the audio

3. Download or play the generated podcast audio

## API Configuration

The application requires the following API keys to be configured in `frontend/apikeys.json`:

- DIa TTS API key (from Segmind)
- Gemini API key (from Google AI Studio)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [DIA TTS](https://cloud.segmind.com/console/api-keys) for text-to-speech technology
- [Gemini](https://aistudio.google.com/app/apikey) for AI text processing
- [Other dependencies and services used]

## Support

For support, please open an issue in the repository or contact the maintainers.# Podcaster
