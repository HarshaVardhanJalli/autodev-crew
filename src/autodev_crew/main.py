import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


BANNER = """
╔══════════════════════════════════════════════════════════════════╗
║              🤖  AutoDev Crew  —  Multi-Agent Dev Team          ║
║                                                                  ║
║  Agents:  PM → Architect → Developer → Reviewer → QA            ║
║  Output:  ./output/ directory                                    ║
╚══════════════════════════════════════════════════════════════════╝
"""

DEMO_REQUESTS = [
    {
        "name": "JWT Auth API",
        "request": (
            "Build a REST API for user authentication with JWT tokens using FastAPI and SQLite. "
            "Users should be able to register with email and password, log in to get a JWT access "
            "token and refresh token, access protected routes, refresh their token, and log out. "
            "Passwords must be hashed. Tokens must expire (access: 15 min, refresh: 7 days). "
            "Include rate limiting on login endpoint to prevent brute force attacks."
        ),
    },
    {
        "name": "Task Management API",
        "request": (
            "Build a REST API for a task management system (like a simplified Trello) using FastAPI. "
            "Users can create projects, add tasks to projects, assign tasks to team members, "
            "set due dates and priorities, and update task status (todo/in-progress/done). "
            "Include filtering tasks by status, assignee, and due date. "
            "Use SQLite for storage and JWT for authentication."
        ),
    },
    {
        "name": "URL Shortener Service",
        "request": (
            "Build a URL shortener service like bit.ly using FastAPI and Redis. "
            "Users can shorten long URLs, get analytics (click count, referrer, geo), "
            "set expiry dates on short links, and optionally set a custom slug. "
            "Anonymous users can shorten up to 5 URLs per day (rate limited by IP). "
            "Registered users get unlimited URLs and analytics dashboard."
        ),
    },
]


def print_separator(char="─", width=68):
    print(char * width)


def choose_feature_request() -> str:
    print(BANNER)
    print("Choose a demo feature request or enter your own:\n")

    for i, demo in enumerate(DEMO_REQUESTS, 1):
        print(f"  [{i}] {demo['name']}")
    print(f"  [4] Enter my own feature request")
    print()

    while True:
        choice = input("Your choice (1-4): ").strip()
        if choice in ("1", "2", "3"):
            selected = DEMO_REQUESTS[int(choice) - 1]
            print(f"\n✅ Selected: {selected['name']}")
            print_separator()
            print(selected["request"])
            print_separator()
            confirm = input("\nProceed with this request? (y/n): ").strip().lower()
            if confirm == "y":
                return selected["request"]
        elif choice == "4":
            print("\nEnter your feature request (press Enter twice when done):")
            lines = []
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            request = "\n".join(lines).strip()
            if request:
                return request
        else:
            print("Please enter 1, 2, 3, or 4.")


def run():
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        print("❌ Error: Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file")
        sys.exit(1)

    feature_request = choose_feature_request()

    output_dir = Path(__file__).parent.parent.parent / "output"
    output_dir.mkdir(exist_ok=True)

    print(f"\n🚀 Starting AutoDev Crew...\n")
    print_separator("═")

    from .crew import build_autodev_crew

    crew = build_autodev_crew(feature_request)

    start_time = time.time()
    result = crew.kickoff()
    elapsed = time.time() - start_time

    print_separator("═")
    print(f"\n✅ AutoDev Crew completed in {elapsed:.1f}s\n")
    print(f"📁 Output files in: {output_dir.resolve()}\n")

    output_files = list(output_dir.glob("*"))
    if output_files:
        print("Generated files:")
        for f in sorted(output_files):
            size = f.stat().st_size
            print(f"  • {f.name:30s} ({size:,} bytes)")

    print("\n" + "═" * 68)
    print("\n📋 Final QA Summary:\n")
    print(str(result))


if __name__ == "__main__":
    run()
