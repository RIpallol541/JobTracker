class AppError(Exception):
    def __init__(self, message: str, code: str = "error", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code="not_found", status_code=404)


class ConflictError(AppError):
    def __init__(self, message: str):
        super().__init__(message, code="conflict", status_code=409)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, code="unauthorized", status_code=401)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, code="forbidden", status_code=403)
