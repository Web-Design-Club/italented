const userUrl = 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec';
const quizUrl = 'https://script.google.com/macros/s/AKfycbz7cE2k_h8VMNbfXTiREI5mc-P9xz6hKo59WVHYfk5y7df4GTP8/exec';

const getUserData = (data, callback) => { $.ajax({ url: userUrl, method: "GET", dataType: "json", data: data, success: callback }); }
const postUserData = (data, callback) => { $.ajax({ url: userUrl, method: "POST", dataType: "json", data: data, success: callback }); }
const getQuizData = (data, callback) => { $.ajax({ url: quizUrl, method: "GET", dataType: "json", data: data, success: callback }); }
const postQuizData = (data, callback) => { $.ajax({ url: quizUrl, method: "POST", dataType: "json", data: data, success: callback }); }

(() => {
    $('#new-student').hide();
    $('#admin-login-container').hide();
    $('#admin-portal').hide();

    const user = localStorage.getItem("user");
    const pswrd = localStorage.getItem("pass");
    if (user && pswrd) {
        let data = {};
        data['user'] = user;
        data['pswrd'] = pswrd;
        getUserData(data, o => {
            if (o.correct) {
                adminPortal(user, pswrd);
            } else {
                $('#admin-login-container').show();
            }
        });
    } else {
        $('#admin-login-container').show();
    }
})();

function adminLogin(form){
    const user = form.user.value;
    const pswrd = form.pass.value;
    if (user != 'admin') {
        alert("Incorrect username or password");
        return;
    }
    let data = {};
    data['user'] = user;
    data['pswrd'] = pswrd;
    getUserData(data, o => {
        if (o.correct) {
            adminPortal(user, pswrd);
        } else {
            alert("Incorrect username or password");
        }
    });
}

function adminPortal(user, pass) {
    $('#student-details').html('');
    $('#quiz-details').html('');
    $('#admin-login-container').hide();
    $('#admin-portal').show();
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    let data = {};
    data['user'] = user;
    data['pswrd'] = pass;
    data['studentList'] = true;
    data['quizList'] = true;
    getUserData(data, o => {
        if (o.correct) {
            let students = '';
            for (const student of o.students) {
                students += `<div onclick="studentDetails('${student[0]} ${student[1]}');">${student[0]} ${student[1]}</div>`;
            }
            $('#student-list').html(students);
        }
    });
    getQuizData(data, o => {
        if (o.correct) {
            let quizzes = '';
            for (const quiz of o.quizzes) {
                quizzes += `<div onclick="quizDetails('${quiz[0]}');">${quiz[0]}</div>`
            }
            $('#quiz-list').html(quizzes);
        }
    });
}

function addModal(id, callback) {
    $(`#${id}`).show();
    $(`#${id} .close`).click(() => {
        $(`#${id}`).hide();
    })
    if (callback) {
        callback();
    }
}

function addStudent() {
    let first = $('#new-student #first').val();
    let last = $('#new-student #last').val();
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['First Name'] = first;
    data['Last Name'] = last;
    data['newStudent'] = true;
    postUserData(data, o => {
        postQuizData(data, o => $('#new-student').hide())
    });
}

function addQuiz() {
    let quizName = $('#new-quiz #quiz-name').val();
    let timeLimit = $('#new-quiz #time-limit').val();
    let questionCount = $('#new-quiz #question-count').val();
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['newQuiz'] = true;
    data['Quiz'] = quizName;
    data['Time Limit'] = timeLimit;
    data['Question Count'] = questionCount;
    postQuizData(data, o => $('#new-quiz').hide());
}

function reset() {
    $('#admin-portal').hide();
    $('#student-details').hide();
    $('#quiz-details').hide();
    $('#admin-login-container').show();
    localStorage.setItem("user", "");
    localStorage.setItem("pass", "");
}
