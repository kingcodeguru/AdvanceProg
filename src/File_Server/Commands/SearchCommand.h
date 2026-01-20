#ifndef SEARCH_COMMAND_H
#define SEARCH_COMMAND_H

// Standard library:
#include <vector>
#include <string>
#include <stdexcept>  // for exception throwing

// Our library:
#include "Commands/ICommand.h"
#include "IOAdapters/IOutput.h"
#include "FileManager/IFileManager.h"
#include "FileManager/Exceptions.h"
#include "Compressor/IStringCompressor.h"

class SearchCommand : public ICommand {
private:
    IOutput& output;               // to display output
    IFileManager& fileManager;     // to interact with files
    IStringCompressor& compressor; // to compress and decompress strings

    /**
     * @brief given all of the arguments for the get command - this method construct the content as a string the user wants to search for.
     * @param commandArgs command's arguments
     * @return string content
     */
    string construct_text(const vector<string>& commandArgs) noexcept;

    /**
     * @brief checking if filename containing text
     * @param filename name of the file checking it contain text
     * @param text text we are looking for in file
     * @return true if found, false otherwise
     */
    bool file_contain_text(string filename, string text) noexcept;
    bool file_name_contain_text(string filename, string text) noexcept;

public:
    /**
     * @brief Construct an search command
     */
    SearchCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept;

    /**
     * @brief execute the search command - search for the content and display a list of files containing that content
     * @param commandArgs the arguments of the command - expect a content (some tokens that add up to text)
     */
    void execute(const vector<string>& commandArgs) noexcept override;
};

#endif
