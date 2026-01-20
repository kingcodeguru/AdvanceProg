#include "CreateThreadExecutor.h"

void CreateThreadExecutor::execute(Runnable& r) noexcept {
    // create a new thread that runs the task
    thread t([&r]() {
        r.run();
    });
    // detach the thread to allow it to run independently
    t.detach();
}