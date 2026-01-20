#include "FileManager.h"
// Public methods

FileManager::FileManager(string path) : path(path), logic2physical(map<string, unsigned long>()), fileIndex(0)
{
    // checks if the path received is indeed a directory
    if (!filesystem::is_directory(path)) {
        bool success = filesystem::create_directory(path);
        if (!success) {
            throw runtime_error("Cannot find or open directory specified.");
        }
    }
    // making sure the directory doesn't end with /
    if (path.back() == '/') {
        path.pop_back();
    }

    // initilize mapFile variable and the file mapping from logical to physical.
    initMapFile();
    
}

void FileManager::write(string filename, string text) {
    // writing needs to be safe, if several threads try to write at the same time to the same file,
    // they might all reach the critical section of writing to the same file resulting in undefined behaviour.
    // We MUST make sure the lock is being released no matter what.
    fileManagerMutex.lock();
    // don't allow to add a file that already exists
    if (containRecord(filename)) {
        fileManagerMutex.unlock(); 
        throw FileExist("File already exists: " + filename);
        return;
    }
    // generate full path to file
    string full_path = get_full_path(to_string(fileIndex));
    // opens a new file to write into
    ofstream write_to(full_path);
    if (write_to.is_open()) {
        // only if file opened, you can register the file in the map.
        saveRecord(filename);
        // write your content to the file
        write_to << text;
        write_to.close();
    } else {
        fileManagerMutex.unlock();
        throw runtime_error("Couldn't create file.");
    }
    fileManagerMutex.unlock();
}

string FileManager::readAll(string filename) {
    // reading needs to be safe, if one threads tries to read and the other tries to delete the file
    // they might all reach the critical section of writing to the same file resulting in undefined behaviour.
    // We MUST make sure the lock is being released no matter what.
    fileManagerMutex.lock();
    // found nothing - return nothing
    if (!logic2physical.count(filename)) {fileManagerMutex.unlock(); throw FileNotExist("File doesn't exist: " + filename);}
    // receive current id - an unoccupied number
    unsigned long id = logic2physical[filename];

    // receive full path to the file
    string full_path = get_full_path(to_string(id));
    // opens a new file to read from
    ifstream read_from(full_path);
    if (read_from.is_open()) {
        // We need to read all of the files content
        string ret(
            (istreambuf_iterator<char>(read_from)), // Start iterator (at the beginning of the file stream)
            istreambuf_iterator<char>()            // End iterator (a default-constructed iterator acts as the sentinel end-of-stream)
        );
        fileManagerMutex.unlock();
        return ret;
    } else {
        fileManagerMutex.unlock();
        throw runtime_error("Couldn't open file: " + filename);
    }
}

const vector<string> FileManager::listFiles() noexcept {
    // listing files preffered to be safe, because if a thread tries to look for the keys list
    // while another is changing that list (the map keys), it might result in undefined behaviour.
    // We MUST make sure the lock is being released no matter what.
    fileManagerMutex.lock();
    // receive the view of the keys.
    auto keys_view = std::views::keys(logic2physical);
    // construct a vector made out of the keys of the map
    vector<string> ret(keys_view.begin(), keys_view.end());
    fileManagerMutex.unlock();
    return ret;
}

void FileManager::deleteFile(string filename) {
    // deleting a file needs to be safe, because if a two threads tries to delete the same file
    // they both might get the authorization to delete the file, but the second one won't be able
    // to achieve that - resulting in undefined behaviour.
    // We MUST make sure the lock is being released no matter what.
    fileManagerMutex.lock();
    if (!containRecord(filename)) {
        fileManagerMutex.unlock(); 
        throw FileNotExist("File doesn't exist: " + filename);
        return;
    }
    // get the physical name
    unsigned long id = logic2physical[filename];
    // remove the file from the file system
    filesystem::remove(get_full_path(to_string(id)));
    // remove the record from the map
    logic2physical.erase(filename);
    updateMapFile();
    fileManagerMutex.unlock();
}

// Private methods

void FileManager::initMapFile() noexcept {
    // check if able to load map file (if there exis sucj file)
    if (!loadMapfile()) {
        // if not, initilize one
        createMapFile();
    }
}

string FileManager::get_full_path(string filename) noexcept {
    return path + '/' + filename;
}

bool FileManager::loadMapfile() noexcept {
    // receive full path to MAP_FILENAME
    string full_path = get_full_path(MAP_FILENAME);
    // try to open MAP_FILENAME
    ifstream mapFile(full_path);
    if (mapFile.is_open()) {
        // succeed - load from MAP_FILENAME to var logical2physical
        unsigned long physical_name;
        string logical_name;
        // while there is data left
        while (mapFile) {
            // load and address it as ulong
            mapFile >> physical_name;
            // the ':' delim is the character that separates between the logical and physical names in the file
            mapFile.ignore(1, LOG_PHYS_DELIM);
            // the rest of the line is a string.
            getline(mapFile, logical_name);
            // adding the pair of key-value
            logic2physical[logical_name] = physical_name;
            // we are also searching for the largest id in the file.
            // the maximum id + 1 is our new starting id
            fileIndex = max(fileIndex, physical_name);
        }
        mapFile.close();
        // increasing by one from the max to get unique value
        fileIndex++;
        return true;
    }
    // didn't succeed - return false
    return false;
}

void FileManager::createMapFile() noexcept {
    // creating empty file for MAP_FILENAME
    string full_path = get_full_path(MAP_FILENAME);
    ofstream mapFile(full_path);
    mapFile.close();
}

void FileManager::saveRecord(string filename) noexcept {
    ofstream mapFile(get_full_path(MAP_FILENAME), ios::app); // append to the map file
    // saving the record in the file in the format "id:filename"
    mapFile << fileIndex << LOG_PHYS_DELIM << filename << endl;
    // adding filename fileindex pair as key-value for the map
    logic2physical[filename] = fileIndex;
    // increasing fileIndex to keep in unique
    fileIndex++;
    mapFile.close();
}

bool FileManager::containRecord(string filename) noexcept {
    // does the file exists
    return logic2physical.count(filename) != 0;
}

void FileManager::updateMapFile() noexcept {
    ofstream mapFile(get_full_path(MAP_FILENAME), ios::out); // rewrite the map file
    // saving the record in the file in the format "id:filename"
    for (const auto& [filename, fileId] : logic2physical) {
        mapFile << fileId << LOG_PHYS_DELIM << filename << endl;
    }
    mapFile.close();
}
