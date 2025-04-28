from fastapi import FastAPI, HTTPException
from typing import Optional
from pydantic import BaseModel
import google.generativeai as genai
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
# Load API keys from the JSON file
def load_api_keys():
    try:
        with open("../frontend/apikeys.json", "r") as f:
            api_keys = json.load(f)
        return api_keys
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load API keys: {str(e)}")

# Retrieve the API keys
api_keys = load_api_keys()

# Configure the generative AI with the loaded API key
genai.configure(api_key=api_keys["genai_api_key"])
model = genai.GenerativeModel('gemini-1.5-flash')

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class DiscussionRequest(BaseModel):
    topicType: str
    discussionType: Optional[str] = None
    conversationTone: Optional[str] = None
    discussionLength: Optional[str] = None

podcast_prompt = """
Act as a professional podcast scriptwriter.

Create a {podcast_type} podcast interview between two people: [S1] (the host) and [S2] (the guest).

They should be discussing {topic}.

Structure it as a {conversation_tone} where:

[S1] asks thoughtful, open-ended questions to explore the guest's childhood, struggles, breakthroughs, and mindset.

[S2] responds with detailed, emotional, and personal storytelling, using realistic expressions such as (laughs), (smiles), (exhales), etc., to make it feel authentic and human.

Format:

Dialogue lines should be tagged with [S1] and [S2].

Non-verbal cues should be written inside parentheses. Recognized tags include: (laughs), (clears throat), (sighs), (gasps), (coughs), (singing), (sings), (mumbles), (beep), (groans), (sniffs), (claps), (screams), (inhales), (exhales), (applause), (burps), (humming), (sneezes), (chuckle), (whistles).

Requirements:

Keep the entire conversation around {discussion_length} in speaking length.

Ensure the conversation flows smoothly — each answer should naturally inspire the next question.

Maintain a friendly, inspiring, yet serious and professional tone throughout.

End on a positive, forward-looking note, leaving the audience inspired.

Example style to follow:

[S1] Friendly, open-ended question

[S2] Personal, emotional, detailed answer
"""


@app.post("/discussion")
async def create_discussion(request: DiscussionRequest):
    """
    Create a discussion based on the provided parameters.
    
    Parameters:
    - topicType: The type of topic (required)
    - discussionType: The type of discussion (optional)
    - conversationTone: The tone of the conversation (optional)
    - discussionLength: The length of the discussion (optional)
    """
    topic = request.topicType
    discussion_type = request.discussionType
    conversation_tone = request.conversationTone
    discussion_length = request.discussionLength
    if discussion_type is None or discussion_type == "Basic":
        podcast_type = "introductory"
    elif discussion_type == "Advanced Analysis":
        podcast_type = "in-depth analysis"
    elif discussion_type == "Expert Deep Dive":
        podcast_type = "comprehensive exploration"
    else:
        podcast_type = "introductory"

    if conversation_tone is None:
        conversation_tone = "serious"
    elif conversation_tone == "funny":
        conversation_tone = "light & humorous"
    elif conversation_tone == "casual":
        conversation_tone = "casual & friendly"
    elif conversation_tone == "professional":
        conversation_tone = "business professional"
    else:
        conversation_tone = "serious"

    if discussion_length is None:
        discussion_length = "2 minutes"
    else:
        discussion_length = discussion_length

    response = model.generate_content(
    contents=[podcast_prompt.format(podcast_type=podcast_type, topic=topic, conversation_tone=conversation_tone, discussion_length=discussion_length)]
    )
    print(response.text)
    podcast_data = response.text
    
    # Generate podcast audio
    audio_file = generate_podcast_audio(podcast_data)
    # audio_file = "static/generated_podcast_audio.mp3"
    # Check if audio generation was successful
    if "Error" in audio_file:
        return {
            "status": "error",
            "message": "Failed to generate audio",
            "error": audio_file
        }
    
    # If successful, return success message with audio file path
    return {
    "status": "success",
    "message": "Discussion and audio generated successfully",
    "audio_url": f"http://127.0.0.1:8000/{audio_file}"
}



def generate_podcast_audio(podcast_data):
    """
    Generates audio for a given podcast data using the Segmind API.

    :param podcast_data: A dictionary containing the podcast text and other relevant information.
    :return: The filename of the generated audio file or an error message.
    """
    import requests

    api_key = api_keys["segmind_api_key"]
    url = "https://api.segmind.com/v1/dia"

    # Prepare the data to send to the API
    data = {'text': podcast_data, 'speed_factor': 0.9, 'cfg_scale': 2, 'temperature': 1.0}

    # Set the headers with your API key for authorization
    headers = {'x-api-key': api_key}
    # Send the POST request to the API
    response = requests.post(url, json=data, headers=headers)

    # Check if the response was successful
    if response.status_code == 200:
        print("Speech generation successful!")
        # Save the content to a file in the static folder, overwriting if it exists
        filename = "static/generated_podcast_audio.mp3"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Audio saved as '{filename}'")
        return filename
    else:
        error_message = f"Error: {response.status_code}, Response: {response.content}"
        print(error_message)
        return error_message

class ApiKeys(BaseModel):
    genai_api_key: str
    segmind_api_key: str


@app.post("/api_keys")
async def update_api_keys(api_keys: ApiKeys):
    try:
        # Create the directory if it doesn't exist
        # os.makedirs("../frontend", exist_ok=True)
        
        # Write the new API keys to the file
        with open("../frontend/apikeys.json", "w") as f:
            json.dump({
                "genai_api_key": api_keys.genai_api_key,
                "segmind_api_key": api_keys.segmind_api_key
            }, f, indent=4)
        print("API keys updated successfully")
        
        return {"message": "API keys updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api_keys")
async def get_api_keys():
    try:
        # Read the API keys from the file
        with open("../frontend/apikeys.json", "r") as f:
            api_keys = json.load(f)
        
        return api_keys
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 