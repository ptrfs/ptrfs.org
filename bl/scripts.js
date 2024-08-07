let currentBlog = ""; // Initialize with an empty string or null

function toggle_blog(uri) {
  let mainContent = document.getElementById("main_content");
  if (!mainContent) {
    console.error('Element with ID "main_content" not found.');
    return;
  }

  // Clear previous content
  mainContent.innerHTML = "";

  fetch(uri)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Markdown Content:", data); // Debugging: log the loaded markdown content
      mainContent.innerHTML = markdown_to_html(data);
    })
    .catch((error) => console.error("Error loading markdown:", error));

  // Hide excess blog titles in sidebar TODO: on mobile
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    hide_excess_blog_titles();
  }
}

function hide_excess_blog_titles() {
  let sidebar = document.getElementById("sidebar");
  if (!sidebar) {
    console.error('Element with ID "sidebar" not found.');
    return;
  }

  let blogTitles = sidebar.querySelectorAll(".blog-title");
  if (blogTitles.length > 2) {
    for (let i = 2; i < blogTitles.length; i++) {
      blogTitles[i].style.display = "none";
    }
  }
}

function parse_italics(line) {
  // Convert *italic* and _italic_ text to <em>italic</em>
  return line.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
}

function parse_underline(line) {
  // Convert __underline__ text to <u>underline</u>
  return line.replace(/__(.*?)__/g, "<u>$1</u>");
}

function parse_code(line) {
  // Convert `code` text to <code>code</code>
  return line.replace(/`(.*?)`/g, "<code>$1</code>");
}

function parse_links(line) {
  // Convert [text](url) to <a href="url">text</a>
  return line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

function parse_html_tags(line) {
  // Allow HTML tags for images or other elements
  return line.replace(/<img(.*?)>/g, "<img$1>").replace(
    /<div(.*?)<\/div>/g,
    "<div$1</div>",
  );
}

function load_markdown(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("main_content").innerHTML = markdown_to_html(data);
    })
    .catch((error) => console.error("Error loading markdown:", error));
}

function markdown_to_html(markdown) {
  // Convert Markdown syntax to HTML
  let html = "";
  const lines = markdown.split("\n");
  let inList = false;

  for (let line of lines) {
    if (line.startsWith("# ")) {
      html += `<h1>${line.substring(2)}</h1>`;
      inList = false;
    } else if (line.startsWith("## ")) {
      html += `<h2>${line.substring(3)}</h2>`;
      inList = false;
    } else if (line.startsWith("### ")) {
      html += `<h3>${line.substring(4)}</h3>`;
      inList = false;
    } else if (line.startsWith("#### ")) {
      html += `<h4>${line.substring(5)}</h4>`;
      inList = false;
    } else if (line.trim() === "") {
      html += "<p>&nbsp;</p>"; // Add visible whitespace for empty lines
      inList = false;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.substring(2)}</li>`;
    } else {
      // Handle italic, underline, code, links, images
      line = parse_italics(line);
      line = parse_underline(line);
      line = parse_code(line);
      line = parse_links(line);
      line = parse_html_tags(line);
      line = line.replace(/&nbsp;/g, "&amp;nbsp;"); // Replace &nbsp; with &amp;nbsp; in any context
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  // Close any remaining list
  if (inList) {
    html += "</ul>";
  }

  return `<article>${html}</article>`;
}

// Initial hide excess blog titles on page load
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
  window.addEventListener("DOMContentLoaded", hide_excess_blog_titles);
}
