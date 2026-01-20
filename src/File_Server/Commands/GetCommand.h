#ifndef GET_COMMAND_H
#define GET_COMMAND_H

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

class GetCommand : public ICommand {
private:
    IOutput& output;               // to display output
    IFileManager& fileManager;     // to interact with files
    IStringCompressor& compressor; // to compress and decompress strings
public:
    /**
     * @brief Construct an get command
     */
    GetCommand(IOutput& outP, IFileManager& fileM, IStringCompressor& comp) noexcept;

    /**
     * @brief execute the get command - expect a filename and prints to the screen the content of the file
     * @param commandArgs the arguments of the command - the filename
     */
    void execute(const vector<string>& commandArgs) noexcept override;
};

#endif
