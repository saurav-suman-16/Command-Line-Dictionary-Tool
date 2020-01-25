const rp = require("request-promise");
const apiHost = "https://fourtytwowords.herokuapp.com";

const capitalizeWord = word => {
  const firstLetter = word.charAt(0);
  return word.replace(firstLetter, firstLetter.toUpperCase());
};

const getAntonymOrSynonym = (data, required) => {
  // Returns Antonyms or Synonyms
  return data[0] && data[0].relationshipType === required ? data[0].words : data[1] && data[1].words;
};

module.exports = apiKey => {
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
      //   console.log("Error while getting the required data. Please try again", error);
    }
  };

  const getDefinition = async (word, { dataRequired } = {}) => {
    // Gets and prints/returns all of the definitions of the given word.
    const definitions = await getDataFromApi(`word/${word}/definitions`);
    if (!definitions) {
      console.log("\nNo definition found");
      return;
    }
    if (dataRequired) {
      return { definitions };
    } else {
      console.log(`\n${capitalizeWord(word)} can be defined in the following ways.`);
      definitions.forEach(element => console.log(">>", element.text));
    }
  };

  const getExamples = async (word, { dataRequired } = {}) => {
    const { examples } = await getDataFromApi(`word/${word}/examples`);
    if (!examples) {
      console.log("\nNo examples found");
      return;
    }
    if (dataRequired) {
      return { examples };
    } else {
      console.log(`\nSome examples of ${capitalizeWord(word)} are.`);
      examples.forEach(element => console.log(">>", element.text));
    }
  };

  const getRelatedWords = async (word, { dataRequired, ant, syn } = {}) => {
    // Gets the synonyms and antonyms of the word.
    const relatedWords = await getDataFromApi(`word/${word}/relatedWords`);
    let returnData = {};
    if (ant) {
      let words = getAntonymOrSynonym(relatedWords, "antonym");
      if (words && words.length) {
        if (dataRequired) {
          returnData["ant"] = words;
        } else {
          console.log(`\nSome antonyms of ${capitalizeWord(word)} are: `);
          words.forEach(element => console.log(">>", element));
        }
      } else {
        console.log(`\nNo antonyms of ${capitalizeWord(word)} found.`);
      }
    }

    if (syn) {
      let words = getAntonymOrSynonym(relatedWords, "synonym");
      if (words && words.length) {
        if (dataRequired) {
          returnData["syn"] = words;
        } else {
          console.log(`\nSome synonyms of ${capitalizeWord(word)} are: `);
          words.forEach(element => console.log(">>", element));
        }
      } else {
        console.log(`\nNo antonyms of ${capitalizeWord(word)} found.`);
      }
    }

    if (dataRequired) {
      return returnData;
    }
  };

  const getAllData = async (word, { dataRequired } = {}) => {
    // Fetches all required data.
    await getDefinition(word, { dataRequired });
    await getRelatedWords(word, { ant: true, syn: true, dataRequired });
    await getExamples(word, { dataRequired });
  };

  const getRandomWord = async () => {
    // Get a random word and all of its data.
    const { word } = await getDataFromApi("words/randomWord");
    console.log("\nWord of the day:", capitalizeWord(word));
    await getAllData(word);
  };

  const play = async () => {
    // Play the game
  };

  return { getRandomWord, getDefinition, getRelatedWords, getExamples, getAllData, play };
};
