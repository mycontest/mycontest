#include <iostream>
#include <algorithm> // For std::max
using namespace std;

int main() {
    // Declare the integers A, B, C
    int A, B, C;

    // Read three integers from input
    cin >> A >> B >> C;

    // Calculate the maximum moves
    int max_moves = max(B - A, C - B) - 1;

    // Print the result
    cout << max_moves << endl;

    return 0;
}
