#ifndef IFILEMANAGER_H
#define IFILEMANAGER_H

#include <string>
#include <vector>
using namespace std;

class IFileManager {
public:
    virtual void write(string filename, string text) = 0;
    virtual string readAll(string filename) = 0;
    virtual const vector<string> listFiles() = 0;
    virtual void deleteFile(string filename) = 0;
};

#endif // IFILEMANAGER_H