function exit() {
    localStorage.setItem("quiz", "");
    location.href = `dashboard.html`;
}

(function() {
    //$('#quiz-container').hide();
    $('#loadQuiz').hide();

    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    const quiz = localStorage.getItem("quiz");

    //Multiple choice questions per page
    let pageSize = 5;

    let currentPage = 0;
    let totalPages = 0;
    let totalQuestions = 0;

    //student's google sheet results
    var results = new Array();
    
    function setup(questions) {
        //goes through each question and adds
        function buildQuiz() {
            let quizHtml = ``;

            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                let answers = ``;
                let j = 1;
                for (answer in question.answers) {
                    answers += 
                        `<label class="mc-container" id="question${i+1}-answer${j}">
                            <name="question${i+1}" value="${answer}">
                            <span class="mc open"></span>
                            ${answer}: ${question.answers[answer]}
                        </label>`;
                    j++;
                }
                answers += 
                    `<label class="mc-container" id="question${i+1}-answer${j}">
                        <name="question${i+1}" value="blank">
                        <span class="mc open"></span>
                        Leave blank
                    </label>`;
                quizHtml += `<div class="question" id="question${i+1}"> ${i + 1}. ${question.question} </div>`;
                if (question.image) {
                    quizHtml += `<div id="image${i+1}"><img src="https://drive.google.com/uc?export=view&id=${question.image}"></div>`;
                }
                quizHtml += `<div class="answers" id="answers${i+1}">${answers}</div>`;
            }


            $('#title').html(localStorage.getItem("quiz"));
            $('#quiz').html(quizHtml);
            for (let q = pageSize+1; q <= questions.length; q++){
                $(`#question${q}`).hide();
                $(`#image${q}`).hide();
                $(`#answers${q}`).hide();
            }
        }
        buildQuiz();

        //Checking answers: first comparing if student's answer == correct answer, otherwise colors student's answer red and correct answer green
        //Colors the question red if incorrect
        for (let i = 0; i < questions.length; i++){
            const question = questions[i];
            
            //converts the alphabetical answer choice to numbers to find by id
            answerNumber = question.answer.charCodeAt(0) - 96;
            choiceNumber = results[i].charCodeAt(0) - 96;

            if(question.answer == results[i]){
                document.getElementById(`question${i+1}`).style.backgroundColor = "Green";
                document.getElementById(`question${i+1}-answer${answerNumber}`).style.backgroundColor = "Green";
            }
            else {
                document.getElementById(`question${i+1}`).style.backgroundColor = "Red";
                document.getElementById(`question${i+1}-answer${answerNumber}`).style.backgroundColor = "Green";
                document.getElementById(`question${i+1}-answer${choiceNumber}`).style.backgroundColor = "Red";
            }
        }


        MathJax.typeset();
        $('#next').click(nextPage);
        $('#previous').click(previousPage);

        //deals with the next and previous page buttons during certain pages
        if (currentPage == 0) {
            $('#previous').prop('disabled', true);
        } else {
            $('#previous').prop('disabled', false);
        }
        if (currentPage == totalPages-1) {
            $('#next').prop('disabled', true);
        } else {
            $('#next').prop('disabled', false);
        }
        if (totalPages == 0){
            $('#next').prop('disabled', true);
        }
        $('#loadQuiz').hide();
        $('#quiz-container').show();
    }
    
    function getQuestions(callback) {

        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwoTxPRGLrIFBhwZCHVl4sqE9mVwDdB6znxXbmDztzD6-bmU8Ct/exec',
            method: "GET",
            dataType: "json",
            data: { "quiz": quiz }
        })
        .done(function(data) {
            callback(data.questions);
        });
    }

    function nextPage(){
        if (currentPage < totalPages-1){
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).hide();
                $(`#image${currentPage*5+q}`).hide();
                $(`#answers${currentPage*5+q}`).hide();
            }
            currentPage++;
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).show();
                $(`#image${currentPage*5+q}`).show();
                $(`#answers${currentPage*5+q}`).show();
            }
            $('#previous').prop('disabled', false);
            if (currentPage == totalPages-1) {
                $('#next').prop('disabled', true);
            }
        }
    }
    function previousPage(){
        if (currentPage > 0){
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).hide();
                $(`#image${currentPage*5+q}`).hide();
                $(`#answers${currentPage*5+q}`).hide();
            }
            currentPage--;
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).show();
                $(`#image${currentPage*5+q}`).show();
                $(`#answers${currentPage*5+q}`).show();
            }
            $('#next').prop('disabled', false);
            if (currentPage == 0) {
                $('#previous').prop('disabled', true);
            }
        }
    }

    // checks that user has logged in
    if (!username) {
        localStorage.setItem("quiz", "");
        location.href = `../index.html`;
        return;
    }
    if (!quiz) {
        location.href = `dashboard.html`;
        return;
    }

    let data = {};
    data['user'] = username;
    data['pswrd'] = password;
    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec',
        method: "GET",
        dataType: "json",
        data: data,
        success: function (o) {
            let details = o.details;
            for (let i = 1; i < details.length; i++) {
                if (details[i] && details[i][0] === quiz) {
                    if (details[i][3] == "") {
                        // quiz is not submitted
                        exit();
                    } else {
                        getQuestions(setup);
                        //organizing the student's results
                        //5 is where student's answers starts on the sheet
                        for (let x = 5; x < details[i].length; x++){
                            results.push(details[i][x]);
                        }
                    }
                    break;
                }
            }
        }
    });
})();