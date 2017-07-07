function submitAnswers() {
	var total = 4;
	var score = 0;

	//Get user input from form
	var q1 = document.forms["quiz"]["q1"].value;
	var q2 = document.forms["quiz"]["q2"].value;
	var q3 = document.forms["quiz"]["q3"].value;
	var q4 = document.forms["quiz"]["q4"].value;
	var arrayQ = [q1, q2, q3, q4];

	//Make sure user did every question
	for (var i = 0; i < arrayQ.length; i++) {
		if (arrayQ[i] == null || arrayQ[i] == "" || arrayQ[i] == undefined) {
			alert("You skipped question #" + (i + 1) + "!");
			return false;
		}
	}

	//Setting the correct answers
	var correctA = ['a', 'c', 'a', 'c'];
	for (var i = 0; i < correctA.length; i++) {
		if (arrayQ[i] == correctA[i]) {
			alert("Question " + (i + 1) + " is correct!");
			score++;
		} else {
			alert("Question " + (i + 1) + " is WRONGGGGG!");
		}
	};

	//display results
	var resultsB = document.getElementById('resultsBad');
	var resultsG = document.getElementById('resultsGood');
	if(score >= 2) {
		resultsG.innerHTML = "You scored " + score + " out of " + total + "!" + " Click to get your AWARD!!!";
	} else {
		resultsB.innerHTML = "You scored " + score + " out of " + total + "!" + " You should pay better attention, buster!";
	}

	return false;
};