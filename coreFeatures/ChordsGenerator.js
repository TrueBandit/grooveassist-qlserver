import 'colors';
import 'dotenv/config';

// Assistant description for the OpenAI model to understand the context of the interaction
const assistant_description = `
  As a skilled music composer and producer, my role is to craft custom chord progressions based on specific parameters provided by users.
  These parameters play a crucial role in shaping the selection and structure of the chord progressions. 
  In instances where no specific guidelines are provided, I have the flexibility to improvise. After creating each chord progression, 
  I conduct a brief harmonic analysis. This analysis focuses on explaining the role of theoretical elements in the progression and how they contribute to evoking emotions. 
  It is important to note that my analysis will not merely restate the chord progression. 
  Instead, it will delve into the underlying musical theory. Moreover, for every chord progression created, 
  I will also identify and name a song that features a similar or identical chord progression, providing a practical reference for the users.
`;


// Custom function definition for OpenAI's function calling feature
const openai_functions_string = [{
  "name": "gen_chords",
  "description": "Get a list of chords and an explanation.",
  "parameters": {
    "type": "object",
    "properties": {
      "chords": {
        "type": "array",
        "description": "list of all the chords in the progression.",
        "items": {
          "type": "object",
          "properties": {
            "chord": {
              "type": "string",
              "description": "a chord (root and extension).",
            },
            "bars": {
              "type": "string",
              "description": "the number of bars the chord lasts.",
            }
          }
        }
      },
      "exp": {
        "type": "string",
        "description": "the explanation about the chord progression",
      },
      "song": {
        "type": "string",
        "description": "a song with the same or similar chord progression and how is it similar",
      },
      "brief": {
        "type": "string",
        "description": "a sentence describing the progression",
      }
    },
    "required": ["chords", "exp", "song", "brief"]
  }
}];

// Function to build the prompt for the OpenAI model
const buildPrompt = (promptObj) => {
  let { artist = '', genre = '', level = '', key = '', bars = '' } = promptObj;

  let query = "Generate a chord progression influenced by ";
  query += artist ? `that reflects the songs and writing style of ${artist}, ` : '';
  query += genre ? `using the chord extensions, form, and harmonies typically found in ${genre} music, ` : '';
  query += level ? `with chords, extensions and complexity that suits a ${level}-level player, ` : '';
  query += key ? `in the key of ${key}, ` : '';
  query += (bars && bars.length > 0) ? `consisting of ${bars} bars. ` : `consisting of 8 bars. `;
  query += "Additionally, provide: a song with a similar or the same chord progression for reference and a short 4-5 word sentence describing the progression for a generated progressions history list";

  return query;
};


// Function to handle streaming response from OpenAI
const generateChords = async (userInput) => {
  const prompt = buildPrompt(userInput);

  try {
    const response = await fetch(process.env.OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0613",
        max_tokens: 600,
        messages: [{ "role": "system", "content": assistant_description }, { role: "user", content: prompt }],
        functions: openai_functions_string,
        function_call: { "name": "gen_chords" },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const messageObject = data.choices[0].message;
    const argumentsJson = JSON.parse(messageObject.function_call.arguments);

    //console.log('Parsed Arguments:', argumentsJson);

    return {
      chords: argumentsJson.chords.map(chord => ({
        chord: chord.chord,
        bars: chord.bars
      })),
      exp: argumentsJson.exp,
      song: argumentsJson.song,
      brief: argumentsJson.brief,
    };


  } catch (error) {
    console.error("Error occurred while generating: ", error);
    return "Error occurred while generating.".red;
  }
};


// Exporting the generateAndStream function for external usage
export { generateChords };
