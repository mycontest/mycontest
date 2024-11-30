let lang = localStorage.getItem('lang') || 'text/x-c++src';

let Editor = CodeMirror.fromTextArea(document.getElementById("code-view"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: 'seti'
});

Editor.on('change', (editor) => {
  try {
    let code = editor.doc.getValue()
    let lang = localStorage.getItem('lang_code');
    localStorage.setItem(`${task_id}_${lang}`, code)
  } catch {
    console.log("Oops, something went wrong! It seems there's an error, code: Fun.Editor.On")
  }
});

const sendCode = () => {
  let value = Editor.getValue()
  document.getElementById("code").value = value;
  document.forms["form_code"].submit()
}

const langSelect = () => {
  try {
    const lang_code = document.getElementById("lang_code").value;
    localStorage.setItem('lang_code', lang_code);
    Editor.setOption("mode", lang_code);
    Editor.setValue(localStorage.getItem(`${task_id}_${lang_code}`) || "")
  } catch {
    console.log("Oops, something went wrong! It seems there's an error, code: Fun.selectLang")
  }
}

let langStart = () => {
  try {
    let lang_code = localStorage.getItem('lang_code') || document.getElementById("lang_code").value;
    Editor.setValue(localStorage.getItem(`${task_id}_${lang_code}`) || "")
    document.getElementById("lang_code").value = lang_code
    document.getElementById("theme").value = theme
  } catch {
    console.log("Oops, something went wrong! It seems there's an error, code: Fun.langSelectStart")
  }
}

$(document).ready(() => { langStart() });