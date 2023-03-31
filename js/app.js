import {arrayUnique, hexToRgb} from "js/utils.js";

const FRAME_WIDTH = 750,
	  FRAME_HEIGHT = 750;

let size = document.getElementById("board-size").value;

let boxWidth = (FRAME_WIDTH / size),
	boxHeight = (FRAME_HEIGHT / size);

let player = "",
	played = {},
	turns = 0,
	won = {},
	nextPlay = "",
	filled = [],
	xColor = "rgba(169, 169, 170, 0.3)",
	oColor = "rgba(2, 45, 15, 0.3)";

let inProgress = true;

function newGame() {
	document.getElementById("main-board").innerHTML = "";

	size = document.getElementById("board-size").value;

	boxWidth = (FRAME_WIDTH / size),
	boxHeight = (FRAME_HEIGHT / size);

	player = "x";
	played = {};
	turns = 0;
	won = {};
	nextPlay = "";
	filled = [];

	if (document.getElementById("x-color").value != "#ffffff") {
		xColor = "rgba(" + hexToRgb(document.getElementById("x-color").value) + ", 0.3)";
	}
	if (document.getElementById("o-color").value != "#ffffff") {
		oColor = "rgba(" + hexToRgb(document.getElementById("o-color").value) + ", 0.3)";
	}

	inProgress = true;

	makeBoard();
}

function gameWon() {
	d3.selectAll(".highlighted").classed("highlighted", false);

	d3.select("#main-board").append("div")
			.attr("class", "screen")
			.style("width", FRAME_WIDTH + 25 + "px")
			.style("height", FRAME_HEIGHT + 25 + "px");

	d3.select("#main-board").append("p")
			.attr("id", "win-text")
			.style("top", (FRAME_HEIGHT / 2) - 150 + "px")
			.style("left", (FRAME_WIDTH / 2) - 130 + "px")
			.html(player + " wins!");

	trackWins(player, turns);
}

function gameTie() {
	d3.selectAll(".highlighted").classed("highlighted", false);

	d3.select("#main-board").append("div")
			.attr("class", "screen")
			.style("width", FRAME_WIDTH + 25 + "px")
			.style("height", FRAME_HEIGHT + 25 + "px");

	d3.select("#main-board").append("p")
			.attr("id", "win-text")
			.style("top", (FRAME_HEIGHT / 2) - 150 + "px")
			.style("left", (FRAME_WIDTH / 2) - 130 + "px")
			.html("tie game");
}

