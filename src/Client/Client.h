#ifndef CLIENT_H
#define CLIENT_H

#include <string>
#include <cstring>
#include <vector>
using namespace std;
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <stdexcept> // For std::runtime_error
#include <unistd.h>
#include <netdb.h>

#include <iostream>
#include <stdio.h>

#include "IInput.h"
#include "IOutput.h"

typedef int socket_id;


// The Client connects to the server and handles the I/O loop.
class Client {
private:
    const unsigned int padding_length = 12;
    const char padding_char = '0';
    socket_id serverSocketID;
    IInput& inputHandler;
    IOutput& outputHandler;
    bool is_exitable;

    void handleSingleCommand();
    
    // Helper function that start the TCP connection
    bool connectToServer(string ip, int port) noexcept;
    // send and receive with padding
    /**
     * Sends a message to the server with a fixed-size length prefix.
     * @param message The message to send.
     * @throws runtime_error if the message is too long or if sending fails.
     */
    void send(string message);
    /**
     * Receives a message from the server with a fixed-size length prefix.
     * @return The received message as a string.
     * @throws runtime_error if receiving fails.
     */
    string recv();

public:
    // Constructor
    Client(string ip, int port, IInput& input, IOutput& output, bool is_exitable=false) noexcept;
    Client(socket_id sid, IInput& input, IOutput& output, bool is_exitable=false) noexcept;
    
    // Destructor
    virtual ~Client() noexcept;

    // runs the client
    void run() noexcept;
};

#endif // CLIENT_H