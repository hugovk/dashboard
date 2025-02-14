document.addEventListener("DOMContentLoaded", () => {
  const toc = document.createElement("ul");
  toc.id = "table-of-contents";

  document.querySelectorAll("h2").forEach((h2) => {
    const slug = h2.textContent
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    h2.id = slug;

    const anchor = document.createElement("a");
    anchor.href = `#${slug}`;
    anchor.className = "anchor-link";
    anchor.textContent = "#";
    h2.appendChild(anchor);

    h2.addEventListener("click", () => {
      window.location.hash = slug;
    });

    const tocItem = document.createElement("li");
    const tocLink = document.createElement("a");
    tocLink.href = `#${slug}`;
    tocLink.textContent = h2.textContent.replace(/#$/, "");
    tocItem.appendChild(tocLink);
    toc.appendChild(tocItem);
  });

  const h1 = document.querySelector("h1");
  h1.after(toc);
});
