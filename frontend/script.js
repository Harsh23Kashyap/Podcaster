
let API_KEY;

fetch('apikeys.json')
  .then(response => response.json())
  .then(data => {
    API_KEY = data.genai_api_key;
  })
  .catch(error => {
    console.error('Error fetching API key:', error);
  });

async function generateContent(userInput) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Given the following topic, create a list of 20 medium length and engaging loading screen messages that reflect key themes, emotions, or insights discussed.\n\nEach message should be action-driven (e.g., "Analyzing...", "Exploring..."), thematic to the content, and feel like progress is being made. Give them as an array of strings and no other text.\n\nTopic:\n${userInput}` }]
        }]
      })
    }
  );
  
  const data = await response.json();
  return data;
}

  
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    const advancedBtn = document.getElementById('advancedBtn');
    const advancedOptions = document.getElementById('advancedOptions');
    const generateBtn = document.getElementById('generateBtn');
    const contentInput = document.getElementById('contentInput');
    const discussionType = document.getElementById('discussionType');
    const tone = document.getElementById('tone');
    const length = document.getElementById('length');
    const chevronIcon = document.querySelector('.chevron-icon');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingMessage = document.querySelector('.loading-message');

    // Default loading messages
    const defaultLoadingMessages = [
        "Initializing podcast generation...",
        "Analyzing your content...",
        "Preparing the conversation...",
        "Setting up the discussion...",
        "Crafting engaging dialogue...",
        "Optimizing the conversation flow...",
        "Almost there..."
    ];

    // Add hover effect to option groups
    document.querySelectorAll('.option-group').forEach(group => {
        group.addEventListener('mouseenter', () => {
            group.style.transform = 'translateY(-2px)';
            group.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        });

        group.addEventListener('mouseleave', () => {
            group.style.transform = 'translateY(0)';
            group.style.boxShadow = 'none';
        });
    });

    
    // Toggle advanced options with animation
    advancedBtn.addEventListener('click', () => {
        advancedOptions.classList.toggle('show');
        chevronIcon.style.transform = advancedOptions.classList.contains('show') 
            ? 'rotate(180deg)' 
            : 'rotate(0deg)';
    });

    // Add focus effects to selects
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('focus', () => {
            select.parentElement.style.transform = 'translateY(-2px)';
        });

        select.addEventListener('blur', () => {
            select.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Handle form submission with enhanced feedback
    generateBtn.addEventListener('click', async () => {
        if (!contentInput.value.trim()) {
            contentInput.classList.add('error');
            setTimeout(() => contentInput.classList.remove('error'), 820);
            return;
        }

        const formData = {
            topicType: contentInput.value,
            discussionType: discussionType.value || "Basic",
            conversationTone: tone.value || "professional",
            discussionLength: length.value || "2 minutes"
        };

        // Show loading screen
        loadingScreen.style.display = 'flex';

        // Function to cycle through loading messages
        let currentMessageIndex = 0;
        let messageInterval;
        const cycleMessages = (messages) => {
            if (messages && messages.length > 0) {
                loadingMessage.textContent = messages[currentMessageIndex];
                currentMessageIndex = (currentMessageIndex + 1) % messages.length;
                messageInterval = setTimeout(() => cycleMessages(messages), 3000);
            }
        };

        // Start with default messages
        cycleMessages(defaultLoadingMessages);

        try {
            // Call the AI content generation function
            const loading_messages_response = await generateContent(contentInput.value);
            var stringlist = loading_messages_response.candidates[0].content.parts[0].text;
            // Trim unnecessary characters at the beginning and end of the stringlist
            stringlist = stringlist.trim();
            if (stringlist.startsWith('```javascript')) {
                stringlist = stringlist.slice(14);
            }
            if (stringlist.endsWith('```')) {
                stringlist = stringlist.slice(0, -3);
            }
            const loadingMessages = JSON.parse(stringlist);
            console.log('Loading Messages:', loadingMessages);

            // Clear the default message interval
            clearTimeout(messageInterval);
            
            // Start cycling through the actual messages
            cycleMessages(loadingMessages);

            const response = await fetch('http://127.0.0.1:8000/discussion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('API Response:', data);

            // Hide loading screen
            loadingScreen.style.display = 'none';
            clearTimeout(messageInterval);

            if (data.status === 'error') {
                // Show error state
                generateBtn.innerHTML = `
                    <span class="btn-content">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Error occurred
                    </span>
                `;

                // Reset button after delay
                setTimeout(() => {
                    generateBtn.innerHTML = originalContent;
                    generateBtn.disabled = false;
                }, 2000);
                return;
            }

            // Show success state and audio player
            generateBtn.innerHTML = `
                <span class="btn-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Generated Successfully!
                </span>
            `;

            // Create and show audio player
            const audioPlayer = document.createElement('div');
            audioPlayer.className = 'audio-player';
            audioPlayer.innerHTML = `
                <div class="audio-player-header">
                    <div class="audio-info">
                        <button class="control-btn back-btn" title="Back to Generator">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 12H5"></path>
                                <path d="M12 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <div class="audio-cover">
                            <div class="cover-image">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 18V5l12-2v13"></path>
                                    <circle cx="6" cy="18" r="3"></circle>
                                    <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                            </div>
                        </div>
                        <div class="audio-details">
                            <h3>Your Generated Podcast</h3>
                            <p class="audio-subtitle">Freshly created just for you</p>
                        </div>
                    </div>
                    <div class="audio-controls">
                        <button class="control-btn download-btn" title="Download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="audio-player-body">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                            <div class="progress-handle"></div>
                        </div>
                        <div class="time-display">
                            <span class="current-time">0:00</span>
                            <span class="duration">0:00</span>
                        </div>
                    </div>
                    <div class="player-controls">
                        <button class="control-btn skip-back-btn" title="Skip back 10 seconds">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 5v14"></path>
                                <path d="M21 12a9 9 0 0 0-9-9v9z"></path>
                                <path d="M12 12a9 9 0 0 0-9-9v9z"></path>
                            </svg>
                        </button>
                        <button class="control-btn prev-btn" title="Previous">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                        </button>
                        <button class="control-btn play-btn" title="Play">
                            <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        </button>
                        <button class="control-btn next-btn" title="Next">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                <line x1="19" y1="5" x2="19" y2="19"></line>
                            </svg>
                        </button>
                        <button class="control-btn skip-forward-btn" title="Skip forward 10 seconds">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 5v14"></path>
                                <path d="M3 12a9 9 0 0 1 9-9v9z"></path>
                                <path d="M12 12a9 9 0 0 1 9-9v9z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="volume-control">
                        <button class="control-btn volume-btn" title="Mute">
                            <svg class="volume-high" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                            <svg class="volume-mute" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                <line x1="17" y1="9" x2="23" y2="15"></line>
                            </svg>
                        </button>
                        <div class="volume-slider">
                            <div class="volume-progress">
                                <div class="volume-fill"></div>
                                <div class="volume-handle"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <audio class="podcast-audio">
                    <source src="${data.audio_url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;

            // Store the original button content
            const originalButtonContent = generateBtn.innerHTML;

            // Collapse the form and options
            const formContainer = document.querySelector('.container');
            if (formContainer) {
                formContainer.style.display = 'none';
            }
            
            // Center the audio player
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.style.display = 'flex';
                mainContainer.style.flexDirection = 'column';
                mainContainer.style.alignItems = 'center';
                mainContainer.style.justifyContent = 'center';
                mainContainer.style.minHeight = '100vh';
                mainContainer.style.padding = '2rem';
            }

            // Insert audio player
            if (mainContainer) {
                mainContainer.appendChild(audioPlayer);
            } else {
                document.body.appendChild(audioPlayer);
            }

            // Initialize audio player functionality
            const audio = audioPlayer.querySelector('.podcast-audio');
            const playBtn = audioPlayer.querySelector('.play-btn');
            const volumeBtn = audioPlayer.querySelector('.volume-btn');
            const progressBar = audioPlayer.querySelector('.progress-bar');
            const progressFill = audioPlayer.querySelector('.progress-fill');
            const progressHandle = audioPlayer.querySelector('.progress-handle');
            const currentTimeDisplay = audioPlayer.querySelector('.current-time');
            const durationDisplay = audioPlayer.querySelector('.duration');
            const volumeSlider = audioPlayer.querySelector('.volume-slider');
            const volumeFill = audioPlayer.querySelector('.volume-fill');
            const volumeHandle = audioPlayer.querySelector('.volume-handle');
            const skipBackBtn = audioPlayer.querySelector('.skip-back-btn');
            const skipForwardBtn = audioPlayer.querySelector('.skip-forward-btn');

            // Play/Pause functionality
            playBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    playBtn.querySelector('.play-icon').style.display = 'none';
                    playBtn.querySelector('.pause-icon').style.display = 'block';
                } else {
                    audio.pause();
                    playBtn.querySelector('.play-icon').style.display = 'block';
                    playBtn.querySelector('.pause-icon').style.display = 'none';
                }
            });

            // Skip forward/backward functionality
            skipBackBtn.addEventListener('click', () => {
                audio.currentTime = Math.max(0, audio.currentTime - 10);
            });

            skipForwardBtn.addEventListener('click', () => {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
            });

            // Update progress bar
            audio.addEventListener('timeupdate', () => {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = `${progress}%`;
                progressHandle.style.left = `${progress}%`;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
            });

            // Update duration display
            audio.addEventListener('loadedmetadata', () => {
                durationDisplay.textContent = formatTime(audio.duration);
            });

            // Progress bar click
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
            });

            // Volume control
            volumeBtn.addEventListener('click', () => {
                if (audio.volume > 0) {
                    audio.volume = 0;
                    volumeBtn.querySelector('.volume-high').style.display = 'none';
                    volumeBtn.querySelector('.volume-mute').style.display = 'block';
                    volumeFill.style.width = '0%';
                    volumeHandle.style.left = '0%';
                } else {
                    audio.volume = 1;
                    volumeBtn.querySelector('.volume-high').style.display = 'block';
                    volumeBtn.querySelector('.volume-mute').style.display = 'none';
                    volumeFill.style.width = '100%';
                    volumeHandle.style.left = '100%';
                }
            });

            // Volume slider
            volumeSlider.addEventListener('click', (e) => {
                const rect = volumeSlider.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.volume = pos;
                volumeFill.style.width = `${pos * 100}%`;
                volumeHandle.style.left = `${pos * 100}%`;
                if (pos === 0) {
                    volumeBtn.querySelector('.volume-high').style.display = 'none';
                    volumeBtn.querySelector('.volume-mute').style.display = 'block';
                } else {
                    volumeBtn.querySelector('.volume-high').style.display = 'block';
                    volumeBtn.querySelector('.volume-mute').style.display = 'none';
                }
            });

            // Helper function to format time
            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                seconds = Math.floor(seconds % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            // Add download functionality
            const downloadBtn = audioPlayer.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = data.audio_url;
                link.download = 'generated_podcast.mp3';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            // Add back button functionality
            const backBtn = audioPlayer.querySelector('.back-btn');
            backBtn.addEventListener('click', () => {
                // Show the form container again
                if (formContainer) {
                    formContainer.style.display = 'block';
                }
                
                // Reset main container styles
                if (mainContainer) {
                    mainContainer.style.display = 'block';
                    mainContainer.style.flexDirection = '';
                    mainContainer.style.alignItems = '';
                    mainContainer.style.justifyContent = '';
                    mainContainer.style.minHeight = '';
                    mainContainer.style.padding = '';
                }
                
                // Remove the audio player
                audioPlayer.remove();
                
                // Reset the generate button
                generateBtn.innerHTML = originalButtonContent;
                generateBtn.disabled = false;
            });

            // Reset button after delay
            setTimeout(() => {
                generateBtn.innerHTML = originalButtonContent;
                generateBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            
            // Hide loading screen
            loadingScreen.style.display = 'none';
            clearTimeout(messageInterval);
            
            // Show error state
            generateBtn.innerHTML = `
                <span class="btn-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Error occurred
                </span>
            `;

            // Reset button after delay
            setTimeout(() => {
                generateBtn.innerHTML = originalContent;
                generateBtn.disabled = false;
            }, 2000);
        }
    });

    // Check if we're on the home page by looking for the apiConfigBtn
    const apiConfigBtn = document.getElementById('apiConfigBtn');
    if (!apiConfigBtn) {
        console.log('Not on home page, skipping API configuration initialization');
        return;
    }
    
    console.log('Initializing API configuration...');
    
    const apiModal = document.getElementById('apiModal');
    const closeModal = document.querySelector('.close-modal');
    const saveApiKeysBtn = document.getElementById('saveApiKeys');
    const genaiApiKeyInput = document.getElementById('genaiApiKey');
    const segmindApiKeyInput = document.getElementById('segmindApiKey');
    const toggleVisibilityBtns = document.querySelectorAll('.toggle-visibility');

    // Verify all required elements exist
    if (!apiModal || !closeModal || !saveApiKeysBtn || !genaiApiKeyInput || !segmindApiKeyInput) {
        console.error('Missing required elements for API configuration');
        return;
    }

    console.log('Elements:', {
        apiConfigBtn,
        apiModal,
        closeModal,
        saveApiKeysBtn,
        genaiApiKeyInput,
        segmindApiKeyInput
    });

    // Load existing API keys
    async function loadApiKeys() {
        console.log('Loading API keys...');
        try {
            const response = await fetch('http://127.0.0.1:8000/api_keys');
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Failed to load API keys');
            }
            const data = await response.json();
            console.log('API Keys Data:', data);
            genaiApiKeyInput.value = data.genai_api_key;
            segmindApiKeyInput.value = data.segmind_api_key;
        } catch (error) {
            console.error('Error loading API keys:', error);
            genaiApiKeyInput.value = '';
            segmindApiKeyInput.value = '';
        }
    }

    // Show modal
    apiConfigBtn.addEventListener('click', async () => {
        console.log('API Config button clicked');
        await loadApiKeys();
        apiModal.classList.add('show');
        console.log('Modal shown');
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        apiModal.classList.remove('show');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === apiModal) {
            apiModal.classList.remove('show');
        }
    });

    // Toggle password visibility
    toggleVisibilityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            btn.innerHTML = isPassword ? 
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>` :
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>`;
        });
    });

    // Save API keys
    saveApiKeysBtn.addEventListener('click', async () => {
        const genaiApiKey = genaiApiKeyInput.value.trim();
        const segmindApiKey = segmindApiKeyInput.value.trim();

        if (!genaiApiKey || !segmindApiKey) {
            alert('Please enter both API keys');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api_keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    genai_api_key: genaiApiKey,
                    segmind_api_key: segmindApiKey
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'API keys saved successfully!');
                apiModal.classList.remove('show');
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to save API keys');
            }
        } catch (error) {
            console.error('Error saving API keys:', error);
            alert(`Failed to save API keys: ${error.message}`);
        }
    });
}); 

// API Configuration
class APIConfig {
    constructor() {
        this.modal = document.getElementById('apiModal');
        this.form = document.getElementById('apiConfigForm');
        this.openBtn = document.getElementById('apiConfigBtn');
        this.closeBtn = document.getElementById('closeApiModal');
        this.saveBtn = document.getElementById('saveApiKeys');
        this.genaiInput = document.getElementById('genaiApiKey');
        this.segmindInput = document.getElementById('segmindApiKey');
        this.toggleButtons = document.querySelectorAll('.toggle-password');
        this.notificationContainer = document.getElementById('notificationContainer');

        this.init();
    }

    async init() {
        if (!this.modal || !this.form || !this.openBtn) {
            console.log('Not on home page, skipping API configuration initialization');
            return;
        }

        this.setupEventListeners();
        await this.loadApiKeys();
    }

    setupEventListeners() {
        // Open modal
        this.openBtn.addEventListener('click', () => this.showModal());

        // Close modal
        this.closeBtn.addEventListener('click', () => this.hideModal());

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Toggle password visibility
        this.toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => this.togglePasswordVisibility(btn));
        });

        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApiKeys();
        });
    }

    async loadApiKeys() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api_keys');
            if (!response.ok) {
                throw new Error('Failed to load API keys');
            }
            const data = await response.json();
            this.genaiInput.value = data.genai_api_key || '';
            this.segmindInput.value = data.segmind_api_key || '';
        } catch (error) {
            console.error('Error loading API keys:', error);
            this.genaiInput.value = '';
            this.segmindInput.value = '';
            this.showNotification('Error', 'Failed to load API keys', 'error');
        }
    }

    async saveApiKeys() {
        const genaiApiKey = this.genaiInput.value.trim();
        const segmindApiKey = this.segmindInput.value.trim();

        if (!genaiApiKey || !segmindApiKey) {
            this.showNotification('Error', 'Please enter both API keys', 'error');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api_keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    genai_api_key: genaiApiKey,
                    segmind_api_key: segmindApiKey
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Success', result.message || 'API keys saved successfully!', 'success');
                this.hideModal();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to save API keys');
            }
        } catch (error) {
            console.error('Error saving API keys:', error);
            this.showNotification('Error', `Failed to save API keys: ${error.message}`, 'error');
        }
    }

    showModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? 
            `<svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>` :
            `<svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
    }

    showNotification(title, message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>` :
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`;

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        this.notificationContainer.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize API Configuration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new APIConfig();
});