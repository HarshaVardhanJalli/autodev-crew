from crewai import Crew, Process
from .agents import (
    product_manager_agent,
    system_architect_agent,
    developer_agent,
    code_reviewer_agent,
    qa_engineer_agent,
)
from .tasks import (
    requirements_task,
    architecture_task,
    development_task,
    code_review_task,
    qa_task,
)


def build_autodev_crew(feature_request: str, task_callback=None) -> Crew:
    pm = product_manager_agent()
    architect = system_architect_agent()
    developer = developer_agent()
    reviewer = code_reviewer_agent()
    qa = qa_engineer_agent()

    tasks = [
        requirements_task(pm, feature_request),
        architecture_task(architect, feature_request),
        development_task(developer, feature_request),
        code_review_task(reviewer, feature_request),
        qa_task(qa, feature_request),
    ]

    return Crew(
        agents=[pm, architect, developer, reviewer, qa],
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        memory=False,
        task_callback=task_callback,
    )
