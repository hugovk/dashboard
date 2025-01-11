document.addEventListener("DOMContentLoaded", () => {
  fetch("orphaned_backports.json")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#table-orphaned-backports tbody");
      if (!tableBody) {
        console.error("Table body not found");
        return;
      }
      data.candidates.forEach((candidate, index) => {
        const row = document.createElement("tr");
        const countCell = document.createElement("td");
        const prNumberCell = document.createElement("td");
        const titleCell = document.createElement("td");
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
        row.appendChild(createdCell);
        row.appendChild(updatedCell);
        row.appendChild(authorCell);
        tableBody.appendChild(row);
      });

      const lastUpdate = new Date(data.last_update);
      const formattedLastUpdate = lastUpdate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const lastUpdateParagraph = document.createElement("p");
      lastUpdateParagraph.textContent = `Last updated ${formattedLastUpdate}. (Updated daily.)`;
      document.querySelector("#table-orphaned-backports").after(lastUpdateParagraph);

      document.getElementById("loading-orphaned-backports").style.display = "none";
    })
    .catch((error) => console.error("Error loading JSON:", error));
});
