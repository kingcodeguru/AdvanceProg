#ifndef CREATE_THREAD_EXECUTOR_H
#define CREATE_THREAD_EXECUTOR_H

#include <thread>
using namespace std;

#include "Executor.h"
#include "Runnable.h"

// Executor that runs each task in a new thread
class CreateThreadExecutor : public Executor {
public:
    // constructor and destructor
    CreateThreadExecutor() = default;
    virtual ~CreateThreadExecutor() = default;

    // creates a thread and runs the task
    void execute(Runnable& r) noexcept override;
};

#endif // CREATE_THREAD_EXECUTOR_H