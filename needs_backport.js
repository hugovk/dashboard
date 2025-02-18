document.addEventListener("DOMContentLoaded", () => {
  fetch("needs_backport.json")
    .then((response) => response.json())
    .then((data) => {
      const reasons = {
        "PRs missing backports": "table-prs-missing-backports",
        "PRs with backports": "table-prs-with-backports",
        "issues with backport labels": "table-issues-with-backport-labels",
      };

      Object.keys(reasons).forEach((reasonKey) => {
        const tableBody = document.querySelector(`#${reasons[reasonKey]} tbody`);
        const reasonData = data.reasons.find((reason) => reason[reasonKey]);
        const countId = reasons[reasonKey].replace("table-", "count-");

        if (reasonData && reasonData[reasonKey].length > 0) {
          reasonData[reasonKey].forEach((candidate, index) => {
            const row = document.createElement("tr");
            const countCell = document.createElement("td");
            const prNumberCell = document.createElement("td");
            const titleCell = document.createElement("td");
            const backportCell = document.createElement("td");
            const createdCell = document.createElement("td");
            const updatedCell = document.createElement("td");
            const authorCell = document.createElement("td");
            const prNumberLink = document.createElement("a");
            const titleLink = document.createElement("a");

            countCell.textContent = index + 1;

            prNumberLink.href = candidate.html_url;
            prNumberLink.textContent = `#${candidate.number}`;
            prNumberCell.appendChild(prNumberLink);

            titleLink.href = candidate.html_url;
            titleLink.textContent = candidate.title;
            titleCell.appendChild(titleLink);

            const backportLabels = candidate.labels
              .filter((label) => label.name.startsWith("needs backport to"))
              .map((label) => label.name.replace("needs backport to ", ""))
              .join(", ");
            backportCell.textContent = backportLabels;

            if (backportLabels) {
              const firstLabel = backportLabels.split(", ")[0].replace(/\./g, "");
              backportCell.setAttribute("data-sort", firstLabel);
            }

            createdCell.textContent = candidate.created_at.split("T")[0];
            updatedCell.textContent = candidate.updated_at.split("T")[0];
            createdCell.classList.add("created");
            updatedCell.classList.add("updated");

            const authorLink = document.createElement("a");
            const authorName =
              candidate.user.type === "Mannequin"
                ? candidate.user.html_url.split("/").pop()
                : candidate.user.login;
            authorLink.href = `https://github.com/python/cpython/issues/${authorName}`;
            authorLink.textContent = authorName;
            authorCell.appendChild(authorLink);

            row.appendChild(countCell);
            row.appendChild(prNumberCell);
            row.appendChild(titleCell);
            row.appendChild(backportCell);
            row.appendChild(createdCell);
            row.appendChild(updatedCell);
            row.appendChild(authorCell);
            tableBody.appendChild(row);
          });

          document.getElementById(countId).textContent = reasonData[reasonKey].length;
        } else {
          document.getElementById(countId).textContent = "0";
          const noDataMessage = document.createElement("p");
          noDataMessage.textContent = "(none found)";
          tableBody.parentElement.replaceWith(noDataMessage);
        }
      });

      const lastUpdate = new Date(data.last_update);
      const formattedLastUpdate = lastUpdate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const lastUpdateParagraph = document.createElement("p");
      lastUpdateParagraph.textContent = `Last updated ${formattedLastUpdate}. (Updated daily.)`;
      document.querySelector("#tables-container").appendChild(lastUpdateParagraph);

      document.getElementById("loading-needs-backport").style.display = "none";
    })
    .catch((error) => console.error("Error loading JSON:", error));
});
