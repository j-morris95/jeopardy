// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const API_URL = "https://jservice.io/api/";
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios.get(`${API_URL}categories`, {
    params: {
      count: 100,
    },
  });
  const categoryIds = response.data.map((category) => {
    return category.id;
  });
  return _.sampleSize(categoryIds, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get(`${API_URL}category`, {
    params: {
      id: catId,
    },
  });
  const title = response.data.title;
  //get NUM_QUESTION_PER_CAT random clues from response.data.clues
  const clues = _.sampleSize(response.data.clues, NUM_QUESTIONS_PER_CAT).map(
    (clue) => {
      return { question: clue.question, answer: clue.answer, showing: null };
    }
  );
  return { title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $("#jeopardy thead").empty();
  let $tr = $("<tr>");
  for (let category of categories) {
    $tr.append(`<th>${category.title}</th>`);
  }
  $("#jeopardy thead").append($tr);

  $("#jeopardy tbody").empty();
  for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
    $tr = $("<tr>");
    for (let x = 0; x < NUM_CATEGORIES; x++) {
      $tr.append(`<td id=${x}-${y}>$ ${(y + 1) * 100}</td>`);
    }
    $("#jeopardy tbody").append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const id = evt.target.id;
  const [catIdx, clueIdx] = id.split("-");
  const clickedClue = categories[catIdx].clues[clueIdx];
  if (clickedClue.showing === "question") {
    $(`#${id}`).html(clickedClue.answer);
    clickedClue.showing = "answer";
  } else if (clickedClue.showing === null) {
    $(`#${id}`).html(clickedClue.question);
    clickedClue.showing = "question";
  }
}

/** Remove the title image and show the game board and restart button*/
function hideTitleImage() {
  $("#img-container").toggleClass("hide");
  $("#restart").toggleClass("hide");
  $("#jeopardy").toggleClass("hide");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];
  const categoryIds = await getCategoryIds();
  for (let categoryId of categoryIds) {
    categories.push(await getCategory(categoryId));
  }
  fillTable();
}

/** On click of start / restart button, set up game. */
$("#restart").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */
$("#jeopardy tbody").on("click", "td", handleClick);

/** On page load, start game automatically*/
setupAndStart();

/** Hide title image on click */
$("#jeopardy-img").on("click", hideTitleImage);
