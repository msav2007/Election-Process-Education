from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "API working"}


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"ping": "working"}
