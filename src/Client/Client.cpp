#include "Client.h"

void Client::handleSingleCommand() {
    string command = inputHandler.readInput();
    if (is_exitable && command == "exit") {
        throw runtime_error("EXIT!");
    }
    try {
        send(command);
    } catch (runtime_error& ignore) {}

    string response;
    try {
        response = recv();
    } catch (runtime_error& ignore) {}
    outputHandler.display(response);
}

void Client::send(string message) {
    string message_length = to_string(message.length());
    int message_length_length = message_length.length();
    if (message_length_length > padding_length) {
        throw runtime_error("Too long message, limit is 99,999");
    }
    message_length.insert(0, padding_length-message_length_length, padding_char);
    string full_msg = message_length + message;

    const char *data_addr = full_msg.c_str();
    int data_len = strlen(data_addr);
    // send to server the message
    int sent_bytes = ::send(serverSocketID, data_addr, data_len, 0);
    if (sent_bytes < 0) {
        throw runtime_error("Couldn't send bytes");
    }
}

string Client::recv() {
    // receive length
    char length_buffer[padding_length];
    int read_bytes = ::recv(serverSocketID, length_buffer, padding_length, 0);

    if (read_bytes <= 0) {
        // connection is closed,  or error thrown
        throw runtime_error("Couldn't receive length of message");
    }

    // receive message, given the length
    int message_length = stoi(length_buffer);
    char message_buffer[message_length + 1];
    read_bytes = ::recv(serverSocketID, message_buffer, message_length, 0);

    if (read_bytes <= 0) {
        // connection is closed,  or error thrown
        throw runtime_error("Couldn't receive message");
    }
    message_buffer[message_length] = '\0'; // null-terminate the string
    return string(message_buffer);
}
    
// Helper function that start the TCP connection
bool Client::connectToServer(std::string ip, int port) noexcept {
    // build socket
    serverSocketID = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocketID < 0) {
        // outputHandler.displayError("Failed to create socket");
        return false;
    }

    // if address is in DNS, convert into IPv4
    struct hostent *server_host = gethostbyname(ip.c_str());
    
    // if convertion failed, we failed to connect to server
    if (server_host == nullptr) {
        // Handle error: Hostname "server" could not be resolved (DNS lookup failure)
        // outputHandler.displayError("Failed to resolve server hostname");
        close(serverSocketID); // Clean up the socket
        return false;
    }

    struct sockaddr_in sin;
    std::memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    
    // Copy the resolved IP address into sin.sin_addr
    // server_host->h_addr_list[0] contains the first IP address found
    std::memcpy(&sin.sin_addr.s_addr, server_host->h_addr_list[0], server_host->h_length);
    
    sin.sin_port = htons(port); 

    // acrually tries to connect to server
    if (connect(serverSocketID, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        // failed to connect to server
        // outputHandler.displayError("Failed to connect to server");
        close(serverSocketID); // Clean up the socket
        return false;
    }
    
    return true;
}

// Constructor
Client::Client(string ip, int port, IInput& input, IOutput& output, bool is_exitable) noexcept :
inputHandler(input),
outputHandler(output),
is_exitable(is_exitable)
{
    if (!connectToServer(ip, port)) {
        exit(1);
    }
}
Client::Client(socket_id sid, IInput& input, IOutput& output, bool is_exitable) noexcept :
serverSocketID(sid),
inputHandler(input),
outputHandler(output),
is_exitable(is_exitable) {}

// Destructor
Client::~Client() noexcept {
    close(serverSocketID);
}

// runs the client
void Client::run() noexcept {
    while (true) {
        try {
            // in an infinite loop, try to handle a single command
            handleSingleCommand();
        } catch (runtime_error& exit_run) {
            break; // exit the infinite loop
        }
    }
}
