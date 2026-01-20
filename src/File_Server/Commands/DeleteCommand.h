#ifndef DELETE_COMMAND_H
#define DELETE_COMMAND_H

#include "ICommand.h"
#include "IOAdapters/IOutput.h"
#include "FileManager/IFileManager.h"
#include "FileManager/Exceptions.h"
#include <stdexcept>  // for exception throwing

class DeleteCommand : public ICommand {
private:
    IOutput& output;           // to display output
    IFileManager& fileManager;
public:
    /**
     * @brief Construct a delete command
     */
    DeleteCommand(IOutput& outP, IFileManager& fileM) noexcept;

    /**
     * @brief execute the delete command - expect a filename and deletes the file
     * @param commandArgs the arguments of the command - the filename
     */
    void execute(const vector<string>& commandArgs) noexcept override;
};

#endif