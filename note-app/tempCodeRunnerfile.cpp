#include <iostream>
#include <iomanip>
using namespace std;
#define N_MAX 20
long double fac1(unsigned int n); // Iterative solution
long double fac2(unsigned int n); // Recursive solution
int main()
{
    unsigned int n;
    // Outputs floating-point values without decimal places:
    cout << fixed << setprecision(0);
    // — Iterative computation of factorial —
    cout << setw(10) << "n"
         << setw(30) << "Factorial of n"
         << " (Iterative solution)\n"
         << "---------------------------------------------" << endl;
    for (n = 0; n <= N_MAX; ++n)
        cout << setw(10) << n
             << setw(30) << fac1(n) << endl;
    cout << "\nGo on with <return>";
    cin.get();
    // — Recursive computation of factorial —
    cout << setw(10) << "n"
         << setw(30) << "Factorial of n"
         << " (Recursive solution)\n"
         << "---------------------------------------------" << endl;
    for (n = 0; n <= N_MAX; ++n)
        cout << setw(10) << n
             << setw(30) << fac2(n) << endl;
    cout << endl;
    return 0;
}
// Iterative solution
long double fac1(unsigned int n)
{
    long double result = 1.0;
    for (unsigned int i = 2; i <= n; ++i)
        result *= i;
    return result;
}
// Recursive solution
long double fac2(unsigned int n)
{
    if (n <= 1)
        return 1.0;
    else
        return fac2(n - 1) * n;
}