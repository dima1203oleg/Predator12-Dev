# Predator Auto Approve Extension

This VS Code extension provides a command to run the auto-approve script for the Predator12 project.

## Features

- Run auto-approve script with a single command from the Command Palette.
- Integrated with VS Code terminal for output visibility.

## Usage

1. Open Command Palette (Cmd+Shift+P on Mac, Ctrl+Shift+P on Windows/Linux).
2. Type "🤖 Auto Approve Changes" and select it.
3. The script will run in a new terminal, showing progress and results.

## Requirements

- VS Code 1.74.0 or higher.
- Predator12 workspace open.
- Scripts in `scripts/auto_approve_and_commit.sh` must be executable.

## Installation

1. Clone or copy the extension to your local VS Code extensions folder.
2. Reload VS Code.
3. The command will be available in the Command Palette.