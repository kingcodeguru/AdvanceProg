#include "DeleteCommand.h"

DeleteCommand::DeleteCommand(IOutput& outP, IFileManager& fileM) noexcept :
    output(outP),
    fileManager(fileM) {}

void DeleteCommand::execute(const vector<string>& commandArgs) noexcept {
    // the delete command must have exactly 1 parameter - the filename
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
    // try to delete the file
    try {
        fileManager.deleteFile(filename);
    } catch (FileNotExist& err) {
        // couldn't find file - call display error and leave
        output.displayError("404 Not Found");
        return;
    }
    // file deleted successfully
    output.display("204 No Content");
}