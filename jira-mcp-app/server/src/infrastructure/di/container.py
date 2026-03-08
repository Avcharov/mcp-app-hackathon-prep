class DIContainer:

    def __init__(self):
        self._container = {}

    def __getitem__[T](self, item: type[T]) -> T:
        return self._container[item]

    def __setitem__[T](self, key: type[T], value: T) -> None:
        self._container[key] = value
