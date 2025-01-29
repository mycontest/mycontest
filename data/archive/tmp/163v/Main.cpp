#include <iostream>
using namespace std;
int main()
{
    long long n;
    cin>>n;
    if(n<3) cout<<n;
    else
    cout<<n * (n-1) * (n-2);
}