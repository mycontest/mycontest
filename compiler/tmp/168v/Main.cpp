#include<iostream>
#include<string>
 
using namespace std;
int main ()
{
 //string s;
 //getline(cin,s);
 int s,m;
 scanf("%2d:%2d",&s,&m);
 switch (s) {
 case 0: cout<<"01:10"; break;
 case 1: if(m<10) cout<<"01:10"; else cout<<"02:20"; break;
 case 2: if(m<20) cout<<"02:20"; else cout<<"03:30"; break;
 case 3: if(m<30) cout<<"03:30"; else cout<<"04:40"; break;
 case 4: if(m<40) cout<<"04:40"; else cout<<"05:50"; break;
 case 5: if(m<50) cout<<"05:50"; else cout<<"10:01"; break;
 case 6: case 7: case 8: case 9: cout<<"10:01"; break;
 case 10:if(m<1) cout<<"10:01"; else cout<<"11:11"; break;
 case 11:if(m<11) cout<<"11:11"; else cout<<"12:21"; break;
 case 12:if(m<21) cout<<"12:21"; else cout<<"13:31"; break;
 case 13:if(m<31) cout<<"13:31"; else cout<<"14:41"; break;
 case 14:if(m<41) cout<<"14:41"; else cout<<"15:51"; break;
 case 15:if(m<51) cout<<"15:51"; else cout<<"20:02"; break;
 case 16: case 17: case 18: case 19: cout<<"20:02"; break;
 case 20:if(m<2) cout<<"20:02"; else cout<<"21:12"; break;
 case 21:if(m<12) cout<<"21:12"; else cout<<"22:22"; break;
 case 22:if(m<22) cout<<"22:22"; else cout<<"23:32"; break;
 case 23:if(m<32) cout<<"23:32"; else cout<<"00:00"; break;
 default: cout<<"";
 }
 return 0;
}