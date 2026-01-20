#ifndef ISTRINGCOMPRESSOR_H
#define ISTRINGCOMPRESSOR_H

#include <string>

using namespace std;

class IStringCompressor {

public:
    virtual string compress(string text) = 0;
    virtual string decompress(string context) = 0;
};



#endif
