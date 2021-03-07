function classDetails(clas) {
    $('#admin-portal').hide();
    let details = `
        <span id="exit" onclick="exitStudentDetails();">&leftarrow;</span>
        <div class="header">${clas}</div>
        <table>
            <tr><th>Quiz</th></tr>
    `;
    let data = {};
    data['classDetails'] = clas;
    data['user'] = localStorage.getItem("user");
    data['pswrd'] = localStorage.getItem("pass");
    getUserData(data, o => {
        if (o.correct) {
            for (const row of o.details.slice(1)) {
                details += `<tr><td>${row[0]}</td></tr>`;
            }
            details += `</table>`;
            $('#class-details').html(details);
            $('#class-details').show();
            localStorage.setItem('class', clas);
        } else {
            reset();
        }
    });
}

function exitClassDetails() {
    adminPortal(localStorage.getItem("user"), localStorage.getItem("pass"));
}
