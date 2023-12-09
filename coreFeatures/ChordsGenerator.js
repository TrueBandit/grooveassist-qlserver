import 'colors';
import 'dotenv/config';
import pubSub from '../configs/pubsub.js';
import { Configuration, OpenAIApi } from 'openai';

// Function to build the prompt string based on user input
const buildPrompt = (promptObj) => {
  // Destructuring input with default values
  let { artist = '', genre = '', level = '', key = '', bars = '' } = promptObj;

  // Building the base query
  let query = "Generate a chord progression ";

  // Adding conditions based on input
  query += artist ? `that reflects the songs and writing style of ${artist}, ` : '';
  query += genre ? `using the chord extensions, form, and harmonies typically found in ${genre} music, ` : '';
  query += level ? `with chords, extensions and complexity that suits a ${level}-level player, ` : '';
  query += key ? `in the key of ${key}, ` : '';
  query += (bars && bars.length > 0) ? `consisting of ${bars} bars. ` : `consisting of 8 bars. `;

  return query;
};

// Additional part of the prompt to ensure output structure
const prompt_annex = `
  Ensure the output contains the following data:
    How many bars each chord lasts, 
    An harmonic explanation behind the progression, 
    A song with the same progression, even in another key,
    and a 4-5 words for a brief description of the progression.

  Follow this pydantic specification for output.

  class Chord(Basemodel):
      chord_name: str
      notes: conlist(item_type=str)
      bars: str

  class Progression(Basemodel):
      chords: conlist(item_type=Chord)
      explanation: str
      similar_song: str
      brief_description: str
  `;

// Configuration for OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_GPT4_KEY
});

// Initializing OpenAI API client
const openai = new OpenAIApi(configuration);

// Asynchronous function to generate chords
async function generateChords(userInput, requestID) {
  try {
    // Building the final prompt
    const user_prompt = buildPrompt(userInput);
    const final_prompt = user_prompt + prompt_annex;

    // Making API request to OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4-1106-preview",
      response_format: { "type": "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: "Please output valid JSON" },
        { role: "user", content: final_prompt }
      ]
    });

    // Error handling for invalid API response
    if (!completion.data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    // Parsing the response
    const response = JSON.parse(completion.data.choices[0].message.content);
    const final_response = {
      chords: response.chords.map(chord => ({
        chord_name: chord.chord_name,
        notes: chord.notes,
        bars: chord.bars
      })),
      explanation: response.explanation,
      similar_song: response.similar_song,
      brief_description: response.brief_description,
    }

    pubSub.publish(requestID, { generatedProg: final_response });

  } catch (error) {
    // Handling errors and logging
    console.error(`Error occurred: ${error.message}`.red);
    return { error: 'An error occurred while generating chords.' };
  }
}

// Exporting the generateChords function
export { generateChords };