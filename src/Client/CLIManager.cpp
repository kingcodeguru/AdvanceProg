#include "CLIManager.h"

CLIManager::CLIManager(istream& in, ostream& out) noexcept : in(in), out(out) {}
CLIManager::CLIManager() noexcept : in(cin), out(cout) {}

string CLIManager::readInput() noexcept {
    string input;
    if (!getline(in, input)) {
        return "";
    }
    return input;
}

void CLIManager::display(const string& output) noexcept {
    out << output << endl;
}

void CLIManager::displayError(const string& error) noexcept {
    out << error << endl;
}
