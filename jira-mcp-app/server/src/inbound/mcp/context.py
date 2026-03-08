from pydantic import BaseModel

from infrastructure.di.container import DIContainer


class Context(BaseModel):
    container: DIContainer
