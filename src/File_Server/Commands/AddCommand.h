#ifndef ADD_COMMAND_H
#define ADD_COMMAND_H

// Standard library:
#include <vector>
#include <string>
#include <stdexcept>  // for exception throwing
#include <iterator>  // for 'for_each' function

// Our library:
#include "Commands/ICommand.h"
#include "IOAdapters/IOutput.h"
#include "FileManager/IFileManager.h"
#include "FileManager/Exceptions.h"
#include "Compressor/IStringCompressor.h"

class AddCommand : public ICommand {
private:
    IOutput& output;               // to display output
    IFileManager& fileManager;     // to interact with files
    IStringCompressor& compressor; // to compress and decompress strings
    
    /**
     * @brief given all of the arguments for the add command - this method construct the content as a string the user wants to save in the file.
     * @param commandArgs command's arguments
     * @return string content
     */
    string construct_text(const vector<string>& commandArgs) noexcept;

public:
    /**
     * @brief Construct an add command
     */
    AddCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept;

    /**
     * @brief execute the add command - expect a filename and content and adds a file with that content
     * @param commandArgs the arguments of the command - first one being the filename and the rest is the content separated by spaces
     */
    void execute(const vector<string>& commandArgs) noexcept override;
};

#endif
