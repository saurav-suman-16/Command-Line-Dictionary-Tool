const rp = require("request-promise");
const apiHost = "https://fourtytwowords.herokuapp.com";

const capitalizeWord = word => {
  const firstLetter = word.charAt(0);
  return word.replace(firstLetter, firstLetter.toUpperCase());
};

const getAntonymOrSynonym = ({ data = [], required }) => {
  // Returns Antonyms or Synonyms
  return data[0] && data[0].relationshipType === required ? data[0].words : data[1] && data[1].words;
};

module.exports = ({ apiKey, playGame }) => {
  const getDataFromApi = async route => {
    // Gets the data from the API using the route provided.
    const options = {
      uri: `${apiHost}/${route}`,
      qs: { api_key: apiKey },
      json: true
    };
    // console.log("Options", options);
    try {
      return await rp(options);
    } catch (error) {
      // console.log("Error while getting the required data. Please try again", error);
    }
  };

  const getDefinition = async (word, { dataRequired } = {}) => {
    // Gets and prints/returns all the definitions of the given word. It returns the data only when required by the calling functions else prints it.
    const definitions = await getDataFromApi(`word/${word}/definitions`);
    if (dataRequired) {
      return definitions ? definitions.map(element => element.text) : [];
    }
    if (!definitions) {
      console.log("\nNo definition found");
      return;
    }
    console.log(`\n${capitalizeWord(word)} can be defined in the following ways.`);
    definitions.forEach(element => console.log(">>", element.text));
  };

  const getExamples = async (word, { dataRequired } = {}) => {
    // Gets and prints/returns all the examples of the given word. It returns the data only when required by the calling functions else prints it.
    const { examples } = (await getDataFromApi(`word/${word}/examples`)) || {};
    if (dataRequired) {
      return examples ? examples.map(element => element.text) : [];
    }
    if (!examples) {
      console.log("\nNo examples found");
      return;
    }
    console.log(`\nSome examples of ${capitalizeWord(word)} are.`);
    examples.forEach(element => console.log(">>", element.text));
  };

  const getRelatedWords = async (word, { dataRequired, ant, syn } = {}) => {
    // Gets the synonyms and antonyms the word. It returns the data only when required by the calling functions else prints it.
    const relatedWords = await getDataFromApi(`word/${word}/relatedWords`);
    const returnData = {};
    if (ant) {
      let words = getAntonymOrSynonym({ data: relatedWords, required: "antonym" });
      if (words && words.length) {
        if (dataRequired) {
          returnData["ant"] = words;
        } else {
          console.log(`\nSome antonyms of ${capitalizeWord(word)} are: `);
          words.forEach(element => console.log(">>", element));
        }
      } else {
        !dataRequired && console.log(`\nNo antonyms found for: ${capitalizeWord(word)}.`);
      }
    }

    if (syn) {
      let words = getAntonymOrSynonym({ data: relatedWords, required: "synonym" });
      if (words && words.length) {
        if (dataRequired) {
          returnData["syn"] = words;
        } else {
          console.log(`\nSome synonyms of ${capitalizeWord(word)} are: `);
          words.forEach(element => console.log(">>", element));
        }
      } else {
        !dataRequired && console.log(`\nNo synonyms found for: ${capitalizeWord(word)}.`);
      }
    }

    return returnData;
  };

  const getAllData = async (word, { dataRequired } = {}) => {
    // Fetches all required data.
    const definitions = await getDefinition(word, { dataRequired });
    const relatedWords = await getRelatedWords(word, { ant: true, syn: true, dataRequired });
    const examples = await getExamples(word, { dataRequired });
    return { definitions, ...relatedWords, examples };
  };

  const getRandomWord = async ({ dataRequired } = {}) => {
    // Get a random word and all of its data.
    const { word } = (await getDataFromApi("words/randomWord")) || {};
    if (!word) {
      !dataRequired && console.log("Unable to get random word");
      return;
    }
    !dataRequired && console.log("\nWord of the day:", capitalizeWord(word));
    const data = await getAllData(word, { dataRequired });
    return { ...data, word };
  };

  const play = async () => {
    // Play the game
    let data = await getRandomWord({ dataRequired: true });
    if (!data) {
      console.log("Unable to start game.");
      return;
    }
    return await playGame(data);
  };

  return { getRandomWord, getDefinition, getRelatedWords, getExamples, getAllData, play };
};
