// Import markdown-it and markdown-it-container
import MarkdownIt from 'markdown-it';
import markdownitContainer from 'markdown-it-container';

function loadMarkdown(url) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById('main_content').innerHTML = markdownToHTML(data);
    })
    .catch(error => console.error('Error loading markdown:', error));
}

function markdownToHTML(markdown) {
  const md = new MarkdownIt();

  // Extend markdown-it to support separator lines
  md.use(markdownitContainer, 'separator', {
    validate: function(params) {
      return params.trim().match(/^--$/);
    },
    render: function(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // Opening tag
        return '<hr class="separator">';
      } else {
        // Closing tag
        return '';
      }
    }
  });

  return md.render(markdown);
}
