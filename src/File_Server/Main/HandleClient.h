#ifndef APP_H
#define APP_H

// Standard library includes:
#include <iostream>
#include <map>
#include <string>
#include <cstdlib> // for the get_env (to get the global environment variable for path)
#include <algorithm> // Required for transform
#include <cctype>    // Required for tolower
#include <stdexcept>
using namespace std;

// our includes:
#include "FileManager/IFileManager.h"
#include "FileManager/FileManager.h"

#include "IOAdapters/IOutput.h"
#include "IOAdapters/ICommandParser.h"
#include "IOAdapters/ClientConnectionManager.h"

#include "Compressor/IStringCompressor.h"
#include "Compressor/RLECompressor.h"

#include "Commands/ICommand.h"
#include "Commands/AddCommand.h"
#include "Commands/GetCommand.h"
#include "Commands/SearchCommand.h"
#include "Commands/DeleteCommand.h"

#include "Executor/Runnable.h"

//define the name of the environment variable that stores the path
#define PATH "DRIVE_APP_DIR"

class HandleClient : public Runnable {
private:
    // constants for commands
    const string ADD = "post";
    const string GET = "get";
    const string SEARCH = "search";
    const string DELETE = "delete";
    const string EXIT = "exit";
    // receive a string and maps it to a general command
    map<string, ICommand*> commands;
    // To be able to parse
    ICommandParser& cp;
    // To be able to display wrong command output
    IOutput& output;
    // whether the app can be exitable (by "exit" command)
    bool is_exitable; 
    void to_lower(string& s) noexcept;
public:
    HandleClient(IFileManager& fileM, IStringCompressor& comp, ClientConnectionManager& ccm);

    /**
     * @brief Destroy the HandleClient object
     */
    virtual ~HandleClient() = default;

    /**
     * @brief Runs the application, processing commands in an infinite loop
     */
    void run() noexcept override;
};

#endif
