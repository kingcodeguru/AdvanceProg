
// --- std library ---
#include <filesystem>
#include <string>
#include <gtest/gtest.h>

using namespace std;
namespace fs = std::filesystem;


// --- our library ---
// FileManager headers:
#include "FileManager/IFileManager.h"
#include "FileManager/FileManager.h"
// CLIManager headers:
#include "CLIManager.h"
#include "IOutput.h"
// CLIManager headers:
#include "Compressor/IStringCompressor.h"
#include "Compressor/RLECompressor.h"
// Commands headers:
#include "Commands/ICommand.h"
#include "Commands/AddCommand.h"
#include "Commands/GetCommand.h"
#include "Commands/SearchCommand.h"
#include "Commands/DeleteCommand.h"

TEST(DeleteCommandUnitTests, Sanity) {
    string file;
    string path = "SanityTestFolder";
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;

    ostringstream oss;
    
    IOutput *outPtr = new CLIManager(cin, oss);
    IOutput& out = *outPtr;

    IStringCompressor *scPtr = new RLECompressor();
    IStringCompressor& sc = *scPtr;

    ICommand *addPtr = new AddCommand(out, fileMan, sc);
    ICommand& addCommand = *addPtr;
    ICommand *delPtr = new DeleteCommand(out, fileMan);
    ICommand& delCommand = *delPtr;
    ICommand *getPtr = new GetCommand(out, fileMan, sc);
    ICommand& getCommand = *getPtr;
    
    // ------------ TEST 1 ------------
    file = "file1.txt";
    addCommand.execute({file, "hello"});
    delCommand.execute({file});
    oss.str("");
    getCommand.execute({file});
    EXPECT_EQ(oss.str(), "404 Not Found\n") << "Content mismatch.";
    oss.str("");

    // ------------ TEST 2 ------------
    file = "file2.txt";
    addCommand.execute({file, ""});
    delCommand.execute({file});
    oss.str("");
    getCommand.execute({file});
    EXPECT_EQ(oss.str(), "404 Not Found\n") << "Content mismatch.";
    oss.str("");


    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
    delete outPtr;
    delete addPtr;
    delete getPtr;
    delete delPtr;
    delete scPtr;
}

TEST(DeleteCommandUnitTests, EdgeCases) {
    string file;
    string path = "edgeCasesTestFolder";
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;

    ostringstream oss;
    IOutput *outPtr = new CLIManager(cin, oss);
    IOutput& out = *outPtr;

    IStringCompressor *scPtr = new RLECompressor();
    IStringCompressor& sc = *scPtr;

    ICommand *addPtr = new AddCommand(out, fileMan, sc);
    ICommand& addCommand = *addPtr;
    ICommand *delPtr = new DeleteCommand(out, fileMan);
    ICommand& delCommand = *delPtr;

    // ------------ TEST 1 ------------
    file = "nonexistentfile.txt";
    delCommand.execute({file});
    EXPECT_EQ(oss.str(), "404 Not Found\n") << "Content mismatch.";
    oss.str("");

    // ------------ TEST 2 ------------
    delCommand.execute({""});
    EXPECT_EQ(oss.str(), "400 Bad Request\n") << "Content mismatch.";
    oss.str("");

    // ------------ TEST 3 ------------
    delCommand.execute({"file1.txt", "extraArg"});
    EXPECT_EQ(oss.str(), "400 Bad Request\n") << "Content mismatch.";
    oss.str("");


    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
    delete outPtr;
    delete addPtr;
    delete delPtr;
    delete scPtr;
}
