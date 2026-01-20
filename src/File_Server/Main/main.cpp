#include "Server.h"

#define PATH "DRIVE_APP_DIR"

int main(int argc, char *argv[]) {
    if (argc != 2) {
        // incorrect number of arguments
        return 1;
    }

    int port;
    try {
        port = atoi(argv[1]);
    } catch (const std::exception& e) {
        // argument is not a valid number
        return 1;
    }
    const char *path = getenv(PATH);
    IFileManager *fmPtr = new FileManager(path);
    IStringCompressor *scPtr = new RLECompressor();
    Server server(port, fmPtr, scPtr);
    server.waitForClients();
    return 0;
}
