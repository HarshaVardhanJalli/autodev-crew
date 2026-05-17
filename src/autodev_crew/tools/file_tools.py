import os
from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class WriteFileInput(BaseModel):
    filename: str = Field(description="Name of the file to write (e.g. 'auth.py')")
    content: str = Field(description="Full content to write into the file")


class ReadFileInput(BaseModel):
    filename: str = Field(description="Name of the file to read")


class WriteFileTool(BaseTool):
    name: str = "write_file"
    description: str = "Write content to a file in the output directory"
    args_schema: type[BaseModel] = WriteFileInput

    def _run(self, filename: str, content: str) -> str:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "output")
        output_dir = os.path.abspath(output_dir)
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w") as f:
            f.write(content)
        return f"File written successfully: {filepath}"


class ReadFileTool(BaseTool):
    name: str = "read_file"
    description: str = "Read content from a file in the output directory"
    args_schema: type[BaseModel] = ReadFileInput

    def _run(self, filename: str) -> str:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "output")
        output_dir = os.path.abspath(output_dir)
        filepath = os.path.join(output_dir, filename)
        if not os.path.exists(filepath):
            return f"File not found: {filepath}"
        with open(filepath, "r") as f:
            return f.read()
