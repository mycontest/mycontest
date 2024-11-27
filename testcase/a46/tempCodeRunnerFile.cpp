#include<iostream>
#include<fstream>
#include<string>
using namespace std;
bool isPalindrome(int n) {

        if(n<0) return false;
        else{
            long long s=0,x=n;
            while(n!=0){
                s=s*10+n%10;
                n=n/10;
            }
            
            return ((s==x)?'YES':'NO');
        }
}
string rv(string s){
    string d ="";
    int i = 0 ;
    while(i<s.size()){
        d = s[i] + d ;
        i++;  
    }
    return d;
}
void input(int i){
    ofstream in("input"+to_string(i)+".txt");
    string x = to_string(rand()%20000) ; 
    if(i%2==0) 
        in<<x<<rv(x); 
    else 
        in<<x; 
}
void output(int i){
   ifstream in("input"+to_string(i)+".txt");
   ofstream out("output"+to_string(i)+".txt");
   int s;
   in>>s;
   out<<isPalindrome(s);
}
int main(){

    for(int i=0;i<10;i++) {
        input(i);
        output(i);
    }
}
