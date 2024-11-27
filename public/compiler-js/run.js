var socket = io();
let eskiCode = ""
    // setInterval(runCode, 20000)

function runCode() {
    console.log("Compiler")

    let lang = $("select#lang").val()
    let code = Editor.getValue()
    let inputone = InputOne.getValue()
    let inputtwo = InputTwo.getValue()

    if (eskiCode == code) return;
    eskiCode = code

    socket.emit('input', { code: code, inputOne: inputone, inputTwo: inputtwo, lang: lang });

    socket.on('get output', function(msg) {
        // console.log(msg)
        if (msg.outputOne.stderr)
            OutputOne.setValue(msg.outputOne.stderr || "Error Xatolik")
        else
            OutputOne.setValue(msg.outputOne.stdout || "Error Xatolik")

        if (msg.outputOne.stderr)
            OutputTwo.setValue(msg.outputTwo.stderr || "Error Xatolik")
        else
            OutputTwo.setValue(msg.outputTwo.stdout || "Error Xatolik")
    });

}