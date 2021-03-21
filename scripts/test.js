function exit() {
    localStorage.setItem("quiz", "");
    location.href = `dashboard.html`;
}

(function() {
    $('#quiz-container').hide();
    $('#loadQuiz').show();

    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    const quiz = localStorage.getItem("quiz");

    // set score factors
    const correctPoints = localStorage.getItem("correct-points");
    const blankPoints = localStorage.getItem("blank-points");
    const wrongPoints = localStorage.getItem("incorrect-points");

    //Time in seconds for countdown timer
    const totalTime = localStorage.getItem("time-limit") * 60;

    var time = totalTime;
    var finished = false;
    
    //Multiple choice questions per page
    let pageSize = 5;

    let currentPage = 0;
    let totalPages = 0;
    let totalQuestions = 0;

    // short answer questions array
    const shortAnswerQuestions = [];
    // const shortAnswerQuestions = [
    //     {
    //         question: "What is 1.25*2?",
    //         correctAnswer: ["5/2","2.5"],
    //         answer: ""
    //     },
    //     {
    //         question: "How many degrees does a circle have?",
    //         correctAnswer: ["360","360 degrees","360 degree"],
    //         answer: ""
    //     },
    //     {
    //         question: "What is 1+1?",
    //         correctAnswer: ["2"],
    //         answer: ""
    //     }
    // ];

    function setup(questions) {
        function buildQuiz() {
            let quizHtml = ``;
            let questionListHtml = ``;
            let numOfMult = questions.length;

            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                let answers = ``;
                let j = 1;
                for (answer in question.answers) {
                    answers += 
                        `<label class="mc-container" id="question${i+1}-answer${j}">
                            <input type="radio" name="question${i+1}" value="${answer}">
                            <span class="mc open"></span>
                            ${answer}: ${question.answers[answer]}
                        </label>`;
                    j++;
                }
                answers += 
                    `<label class="mc-container" id="question${i+1}-answer${j}">
                        <input type="radio" name="question${i+1}" value="blank" checked="checked">
                        <span class="mc open"></span>
                        Leave blank
                    </label>`;
                quizHtml += `<div class="question" id="question${i+1}"> ${i + 1}. ${question.question} </div>`;
                if (question.image) {
                    quizHtml += `<div id="image${i+1}"><img src="https://drive.google.com/uc?export=view&id=${question.image}"></div>`;
                }
                quizHtml += `<div class="answers" id="answers${i+1}">${answers}</div>`;
                questionListHtml += `<div class="questionButton" id="questionButton${i+1}"><a href="#question${i+1}">${i+1}</a></div>`;
            }
            $('#title').html(localStorage.getItem("quiz"));
            $('#quiz').html(quizHtml);
            $('#questionList').html(questionListHtml);
            console.log(questionListHtml);
            for (let q = pageSize+1; q <= questions.length; q++){
                $(`#question${q}`).hide();
                $(`#image${q}`).hide();
                $(`#answers${q}`).hide();
                $(`#questionButton${q}`).hide();
            }

            // building timer/counter
            let data = {};
            data['user'] = username;
            data['pswrd'] = password;
            $.ajax({
                url: 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec',
                method: "GET", dataType: "json", data: data,
                success: function (o) {
                    o.details.forEach((item, i) => {
                        if (i > 0 && item[0] === quiz) {
                            if (item[2]) {
                                time = totalTime - (Date.now() - item[2]) / 1000;
                            } else {
                                // api call to store start time
                                let startTime = Date.now();
                                console.log(startTime)
                                data['quiz'] = quiz;
                                data['Start'] = startTime;
                                $.ajax({
                                    url: 'https://script.google.com/macros/s/AKfycbyk0zW3toH073872pM6_YcGSqTnxeBbSWrsC7GKeK0sZTDm2V8neDePJw/exec',
                                    method: "POST", dataType: "json", data: data,
                                    success: function (o) {
                                        $.ajax({
                                            url: 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec',
                                            method: "POST", dataType: "json", data: data,
                                            success: o => {}
                                        })
                                    }
                                });
                            }
                            var count = setInterval(function() {
                                if (finished) {
                                    clearInterval(count);
                                }
                                if (time == 0) {
                                    finished = true;
                                    showResults();
                                    // location.href = `dashboard.html`;
                                    // alert("Test Finished: Answers have been submitted");
                                } else {
                                    time--;
                                }
                                document.getElementById("timer").innerHTML = new Date(time * 1000).toISOString().substr(11,8);
                            }, 1000);
                        }
                    })
                }
            });

            buildAllShortAnswers(numOfMult);
        }

        // build one short answer question
        function buildShortAnswersOneByOne(questionNumber,numOfMult) {
            let shortAnswersQuiz = '';
            let shortAnswersInput = '';
            
            shortAnswersInput += 
                `<label id="shortAnswerLabel${questionNumber}">
                    <input type="text" class="short-answer shortAnswersBoxes" name="shortAnswers${questionNumber}">
                </label>`;

            shortAnswersQuiz += 
                `<div class="shortAnswerQuestions" name="answerBox${questionNumber}" id="question${questionNumber+numOfMult+1}"> ${questionNumber+numOfMult+1}. ${shortAnswerQuestions[questionNumber].question} </div>
                <div class="shortAnswersInput" id="answers${questionNumber+numOfMult+1}"> ${shortAnswersInput} </div>`

            return shortAnswersQuiz;
        }

        // build all short answer questions
        function buildAllShortAnswers(numOfMult) {
            let allShortAnswers = '';
            for (let i = 0; i < shortAnswerQuestions.length; i++) {
                allShortAnswers += buildShortAnswersOneByOne(i, numOfMult);
            }
            $('#shortAnswersQuiz').html(allShortAnswers);
            
            totalQuestions = numOfMult + shortAnswerQuestions.length;
            totalPages = Math.ceil(totalQuestions/5);
            for (let q = pageSize+1; q <= numOfMult + shortAnswerQuestions.length; q++) {
                $(`#question${q}`).hide();
                $(`#image${q}`).hide();
                $(`#answers${q}`).hide();
            }
        }

        // get short answer results
        function getShortAnswerResults() {
            let numCorrect = 0;
            let numBlank = 0;
            let numWrong = 0;

            let allShortAnswers = [];
            for (let i = 0; i < shortAnswerQuestions.length; i++) {
                allShortAnswers.push(document.getElementsByName(`shortAnswers${i}`)[0].value);
            }
            for (let i = 0; i < allShortAnswers.length; i++) {
                // lock short answer boxes
                document.getElementsByName(`shortAnswers${i}`)[0].disabled = true;

                let answer = allShortAnswers[i];
                const rect = document.getElementById(`shortAnswerLabel${i}`);
                const questionText = document.getElementsByName(`answerBox${i}`)[0];
                for (let j = 0; j < shortAnswerQuestions[i].correctAnswer.length; j++) {
                    rect.style.width = "330px";
                    rect.style.height = "50px";
                    if (answer === shortAnswerQuestions[i].correctAnswer[j]) {
                        numCorrect++;
                        rect.style.backgroundColor = 'rgb(121, 203, 69, .5)';
                        break;
                    } else if (answer === '') {
                        numBlank++;
                        rect.style.backgroundColor = 'rgb(255, 210, 49, .5)';
                        // questionText.style.color = "red";
                        break;
                    } else {
                        if (j === shortAnswerQuestions[i].correctAnswer.length-1) {
                            numWrong++;
                            rect.style.backgroundColor = 'rgb(217, 60, 33, 0.5)';
                            // questionText.style.color = "red";
                        }
                    }
                }
            }

            let results = [numCorrect, numBlank, numWrong];
            return results;
        }

        // show results
        function showResults() {
            $('#submit').hide();
            $('#viewQuizResults').show();

            $('.mc').removeClass('open');

            var data = {};
            let numCorrect = 0;
            let numBlank = 0;
            let numWrong = 0;

            //Time taken for the test
            finished = true;
            data[`Time`] = new Date((totalTime - time) * 1000).toISOString().substr(11,8);

            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                let quest = $('#quiz').find(`#answers${i+1}`);
                let container = quest[0];
                let userAnswer = null;
                const selected = $(container).find(`input[name=question${i+1}]:checked`);
                
                // lock mc buttons
                for (let j = 0; j < Object.keys(question.answers).length + 1; j++) {
                    document.getElementsByName(`question${i+1}`)[j].disabled = true;
                }

                // find num of selected answer choice
                let selectedNum = null;
                if (selected.length > 0) {
                    selectedNum = selected[0].value.charCodeAt(0)-96;
                }

                // get and style correctAnswerBox (cab)
                const correctAnswerNum = question.answer.charCodeAt(0)-96;
                const cab = document.getElementById(`question${i+1}-answer${correctAnswerNum}`);
                cab.style.display = "inline-block";
                cab.style.paddingRight = "20px";

                // color the correct/selected answers
                if (selected.length > 0) {
                    userAnswer = selected[0].value;
                }
                if (userAnswer === question.answer) {
                    numCorrect++;
                    cab.style.backgroundColor = "rgb(121, 203, 69, .5)";
                    cab.style.boxShadow = "0px 0px 0px 4px rgb(121, 203, 69, .5)";
                } else if (userAnswer === 'blank') {
                    numBlank++;
                    // style selectedBox
                    const numChoices = Object.keys(question.answers).length;
                    const sb = document.getElementById(`question${i+1}-answer${numChoices + 1}`);
                    sb.style.paddingRight = "20px";
                    sb.style.backgroundColor = "rgb(255, 210, 49, .5)";
                    sb.style.boxShadow = "0px 0px 0px 4px rgb(255, 210, 49, .5)";
                    // style correctAnswerBox
                    cab.style.boxShadow = "0px 0px 0px 4px rgb(121, 203, 69, .5)";
                    // cab.boxSizing = "border-box";
                    // questionText.style.color = 'red';
                } else {
                    numWrong++;
                    // style selectedBox
                    const sb = document.getElementById(`question${i+1}-answer${selectedNum}`);
                    sb.style.paddingRight = "20px";
                    sb.style.backgroundColor = "rgb(217, 60, 33, 0.5)";
                    sb.style.boxShadow = "0px 0px 0px 4px rgb(217, 60, 33, 0.5)";
                    // style correctAnswerBox
                    cab.style.boxShadow = "0px 0px 0px 4px rgb(121, 203, 69, .5)";
                    // cab.boxSizing = "border-box";  
                    // questionText.style.color = 'red';
                }
                data[`Question ${i+1}`] = userAnswer;
            }

            getShortAnswerResults();

            // calculate score
            let shortAnswerResults = getShortAnswerResults();
            numCorrect += shortAnswerResults[0];
            numBlank += shortAnswerResults[1];
            numWrong += shortAnswerResults[2];
            let totalPoints = (questions.length + shortAnswerQuestions.length) * correctPoints;
            let score = numCorrect * correctPoints + numBlank * blankPoints + numWrong * wrongPoints;
            
            let percentage = Math.round(score*100/totalPoints);
            makePopupBox(numCorrect, numBlank, numWrong, percentage, score, totalPoints);

            $("#loadQuiz").show();
            data['Score'] = score;
            data['user'] = username;
            data['pswrd'] = password;
            data['quiz'] = quiz;

            $("#loadQuiz").hide();
            $.ajax({
                url: 'https://script.google.com/macros/s/AKfycbyk0zW3toH073872pM6_YcGSqTnxeBbSWrsC7GKeK0sZTDm2V8neDePJw/exec',
                method: "POST", dataType: "json", data: data,
                success: function (o) {
                    $.ajax({
                        url: 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec',
                        method: "POST", dataType: "json", data: data,
                        success: function(o) {
                            $("#loadQuiz").hide();
                        }
                    })
                }
            });
        }

        // draws a slice of the wheel
        function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
        }
    
        var Wheel = function(options) {
            this.options = options;
            this.canvas = options.canvas;
            this.ctx = this.canvas.getContext("2d");
            this.colors = options.colors;

            // make consts
            const c = this.ctx;
            const width = c.canvas.width;
            const height = c.canvas.height;
            const degree = Math.PI/180;
            const checkCircleRadius = 15;
            const checkCircleY = height/2-7.5;
            const checkX = width/2;
            const checkY = checkCircleY+6;
            const margin = 20;
            const percent = this.options.percentage;

            // var grd = c.createLinearGradient(0,0,width,0)
            // grd.addColorStop(0,"red");
            // grd.addColorStop(.5,"yellow");
            // grd.addColorStop(1,"green");
    
            this.draw = function() {
                // // draw outside arc
                // c.beginPath();
                // c.arc(width/2,height/2,width/2,180*degree,360*degree);
                // c.fillStyle = grd;
                // c.fill();

                var total_value = 0;
                var color_index = 0;
                for (var categ in this.options.data) {
                    var val = this.options.data[categ];
                    total_value += val;
                }
    
                var start_angle = Math.PI;
                for (categ in this.options.data) {
                    val = this.options.data[categ];
                    var slice_angle = Math.PI * val/total_value;
    
                    drawPieSlice(
                        this.ctx,
                        this.canvas.width/2,
                        this.canvas.height/2,
                        Math.min(this.canvas.width/2-margin, this.canvas.height/2-margin),
                        start_angle,
                        start_angle+slice_angle,
                        this.colors[color_index%this.colors.length]
                    );
    
                    start_angle += slice_angle,
                    color_index++;
                }
    
                // draw gray circle over wheel
                if (this.options.smallHoleSize) {
                    drawPieSlice(
                        this.ctx,
                        this.canvas.width/2,
                        this.canvas.height/2,
                        this.options.smallHoleSize * Math.min(this.canvas.width/2-margin, this.canvas.height/2-margin),
                        0,
                        2*Math.PI,
                        "#DEDEDE"
                    );
                }
                
                // write out scores
                const scoreBreakdown = document.getElementById("scoreBreakdown");
                scoreBreakdown.style.marginLeft = (width/2-90)+"px";
                scoreBreakdown.style.marginTop = (height/2-20)+"px";

                const fractionScore = document.getElementById("fractionScore");
                fractionScore.style.marginLeft = (width/2)+"px";
                fractionScore.style.marginTop = (-15)+"px";
    
                // draw triangle for pointer
                c.translate(checkX, checkY);
                c.rotate(degree*percent*.01*180-90*degree);
                c.translate(-checkX, -checkY);
                c.beginPath();
                c.moveTo(checkX-7,checkCircleY+3);
                c.lineTo(checkX+7,checkCircleY+3);
                c.lineTo(checkX, 0);
                c.closePath();
                c.strokeStyle = "#B1B1B1";
                c.stroke();

                c.fillStyle = "#FFFFFF";
                c.fill();

                c.translate(checkX, checkY);
                c.rotate(360*degree-degree*percent*180*0.01+90*degree);
                c.translate(-checkX, -checkY);

                // draw green check circle
                drawPieSlice(
                    c,
                    width/2,
                    checkCircleY,
                    checkCircleRadius,
                    0,
                    2*Math.PI,
                    "#79cb45"
                );
    
                // draw white check
                c.translate(checkX, checkY);
                c.rotate(degree*135);
                c.translate(-checkX, -checkY);
                c.fillStyle = "rgb(255,255,255)";
                c.beginPath();
                c.fillRect(checkX, checkY,3,10);
                c.fillRect(checkX-15, checkY, 15, 3);
                c.stroke();

                c.translate(checkX, checkY);
                c.rotate(degree*225);
                c.translate(-checkX, -checkY);    
            }
        }
 
        // creates the popup score box
        function makePopupBox(numCorrect, numBlank, numWrong, percentage, score, totalPoints) {
            // writes out text

            $('#quizNamePopup').html(localStorage.getItem('quiz') + ":");

            const bigBox = document.getElementById('popupBox');
            bigBox.style.display = "block";

            const bgBox = document.getElementById('bgBox');
            bgBox.style.display = "block";

            const scoreBreakdown = document.getElementById("scoreBreakdown");
            scoreBreakdown.innerHTML = numCorrect + " correct, " + numBlank + " blank, " + numWrong + " wrong";

            const fractionScore = document.getElementById("fractionScore");
            fractionScore.innerHTML = score + "/" + totalPoints;

            const bigScore = document.getElementById("bigScore");
            bigScore.innerHTML = Math.round(score/totalPoints*100) + "%";

            // create canvas
            var myCanvas = document.getElementById("myCanvas");
            myCanvas.width = 450;
            myCanvas.height = 450;
            myCanvas.style.left = "40px";
            myCanvas.style.top = "40px";
            myCanvas.style.position = "absolute";

            // set data needed for wheel
            var answerInfo = {
                "right": numCorrect,
                "blank": numBlank,
                "wrong": numWrong
            }

            // draw wheel
            var wheel = new Wheel (
                {
                    canvas: myCanvas,
                    data: answerInfo,
                    colors: ["#79cb45", "#FBEB59", "#d93c21"],
                    smallHoleSize: 0.35,
                    percentage: percentage
                }
            )
            wheel.draw();
        }

        // gets rid of popup box
        function hidePopupBox() {
            const bgBox = document.getElementById('bgBox');
            bgBox.style.display = "none";
        }
        
        // shows popup box
        function showPopupBox() {
            const bgBox = document.getElementById('bgBox');
            bgBox.style.display = "block";
        }

        //make buttons on popup box clickable
        $('#reviewQuiz').click(hidePopupBox);
        $('#popupX').click(hidePopupBox);
        $('#viewQuizResults').click(showPopupBox);

        // populate components
        buildQuiz();
        $('#submit').click(showResults);
        MathJax.typeset();
        $('#next').click(nextPage);
        $('#previous').click(previousPage);

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

        $('#loadQuiz').hide();
        $('#quiz-container').show();
        $('#viewQuizResults').hide();
    }
    function nextPage(){
        if (currentPage < totalPages-1){
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).hide();
                $(`#image${currentPage*5+q}`).hide();
                $(`#answers${currentPage*5+q}`).hide();
                $(`#questionButton${currentPage*5+q}`).hide();
            }
            currentPage++;
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).show();
                $(`#image${currentPage*5+q}`).show();
                $(`#answers${currentPage*5+q}`).show();
                $(`#questionButton${currentPage*5+q}`).show();
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
                $(`#questionButton${currentPage*5+q}`).hide();
            }
            currentPage--;
            for (let q = 1; q < pageSize+1; q++){
                $(`#question${currentPage*5+q}`).show();
                $(`#image${currentPage*5+q}`).show();
                $(`#answers${currentPage*5+q}`).show();
                $(`#questionButton${currentPage*5+q}`).show();
            }
            $('#next').prop('disabled', false);
            if (currentPage == 0) {
                $('#previous').prop('disabled', true);
            }
        }
    }

    function getQuestions() {
        $.ajax({
            url: 'https://script.google.com/macros/s/AKfycbwoTxPRGLrIFBhwZCHVl4sqE9mVwDdB6znxXbmDztzD6-bmU8Ct/exec',
            method: "GET",
            dataType: "json",
            data: { "quiz": quiz }
        })
        .done(function(data) {
            setup(data.questions);
        });
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
                    if (details[i][3] !== "") {
                        // quiz is already submitted
                        exit();
                    } else {
                        $(window).bind('beforeunload', function() {
                            if (!finished) return 'Are you sure you want to leave?';
                        });

                        getQuestions();
                    }
                    break;
                }
            }
        }
    });
})();
