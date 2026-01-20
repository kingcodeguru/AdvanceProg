#include "Exceptions.h"

// Empty constructoros - we just want to different types of exceptions
// so that we can distinguish between them when catching.

FileExist::FileExist(const std::string& msg) : std::runtime_error(msg) {}
FileNotExist::FileNotExist(const std::string& msg) : std::runtime_error(msg) {}
FileCannotOpen::FileCannotOpen(const std::string& msg) : std::runtime_error(msg) {}
