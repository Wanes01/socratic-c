<p align="center">
	<img width="400" alt="app-logo" src="https://github.com/user-attachments/assets/027b2e69-5786-4bfb-aacc-0cc9916b29d2" />
</p>

# Socratic C



**Socratic-C** is a local, web-based IDE designed to support university students learning the C programming language. It combines a code editor, compiler, and an AI-powered Socratic tutor into a single, self-contained environment that runs entirely on the student's machine via Docker.

The project was developed as part of a university internship with the goal of bringing AI-assisted learning into introductory C programming courses. The AI tutor can be powered either by a **local Ollama instance**, keeping all student data on the machine, or by a **cloud provider** such as Groq, configured via an API key. The cloud provider is recommended when available, as it offers significantly better model quality; Ollama remains a fully supported fallback for offline or privacy-sensitive environments.

When using Ollama, any model available in the Ollama library can be selected, giving students flexibility in balancing performance and hardware requirements.

The tutor is intentionally **non-prescriptive**: rather than providing direct answers, it guides students through questions and hints in the socratic tradition, hence the name. Each exercise is configured by professors via a dedicated `exercise-config.yaml` file, which defines the exercise description and, optionally, learning objectives and constraints. The tutor's system prompt is defined in a `system-prompt.md` file, making it easy to adapt the AI's behavior and tone without touching the codebase.

<img width="1920" height="944" alt="overview" src="https://github.com/user-attachments/assets/52efee71-91b0-491c-afac-3bdffa2b0d27" />


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
- **On Windows / macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/install/)

### Installation

Clone this repository:

```bash
git clone https://github.com/Wanes01/socratic-c.git
cd socratic-c
```

Create a `.env` file in the project root to configure your AI backend:

> Optional: You can skip this step if you don't want to use the AI chat service

```properties
# Groq (cloud, recommended)
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=qwen/qwen3-32b  # optional, this is the default

# Ollama (local, optional)
OLLAMA_MODEL=the_model_you_chose # there is no default value. This is required if you want to download a local model.
```
<details>
<summary>Where do I generate the key, and how do I choose the model?</summary>

