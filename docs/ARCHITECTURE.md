
# 🏗️ Architecture & Design

## System Overview
The project is divided into three main microservices working in harmony:

1.  **File Server**: A C++ based server responsible for the physical storage of files on the disk. It handles raw I/O operations.
2.  **Web Server**: The "Brain" of the operation. It manages user authentication, file metadata (names, types, parent folders), and permissions logic (Viewer/Editor/Owner).
3.  **Web App**: The view tier built with React. It provides a responsive UI for users to interact with their files.
4.   **Mobile App**: Another view tier built with React Native. It provides a responsive UI for users to interact with their files.

## UML Diagrams

### $\color{pink}{\text{File Server UML}}$
![Server UML](../images/UML-SERVER.png)

### $\color{pink}{\text{Web Server UML}}$
![Web UML](../images/UML-WEB.png)

### $\color{pink}{\text{Web App UML}}$
![Web App](../images/UML-APP.png)

[⬅️ Back to Main README](../README.md)
