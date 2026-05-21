from fastapi import FastAPI
# from app.routers import employee, computer, assignment
from fastapi.middleware.cors import CORSMiddleware
from app.database import initDB
 
app = FastAPI(title="Asset Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],       # You can restrict this to ['GET', 'POST'] if you want
    allow_headers=["*"],
)

@app.on_event("startup") 
def on_startup():
    initDB()

# app.include_router(employee.router)
# app.include_router(computer.router)
# app.include_router(assignment.router)

 
@app.get("/health")
def health_check():
    return {"status": "ok"}