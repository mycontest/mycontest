#include <iostream>
using namespace std;
int main()
{

    string s;
    cin>>s;
    
    if(s.find("13")==string::npos) cout<<"omadli chipta";
    else cout<<"omadsiz chipta";
}