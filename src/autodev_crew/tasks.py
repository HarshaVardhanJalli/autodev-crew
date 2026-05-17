from crewai import Task
from crewai.agents.agent_builder.base_agent import BaseAgent


def requirements_task(agent: BaseAgent, feature_request: str) -> Task:
    return Task(
        description=f"""
You are the first agent in the AutoDev pipeline. Analyze this feature request and produce
a complete Product Requirements Document (PRD).

FEATURE REQUEST:
{feature_request}

Your PRD must include:
1. **Feature Summary** — one paragraph describing what we're building and why
2. **User Stories** — at least 4 user stories in "As a [user], I want [goal], so that [benefit]" format
3. **Acceptance Criteria** — specific, testable criteria for each user story
4. **Technical Scope** — what IS and IS NOT included in this implementation
5. **API Endpoints** — list of endpoints needed (method, path, request/response shape)
6. **Data Models** — key entities and their fields
7. **Edge Cases & Error Scenarios** — at least 5 edge cases to handle
8. **Non-Functional Requirements** — performance, security, scalability considerations

Write this to a file named 'requirements.md' using the write_file tool.
Then output the complete PRD as your final answer.
""",
        expected_output=(
            "A complete Product Requirements Document saved as 'requirements.md' and "
            "returned as output, covering user stories, acceptance criteria, API design, "
            "data models, and edge cases."
        ),
        agent=agent,
    )


def architecture_task(agent: BaseAgent, feature_request: str) -> Task:
    return Task(
        description=f"""
You are the second agent in the AutoDev pipeline. Read the requirements document produced
by the Product Manager (read 'requirements.md' using the read_file tool), then design the
complete system architecture.

ORIGINAL FEATURE REQUEST (for context):
{feature_request}

Your architecture document must include:
1. **Tech Stack Decision** — language, framework, database, and rationale for each choice
2. **Project Structure** — complete directory/file tree with purpose of each file
3. **Data Models / Database Schema** — full schema with field types, constraints, indexes
4. **API Contract** — detailed endpoint specs with exact request/response JSON shapes
5. **Component Architecture** — how modules interact, dependency flow diagram (text-based)
6. **Authentication & Security Design** — how auth works, what's protected, token strategy
7. **Error Handling Strategy** — error codes, response formats, logging approach
8. **Key Implementation Notes** — critical decisions the developer must know before coding

Write this to a file named 'architecture.md' using the write_file tool.
Then output the complete architecture document as your final answer.
""",
        expected_output=(
            "A complete System Architecture Document saved as 'architecture.md', covering "
            "tech stack, data models, API contracts, component design, and security strategy."
        ),
        agent=agent,
    )


def development_task(agent: BaseAgent, feature_request: str) -> Task:
    return Task(
        description=f"""
You are the third agent in the AutoDev pipeline — the one who writes the actual code.

Read both documents:
- 'requirements.md' (read_file tool) — what to build
- 'architecture.md' (read_file tool) — how to build it

ORIGINAL FEATURE REQUEST (for context):
{feature_request}

Implement the complete feature with production-quality Python code.

Requirements for your implementation:
1. Write COMPLETE, RUNNABLE code — no placeholders, no "# implement this later"
2. Use type hints on ALL functions
3. Implement ALL endpoints defined in the architecture
4. Include proper error handling with specific error messages
5. Use the exact project structure from the architecture doc
6. Add docstrings to classes (one line max, explain purpose not what it does)
7. Handle all edge cases from the requirements

Write each file separately using the write_file tool:
- Main application file (e.g., 'app.py' or 'main.py')
- Models file (e.g., 'models.py')
- Routes/handlers file (e.g., 'routes.py' or 'handlers.py')
- Any utility/helper files needed
- 'requirements.txt' with all dependencies

After writing all files, output a summary of what was implemented.
""",
        expected_output=(
            "Complete, production-quality Python implementation with all files written to "
            "the output directory. Each file is complete and runnable with no placeholders."
        ),
        agent=agent,
    )


def code_review_task(agent: BaseAgent, feature_request: str) -> Task:
    return Task(
        description=f"""
You are the fourth agent in the AutoDev pipeline — the code reviewer.

Read ALL the files produced by the developer using the read_file tool:
- 'requirements.md' — what was supposed to be built
- 'architecture.md' — how it was supposed to be built
- All implementation files (app.py/main.py, models.py, routes.py, etc.)

ORIGINAL FEATURE REQUEST (for context):
{feature_request}

Conduct a thorough code review covering:

1. **Correctness** — Does the code do what the requirements say? Any logic bugs?
2. **Security Issues** — SQL injection, XSS, insecure auth, exposed secrets, IDOR vulnerabilities
3. **Error Handling** — Are all errors handled? Are error messages appropriate (not leaking internals)?
4. **Performance** — N+1 queries, missing indexes, blocking operations, memory leaks
5. **Code Quality** — Naming, function length, single responsibility, DRY violations
6. **Missing Requirements** — Any acceptance criteria not implemented?
7. **Edge Cases** — Are the edge cases from requirements handled in code?
8. **Dependencies** — Any unnecessary or insecure dependencies?

Format your review as:
- 🔴 Critical Issues (must fix before merge)
- 🟡 Major Issues (should fix)
- 🟢 Minor Issues (nice to have)
- ✅ What's Done Well

Write the review to 'code_review.md' using the write_file tool.
Then output the complete review as your final answer.
""",
        expected_output=(
            "A thorough code review saved as 'code_review.md' with categorized issues "
            "(critical/major/minor), specific line references, and actionable suggestions."
        ),
        agent=agent,
    )


def qa_task(agent: BaseAgent, feature_request: str) -> Task:
    return Task(
        description=f"""
You are the fifth and final agent in the AutoDev pipeline — the QA Engineer.

Read all artifacts using the read_file tool:
- 'requirements.md' — acceptance criteria to test against
- 'architecture.md' — API contracts to test
- The implementation files — understand what to test

ORIGINAL FEATURE REQUEST (for context):
{feature_request}

Write a comprehensive pytest test suite. Your tests must:

1. **Cover every acceptance criterion** from the requirements
2. **Test every API endpoint** — success cases AND failure cases
3. **Test edge cases** — empty inputs, invalid types, boundary values, concurrent requests
4. **Test security** — unauthorized access, invalid tokens, injection attempts
5. **Use pytest fixtures** for setup/teardown
6. **Follow AAA pattern** — Arrange, Act, Assert with clear section comments
7. **Include integration tests** that test the full request/response cycle
8. **Mock external dependencies** properly

Also write a 'test_plan.md' with:
- Test strategy and approach
- Coverage report (which requirements are covered by which tests)
- How to run the tests
- Known gaps or assumptions

Write files:
- 'test_suite.py' — complete pytest test file
- 'test_plan.md' — test plan document

Use the write_file tool for both. Then output a summary of the test coverage.
""",
        expected_output=(
            "A complete pytest test suite saved as 'test_suite.py' covering all acceptance "
            "criteria, edge cases, and security tests, plus a 'test_plan.md' with coverage mapping."
        ),
        agent=agent,
    )
