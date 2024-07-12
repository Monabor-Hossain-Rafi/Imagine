const express = require('express');
const { client, GenerationStyle, Status } = require('imaginesdk');

const app = express();
const port = 3000;

// Initialize the client with your API key
const imagine = client("vk-xpsTPXCB07sPA89cJ2dpewkgZ9311QjDI9xdTuZcKCF9sT");

app.get('/imagine', async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt query parameter is required' });
  }

  try {
    console.log('Starting image generation...');
    const startTime = Date.now();

    // Generate an image with the Imagine API
    const response = await imagine.generations(prompt, {
      style: GenerationStyle.IMAGINE_V5,
    });

    const endTime = Date.now();
    console.log(`Image generation completed in ${endTime - startTime}ms`);

    // Check if the request was successful
    if (response.status() === Status.OK) {
      const image = response.getOrThrow();
      const directDownloadUrl = image.url; // Assuming the API provides a direct download URL
      res.json({ imageUrl: directDownloadUrl });
    } else {
      const error = response.errorOrThrow();
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.listen(port, () => {
  console.log(`Imagine API server is running on http://localhost:${port}`);
});
