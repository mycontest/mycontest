let Editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "seti"
});

let InputOne = CodeMirror.fromTextArea(document.getElementById("input-1"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "seti"
});

let OutputOne = CodeMirror.fromTextArea(document.getElementById("output-1"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "seti"
});

let InputTwo = CodeMirror.fromTextArea(document.getElementById("input-2"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "seti"
});

let OutputTwo = CodeMirror.fromTextArea(document.getElementById("output-2"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "seti"
});

const selectLang = () => {
    const lang = document.getElementById("lang").value;
    Editor.setOption("mode", lang);
}