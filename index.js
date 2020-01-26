#!/usr/bin/env node
const { apiKey } = require("./config.json");
const playGame = require("./play");
const { getRandomWord, getDefinition, getRelatedWords, getExamples, getAllData, play } = require("./commands")({
  apiKey,
  playGame
});

const processArgs = async () => {
  // Get the arguments being given.
  const args = process.argv;
  // Remove the first two arguments as exec path and file path are not required
  args.splice(0, 2);
  if (!args.length) {
    //If no argument is passed then get a random word with all the info.
    await getRandomWord();
  } else {
    //Get the first argument as is it defines the operation to be performed.
    const command = args[0].toLowerCase();
    switch (command) {
      case "defn":
        await getDefinition(args[1].toLowerCase()); // Displays all definitions of the word
        break;
      case "syn":
        await getRelatedWords(args[1].toLowerCase(), { syn: true }); // Displays all the synonyms of the word
        break;
      case "ant":
        await getRelatedWords(args[1].toLowerCase(), { ant: true }); // Displays all the antonyms of the word
        break;
      case "ex":
        await getExamples(args[1].toLowerCase()); // Displays all the examples of the word
        break;
      case "play":
        await play(); // Starts an interactive game
        break;
      default:
        await getAllData(command); // Displays all the info of the word. The default case treats the command as a word.
    }
  }
};

processArgs();
