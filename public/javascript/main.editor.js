let lang = localStorage.getItem('lang') || 'text/x-c++src';
let theme = localStorage.getItem('theme') || 'seti';

let Editor = CodeMirror.fromTextArea(document.getElementById("code-view"), {
  lineNumbers: true,
  matchBrackets: true,
  mode: lang,
  theme: theme
});

Editor.on('change', (editor) => {
  try {
    let code = editor.doc.getValue()
    let lang = localStorage.getItem('lang') || 'text/x-c++src';
    localStorage.setItem(`${taskid}_${lang}`, code)
  } catch {
    console.log("I have error . Ooo no i am error :) fun.Editor.On")
  }
});

const sendCode = () => {
  let value = Editor.getValue()
  document.getElementById("code").value = value;
  document.forms["fcode"].submit()
}

const selectLang = () => {
  try {
    const lang = document.getElementById("lang").value;
    localStorage.setItem('lang', lang)
    Editor.setOption("mode", lang);
    Editor.setValue(localStorage.getItem(`${taskid}_${lang}`) || data[lang] || "")
  } catch {
    console.log("I have error . Ooo no i am error :) fun.selectLang")
  }
}

const selectTheme = () => {
  try {
    const theme = document.getElementById("theme").value;
    localStorage.setItem('theme', theme)
    Editor.setOption("theme", theme);
  } catch {
    console.log("I have error . Ooo no i am error :) fun.selectLang")
  }
}


let langSelectStart = () => {
  try {
    let lang = localStorage.getItem('lang') || 'text/x-c++src';
    Editor.setValue(localStorage.getItem(`${taskid}_${lang}`) || data[lang] || "")
    document.getElementById("lang").value = lang
    document.getElementById("theme").value = theme
  } catch {
    console.log("I have error . Ooo no i am error :) fun.langSelectStart")
  }
}


$(document).ready(() => {
  console.log("Start:)");
  langSelectStart()
})


let data = {
  'text/x-mysql': "select 1;",
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

