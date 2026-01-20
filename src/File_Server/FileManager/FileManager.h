#ifndef FILEMANAGER_H
#define FILEMANAGER_H

// Standard library:
#include <string>     // for string and operations on strings
#include <fstream>    // for opening, writing and reading files
#include <filesystem> // interaction with the file system: creating directories
#include <stdexcept>  // for exception throwing
#include <map>        // for the logical to physical map
#include <algorithm>  // for maximum
#include <ranges>     // for views - get the list of keys from a map
#include <mutex>      // for mutexes
using namespace std;

// Our library:
#include "IFileManager.h" // Interface for managing files
#include "Exceptions.h"

/**
 * This class manages file saving.
 * When calling append - the class will create a new file with a unique name (using a counter)
 * and attach the original filename with the actual filename the file is called in the file system.
 * 
 * We will call the filename according to the user *logical name*
 * and the filename that actually saved in the file system *physical name* (or id/ file index).
*/
class FileManager : public IFileManager {
public:
    /**
     * @brief Constructor for the classs.
     * Check for validation of the path argument, build the directory if needed, reads and initilize
     * logic2physical if can do so.
     * 
     * @param path The path to the directory we are working on.
     * @throws runtime_error if dir cannot be created.
     * @return A FileManager object
     */
    FileManager(string path);

    /**
     * @brief creats and write to a new file
     * 
     * @param filename the name of the file you want to save
     * @param text the content of the file
     * @throws FileExist if file already exists
     * @throws runtime_error if file cannot be created.
     */
    void write(string filename, string text) override;

    /**
     * @brief read the entire content of a file.
     * 
     * @param filename the name of the file you want to read from
     * @throws runtime_error if file cannot be opened.
     * @throws FileNotExist if file doesn't exist
     * @return the content of the file
     */
    string readAll(string filename) override;

    /**
     * @brief list the name of the files
     * 
     * @return a vector of the names of the files
     */
    const vector<string> listFiles() noexcept override;

    /**
     * @brief delete a file from the file system and from the mapping
     * @param filename the name of the file you want to delete
     * @throws FileNotExist if file doesn't exist
     * @return true if succeeded, false otherwise.
     */
    void deleteFile(string filename) override;
private:

    // Constants
    const string MAP_FILENAME = "logic2physical.txt"; // the name of the file that saves the connection between logical and physical names
    const char LOG_PHYS_DELIM = ':';                  // the delimiter separating between physical and logical names in the MAP_FILENAME file
    mutex fileManagerMutex;                           // mutex for thread safety

    // the path to the directory we are working on
    string path;

    // variables needed to map from logical to physical
    map<string, unsigned long> logic2physical;
    unsigned long fileIndex;

    /**
     * @brief returns the full path to filename
     * 
     * @param filename the name of the file we are searching for
     * @return the full path to file name (path + '/' + filename)
     */
    string get_full_path(string filename) noexcept;

    /**
     * @brief initilize logic2physical
     */
    void initMapFile() noexcept;

    /**
     * @brief tries to load the map from the saved file name
     * @return true of succeeded, false otherwise.
     */
    bool loadMapfile() noexcept;

    /**
     * @brief create empty mapFile
     */
    void createMapFile() noexcept;

    /**
     * @brief saves a record of a pair filename, fileIndex and updates fileIndex
     */
    void saveRecord(string filename) noexcept;

    /**
     * @brief search for a record inside logic2physical map
     * @return true of found, false otherwise.
     */
    bool containRecord(string filename) noexcept;

    /**
     * @brief update map file to match map object
     */
    void updateMapFile() noexcept;
};

#endif // FILEMANAGER_H