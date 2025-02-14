document.addEventListener("DOMContentLoaded", () => {
  fetch("potential_closeable_issues.json")
    .then((response) => response.json())
    .then((data) => {
      const tableBodyWithMerged = document.querySelector(
        "#table-potential-closeable-issues tbody",
      );
      const tableBodyWithoutMerged = document.querySelector(
        "#table-no-merged-issues tbody",
      );

      if (!tableBodyWithMerged || !tableBodyWithoutMerged) {
        console.error("Table body not found");
        return;
      }

      let countWithMerged = 0;
      let countWithoutMerged = 0;
      data.candidates.forEach((candidate) => {
        const mergedPrs = (candidate.linked_prs || []).filter((pr) => pr.merged);

        const row = document.createElement("tr");
        const countCell = document.createElement("td");
        const prNumberCell = document.createElement("td");
        const titleCell = document.createElement("td");
        const linkedPrsCell = document.createElement("td");
        const createdCell = document.createElement("td");
        const updatedCell = document.createElement("td");
        const authorCell = document.createElement("td");
        const prNumberLink = document.createElement("a");
        const titleLink = document.createElement("a");

        if (mergedPrs.length === 0) {
          countWithoutMerged += 1;
          countCell.textContent = countWithoutMerged;
        } else {
          countWithMerged += 1;
          countCell.textContent = countWithMerged;
        }

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

        const prCount = (candidate.linked_prs || []).length;
        linkedPrsCell.setAttribute("data-sort", prCount);

        (candidate.linked_prs || []).forEach((pr) => {
          const prLink = document.createElement("a");
          prLink.href = pr.html_url;

          const img = document.createElement("img");
          img.src = pr.merged ? "pr-merged.svg" : "pr-closed.svg";
          img.alt = pr.merged ? "Merged" : "Closed";
          img.classList.add(pr.merged ? "merged" : "closed");

          prLink.appendChild(img);
          linkedPrsCell.appendChild(prLink);
        });

        row.appendChild(countCell);
        row.appendChild(prNumberCell);
        row.appendChild(titleCell);
        row.appendChild(linkedPrsCell);
        row.appendChild(createdCell);
        row.appendChild(updatedCell);
        row.appendChild(authorCell);

        if (mergedPrs.length === 0) {
          tableBodyWithoutMerged.appendChild(row);
        } else {
          tableBodyWithMerged.appendChild(row);
        }
      });

      document.getElementById("count-no-merged-issues").textContent =
        countWithoutMerged;
      document.getElementById("count-potential-closeable-issues").textContent =
        countWithMerged;

      const lastUpdate = new Date(data.last_update);
      const formattedLastUpdate = lastUpdate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const lastUpdateParagraph = document.createElement("p");
      lastUpdateParagraph.textContent = `Last updated ${formattedLastUpdate}. (Updated daily.)`;
      document.querySelector("#table-no-merged-issues").after(lastUpdateParagraph);
      document
        .querySelector("#table-potential-closeable-issues")
        .after(lastUpdateParagraph.cloneNode(true));

      document.getElementById("loading-no-merged-issues").style.display = "none";
      document.getElementById("loading-potential-closeable-issues").style.display =
        "none";
    })
    .catch((error) => console.error("Error loading JSON:", error));
});
