"""Compatibility package for `app.agents` used in tests.

This module attempts to re-export `backend.app.agents` when available,
otherwise falls back to the repository `agents` package. It aims to make
imports like `import app.agents.supervisor` resolve to the repo's
implementation during dry-run tests.
"""

try:
    from backend.app import agents as _backend_agents  # type: ignore

    for _name in dir(_backend_agents):
        if _name.startswith("_"):
            continue
        globals()[_name] = getattr(_backend_agents, _name)

    __all__ = [n for n in dir(_backend_agents) if not n.startswith("_")]
except Exception:
    try:
        import agents as _repo_agents  # type: ignore

        for _name in dir(_repo_agents):
            if _name.startswith("_"):
                continue
            globals()[_name] = getattr(_repo_agents, _name)

        __all__ = [n for n in dir(_repo_agents) if not n.startswith("_")]
    except Exception:
        __all__ = []
