const inquirer = require("inquirer");
const hintsType = ["definitions", "syn", "jumbled"];
const hintsData = { jumbled: [] };
const answers = [];
let requiredWord = "";

const showAnswer = ({ word, syn, ant, definitions, examples }) => {
  // This function displays all the required data of the word.
  console.log("\nThe answer is:", word);
  console.log("\nIt can be defined in the following ways:");
  definitions.forEach(definition => console.log(">>", definition));
  console.log("\nIts synonyms are:");
  syn.forEach(element => console.log(">>", element));
  if (ant && ant.length) {
    console.log("\nIts antonyms are:");
    ant.forEach(element => console.log(">>", element));
  }
  console.log("\nFollowing are some of the use cases of the word:");
  examples.forEach(example => console.log(">>", example));
  return;
};

const getJumbledWord = (counter = 0) => {
  // This function returns the jumbled word. If the jumbled word has already been tried then it retries 50 times.
  let arr = requiredWord.split("");
  arr.sort(() => Math.random() - 0.5);
  const jumbledWord = arr.join("");
  if (hintsData.jumbled.includes(jumbledWord)) {
    if (counter === 50) {
      // Removes the JUMBLED hint type form the array as no unique jumbled word can be found in 50 iterations
      hintsType.pop();
      return;
    }
    counter++;
    return getJumbledWord(counter);
  } else {
    hintsData.jumbled.push(jumbledWord);
    return jumbledWord;
  }
};

const getRandomHint = ({ first }) => {
  //Get hint from one of the hint types. Remove the hint that is once used. Will remove the hint type when no hints remain in that type
  let multiplier = first ? hintsType.length - 1 : hintsType.length;
  let hintType = hintsType[Math.floor(Math.random() * multiplier)];
  let hint;
  if (hintType === "jumbled") {
    hint = getJumbledWord();
  } else if (hintsData[hintType].length) {
    let hintArr = hintsData[hintType];
    // Remove the hint from the array
    hint = hintArr.splice(Math.floor(Math.random() * hintArr.length), 1);
    if (hintArr.length === 0) {
      // Remove the hint type when there are no hints in the array of that type
      hintsType.splice(hintType.indexOf(hintType), 1);
    }
  }
  return { hint, hintType };
};

const offerChoices = async ({ question, params }) => {
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Choose one of the following to continue.(Use K and J if having issue with arrow keys.)",
      choices: ["Try Again", "Hint", "Quit"]
    }
  ]);
  console.log("choice", choice);
  if (choice === "Try Again") {
    return await askQuestion({ question, params });
  } else if (choice === "Hint") {
    return await start(params);
  } else {
    return showAnswer(params);
  }
};

const askQuestion = async ({ question, params }) => {
  // Prompts the question and checks the answer.
  const { answer } = await inquirer.prompt([{ name: "answer", message: question }]);
  if (answers.includes(answer.trim().toLowerCase())) {
    console.log("\nSUCCESS!! You guessed the write answer!");
    return;
  } else {
    console.log("\nWrong Answer!");
    return await offerChoices({ question, params });
  }
};

const start = async ({ first, ...params }) => {
  // This functions keeps the flow going. It gets a new unique hint and asks the question, if there are no hint left then it displays the answer.
  let { hint, hintType } = getRandomHint({ first });
  if (!hint) {
    console.log("\nNo more hints left for this question!");
    return showAnswer(params);
  }
  let question = hint;
  if (hintType === "ant") {
    question = "Antonym of: " + hint;
  }
  if (hintType === "syn") {
    question = "Synonym of: " + hint;
  }
  if (hintType === "jumbled") {
    question = "Jumbled word: " + hint;
  }
  if (hintType === "definitions") {
    question = "Can be defined as: " + hint;
  }
  return await askQuestion({ question, params });
};

const playGame = async params => {
  // This function controls the flow of the game
  const { definitions, ant, syn, word } = params;
  // Making a copy of word data in hintsData so that original data will not be changed when removing the shown hint from the list
  hintsData["definitions"] = definitions.map(element => element.split(":")[0]);
  hintsData["syn"] = [...syn];
  hintsData["jumbled"].push(word);
  if (ant) {
    hintsType.unshift("ant");
    hintsData["ant"] = [...ant];
  }
  requiredWord = word;
  answers.push(...syn, word);
  console.log("\nGuess the word. You will now be shown a Definition/an Antonym/a Synonym, You have to guess the word.");
  return await start({ first: true, ...params });
};

module.exports = playGame;
