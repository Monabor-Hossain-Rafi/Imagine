const express = require('express');
const { client, GenerationStyle, Status } = require('imaginesdk');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Create the public directory if it does not exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Serve static files from the public directory
app.use(express.static('public'));

// Initialize the client with your API key
const imagine = client("");

app.get('/imagine', async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt query parameter is required' });
  }

  try {
    // Generate an image with the Imagine API
    const response = await imagine.generations(prompt, {
      style: GenerationStyle.IMAGINE_V5,
    });

    // Check if the request was successful
    if (response.status() === Status.OK) {
      const image = response.getOrThrow();
      const fileName = `output-${Date.now()}.png`;
      const filePath = path.join(publicDir, fileName);

      // Convert ArrayBuffer to Buffer
      const buffer = Buffer.from(image.buffer());

      // Save the image buffer to a file
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `${req.protocol}://${req.get('host')}/${fileName}`;
      res.json({ imageUrl });
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
