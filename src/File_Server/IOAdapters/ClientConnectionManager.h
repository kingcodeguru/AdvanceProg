#ifndef CLIENT_CONNECTION_MANAGER_H
#define CLIENT_CONNECTION_MANAGER_H

#include <vector>
#include <string>
using namespace std;

#include "ICommandParser.h"
#include "IOutput.h"
typedef int socket_id;

// This class manages the TCP connection for a single client (Server Side).
// It adapts the Socket I/O to conform to the ICommandParser and IOutput interfaces.
class ClientConnectionManager : public ICommandParser, public IOutput {
private:
    const int N_LEN_BYTE = 12;
    // The socket that connect to the client
    socket_id clientSocket; 

    // Helper functions
    string readFromSocket() noexcept;
    vector<string> splitBySpaces(const string& line) noexcept;

public:
    // Constructor
    ClientConnectionManager(socket_id clientSocket) noexcept;
    
    // Destructor
    virtual ~ClientConnectionManager() noexcept; 

    // ICommandParser
    virtual vector<string> nextCommand() noexcept override;
    
    // IOutput
    virtual void display(const string& text) noexcept override;
    virtual void displayError(const string& error) noexcept override;
};

#endif // CLIENT_CONNECTION_MANAGER_H