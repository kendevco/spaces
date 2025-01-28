import axios from 'axios';

export async function analyzeImage(imageUrl: string, prompt: string): Promise<string> {
  try {
    // Replace with your actual image analysis API endpoint and implementation
    const response = await axios.post('https://api.example.com/analyze-image', {
      imageUrl,
      prompt,
    });

    if (response.data && response.data.description) {
      return response.data.description;
    } else {
      throw new Error('No description returned from image analysis API');
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
