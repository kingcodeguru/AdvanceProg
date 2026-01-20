#include "Client.h"
#include "CLIManager.h"

#include <iostream>
#include <string>
#include <stdexcept>
using namespace std;

int main(int argc, char** argv) {
    if (argc != 3) {
        // incorrect arguments (number or type)
        return 1;
    }
    string server_ip;
    int server_port;
    try {
        server_ip = argv[1];
        server_port = stoi(argv[2]);
    } catch (invalid_argument& ia) {
        // port is not an integer
        return 1;
    }

    CLIManager cli;
    Client client(server_ip, server_port, cli, cli);
    client.run();

    return 0;
}