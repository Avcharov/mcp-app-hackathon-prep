from pydantic import BaseModel, ConfigDict

from infrastructure.di.container import DIContainer


class Context(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    di_container: DIContainer
