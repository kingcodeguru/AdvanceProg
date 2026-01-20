#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include <sstream>
#include <thread>
#include <chrono>
#include <future>
using namespace std;

#include "Client.h"
#include "CLIManager.h"
#include "IInput.h"
#include "IOutput.h"

class ClientUnitTest : public ::testing::Test {
protected:
    // sockets[0] is the our client, sockets[1] is the simulated server
    int sockets[2];
    istringstream i1;
    istringstream i2;
    ostringstream o1;
    ostringstream o2;

    CLIManager *cliPtr1;
    CLIManager *cliPtr2;
    Client *cPtr1;
    Client *cPtr2;

    void SetUp() override {
        // create connected sockets for local communication simulation
        if (socketpair(AF_UNIX, SOCK_STREAM, 0, sockets) < 0) {
            perror("socketpair failed");
            exit(1);
        }
        cliPtr1 = new CLIManager(i1, o1);
        cliPtr2 = new CLIManager(i2, o2);

        cPtr1 = new Client(sockets[0], *cliPtr1, *cliPtr1);
        cPtr2 = new Client(sockets[1], *cliPtr2, *cliPtr2);
    }
    void TearDown() override {
        delete cliPtr1;
        delete cliPtr2;
        delete cPtr1;
        delete cPtr2;
    }
};

// Simple testing the the communication actually works
TEST_F(ClientUnitTest, Sanity) {
    string s1 = "hello to you!\n\0";
    string s2 = "hello to you too!\n\0";
    i1.str(s1);
    i2.str(s2);

    thread t1([&]() { cPtr1->run(); });
    thread t2([&]() { cPtr2->run(); });

    std::this_thread::sleep_for(std::chrono::milliseconds(100)); // give some time for the output to be written

    t1.detach();
    t2.detach();

    EXPECT_EQ(s1, o2.str());
    EXPECT_EQ(s2, o1.str());
}
// Several messages in the communication
TEST_F(ClientUnitTest, MultipleMessages) {
    // Thre's a big difference between the last test and this test.
    // When running input, we send it in separate messages, with newlines.

    // notice that the number of messages for each side must be equal,
    // becuase the client is dummy and always send something and waits for response.
    string s1 = "hello to you!\nhow are you?\nI am fine.\nNICE\n\0";
    string s2 = "hello to you too!\nI am good, thanks!\nWhat about you?\nNice to meet you.\n\0";
    i1.str(s1);
    i2.str(s2);

    thread t1([&]() { cPtr1->run(); });
    thread t2([&]() { cPtr2->run(); });

    std::this_thread::sleep_for(std::chrono::milliseconds(100)); // give some time for the output to be written

    t1.detach();
    t2.detach();

    EXPECT_EQ(s1, o2.str());
    EXPECT_EQ(s2, o1.str());
}