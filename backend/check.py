import requests

api_key = "SG_6352b06a7b1524ce"
url = "https://api.segmind.com/v1/dia"

# Prepare the data to send to the API
data = {}
data['text'] = "[S1] Segmind lets you build powerful image and video workflows — no code needed. \n [S2] Over 200 open and closed models. Just drag, drop, and deploy. \n [S1] Wait, seriously? Even custom models? \n [S2] Yup. Even fine-tuned ones. (chuckles) \n [S1] That's wild. I’ve spent weeks writing code for this. \n [S2] Now you can do it in minutes. Go try Segmind on the cloud. \n  [S1] I'm sold. Let’s go. (laughs)"

# Set the headers with your API key for authorization
headers = {'x-api-key': api_key}

# If there are no files to upload, use `json` to send the data as JSON
files = {}  # You can add files here if you are sending a voice sample for cloning

# Send the POST request to the API
response = requests.post(url, json=data, headers=headers)

# Check if the response was successful
if response.status_code == 200:
    print("Speech generation successful!")
    # Print the content or save it to a file depending on the response type (audio data)
    with open("generated_speech.mp3", "wb") as f:
        f.write(response.content)
    print("Audio saved as 'generated_speech.mp3'")
else:
    print(f"Error: {response.status_code}")
    print(f"Response: {response.content}")
