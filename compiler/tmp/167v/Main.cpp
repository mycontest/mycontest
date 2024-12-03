#include "bits/stdc++.h"
using namespace std;
#define ll long long
#define ld long double

void solve() {
  
   int n, x = 0, y = 0, i = 1;
   cin>>n;

   while(true){
      if(i%2==0) {
        x = x + (2 * i - 1); 
      //  cout<<x<<endl;
      } else {
        x = x + -1 * (2 * i - 1); 
       // cout<<x<<endl;
      }

      if(abs(x) > n) {
        if(i%2 == 1){
          cout<<"Ali"<<endl;
        } else {
          cout<<"Vali"<<endl;
        }
        break;
      }

      i++;
   }

}

int main()
{
    ios::sync_with_stdio(0); cin.tie(0);

    int n; cin>>n;
    while(n--){
      solve();
    }   
}