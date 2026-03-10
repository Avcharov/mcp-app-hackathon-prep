from pydantic import BaseModel


class Response[T: BaseModel](BaseModel):
    type: str
    path: str
    payload: T
