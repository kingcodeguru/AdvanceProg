# Advanced Proggraming - LOT Drive
> A comprehensive, Google Drive-like cloud storage solution featuring a robust C++ file server, a Node.js metadata server, and a cross-platform React Native client & React client.

## 📖 Documentation Wiki
Welcome to the project documentation. Please navigate through the sections below to understand the system architecture, how to run it, and how to use it.

| Section | Description |
| :--- | :--- |
| 🏗️ **[Architecture & Design](docs/ARCHITECTURE.md)** | UML diagrams, component breakdown, and system logic. |
| 🚀 **[Installation & Running](docs/INSTALLATION.md)** | Step-by-step guide to build and launch the system using Docker. |
| 📱 **[User Guide & Screenshots](docs/USER_GUIDE.md)** | detailed walkthrough of the UI, pages, and features (Dark mode, Editor, etc.). |
| 🎥 **[Video Demos](docs/DEMOS.md)** | Watch the system in action: Sharing, Uploading, and more. |

## ⚡ Quick Start
If you just want to get the system running immediately:

1. **Prerequisites**: Ensure you have [Docker](https://www.docker.com/) and Docker Compose installed.
2. **Run the Build Command**:
```bash
docker compose --profile drive up --build -d
```

3. **Access the App**:  
For the Web App:  
Open your browser and navigate to `http://localhost:3000`.  
For the Mobile App (Android/ iOS):  
Open `expo go` application and insert `exp://*ip*:8081` where ip is the ip of the pc the react native project is running on.

## 🛠️ Tech Stack

* **Client**: React Native (Expo Router), TypeScript.
* **Web Server**: Node.js / Express (Metadata & Permissions).
* **File Server**: C++ (Raw Data Storage).
* **Infrastructure**: Docker Compose.

---

*Created as part of the Advanced Programming Course.*

