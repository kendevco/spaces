export async function analyzeImage(imageUrl: string, prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, prompt }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze image')
    }

    const data = await response.json()
    return data.analysis
  } catch (error) {
    console.error('Error analyzing image:', error)
    throw error
  }
}
