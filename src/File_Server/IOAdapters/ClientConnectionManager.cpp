#include "ClientConnectionManager.h"
#include <sys/socket.h>
#include <unistd.h>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>
#include <iostream>

using namespace std;

// Constructor: initialize with client socket
ClientConnectionManager::ClientConnectionManager(socket_id clientSocket) noexcept
    : clientSocket(clientSocket) {}

// Destructor: close the client socket
ClientConnectionManager::~ClientConnectionManager() noexcept {
    close(clientSocket);
}

// helper func: split text into words by spaces
vector<string> ClientConnectionManager::splitBySpaces(const string& line) noexcept {
    vector<string> splited_command;
    string current_word;

    for (size_t i = 0; i < line.size(); ++i) {
        char c = line[i];
        if (c == ' ') {
            // push current word (can be empty if multiple spaces)
            splited_command.push_back(current_word); 
            current_word.clear(); 
        } else {
            current_word += c; 
        }
    }

    // push the last word after the loop
    splited_command.push_back(current_word);

    return splited_command;
}

// read the message (N_LEN_BYTE bytes length + content)
string ClientConnectionManager::readFromSocket() noexcept {
    // read the length (N_LEN_BYTE chars)
    char len_buffer[N_LEN_BYTE + 1] = {0}; 
    int total_read = 0;
    
    // read exactly N_LEN_BYTE bytes
    while (total_read < N_LEN_BYTE) {
        ssize_t bytes = read(clientSocket, len_buffer + total_read, N_LEN_BYTE - total_read);
        if (bytes <= 0) return ""; // error or mabye connection closed
        total_read += bytes;
    }

    int msg_len = atoi(len_buffer);
    if (msg_len <= 0) return "";

    // read the content based on the length
    vector<char> buffer(msg_len);
    total_read = 0;
    
    while (total_read < msg_len) {
        ssize_t bytes = read(clientSocket, buffer.data() + total_read, msg_len - total_read);
        if (bytes <= 0) return "";
        total_read += bytes;
    }

    return string(buffer.begin(), buffer.end());
}

// ICommandParser: get next command from client
vector<string> ClientConnectionManager::nextCommand() noexcept {
    string line = readFromSocket();

    // if connection closed or empty message
    if (line.empty()) {
        return {};
    }

    return splitBySpaces(line);
}

// IOutput: send text to client (with our protocol- newline and length prefix)
void ClientConnectionManager::display(const string& text) noexcept {
    // output need to end with a newline
    string msg = text;
    
    // N_LEN_BYTE byte length prefix
    stringstream ss;
    ss << setfill('0') << setw(N_LEN_BYTE) << msg.length();
    string len_str = ss.str();

    // send the length and then the message
    write(clientSocket, len_str.c_str(), N_LEN_BYTE);
    write(clientSocket, msg.c_str(), msg.length());
}

// IOutput: send error to client (same protocol...)
void ClientConnectionManager::displayError(const string& error) noexcept {
    string msg = error;
    
    stringstream ss;
    ss << setfill('0') << setw(N_LEN_BYTE) << msg.length();
    string len_str = ss.str();

    write(clientSocket, len_str.c_str(), N_LEN_BYTE);
    write(clientSocket, msg.c_str(), msg.length());
}