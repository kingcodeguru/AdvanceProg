#include "GetCommand.h"
#include <iostream>

GetCommand::GetCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept :
    output(outP),
    fileManager(fileM),
    compressor(comp) {}

void GetCommand::execute(const vector<string>& commandArgs) noexcept {
    // the get command must have exactly 1 parameter - the filenam
    if (commandArgs.size() != 1) {
        output.displayError("400 Bad Request");
        return;
    }
    // get filename - must not be empty
    string filename = commandArgs.front();
    if (filename.empty()) {
        output.displayError("400 Bad Request");
        return;
    }
    string read_from_file;
    try {
        read_from_file = fileManager.readAll(filename);
    } catch (const FileNotExist& err) {
        // file doesn't exist - call display error and leave
        output.displayError("404 Not Found");
        return;
    } catch (const runtime_error& err) {
            // couldn't open file - server's fault
            output.displayError("500 Internal Server Error");
        return;
    }
    // decompress the content
    string to_print;
    try {
        to_print = compressor.decompress(read_from_file);
    } catch (invalid_argument) {
        output.displayError("500 Internal Server Error");
        return;
    }
    
    string response = "200 Ok\n\n" + to_print;

    output.display(response);
}
