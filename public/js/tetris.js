const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

//Scale contents of canvas
context.scale(20, 20);

//Background measurements and color
context.fillStyle = "#1e5117";
context.fillRect(0, 0, canvas.width, canvas.height);

//The "T" block
const matrix = [
	[0, 0, 0],
	[1, 1, 1],
	[0, 1, 0]
]

//Function for creating matrixes
var drawMatrix = (matrix, offset) => {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				context.fillStyle = "yellow";
				context.fillRect(x, y, 1, 1)
			}
		});
	});
}

drawMatrix(matrix);