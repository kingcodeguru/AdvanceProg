#ifndef ICOMMAND_H
#define ICOMMAND_H

// Standard library:
#include <vector>
#include <string>
using namespace std;

class ICommand {
public:
    virtual void execute(const vector<string>& commandArgs) = 0;
};

#endif
