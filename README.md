# Socratic C

**Socratic-C** is a local, web-based IDE designed to support university students learning the C programming language. It combines a code editor, compiler, and an AI-powered Socratic tutor into a single, self-contained environment that runs entirely on the student's machine via Docker.

The project was developed as part of a university internship with the goal of bringing AI-assisted learning into introductory C programming courses. The AI tutor can be powered either by a **local Ollama instance**, keeping all student data on the machine, or by a **cloud provider** such as Groq, configured via an API key. The cloud provider is recommended when available, as it offers significantly better model quality; Ollama remains a fully supported fallback for offline or privacy-sensitive environments.

When using Ollama, any model available in the Ollama library can be selected, giving students flexibility in balancing performance and hardware requirements.

The tutor is intentionally **non-prescriptive**: rather than providing direct answers, it guides students through questions and hints in the socratic tradition, hence the name. Each exercise is configured by professors via a dedicated `exercise-config.yaml` file, which defines the exercise description and, optionally, learning objectives and constraints. The tutor's system prompt is defined in a `system-prompt.md` file, making it easy to adapt the AI's behavior and tone without touching the codebase.

## Features

**Code Editor**

- Multi-tab editor powered by CodeMirror 6 with C syntax highlighting
- File explorer with support for creating, renaming, deleting, and opening files

**Compilation & Execution**

- One-click compilation via GCC with real-time error and warning reporting
- Interactive execution with real-time stdin/stdout/stderr streaming
- Memory and timeout limits to prevent runaway processes

**Testing**

- Test files, if any, are compiled together with the student's source files
- The student's `main` is automatically excluded during test builds allowing the test entry point to take over

**AI Socratic Tutor**

- Guides students through questions and hints rather than providing direct answers
- Supports two AI backends: **Groq** (cloud, recommended) and **Ollama** (local, offline-friendly)
- Ollama model is freely configurable — any model available in the Ollama library can be used
- Groq model is configurable via `.env`
- System prompt defined in `system-prompt.md`, editable without touching the codebase
- Per-exercise behavior configured by professors via `exercise-config.yaml`

**Infrastructure**

- Fully containerized via Docker Compose — no local dependencies beyond Docker
- Ollama service is optional and can be omitted when using Groq
- Simple setup via shell script (`socratic.sh` on Linux/macOS, `socratic.ps1` on Windows)

## Getting started

### Prerequisites

- **On Linux**: [Docker Engine](https://docs.docker.com/engine/install/) + [Docker Compose plugin](https://docs.docker.com/compose/install/) (or just install [Docker Desktop](https://www.docker.com/products/docker-desktop/) that includes both)
- **Windows / macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/install/)

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/Wanes01/socratic-c.git
    cd socratic-c
    ```

2. Create a `.env` file in the project root to configure your AI backend:

    > Optional: You can skip this step if you don't want to use the AI chat service

    ```properties
    # Groq (cloud, reccomented)
    GROQ_API_KEY=your_api_key_here
    GROQ_MODEL=openai/gpt-oss-120b  # optional, this is the default
    
    # Ollama (local, optional)
    OLLAMA_MODEL=the_model_you_chose # there is no default value. This is required if you want to download a local model.
    ```
    <details>
    <summary>Where do I generate the key, and how do I choose the model?</summary>
    **Where can I generate the Groq API key?** Sign up on the official GroqCloud website ([GroqCloud website](https://console.groq.com/login)), click on > **API Keys** > **Create API Key**, insert a name of your liking for the key and an expiration date. Once you click "Submit," you can copy the key, which you can then use.
    **Where can I choose which Groq model to use?** This step is optional if you want to use Groq, because by default the app uses the `openai/gpt-oss-120b` model. A list of all the free models can be found at this link: [Groq models](https://console.groq.com/docs/rate-limits). Please note that free plans are subject to a daily token limit, after which the service will no longer function.

    **Where can I choose which Ollama model to use locally?** I recommend using Groq's cloud service, as local models can be very resource-intensive and take longer to respond. Cloud providers provide smarter models without slowing down your computer. If you still want to use a local model, you can find a list here: [Ollama models](https://ollama.com/search). Of the options available, I recommend using `qwen2.5-coder:3b`, as it is a very lightweight model. 

    </details>

3. Docker composition:

    Make sure Docker is running (Docker Desktop if you're using Windows or macOS) and then...

    <details>
        <summary>Linux / macOS</summary>

        ```bash
        chmod +x socratic.sh
        
        # with Groq configuration only (recommended)
        sudo ./socratic.sh install --prod
        
        # with Groq and local Ollama
        sudo ./socratic.sh install --prod --ollama
        ```
    
    </details>

    <details>
        <summary>Windows</summary>
    
        ```powershell
        # If script execution has never been enabled before...
        Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
        
        # with Groq configuration only (recommended)
        sudo .\socratic.ps1 install --prod
        
        # with Groq and local Ollama
        .\socratic.ps1 install --prod --ollama
        ```
    
    </details>
    > **Note**: When using Ollama, the selected model is automatically pulled on first run. This may take a few minutes depending on model size and internet speed.
    
4. Once running, open your browser at [http://localhost:8080/](http://localhost:8080/)
