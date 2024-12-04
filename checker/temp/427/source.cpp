#include <bits/stdc++.h>
using namespace std;

int main() { 
    int A, B, C; 
    cin >> A >> B >> C;
    int max_moves = max(B - A, C - B) - 1;
    cout << max_moves << endl;
}
