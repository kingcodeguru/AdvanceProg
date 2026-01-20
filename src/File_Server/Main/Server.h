#ifndef SERVER_H
#define SERVER_H

#include <iostream>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
using namespace std;

#include "Executor/Executor.h"
#include "Executor/FixedThreadPool.h"
#include "IOAdapters/ClientConnectionManager.h"
#include "IOAdapters/ICommandParser.h"
#include "IOAdapters/IOutput.h"
#include "HandleClient.h"
typedef int socket_id;

// The Server handles incoming client connections and requests.
class Server {
private:
    const char *THR_SIZE_ENV = "THREAD_POOL_SIZE";
    const int max_clients = 5;
    socket_id serverSocketID;
    size_t max_threads;

    // fields that are neccessary for commands
    IFileManager *fileManPtr; // each App is going to have the same file manager
    IStringCompressor *compPtr; // each App is going to have the same string compressor
    // IOutput& out; - each App is going to have different output (to the client)

    void handleClient(socket_id clientSocketID, Executor& executor) noexcept;

public:
    // Constructor
    Server(int port, IFileManager *fileManPtr, IStringCompressor *compPtr) noexcept;
    
    // Destructor
    virtual ~Server() noexcept;

    // infinite loop to wait for clients and handle them
    void waitForClients() noexcept;
};

#endif // SERVER_H
