#ifndef ICOMMANDPARSER_H
#define ICOMMANDPARSER_H

#include <string>
#include <vector>
using namespace std;

class ICommandParser {
public:
    virtual ~ICommandParser() = default;

    virtual vector<string> nextCommand() = 0;
};

#endif
