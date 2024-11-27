let page = 0;
let setPage = (e) => {
  page = page + e;
  getAttemptsMe();
}

let len4 = (s) => {
  s = s.toString()
  while (s.length < 4) s = '0' + s;
  return s;
}
let getAttemptsMe = () => {
  $.get(`./attempts/api?page=${page}`, (data, status) => {
    if (page > 0 && data.length == 0) {
        page = page - 1;
        getAttemptsMe();
    }
    let tb = ""
    for (let x of data) {
      tb = tb + `<tr><td scope="row"><a href="/contest/${contestid}/mycode?id=${x.id}" target="_blank"><span class="badge bg-primary">${x.id}</span></a></td>
            <td scope="row"><span class="badge bg-dark">${x.username}</span></td>
            <td><a href="./tasks?task_id=${x.tasks_id}" ><span class="badge bg-light text-dark">${len4(x.tasks_id)}</span></a></td>
            <td> <span class="badge bg-primary">${x.lang}</span></td>
            <td> <span class="badge  ${x.eventnum == 1 ? 'bg-success' : (x.eventnum ==0? 'bg-secondary' :'bg-danger')}">${x.event}</span></td>
            <td>${x.time}Ms</td>
            <td>${x.memory}Kb</td></tr>`
    }
    document.getElementById("data").innerHTML = tb
  })
}

getAttemptsMe();
setInterval(() => {
  getAttemptsMe();
}, 3000);
