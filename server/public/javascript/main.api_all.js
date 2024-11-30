let page = 0;

const setPage = (increment) => {
  page += increment;
  getAttemptsMe();
};

const len4 = (str = "") => {
  str = str.toString();
  return str.padStart(4, '0');
};

const renderTableRows = (data) => {
  return data.map(x => `
    <tr>
      <td scope="row"> ${x.attempt_id}</td>
      <td scope="row">${x.username}</td>
      <td>
        <a href="./tasks?task_id=${x.task_id}">${len4(x.task_id)}</a>
      </td>
      <td>${x.lang}</td>
      <td>
        <span class="badge ${x.eventnum === 1 ? 'text-success' : (x.eventnum === 0 ? 'text-secondary' : 'text-danger')}">
          ${x.event}
        </span>
      </td>
      <td>${x.time} Ms</td>
      <td>${x.memory} Kb</td>
    </tr>
  `).join('');
};

const getAttemptsMe = () => {
  $.get(`./attempts/all?page=${page}`, (data, status) => {
    if (status !== 'success' || !Array.isArray(data)) {
      console.error('Failed to fetch data or invalid response');
      return;
    }

    // Handle empty response on non-zero pages
    if (page > 0 && data.length === 0) {
      page--;
      getAttemptsMe();
      return;
    }

    // Render table rows
    const tableBody = renderTableRows(data);
    document.getElementById("data").innerHTML = tableBody;
  }).fail(() => {
    console.error('Error occurred while fetching data.');
  });
};

// Initial fetch
getAttemptsMe();

// Auto-refresh every 3 seconds
setInterval(getAttemptsMe, 3000);
