# 🚀 Installation & Running

## Prerequisites
* Docker Desktop installed and running.
* Git (to clone the repository).

## Building the Project
We use Docker Compose to orchestrate the three services (Apps [web and mobile], Web Server, File Server).

To build and start the project, open your terminal in the root directory and run:

```bash
docker compose --profile drive up --build -d

```

## Troubleshooting

* **Ports**: Ensure ports `3000` (Web App), `8081` (Mobile App), `8080` (Web Server), and `2385` (File Server) are not occupied.
* **Permissions**: If running on Linux/Mac, you might need to use `sudo` for docker commands depending on your configuration.

[⬅️ Back to Main README](https://www.google.com/search?q=../README.md)