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
        <a href="/contest/${contest_id}/code?attempt_id=${x.attempt_id}" target="_blank">${x.attempt_id}</a>
      </td>
      <td>
        <a href="./tasks?task_id=${x.task_id}">${len4(x.task_id)}</a>
      </td>
      <td>${x.lang}</td>
      <td>
        <span class="${x.event_num === 1 ? 'text-success' : (x.event_num === 0 ? 'text-secondary' : 'text-danger')}">  ${x.event} </span>
      </td>
      <td>${x.time} Ms</td>
      <td>${x.memory} Kb</td>
    </tr>
  `).join('');
};

// Fetch attempts and update the table
const getAttemptsMe = () => {
  $.get(`/contest/${contest_id}/attempts/one?task_id=${task_id}&page=${page}`, (data, status) => {
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
let count = 0;
let it = setInterval(() => {
  getAttemptsMe();
  count++;
  if (count > 20) clearInterval(it);
}, 2000);
