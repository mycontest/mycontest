
let lang = localStorage.getItem('lang') || 'text/x-c++src';
let theme = localStorage.getItem('theme') || 'seti';


let Editor1 = CodeMirror.fromTextArea(document.getElementById("code-view1"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: theme
});

let EditorInput = CodeMirror.fromTextArea(document.getElementById("input"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: theme
});

let EditorOutput = CodeMirror.fromTextArea(document.getElementById("output"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: theme
});

Editor1.on('change', (editor) => {
  try {
    let code = editor.doc.getValue()
    localStorage.setItem(`mecompiler`, code)
  } catch {
    console.log("I have error . Ooo no i am error :) . fun.Editor.On")
  }
});

EditorInput.on('change', (editor) => {
  try {
    let code = editor.doc.getValue()
    localStorage.setItem(`cinput`, code)
  } catch {
    console.log("I have error . Ooo no i am error :) . fun.Editor.On")
  }
});

const sendCodeCompiler = () => {
  let code = Editor1.getValue()
  let input = EditorInput.getValue()
  let lang = document.getElementById("lang").value;
  $("#load").show();
  $.post('/compiler', {code,lang,input}, (res)=>{ 
      $("#load").fadeOut(500);
      let data  = res.data || {}
      if(res.data.error==1)
          return EditorOutput.setValue((data.errorMessage.stderr ||data.errorMessage.cmd)+"\n\nInfo=> Time:"+(data.time || 0 )+"ms , Memory: "+(data.memory || 0)+"kb")
      if(res.output)
        return EditorOutput.setValue(res.output+"\n\nInfo=> Time:"+res.data.time+"ms , Memory: "+res.data.memory+"kb")
      return EditorOutput.setValue(res.message)
  });
}

let selectLang = () => {
  try {
    const lang = document.getElementById("lang").value;
    localStorage.setItem('lang', lang)
    Editor1.setOption("mode", lang);
    Editor1.setValue(localStorage.getItem(`mecompiler`) || data[lang] || "")
  } catch  {
    console.log("I have error . Ooo no i am error :). fun.selectLang" )
  }
}

const selectTheme = () => {
  try {
    const theme = document.getElementById("theme").value;
    localStorage.setItem('theme', theme)
    Editor1.setOption("theme", theme);
    EditorOutput.setOption("theme", theme);
    EditorInput.setOption("theme", theme);
  } catch  {
    console.log("I have error . Ooo no i am error :). fun.selectLang" )
  }
}

let langSelectStart = () => {
  try {
    let lang = localStorage.getItem('lang') || 'text/x-c++src';
    Editor1.setValue(data[lang] || "")  //localStorage.getItem(`mecompiler`) || 
    EditorInput.setValue(localStorage.getItem(`cinput`) ||  "")
    document.getElementById("lang").value = lang
    document.getElementById("theme").value = theme
  } catch {
    console.log("I have error . Ooo no i am error :) . fun.langSelectStart")
  }
}


$(document).ready(()=>{
  console.log("Start:)");
  langSelectStart()
})

let data = {
  'text/x-mysql':"select 1;",
  'text/x-csrc': `#include <stdio.h>
int main(){
    int a,b;    
    scanf("%d %d", &a, &b);
    printf("%d", a+b);
    return 0;
}`,
  'text/x-c++src': `#include <iostream>
using namespace std;
int a,b;
int main(){
  cin >> a >> b;
  cout << a+b;
  return 0;
}`,
  "text/x-java": `import java.io.*;
import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner in = new Scanner(System.in);
        PrintWriter out = new PrintWriter(System.out);
        int a = in.nextInt();
        int b = in.nextInt();
        out.println(a + b);
        out.flush();
    }
} `,
  "text/x-python": `print(sum(map(int,input().split())))`,
  "text/javascript": `const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

const [a, b] = data.split(' ').map(x => parseInt(x));
process.stdout.write( '' + (a+b) );`,
  "text/x-go": `package main

import "fmt"

func main() {
  var a, b int
  fmt.Scan(&a, &b)
  fmt.Print(a + b)
}`,
  "text/x-csharp": `using System;

public class Sum{
  private static void Main(){
    string[] tokens = Console.ReadLine().Split(' ');
    Console.WriteLine(int.Parse(tokens[0]) + int.Parse(tokens[1]));
  }
}`
}
 
 