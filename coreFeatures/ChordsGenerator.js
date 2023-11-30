import 'colors';
import 'dotenv/config';
import { Configuration, OpenAIApi } from 'openai';

const buildPrompt = (promptObj) => {
  let { artist = '', genre = '', level = '', key = '', bars = '' } = promptObj;
  let query = "Generate a chord progression ";
  query += artist ? `that reflects the songs and writing style of ${artist}, ` : '';
  query += genre ? `using the chord extensions, form, and harmonies typically found in ${genre} music, ` : '';
  query += level ? `with chords, extensions and complexity that suits a ${level}-level player, ` : '';
  query += key ? `in the key of ${key}, ` : '';
  query += (bars && bars.length > 0) ? `consisting of ${bars} bars. ` : `consisting of 8 bars. `;
  return query;
};

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
    `

const configuration = new Configuration({
  apiKey: process.env.OPENAI_GPT4_KEY
});

const openai = new OpenAIApi(configuration);

async function generateChords(userInput) {

  const user_prompt = buildPrompt(userInput);
  const final_prompt = user_prompt + prompt_annex

  const completion = await openai.createChatCompletion({
    model: "gpt-4-1106-preview",
    response_format: { "type": "json_object" },
    temperature: 0.7,
    messages: [
      { role: "system", content: "Please output valid JSON" },
      { role: "user", content: final_prompt }
    ]
  });

  const response = JSON.parse(completion.data.choices[0].message.content);

  return {
    chords: response.chords.map(chord => ({
      chord_name: chord.chord_name,
      notes: chord.notes,
      bars: chord.bars
    })),
    explanation: response.explanation,
    similar_song: response.similar_song,
    brief_description: response.brief_description,
  }
}


export { generateChords };

