function logout() {
    localStorage.setItem("username","");
    localStorage.setItem("password","");
    location.href = `../index.html`;
}

function loadQuiz(q, t) {
    let data = {};
    data['user'] = localStorage.getItem("username");
    data['pswrd'] = localStorage.getItem("password");
    data['quizInfo'] = q;
    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbyk0zW3toH073872pM6_YcGSqTnxeBbSWrsC7GKeK0sZTDm2V8neDePJw/exec',
        method: "GET",
        dataType: "json",
        data: data,
        success: function (o) {
            localStorage.setItem("quiz", q);
            localStorage.setItem("time-limit", t);
            localStorage.setItem("correct-points", o.info[3]);
            localStorage.setItem("incorrect-points", o.info[4]);
            localStorage.setItem("blank-points", o.info[5]);
            location.href = `test.html`;
        }
    });
}

(function() {
    $("#loadButtons").show();
    let user = localStorage.getItem("username");
    let pswrd = localStorage.getItem("password");

    if (user == "" || pswrd == ""){
        location.href = `../index.html`;
    }

    let data = {};
    data['user'] = user;
    data['pswrd'] = pswrd;
    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbwqvNVeFbXM7mRUniqGfoO-KDfCNn0dpWZH1COiiLh5SPvs9Ig/exec',
        method: "GET",
        dataType: "json",
        data: data,
        success: function (o) {
            let details = o.details;
            let dashboard = `
                <div class="container">
                    <div id="header" class="row">
                        <div class="col-10">
                            <div id="welcome">Welcome, ${o.student.split(" ")[0]}!</div>
                        </div>
                        <div class="col-2">
                            <button id="logout" class="btn" onclick="logout();">Logout</button>
                        </div>
                    </div>
                    <div class="table-title row"><div class="col">To-Do</div></div>
                    <div class="row"><div class="col">
                        <table>
                            <tr class="table-header">
                                <th>NAME</th>
                                <th>TIME</th>
                                <th>DUE DATE</th>
                            </tr>`;
            for (let i = 1; i < details.length; i++) {
                if (details[i] != '') {
                    if (details[i][3] === "") {
                        dashboard += `<tr class="clickable" onclick="loadQuiz('${details[i][0]}', ${details[i][1]});">
                            <td id="quiz${i}">${details[i][0]}</td>
                            <td>${details[i][1]}</td>
                            <td></td>
                        </tr>`;
                    }
                }
            }
            dashboard += `
                        </table>
                    </div></div>
                    <div class="table-title row"><div class="col">Submitted</div></div>
                    <div class="row"><div class="col">
                        <table>
                            <tr class="table-header">
                                <th>NAME</th>
                                <th>STATUS</th>
                                <th>SCORE</th>
                            </tr>`;
            for (let i = 1; i < details.length; i++) {
                if (details[i] != '') {
                    if (details[i][3] !== "") {
                        dashboard += `<tr>
                            <td id="quiz${i}">${details[i][0]}</td>
                            <td>Graded</td>
                            <td>${details[i][3]}</td>
                        </tr>`;
                    }
                }
            }
            dashboard += `
                        </table>
                    </div></div>
                </div>`;
            $('#dashboard').html(dashboard);
            $("#loadButtons").hide();
            localStorage.setItem('name', o.student);
        }
    });
})();
