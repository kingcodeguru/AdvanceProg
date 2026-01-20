#include "SearchCommand.h"

SearchCommand::SearchCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept :
    output(outP),
    fileManager(fileM),
    compressor(comp) {}

void SearchCommand::execute(const vector<string>& commandArgs) noexcept {
    // search command must have at least one argument
    if (commandArgs.size() < 1) {
        output.displayError("400 Bad Request");
        return;
    }
    string text = construct_text(commandArgs); // create one full string
    // text musn't be empty
    if (text.empty()) {
        output.displayError("400 Bad Request");
        return;
    }
    // for each file, we will check if containing text. if so, print the file name.
    vector<string> lf_all = fileManager.listFiles();
    
    vector<string> lf_good; // all files names containing text
    for (auto filename : lf_all) {
        if (file_contain_text(filename, text)) {
            lf_good.push_back(filename);
        } else if (file_name_contain_text(filename, text)) {
            lf_good.push_back(filename);
        }
    }
    string result = construct_text(lf_good);
    string response = "200 Ok\n\n" + result;
    output.display(response);
}

string SearchCommand::construct_text(const vector<string>& commandArgs) noexcept {
    // if the vector is emtpy - the constructed string is empty
    if (commandArgs.empty()) {
        return "";
    }
    string ret = commandArgs[0]; // create one full string
    // for each token but the first one - add space and then it. so that {"hello", "world"} will turn to "hello world"
    for (auto token = next(commandArgs.begin(), 1); token != commandArgs.end(); ++token) {
        ret += " " + *token;
    }
    return ret;
}

bool SearchCommand::file_contain_text(string filename, string text) noexcept {
    // read all file content
    string full_content;
    try {
        full_content = fileManager.readAll(filename);
    } catch (const FileNotExist& err) {
        // file doesn't exist - it's the server fault but keep on searching for files
        return false;
    } catch (const std::runtime_error& err) {
        // couldn't open file - server's fault
        output.displayError("500 Internal Server Error");
        return false;
        
    }
    try
    {full_content = compressor.decompress(full_content);}
    catch (invalid_argument)
    {
        // if decompression failed - return false
        output.displayError("500 Internal Server Error");
        return false;
    }
    // check if file content containing the text using find command
    return full_content.find(text) != string::npos;
}


bool SearchCommand::file_name_contain_text(string filename, string text) noexcept {
    // check if file name containing the text using find command
    return filename.find(text) != string::npos;
}