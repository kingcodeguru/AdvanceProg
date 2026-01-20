#ifndef IOUTPUT_H
#define IOUTPUT_H

#include <string>
using namespace std;

class IOutput {
public:
    virtual ~IOutput() = default;

    virtual void display(const string& text) = 0;
    virtual void displayError(const string& error) = 0;
};

#endif