**Where can I generate the Groq API key?** Sign up on the official GroqCloud website ([GroqCloud website](https://console.groq.com/login)), click on > **API Keys** > **Create API Key**, insert a name of your liking for the key and an expiration date. Once you click "Submit," you can copy the key, which you can then use.

**Where can I choose which Groq model to use?** This step is optional if you want to use Groq, because by default the app uses the `qwen/qwen3-32b` model. A list of all the free models can be found at this link: [Groq models](https://console.groq.com/docs/rate-limits). Please note that free plans are subject to a daily token limit, after which the service will no longer function. I recommend using the default one or `openai/gpt-oss-120b` (it's much smarter but has stricter limits).

**Where can I choose which Ollama model to use locally?** I recommend using Groq's cloud service, as local models can be very resource-intensive and take longer to respond. Cloud providers provide smarter models without slowing down your computer. If you still want to use a local model, you can find a list here: [Ollama models](https://ollama.com/search). Of the options available, I recommend using `qwen2.5-coder:3b`, as it is a very lightweight model. 

</details>

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
.\socratic.ps1 install --prod

# with Groq and local Ollama
.\socratic.ps1 install --prod --ollama
```

</details>

> **Note**: When using Ollama, the selected model is automatically pulled on first run. This may take a few minutes depending on model size and internet speed.

Once running, open your browser at [http://localhost:8080/](http://localhost:8080/)

### Script usage

```bash
# or .\socratic.ps1 if on Windows
./socratic.sh start    # start services (no rebuild)
./socratic.sh stop     # stop services
./socratic.sh remove   # stop and remove containers, networks and volumes
```

The script remembers the configuration used during `install`, no need to repeat `--prod` or `--ollama`.

The script will display a help message if it is called without any arguments: `./socratic.sh`

## Exercise format

The exercises must be placed in the "exercises" folder, located in the project's root directory. The structure of an exercise is as follows:

```
exercises
└── exercise_name/
	├── exercise-config.yaml
    ├── root/
    │   └── ...
    ├── solutions/
    │   └── ...
    └── tests/
        └── ...
```

To be more specific:

- `root/` (**required but created automatically**): this is the directory where all student source code will be stored. You don't need to create it: it is generated automatically if it doesn't exist when the application checks which exercises are available. If you want to make the student start the exercise with some source code, you can create it first.

- `solutions/` (<u>optional</u>): a folder containing the source code with the solution to the exercise. These files are not visible to students within the application; they are intended to provide the LLM with additional context on how the exercise should be completed, so they are not required.

- `tests/` (<u>optional</u>): a folder containing the tests that students' source code must pass. Although it is possible to place test sources directly in the `root` directory, we recommend placing them here to maintain a logical separation; additionally, the application offers an option to compile while ignoring everything in this directory.

- `exercise-config.yaml` (**required**): the exercise configuration file, which contains useful information for both the student and the large language model. It has the following properties:

  ```yaml
  # REQUIRED: General description of the exercise and what the final program should accomplish. Example:
  description: |
    Write a C program that manages a singly linked list of integers.
    The program must support the following operations via a menu:
    insert at head, insert at tail, delete by value, and print the list.
  
  # optional: Learning objectives the student should develop by completing this exercise. Example:
  learningGoals: |
    - Dynamic memory allocation with malloc and free
    - Pointer manipulation and linked list traversal
    - Struct definition and usage
    - Modular code organization with functions
  
  # optional: Rules the student must follow or avoid during the exercise. Example:
  constraints: |
    - Must define a Node struct with an int field and a next pointer
    - Must free all allocated memory before the program exits
    - Must not use arrays or other data structures instead of the linked list
    - Must implement at least one function per operation"
  ```

  > The fields can contain any string of any length. Since this information is also visible to the LLM, I recommend keeping the strings relatively short to avoid using up too many tokens.

This means that the minimum requirement for creating a new exercise is to have a directory with the exercise's name (for example, `exercises/exercise_name`) and, inside it, an `exercise-config.yaml` file containing the `description` property.

## Walkthrough
This section describes the features offered by the user interface

### Files management
<table align="center">
  <tr>
    <th width="50%">Exercises</th>
    <th width="50%">Files/Directories</th>
  </tr>
  <tr>
    <td align="center">
      <img width="215" src="https://github.com/user-attachments/assets/6cb3b722-bd0d-4b7d-9978-341c1500f994" />
    </td>
    <td align="center">
      <img width="255" src="https://github.com/user-attachments/assets/f5a1ca11-41b6-4455-998c-d712998f5011" />
    </td>
  </tr>
  <tr>
   <td>Click on an exercise to select it. Changing exercises will clear the chat. Right-click on an exercise to download it as a ZIP file.</td>
	  <td>Click on a directory to open or close it. Click on a file to open it in the file editor. By right-clicking on a file or directory, you can edit, add, or delete it. Of course, you cannot delete or rename the `root` and `tests` directories.</td>
  </tr>
</table>

### Compilation, execution, AI help
<table align="center">
  <tr>
    <th width="50%">Quick actions</th>
    <th width="50%">Compile options</th>
  </tr>
  <tr>
    <td align="center">
      <img width="375" height="47" alt="compilation" src="https://github.com/user-attachments/assets/63470481-43c7-4063-af4d-3613ac669244" />
    </td>
    <td align="center">
      <img width="217" height="364" alt="compile-options" src="https://github.com/user-attachments/assets/2bd8f3d6-8c0b-461b-ae12-dcdf07eb826c" />
    </td>
  </tr>
  <tr>
	  <td>Clicking the “Compile” button will pass all source files and headers of the currently selected exercise to the gcc command, using the current compilation settings. Before compilation, all open files in the exercise are saved to prevent desynchronization. If the executable is generated successfully, the program can be run by clicking the “Run” button. The AI Help button sends a predefined message to the text model to request general assistance on how to proceed with the exercise. </td>
	  <td>You can pass various options to the gcc compiler, depending on how strict you want to be regarding the source code. If the “include tests” compilation option is not selected, then all files within the tests folder will be ignored. If the tests are included, the compiler will automatically exclude the main.c file from any location within the student’s root/ directory. This convention was chosen to avoid conflicts between multiple existing main functions, and also to allow the student to temporarily exclude the tests and use their own main function.</td>
  </tr>
</table>

### AI Chat
<table align="center">
  <tr>
    <th width="50%">Provider selection</th>
    <th width="50%">AI Chat</th>
  </tr>
  <tr>
    <td align="center">
      <img width="279" height="178" alt="model" src="https://github.com/user-attachments/assets/2c415cd6-6008-4d2c-9605-aab6bb27d5a5" />
    </td>
    <td align="center">
      <img height="495" alt="chat" src="https://github.com/user-attachments/assets/059ab94d-9153-4fd0-8eb3-b6699bbef389" />
    </td>
  </tr>
  <tr>
	  <td>You can select your preferred large language model if you chose to use the ollama provider during installation, in addition to Groq, provided they are configured in the .env file.</td>
	  <td>The chat automatically renders the Markdown messages generated by the LLM. The final prompt is generated by attempting to cache as many tokens as possible. The chat has access to the student’s source files, tests, any additional tests, the system prompt, the exercise configuration, and the last 8 messages exchanged between the user and the assistant. The system prompt is configured so that the chatbot always responds in Italian, but it can be easily modified since it is written in a Markdown file. Any message sent to the AI triggers a prior save of all files for the selected exercise.</td>
  </tr>
</table>

### File Editor
<table align="center">
  <tr>
    <th width="50%">File Editor</th>
    <th width="50%">Markdown preview</th>
  </tr>
  <tr>
    <td align="center">
      <img width="796" height="596" alt="editor" src="https://github.com/user-attachments/assets/e0e503d5-630a-4c90-80ed-b24cba3c4a57" />
    </td>
    <td align="center">
      <img width="1319" height="798" alt="md" src="https://github.com/user-attachments/assets/66c10cdb-f88c-486f-bf13-a4f133555c0e" />
    </td>
  </tr>
  <tr>
	  <td>The file editor supports almost all the shortcuts found in traditional file editors. Multi-file viewing via tabs is supported. Autocompletion in the editor is intentionally minimal, covering only the most common library functions; this is because the app’s primary purpose is to teach C to students who have never programmed before, so the goal is to have them write as much code as possible without the IDE doing everything for them.</td>
	  <td>If a Markdown file is opened in the editor, it is rendered. This can be useful for professors who want to provide explicit instructions to their students.</td>
  </tr>
</table>

### Terminal
<table align="center">
  <tr>
    <th width="50%">AI help</th>
    <th width="50%">stdin</th>
  </tr>
  <tr>
    <td align="center">
      <img width="1325" height="566" alt="terminal-help" src="https://github.com/user-attachments/assets/88667de3-3dbf-473f-ab1f-080e3cd57cbe" />
    </td>
    <td align="center">
      <img width="1323" height="897" alt="terminal-input" src="https://github.com/user-attachments/assets/1b5906f8-75c0-411b-82fb-5e4e97515bb3" />
    </td>
  </tr>
  <tr>
	  <td>If, for any reason, a compilation error, a warning, or a runtime error occurs, a button will appear that allows you to automatically explain the error to the AI, along with the source files and current compilation settings, so you can ask for help and identify the source of the problem.</td>
	  <td>At the bottom of the terminal, there is a text input field. If this field is filled in before the executable is run, the entered strings are passed as command-line arguments to the executable. If the program is already running, you can use the same text input field to write to standard input (for example, to send input to a `scanf`). A “Send” button will appear, allowing you to send the input to the terminal (or, as with the AI chat, simply press Enter).</td>
  </tr>
</table>
