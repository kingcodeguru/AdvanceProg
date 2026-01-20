#include "AddCommand.h"

AddCommand::AddCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept :
    output(outP),
    fileManager(fileM),
    compressor(comp) {}

void AddCommand::execute(const vector<string>& commandArgs) noexcept {
    // expect a filename and content that consist of at least one token
    if (commandArgs.size() < 2) {
        output.displayError("400 Bad Request");
        return;
    }
    // filename being the first element in the vector - must not be empty
    string filename = commandArgs.front();
    if (filename.empty()) {
        output.displayError("400 Bad Request");
        return;
    }
    string to_write = construct_text(commandArgs);
    // compress to_write
    string text = compressor.compress(to_write); // create one full string
    
    try {
        fileManager.write(filename, text);         // write to the file the content and save it using fileManager
        // Success!
        output.display("201 Created");

    } catch (const FileExist& err) {
        // file already exists - display 404
        output.displayError("404 Not Found");
    } catch (const runtime_error& err) {
        // couldn't create file - server's fault
        output.displayError("500 Internal Server Error");
    }
}

string AddCommand::construct_text(const vector<string>& commandArgs) noexcept {
    string ret = commandArgs[1]; // create one full string
    // for each token but the first one - add space and then it. so that {"hello", "world"} will turn to "hello world"
    for (auto token = next(commandArgs.begin(), 2); token != commandArgs.end(); ++token) {
        ret += " " + *token;
    }
    return ret;
}