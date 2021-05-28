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

let categories = [];
const Q_count = 6;
const Cat_count = 5;


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {

    let response = await axios.get(`http://jservice.io/api/categories`, {
        params: {
            count: 100
        }
    });
    let catIds = response.data.map(result => response.id);
    return _.sampleSize(catIds, Cat_count)

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
    let response = await axios.get(`http://jservice.io/api/clues?id=${catId}`)



    let cat = response.data;
    let allClues = cat.clues;
    let randomClues = _.sampleSize(allClues, Q_count);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }));

    return { title: cat.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $("jeopardy thead").empty();
    let $trow = $("<tr>");
    for (let categoryIdx = 0; categoryIdx < Cat_count; categoryIdx++) {
        $trow.append($("<th>").text(categories[categoryIdx].title));
    }
    $("#jeopardy thead").append($trow);

    $("#jeopardy tbody").empty();
    for (let i = 0; i < Q_count; i++) {
        let $trow = $("<tr>")
        for (let j = 0; j < Cat_count; j++) {


            $trow.append($("<td>").attr("id", `${j}-${i}`).text("?"))
        }
        $("#jeopardy tbody").append($trow);
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
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
    console.log([catId, clueId]);
    let msg;

    if (!clue.showing) {
        msg = clue.question;
        msg.showing = "question";

    }
    else if (clue.showing === "question") {
        msg = clue.answer;
        clue.showing = "answer"
    }
    else {
        return
    }
    $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let catIds = await getCategoryIds();
    categories = [];
    for (let catId of catIds) {
        categories.push(await getCategory(catId))
    }
    fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */
$("#restart").on('click', setupAndStart);

$(async function () {
    setupAndStart();
    $("#jeopardy").on('click', "td", handleClick);
}
);
