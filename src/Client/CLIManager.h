#ifndef CLI_MANAGER_H
#define CLI_MANAGER_H

#include <string>
#include <vector>
#include <iostream>
using namespace std;

#include "IInput.h"
#include "IOutput.h"

// This class implements the CLI.
// It reads input directly from the console and prints output to the console.
class CLIManager : public IInput, public IOutput {
public:
    // Constructor and Destructor
    CLIManager() noexcept;
    CLIManager(istream& in, ostream& out) noexcept;
    virtual ~CLIManager() = default;

    // IInput
    string readInput() noexcept override;

    // IOutput
    void display(const string& output) noexcept override;
    void displayError(const string& error) noexcept override;
private:
    istream& in;
    ostream& out;
};

#endif // CLI_MANAGER_H