"""Compatibility package for `app.agents.handlers` used in tests.

Attempts to re-export backend.app.agents.handlers or repo `agents.handlers`.
"""

try:
    from backend.app.agents import handlers as _backend_handlers  # type: ignore

    for _name in dir(_backend_handlers):
        if _name.startswith("_"):
            continue
        globals()[_name] = getattr(_backend_handlers, _name)

    __all__ = [n for n in dir(_backend_handlers) if not n.startswith("_")]
except Exception:
    try:
        from agents import handlers as _repo_handlers  # type: ignore

        for _name in dir(_repo_handlers):
            if _name.startswith("_"):
                continue
            globals()[_name] = getattr(_repo_handlers, _name)

        __all__ = [n for n in dir(_repo_handlers) if not n.startswith("_")]
    except Exception:
        __all__ = []
