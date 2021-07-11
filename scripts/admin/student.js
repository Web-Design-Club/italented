function studentDetails(student) {
    $('#admin-portal').hide();
    let details = `
        <span id="exit" onclick="exitStudentDetails();">&leftarrow;</span>
        <div class="header">${student}</div>
        <table>
            <tr><th>Quiz</th><th>Score</th><th>Time Limit</th></tr>
    `;
    let data = {};
    data['studentDetails'] = student;
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    getUserData(data, o => {
        if (o.correct) {
            for (const row of o.details.slice(1)) {
                details += `<tr onclick="studentQuizDetails('${student}', '${row}');"><td>${row[1]}</td><td>${row[4]}</td><td>${row[2]}</td></tr>`;
            }
            details += `</table>`;
            $('#student-details').html(details);
            $('#student-details').show();
            localStorage.setItem('student', student);
        } else {
            reset();
        }
    });
}

function studentQuizDetails(student, quiz) {
    quiz = quiz.split(",");
    $('#student-details').hide();
    let details = `
        <span id="exit" onclick="exitStudentQuizDetails();">&leftarrow;</span>
        <div class="header">${student}</div>
        <div id="name">${quiz[0]}</div>
    `;
    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbwoTxPRGLrIFBhwZCHVl4sqE9mVwDdB6znxXbmDztzD6-bmU8Ct/exec',
        method: "GET",
        dataType: "json",
        data: { "quiz": quiz[0] }
    })
    .done(function(o) {
        const questions = o.questions;
        const correctPoints = 6;
        const blankPoints = 1.5;
        const wrongPoints = 0;
        let numCorrect = 0;
        let numBlank = 0;
        let numWrong = 0;
        let results = `
            <div id="quiz-results">
        `;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            let answers = ``;
            for (answer in question.answers) {
                if (quiz[i+3] === answer) {
                    if (answer === question.answer) {
                        answers += `<div class="answer-choice" style="background-color: rgba(121, 203, 69, 0.5)">${answer}: ${question.answers[answer]}</div>`;
                        numCorrect++;
                    } else {
                        answers += `<div class="answer-choice" style="background-color: rgba(217, 60, 33, 0.5)">${answer}: ${question.answers[answer]}</div>`;
                        numWrong++;
                    }
                } else if (answer === question.answer) {
                    answers += `<div class="answer-choice" style="border: 2px solid rgba(121, 203, 69, 0.5)">${answer}: ${question.answers[answer]}</div>`;
                } else {
                    answers += `<div class="answer-choice">${answer}: ${question.answers[answer]}</div>`;
                }
            }
            if (quiz[i+3] === "blank") {
                answers += `<div class="answer-choice" style="background-color: rgba(255, 210, 49, 0.5)">Leave blank</div>`;
                numBlank++;
            } else {
                answers += `<div class="answer-choice">Leave blank</div>`;
            }
            results += `<div class="question" id="question${i+1}"> ${i + 1}. ${question.question} </div>`;
            if (question.image) {
                results += `<div id="image${i+1}"><img src="https://drive.google.com/uc?export=view&id=${question.image}"></div>`;
            }
            results += `<div class="answers" id="answers${i+1}">${answers}</div>`;
        }
        results += `</div>`;
        let totalPoints = questions.length * correctPoints;
        let score = numCorrect * correctPoints + numBlank * blankPoints + numWrong * wrongPoints;
        details += `<div id="details">${score}/${totalPoints} points<br>${numCorrect} correct, ${numWrong} wrong, ${numBlank} blank</div>`;
        details += results;
        $('#student-quiz-details').html(details);
        MathJax.typeset();
        $('#student-quiz-details').show();
    });
}

function exitStudentDetails() {
    adminPortal(localStorage.getItem("user"), localStorage.getItem("pass"));
}

function exitStudentQuizDetails() {
    $('#student-quiz-details').html('');
    $('#student-details').show();
}
