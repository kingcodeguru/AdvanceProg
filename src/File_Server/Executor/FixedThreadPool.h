#ifndef FIXED_THREAD_POOL_H
#define FIXED_THREAD_POOL_H

#include <thread>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <atomic>
using namespace std;

#include "Executor.h"
#include "Runnable.h"


class FixedThreadPool : public Executor {
private:
    size_t numThreads;
    vector<std::thread> workers;
    queue<Runnable*> tasks; // Queue of client sockets
    mutex queueMutex;
    condition_variable condition;
    atomic<bool> stop;
    void workerFunction();

public:
    // constructor and destructor
    FixedThreadPool(size_t numThreads);
    ~FixedThreadPool();

    // creates a thread and runs the task
    void execute(Runnable& r) noexcept override;
};

#endif