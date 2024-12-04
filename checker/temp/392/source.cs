using System;

class Program {
    static void Main() {
        string[] inputs = Console.ReadLine().Split();
        int a = int.Parse(inputs[0]);
        int b = int.Parse(inputs[1]);
        Console.WriteLine($"{b} {a}");
    }
}
