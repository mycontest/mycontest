#include <iostream>
#include <fstream>
using namespace std;

int main() {
    int a, b;

    // Open the input file
    ifstream inputFile("../../db_init.sql");
    if (!inputFile) {
        cerr << "Error opening input file!" << endl;
        return 1;
    }

    // Read the two numbers from the file
    inputFile >> a >> b;
    inputFile.close();  // Close the input file

    // Perform the addition
    int sum = a + b;

    // Open the output file
    ofstream outputFile("output.txt");
    if (!outputFile) {
        cerr << "Error opening output file!" << endl;
        return 1;
    }

    // Write only the result (sum) to the output file
    outputFile << sum << endl;
    outputFile.close();  // Close the output file

    return 0;
}
