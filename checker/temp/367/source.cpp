#include <fstream>

using namespace std;

int a,b;

ifstream in("input.txt");
ofstream out("output.txt");

int main(){
    in >> a >> b;
    out << a+b;
    return 0;
}