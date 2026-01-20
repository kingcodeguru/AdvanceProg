#ifndef EXCEPTIONS_H
#define EXCEPTIONS_H

#include <stdexcept>
#include <string>

class FileExist : public std::runtime_error {
public:
    FileExist(const std::string& msg);
};

class FileNotExist : public std::runtime_error {
public:
    FileNotExist(const std::string& msg);
};

class FileCannotOpen : public std::runtime_error {
public:
    FileCannotOpen(const std::string& msg);
};

#endif