// check if someone won game
function checkWin(lastPlay) {
	let row = lastPlay[1],
		col = lastPlay[3];

	// check row win
	for (let i = 0; i < size; i ++) {
		let cur = "r" + row + "c" + i;

		// if not all boxes in row have been played or box not won by player, no win
		if ( (!(cur in won)) || (won[cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// win
			return true;
		}

	}

	// check col win
	for (let i = 0; i < size; i ++) {
		let cur = "r" + i + "c" + col;

		// no win
		if ( (!(cur in won)) || (won[cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// win
			return true;
		}

	}

	// if played on front diagonal
	if (row == col) {
		// check front diagonal win
		for (let i = 0; i < size; i ++) {
			let cur = "r" + i + "c" + i;

			// no win
			if ( (!(cur in won)) || (won[cur] != player) ) {
				break;
			}

			if (i == size - 1) {
				// win
				return true;
			}

		}
	}

	// check back diagonal win
	for (let i = 0, j = size - 1; i < size, j >= 0; i ++, j --) {
		let cur = "r" + i + "c" + j;

		// no win
		if ( (!(cur in won)) || (won[cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// win
			return true;
		}

	}

}

// reflect box won
function boxWon(box) {
	let color = "";

	if (player == "x") {
		d3.select("#" + box).style("background-color", xColor);
	}

	else {
		d3.select("#" + box).style("background-color", oColor);
	}
}

// check if someone won a box
function checkBoxWin(box, lastPlay) {
	let row = lastPlay[1],
		col = lastPlay[3];

	// check row win
	for (let i = 0; i < size; i ++) {
		let cur = "r" + row + "c" + i;

		// if not all squares in row have been played or square not won by player, no win
		if ( (!(cur in played[box])) || (played[box][cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// square won
			won[box] = player;
			return true;
		}

	}

	// check col win
	for (let i = 0; i < size; i ++) {
		let cur = "r" + i + "c" + col;

		// no win
		if ( (!(cur in played[box])) || (played[box][cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// square won
			won[box] = player;
			return true;
		}

	}

	// if played on front diagonal
	if (row == col) {
		// check front diagonal win
		for (let i = 0; i < size; i ++) {
			let cur = "r" + i + "c" + i;

			// no win
			if ( (!(cur in played[box])) || (played[box][cur] != player) ) {
				break;
			}

			if (i == size - 1) {
				// square won
				won[box] = player;
				return true;
			}

		}
	}

	// check back diagonal win
	for (let i = 0, j = size - 1; i < size, j >= 0; i ++, j --) {
		let cur = "r" + i + "c" + j;

		// no win
		if ( (!(cur in played[box])) || (played[box][cur] != player) ) {
			break;
		}

		if (i == size - 1) {
			// square won
			won[box] = player;
			return true;
		}

	}
}

// get attributes of box clicked on
function getBox(x, y) {
	let col = null,
		row = null,
		centerX = null,
		centerY = null;

	let colWidth = boxWidth / size,
		rowHeight = boxHeight / size;

	for (let i = 0; i < size; i ++) {
		// is x in current col
		if ( (col == null) && (i * colWidth < x) && (x < (i + 1) * colWidth) ) {
			col = i; 
			centerX = (i * colWidth) + (colWidth / 2);
		}

		// is x in current row
		if ( (row == null) && (i * rowHeight < y) && (y < (i + 1) * rowHeight) ) {
			row = i;
			centerY = (i * rowHeight) + (rowHeight / 2);
		}
	}

	return ["r" + row + "c" + col, centerX, centerY];
}

// highlight next play board
function squareChosen(square) {
	// remove current highlight
	d3.selectAll(".highlighted").classed("highlighted", false);

	// highlight border and board
	d3.select("#" + square).classed("highlighted", true);
	d3.select("#" + square).selectAll(".line").classed("highlighted", true);
}

// play a turn
function turn() {
	// get relative position within current square
	let play = event.target.getBoundingClientRect();
	let relativeX = event.clientX - play.left,
		relativeY = event.clientY - play.top;
	let box = event.target.id;
	let boxInfo = getBox(relativeX, relativeY),
		square = boxInfo[0],
		centerX = boxInfo[1],
		centerY = boxInfo[2];

	// ignore conditions
	if ( (square in played[box]) || ( (turns > 0) && (box != nextPlay) && !(filled.includes(nextPlay))) || !inProgress )  {
		return;
	}

	let color = ""

	if (player == "x") {
		color = xColor;
	}
	else {
		color = oColor;
	}

	// place marker
	d3.select("#" + box).append("text")
		.attr("x", centerX)
		.attr("y", centerY)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "middle")
		.style("font-size", "40px")
		.style("fill", color.slice(0, -4) + " 1)")
		.style("stroke", "none")
		.text(player);

	// reflect played
	played[box][square] = player;

	// highlight next move
	squareChosen(square);

	turns ++;

	// if enough turns played and last play in unwon box
	if ( turns >= (2 * size - 1) && !(box in won) ) {

		// check if box won
		if (checkBoxWin(box, square)) {
			boxWon(box);

			// check if game won
			if (checkWin(box)) {
				inProgress = false; 
				gameWon();
			}
		}
	}

	// check if tie
	let merged = arrayUnique(Object.keys(won).concat(filled));
	if (merged.length == (size ** 2)) {
		inProgress = false; 
		gameTie();
	}

	// next player
	if (player == "x") {
		player = "o";
	}
	else {
		player = "x";
	}

	if (Object.keys(played[box]).length == size ** 2) {
		filled.push(box);
	}	

	nextPlay = square;
}

// add line svg element
function addLine(svg, x1, y1, x2, y2){
	svg.append("line")
			.attr("class", "line")
			.attr("x1", x1)
			.attr("y1", y1)
			.attr("x2", x2)
			.attr("y2", y2);
}

// make ultimate tictactoe board
function makeBoard() {
	let margins = 25 / size;

	// add board to every column in each row
	for (let i = 0; i < size; i ++) {
		let row = d3.select("#main-board").append("div")
						.attr("class", "row");

		for (let j = 0; j < size; j ++) {

			// box of board to add to
			let box = row.append("svg")
						.attr("class", "square")
						.attr("id", "r" + i + "c" + j)
						.attr("width", FRAME_WIDTH / size)
						.attr("height", FRAME_HEIGHT / size);

			box.selection().on("click", turn);
			played["r" + i + "c" + j] = {};

			// add grid
			for (let k = 1; k <= size - 1; k ++) {
				addLine(box, margins, k * (boxHeight / size), boxWidth - margins, k * (boxHeight / size));
				addLine(box, k * (boxWidth / size), margins, k * (boxWidth / size), boxHeight - margins);
			}

			// remove border around board edge
			if (i == 0) {
				box.style("border-top", "None");
			}
			else if (i == size - 1) {
				box.style("border-bottom", "None");
			}

			if (j == 0) {
				box.style("border-left", "None");
			}
			else if (j == size - 1) {
				box.style("border-right", "None");
			}
			

		}
	}
}

newGame();

d3.select("#reset-game").selection().on("click", () => {
		if (turns > 0) {
			if (confirm("Are you sure? This will restart the game")) {
				newGame();
			} 
		}
		else {
			newGame();
		}
	});


