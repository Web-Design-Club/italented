function classDetails(_class) {
    $('#admin-portal').hide();
    let details = `
        <span id="exit" onclick="exitClassDetails();">&leftarrow;</span>
        <div class="header">
            ${_class}
            <button class="btn" onclick="addModal('add-student', addStudentOptions);">Add Student</button>
            <button class="btn" onclick="addModal('add-quiz', addQuizOptions);">Add Quiz</button>
        </div>
        <table>
            <tr><th>Student</th></tr>
    `;
    let data = {};
    data['classDetails'] = _class;
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    getClassData(data, o => {
        if (o.correct) {
            for (const student of o.details[0].slice(1)) {
                details += `<tr onclick="classStudentDetails('${_class}', '${student}');"><td>${student}</td></tr>`;
            }
            details += `
                </table>
                <table>
                <tr><th>Quiz</th></tr>
            `;
            for (const quiz of o.details[1].slice(1)) {
                details += `<tr onclick="classQuizDetails('${_class}', '${quiz}');"><td>${quiz}</td></tr>`;
            }
            details += `
                </table>
            `;
            $('#class-details').html(details);
            $('#class-details').show();
            localStorage.setItem('class', _class);
        } else {
            reset();
        }
    });
}

function addStudentOptions() {
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['classDetails'] = localStorage.getItem('class');
    data['studentList'] = true;
    getUserData(data, o => {
        if (o.correct) {
            let students = o.students;
            getClassData(data, o => {
                if (o.correct) {
                    for (const student of o.details[0].slice(1)) {
                        for (let i = 0; i < students.length; i++) {
                            if (students[i][0] + " " + students[i][1] == student) {
                                students.splice(i, 1);
                            }
                        }
                    }
                    let options = ``;
                    for (const student of students) {
                        options += `
                            <input type="checkbox" name="student" value="${student[0]} ${student[1]}">
                            <label>${student[0]} ${student[1]}</label><br>`;
                    }
                    $('#add-class-students').html(options);
                } else {
                    reset();
                }
            });
        } else {
            reset();
        }
    });
}

function addQuizOptions() {
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['classDetails'] = localStorage.getItem('class');
    data['quizList'] = true;
    getQuizData(data, o => {
        if (o.correct) {
            let quizzes = o.quizzes;
            getClassData(data, o => {
                if (o.correct) {
                    for (const quiz of o.details[1].slice(1)) {
                        for (let i = 0; i < quizzes.length; i++) {
                            if (quizzes[i][0] == quiz) {
                                quizzes.splice(i, 1);
                            }
                        }
                    }
                    let options = ``;
                    for (const quiz of quizzes) {
                        options += `
                            <input type="radio" name="quiz" value="${quiz[0]}">
                            <label>${quiz[0]}</label><br>`;
                    }
                    $('#add-class-quizzes').html(options);
                } else {
                    reset();
                }
            });
        } else {
            reset();
        }
    });
}

function addClassStudent() {
    let checked = $('#add-class-students').find(`input[name=student]:checked`);
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['addStudent'] = localStorage.getItem('class');
    data['students'] = [];
    for (const c of checked) {
        let student = {};
        student['Name'] = c.value;
        data['students'].push(student);
    }
    postClassData(data, o => {
        data['classAssign'] = data['addStudent'];
        postUserData(data, o => $('#add-student').hide());
    });
}

function addClassQuiz() {
    let checked = $('#add-class-quizzes').find(`input[name=quiz]:checked`);
    let data = {};
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    data['addQuiz'] = localStorage.getItem('class');
    data['quizzes'] = [];
    for (const c of checked) {
        let quiz = {};
        quiz['Name'] = c.value;
        data['quizzes'].push(quiz);
    }
    postClassData(data, o => {
        data['classDetails'] = localStorage.getItem('class');
        getClassData(data, o => {
            if (o.correct) {
                data['quizAssign'] = data['quizzes'][0];
                data['students'] = [];
                for (const name of o.details[0].slice(1)) {
                    let student = {};
                    student['Name'] = name;
                    data['students'].push(student);
                }
                data['time'] = $('#time-limit').val();
                postQuizData(data, o => postUserData(data, o => $('#add-quiz').hide()));
            }
        });
    });
}

function classStudentDetails(_class, student) {
    $('#class-details').hide();
    let details = `
        <span id="exit" onclick="exitClassStudentDetails();">&leftarrow;</span>
        <div class="header">${_class}</div>
        <div id="name">${student}</div>
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
                details += `<tr><td>${row[1]}</td><td>${row[4]}</td><td>${row[2]}</td></tr>`;
            }
            details += `</table>`;
            $('#class-student-details').html(details);
            $('#class-student-details').show();
            localStorage.setItem('student', student);
        } else {
            exitClassStudentDetails();
        }
    });
}

function classQuizDetails(_class, quiz) {
    $('#class-details').hide();
    let details = `
        <span id="exit" onclick="exitClassQuizDetails();">&leftarrow;</span>
        <div class="header">${_class}</div>
        <div id="name">${quiz}</div>
        <table>
            <tr><th>Name</th><th>Score</th><th>Time Limit</th></tr>
    `;
    let data = {};
    data['quizDetails'] = quiz;
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    getQuizData(data, o => {
        if (o.correct) {
            for (const row of o.details.slice(1)) {
                details += `<tr><td>${row[0]}</td><td>${row[3]}</td><td>${row[1]}</td></tr>`;
            }
            details += `</table>`;
            $('#class-quiz-details').html(details);
            $('#class-quiz-details').show();
            localStorage.setItem('quiz', quiz);
        } else {
            exitClassQuizDetails();
        }
    });
}

function exitClassDetails() {
    adminPortal(localStorage.getItem("user"), localStorage.getItem("pass"));
}

function exitClassStudentDetails() {
    $('#class-student-details').html('');
    $('#class-details').show();
}

function exitClassQuizDetails() {
    $('#class-quiz-details').html('');
    $('#class-details').show();
}
