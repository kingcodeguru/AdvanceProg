#ifndef EXECUTOR_H
#define EXECUTOR_H

#include "Runnable.h"

// Interface for objects that execute tasks
class Executor {
public:
    virtual ~Executor() = default;

    // runs the given task
    virtual void execute(Runnable& r) = 0;
};

#endif // EXECUTOR_H