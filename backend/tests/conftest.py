import os
import tempfile
import pytest

# Point the DB at a temp file before any app modules are imported.
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["PRELEGAL_DB_PATH"] = _tmp.name


@pytest.fixture(autouse=True, scope="session")
def init_test_db():
    from app.db import init_db
    init_db()
    yield
    try:
        os.unlink(_tmp.name)
    except FileNotFoundError:
        pass
