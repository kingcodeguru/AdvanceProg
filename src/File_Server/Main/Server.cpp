#include "Server.h"

Server::Server(int port, IFileManager *fileManPtr, IStringCompressor *compPtr) noexcept :
fileManPtr(fileManPtr),
compPtr(compPtr)
 {
    // build socket with ipv4 and TCP
    serverSocketID = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocketID < 0) {
        // error creating socket
        perror("error creating socket");
        exit(1);
    }

    // create and initilize sin
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port); // litlle/big endian conversion

    // request port
    if (bind(serverSocketID, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        perror("error binding socket");
        exit(1);
    }

    char *sizeStr = getenv(THR_SIZE_ENV);
    max_threads = (sizeStr != NULL) ? stoi(sizeStr) : max_clients;

    // allow up to max_clients at a time
    if (listen(serverSocketID, max_threads) < 0) {
        perror("error listening to a socket");
        exit(1);
    }
}

Server::~Server() noexcept {
    delete fileManPtr;
    delete compPtr;
    close(serverSocketID);
}

void Server::waitForClients() noexcept {
    Executor *executorPtr = new FixedThreadPool(max_threads);
    while (true) {
        // wait for a client to connect
        struct sockaddr_in client_sin;
        socklen_t client_sin_len = sizeof(client_sin);
        socket_id clientSocketID = accept(serverSocketID,
                                          (struct sockaddr *) &client_sin,
                                          &client_sin_len);
        if (clientSocketID < 0) {
            perror("error accepting client connection");
            continue; // skip to next iteration to accept new clients
        }

        // handle the client in a separate App instance
        handleClient(clientSocketID, *executorPtr);
    }
}

void Server::handleClient(socket_id clientSocketID, Executor& executor) noexcept {
    ClientConnectionManager *clientCon = new ClientConnectionManager(clientSocketID);
    HandleClient *clientAppPtr = new HandleClient(*fileManPtr, *compPtr, *clientCon);
    // execute the app in a separate thread
    executor.execute(*clientAppPtr);
}
