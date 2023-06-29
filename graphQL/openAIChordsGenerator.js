//import { Configuration, OpenAIApi } from 'openai'
import 'colors'
import pubSub from './pubsub.js'
import 'dotenv/config'

const assistant_description = "As an accomplished music composer and producer, you're skilled in creating custom chord progressions that meet various specifications from the user. If no guidelines are provided, you're free to improvise. Following each creation, you provide a brief harmonic analysis of the progression, explaining how theoretical elements influence and evoke emotions. Avoid restating the chord progression in your analysis. Always name a song that shares similarities with the created progression for reference."

const openai_functions_string = [{
  "name": "gen_chords",
  "description": "Get a list of chords and an explanation",
  "parameters": {
      "type": "object",
      "properties": {
          "chords": {
              "type": "array",
              "description": "list of all the chords in the progression",
              "items" : { "type": "object",
                          "properties": { 
                              "chord": {
                                "type": "string",
                                "description": "a chord (root and extension)",
                                },
                              "bars": {
                                  "type": "string",
                                  "description": "the number of bars the chord lasts",
                                }}}},
          "exp": {
            "type": "string",
            "description": "the explantion about the chord progression",}
      },
      "required": ["chords", "root", "bars", "explanation"]}
}];

const buildPrompt = (promptObj) => {

  let { artist = '', genre = '', level = '', key = '', bars = '' } = promptObj;

  if (bars === null || bars === undefined || bars === '') {
    bars = '8';
  }

  let query = "Generate a chord progression";
  if (artist) {
    query += ` that reflects the songs and writing style of ${artist}`;
  }
  if (genre) {
    query += ` using the chord extensions, form, and harmonies typically found in ${genre} music`;
  }
  if (level) {
    query += ` that is suitable for a ${level}-level player`;
  }
  if (key) {
    query += ` in the key of ${key}`;
  }
  query += ` that is ${bars} bars long. please attach explanation and example song`;

  return query;
};



const generateAndStream = async (userInput) => {
  
  const prompt = buildPrompt(userInput)

  try {
      const response = await fetch(process.env.OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-0613",
            messages: [{"role": "system", "content": assistant_description}, {role: "user", content: prompt}],
            stream: true,
            functions: openai_functions_string,
          function_call: {"name": "gen_chords"},
          }),
        });
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
    
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // Massage and parse the chunk of data
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          //DEBUG console.log(lines)
          const parsedLines = lines
            .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
            .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
            .map((line) => JSON.parse(line)); // Parse the JSON string
    
          for (const parsedLine of parsedLines) {
            const { choices } = parsedLine
            const { delta } = choices[0];
            const { function_call } = delta;
            // Update the UI with the new content
            if (function_call) {
              let lastBit = function_call.arguments.replace("\n", "").replace("\\", "");
              if (lastBit!== "" && lastBit!== " ") {
                //DEBUG console.log("*___"+lastBit.red+"___*")
                pubSub.publish('NEW_RESPONSE', { responseStream: lastBit });
              }
            }
          }
        }
        //DEBUG console.log("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-".bgYellow)
      } catch (error) {
          console.error("Error:", error);
          return "Error occurred while generating.";
      }
}

export { generateAndStream }
