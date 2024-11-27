let lang = localStorage.getItem('lang') || 'text/x-c++src';
let theme = localStorage.getItem('theme') || 'seti';


let Editor = CodeMirror.fromTextArea(document.getElementById("code-view"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: theme
});

let Editor1 = CodeMirror.fromTextArea(document.getElementById("err-view"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: 'lang',
  theme: theme
});