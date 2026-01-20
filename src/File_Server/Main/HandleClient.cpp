#include "HandleClient.h"

HandleClient::HandleClient(IFileManager& fileM, IStringCompressor& comp, ClientConnectionManager& ccm) : cp(ccm), output(ccm), is_exitable(false) {
    // initialize all the needed commands
    ICommand *addPtr = new AddCommand(ccm, fileM, comp);
    ICommand *getPtr = new GetCommand(ccm, fileM,  comp);
    ICommand *searchPtr = new SearchCommand(ccm, fileM, comp);
    ICommand *deletePtr = new DeleteCommand(ccm, fileM);
    commands[ADD] = addPtr;
    commands[GET] = getPtr;
    commands[SEARCH] = searchPtr;
    commands[DELETE] = deletePtr;
}

void HandleClient::to_lower(string& s) noexcept {
    // scans the string and for each char do tolower of the char
    transform(s.begin(), s.end(), s.begin(),
                   [](unsigned char c){ return tolower(c); });
}

void HandleClient::run() noexcept {
    // infinite loop to parse and execute commands
    while (true) {
        // receive the arguments from a generic input
        vector<string> arguments = cp.nextCommand();
        // command cannot be empty
        if (arguments.empty()) {
            // client disconnected
            return;
        }
        // first argument is the always command
        string command_str = arguments[0];
        // make sure the command is in lower case
        to_lower(command_str);
        // calls the matching command without the command string
        arguments.erase(arguments.begin());
        // if the command is exit and the app allows to exit - break the loop
        if (is_exitable && command_str == EXIT) {
            break;
        }
        // checks if the command is a key for the map
        if (commands.count(command_str)) {
            commands[command_str]->execute(arguments);
        } else {
            output.displayError("400 Bad Request");
        }
        // O.W: Invalid command - don't do anything
    }
}
