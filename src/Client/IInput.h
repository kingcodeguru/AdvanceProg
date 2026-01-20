#ifndef I_INPUT_H
#define I_INPUT_H

#include <string>
using namespace std;

// Interface for reading input
class IInput {
public:
    // destructor
    virtual ~IInput() = default;

    virtual string readInput() = 0; 
};

#endif // I_INPUT_H