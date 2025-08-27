document.addEventListener("DOMContentLoaded", () => {
  fetch("../issues_by_dev.json")
    .then((response) => response.json())
    .then((data) => {
      const table = document.querySelector("#table-team");
      const tableBody = table.querySelector("tbody");
      if (!tableBody) {
        console.error("Table body not found");
        return;
      }

      // Update header row
      const thead = table.querySelector("thead");
      if (thead) {
        thead.innerHTML = `
          <tr>
            <th>Count</th>
            <th>Author</th>
            <th>Issues</th>
            <th>PRs</th>
            <th>Total</th>
          </tr>
        `;
      }

      let totalIssues = 0;
      let totalPRs = 0;
      let totalCombined = 0;
      let tally = 1;

      Object.entries(data).forEach(([author, stats]) => {
        if (author === "last_update") return;

        const row = document.createElement("tr");

        const tallyCell = document.createElement("td");
        tallyCell.textContent = tally++;

        const authorCell = document.createElement("td");
        const authorLink = document.createElement("a");
        authorLink.href = `https://github.com/${author}`;
        authorLink.textContent = author;
        authorCell.appendChild(authorLink);

        const issuesCell = document.createElement("td");
        const issuesLink = document.createElement("a");
        issuesLink.href = `https://github.com/python/cpython/issues/${author}`;
        issuesLink.textContent = stats.issues;
        issuesCell.appendChild(issuesLink);

        const prsCell = document.createElement("td");
        const prsLink = document.createElement("a");
        prsLink.href = `https://github.com/python/cpython/pulls/${author}`;
        prsLink.textContent = stats.prs;
        prsCell.appendChild(prsLink);

        const totalCell = document.createElement("td");
        const combined = stats.issues + stats.prs;
        const totalLink = document.createElement("a");
        totalLink.href = `https://github.com/python/cpython/issues?q=is%3Aopen+author%3A${author}`;
        totalLink.textContent = combined;
        totalCell.appendChild(totalLink);

        row.appendChild(tallyCell);
        row.appendChild(authorCell);
        row.appendChild(issuesCell);
        row.appendChild(prsCell);
        row.appendChild(totalCell);
        tableBody.appendChild(row);

        totalIssues += stats.issues;
        totalPRs += stats.prs;
        totalCombined += combined;
      });

      // Add summary row
      const totalRow = document.createElement("tr");
      totalRow.style.fontWeight = "bold";

      const emptyCell = document.createElement("td");
      emptyCell.textContent = "";
      emptyCell.setAttribute("data-sort", tally + 1);

      const totalAuthorCell = document.createElement("td");
      totalAuthorCell.textContent = "Total";

      const totalIssuesCell = document.createElement("td");
      totalIssuesCell.textContent = totalIssues;

      const totalPRsCell = document.createElement("td");
      totalPRsCell.textContent = totalPRs;

      const totalCombinedCell = document.createElement("td");
      totalCombinedCell.textContent = totalCombined;

      totalRow.appendChild(emptyCell);
      totalRow.appendChild(totalAuthorCell);
      totalRow.appendChild(totalIssuesCell);
      totalRow.appendChild(totalPRsCell);
      totalRow.appendChild(totalCombinedCell);
      tableBody.appendChild(totalRow);

      // Last update info
      const lastUpdate = new Date(data.last_update);
      const formattedLastUpdate = lastUpdate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const lastUpdateParagraph = document.createElement("p");
      lastUpdateParagraph.textContent = `Last updated ${formattedLastUpdate}. (Updated daily.)`;
      table.after(lastUpdateParagraph);

      document.getElementById("loading-team").style.display = "none";
    })
    .catch((error) => console.error("Error loading JSON:", error));
});
