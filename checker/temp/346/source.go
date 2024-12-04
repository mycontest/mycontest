package main

import ("fmt"; "os")

func main(){
    in, _ := os.Open("input.txt")
    out, _ := os.Create("output.txt")
    var a, b int
    fmt.Fscanf(in, "%d %d", &a, &b)
    fmt.Fprintf(out, "%d", a+b)
}