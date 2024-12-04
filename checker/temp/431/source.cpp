#include <bits/stdc++.h>
using namespace std;

int main() { 
    int a,b,c; 
    cin >> a >> b >> c;
    int d = max(b - a, c - b) - 1;
    cout << d;
}