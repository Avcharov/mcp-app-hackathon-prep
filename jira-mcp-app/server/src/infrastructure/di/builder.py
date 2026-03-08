from infrastructure.di.container import DIContainer
from infrastructure.settings import AppSettings, HTTPSettings


class DIContainerBuilder:

    def __init__(self) -> None:
        self._container = DIContainer()

    def build(self) -> DIContainer:
        self._container[HTTPSettings] = HTTPSettings()
        self._container[AppSettings] = AppSettings()
        return self._container
