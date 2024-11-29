let page = 0;

// Pad string to length 4
const len4 = (str = "") => str.toString().padStart(4, '0');

// Update the page and fetch attempts
const setPage = (increment) => {
  page += increment;
  getAttemptsMe();
};

// Generate HTML rows for the table
const renderTableRows = (data) => {
  return data.map(x => `
    <tr>
      <td scope="row">
        <a href="/contest/${contestid}/code?id=${x.id}" target="_blank">${x.id} </a>
      </td>
      <td>
        <a href="./tasks?task_id=${x.task_id}">${len4(x.task_id)}</a>
      </td>
      <td>${x.lang}</td>
      <td>
        <span class="${x.eventnum === 1 ? 'text-success' : (x.eventnum === 0 ? 'text-secondary' : 'text-danger')}">  ${x.event} </span>
      </td>
      <td>${x.time} Ms</td>
      <td>${x.memory} Kb</td>
    </tr>
  `).join('');
};

// Fetch attempts and update the table
const getAttemptsMe = () => {
  $.get(`/contest/${contestid}/attempts/one?task_id=${taskid}&page=${page}`, (data, status) => {
    if (status !== 'success' || !Array.isArray(data)) {
      console.error('Failed to fetch data or invalid response');
      return;
    }

    // Handle empty response for non-zero pages
    if (page > 0 && data.length === 0) {
      page--;
      getAttemptsMe();
      return;
    }

    // Render the table rows
    const tableBody = renderTableRows(data);
    document.getElementById("data").innerHTML = tableBody;
  }).fail(() => {
    console.error('Error occurred while fetching data.');
  });
};

// Initial fetch
getAttemptsMe();

// Auto-refresh every 3 seconds
setInterval(getAttemptsMe, 5000);
