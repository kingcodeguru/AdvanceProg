#include <string>
#include <gtest/gtest.h>
#include <fstream>
#include "FileManager/IFileManager.h"
#include "FileManager/FileManager.h"
#include "FileManager/Exceptions.h"
#include <stdexcept>  // for exception throwing
using namespace std;

#include <filesystem> // for directory deleting
namespace fs = std::filesystem;

TEST(FileManagerUnitTests, Sanity) {
    string path = "sanityTestFolder";
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    string text, actual, filename;

    // ------------ TEST 1 ------------
    filename = "file1.txt";
    text = "I want to add this text";
    fileMan.write(filename, text);
    actual = fileMan.readAll(filename);
    // compare original string to the string saved in the file
    EXPECT_EQ(text, actual) << "Content mismatch.";

    // ------------ TEST 2 ------------
    filename = "file2.txt";
    text = "This is another file I want to save";
    fileMan.write(filename, text);
    actual = fileMan.readAll(filename);
    // compare original string to the string saved in the file
    EXPECT_EQ(text, actual) << "Content mismatch.";

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, EdgeCases) {
    string path = "edgeCasesTestFolder";
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    string text, actual, filename;

    // ------------ TEST 1 ------------
    filename = "file1/file2?!//"; // Special characters which usually aren't allowed
    text = "Some random text";
    fileMan.write(filename, text);
    actual = fileMan.readAll(filename);
    // compare original string to the string saved in the file
    EXPECT_EQ(text, actual) << "Content mismatch.";

    // ------------ TEST 2 ------------
    filename = "file2.txt"; // usual filename
    text = ""; // empty content
    fileMan.write(filename, text);
    actual = fileMan.readAll(filename);
    // compare original string to the string saved in the file
    EXPECT_EQ(text, actual) << "Content mismatch.";
    
    // ------------ TEST 3 ------------
    filename = "file3.txt";
    text = "FIRST!";
    fileMan.write(filename, text);
    string text2 = "SECOND!";
    // when rewriting to a file, should throw FileExist exception
    EXPECT_THROW(fileMan.write(filename, text2), FileExist);
    actual = fileMan.readAll(filename);
    // the content shouldn't change
    EXPECT_EQ(text, actual) << "Content mismatch.";
    
    // ------------ TEST 4 ------------
    filename = "file4.txt";
    // content of a file that is more than one line
    text = "This is the first line in the file\nThis is the second line in the file\nbye bye!";
    fileMan.write(filename, text);
    actual = fileMan.readAll(filename);
    EXPECT_EQ(text, actual) << "Content mismatch.";
    
    // ------------ TEST 5 ------------
    // for a directory in a sub directory that does't exist
    EXPECT_THROW(new FileManager("dont/exist"), runtime_error);

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, KeepAfterReload) {
    string path = "keepAfterReloadTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr1 = new FileManager(path);
    IFileManager& fileMan1 = *fileManPtr1;
    fileMan1.write("file.txt", "hello");
    IFileManager *fileManPtr2 = new FileManager(path);
    IFileManager& fileMan2 = *fileManPtr2;
    EXPECT_EQ("hello", fileMan2.readAll("file.txt")) << "Content mismatch.";

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr1;
    delete fileManPtr2;
}

TEST(FileManagerUnitTests, ListFiles) {
    string path = "listFilesTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    fileMan.write("file2.txt", "hello");
    fileMan.write("file1.txt", "ma");
    fileMan.write("file3.txt", "nishma?");
    vector<string> actual = {"file1.txt", "file2.txt", "file3.txt"};
    vector<string> given = fileMan.listFiles();
    sort(actual.begin(), actual.end());
    sort(given.begin(), given.end());
    EXPECT_TRUE(actual == given);

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, DeleteAndListFiles) {
    string path = "deleteFileTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    fileMan.write("file2.txt", "hello");
    fileMan.write("file1.txt", "ma");
    fileMan.write("file3.txt", "nishma?");
    fileMan.deleteFile("file2.txt");
    vector<string> actual = fileMan.listFiles();
    vector<string> expected = {"file1.txt", "file3.txt"};

    sort(actual.begin(), actual.end());
    sort(expected.begin(), expected.end());
    EXPECT_TRUE(actual == expected);

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, DeleteNonExistFile) {
    string path = "deleteFileTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    EXPECT_THROW(fileMan.deleteFile("file1.txt"), FileNotExist);

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, WriteDeleteWrite) {
    string path = "deleteFileTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr = new FileManager(path);
    IFileManager& fileMan = *fileManPtr;
    fileMan.write("file1.txt", "hi");
    fileMan.deleteFile("file1.txt");
    fileMan.write("file1.txt", "hello");


    string actual = fileMan.readAll("file1.txt");
    string expected = "hello";

    EXPECT_EQ(expected, actual);

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr;
}

TEST(FileManagerUnitTests, DeleteKeepAfterReload) {
    string path = "deleteKeepAfterReloadTestFolder";
    // ------------ TEST 1 ------------
    IFileManager *fileManPtr1 = new FileManager(path);
    IFileManager& fileMan1 = *fileManPtr1;

    fileMan1.write("file1.txt", "a");
    fileMan1.write("file2.txt", "b");
    fileMan1.write("file3.txt", "c");
    fileMan1.deleteFile("file2.txt");

    IFileManager *fileManPtr2 = new FileManager(path);
    IFileManager& fileMan2 = *fileManPtr2;
    fileMan2.deleteFile("file1.txt");

    EXPECT_THROW(fileMan2.readAll("file1.txt"), std::runtime_error);
    EXPECT_THROW(fileMan2.readAll("file2.txt"), std::runtime_error);
    EXPECT_EQ("c", fileMan2.readAll("file3.txt")) << "something is wrong2";;

    fs::path toDelete = path;
    fs::remove_all(toDelete);
    delete fileManPtr1;
    delete fileManPtr2;
}
